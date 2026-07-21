import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Dental Implants",
  description: 'Replace missing teeth and restore comfort, confidence, and the ability to eat the foods you love — with clear consult next steps.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Dental implants' body='Replace missing teeth and restore comfort, confidence, and the ability to eat the foods you love — with clear consult next steps.' primaryHref="#request" />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading title="The problem we help with" body="Missing, damaged, or misaligned teeth can affect comfort, confidence, and daily life. We’ll explain options in plain language." />
            </section>
            <section>
              <SectionHeading title="What to expect" body="Clear consultation steps, honest candidacy discussion, and transparent next actions — including financing education when appropriate." />
            </section>
            <section>
              <SectionHeading title="Locations" body="Available pathways may vary by office capacity and clinical offerings. Confirm details when you schedule." />
              <p className="mt-3 text-sm text-ink-soft">Yucca Valley · Desert Hot Springs</p>
            </section>
            <FaqList
              items={[
              { q: 'What problems do implants help with?', a: 'Implants can help replace a missing tooth, several teeth, or support broader restorative plans after a clinical evaluation.' },
              { q: 'Who may qualify?', a: 'Candidacy depends on overall health, bone support, gum health, and treatment goals. A dentist determines eligibility after examination and imaging when needed.' },
              { q: 'What should I expect?', a: 'Most patients start with a consultation. From there we discuss options, sequencing, and financing education when appropriate.' },
              { q: 'Do you offer financing?', a: 'We can discuss approved payment pathways after clinical recommendations. Credit approval is never guaranteed.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Dental implants' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
