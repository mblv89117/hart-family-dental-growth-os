import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Hart Family Dental — approachable family dentistry in Yucca Valley and Desert Hot Springs.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About our practice"
        body={`${site.brand} is built around approachable everyday dentistry and advanced solutions patients can understand.`}
      />
      <Prose>
        <SectionHeading
          title="Our promise"
          body="Friendly, trustworthy, family-oriented care — modern enough for implants and restorative complexity, comfortable enough for patients who feel nervous or overdue."
        />
        <p className="mt-8 max-w-3xl text-ink-soft">
          We serve the High Desert and Coachella Valley through two offices so patients can choose convenience without
          giving up a personal practice feel. Marketing never replaces clinical judgment: diagnoses and treatment
          approvals come from licensed dental professionals.
        </p>
      </Prose>
    </>
  );
}
