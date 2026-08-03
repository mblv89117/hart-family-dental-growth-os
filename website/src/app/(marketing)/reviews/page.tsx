import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";
import { locations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Patient Reviews",
  description: "Read and share feedback for Hart Family Dental. We never offer compensation for reviews.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        title="Patient reviews"
        body="We appreciate feedback. We never pay for positive reviews, and we respond without confirming anyone’s patient status or sharing private details."
      />
      <Prose>
        <SectionHeading
          title="Share your experience"
          body="Prefer to talk through a concern first? Call the office so we can help directly."
        />
        <ul className="mt-8 space-y-4 text-sm">
          {locations.map((loc) => (
            <li key={loc.id}>
              <p className="font-medium text-ink">{loc.shortName}</p>
              <a className="text-sage hover:underline" href={loc.phoneHref}>
                {loc.phone}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-ink-soft">
          Google and Yelp review links will be published here after profile URLs are verified post-access audit.
        </p>
      </Prose>
    </>
  );
}
