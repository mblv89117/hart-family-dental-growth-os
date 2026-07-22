import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Prose } from "@/components/PageHero";
import { SmileAssessmentForm } from "@/components/SmileAssessmentForm";
import { SectionHeading } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Preliminary Smile Assessment",
  description:
    "Start a dentist-supervised teeth-straightening journey with a preliminary smile assessment. Not a diagnosis or DIY aligner approval.",
};

export default function SmileAssessmentPage() {
  return (
    <>
      <PageHero
        title="Preliminary smile assessment"
        body="Share a few details so we can schedule the right next step. Treatment is always dentist-supervised — never do-it-yourself orthodontics."
        primaryHref="#assessment"
      />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8">
            <SectionHeading
              title="What happens next"
              body="Wendy Delgado follows up for both offices. If you’re a potential candidate for supervised straightening, we’ll schedule consult/records so a dentist can review before any approval."
            />
            <ol className="list-decimal space-y-3 pl-5 text-sm text-ink-soft">
              <li>Submit this preliminary assessment</li>
              <li>We contact you to schedule</li>
              <li>In-office exam / scans / X-rays as required</li>
              <li>Dentist review and decision</li>
              <li>Transparent pricing discussion if approved</li>
            </ol>
            <p className="text-sm text-ink-soft">
              Prefer to read first? See{" "}
              <Link href="/teeth-straightening" className="text-brand hover:underline">
                dentist-supervised teeth straightening
              </Link>
              .
            </p>
          </div>
          <section
            id="assessment"
            className="rounded-[1.5rem] bg-white/80 p-6 shadow-[var(--shadow)] ring-1 ring-[var(--line)] backdrop-blur md:p-8"
          >
            <h2 className="font-display text-3xl text-sky-deep">Assessment form</h2>
            <div className="mt-6">
              <SmileAssessmentForm />
            </div>
          </section>
        </div>
      </Prose>
    </>
  );
}
