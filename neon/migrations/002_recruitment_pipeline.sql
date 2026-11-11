-- Recruitment pipeline: candidates, applications, interviews, placements and activity.
-- Run after 001_recruitment_foundation.sql in the Neon SQL Editor.
-- All records are tenant-scoped through agency_id and protected by Neon Auth RLS.

begin;

-- ---------- candidates ----------
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 100),
  email text,
  phone text,
  location text,
  linkedin_url text,
  portfolio_url text,
  current_job_title text,
  current_employer text,
  years_experience numeric(4,1) check (years_experience is null or years_experience >= 0),
  highest_qualification text,
  skills text[] not null default '{}',
  resume_url text,
  source text,
  consent_status text not null default 'pending'
    check (consent_status in ('pending','granted','withdrawn','not_required')),
  consent_recorded_at timestamptz,
  notes text,
  created_by text default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, agency_id)
);
create index candidates_agency_name_idx on public.candidates(agency_id, last_name, first_name);
create index candidates_agency_email_idx on public.candidates(agency_id, lower(email)) where email is not null;
create index candidates_agency_created_idx on public.candidates(agency_id, created_at desc);
create trigger candidates_updated before update on public.candidates
  for each row execute function public.set_updated_at();

-- ---------- applications ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  candidate_id uuid not null,
  role_id uuid not null,
  status text not null default 'sourced'
    check (status in ('sourced','screening','shortlisted','interview','assessment','offer','hired','rejected','withdrawn')),
  source text,
  applied_at timestamptz not null default now(),
  assigned_recruiter text,
  expected_salary numeric(14,2) check (expected_salary is null or expected_salary >= 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  notice_period text,
  recruiter_notes text,
  rejection_reason text,
  created_by text default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, agency_id),
  foreign key (candidate_id, agency_id) references public.candidates(id, agency_id) on delete restrict,
  foreign key (role_id, agency_id) references public.roles(id, agency_id) on delete restrict,
  unique (candidate_id, role_id)
);
create index applications_agency_status_idx on public.applications(agency_id, status, applied_at desc);
create index applications_role_idx on public.applications(role_id, agency_id);
create index applications_candidate_idx on public.applications(candidate_id, agency_id);
create trigger applications_updated before update on public.applications
  for each row execute function public.set_updated_at();

-- ---------- interviews ----------
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  application_id uuid not null,
  interview_round integer not null default 1 check (interview_round between 1 and 20),
  interview_type text not null default 'video'
    check (interview_type in ('phone','video','onsite','technical','panel','other')),
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled','rescheduled','no_show')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 5 and 600),
  location_or_link text,
  interviewer_name text,
  interviewer_email text,
  feedback text,
  rating integer check (rating is null or rating between 1 and 5),
  outcome text check (outcome is null or outcome in ('pending','pass','fail','hold')),
  created_by text default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (application_id, agency_id) references public.applications(id, agency_id) on delete cascade
);
create index interviews_agency_schedule_idx on public.interviews(agency_id, scheduled_at);
create index interviews_application_idx on public.interviews(application_id, agency_id);
create trigger interviews_updated before update on public.interviews
  for each row execute function public.set_updated_at();

-- ---------- placements ----------
create table public.placements (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  application_id uuid not null,
  client_id uuid not null,
  status text not null default 'pending_start'
    check (status in ('pending_start','active','completed','cancelled','replacement')),
  start_date date,
  end_date date,
  annual_salary numeric(14,2) check (annual_salary is null or annual_salary >= 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  fee_type text not null default 'fixed' check (fee_type in ('fixed','percentage')),
  fee_amount numeric(14,2) not null default 0 check (fee_amount >= 0),
  invoice_status text not null default 'not_invoiced'
    check (invoice_status in ('not_invoiced','draft','sent','part_paid','paid','overdue','waived')),
  guarantee_days integer check (guarantee_days is null or guarantee_days between 0 and 365),
  guarantee_end_date date,
  notes text,
  created_by text default auth.user_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id),
  foreign key (application_id, agency_id) references public.applications(id, agency_id) on delete restrict,
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete restrict,
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index placements_agency_status_idx on public.placements(agency_id, status);
create index placements_client_idx on public.placements(client_id, agency_id);
create trigger placements_updated before update on public.placements
  for each row execute function public.set_updated_at();

-- ---------- activity feed ----------
create table public.recruitment_activities (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  actor_user_id text default auth.user_id(),
  entity_type text not null check (entity_type in ('client','project','role','candidate','application','interview','placement','team')),
  entity_id uuid,
  action text not null check (char_length(action) between 2 and 80),
  summary text not null check (char_length(summary) between 2 and 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index recruitment_activities_agency_created_idx on public.recruitment_activities(agency_id, created_at desc);

-- ---------- RLS ----------
alter table public.candidates enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.placements enable row level security;
alter table public.recruitment_activities enable row level security;

create policy "agency members manage candidates" on public.candidates
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

create policy "agency members manage applications" on public.applications
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

create policy "agency members manage interviews" on public.interviews
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

create policy "agency members manage placements" on public.placements
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

create policy "agency members read activities" on public.recruitment_activities
  for select to authenticated
  using (public.is_agency_member(agency_id));

create policy "agency members record activities" on public.recruitment_activities
  for insert to authenticated
  with check (public.is_agency_member(agency_id) and actor_user_id = (select auth.user_id()));

grant select, insert, update, delete on
  public.candidates, public.applications, public.interviews, public.placements
to authenticated;
grant select, insert on public.recruitment_activities to authenticated;

commit;
