import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";
import { Location } from "@/lib/locations";
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

export function LocationPage({ location }: { location: Location }) {
  return (
    <>
      <PageHero
        title={`Dentist in ${location.shortName}`}
        body={`${location.street}, ${location.city}, ${location.state} ${location.zip}. Friendly family care with pathways to implants, restorative treatment, and dentist-supervised straightening.`}
        phoneHref={location.phoneHref}
        phoneLabel={location.phone}
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
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
                <dt className="font-semibold text-ink">Address</dt>
                <dd className="text-ink-soft">
                  {location.street}
                  <br />
                  {location.city}, {location.state} {location.zip}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Phone</dt>
                <dd>
                  <a className="text-sage hover:underline" href={location.phoneHref}>
                    {location.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Communities we often serve</dt>
                <dd className="text-ink-soft">{location.serviceArea.join(" · ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Map</dt>
                <dd>
                  <a
                    className="text-sage hover:underline"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-10">
              <SectionHeading
                title="Services patients often request here"
                body="Family dentistry, implants, dentist-supervised straightening, cosmetic and restorative care, emergency evaluations, and cash-pay consults."
              />
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                <li>
                  <a className="text-sage hover:underline" href="/dental-implants">
                    Dental implants
                  </a>
                </li>
                <li>
                  <a className="text-sage hover:underline" href="/teeth-straightening">
                    Dentist-supervised clear aligners
                  </a>
                </li>
                <li>
                  <a className="text-sage hover:underline" href="/cash-pay-dentistry">
                    Cash-pay dentistry
                  </a>
                </li>
                <li>
                  <a className="text-sage hover:underline" href="/emergency-dentistry">
                    Emergency dentistry
                  </a>
                </li>
                <li>
                  <a className="text-sage hover:underline" href="/restorative-dentistry">
                    Restorative &amp; cosmetic care
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-10">
              <FaqList
                items={[
                  {
                    q: `Do you accept new patients in ${location.shortName}?`,
                    a: "Yes — request an appointment online or call the office and our team will help you find a time.",
                  },
                  {
                    q: "What if I need urgent dental care?",
                    a: "Call the office and describe your concern. We’ll work to find the soonest available evaluation during business hours. For life-threatening emergencies, call 911.",
                  },
                  {
                    q: "Can I ask about implants or straightening here?",
                    a: "Yes. We offer implant consultations and dentist-supervised straightening at both offices. Online tools never diagnose or approve treatment.",
                  },
                ]}
              />
            </div>
          </div>
          <AppointmentForm defaultLocation={location.id} heading={`Book ${location.shortName}`} />
        </div>
      </Prose>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dentist",
            name: location.name,
            telephone: location.phone,
            email: location.leadNotifyEmail,
            address: {
              "@type": "PostalAddress",
              streetAddress: location.street,
              addressLocality: location.city,
              addressRegion: location.state,
              postalCode: location.zip,
              addressCountry: "US",
            },
            url: `${site.domain}/${location.slug}`,
            openingHoursSpecification: location.openingHoursSpecification.map((spec) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: spec.dayOfWeek,
              opens: spec.opens,
              closes: spec.closes,
            })),
          }),
        }}
      />
    </>
  );
}
