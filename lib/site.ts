export const SITE = {
  name: "OptiFlow Ops Solutions Ltd.",
  short: "OptiFlow",
  tagline: "Transforming Business Operations Through Technology.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://optiflowops.online",
  enquiryEmail: "info@optiflowops.online", // sole public business contact and website enquiry mailbox
  email: "info@optiflowops.online",
  phoneDisplay: "+2349060914286",
  whatsapp: "https://wa.me/2349060914286",
  instagram: "https://www.instagram.com/optiflowops/",
  linkedin: "https://www.linkedin.com/company/optiflowops/",
  facebook: "https://www.facebook.com/share/19q43FV8CB/",
};

export const navFor = (hasPosts: boolean) => [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/opspilot", label: "OpsPilot" },
  { href: "/portfolio", label: "Portfolio" },
  ...(hasPosts ? [{ href: "/blog", label: "Blog" }] : []),
  { href: "/contact", label: "Contact" },
];
export const NAV = navFor(false);
