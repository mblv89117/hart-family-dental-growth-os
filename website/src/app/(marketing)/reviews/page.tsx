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
        <ul className="mt-8 space-y-6 text-sm">
          {locations.map((loc) => (
            <li key={loc.id}>
              <p className="font-medium text-ink">{loc.shortName}</p>
              <p className="text-ink-soft">
                {loc.street}, {loc.city}, {loc.state} {loc.zip}
              </p>
              <a className="text-sage hover:underline" href={loc.phoneHref}>
                {loc.phone}
              </a>
              <div className="mt-2 flex flex-wrap gap-4">
                {loc.social.googleBusinessProfile ? (
                  <a
                    className="text-sage hover:underline"
                    href={loc.social.googleBusinessProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google
                  </a>
                ) : null}
                {loc.social.yelp ? (
                  <a className="text-sage hover:underline" href={loc.social.yelp} target="_blank" rel="noopener noreferrer">
                    Yelp
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-ink-soft">
          These profile links are the same ones already published on each location page. This page does not quote
          reviews. Ask only patients who had a visit, and never offer payment or a gift for a review.
        </p>
      </Prose>
    </>
  );
}
