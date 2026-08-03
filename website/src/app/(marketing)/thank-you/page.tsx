import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Prose } from "@/components/PageHero";
import { locations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Thank You",
  description: "We received your appointment request. Hart Family Dental will contact you to confirm availability.",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; service?: string }>;
}) {
  const params = await searchParams;
  const loc = locations.find((l) => l.id === params.location);

  return (
    <>
      <PageHero
        title="We received your request"
        body="Thank you. This is a request confirmation only — it does not confirm an appointment. Wendy Delgado follows up for both Hart Family Dental offices during business hours. The office will contact you to confirm availability."
      />
      <Prose>
        <div className="max-w-2xl space-y-4 text-ink-soft">
          {params.service ? (
            <p>
              Request type: <span className="font-medium text-ink">{params.service}</span>
            </p>
          ) : null}
          {loc ? (
            <div className="space-y-2">
              <p>
                Preferred office: <span className="font-medium text-ink">{loc.shortName}</span> —{" "}
                <a className="text-brand hover:underline" href={loc.phoneHref}>
                  {loc.phone}
                </a>
              </p>
              <p className="text-sm">{loc.hoursNote}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {locations.map((l) => (
                <li key={l.id}>
                  {l.shortName}:{" "}
                  <a className="text-brand hover:underline" href={l.phoneHref}>
                    {l.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm">
            If you have urgent tooth pain or swelling during office hours, please call your preferred office rather than
            waiting for a callback. Emergency appointment availability differs by location.
          </p>
          <p>
            <Link href="/" className="text-brand hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </Prose>
    </>
  );
}
