/**
 * Package data. These are the DEFAULTS and the fallback if the database is unavailable.
 * When Supabase is connected, the dashboard's Packages screen is the source of truth.
 */
export type Inclusion = { name: string; text: string; short?: string };
export type Pkg = {
  id: string; // the web address slug, e.g. "launch"
  name: string;
  price: number; // naira
  period: "year" | "month" | "once";
  billingNote: string;
  tag: string;
  summary: string;
  overview: string[];
  whoForLead: string;
  whoFor: string[];
  inclusionsHeading: string;
  includesAllOf: string | null; // slug of a base package: "Everything in X, plus"
  inclusions: Inclusion[];
  notIncluded: string[];
  youProvide: string[];
  faq: { q: string; a: string }[];
  buyable: boolean;
  published: boolean;
  sort: number;
};

export const PACKAGES: Pkg[] = [
  {
    id: "launch",
    name: "Launch",
    price: 200000,
    period: "year",
    billingNote: "Billed annually, paid upfront for 12 months",
    includesAllOf: null,
    buyable: true,
    published: true,
    sort: 1,
    tag: "Professional Domain and Business Email Setup",
    summary: "Professional domain and business email setup for businesses that need a credible digital communication foundation.",
    overview: [
      "Launch gives your business a professional identity in the place customers meet you first: their inbox. Instead of writing from a personal address, your team writes from your own company domain, set up properly and ready to use.",
      "We handle the registration, the technical configuration and the account setup, then test that email sends and receives correctly before handing everything over. Within the agreed scope, we also keep an eye on renewal dates and remind you ahead of time, so important subscriptions do not lapse unnoticed.",
    ],
    whoForLead: "Launch is designed for businesses that need professional email and a domain but do not currently require website development through OptiFlow. It is suitable for:",
    whoFor: ["New businesses", "Small service providers", "Consultants", "Independent professionals", "Businesses that already have a website", "Businesses moving away from personal email addresses"],
    inclusionsHeading: "What is included in Launch",
    inclusions: [
      { name: "Domain Registration", text: "Assistance with registering one agreed standard domain through Namecheap, subject to availability and agreed cost." },
      { name: "Business Email Accounts", text: "Setup of up to two business email accounts through Zoho Business Email.", short: "Up to 2 accounts" },
      { name: "Mailbox Storage", text: "5GB per mailbox, subject to the selected Zoho subscription and its current terms.", short: "5GB per account" },
      { name: "Zoho Configuration", text: "Configuration of the agreed business email environment." },
      { name: "Professional Signatures", text: "Creation and setup of professional email signatures using approved company information." },
      { name: "Basic Maintenance", text: "Basic technical support and maintenance within the agreed scope." },
      { name: "Renewal Monitoring", text: "Monitoring of agreed domain and email expiry dates, with reminders before renewal." },
    ],
    notIncluded: ["Website development", "Website hosting", "Additional email users beyond the agreed limits", "Premium domain costs", "Custom integrations", "Paid third-party subscriptions outside the agreed scope"],
    youProvide: ["Your preferred domain name, and one or two alternatives in case it is taken", "The names and roles of the people who need the two email accounts", "Company information for the email signatures", "Access details if you are bringing an existing domain"],
    faq: [
      { q: "Does Launch include a website?", a: "No. Website development is included in Pro." },
      { q: "Can I use my existing domain?", a: "Existing domains can be assessed for configuration, subject to access and technical requirements." },
      { q: "Can I add more email accounts?", a: "Additional accounts depend on the selected Zoho plan and will be agreed and quoted separately where required." },
      { q: "Can I upgrade from Launch to Pro?", a: "Yes. We can assess the upgrade requirements and provide an appropriate quotation." },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 500000,
    period: "year",
    billingNote: "Billed annually, paid upfront for 12 months",
    includesAllOf: "launch",
    buyable: true,
    published: true,
    sort: 2,
    tag: "Business Email, Domain and Website Setup",
    summary: "A broader digital setup combining business email, domain infrastructure and website development.",
    overview: [
      "Pro is for businesses that want a complete digital presence in one arrangement: a domain, professional email, and a business website that explains what you do and makes it easy for customers to contact you.",
      "It includes everything in Launch, plus the design, development, hosting and deployment of your website, with a contact form and WhatsApp contact built in, basic search engine setup, and basic maintenance. One team looks after the domain, the email and the website, so they work together instead of being managed separately.",
    ],
    whoForLead: "Pro is designed for businesses that want a more complete digital presence. It is suitable for:",
    whoFor: ["Businesses that do not have a website", "Companies establishing a professional online identity", "Consulting and professional service firms", "Training businesses", "Growing businesses that need a website and business email together"],
    inclusionsHeading: "Everything in Launch, plus",
    inclusions: [
      { name: "Website Design and Development", text: "Design and development of an agreed business website structure." },
      { name: "Website Hosting and Deployment", text: "Deployment of the website using the agreed hosting arrangement." },
      { name: "Business Email Accounts", text: "Business email accounts for your licensed users. The number of users is confirmed in your proposal.", short: "Allowance confirmed in your proposal" },
      { name: "Mailbox Storage", text: "30GB per licensed user, subject to the selected Zoho subscription.", short: "30GB per licensed user" },
      { name: "Contact Form Integration", text: "A configured website contact form for receiving customer enquiries." },
      { name: "WhatsApp Integration", text: "A WhatsApp contact option to support direct customer communication." },
      { name: "Basic SEO Setup", text: "Page titles, descriptions, heading structure and basic search-engine setup." },
      { name: "Initial Content Upload", text: "Upload of approved business information and website content." },
      { name: "Basic Website Maintenance", text: "Minor updates and maintenance within the agreed scope.", short: "Basic agreed maintenance" },
      { name: "Technical Support", text: "Support for agreed email and website-related issues." },
      { name: "Renewal Monitoring", text: "Monitoring of agreed domain, email and hosting expiry dates and reminders." },
    ],
    notIncluded: ["Unlimited email users", "Premium third-party software subscriptions", "Major website redesigns", "Extensive content writing beyond the agreed scope", "Complex custom applications", "Advanced e-commerce systems unless specifically agreed", "Paid advertising", "Ongoing social media management", "Major functionality changes"],
    youProvide: ["Everything listed for Launch", "Your business information, service descriptions and contact details for the website", "Your logo and any branding you want used", "Approval of the website structure and content before launch", "The number of email users you need, so the licensed users can be confirmed in your proposal"],
    faq: [
      { q: "Does Pro include business email?", a: "Yes. It includes the agreed business email setup and the associated Launch package inclusions." },
      { q: "Does Pro include an unlimited number of website pages?", a: "The website page count and content scope should be agreed before implementation. Major additions may require a separate quotation." },
      { q: "Does Pro include unlimited website updates?", a: "No. It includes basic maintenance and minor updates within the agreed scope. Major changes may require additional charges." },
      { q: "How many email users are included?", a: "The number of licensed users is confirmed in your proposal. Additional users depend on the Zoho plan and may attract additional costs." },
    ],
  },
];

export const getPackage = (id: string) => PACKAGES.find((p) => p.id === id);
export const naira = (n: number) => `\u20A6${n.toLocaleString("en-NG")}`;
export const periodLabel = (p: Pkg["period"]) => (p === "year" ? "/ year" : p === "month" ? "/ month" : "one-off");

/** Inclusions with the base package's items first. A package's own item replaces a base item with the same name. */
export function effectiveInclusions(pkg: Pkg, all: Pkg[], depth = 0): Inclusion[] {
  const base = pkg.includesAllOf && depth < 3 ? all.find((p) => p.id === pkg.includesAllOf) : undefined;
  const inherited = base ? effectiveInclusions(base, all, depth + 1) : [];
  const own = new Set(pkg.inclusions.map((i) => i.name.toLowerCase()));
  return [...inherited.filter((i) => !own.has(i.name.toLowerCase())), ...pkg.inclusions];
}

/** Builds the side-by-side comparison table from the packages' own data. */
export function buildComparison(pkgs: Pkg[]) {
  const eff = pkgs.map((p) => effectiveInclusions(p, pkgs));
  const names: string[] = [];
  for (const list of eff) for (const i of list) if (!names.some((n) => n.toLowerCase() === i.name.toLowerCase())) names.push(i.name);
  const rows = [
    { feature: "Price", cells: pkgs.map((p) => `${naira(p.price)} ${periodLabel(p.period)}`) },
    ...names.map((n) => ({ feature: n, cells: eff.map((list) => { const hit = list.find((i) => i.name.toLowerCase() === n.toLowerCase()); return hit ? (hit.short || "Included") : "Not included"; }) })),
  ];
  return { heads: pkgs.map((p) => p.name), rows };
}

export const STAGES = [
  { title: "Enquiry", text: "Select your preferred package and provide your business details." },
  { title: "Requirements Confirmation", text: "We confirm the domain name, email account requirements and, for Pro, website requirements." },
  { title: "Scope and Payment", text: "We confirm the deliverables, subscription arrangements and payment terms." },
  { title: "Implementation", text: "We register or connect the domain and configure the agreed services." },
  { title: "Testing", text: "We test the agreed email and website functionality." },
  { title: "Handover", text: "We provide the agreed access details and explain how to use the systems." },
  { title: "Renewal Monitoring", text: "We record the relevant expiry dates and contact the client ahead of renewal." },
];

export const PACKAGE_FAQ = [
  { q: "Is the package payment monthly?", a: "No. Launch and Pro are billed annually." },
  { q: "Can I choose a different domain extension?", a: "Yes, subject to availability and any difference in registration cost." },
  { q: "Can I use my existing domain?", a: "Existing domains can be assessed for configuration, subject to access and technical requirements." },
  { q: "Can I add more email accounts?", a: "Additional accounts depend on the selected Zoho plan and will be agreed and quoted separately where required." },
  { q: "Does Pro include an unlimited number of website pages?", a: "The website page count and content scope should be agreed before implementation. Major additions may require a separate quotation." },
  { q: "Will you automatically renew my domain?", a: "No. We monitor expiry dates and remind you ahead of renewal. The client must approve and fund the renewal." },
  { q: "What happens if I need changes after delivery?", a: "Basic maintenance and minor updates are subject to the agreed scope. Major changes or new features may be quoted separately." },
  { q: "Can I upgrade from Launch to Pro?", a: "Yes. We can assess the upgrade requirements and provide an appropriate quotation." },
];

export const BILLING_NOTES = [
  "Both packages are annual arrangements.",
  "Third-party subscriptions and domain registrations may have separate renewal dates and pricing.",
  "OptiFlow provides renewal monitoring and reminders. Automatic renewal should not be assumed.",
  "Renewal requires client approval and payment.",
];
