import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";

export const metadata: Metadata = {
  title: "New Patients",
  description: "New patient information for Hart Family Dental in Yucca Valley and Desert Hot Springs.",
};

export default function NewPatientsPage() {
  return (
    <>
      <PageHero
        title="New patients welcome"
        body="Whether you’re overdue for a checkup or exploring implants or straightening, we’ll help you start with clear expectations."
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <SectionHeading
              title="What to bring"
              body="Photo ID, insurance card if applicable, a list of medications, and any recent dental X-rays if you have them."
            />
            <SectionHeading
              title="What to expect"
              body="A welcoming visit focused on understanding your goals, reviewing your oral health, and outlining practical next steps."
            />
            <SectionHeading
              title="Payment & insurance"
              body="Ask us about insurance participation, cash-pay pathways, and financing education. We do not guarantee third-party credit approval."
            />
          </div>
          <AppointmentForm defaultService="New patient visit" heading="Request a new-patient visit" />
        </div>
      </Prose>
    </>
  );
}
