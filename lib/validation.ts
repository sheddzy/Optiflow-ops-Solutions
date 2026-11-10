import { z } from "zod";

/** Options exactly as listed in the content document. */
export const SERVICE_OPTIONS = [
  "Business Operations Setup",
  "Workflow Automation",
  "Dashboards and Business Reporting",
  "Project Management and Coordination",
  "Business Email and IT Support",
  "Website and Digital Solutions",
  "Launch Package",
  "Pro Package",
  "OpsPilot",
  "General Enquiry",
] as const;

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
const text = (min: number, max: number, minMsg: string) => z.string().transform(clean).pipe(z.string().min(min, minMsg).max(max));

export const enquirySchema = z.object({
  name: text(2, 120, "Enter your name."),
  business: z.string().transform(clean).pipe(z.string().max(160)).optional(),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email address.").max(254)),
  phone: z.string().transform(clean).pipe(z.string().regex(/^[0-9+()\-\s]{6,40}$/, "Enter a valid phone number (digits, spaces, + or - only).")),
  website: z.string().transform(clean).pipe(z.string().max(200).refine((v) => v === "" || /^(https?:\/\/)?[^\s/$.?#][^\s]*\.[^\s]{2,}$/i.test(v), "Enter a valid website address, or leave this empty.")).optional(),
  service_interest: z.enum(SERVICE_OPTIONS as unknown as [string, ...string[]], { message: "Choose a service or product." }),
  message: text(10, 1500, "Tell us a little more (at least 10 characters)."),
  consent: z.literal("on", { message: "Please tick the box to continue." }),
});
// Both routes (email and WhatsApp) require the same details.
export const emailEnquirySchema = enquirySchema;
export const whatsappEnquirySchema = enquirySchema;

export const buySchema = z.object({
  package_id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Choose a package.").max(80),
  name: text(2, 120, "Enter your name."),
  business: z.string().transform(clean).pipe(z.string().max(160)).optional(),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email address.").max(254)),
  phone: z.string().transform(clean).pipe(z.string().regex(/^[0-9+()\-\s]{6,40}$/, "Enter a valid phone number (digits, spaces, + or - only).")),
  domain: z.string().transform(clean).pipe(z.string().max(80).refine((v) => v === "" || /^[a-z0-9][a-z0-9.\-]{1,78}$/i.test(v), "Use letters, numbers, dots and hyphens only.")).optional(),
  terms: z.literal("on", { message: "Please tick the box to confirm you have read the terms." }),
});

/** Promotion claim (free offers). The domain rule depends on the promotion, so it is checked in the action. */
export const claimSchema = z.object({
  name: text(2, 120, "Enter your name."),
  business: z.string().transform(clean).pipe(z.string().max(160)).optional(),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email address.").max(254)),
  phone: z.string().transform(clean).pipe(z.string().regex(/^[0-9+()\-\s]{6,40}$/, "Enter a valid phone number (digits, spaces, + or - only).")),
  domain: z.string().transform(clean).pipe(z.string().max(120).refine((v) => v === "" || /^(https?:\/\/)?[a-z0-9][a-z0-9.\-]*\.[a-z]{2,}(\/.*)?$/i.test(v), "Enter your domain, for example yourcompany.com.")).optional(),
  message: z.string().transform(clean).pipe(z.string().max(1500)).optional(),
  consent: z.literal("on", { message: "Please tick the box to continue." }),
});
