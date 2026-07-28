import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
export { scrubForLog, safeInfo, safeError } from "./logging";

type AuditInput = {
  organizationId: string;
  locationId?: string | null;
  actorUserId?: string | null;
  actorRole?: string | null;
  actorType: "human" | "system" | "automation";
  action: string;
  resourceType: string;
  resourceId?: string | null;
  result: "success" | "denied" | "error" | "pending";
  reason?: string | null;
  correlationId?: string | null;
  previousSafe?: Prisma.InputJsonValue;
  nextSafe?: Prisma.InputJsonValue;
};

/** Never pass message bodies, Authorization headers, or clinical detail. */
export async function writeAudit(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      locationId: input.locationId ?? undefined,
      actorUserId: input.actorUserId ?? undefined,
      actorRole: input.actorRole ?? undefined,
      actorType: input.actorType,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? undefined,
      result: input.result,
      reason: input.reason ?? undefined,
      correlationId: input.correlationId ?? undefined,
      previousSafe: input.previousSafe,
      nextSafe: input.nextSafe,
    },
  });
}
