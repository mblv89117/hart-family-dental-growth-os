import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Financing & Payment Options",
  description: 'We help patients understand cash-pay pathways, phased treatment when appropriate, and third-party financing education — without credit-approval guarantees.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Make care more approachable' body='We help patients understand cash-pay pathways, phased treatment when appropriate, and third-party financing education — without credit-approval guarantees.' primaryHref="#request" />
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
              { q: 'Do you guarantee financing approval?', a: 'No. Lenders make credit decisions.' },
              { q: 'Can I use HSA/FSA?', a: 'Many dental treatments may be eligible — check your plan rules.' },
              { q: 'Is there a membership plan?', a: 'Ask the office about any current uninsured savings or membership options.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Financing information' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
