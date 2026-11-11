-- Recruitment SaaS expansion: recruiter identities, client review, communications,
-- job-board connection metadata, and post-placement retention.
-- Run after 001_recruitment_foundation.sql and 002_recruitment_pipeline.sql.
-- Existing migrations are immutable; this is additive.

begin;

-- Stable, agency-scoped recruiter identity used by each recruiter's workspace URL.
create table public.recruiter_profiles (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  membership_id uuid not null,
  user_id text not null,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  job_title text,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, slug),
  unique (agency_id, user_id),
  foreign key (membership_id, agency_id)
    references public.agency_memberships(id, agency_id) on delete cascade
);
create index recruiter_profiles_user_idx on public.recruiter_profiles(user_id, agency_id);
create trigger recruiter_profiles_updated before update on public.recruiter_profiles
  for each row execute function public.set_updated_at();

-- Keep old free-text assignment columns for backwards compatibility; new records use IDs.
alter table public.applications
  add column assigned_recruiter_user_id text;
alter table public.roles
  add column assigned_recruiter_user_id text;
create index applications_recruiter_idx
  on public.applications(agency_id, assigned_recruiter_user_id, status);
create index roles_recruiter_idx
  on public.roles(agency_id, assigned_recruiter_user_id, status);

-- Explicit sharing is the only route through which client portal users can review candidates.
create table public.candidate_shares (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null,
  application_id uuid not null,
  shared_by text not null default auth.user_id(),
  status text not null default 'shared'
    check (status in ('shared','withdrawn','hired','rejected')),
  shared_at timestamptz not null default now(),
  expires_at timestamptz,
  client_feedback text,
  client_decision text check (client_decision is null or client_decision in ('pending','shortlist','interview','reject','hold','hire')),
  feedback_at timestamptz,
  unique (agency_id, client_id, application_id),
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete cascade,
  foreign key (application_id, agency_id) references public.applications(id, agency_id) on delete cascade,
  check (expires_at is null or expires_at > shared_at)
);
create index candidate_shares_client_idx
  on public.candidate_shares(agency_id, client_id, status, shared_at desc);

-- Prevent an agency from sharing an application with a client other than the vacancy's client.
create or replace function public.validate_candidate_share_client()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $validate_share$
begin
  if not exists (
    select 1
    from public.applications a
    join public.roles r on r.id = a.role_id and r.agency_id = a.agency_id
    where a.id = new.application_id
      and a.agency_id = new.agency_id
      and r.client_id = new.client_id
  ) then
    raise exception 'candidate_share_client_mismatch' using errcode = '23514';
  end if;
  return new;
end;
$validate_share$;
create trigger candidate_shares_validate_client
  before insert or update of agency_id, client_id, application_id
  on public.candidate_shares
  for each row execute function public.validate_candidate_share_client();
alter table public.candidate_shares enable row level security;
create policy "agency admins manage candidate shares" on public.candidate_shares
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters read assigned candidate shares" on public.candidate_shares
  for select to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = candidate_shares.application_id
        and a.agency_id = candidate_shares.agency_id
        and a.assigned_recruiter_user_id = (select auth.user_id())
    )
  );
create policy "client users read shared candidates" on public.candidate_shares
  for select to authenticated
  using (
    status = 'shared'
    and (expires_at is null or expires_at > now())
    and public.is_client_portal_member(agency_id, client_id)
  );
grant select, insert, update, delete on public.candidate_shares to authenticated;

-- Safe client-facing view: intentionally excludes private email, phone, CV URL and recruiter notes.
create or replace view public.client_candidate_review as
select
  s.id as share_id,
  s.agency_id,
  s.client_id,
  s.application_id,
  s.status as share_status,
  s.shared_at,
  s.expires_at,
  s.client_feedback,
  s.client_decision,
  r.job_title,
  c.first_name,
  c.last_name,
  c.current_job_title,
  c.years_experience,
  c.highest_qualification,
  c.skills,
  a.status as application_status
from public.candidate_shares s
join public.applications a
  on a.id = s.application_id and a.agency_id = s.agency_id
