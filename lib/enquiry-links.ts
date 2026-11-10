import { SITE } from "./site";

export type EnquiryText = { name: string; business?: string; email?: string; phone?: string; website?: string; service: string; message: string };

const lines = (e: EnquiryText) =>
  [
    `Name: ${e.name}`,
    `Business: ${e.business || "Not given"}`,
    `Email: ${e.email || "Not given"}`,
    `Phone: ${e.phone || "Not given"}`,
    `Business website: ${e.website || "Not given"}`,
    `Service or product of interest: ${e.service}`,
    "",
    e.message,
  ].join("\n");

/** Prefilled WhatsApp message to the OptiFlow business number. */
export function whatsappUrl(e: EnquiryText) {
  const text = `Hello OptiFlow, I would like to make an enquiry.\n\n${lines(e)}`;
  return `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Prefilled email addressed to the enquiries mailbox. */
export function mailtoUrl(e: EnquiryText) {
  return `mailto:${SITE.enquiryEmail}?subject=${encodeURIComponent(`Website enquiry: ${e.service}`)}&body=${encodeURIComponent(lines(e))}`;
}
