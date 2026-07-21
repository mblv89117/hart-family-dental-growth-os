import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Full-Mouth Dental Implants",
  description: 'Exploring a fuller smile restoration? Start with a consultation so we can explain options that may fit your goals — without pressure or guarantees.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Full-mouth dental implants' body='Exploring a fuller smile restoration? Start with a consultation so we can explain options that may fit your goals — without pressure or guarantees.' primaryHref="#request" />
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
              { q: 'Is full-arch treatment right for me?', a: 'Only a dentist can determine that after evaluating your mouth, health history, and imaging.' },
              { q: 'Will I get a guaranteed result?', a: 'No ethical practice can guarantee outcomes. We focus on clear options and realistic next steps.' },
              { q: 'Can I get a second opinion?', a: 'Yes — second-opinion consultations are welcome when clinically appropriate.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Full-mouth implants' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
