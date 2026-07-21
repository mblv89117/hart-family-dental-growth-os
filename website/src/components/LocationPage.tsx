import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";
import { Location } from "@/lib/locations";

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
            <SectionHeading title="Visit this office" body="Call to confirm today’s hours before you drive." />
            <dl className="mt-8 space-y-4 text-sm">
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
              <FaqList
                items={[
                  {
                    q: `Do you accept new patients in ${location.shortName}?`,
                    a: "Yes — request an appointment online or call the office and our team will help you find a time.",
                  },
                  {
                    q: "What if I need urgent dental care?",
                    a: "Call the office and describe your concern. We’ll work to find the soonest available evaluation. For life-threatening emergencies, call 911.",
                  },
                  {
                    q: "Can I ask about implants or straightening here?",
                    a: "Yes. We can schedule a consultation so a dentist can evaluate your needs. Online tools never diagnose or approve treatment.",
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
            address: {
              "@type": "PostalAddress",
              streetAddress: location.street,
              addressLocality: location.city,
              addressRegion: location.state,
              postalCode: location.zip,
              addressCountry: "US",
            },
            url: `https://hartfamilydds.com/${location.slug}`,
          }),
        }}
      />
    </>
  );
}
