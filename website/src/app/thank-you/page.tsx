import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Prose } from "@/components/PageHero";
import { locations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Thank You",
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
        body="Thank you. Wendy Delgado follows up for both Hart Family Dental offices during business hours. Saturday & Sunday we are closed."
      />
      <Prose>
        <div className="max-w-2xl space-y-4 text-ink-soft">
          {params.service ? (
            <p>
              Request type: <span className="font-medium text-ink">{params.service}</span>
            </p>
          ) : null}
          {loc ? (
            <p>
              Preferred office: <span className="font-medium text-ink">{loc.shortName}</span> —{" "}
              <a className="text-brand hover:underline" href={loc.phoneHref}>
                {loc.phone}
              </a>
            </p>
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
            If this is urgent tooth pain or swelling, please call the office now rather than waiting for a callback.
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
