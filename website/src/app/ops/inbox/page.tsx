import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthUser } from "@/server/auth/session";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function OpsInboxPage() {
  let user;
  try {
    user = await requireAuthUser();
  } catch {
    redirect("/ops/login");
  }

  const locationFilter =
    user.role === "Owner" || user.role === "Administrator"
      ? {}
      : { locationId: { in: user.locationIds } };

  const [tasks, leads] = await Promise.all([
    prisma.frontDeskTask.findMany({
      where: {
        organizationId: user.organizationId,
        status: { in: ["open", "in_progress", "waiting", "paused"] },
        ...locationFilter,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 40,
      include: { location: true, lead: true },
    }),
    prisma.lead.findMany({
      where: { organizationId: user.organizationId, ...locationFilter },
      orderBy: { receivedAt: "desc" },
      take: 40,
      include: { location: true, attribution: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Unified inbox</h1>
        <p className="text-sm text-slate-600">Web leads, tasks, and draft follow-ups for your locations.</p>
      </div>

      <section className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="font-medium">Front-desk tasks</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-slate-500">
                  {t.location?.shortName || "—"} · {t.type} · {t.status} · {t.priority}
                </div>
              </div>
              {t.leadId ? (
                <Link className="underline" href={`/ops/leads/${t.leadId}`}>
                  Open lead
                </Link>
              ) : null}
            </li>
          ))}
          {tasks.length === 0 ? <li className="py-3 text-slate-500">No open tasks.</li> : null}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="font-medium">Recent leads</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {leads.map((l) => (
            <li key={l.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-slate-500">
                  {l.location.shortName} · {l.service || l.formType} · {l.status}
                  {l.attribution?.utmSource ? ` · src:${l.attribution.utmSource}` : ""}
                </div>
              </div>
              <Link className="underline" href={`/ops/leads/${l.id}`}>
                Lead 360
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
