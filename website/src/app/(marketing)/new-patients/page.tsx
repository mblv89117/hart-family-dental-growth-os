import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";
import { insurancePublicNote } from "@/lib/locations";

export const metadata: Metadata = {
  title: "New Patients",
  description:
    "New patients are welcome at Hart Family Dental in Yucca Valley and Desert Hot Springs. Request an appointment online or by phone.",
  alternates: { canonical: "/new-patients" },
};

export default function NewPatientsPage() {
  return (
    <>
      <PageHero
        title="New patients welcome"
        body="Whether you need an exam, restorative care, implants, or denture help, we’ll help you request a visit with clear expectations. Treatment recommendations are based on an individual evaluation."
        primaryHref="#request"
      />
      <Prose>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <SectionHeading
              title="What to bring"
              body="Photo ID, a list of medications, and any recent dental X-rays if you have them."
            />
            <SectionHeading
              title="What to expect"
              body="A welcoming visit focused on understanding your goals, reviewing your oral health, and outlining practical next steps."
            />
            <SectionHeading title="Payment" body={insurancePublicNote} />
            <SectionHeading
              title="Languages"
              body="Our team speaks English and Spanish at both offices."
            />
          </div>
          <AppointmentForm defaultService="New patient visit" heading="Request a new-patient visit" />
        </div>
      </Prose>
    </>
  );
}
