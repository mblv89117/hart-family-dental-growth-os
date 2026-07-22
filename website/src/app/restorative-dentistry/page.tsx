import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Restorative Dentistry",
  description: 'Crowns, bridges, dentures, and related care to help you eat and smile more comfortably.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Restore comfort, function, and confidence' body='Crowns, bridges, dentures, and related care to help you eat and smile more comfortably.' primaryHref="#request" />
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
              <SectionHeading title="Locations" body="Restorative care — including crowns, bridges, dentures, and related treatment — is offered at both offices." />
              <p className="mt-3 text-sm text-ink-soft">Yucca Valley · Desert Hot Springs</p>
            </section>
            <FaqList
              items={[
              { q: 'What does restorative care include?', a: 'Common treatments include crowns, bridges, dentures, and rebuilding damaged teeth — confirmed per your exam.' },
              { q: 'Can treatment be phased?', a: 'When clinically appropriate, phased plans may help patients move forward thoughtfully.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Restorative dentistry' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
