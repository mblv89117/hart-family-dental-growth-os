import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

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

export function scrubForLog(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/authorization/i.test(value) || /bearer\s+/i.test(value)) return "[REDACTED]";
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (Array.isArray(value)) return value.map(scrubForLog);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/authorization|password|secret|api[_-]?key|token/i.test(k)) {
        out[k] = "[REDACTED]";
      } else if (/body|message|content|clinical|phi/i.test(k)) {
        out[k] = "[OMITTED]";
      } else {
        out[k] = scrubForLog(v);
      }
    }
    return out;
  }
  return value;
}

export function safeInfo(message: string, meta?: Record<string, unknown>) {
  console.info(message, meta ? scrubForLog(meta) : undefined);
}

export function safeError(message: string, meta?: Record<string, unknown>) {
  console.error(message, meta ? scrubForLog(meta) : undefined);
}
