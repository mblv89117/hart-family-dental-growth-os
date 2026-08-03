import Link from "next/link";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList, SectionHeading } from "@/components/Ui";
import { JsonLd } from "@/components/JsonLd";
import { PageHero, Prose } from "@/components/PageHero";
import { Location } from "@/lib/locations";
import { breadcrumbSchema, dentistLocationSchema, faqSchema } from "@/lib/schema";
import { serviceCategories } from "@/lib/services";
import { site } from "@/lib/site";

const dayLabels = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

function locationFaqs(location: Location): { q: string; a: string }[] {
  const newPatients = {
    q: `Do you accept new patients in ${location.shortName}?`,
    a: location.acceptingNewPatients
      ? "Yes — request an appointment online or call the office and our team will help you find a time."
      : "Please call the office to ask about availability for new patients.",
  };

  const sameDay = {
    q: "Are same-day appointments available?",
    a: location.sameDayAppointments
      ? "Same-day appointments may be available depending on the schedule. Call the office or send a request online and we will do our best to find an appropriate time — availability is never guaranteed."
      : "Call the office to discuss the soonest available appointment.",
  };

  const implants = {
    q: "Can I ask about implants or dentures at this office?",
    a: "Yes. Both Hart Family Dental locations offer restorative care, implants, and denture services. A clinical exam determines what is appropriate for your situation.",
  };

  const parking = {
    q: "Is parking available?",
    a: location.parkingNote,
  };

  if (location.id === "desert-hot-springs") {
    return [
      newPatients,
      sameDay,
      {
        q: "What if I have urgent tooth pain or a broken tooth?",
        a: location.emergencyNote,
      },
      implants,
      {
        q: "Do you accept dental insurance?",
        a: location.insuranceNote,
      },
      parking,
    ];
  }

  return [
    newPatients,
    sameDay,
    {
      q: "What if I need urgent dental care?",
      a: location.emergencyNote,
    },
    implants,
    {
      q: "Do you accept dental insurance?",
      a: location.insuranceNote,
    },
    parking,
  ];
}

function socialLinks(location: Location) {
  const links: { label: string; href: string }[] = [];
  if (location.social.facebook) {
    links.push({ label: "Facebook", href: location.social.facebook });
  }
  if (location.social.yelp) {
    links.push({ label: "Yelp", href: location.social.yelp });
  }
  if (location.social.googleBusinessProfile) {
    links.push({ label: "Google Business", href: location.social.googleBusinessProfile });
  }
  return links;
}

