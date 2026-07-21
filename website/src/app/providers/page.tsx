import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";

export const metadata: Metadata = {
  title: "Providers & Team",
  description: "Meet the Hart Family Dental providers and team.",
};

export default function ProvidersPage() {
  return (
    <>
      <PageHero
        title="Providers & team"
        body="Care led with experience and a family-practice mindset. Full team bios and credentials will be expanded after office confirmation."
      />
      <Prose>
        <SectionHeading title="Dr. Harry Allen Hart, DDS" body="Owner and dentist publicly associated with both Hart Family Dental locations." />
        <p className="mt-6 max-w-2xl text-sm text-ink-soft">
          Additional providers, hygienists, and front-desk team profiles will be published after verification — we do not
          invent credentials or staff listings.
        </p>
      </Prose>
    </>
  );
}