join public.candidates c
  on c.id = a.candidate_id and c.agency_id = a.agency_id
join public.roles r
  on r.id = a.role_id and r.agency_id = a.agency_id
where s.status = 'shared'
  and (s.expires_at is null or s.expires_at > now())
  and public.is_client_portal_member(s.agency_id, s.client_id);
grant select on public.client_candidate_review to authenticated;

-- Client feedback is written through a constrained function, never by direct candidate/application update.
create or replace function public.submit_client_candidate_feedback(
  p_share_id uuid,
  p_decision text,
  p_feedback text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_share public.candidate_shares%rowtype;
begin
  if p_decision not in ('shortlist','interview','reject','hold','hire') then
    raise exception 'invalid_client_decision' using errcode = '22023';
  end if;
  select * into v_share
  from public.candidate_shares
  where id = p_share_id
    and status = 'shared'
    and (expires_at is null or expires_at > now())
  for update;
  if not found or not public.is_client_portal_member(v_share.agency_id, v_share.client_id) then
    raise exception 'share_not_found_or_access_denied' using errcode = '42501';
  end if;
  update public.candidate_shares
  set client_decision = p_decision,
      client_feedback = nullif(btrim(p_feedback), ''),
      feedback_at = now()
  where id = p_share_id;
end;
$$;
revoke all on function public.submit_client_candidate_feedback(uuid,text,text) from public;
grant execute on function public.submit_client_candidate_feedback(uuid,text,text) to authenticated;

-- Candidate employment and retention milestones after placement.
alter table public.placements add constraint placements_id_agency_unique unique (id, agency_id);
create table public.placement_checkins (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  placement_id uuid not null,
  milestone_days integer not null check (milestone_days in (7,30,60,90,180,365)),
  due_date date not null,
  completed_at timestamptz,
  outcome text check (outcome is null or outcome in ('retained','at_risk','resigned','terminated','unknown')),
  notes text,
  next_follow_up date,
  created_by text default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (placement_id, milestone_days),
  foreign key (placement_id, agency_id) references public.placements(id, agency_id) on delete cascade
);
create index placement_checkins_due_idx
  on public.placement_checkins(agency_id, due_date) where completed_at is null;
create trigger placement_checkins_updated before update on public.placement_checkins
  for each row execute function public.set_updated_at();
alter table public.placement_checkins enable row level security;
create policy "agency members manage placement checkins" on public.placement_checkins
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));
grant select, insert, update, delete on public.placement_checkins to authenticated;

-- Reusable email templates and immutable delivery history.
create table public.communication_templates (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  audience text not null check (audience in ('candidate','client','internal')),
  name text not null check (char_length(btrim(name)) between 2 and 140),
  subject text not null,
  body text not null,
  available_merge_fields text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, audience, name)
);
create trigger communication_templates_updated before update on public.communication_templates
  for each row execute function public.set_updated_at();
create table public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  candidate_id uuid,
  client_id uuid,
  application_id uuid,
  recipient_email text not null,
  subject text not null,
  body_snapshot text not null,
  provider text not null default 'resend',
  provider_message_id text,
  delivery_status text not null default 'queued'
    check (delivery_status in ('queued','sent','delivered','bounced','failed')),
  error_message text,
  sent_by text default auth.user_id(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (candidate_id, agency_id) references public.candidates(id, agency_id) on delete restrict,
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete restrict,
  foreign key (application_id, agency_id) references public.applications(id, agency_id) on delete restrict
);
create index communication_logs_agency_created_idx
  on public.communication_logs(agency_id, created_at desc);
create index communication_logs_provider_idx
  on public.communication_logs(provider_message_id) where provider_message_id is not null;
alter table public.communication_templates enable row level security;
alter table public.communication_logs enable row level security;
create policy "agency members manage communication templates" on public.communication_templates
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));
create policy "agency members read communication logs" on public.communication_logs
  for select to authenticated
  using (public.is_agency_member(agency_id));
