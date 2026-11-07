import type { Metadata } from "next";
import Legal from "@/components/Legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms and Conditions | OptiFlow Ops Solutions Ltd", description: "Review the website usage terms and general conditions for engaging with OptiFlow Ops Solutions Ltd.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <Legal title="Terms and Conditions" intro="These Terms and Conditions govern the use of the OptiFlow Ops Solutions Ltd website. By accessing the website, you agree to use it responsibly and in accordance with applicable laws."
      sections={[
        { h: "Website information", p: ["Information published on this website describes our company, services, packages and product initiatives. The information is provided for general business and informational purposes.", "Website content does not automatically constitute a binding service contract, guarantee of availability or promise of a particular result."] },
        { h: "Service enquiries", p: ["Submitting an enquiry does not automatically create a client relationship. Specific services, deliverables, costs and timelines will be confirmed through an agreed proposal, quotation or service agreement."] },
        { h: "Service scope", p: ["The scope of a project will be determined by the deliverables agreed with the client. Requests outside the agreed scope may require additional time, resources or charges."] },
        { h: "Pricing and payments", p: ["Prices displayed on the website are subject to the stated package scope and applicable conditions. Annual packages are subject to the relevant third-party subscription costs, account limits and implementation arrangements.", "Packages are billed annually and paid upfront for a 12 month service period. Online payments are processed by Paystack. Paying for a package begins the onboarding process described on the package page. The exact scope, account allowances and third-party subscription costs are confirmed in the service agreement.", "Any additional charges should be communicated and approved before the relevant work is undertaken."] },
        { h: "Third-party platforms", p: ["Our services may involve third-party providers such as Namecheap, Zoho, Netlify, Paystack and other business application platforms. The availability, functionality, subscription pricing and terms of these platforms are determined by their respective providers."] },
        { h: "Domain and email services", p: ["Domain names and business email services are subject to provider availability and subscription terms. Clients should have appropriate ownership and access arrangements for their business domains and accounts."] },
        { h: "Renewals", p: ["OptiFlow monitors agreed expiry dates and provides reminders. Renewals are not processed automatically and require client approval and payment."] },
        { h: "Website maintenance", p: ["Website maintenance and support are provided according to the agreed service scope. Major redesigns, extensive new functionality and additional integrations may require separate quotations."] },
        { h: "Intellectual property", p: ["OptiFlow's brand assets, website content and original materials may not be reproduced or used without appropriate permission. Ownership and usage rights for commissioned client deliverables should be defined in the relevant service agreement."] },
        { h: "Limitation of liability", p: ["OptiFlow does not guarantee uninterrupted availability of third-party platforms, hosting services or internet infrastructure. Specific liability arrangements should be defined in accordance with applicable law and the relevant client agreement."] },
        { h: "Changes to terms", p: ["We may update these terms when necessary."] },
        { h: "Contact", p: [`Email: ${SITE.enquiryEmail}`] },
      ]} />
  );
}
