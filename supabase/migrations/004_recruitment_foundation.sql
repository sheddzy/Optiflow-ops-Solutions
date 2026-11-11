-- OptiFlow Recruitment Operations SaaS: multi-tenant foundation.
-- Adds isolated agency workspaces, memberships, clients, projects, roles and client portal memberships.
-- Run AFTER 001_schema.sql, 002_make_admin.sql and 003_cms.sql.
-- Test on a development Supabase project before applying to production.

begin;

-- ---------- agencies ----------
create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'trial' check (status in ('trial','active','suspended','cancelled')),
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, slug)
);
create trigger agencies_updated before update on public.agencies
  for each row execute function public.set_updated_at();

-- ---------- agency memberships ----------
create table public.agency_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'recruiter' check (role in ('owner','admin','recruiter')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, user_id),
  unique (id, agency_id)
);
create index agency_memberships_user_idx on public.agency_memberships(user_id, status);
create index agency_memberships_agency_idx on public.agency_memberships(agency_id, status);
create trigger agency_memberships_updated before update on public.agency_memberships
  for each row execute function public.set_updated_at();

-- Security-definer helpers prevent recursive membership RLS checks.
create or replace function public.is_agency_member(p_agency_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.agency_memberships m
    where m.agency_id = p_agency_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

create or replace function public.has_agency_role(p_agency_id uuid, p_roles text[])
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.agency_memberships m
    where m.agency_id = p_agency_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any(p_roles)
  );
$$;

-- A signed-in user creates a workspace through this function.
-- The owner membership is created atomically; direct agency/membership inserts are not granted.
create or replace function public.create_agency_workspace(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_agency_id uuid;
  v_name text := btrim(p_name);
  v_slug text := lower(btrim(p_slug));
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 160 then
    raise exception 'invalid_agency_name' using errcode = '22023';
  end if;
  if v_slug is null or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) > 80 then
    raise exception 'invalid_agency_slug' using errcode = '22023';
  end if;

  insert into public.agencies (name, slug)
  values (v_name, v_slug)
  returning id into v_agency_id;

  insert into public.agency_memberships (agency_id, user_id, role, status)
  values (v_agency_id, v_user_id, 'owner', 'active');

  return v_agency_id;
end;
$$;
revoke all on function public.create_agency_workspace(text, text) from public;
grant execute on function public.create_agency_workspace(text, text) to authenticated;

-- ---------- clients ----------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  company_name text not null check (char_length(company_name) between 2 and 180),
  industry text,
  website text,
  company_email text,
  company_phone text,
  address text,
  country text,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  relationship_status text not null default 'prospect'
    check (relationship_status in ('prospect','active','inactive','former')),
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, agency_id)
);
create index clients_agency_name_idx on public.clients(agency_id, company_name);
create index clients_agency_status_idx on public.clients(agency_id, relationship_status);
create trigger clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------- recruitment projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null,
  project_name text not null check (char_length(project_name) between 2 and 180),
  reference_code text,
  description text,
  objectives text,
  scope_of_work text,
  status text not null default 'planning'
    check (status in ('planning','active','on_hold','completed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  budget numeric(14,2) check (budget is null or budget >= 0),
  agreed_fee numeric(14,2) check (agreed_fee is null or agreed_fee >= 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  project_owner uuid references auth.users(id) on delete set null,
  internal_notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, agency_id),
  unique (agency_id, reference_code),
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete restrict,
  check (target_end_date is null or start_date is null or target_end_date >= start_date)
);
create index projects_agency_status_idx on public.projects(agency_id, status);
create index projects_client_idx on public.projects(client_id, agency_id);
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------- roles / vacancies ----------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null,
  project_id uuid,
  job_title text not null check (char_length(job_title) between 2 and 180),
  department text,
  description text,
  responsibilities text,
  requirements text,
  qualifications text,
  experience_years_min numeric(4,1) check (experience_years_min is null or experience_years_min >= 0),
  experience_years_max numeric(4,1) check (experience_years_max is null or experience_years_max >= experience_years_min),
  employment_type text check (employment_type is null or employment_type in ('full_time','part_time','contract','temporary','internship')),
  workplace_type text check (workplace_type is null or workplace_type in ('onsite','hybrid','remote')),
  location text,
  salary_min numeric(14,2) check (salary_min is null or salary_min >= 0),
  salary_max numeric(14,2) check (salary_max is null or salary_max >= salary_min),
  salary_currency text not null default 'NGN' check (salary_currency ~ '^[A-Z]{3}$'),
  vacancies_count integer not null default 1 check (vacancies_count between 1 and 10000),
  hiring_manager_name text,
  hiring_manager_email text,
  assigned_recruiter uuid references auth.users(id) on delete set null,
  application_deadline date,
  status text not null default 'draft'
    check (status in ('draft','open','on_hold','filled','cancelled','closed')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, agency_id),
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete restrict,
  foreign key (project_id, agency_id) references public.projects(id, agency_id) on delete set null
);
create index roles_agency_status_idx on public.roles(agency_id, status);
create index roles_project_idx on public.roles(project_id, agency_id);
create index roles_client_idx on public.roles(client_id, agency_id);
create trigger roles_updated before update on public.roles
  for each row execute function public.set_updated_at();

