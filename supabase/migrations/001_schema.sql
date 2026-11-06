-- OptiFlow Ops Solutions: schema, Row Level Security, seed content.
-- Run once in Supabase: SQL Editor > New query > paste > Run.

create extension if not exists pgcrypto;

-- ---------- shared helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Every new auth user gets a plain 'user' profile. Nobody becomes admin automatically.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by every policy. security definer avoids recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- enquiries ----------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  company text check (char_length(company) <= 160),
  phone text check (char_length(phone) <= 40),
  service_interest text check (char_length(service_interest) <= 160),
  message text not null check (char_length(message) between 10 and 4000),
  consent boolean not null default false check (consent = true),
  status text not null default 'New'
    check (status in ('New','Contacted','Qualified','Proposal Sent','Won','Lost')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_status_idx on public.enquiries (status);
create trigger enquiries_updated before update on public.enquiries
  for each row execute function public.set_updated_at();

-- Database-level spam brake: max 5 enquiries per email per hour, 200 per hour overall.
create or replace function public.enquiry_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.enquiries
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  if (select count(*) from public.enquiries where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'rate_limited';
  end if;
  return new;
end $$;
create trigger enquiries_rate_limit before insert on public.enquiries
  for each row execute function public.enquiry_rate_limit();

-- ---------- services ----------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category text,
  features text[] not null default '{}',
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger services_updated before update on public.services
  for each row execute function public.set_updated_at();

-- ---------- portfolio ----------
create table public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  project_type text not null default 'Demonstration'
    check (project_type in ('Project','Demonstration','Prototype','Case study')),
  technologies text[] not null default '{}',
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger portfolio_updated before update on public.portfolio
  for each row execute function public.set_updated_at();

-- ---------- site_content ----------
create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null unique,
  title text,
  content text,
  updated_at timestamptz not null default now()
);
create trigger site_content_updated before update on public.site_content
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.profiles     enable row level security;
alter table public.enquiries    enable row level security;
alter table public.services     enable row level security;
alter table public.portfolio    enable row level security;
alter table public.site_content enable row level security;

-- profiles: a signed-in user can read only their own row. No one can write via the API.
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

-- enquiries: visitors may INSERT a clean new enquiry. They can never read, update or delete.
create policy "public can submit enquiries" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'New' and internal_notes is null and consent = true);
create policy "admin reads enquiries"   on public.enquiries for select to authenticated using (public.is_admin());
create policy "admin updates enquiries" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes enquiries" on public.enquiries for delete to authenticated using (public.is_admin());

-- services, portfolio, site_content: public reads published rows, admin does everything.
create policy "public reads published services" on public.services
  for select to anon, authenticated using (published = true or public.is_admin());
create policy "admin writes services" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads published portfolio" on public.portfolio
  for select to anon, authenticated using (published = true or public.is_admin());
create policy "admin writes portfolio" on public.portfolio
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads site content" on public.site_content
  for select to anon, authenticated using (true);
create policy "admin writes site content" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: portfolio images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public reads portfolio images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio');
create policy "admin uploads portfolio images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admin updates portfolio images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio' and public.is_admin());
create policy "admin deletes portfolio images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());

-- ---------- Seed: the six service categories from the company brief ----------
insert into public.services (title, slug, description, category, features, sort_order, published) values
('Business Operations and Process Improvement','business-operations-process-improvement',
 'We map how your work actually gets done, remove the friction, and document the result so your team can run it consistently.',
 'Operations', array['Business process mapping','SOP development','Workflow redesign','Operational efficiency','KPI and performance management'], 1, true),
('Workflow Automation and Digital Transformation','workflow-automation-digital-transformation',
 'We connect the tools you already use and automate repetitive steps, so routine work happens without manual chasing.',
 'Automation', array['Business workflow automation','Make.com integrations','Zapier integrations','Automated notifications and reporting'], 2, true),
('Business Dashboards and Reporting','business-dashboards-reporting',
 'We turn scattered operational data into dashboards and reports that show management what is happening and where to act.',
 'Reporting', array['Management dashboards','KPI tracking','Business performance reports','Operational data analysis'], 3, true),
('Project and Operations Management Systems','project-operations-management-systems',
 'We set up the systems that make ownership clear, tasks visible and follow-up routine across your team.',
 'Systems', array['Project management setup','Task and workflow management','Accountability systems','Team productivity systems'], 4, true),
('IT Support and Systems Solutions','it-support-systems-solutions',
 'Practical technical support to keep your business tools configured, working and ready for the people who rely on them.',
 'Technology', array['Business IT support','Systems configuration','Technology troubleshooting','IT operations support'], 5, true),
('Software and Digital Product Development','software-digital-product-development',
 'We design and build software that fits the way your business works, from internal tools to digital products.',
 'Development', array['Business software solutions','Internal business tools','Digital products','Process digitisation'], 6, true);

-- ---------- Seed: editable website copy ----------
insert into public.site_content (section, title, content) values
('home_hero','Better Systems. Better Business.','OptiFlow helps businesses improve how they operate through better processes, smarter systems, workflow automation and digital solutions.'),
('home_why','Why work with OptiFlow','We reduce operational inefficiencies, improve productivity, establish accountability and give you better visibility into your operations.'),
('about_intro','About OptiFlow Ops Solutions','OptiFlow Ops Solutions Ltd. is a business operations, process optimisation, automation and technology solutions company.'),
('about_mission','Our mission','To help businesses run better by combining sound operations practice with practical technology.'),
('about_vision','Our vision','Businesses that operate with clarity, accountability and visibility, supported by systems that scale with them.'),
('opspilot_intro','OpsPilot','OpsPilot is a business operations management product developed by OptiFlow Ops Solutions Ltd.')
on conflict (section) do nothing;
