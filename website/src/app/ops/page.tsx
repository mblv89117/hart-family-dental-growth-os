import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getAutomationMode, isEmergencyStopped } from "@/server/safety/controls";

export const dynamic = "force-dynamic";

export default async function OpsTodayPage() {
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

  const [newLeads, openTasks, urgent, mode, emergency, integrations] = await Promise.all([
    prisma.lead.count({
      where: { organizationId: user.organizationId, status: "new", ...locationFilter },
    }),
    prisma.frontDeskTask.count({
      where: {
        organizationId: user.organizationId,
        status: { in: ["open", "in_progress"] },
        ...locationFilter,
      },
    }),
    prisma.frontDeskTask.findMany({
      where: {
        organizationId: user.organizationId,
        priority: { in: ["high", "urgent"] },
        status: { in: ["open", "in_progress"] },
        ...locationFilter,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    getAutomationMode(user.organizationId),
    isEmergencyStopped(user.organizationId),
    prisma.integrationHealth.findMany({
      include: { connection: { select: { name: true, key: true, mode: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-sm text-slate-600">
          Signed in as {user.name} ({user.role}). Automation mode: <strong>{mode}</strong>
          {emergency ? " · EMERGENCY STOP ON" : ""}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="New leads" value={newLeads} href="/ops/inbox" />
        <Stat label="Open tasks" value={openTasks} href="/ops/inbox" />
        <Stat label="Urgent items" value={urgent.length} href="/ops/inbox" />
      </div>
      <section className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="font-medium">Priority follow-up</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {urgent.length === 0 ? <li className="text-slate-500">No urgent tasks.</li> : null}
          {urgent.map((t) => (
            <li key={t.id} className="flex justify-between gap-3 border-b border-slate-100 py-2">
              <span>{t.title}</span>
              <span className="text-slate-500">{t.priority}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="font-medium">Integrations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {integrations.map((h) => (
            <li key={h.id}>
              {h.connection.name} ({h.connection.mode}) — {h.status}
            </li>
          ))}
          {integrations.length === 0 ? <li className="text-slate-500">No health records yet.</li> : null}
        </ul>
        <p className="mt-3 text-sm">
          <Link className="underline" href="/ops/safety">
            Open Safety Center
          </Link>
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-300 bg-white p-4 hover:border-slate-500">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </Link>
  );
}
