import { redirect } from "next/navigation";
import { requireAuthUser } from "@/server/auth/session";
import { canWriteSchedulingConfig } from "@/server/authz/roles";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    title: "Hours & closures",
    items: ["Weekday hours by location", "Holiday closures", "Minimum booking notice", "Maximum booking horizon"],
  },
  {
    title: "Providers & operatories",
    items: ["Providers by location", "Operatories by location", "Provider–operatory mapping"],
  },
  {
    title: "Appointment categories",
    items: [
      "New patient exam",
      "Hygiene / recall",
      "Emergency request",
      "Implant consultation",
      "Clear-aligner consultation",
      "Cosmetic consultation",
      "Existing treatment follow-up",
      "Staff review",
    ],
  },
  {
    title: "Rules & policies",
    items: [
      "New vs existing patient eligibility",
      "Cancellation / no-show policy",
      "Guardian / minor rules",
      "Insurance verification process",
      "Financing language",
      "Reminder ownership & confirmation timing",
      "Human / clinical / administrative escalation owners",
    ],
  },
  {
    title: "Open Dental mapping",
    items: [
      "Shared Clinics vs separate databases",
      "Clinic IDs",
      "Appointment types & durations",
      "Recall / Web Sched configuration",
      "Unresolved-mapping queue review",
    ],
  },
] as const;

export default async function PracticeSetupPage() {
  let user;
  try {
    user = await requireAuthUser();
  } catch {
    redirect("/ops/login");
  }

  const mayConfigure = canWriteSchedulingConfig(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Practice setup checklist</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Capture and approve scheduling rules before any supervised Open Dental write pilot. Categories are not
          bookable until location, provider, operatory, duration, eligibility, and staff approval are complete.
          Auto-book remains off by default.
        </p>
      </div>

      {!mayConfigure ? (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          Front-desk roles can review this checklist; configuration changes require Administrator or Owner.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="font-semibold text-slate-900">{section.title}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Status: pending staff entry / approval</p>
          </section>
        ))}
      </div>
    </div>
  );
}
