"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { locations } from "@/lib/locations";

const fieldClass =
  "rounded-[0.85rem] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none focus:outline focus:outline-2 focus:outline-[color-mix(in_oklab,var(--sky)_55%,white)]";

export function SmileAssessmentForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          formType: "smile-assessment",
          service: "Teeth straightening assessment",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not submit.");
      router.push(
        `/thank-you?location=${encodeURIComponent(String(payload.location || ""))}&service=${encodeURIComponent("Teeth straightening assessment")}`,
      );
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <p className="rounded-xl bg-[color-mix(in_oklab,var(--sage)_10%,white)] p-4 text-sm text-sage-deep">
        This is a <strong>preliminary</strong> assessment only. It is not a diagnosis, prescription, or treatment
        approval. A licensed dentist must review records and approve any straightening plan.
      </p>

      {status === "error" ? (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--brand)_10%,white)] p-4 text-sm text-brand" role="alert">
          {error}
        </p>
      ) : null}

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
      <label className="grid gap-1 text-sm">
        <span>Preferred office</span>
        <select required name="location" className={fieldClass} defaultValue="">
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
        <span>What are your smile goals?</span>
        <select required name="goals" className={fieldClass} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          <option value="straighter-teeth">Straighter teeth</option>
          <option value="close-gaps">Close gaps</option>
          <option value="bite-comfort">Improve bite comfort</option>
          <option value="not-sure">Not sure — want guidance</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Have you had braces or aligners before?</span>
        <select required name="priorOrtho" className={fieldClass} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Unsure</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>When was your last dental exam?</span>
        <select required name="dentalVisit" className={fieldClass} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          <option value="within-year">Within the last year</option>
          <option value="1-3-years">1–3 years ago</option>
          <option value="3-plus">More than 3 years ago</option>
          <option value="unsure">Unsure</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Any current tooth pain, swelling, or urgency? (optional)</span>
        <textarea name="concerns" rows={2} className={fieldClass} placeholder="Keep this brief — no sensitive details needed" />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Preferred follow-up</span>
        <select name="followUp" className={fieldClass} defaultValue="phone">
          <option value="phone">Phone</option>
          <option value="text">Text</option>
          <option value="email">Email</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Message (optional)</span>
        <textarea name="message" rows={2} className={fieldClass} />
      </label>
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input required type="checkbox" name="smsConsent" className="mt-1" value="yes" />
        <span>
          I agree to receive appointment-related texts from Hart Family Dental. Message/data rates may apply. Reply STOP
          to opt out. Consent is not a condition of purchase or treatment.
        </span>
      </label>
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="emailConsent" className="mt-1" value="yes" />
        <span>I agree to receive email updates. I may unsubscribe anytime.</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input required type="checkbox" name="understand" className="mt-1" value="yes" />
        <span>
          I understand this assessment is preliminary only and does not approve treatment. A dentist must examine and
          approve any care plan.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit smile assessment"}
      </button>
    </form>
  );
}
