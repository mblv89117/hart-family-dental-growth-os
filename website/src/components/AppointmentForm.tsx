"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { locations, LocationId } from "@/lib/locations";
import { appointmentServiceOptions } from "@/lib/services";
import { readAttribution, trackEvent } from "@/lib/tracking";

type Props = {
  defaultLocation?: LocationId;
  defaultService?: string;
  heading?: string;
  formType?: string;
};

const fieldClass =
  "rounded-[0.85rem] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";

export function AppointmentForm({
  defaultLocation,
  defaultService = appointmentServiceOptions[0],
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
    const payload = Object.fromEntries(data.entries()) as Record<string, string>;
    const attribution = readAttribution();

    // Fold the optional preferred day/time into the message so it flows through
    // the existing lead payload shape without changing the API contract.
    const preferredDayTime = String(payload.preferredDayTime || "").trim();
    delete payload.preferredDayTime;
    if (preferredDayTime) {
      payload.message = payload.message
        ? `${payload.message}\n\nPreferred day/time: ${preferredDayTime}`
        : `Preferred day/time: ${preferredDayTime}`;
    }

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
        Tell us which office works best. Our team will contact you to confirm availability — submitting this form does
        not book or guarantee an appointment time, and it does not diagnose or approve treatment.
      </p>

      {status === "error" ? (
        <p className="mt-4 rounded-xl bg-[color-mix(in_oklab,var(--brand)_10%,white)] p-4 text-sm text-brand" role="alert">
          {error} Or call{" "}
          {locations.map((l, i) => (
            <span key={l.id}>
              {l.shortName} {l.phone}
              {i < locations.length - 1 ? " / " : ""}
            </span>
          ))}
          .
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
              {appointmentServiceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Preferred follow-up</span>
            <select name="followUp" className={fieldClass} defaultValue="phone">
              <option value="phone">Phone</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>Preferred day/time (optional)</span>
            <input
              name="preferredDayTime"
              type="text"
              placeholder="e.g., Wednesday mornings"
              className={fieldClass}
              autoComplete="off"
            />
          </label>
        </div>
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
        <p className="text-xs text-ink-soft">
          We use the information you submit only to respond to your request and coordinate care. See our{" "}
          <Link href="/privacy" className="text-sage underline underline-offset-2 hover:decoration-2">
            Privacy Policy
          </Link>{" "}
          for details. Please do not include sensitive medical details in this form.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          aria-busy={status === "sending"}
          className="mt-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Submit request"}
        </button>
        <p className="text-xs text-ink-soft">
          Submitting this form does not confirm an appointment — our office will contact you to confirm availability.
          For immediate help, call{" "}
          {locations.map((l, i) => (
            <span key={l.id}>
              {l.shortName} {l.phone}
              {i < locations.length - 1 ? " or " : ""}
            </span>
          ))}
          . Saturday &amp; Sunday: Closed.
        </p>
      </form>
    </section>
  );
}
