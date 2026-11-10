-- OptiFlow backend: packages and prices, promotions, pages, blog posts, media.
-- Run ONCE in Supabase SQL Editor, after 001_schema.sql and 002_make_admin.sql.
-- Everything is wrapped so that a failure changes nothing.

begin;

-- ---------- enquiries: link claims to a promotion ----------
alter table public.enquiries add column if not exists promotion_id uuid;
alter table public.enquiries add column if not exists domain text check (domain is null or char_length(domain) <= 120);

-- ---------- packages ----------
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  tag text not null default '',
  summary text not null default '',
  overview text[] not null default '{}',
  price integer not null check (price >= 0 and price <= 100000000),
  period text not null default 'year' check (period in ('year', 'month', 'once')),
  billing_note text not null default '',
  who_for_lead text not null default '',
  who_for text[] not null default '{}',
  inclusions_heading text not null default 'What is included',
  includes_all_of text,
  inclusions jsonb not null default '[]',
  not_included text[] not null default '{}',
  you_provide text[] not null default '{}',
  faq jsonb not null default '[]',
  published boolean not null default false,
  buyable boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger packages_updated before update on public.packages for each row execute function public.set_updated_at();

-- Every price change is recorded: who, when, old and new.
create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages (id) on delete cascade,
  old_price integer not null,
  new_price integer not null,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);
create or replace function public.log_price_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.price is distinct from old.price then
    insert into public.price_history (package_id, old_price, new_price) values (new.id, old.price, new.price);
  end if;
  return new;
end $$;
create trigger packages_price_log after update of price on public.packages for each row execute function public.log_price_change();

-- ---------- promotions ----------
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 140),
  badge text not null default '',
  subtitle text not null default '',
  intro text[] not null default '{}',
  eligibility text not null default '',
  inclusions text[] not null default '{}',
  conditions text not null default '',
  faq jsonb not null default '[]',
  cta_label text not null default 'Get Started',
  ask_domain boolean not null default true,
  banner_text text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  slot_limit integer check (slot_limit is null or slot_limit > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create trigger promotions_updated before update on public.promotions for each row execute function public.set_updated_at();
alter table public.enquiries add constraint enquiries_promotion_fk foreign key (promotion_id) references public.promotions (id) on delete set null;
create index enquiries_promotion_idx on public.enquiries (promotion_id);

-- Public can see only how many claims exist, never who made them.
create or replace function public.promotion_claim_count(pid uuid) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::integer from public.enquiries where promotion_id = pid;
$$;
create or replace function public.promotion_is_open(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.promotions p
    where p.id = pid and p.published
      and (p.starts_at is null or p.starts_at <= now())
      and (p.ends_at is null or p.ends_at > now())
      and (p.slot_limit is null or public.promotion_claim_count(p.id) < p.slot_limit)
  );
$$;
grant execute on function public.promotion_claim_count(uuid), public.promotion_is_open(uuid) to anon, authenticated;

-- The database itself refuses a claim on a closed, ended or full promotion.
create or replace function public.enquiry_promotion_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.promotion_id is not null and not public.promotion_is_open(new.promotion_id) then
    raise exception 'promotion_closed';
  end if;
  return new;
end $$;
create trigger enquiries_promotion_guard before insert on public.enquiries for each row execute function public.enquiry_promotion_guard();

-- ---------- pages ----------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 140),
  seo_title text not null default '',
  seo_description text not null default '',
  hero_title text not null default '',
  hero_text text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  illustration text not null default 'about',
  body_md text not null default '',
  faq jsonb not null default '[]',
  show_in_footer boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pages_updated before update on public.pages for each row execute function public.set_updated_at();

-- ---------- blog posts ----------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  excerpt text not null default '',
  body_md text not null default '',
  cover_url text,
  category text not null default '',
  tags text[] not null default '{}',
  author text not null default 'OptiFlow Team',
  seo_title text not null default '',
  seo_description text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not published or published_at is not null)
);
create trigger posts_updated before update on public.posts for each row execute function public.set_updated_at();
create index posts_published_idx on public.posts (published_at desc);

-- ---------- Row Level Security ----------
alter table public.packages enable row level security;
alter table public.price_history enable row level security;
alter table public.promotions enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;

create policy "public reads published packages" on public.packages for select to anon, authenticated using (published = true or public.is_admin());
create policy "admin writes packages" on public.packages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin reads price history" on public.price_history for select to authenticated using (public.is_admin());

