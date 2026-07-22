import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Emergency Dentistry",
  description: 'We’ll help you find the soonest available evaluation at Yucca Valley or Desert Hot Springs. For medical emergencies, call 911.',
};

export default function Page() {
  return (
    <>
      <PageHero title='Tooth pain or dental urgency? Call us' body='We’ll help you find the soonest available evaluation at Yucca Valley or Desert Hot Springs. For medical emergencies, call 911.' primaryHref="#request" />
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
              <SectionHeading title="Locations" body="Same-week emergency evaluations when capacity allows — both Yucca Valley and Desert Hot Springs. Call for the soonest opening." />
              <p className="mt-3 text-sm text-ink-soft">Yucca Valley · Desert Hot Springs · Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed</p>
            </section>
            <FaqList
              items={[
              { q: 'What counts as a dental emergency?', a: 'Severe pain, swelling, trauma, knocked-out teeth, and uncontrolled bleeding are common reasons to call promptly.' },
              { q: 'Should I use the website form for emergencies?', a: 'Calling is best for urgent issues so we can respond faster.' }
            ]}
            />
          </div>
          <AppointmentForm defaultService='Emergency / tooth pain' heading="Start here" />
        </div>
      </Prose>
    </>
  );
}
