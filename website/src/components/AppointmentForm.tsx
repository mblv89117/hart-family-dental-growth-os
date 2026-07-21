"use client";

import { FormEvent, useState } from "react";
import { locations, LocationId } from "@/lib/locations";

type Props = {
  defaultLocation?: LocationId;
  defaultService?: string;
  heading?: string;
};

const services = [
  "New patient visit",
  "Dental implants",
  "Full-mouth implants",
  "Teeth straightening assessment",
  "Emergency / tooth pain",
  "Cosmetic dentistry",
  "Restorative dentistry",
  "Financing information",
  "Other",
];

const fieldClass =
  "rounded-[0.85rem] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none focus:outline focus:outline-2 focus:outline-[color-mix(in_oklab,var(--sky)_55%,white)]";

export function AppointmentForm({
  defaultLocation,
  defaultService = "New patient visit",
  heading = "Request an appointment",
}: Props) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    console.info("[HFD lead]", Object.fromEntries(data.entries()));
    setStatus("sent");
    form.reset();
  }

  return (
    <section
      id="request"
      className="rounded-[1.5rem] bg-white/80 p-6 shadow-[var(--shadow)] ring-1 ring-[var(--line)] backdrop-blur md:p-8"
    >
      <h2 className="font-display text-3xl text-sky-deep">{heading}</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Tell us which office works best. We’ll confirm by phone or your preferred contact method. This form does not
        diagnose or approve treatment.
      </p>

      {status === "sent" ? (
        <p
          className="mt-6 rounded-xl bg-[color-mix(in_oklab,var(--sage)_12%,white)] p-4 text-sm text-sage-deep"
          role="status"
        >
          Thank you — your request was recorded for follow-up. If this is urgent, please call the office directly.
        </p>
      ) : null}

      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm">
          <span>Full name</span>
          <input required name="name" className={fieldClass} autoComplete="name" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Phone</span>
            <input required name="phone" type="tel" className={fieldClass} autoComplete="tel" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Email</span>
            <input required name="email" type="email" className={fieldClass} autoComplete="email" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Preferred office</span>
            <select required name="location" className={fieldClass} defaultValue={defaultLocation ?? ""}>
              <option value="" disabled>
                Select
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.shortName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>Service interest</span>
            <select name="service" className={fieldClass} defaultValue={defaultService}>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span>Preferred follow-up</span>
          <select name="followUp" className={fieldClass} defaultValue="phone">
            <option value="phone">Phone</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Message (optional — avoid sensitive medical details)</span>
          <textarea name="message" rows={3} className={fieldClass} />
        </label>
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input required type="checkbox" name="smsConsent" className="mt-1" value="yes" />
          <span>
            I agree to receive appointment-related texts from Hart Family Dental. Message/data rates may apply. Reply STOP
            to opt out, HELP for help. Consent is not a condition of purchase or treatment.
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" name="emailConsent" className="mt-1" value="yes" />
          <span>
            I agree to receive email updates about appointments and practice information. I may unsubscribe anytime.
          </span>
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep"
        >
          Submit request
        </button>
        <p className="text-xs text-ink-soft">
          For immediate help, call Yucca Valley (760) 365-6595 or Desert Hot Springs (760) 329-6713.
        </p>
      </form>
    </section>
  );
}