export function LocationPage({ location }: { location: Location }) {
  const social = socialLinks(location);
  const faqs = locationFaqs(location);
  const reviewHref =
    location.social.googleBusinessProfile || location.social.yelp || location.social.facebook;

  return (
    <>
      <PageHero
        title={location.h1}
        body={location.intro}
        phoneHref={location.phoneHref}
        phoneLabel={location.phone}
        primaryHref="#request"
      />
      <Prose>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/contact", label: "Locations" },
            { label: location.shortName },
          ]}
        />
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading title="Visit this office" body={location.hoursNote} />
              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-ink">Hours</dt>
                  <dd className="text-ink-soft">
                    <ul className="mt-2 space-y-1">
                      {dayLabels.map(([key, label]) => (
                        <li key={key}>
                          {label}: {location.hours[key]}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Last patient appointment</dt>
                  <dd className="text-ink-soft">{location.lastPatientAppointment}</dd>
                </div>
              </dl>
            </section>

            <section>
              <SectionHeading title="Address & directions" />
              <p className="mt-4 text-sm text-ink-soft">
                {location.street}
                <br />
                {location.city}, {location.state} {location.zip}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={location.phoneHref}
                  className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
                >
                  Call {location.phone}
                </a>
                <a
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] transition hover:bg-[color-mix(in_oklab,var(--paper-deep)_40%,white)] focus-ring"
                >
                  Get directions
                </a>
              </div>
              {location.fax ? (
                <p className="mt-4 text-sm text-ink-soft">Fax: {location.fax}</p>
              ) : null}
            </section>

            <section>
              <SectionHeading title="Map" body="Find us and plan your drive." />
              <div className="mt-4 overflow-hidden rounded-[1.1rem] ring-1 ring-[var(--line)]">
                <iframe
                  title={`Map of ${location.name}`}
                  src={location.mapEmbedUrl}
                  className="aspect-[16/10] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm">
                <a
                  className="text-sage hover:underline focus-ring rounded"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </p>
            </section>

            <section>
              <SectionHeading title="Area context" body={location.landmarks.join(" · ")} />
            </section>

            <section>
              <SectionHeading title="Parking" body={location.parkingNote} />
            </section>

            <section>
              <SectionHeading title="Languages" body={location.languages.join(" · ")} />
            </section>

            {location.acceptingNewPatients ? (
              <section>
                <SectionHeading
                  title="New patients"
                  body="New patients are welcome at this office. Request an appointment online or call to speak with the front desk."
                />
                <p className="mt-3 text-sm">
                  <Link href="/new-patients" className="text-sage hover:underline focus-ring rounded">
                    New patient information →
                  </Link>
                </p>
              </section>
            ) : null}

            {location.sameDayAppointments ? (
              <section>
                <SectionHeading
                  title="Same-day appointments"
                  body="Same-day visits may be available depending on the schedule. Call or request online — subject to availability, not guaranteed."
                />
              </section>
            ) : null}

            <section>
              <SectionHeading title="Emergency & urgent care" body={location.emergencyNote} />
            </section>

            <section>
              <SectionHeading title="Payment methods" body={location.paymentMethods.join(" · ")} />
            </section>

            <section>
              <SectionHeading title="Insurance" body={location.insuranceNote} />
            </section>

            <section>
              <SectionHeading
                title="Financing"
                body={`Currently available: ${location.financingCurrent.join(", ")} for qualified applicants.`}
              />
              <p className="mt-3 text-sm text-ink-soft">
                <span className="font-medium text-ink">Coming soon:</span>{" "}
                {location.financingComingSoon.join(", ")}, and {location.membershipComingSoon} — not yet
                available; we will announce when enrollment opens.
              </p>
              <p className="mt-3 text-sm">
                <Link href="/financing" className="text-sage hover:underline focus-ring rounded">
                  Payment &amp; CareCredit details →
                </Link>
              </p>
            </section>

            <section>
              <SectionHeading
                title="Communities we often serve"
                body={location.serviceArea.join(" · ")}
              />
            </section>

            <section>
              <SectionHeading
                title="Relevant services"
                body="Explore care categories available at Hart Family Dental."
              />
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {serviceCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link className="text-sage hover:underline focus-ring rounded" href={`/services/${cat.slug}`}>
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {reviewHref ? (
              <section>
                <SectionHeading
                  title="Share your experience"
                  body="If we helped you feel comfortable and cared for, a review helps neighbors find trustworthy dental care."
                />
                <a
                  href={reviewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] transition hover:bg-[color-mix(in_oklab,var(--paper-deep)_40%,white)] focus-ring"
                >
                  Leave a review
                </a>
              </section>
            ) : null}

            {social.length > 0 ? (
              <section>
                <SectionHeading title="Connect with this office" />
                <ul className="mt-4 flex flex-wrap gap-4 text-sm">
                  {social.map((link) => (
                    <li key={link.href}>
                      <a
                        className="text-sage hover:underline focus-ring rounded"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <SectionHeading title="Common questions" />
              <div className="mt-6">
                <FaqList items={faqs} />
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <AppointmentForm defaultLocation={location.id} heading={`Book ${location.shortName}`} />
            <div className="rounded-[1.25rem] bg-[color-mix(in_oklab,var(--sage)_8%,white)] p-5 ring-1 ring-[var(--line)]">
              <p className="font-display text-xl text-sky-deep">Prefer to talk?</p>
              <p className="mt-2 text-sm text-ink-soft">
                Call this office directly — we&apos;ll help you request a visit. Or use the appointment form and our team
                will follow up.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a href={location.phoneHref} className="font-medium text-brand-deep hover:underline focus-ring rounded">
                  {location.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Prose>
      <JsonLd data={dentistLocationSchema(location)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: site.domain },
          { name: location.shortName, url: `${site.domain}${location.path}` },
        ])}
      />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}
