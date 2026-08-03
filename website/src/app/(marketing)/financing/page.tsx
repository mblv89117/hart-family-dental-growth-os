import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";
import { insurancePublicNote, locations, paymentFinancingCopy } from "@/lib/locations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Financing & Payment Options",
  description: paymentFinancingCopy,
  alternates: { canonical: "/financing" },
  openGraph: {
    title: "Financing & Payment Options | Hart Family Dental",
    description: paymentFinancingCopy,
    url: `${site.domain}/financing`,
  },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Payment & financing options"
        body={paymentFinancingCopy}
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading title="Insurance" body={insurancePublicNote} />
            </section>
            <section>
              <SectionHeading
                title="Currently accepted"
                body="Cash, credit card, debit card, and CareCredit financing for qualified applicants. CareCredit approval and terms are determined by the lender — approval is never guaranteed."
              />
            </section>
            <section>
              <SectionHeading
                title="Coming soon"
                body="Cherry and Sunbit financing, plus the Hart Family Dental Membership Plan, are being developed and are not yet available. We will announce enrollment details here when they launch."
              />
            </section>
            <section>
              <SectionHeading title="Locations" body="Available at both Yucca Valley and Desert Hot Springs offices." />
              <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                {locations.map((loc) => (
                  <li key={loc.id}>
                    {loc.shortName}: <span className="text-ink">{loc.phone}</span>
                  </li>
                ))}
              </ul>
            </section>
            <FaqList
              items={[
                {
                  q: "Do you accept dental insurance?",
                  a: insurancePublicNote,
                },
                {
                  q: "Do you guarantee CareCredit approval?",
                  a: "No. CareCredit is a third-party lender and makes its own credit decisions. Approval is never guaranteed.",
                },
                {
                  q: "Are Cherry, Sunbit, or a membership plan available now?",
                  a: "Not yet. These options are being developed. We will publish enrollment details once they are approved and available.",
                },
                {
                  q: "What payment methods do you accept today?",
                  a: "Cash, credit card, and debit card at both offices, plus CareCredit financing for qualified applicants.",
                },
              ]}
            />
          </div>
          <AppointmentForm defaultService="Financing information" heading="Request financing information" />
        </div>
      </Prose>
    </>
  );
}
