import type { Metadata } from "next";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PageHero, Prose } from "@/components/PageHero";
import { FaqList, SectionHeading } from "@/components/Ui";
import { locations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Contact & Scheduling",
  description: "Request an appointment at Hart Family Dental in Yucca Valley or Desert Hot Springs.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact & scheduling"
        body="Call your preferred office or send a request online. We’ll follow up using the channel you choose."
      />
      <Prose>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading title="Call an office" />
            <ul className="mt-6 space-y-6">
              {locations.map((loc) => (
                <li key={loc.id} className="border-t border-[var(--line)] pt-4">
                  <p className="font-display text-2xl text-sky-deep">{loc.shortName}</p>
                  <p className="mt-2 text-sm text-ink-soft">
                    {loc.street}
                    <br />
                    {loc.city}, {loc.state} {loc.zip}
                  </p>
                  <a href={loc.phoneHref} className="mt-2 inline-block text-sage hover:underline">
                    {loc.phone}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <FaqList
                items={[
                  {
                    q: "How fast will you respond?",
                    a: "Web requests receive an automated confirmation when connected. During business hours we aim to follow up as quickly as operations allow, with implant and emergency inquiries prioritized.",
                  },
                  {
                    q: "Can I choose either office?",
                    a: "Yes. Pick the location that fits your schedule and drive time.",
                  },
                ]}
              />
            </div>
          </div>
          <AppointmentForm />
        </div>
      </Prose>
    </>
  );
}