-- ---------- client portal memberships ----------
-- A client portal user is linked to one agency and one client, separately from agency staff.
create table public.client_portal_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'hiring_manager'
    check (role in ('client_admin','hiring_manager','reviewer')),
  status text not null default 'invited' check (status in ('invited','active','suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, client_id, user_id),
  foreign key (client_id, agency_id) references public.clients(id, agency_id) on delete cascade
);
create index client_portal_user_idx on public.client_portal_memberships(user_id, status);
create trigger client_portal_memberships_updated before update on public.client_portal_memberships
  for each row execute function public.set_updated_at();

create or replace function public.is_client_portal_member(p_agency_id uuid, p_client_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.client_portal_memberships m
    where m.agency_id = p_agency_id
      and m.client_id = p_client_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

-- ---------- Row Level Security ----------
alter table public.agencies enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.roles enable row level security;
alter table public.client_portal_memberships enable row level security;

-- Agency workspace: members may read their workspace. Workspace creation is RPC-only.
create policy "agency members read workspace" on public.agencies
  for select to authenticated using (public.is_agency_member(id));

-- Memberships: users can see their own membership rows; agency owners/admins can see team membership.
create policy "members read permitted memberships" on public.agency_memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.has_agency_role(agency_id, array['owner','admin']::text[])
  );

-- No direct membership writes. Invitation/acceptance/admin-management RPCs will be added in the team stage.

-- Agency staff can manage their agency's clients.
create policy "agency members manage clients" on public.clients
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

-- Client portal users may read only their own client record; no client-side writes.
create policy "client users read own client" on public.clients
  for select to authenticated
  using (public.is_client_portal_member(agency_id, id));

-- Agency staff can manage their agency's projects.
create policy "agency members manage projects" on public.projects
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

-- Client portal users can read projects for their own client only.
create policy "client users read own projects" on public.projects
  for select to authenticated
  using (public.is_client_portal_member(agency_id, client_id));

-- Agency staff can manage roles in their agency.
create policy "agency members manage roles" on public.roles
  for all to authenticated
  using (public.is_agency_member(agency_id))
  with check (public.is_agency_member(agency_id));

-- Client portal users can read only roles for their own client. Candidate visibility is a later explicit-share feature.
create policy "client users read own roles" on public.roles
  for select to authenticated
  using (public.is_client_portal_member(agency_id, client_id));

-- Users can read their own portal membership; agency owners/admins can read portal memberships for their agency.
create policy "read permitted client portal memberships" on public.client_portal_memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.has_agency_role(agency_id, array['owner','admin']::text[])
  );

-- No anon policies are created for any SaaS table. Public website CMS policies remain unchanged.

commit;
