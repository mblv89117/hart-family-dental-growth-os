/**
 * Unresolved Open Dental mapping queue for administrative review.
 * Do not invent clinic/provider/operatory mappings — queue gaps for staff.
 */

import { prisma } from "../db";

export type MappingGapKind = "clinic" | "provider" | "operatory" | "schedule_rule";

export type MappingGap = {
  kind: MappingGapKind;
  connectionId: string;
  connectionKey: string;
  externalId?: string;
  locationId?: string;
  locationKey?: string;
  detail: string;
};

export async function listUnresolvedMappings(organizationId: string): Promise<MappingGap[]> {
  const gaps: MappingGap[] = [];
  const connections = await prisma.openDentalConnection.findMany({
    where: { organizationId, active: true },
    include: {
      clinicMappings: { include: { location: true } },
      providerMappings: true,
      operatoryMappings: true,
      schedulingRules: true,
    },
  });

  const locations = await prisma.location.findMany({
    where: { organizationId, active: true },
  });

  for (const conn of connections) {
    const mappedLocationIds = new Set(conn.clinicMappings.map((m) => m.locationId));
    for (const loc of locations) {
      if (!mappedLocationIds.has(loc.id)) {
        gaps.push({
          kind: "clinic",
          connectionId: conn.id,
          connectionKey: conn.key,
          locationId: loc.id,
          locationKey: loc.key,
          detail: `Location ${loc.key} has no clinic mapping on connection ${conn.key}`,
        });
      }
    }

    if (conn.providerMappings.length === 0) {
      gaps.push({
        kind: "provider",
        connectionId: conn.id,
        connectionKey: conn.key,
        detail: `Connection ${conn.key} has zero provider mappings — staff must import and approve`,
      });
    } else {
      const inactive = conn.providerMappings.filter((p) => !p.active);
      for (const p of inactive) {
        gaps.push({
          kind: "provider",
          connectionId: conn.id,
          connectionKey: conn.key,
          externalId: p.externalProvNum,
          detail: `Provider ${p.displayName} (${p.externalProvNum}) is inactive — review before scheduling`,
        });
      }
    }

    if (conn.operatoryMappings.length === 0) {
      gaps.push({
        kind: "operatory",
        connectionId: conn.id,
        connectionKey: conn.key,
        detail: `Connection ${conn.key} has zero operatory mappings — staff must import and approve`,
      });
    }

    for (const rule of conn.schedulingRules) {
      const missingProv = !rule.externalProvNums || (Array.isArray(rule.externalProvNums) && (rule.externalProvNums as unknown[]).length === 0);
      const missingOps = !rule.externalOperatoryNums || (Array.isArray(rule.externalOperatoryNums) && (rule.externalOperatoryNums as unknown[]).length === 0);
      if (!rule.externalClinicId || missingProv || missingOps) {
        gaps.push({
          kind: "schedule_rule",
          connectionId: conn.id,
          connectionKey: conn.key,
          locationId: rule.locationId || undefined,
          detail: `Scheduling rule ${rule.id} incomplete (clinic/provider/operatory) — not auto-bookable`,
        });
      }
    }
  }

  return gaps;
}