create policy "agency members record communication logs" on public.communication_logs
  for insert to authenticated
  with check (public.is_agency_member(agency_id) and sent_by = (select auth.user_id()));
grant select, insert, update, delete on public.communication_templates to authenticated;
grant select, insert on public.communication_logs to authenticated;

-- Job board connections store metadata only. Provider secrets must be encrypted by the app
-- before being persisted; never store plaintext API keys or passwords here.
create table public.job_board_connections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  provider text not null check (provider in ('linkedin','indeed','jobberman','google_jobs','other')),
  display_name text not null,
  connection_status text not null default 'not_connected'
    check (connection_status in ('not_connected','pending_approval','connected','error','disabled')),
  external_account_label text,
  encrypted_credentials text,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, provider, display_name),
  unique (id, agency_id)
);
create trigger job_board_connections_updated before update on public.job_board_connections
  for each row execute function public.set_updated_at();
create table public.job_board_publications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  role_id uuid not null,
  connection_id uuid,
  provider text not null,
  external_job_id text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft','queued','published','paused','expired','failed')),
  public_url text,
  published_at timestamptz,
  expires_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (role_id, agency_id) references public.roles(id, agency_id) on delete cascade,
  foreign key (connection_id, agency_id) references public.job_board_connections(id, agency_id) on delete restrict
);
create index job_board_publications_role_idx
  on public.job_board_publications(agency_id, role_id, publication_status);
create trigger job_board_publications_updated before update on public.job_board_publications
  for each row execute function public.set_updated_at();
alter table public.job_board_connections enable row level security;
alter table public.job_board_publications enable row level security;
create policy "agency admins manage job board connections" on public.job_board_connections
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "agency members manage job board publications" on public.job_board_publications
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));
grant select, insert, update, delete on public.job_board_connections, public.job_board_publications to authenticated;

-- Client portal hiring requests; submitted requests are reviewed by agency staff.
create table public.client_hiring_requests (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null,
  requested_by text not null default auth.user_id(),
  job_title text not null check (char_length(btrim(job_title)) between 2 and 180),
  department text,
  headcount integer not null default 1 check (headcount between 1 and 10000),
  employment_type text,
  workplace_type text,
  location text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  job_description text,
  target_start_date date,
  status text not null default 'submitted'
    check (status in ('submitted','under_review','approved','declined','converted')),
  converted_role_id uuid,
  agency_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete cascade,
  foreign key (converted_role_id, agency_id) references public.roles(id, agency_id) on delete restrict
);
create index client_hiring_requests_client_idx
  on public.client_hiring_requests(agency_id, client_id, created_at desc);
create trigger client_hiring_requests_updated before update on public.client_hiring_requests
  for each row execute function public.set_updated_at();
alter table public.client_hiring_requests enable row level security;
create policy "agency members manage client hiring requests" on public.client_hiring_requests
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));
create policy "client users read and submit own hiring requests" on public.client_hiring_requests
  for select to authenticated
  using (public.is_client_portal_member(agency_id, client_id));
create policy "client users submit own hiring requests" on public.client_hiring_requests
  for insert to authenticated
  with check (
    requested_by = (select auth.user_id())
    and public.is_client_portal_member(agency_id, client_id)
  );
grant select, insert, update, delete on public.client_hiring_requests to authenticated;

-- Recruiter directory access is limited to active agency members; slug is not an access token.
alter table public.recruiter_profiles enable row level security;
create policy "agency members read recruiter directory" on public.recruiter_profiles
  for select to authenticated
  using (public.is_agency_member(agency_id));
create policy "agency admins manage recruiter profiles" on public.recruiter_profiles
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
grant select, insert, update, delete on public.recruiter_profiles to authenticated;


