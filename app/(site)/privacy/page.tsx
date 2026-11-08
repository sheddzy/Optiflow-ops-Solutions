import type { Metadata } from "next";
import Legal from "@/components/Legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy | OptiFlow Ops Solutions Ltd", description: "Read how OptiFlow handles information submitted through its website and contact channels.", openGraph: { url: "/privacy" }, alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <Legal title="Privacy Policy" intro="OptiFlow Ops Solutions Ltd respects the privacy of individuals who visit our website or contact us about our services. This policy explains the categories of information we may collect, why we use that information and how enquiries are handled."
      sections={[
        { h: "Information we may collect", p: ["Depending on your interaction with our website, we may collect:"], ul: ["Your name", "Business name", "Email address", "Phone number", "Business website", "Service interests", "Information submitted through contact forms or package purchase forms", "Information you voluntarily provide during communication"] },
        { h: "Technical information", p: ["Technical information may also be collected through website hosting, security and analytics services, depending on the tools configured on the website."] },
        { h: "How we use information", ul: ["Respond to enquiries", "Understand service requirements", "Prepare proposals and quotations", "Communicate about requested services", "Provide agreed services", "Process and confirm package payments", "Maintain business records", "Improve website functionality and user experience", "Address technical or security concerns"] },
        { h: "Contact form information", p: ["Information submitted through our contact form is used to process and respond to the enquiry. If you choose email, your enquiry is sent to our enquiries mailbox. If you choose WhatsApp, your message is sent to our business WhatsApp number and is handled under WhatsApp's own terms and privacy policy. We aim to collect only information relevant to the purpose of the form."] },
        { h: "Payments", p: ["Online package payments are processed by Paystack. Your card or bank details are entered on Paystack's secure payment page and are not collected or stored by OptiFlow. We receive confirmation of the payment together with the contact details you provided."] },
        { h: "Third-party services", p: ["Our website and services may rely on third-party providers, including:"], ul: ["Website hosting providers", "Domain registrars", "Email platforms", "Payment providers", "Form submission services", "Analytics or security providers", "Business application providers"] },
        { h: "Data sharing", p: ["We do not intend to sell personal information submitted through our website. Information may be shared with relevant service providers where necessary to operate the website, respond to enquiries or deliver agreed services. These providers may process information in accordance with their own terms and privacy policies."] },
        { h: "Data security", p: ["We take reasonable steps to protect information within the systems under our control. However, no online transmission or storage system can be guaranteed to be completely secure."] },
        { h: "Data retention", p: ["Information may be retained for as long as reasonably necessary for responding to enquiries, maintaining business records or fulfilling relevant legal and contractual obligations."] },
        { h: "Your requests", p: ["You may contact us to ask about information you have submitted or raise a concern about how it is handled."] },
        { h: "Contact", p: [`Email: ${SITE.enquiryEmail}`] },
      ]} />
  );
}
