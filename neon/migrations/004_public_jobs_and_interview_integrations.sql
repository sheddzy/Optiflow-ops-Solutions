-- Integrated public job board, public candidate applications and provider-backed interview scheduling.
-- Run after migrations 001-003 on a Neon DEVELOPMENT branch first. Do not run on production yet.
begin;

alter table public.roles
  add column if not exists is_public boolean not null default false,
  add column if not exists public_slug text,
  add column if not exists published_at timestamptz,
  add column if not exists public_summary text,
  add column if not exists screening_questions jsonb not null default '[]'::jsonb;

create unique index if not exists roles_public_slug_uidx
  on public.roles(public_slug) where public_slug is not null;
create index if not exists roles_public_listing_idx
  on public.roles(status, is_public, published_at desc)
  where status = 'open' and is_public = true;

alter table public.interviews
  add column if not exists meeting_provider text
    check (meeting_provider is null or meeting_provider in ('google_meet','microsoft_teams','zoom','custom')),
  add column if not exists meeting_url text,
  add column if not exists provider_event_id text,
  add column if not exists provider_meeting_id text,
  add column if not exists calendar_provider text
    check (calendar_provider is null or calendar_provider in ('google','microsoft','zoom')),
  add column if not exists timezone text not null default 'Africa/Lagos',
  add column if not exists interviewer_emails text[] not null default '{}',
  add column if not exists candidate_email_snapshot text,
  add column if not exists candidate_name_snapshot text,
  add column if not exists meeting_title text,
  add column if not exists meeting_description text,
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_1h_sent_at timestamptz,
  add column if not exists cancelled_at timestamptz;

create table public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id text not null,
  provider text not null check (provider in ('google','microsoft','zoom')),
  provider_account_email text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  connection_status text not null default 'active'
    check (connection_status in ('active','expired','revoked','error')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, user_id, provider)
);
create index calendar_connections_user_idx
  on public.calendar_connections(agency_id,user_id,provider);
create trigger calendar_connections_updated before update on public.calendar_connections
  for each row execute function public.set_updated_at();

alter table public.calendar_connections enable row level security;
create policy "users manage own calendar connections" on public.calendar_connections
  for all to authenticated
  using (public.is_agency_member(agency_id) and user_id = (select auth.user_id()))
  with check (public.is_agency_member(agency_id) and user_id = (select auth.user_id()));
grant select, insert, update, delete on public.calendar_connections to authenticated;

create table public.interview_attendees (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  interview_id uuid not null,
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  attendee_name text,
  response_status text not null default 'needsAction'
    check (response_status in ('needsAction','accepted','declined','tentative')),
  created_at timestamptz not null default now(),
  foreign key (interview_id,agency_id) references public.interviews(id,agency_id) on delete cascade,
  unique (interview_id,email)
);
alter table public.interview_attendees enable row level security;
create policy "agency members manage interview attendees" on public.interview_attendees
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));
grant select,insert,update,delete on public.interview_attendees to authenticated;

-- Public RPC is deliberately narrow: it exposes only published vacancies and accepts an application
-- only for an open, published role. Candidate records remain private to the agency.
create or replace function public.list_public_vacancies(
  p_search text default null,
  p_location text default null,
  p_workplace_type text default null,
  p_employment_type text default null
)
returns table (
  role_id uuid, agency_name text, agency_slug text, job_title text,
  public_slug text, public_summary text, description text, responsibilities text,
  requirements text, location text, employment_type text, workplace_type text,
  salary_min numeric, salary_max numeric, salary_currency text,
  published_at timestamptz, application_deadline date
)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select r.id, a.name, a.slug, r.job_title, r.public_slug,
    coalesce(r.public_summary, left(coalesce(r.description,''),240)),
    r.description, r.responsibilities, r.requirements, r.location,
    r.employment_type, r.workplace_type, r.salary_min, r.salary_max,
    r.salary_currency, r.published_at, r.application_deadline
  from public.roles r
  join public.agencies a on a.id = r.agency_id
  where r.status = 'open' and r.is_public = true
    and (r.application_deadline is null or r.application_deadline >= current_date)
    and (p_search is null or concat_ws(' ',r.job_title,r.department,r.description,r.requirements) ilike '%'||left(p_search,100)||'%')
    and (p_location is null or coalesce(r.location,'') ilike '%'||left(p_location,100)||'%')
    and (p_workplace_type is null or r.workplace_type = p_workplace_type)
    and (p_employment_type is null or r.employment_type = p_employment_type)
  order by r.published_at desc nulls last
  limit 200;
