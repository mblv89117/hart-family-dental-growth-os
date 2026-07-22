import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Cash-Pay Dentistry",
  description:
    "Clear next steps for patients paying without insurance at Hart Family Dental in Yucca Valley and Desert Hot Springs. Financing education available — no lender names until approved.",
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Cash-pay dentistry with clear next steps"
        body="Whether you’re uninsured, between plans, or prefer to pay directly, we’ll explain options plainly after we understand your needs — at either office."
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading
                title="What cash-pay means here"
                body="You can request care without using dental insurance for that visit. We discuss recommended treatment, sequencing, and payment pathways after a clinical evaluation — never as a website price quote."
              />
            </section>
            <section>
              <SectionHeading
                title="How we help you move forward"
                body="Transparent consults, phased plans when clinically appropriate, and financing education when you’re ready. We do not publish APRs, monthly payments, or lender names until partners are approved."
              />
            </section>
            <section>
              <SectionHeading
                title="Locations"
                body="Same approachable care at Yucca Valley and Desert Hot Springs. Hours: Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed."
              />
            </section>
            <FaqList
              items={[
                {
                  q: "Do I need insurance to become a patient?",
                  a: "No. New patients are welcome with or without insurance. We’ll help you understand options after we know what care you need.",
                },
                {
                  q: "Can you quote a price online?",
                  a: "Not accurately. Fees depend on clinical findings. We avoid invented prices on the website.",
                },
                {
                  q: "Is financing available?",
                  a: "We can discuss payment pathways after clinical recommendations. Specific lender names and terms are added only when approved.",
                },
              ]}
            />
          </div>
          <AppointmentForm defaultService="Financing information" heading="Request a cash-pay consult" />
        </div>
      </Prose>
    </>
  );
}
