import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Dentist-Supervised Teeth Straightening",
  description:
    "Learn about preliminary eligibility, schedule a consult, and complete care with proper examinations, records, and follow-up. This is not do-it-yourself orthodontics.",
};

export default function Page() {
  return (
    <>
      <PageHero
        title="A simpler straightening path — with a dentist guiding every clinical decision"
        body="Learn about preliminary eligibility, schedule a consult, and complete care with proper examinations, records, and follow-up. This is not do-it-yourself orthodontics."
        primaryHref="/smile-assessment"
      />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading
                title="Dentist-supervised — not DIY"
                body="Online tools never diagnose, prescribe, or approve treatment. A licensed dentist reviews your case after required records and examination."
              />
            </section>
            <section>
              <SectionHeading
                title="Your journey"
                body="Education → preliminary assessment → consult/records → dentist approval → transparent pricing → delivery or office pickup when appropriate → monitoring → retainers → in-person care if concerns arise."
              />
              <p className="mt-4 text-sm">
                <Link href="/smile-assessment" className="font-medium text-brand hover:underline">
                  Start the preliminary smile assessment →
                </Link>
              </p>
            </section>
            <section>
              <SectionHeading title="Locations" body="Yucca Valley and Desert Hot Springs — Wendy Delgado follows up for both." />
            </section>
            <FaqList
              items={[
                {
                  q: "Is this DIY aligners?",
                  a: "No. Treatment is dentist-supervised. Automated systems do not diagnose, prescribe, or approve care.",
                },
                {
                  q: "What is the journey?",
                  a: "Education → assessment → consult/records → dentist approval → transparent pricing → delivery or pickup when appropriate → monitoring → retainers → in-person escalation if needed.",
                },
                {
                  q: "Can I order aligners online without a visit?",
                  a: "Clinical requirements apply. Many patients need in-office scans, X-rays, or exams before approval.",
                },
              ]}
            />
          </div>
          <AppointmentForm defaultService="Teeth straightening assessment" heading="Request a consult" />
        </div>
      </Prose>
    </>
  );
}
