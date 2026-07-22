"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { locations, LocationId } from "@/lib/locations";
import { readAttribution, trackEvent } from "@/lib/tracking";

type Props = {
  defaultLocation?: LocationId;
  defaultService?: string;
  heading?: string;
  formType?: string;
};

const services = [
  "New patient visit",
  "Dental implants",
  "Full-mouth implants",
  "Teeth straightening assessment",
  "Emergency / tooth pain",
  "Cosmetic dentistry",
  "Restorative dentistry",
  "Cash-pay consult",
  "Financing information",
  "Other",
];

const fieldClass =
  "rounded-[0.85rem] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none focus:outline focus:outline-2 focus:outline-[color-mix(in_oklab,var(--sky)_55%,white)]";

export function AppointmentForm({
  defaultLocation,
  defaultService = "New patient visit",
  heading = "Request an appointment",
  formType = "appointment",
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  function onStart() {
    if (started) return;
    setStarted(true);
    trackEvent("form_start", { formType, path: typeof window !== "undefined" ? window.location.pathname : "" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    const attribution = readAttribution();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...attribution, formType, pagePath: window.location.pathname }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Could not submit. Please call the office.");
      }
      trackEvent("form_submit_success", {
        formType,
        location: String(payload.location || ""),
        service: String(payload.service || ""),
      });
      trackEvent("location_selection", { location: String(payload.location || "") });
      const loc = String(payload.location || "");
      router.push(
        `/thank-you?location=${encodeURIComponent(loc)}&service=${encodeURIComponent(String(payload.service || ""))}`,
      );
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      trackEvent("form_submit_error", { formType });
    }
  }

  return (
    <section
      id="request"
      className="rounded-[1.5rem] bg-white/80 p-6 shadow-[var(--shadow)] ring-1 ring-[var(--line)] backdrop-blur md:p-8"
    >
      <h2 className="font-display text-3xl text-sky-deep">{heading}</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Tell us which office works best. Wendy Delgado follows up for both locations. This form does not diagnose or
        approve treatment.
      </p>

      {status === "error" ? (
        <p className="mt-4 rounded-xl bg-[color-mix(in_oklab,var(--brand)_10%,white)] p-4 text-sm text-brand" role="alert">
          {error} Or call Yucca Valley (760) 365-6595 / Desert Hot Springs (760) 329-6713.
        </p>
      ) : null}

      <form className="mt-6 grid gap-4" onSubmit={onSubmit} onFocus={onStart}>
        <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          Company
          <input tabIndex={-1} autoComplete="off" name="companyWebsite" type="text" defaultValue="" />
        </label>
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
            <select
              required
              name="location"
              className={fieldClass}
              defaultValue={defaultLocation ?? ""}
              onChange={(e) => trackEvent("location_selection", { location: e.target.value, formType })}
            >
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
          disabled={status === "sending"}
          className="mt-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Submit request"}
        </button>
        <p className="text-xs text-ink-soft">
          For immediate help, call Yucca Valley (760) 365-6595 or Desert Hot Springs (760) 329-6713. Saturday &amp; Sunday:
          Closed.
        </p>
      </form>
    </section>
  );
}
