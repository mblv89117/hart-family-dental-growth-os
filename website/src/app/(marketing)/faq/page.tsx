import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageHero, Prose } from "@/components/PageHero";
import { FaqList } from "@/components/Ui";
import { locations } from "@/lib/locations";
import { faqSchema } from "@/lib/schema";
import { site } from "@/lib/site";

const faqItems = [
  {
    q: "Where are you located?",
    a: "Yucca Valley at 56728 Twentynine Palms Highway, and Desert Hot Springs at 11523 Palm Drive.",
  },
  {
    q: "What are your phone numbers?",
    a: locations.map((l) => `${l.shortName}: ${l.phone}`).join(" · "),
  },
  {
    q: "Do you accept new patients?",
    a: "Yes. New patients are welcome at both offices. Request an appointment online or by phone. The office will contact you to confirm availability.",
  },
  {
    q: "Do you accept dental insurance?",
    a: "No. Our offices do not currently accept dental insurance. Patients pay with cash, credit card, or debit card. CareCredit financing is available for qualified applicants.",
  },
  {
    q: "Do you offer dental implants and dentures?",
    a: "Yes. Ask us about implant consultations, dentures, and restorative options. Treatment recommendations are based on an individual evaluation.",
  },
  {
    q: "Are emergency appointments available at both offices?",
    a: "No. Emergency appointments may be available at Yucca Valley subject to availability and clinical evaluation. Emergency appointments are not available at Desert Hot Springs.",
  },
  {
    q: "Do you offer financing?",
    a: "CareCredit financing is available for qualified applicants. Approval is not guaranteed. Additional financing options and a membership plan are coming soon.",
  },
  {
    q: "What if I’m nervous about the dentist?",
    a: "Tell us. We aim for a nonjudgmental, comfortable experience and will explain each step before it happens.",
  },
];

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "FAQs for Hart Family Dental patients in Yucca Valley and Desert Hot Springs.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Frequently Asked Questions | Hart Family Dental",
    description: "FAQs for Hart Family Dental patients in Yucca Valley and Desert Hot Springs.",
    url: `${site.domain}/faq`,
  },
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Frequently asked questions"
        body="Quick answers about visiting, implants, dentures, payment, and what to expect."
      />
      <Prose>
        <FaqList items={faqItems} />
      </Prose>
      <JsonLd data={faqSchema(faqItems)} />
    </>
  );
}