create policy "public reads published promotions" on public.promotions for select to anon, authenticated using (published = true or public.is_admin());
create policy "admin writes promotions" on public.promotions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads published pages" on public.pages for select to anon, authenticated using (published = true or public.is_admin());
create policy "admin writes pages" on public.pages for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads live posts" on public.posts for select to anon, authenticated
  using ((published = true and published_at <= now()) or public.is_admin());
create policy "admin writes posts" on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: media library ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "public reads media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "admin uploads media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin updates media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admin deletes media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ---------- Seed: your current packages and the free email promotion ----------
insert into public.packages (slug, name, tag, summary, overview, price, period, billing_note, who_for_lead, who_for, inclusions_heading, includes_all_of, inclusions, not_included, you_provide, faq, published, buyable, sort_order) values ('launch', 'Launch', 'Professional Domain and Business Email Setup', 'Professional domain and business email setup for businesses that need a credible digital communication foundation.', array['Launch gives your business a professional identity in the place customers meet you first: their inbox. Instead of writing from a personal address, your team writes from your own company domain, set up properly and ready to use.', 'We handle the registration, the technical configuration and the account setup, then test that email sends and receives correctly before handing everything over. Within the agreed scope, we also keep an eye on renewal dates and remind you ahead of time, so important subscriptions do not lapse unnoticed.']::text[], 200000, 'year', 'Billed annually, paid upfront for 12 months', 'Launch is designed for businesses that need professional email and a domain but do not currently require website development through OptiFlow. It is suitable for:', array['New businesses', 'Small service providers', 'Consultants', 'Independent professionals', 'Businesses that already have a website', 'Businesses moving away from personal email addresses']::text[], 'What is included in Launch', null, $j$[{"name":"Domain Registration","text":"Assistance with registering one agreed standard domain through Namecheap, subject to availability and agreed cost."},{"name":"Business Email Accounts","text":"Setup of up to two business email accounts through Zoho Business Email.","short":"Up to 2 accounts"},{"name":"Mailbox Storage","text":"5GB per mailbox, subject to the selected Zoho subscription and its current terms.","short":"5GB per account"},{"name":"Zoho Configuration","text":"Configuration of the agreed business email environment."},{"name":"Professional Signatures","text":"Creation and setup of professional email signatures using approved company information."},{"name":"Basic Maintenance","text":"Basic technical support and maintenance within the agreed scope."},{"name":"Renewal Monitoring","text":"Monitoring of agreed domain and email expiry dates, with reminders before renewal."}]$j$::jsonb, array['Website development', 'Website hosting', 'Additional email users beyond the agreed limits', 'Premium domain costs', 'Custom integrations', 'Paid third-party subscriptions outside the agreed scope']::text[], array['Your preferred domain name, and one or two alternatives in case it is taken', 'The names and roles of the people who need the two email accounts', 'Company information for the email signatures', 'Access details if you are bringing an existing domain']::text[], $j$[{"q":"Does Launch include a website?","a":"No. Website development is included in Pro."},{"q":"Can I use my existing domain?","a":"Existing domains can be assessed for configuration, subject to access and technical requirements."},{"q":"Can I add more email accounts?","a":"Additional accounts depend on the selected Zoho plan and will be agreed and quoted separately where required."},{"q":"Can I upgrade from Launch to Pro?","a":"Yes. We can assess the upgrade requirements and provide an appropriate quotation."}]$j$::jsonb, true, true, 1);
insert into public.packages (slug, name, tag, summary, overview, price, period, billing_note, who_for_lead, who_for, inclusions_heading, includes_all_of, inclusions, not_included, you_provide, faq, published, buyable, sort_order) values ('pro', 'Pro', 'Business Email, Domain and Website Setup', 'A broader digital setup combining business email, domain infrastructure and website development.', array['Pro is for businesses that want a complete digital presence in one arrangement: a domain, professional email, and a business website that explains what you do and makes it easy for customers to contact you.', 'It includes everything in Launch, plus the design, development, hosting and deployment of your website, with a contact form and WhatsApp contact built in, basic search engine setup, and basic maintenance. One team looks after the domain, the email and the website, so they work together instead of being managed separately.']::text[], 500000, 'year', 'Billed annually, paid upfront for 12 months', 'Pro is designed for businesses that want a more complete digital presence. It is suitable for:', array['Businesses that do not have a website', 'Companies establishing a professional online identity', 'Consulting and professional service firms', 'Training businesses', 'Growing businesses that need a website and business email together']::text[], 'Everything in Launch, plus', 'launch', $j$[{"name":"Website Design and Development","text":"Design and development of an agreed business website structure."},{"name":"Website Hosting and Deployment","text":"Deployment of the website using the agreed hosting arrangement."},{"name":"Business Email Accounts","text":"Business email accounts for your licensed users. The number of users is confirmed in your proposal.","short":"Allowance confirmed in your proposal"},{"name":"Mailbox Storage","text":"30GB per licensed user, subject to the selected Zoho subscription.","short":"30GB per licensed user"},{"name":"Contact Form Integration","text":"A configured website contact form for receiving customer enquiries."},{"name":"WhatsApp Integration","text":"A WhatsApp contact option to support direct customer communication."},{"name":"Basic SEO Setup","text":"Page titles, descriptions, heading structure and basic search-engine setup."},{"name":"Initial Content Upload","text":"Upload of approved business information and website content."},{"name":"Basic Website Maintenance","text":"Minor updates and maintenance within the agreed scope.","short":"Basic agreed maintenance"},{"name":"Technical Support","text":"Support for agreed email and website-related issues."},{"name":"Renewal Monitoring","text":"Monitoring of agreed domain, email and hosting expiry dates and reminders."}]$j$::jsonb, array['Unlimited email users', 'Premium third-party software subscriptions', 'Major website redesigns', 'Extensive content writing beyond the agreed scope', 'Complex custom applications', 'Advanced e-commerce systems unless specifically agreed', 'Paid advertising', 'Ongoing social media management', 'Major functionality changes']::text[], array['Everything listed for Launch', 'Your business information, service descriptions and contact details for the website', 'Your logo and any branding you want used', 'Approval of the website structure and content before launch', 'The number of email users you need, so the licensed users can be confirmed in your proposal']::text[], $j$[{"q":"Does Pro include business email?","a":"Yes. It includes the agreed business email setup and the associated Launch package inclusions."},{"q":"Does Pro include an unlimited number of website pages?","a":"The website page count and content scope should be agreed before implementation. Major additions may require a separate quotation."},{"q":"Does Pro include unlimited website updates?","a":"No. It includes basic maintenance and minor updates within the agreed scope. Major changes may require additional charges."},{"q":"How many email users are included?","a":"The number of licensed users is confirmed in your proposal. Additional users depend on the Zoho plan and may attract additional costs."}]$j$::jsonb, true, true, 2);
insert into public.promotions (slug, title, badge, subtitle, intro, eligibility, inclusions, conditions, faq, cta_label, ask_domain, banner_text, published) values ('free-business-email-setup', 'Free Business Email Setup', '₦0 SETUP FEE', 'Your business deserves a professional identity.', array['Already own a business domain? Let OptiFlow help you set up a professional business email address.', 'Instead of writing to customers from a personal address, you send from your own company domain, such as info@yourcompany.com. We handle the technical setup so it works properly from the start.']::text[], 'Already own an active business domain? You''re eligible to get started.', array['One professional business email account setup', 'Domain and DNS configuration', 'SPF, DKIM and DMARC authentication configuration, where supported', 'Sending and receiving tests', 'Basic guidance on accessing your mailbox']::text[], 'Domain ownership required. Email hosting subscriptions or provider charges, where applicable, are paid separately.', $j$[{"q":"Is the setup really free?","a":"Yes. OptiFlow does not charge a setup fee for this offer. Email hosting subscriptions or provider charges, where applicable, are paid separately to the provider."},{"q":"What do I need to qualify?","a":"You need to own an active business domain, for example yourcompany.com. Domain ownership is required."},{"q":"What will I pay for?","a":"The setup is free. If your email hosting plan or provider charges a subscription, you pay that separately. We explain what applies to you before we begin."},{"q":"What exactly do you set up?","a":"One professional business email account, the domain and DNS configuration, SPF, DKIM and DMARC authentication where supported, sending and receiving tests, and basic guidance on accessing your mailbox."},{"q":"I do not have a domain yet. Can I still take part?","a":"This offer is for businesses that already own a domain. If you also need a domain, see our Launch package, which includes domain registration support."},{"q":"How is this different from the Launch package?","a":"Launch is an annual package that also includes domain registration support, up to two business email accounts, professional signatures, basic maintenance and renewal monitoring. This offer covers setting up one email account on a domain you already own."},{"q":"Do you need my passwords?","a":"No. We never ask for passwords through this form. If we need access to change your domain's DNS records, we agree a safe way to do that with you."},{"q":"What happens after I submit the form?","a":"We review your details, confirm that your domain qualifies, and contact you using the details you provided to agree the next steps."}]$j$::jsonb, 'Get Started', true, 'Free business email setup: ₦0 setup fee if you already own a domain.', true);

commit;

