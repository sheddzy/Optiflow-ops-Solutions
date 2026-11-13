-- OptiFlow campaign: free website for the first 20 qualifying businesses.
-- Run after 003_cms.sql in the Supabase SQL Editor. Safe to re-run.
begin;

insert into public.promotions (
  slug, title, badge, subtitle, intro, eligibility, inclusions, conditions, faq,
  cta_label, ask_domain, banner_text, slot_limit, published
) values (
  'free-website-for-your-business',
  'Get a Free Website for Your Business',
  '20 BUSINESSES ONLY',
  'Let’s put your business online.',
  array[
    'OptiFlow is offering website development at no development fee to 20 qualifying businesses.',
    'We will discuss what your business needs, agree on the website scope and delivery timeline, and confirm any costs before work begins.'
  ]::text[],
  'Open to businesses that are selected and have agreed a clear website scope with OptiFlow.',
  array[
    'Website design and development within the agreed scope',
    'Mobile-responsive layout',
    'Contact or enquiry options as agreed',
    'Testing and handover'
  ]::text[],
  'Free development within the agreed scope. You pay for your domain; any other costs are discussed and approved separately.',
  $faq$[
    {"q":"Is the website completely free?","a":"There is no website development fee for selected businesses within the agreed scope. You pay for your domain name. Any hosting, premium tools or additional services that may be needed will be explained and agreed with you before work begins."},
    {"q":"How do I get started?","a":"Submit your details. We will discuss your business and website requirements, agree on the scope and delivery timeline, and confirm the domain arrangements before development starts."},
    {"q":"Do I have to pay for a domain?","a":"Yes. The business owner pays for domain registration. The domain should be registered in your business's name or under an account you control."},
    {"q":"What kind of website can I request?","a":"The website type, pages and features will be discussed and agreed individually before work begins. Requests outside the agreed scope may require an additional quote."},
    {"q":"Are hosting and other services included?","a":"Not automatically. Hosting, premium tools, paid integrations and other recurring services will be disclosed and agreed separately where required."},
    {"q":"When will my website be delivered?","a":"We agree on a realistic delivery timeline after reviewing your requirements. The timeline also depends on receiving the required content, approvals and domain access."},
    {"q":"How are the 20 places allocated?","a":"The promotion is limited to 20 businesses. Applications are reviewed and a place is confirmed after OptiFlow has discussed and agreed the project scope with the business."}
  ]$faq$::jsonb,
  'Apply Now',
  false,
  'Get a free website for your business — 20 businesses only. You pay for your domain.',
  20,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  badge = excluded.badge,
  subtitle = excluded.subtitle,
  intro = excluded.intro,
  eligibility = excluded.eligibility,
  inclusions = excluded.inclusions,
  conditions = excluded.conditions,
  faq = excluded.faq,
  cta_label = excluded.cta_label,
  ask_domain = excluded.ask_domain,
  banner_text = excluded.banner_text,
  slot_limit = excluded.slot_limit,
  published = excluded.published,
  updated_at = now();

commit;
