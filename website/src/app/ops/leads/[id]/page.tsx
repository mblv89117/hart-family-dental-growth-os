import { notFound, redirect } from "next/navigation";
import { assertLocationAccess, requireAuthUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { draftFirstResponse } from "@/server/messaging/providers";
import { LeadActions } from "./LeadActions";

export const dynamic = "force-dynamic";

export default async function Lead360Page({ params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAuthUser();
  } catch {
    redirect("/ops/login");
  }
  const { id } = await params;
  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      location: true,
      attribution: true,
      contact: {
        include: {
          consentRecords: { orderBy: { createdAt: "desc" }, take: 10 },
          suppressionRecords: { where: { active: true } },
        },
      },
      conversation: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      tasks: { orderBy: { createdAt: "desc" } },
      patientLinks: true,
    },
  });
  if (!lead) notFound();
  try {
    assertLocationAccess(user, lead.locationId);
  } catch {
    notFound();
  }

  const draft = draftFirstResponse({
    name: lead.name,
    locationName: lead.location.shortName,
    service: lead.service || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lead 360</h1>
        <p className="text-sm text-slate-600">
          {lead.location.shortName} · {lead.status} · nurture {lead.nurtureStopped ? "stopped" : "active"}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
          <h2 className="font-medium">Contact</h2>
          <p className="mt-2">{lead.name}</p>
          <p>{lead.email}</p>
          <p>{lead.phone}</p>
          <p className="mt-2 text-slate-600">Service: {lead.service || "—"}</p>
          <p className="text-slate-600">Message: {lead.message || "—"}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
          <h2 className="font-medium">Attribution</h2>
          <pre className="mt-2 overflow-auto text-xs">
            {JSON.stringify(lead.attribution, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
          <h2 className="font-medium">Consent</h2>
          <ul className="mt-2 space-y-1">
            {(lead.contact?.consentRecords || []).map((c) => (
              <li key={c.id}>
                {c.channel} / {c.purpose}: {c.granted ? "granted" : "denied"}
                {c.revoked ? " (revoked)" : ""}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
          <h2 className="font-medium">Suppressions</h2>
          <ul className="mt-2 space-y-1">
            {(lead.contact?.suppressionRecords || []).length === 0 ? <li>None active</li> : null}
            {(lead.contact?.suppressionRecords || []).map((s) => (
              <li key={s.id}>
                {s.type}: {s.reason || "—"}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
        <h2 className="font-medium">Suggested draft (deterministic — not AI)</h2>
        <p className="mt-2 whitespace-pre-wrap">{draft}</p>
        <p className="mt-2 text-slate-500">Status: DRAFT — outbound patient messaging disabled by default.</p>
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
        <h2 className="font-medium">Patient link</h2>
        <ul className="mt-2 space-y-1">
          {lead.patientLinks.map((p) => (
            <li key={p.id}>
              {p.state} {p.externalPatNum ? `· PatNum ${p.externalPatNum}` : ""}
            </li>
          ))}
          {lead.patientLinks.length === 0 ? <li>UNLINKED</li> : null}
        </ul>
      </section>

      <LeadActions leadId={lead.id} locationId={lead.locationId} />
    </div>
  );
}
