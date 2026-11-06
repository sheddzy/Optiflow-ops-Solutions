import { z } from "zod";

export const SERVICE_OPTIONS = [
  "Business Operations and Process Improvement",
  "Workflow Automation and Digital Transformation",
  "Business Dashboards and Reporting",
  "Project and Operations Management Systems",
  "IT Support and Systems Solutions",
  "Software and Digital Product Development",
  "OpsPilot early access",
  "Something else",
] as const;

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();

export const enquirySchema = z.object({
  name: z.string().transform(clean).pipe(z.string().min(2, "Enter your name.").max(120)),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email address.").max(254)),
  company: z.string().transform(clean).pipe(z.string().max(160)).optional(),
  phone: z.string().transform(clean).pipe(z.string().regex(/^[0-9+()\-\s]{6,40}$/, "Use digits, spaces, + or - only.")).optional().or(z.literal("")),
  service_interest: z.enum(SERVICE_OPTIONS, { message: "Choose a service." }),
  message: z.string().transform(clean).pipe(z.string().min(10, "Tell us a little more (at least 10 characters).").max(4000, "Keep the message under 4000 characters.")),
  consent: z.literal("on", { message: "Please tick the box to continue." }),
});
