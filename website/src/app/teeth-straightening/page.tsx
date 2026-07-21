import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Dentist-Supervised Teeth Straightening",
  description: 'Learn about preliminary eligibility, schedule a consult, and complete care with proper examinations, records, and follow-up. This is not do-it-yourself orthodontics.',
};

export default function Page() {
  return (
    <>
      <PageHero title='A simpler straightening path — with a dentist guiding every clinical decision' body='Learn about preliminary eligibility, schedule a consult, and complete care with proper examinations, records, and follow-up. This is not do-it-yourself orthodontics.' primaryHref="#request" />
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
              { q: 'Is this DIY aligners?', a: 'No. Treatment is dentist-supervised. Automated systems do not diagnose, prescribe, or approve care.' },
              { q: 'What is the journey?', a: 'Education → assessment → consult/records → dentist approval → transparent pricing → delivery or pickup when appropriate → monitoring → retainers → in-person escalation if needed.' },
              { q: 'Can I order aligners online without a visit?', a: 'Clinical requirements apply. Many patients need in-office scans, X-rays, or exams before approval.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Teeth straightening assessment' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
