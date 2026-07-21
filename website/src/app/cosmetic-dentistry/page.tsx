import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Cosmetic Dentistry",
  description: 'From whitening to veneers and smile makeovers — we’ll explain what may be appropriate after an evaluation.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Refresh your smile with options that fit your goals' body='From whitening to veneers and smile makeovers — we’ll explain what may be appropriate after an evaluation.' primaryHref="#request" />
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
              { q: 'What cosmetic options might be available?', a: 'Depending on clinical findings, options can include whitening, bonding, veneers, or other restorative-cosmetic combinations.' },
              { q: 'Will results look natural?', a: 'We aim for natural-looking improvements matched to your facial features and oral health — individual results vary.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Cosmetic dentistry' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
