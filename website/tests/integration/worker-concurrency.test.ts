import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { enqueueJob, claimNextJob, completeJob, failJob } from "@/server/jobs/queue";
import { setEmergencyStop, assertAutomationMayRun } from "@/server/safety/controls";
import { checkOutboundAllowed, recordOptOut } from "@/server/compliance/consent";
import { resetMockProviders, getMockProviders } from "@/server/messaging/providers";

const prisma = new PrismaClient();

describe("worker concurrency and suppression gates", () => {
  async function clearRunnableJobs() {
    await prisma.job.updateMany({
      where: { status: { in: ["pending", "leased"] } },
      data: { status: "cancelled", lockedBy: null, leaseExpiresAt: null },
    });
  }

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("two workers cannot claim the same job", async () => {
    await clearRunnableJobs();
    const org = await prisma.organization.findFirstOrThrow();
    const job = await enqueueJob({
      organizationId: org.id,
      type: "test.concurrency",
      payload: { n: 1 },
      priority: 1,
      idempotencyKey: `conc-${Date.now()}-${Math.random()}`,
    });

    const [a, b] = await Promise.all([claimNextJob("worker-A"), claimNextJob("worker-B")]);
    const refreshed = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(refreshed.status).toBe("leased");
    expect(["worker-A", "worker-B"]).toContain(refreshed.lockedBy);
    const claimants = [a, b].filter((j) => j && j.id === job.id);
    expect(claimants).toHaveLength(1);
    await completeJob(job.id);
  });

  it("expired leases can be reclaimed; non-expired cannot", async () => {
    await clearRunnableJobs();
    const org = await prisma.organization.findFirstOrThrow();
    const job = await enqueueJob({
      organizationId: org.id,
      type: "test.lease",
      payload: {},
      priority: 1,
      idempotencyKey: `lease-${Date.now()}`,
    });
    const first = await claimNextJob("worker-lease-1");
    expect(first?.id).toBe(job.id);

    // Non-expired: second worker should not steal this job specifically
    await prisma.job.update({
      where: { id: job.id },
      data: { leaseExpiresAt: new Date(Date.now() + 60_000) },
    });
    const steal = await claimNextJob("worker-lease-2");
    if (steal) {
      expect(steal.id).not.toBe(job.id);
      await completeJob(steal.id);
    }

    // Expire lease
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "leased", leaseExpiresAt: new Date(Date.now() - 1000), lockedBy: "worker-lease-1" },
    });
    const reclaimed = await claimNextJob("worker-lease-2");
    expect(reclaimed?.id).toBe(job.id);
    expect(reclaimed?.lockedBy).toBe("worker-lease-2");
    await completeJob(reclaimed!.id);
  });

  it("max attempts move job to dead_letter", async () => {
    await clearRunnableJobs();
    const org = await prisma.organization.findFirstOrThrow();
    const job = await enqueueJob({
      organizationId: org.id,
      type: "test.fail",
      payload: {},
      maxAttempts: 2,
      priority: 1,
      idempotencyKey: `fail-${Date.now()}`,
    });
    const c1 = await claimNextJob("w-fail");
    expect(c1?.id).toBe(job.id);
    await failJob(c1!.id, "x", "first failure");
    await prisma.job.update({
      where: { id: job.id },
      data: { runAt: new Date(Date.now() - 1000) },
    });
    const c2 = await claimNextJob("w-fail");
    expect(c2?.id).toBe(job.id);
    await failJob(c2!.id, "x", "second failure");
    const dead = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(dead.status).toBe("dead_letter");
  });

  it("emergency stop and suppression block outbound before send", async () => {
    const org = await prisma.organization.findFirstOrThrow();
    const owner = await prisma.user.findFirstOrThrow({ where: { email: "owner@local.test" } });
    await setEmergencyStop(org.id, true, owner.id);
    const gate = await assertAutomationMayRun({
      organizationId: org.id,
      workflowKey: "new_lead_response",
      requireOutbound: true,
      recipient: "allow@example.test",
    });
    expect(gate.allowed).toBe(false);
    await setEmergencyStop(org.id, false, owner.id);

    const contact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        displayName: "Stop User",
        phone: "7605557777",
        email: "stop.user@example.test",
      },
    });
    await recordOptOut({
      organizationId: org.id,
      contactId: contact.id,
      phone: contact.phone!,
      channel: "sms",
      source: "test",
    });
    resetMockProviders();
    const check = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact.id,
      phone: contact.phone!,
      channel: "sms",
    });
    expect(check.allowed).toBe(false);
    expect(getMockProviders().sms.sent).toHaveLength(0);
  });
});