-- Recruiter workspace provisioning: a signed-in recruiter can create/update only their own profile.
create or replace function public.ensure_my_recruiter_profile(p_display_name text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id text := auth.user_id();
  v_membership public.agency_memberships%rowtype;
  v_slug text;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  select * into v_membership
  from public.agency_memberships
  where user_id = v_user_id and status = 'active'
  order by created_at asc limit 1;
  if not found then
    raise exception 'active_agency_membership_required' using errcode = '42501';
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(btrim(p_display_name)), '[^a-z0-9]+', '-', 'g'));
  if char_length(v_slug) < 2 then
    raise exception 'valid_display_name_required' using errcode = '22023';
  end if;
  insert into public.recruiter_profiles (agency_id, membership_id, user_id, display_name, slug)
  values (v_membership.agency_id, v_membership.id, v_user_id, btrim(p_display_name), v_slug)
  on conflict (agency_id, user_id) do update
    set display_name = excluded.display_name,
        updated_at = now()
  returning slug into v_slug;
  return v_slug;
end;
$;
revoke all on function public.ensure_my_recruiter_profile(text) from public;
grant execute on function public.ensure_my_recruiter_profile(text) to authenticated;

-- Recruiter data scope. Owners/admins retain agency-wide access; recruiters see and update
-- only records assigned to their authenticated user ID (or candidate profiles they created).
drop policy "agency members manage clients" on public.clients;
create policy "agency admins manage clients" on public.clients
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters read clients for assigned roles" on public.clients
  for select to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.agency_id = clients.agency_id and r.client_id = clients.id
        and r.assigned_recruiter_user_id = (select auth.user_id())
    )
  );

drop policy "agency members manage projects" on public.projects;
create policy "agency admins manage projects" on public.projects
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters read assigned projects" on public.projects
  for select to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.agency_id = projects.agency_id and r.project_id = projects.id
        and r.assigned_recruiter_user_id = (select auth.user_id())
    )
  );

drop policy "agency members manage roles" on public.roles;
create policy "agency admins manage roles" on public.roles
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters manage assigned roles" on public.roles
  for all to authenticated
  using (assigned_recruiter_user_id = (select auth.user_id()))
  with check (
    assigned_recruiter_user_id = (select auth.user_id())
    and public.is_agency_member(agency_id)
  );

drop policy "agency members manage candidates" on public.candidates;
create policy "agency admins manage candidates" on public.candidates
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters manage own candidates" on public.candidates
  for all to authenticated
  using (
    created_by = (select auth.user_id())
    or exists (
      select 1 from public.applications a
      where a.agency_id = candidates.agency_id and a.candidate_id = candidates.id
        and a.assigned_recruiter_user_id = (select auth.user_id())
    )
  )
  with check (
    public.is_agency_member(agency_id)
    and (
      created_by = (select auth.user_id())
      or exists (
        select 1 from public.applications a
        where a.agency_id = candidates.agency_id and a.candidate_id = candidates.id
          and a.assigned_recruiter_user_id = (select auth.user_id())
      )
    )
  );

drop policy "agency members manage applications" on public.applications;
create policy "agency admins manage applications" on public.applications
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters manage assigned applications" on public.applications
  for all to authenticated
  using (assigned_recruiter_user_id = (select auth.user_id()))
  with check (
    assigned_recruiter_user_id = (select auth.user_id())
    and public.is_agency_member(agency_id)
  );

drop policy "agency members manage interviews" on public.interviews;
create policy "agency admins manage interviews" on public.interviews
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters manage assigned interviews" on public.interviews
  for all to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = interviews.application_id and a.agency_id = interviews.agency_id
        and a.assigned_recruiter_user_id = (select auth.user_id())
    )
  )
  with check (
    exists (
      select 1 from public.applications a
      where a.id = interviews.application_id and a.agency_id = interviews.agency_id
        and a.assigned_recruiter_user_id = (select auth.user_id())
    )
  );

drop policy "agency members manage placements" on public.placements;
create policy "agency admins manage placements" on public.placements
  for all to authenticated
  using (public.has_agency_role(agency_id, array['owner','admin']::text[]))
  with check (public.has_agency_role(agency_id, array['owner','admin']::text[]));
create policy "recruiters read assigned placements" on public.placements
  for select to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = placements.application_id and a.agency_id = placements.agency_id
        and a.assigned_recruiter_user_id = (select auth.user_id())
    )
  );

commit;
