import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { FaqList, SectionHeading } from "@/components/Ui";
import { PageHero, Prose } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Financing & Payment Options",
  description:
    "Hart Family Dental helps patients explore cash-pay pathways and phased treatment when appropriate. Third-party financing partners will be listed when approved.",
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Make care more approachable"
        body="We help patients understand cash-pay pathways and phased treatment when clinically appropriate. Named financing partners and terms will be added when approved — we never guarantee credit approval."
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading
                title="Payment pathways"
                body="Ask about insurance benefits when applicable, cash-pay options, and whether treatment can be sequenced over time. Specific lender names and promotional financing terms are not published until leadership approves them."
              />
            </section>
            <section>
              <SectionHeading
                title="What to expect"
                body="After a clinical consultation, our team can walk through payment options that fit your plan. Wendy Delgado follows up on financing information requests for both offices."
              />
            </section>
            <section>
              <SectionHeading title="Locations" body="Yucca Valley and Desert Hot Springs." />
            </section>
            <FaqList
              items={[
                {
                  q: "Do you guarantee financing approval?",
                  a: "No. When third-party financing is offered, lenders make credit decisions.",
                },
                {
                  q: "Which financing companies do you work with?",
                  a: "Partner details will be published here once approved. Call or request information and we’ll explain what’s currently available.",
                },
                {
                  q: "Can I use HSA/FSA?",
                  a: "Many dental treatments may be eligible — check your plan rules.",
                },
                {
                  q: "Is there a membership plan?",
                  a: "Ask the office about any current uninsured savings or membership options.",
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
