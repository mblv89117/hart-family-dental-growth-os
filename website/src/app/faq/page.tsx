import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/PageHero";
import { FaqList } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "FAQs for Hart Family Dental patients in Yucca Valley and Desert Hot Springs.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero title="Frequently asked questions" body="Quick answers about visiting, implants, straightening, and payments." />
      <Prose>
        <FaqList
          items={[
            {
              q: "Where are you located?",
              a: "Yucca Valley at 56728 Twentynine Palms Highway, and Desert Hot Springs at 11523 Palm Drive.",
            },
            {
              q: "Do you offer dental implants?",
              a: "Ask us about implant consultations and which options are available at each office. Marketing pages describe pathways; your dentist confirms what is appropriate for you.",
            },
            {
              q: "Is teeth straightening done entirely online?",
              a: "No. Our program is dentist-supervised. Online assessments never replace examination, records, or dentist approval.",
            },
            {
              q: "Do you offer financing?",
              a: "We discuss approved options such as cash-pay, phased care when appropriate, and third-party financing education. Approval is never guaranteed.",
            },
            {
              q: "What if I’m nervous about the dentist?",
              a: "Tell us. We aim for a nonjudgmental, comfortable experience and will explain each step before it happens.",
            },
          ]}
        />
      </Prose>
    </>
  );
}
