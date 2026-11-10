export type Promotion = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  subtitle: string;
  intro: string[];
  eligibility: string;
  inclusions: string[];
  conditions: string;
  faq: { q: string; a: string }[];
  ctaLabel: string;
  askDomain: boolean;
  bannerText: string;
  startsAt: string | null;
  endsAt: string | null;
  slotLimit: number | null;
  published: boolean;
};

/** Used when the database is not connected, so the promotion page still works. Once Supabase is connected, the dashboard's Promotions screen is the source of truth. */
export const DEFAULT_PROMO: Promotion = {
  id: "default",
  slug: "free-business-email-setup",
  title: "Free Business Email Setup",
  badge: "\u20A60 SETUP FEE",
  subtitle: "Your business deserves a professional identity.",
  intro: [
    "Already own a business domain? Let OptiFlow help you set up a professional business email address.",
    "Instead of writing to customers from a personal address, you send from your own company domain, such as info@yourcompany.com. We handle the technical setup so it works properly from the start.",
  ],
  eligibility: "Already own an active business domain? You're eligible to get started.",
  inclusions: [
    "One professional business email account setup",
    "Domain and DNS configuration",
    "SPF, DKIM and DMARC authentication configuration, where supported",
    "Sending and receiving tests",
    "Basic guidance on accessing your mailbox",
  ],
  conditions: "Domain ownership required. Email hosting subscriptions or provider charges, where applicable, are paid separately.",
  faq: [
    { q: "Is the setup really free?", a: "Yes. OptiFlow does not charge a setup fee for this offer. Email hosting subscriptions or provider charges, where applicable, are paid separately to the provider." },
    { q: "What do I need to qualify?", a: "You need to own an active business domain, for example yourcompany.com. Domain ownership is required." },
    { q: "What will I pay for?", a: "The setup is free. If your email hosting plan or provider charges a subscription, you pay that separately. We explain what applies to you before we begin." },
    { q: "What exactly do you set up?", a: "One professional business email account, the domain and DNS configuration, SPF, DKIM and DMARC authentication where supported, sending and receiving tests, and basic guidance on accessing your mailbox." },
    { q: "I do not have a domain yet. Can I still take part?", a: "This offer is for businesses that already own a domain. If you also need a domain, see our Launch package, which includes domain registration support." },
    { q: "How is this different from the Launch package?", a: "Launch is an annual package that also includes domain registration support, up to two business email accounts, professional signatures, basic maintenance and renewal monitoring. This offer covers setting up one email account on a domain you already own." },
    { q: "Do you need my passwords?", a: "No. We never ask for passwords through this form. If we need access to change your domain's DNS records, we agree a safe way to do that with you." },
    { q: "What happens after I submit the form?", a: "We review your details, confirm that your domain qualifies, and contact you using the details you provided to agree the next steps." },
  ],
  ctaLabel: "Get Started",
  askDomain: true,
  bannerText: "Free business email setup: \u20A60 setup fee if you already own a domain.",
  startsAt: null,
  endsAt: null,
  slotLimit: null,
  published: true,
};
