import { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | ReferBenefits",
  description: "Get in touch with ReferBenefits. Send us your feedback, submit a new referral code, or contact us for business partnerships.",
  alternates: {
    canonical: "https://referbenefits.co.in/contact/",
    languages: {
      "en-IN": "https://referbenefits.co.in/contact/",
      "x-default": "https://referbenefits.co.in/contact/",
    },
  },
};

export default function Page() {
  return <ContactForm />;
}
