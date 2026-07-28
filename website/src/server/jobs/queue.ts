import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { getEnv, newCorrelationId } from "../env";
import { safeError, safeInfo } from "../audit";

export async function enqueueJob(input: {
  organizationId: string;
  locationId?: string;
  type: string;
  payload: Prisma.InputJsonValue;
  runAt?: Date;
  priority?: number;
  maxAttempts?: number;
  idempotencyKey?: string;
  correlationId?: string;
}) {
  if (input.idempotencyKey) {
    const existing = await prisma.job.findUnique({
      where: {
        organizationId_idempotencyKey: {
          organizationId: input.organizationId,
          idempotencyKey: input.idempotencyKey,
        },
      },
    });
    if (existing) return existing;
  }
  return prisma.job.create({
    data: {
      organizationId: input.organizationId,
      locationId: input.locationId,
      type: input.type,
      payload: input.payload,
      runAt: input.runAt || new Date(),
      priority: input.priority ?? 100,
      maxAttempts: input.maxAttempts ?? 5,
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId || newCorrelationId(),
    },
  });
}

/** Atomic lease claim using UPDATE ... WHERE status/lease conditions. */
export async function claimNextJob(workerId: string) {
  const leaseSeconds = getEnv().workerLeaseSeconds;
  const leaseExpiresAt = new Date(Date.now() + leaseSeconds * 1000);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const candidates = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Job"
      WHERE (
        (status = 'pending' AND "runAt" <= ${now})
        OR (status = 'leased' AND "leaseExpiresAt" < ${now})
      )
      ORDER BY priority ASC, "runAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;
    if (!candidates[0]) return null;
    const id = candidates[0].id;
    const updated = await tx.job.updateMany({
      where: {
        id,
        OR: [
          { status: "pending", runAt: { lte: now } },
          { status: "leased", leaseExpiresAt: { lt: now } },
        ],
      },
      data: {
        status: "leased",
        lockedAt: now,
        lockedBy: workerId,
        leaseExpiresAt,
        attempts: { increment: 1 },
      },
    });
    if (updated.count === 0) return null;
    return tx.job.findUnique({ where: { id } });
  });
}

export async function completeJob(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data: { status: "completed", completedAt: new Date(), lockedBy: null, leaseExpiresAt: null },
  });
}

export async function failJob(jobId: string, errorCode: string, errorSummary: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const dead = job.attempts >= job.maxAttempts;
  const backoffMs = Math.min(60_000, 1000 * 2 ** job.attempts);
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: dead ? "dead_letter" : "pending",
      lastErrorCode: errorCode,
      lastErrorSummary: errorSummary.slice(0, 500),
      failedAt: dead ? new Date() : null,
      runAt: dead ? job.runAt : new Date(Date.now() + backoffMs),
      lockedBy: null,
      leaseExpiresAt: null,
    },
  });
}

export async function processOutboxBatch(limit = 20) {
  const events = await prisma.outboxEvent.findMany({
    where: { status: "pending", availableAt: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  for (const event of events) {
    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: { status: "processing", attempts: { increment: 1 } },
    });
    try {
      await handleOutboxEvent(event.id, event.type, event.payload, event.organizationId, event.correlationId);
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "processed", processedAt: new Date() },
      });
    } catch (err) {
      const summary = err instanceof Error ? err.message : "unknown";
      safeError("[outbox] failed", { id: event.id, type: event.type, error: summary });
      const attempts = event.attempts + 1;
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: attempts >= 5 ? "dead_letter" : "pending",
          lastErrorSummary: summary.slice(0, 500),
          availableAt: new Date(Date.now() + Math.min(60_000, 1000 * 2 ** attempts)),
        },
      });
    }
  }
}

async function handleOutboxEvent(
  id: string,
  type: string,
  payload: unknown,
  organizationId: string,
  correlationId: string | null,
) {
  safeInfo("[outbox] process", { id, type, organizationId, correlationId });
  if (type === "lead.created") {
    const p = payload as { leadId: string; locationId: string };
    await enqueueJob({
      organizationId,
      locationId: p.locationId,
      type: "lead.notify_staff",
      payload: { leadId: p.leadId },
      idempotencyKey: `lead.notify_staff:${p.leadId}`,
      correlationId: correlationId || undefined,
      priority: 10,
    });
  }
}
