import { requireAuthUser } from "@/server/auth/session";
import { canViewIntegrations } from "@/server/authz/roles";
import { listUnresolvedMappings } from "@/server/opendental/mappingQueue";
import { getOrganizationId } from "@/server/safety/controls";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MappingsPage() {
  let user;
  try {
    user = await requireAuthUser();
  } catch {
    redirect("/ops/login");
  }
  if (!canViewIntegrations(user.role)) {
    redirect("/ops");
  }

  const orgId = await getOrganizationId();
  const gaps = await listUnresolvedMappings(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Open Dental mapping queue</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Unresolved clinic, provider, operatory, and scheduling-rule gaps. Do not invent mappings —
          resolve with staff using verified Open Dental identifiers.
        </p>
      </div>

      {gaps.length === 0 ? (
        <p className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">
          No unresolved mapping gaps detected for active connections/locations.
        </p>
      ) : (
        <ul className="space-y-2">
          {gaps.map((gap, idx) => (
            <li
              key={`${gap.kind}-${gap.connectionId}-${gap.externalId || gap.locationId || idx}`}
              className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
            >
              <span className="font-semibold uppercase tracking-wide">{gap.kind}</span>
              <span className="mx-2 text-amber-700">·</span>
              <span>{gap.connectionKey}</span>
              <p className="mt-1">{gap.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