$$;

create or replace function public.apply_to_public_vacancy(
  p_role_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text default null,
  p_resume_url text default null,
  p_consent boolean default false,
  p_source text default 'public_job_board'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.roles%rowtype;
  v_candidate_id uuid;
  v_application_id uuid;
  v_email text := lower(btrim(p_email));
begin
  if p_consent is distinct from true then
    raise exception 'consent_required' using errcode = '22023';
  end if;
  if v_email is null or p_first_name is null or char_length(btrim(p_first_name)) not between 1 and 100
     or p_last_name is null or char_length(btrim(p_last_name)) not between 1 and 100
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_application_details' using errcode = '22023';
  end if;
  if p_resume_url is not null and p_resume_url !~ '^https://' then
    raise exception 'invalid_resume_url' using errcode = '22023';
  end if;
  select * into v_role from public.roles
    where id = p_role_id and status = 'open' and is_public = true
      and (application_deadline is null or application_deadline >= current_date);
  if not found then raise exception 'vacancy_not_available' using errcode = '22023'; end if;

  select id into v_candidate_id from public.candidates
    where agency_id = v_role.agency_id and lower(email) = v_email
    limit 1;
  if v_candidate_id is null then
    insert into public.candidates (
      agency_id,first_name,last_name,email,phone,resume_url,source,
      consent_status,consent_recorded_at
    ) values (
      v_role.agency_id,btrim(p_first_name),btrim(p_last_name),v_email,
      nullif(btrim(p_phone),''),p_resume_url,coalesce(nullif(p_source,''),'public_job_board'),
      'granted',now()
    ) returning id into v_candidate_id;
  else
    update public.candidates set
      first_name=btrim(p_first_name),
      last_name=btrim(p_last_name),
      phone=coalesce(nullif(btrim(p_phone),''),phone),
      resume_url=coalesce(p_resume_url,resume_url),
      consent_status='granted', consent_recorded_at=now()
    where id=v_candidate_id and agency_id=v_role.agency_id;
  end if;

  insert into public.applications(agency_id,candidate_id,role_id,status,source)
  values(v_role.agency_id,v_candidate_id,v_role.id,'sourced',coalesce(nullif(p_source,''),'public_job_board'))
  on conflict(candidate_id,role_id) do update set
    source=excluded.source
  returning id into v_application_id;

  insert into public.recruitment_activities(agency_id,entity_type,entity_id,action,summary,metadata)
  values(v_role.agency_id,'application',v_application_id,'application_received',
    'New public application received for '||v_role.job_title,
    jsonb_build_object('role_id',v_role.id,'candidate_id',v_candidate_id));

  return v_application_id;
end;
$$;

revoke all on function public.list_public_vacancies(text,text,text,text) from public;
revoke all on function public.apply_to_public_vacancy(uuid,text,text,text,text,text,boolean,text) from public;
grant execute on function public.list_public_vacancies(text,text,text,text) to anon, authenticated;
grant execute on function public.apply_to_public_vacancy(uuid,text,text,text,text,text,boolean,text) to anon, authenticated;

create or replace function public.set_role_public_slug()
returns trigger language plpgsql set search_path=public,pg_temp as $
begin
 if new.is_public then
   if new.public_slug is null or btrim(new.public_slug)='' then
     new.public_slug := trim(both '-' from regexp_replace(lower(coalesce(new.job_title,'job')),'[^a-z0-9]+','-','g')) || '-' || substr(new.id::text,1,8);
   end if;
   if new.published_at is null then new.published_at := now(); end if;
 else
   new.published_at := null;
 end if;
 return new;
end;
$;
create trigger roles_public_slug_before_write before insert or update of is_public,job_title on public.roles
 for each row execute function public.set_role_public_slug();

commit;
