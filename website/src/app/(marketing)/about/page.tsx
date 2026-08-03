import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Hart Family Dental — comprehensive dental care in Desert Hot Springs and Yucca Valley.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About our practice"
        body={`${site.brand} provides personalized general, restorative, implant, and denture care at convenient locations in Desert Hot Springs and Yucca Valley.`}
      />
      <Prose>
        <SectionHeading
          title="Our approach"
          body="Friendly, trustworthy, family-oriented care — with modern tools such as CBCT imaging and digital impressions, and pathways for implants, dentures, and restorative treatment when you need them."
        />
        <p className="mt-8 max-w-3xl text-ink-soft">
          We serve the High Desert and Coachella Valley through two offices so patients can choose convenience without
          giving up a personal practice feel. Our team speaks English and Spanish. Marketing never replaces clinical
          judgment: diagnoses and treatment approvals come from licensed dental professionals based on an individual
          evaluation.
        </p>
      </Prose>
    </>
  );
}
