import "dotenv/config";
import { getEnv } from "../src/server/env";
import { processOutboxBatch, claimNextJob, completeJob, failJob } from "../src/server/jobs/queue";
import { prisma } from "../src/server/db";
import { safeError, safeInfo } from "../src/server/audit";
import { assertAutomationMayRun } from "../src/server/safety/controls";
import { checkOutboundAllowed } from "../src/server/compliance/consent";
import { getMockProviders } from "../src/server/messaging/providers";

let shuttingDown = false;

async function handleJob(job: {
  id: string;
  type: string;
  organizationId: string;
  payload: unknown;
  correlationId: string | null;
}) {
  const payload = job.payload as Record<string, unknown>;
  if (job.type === "lead.notify_staff") {
    const leadId = String(payload.leadId);
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;
    await getMockProviders().staff.notify({
      title: `New lead: ${lead.name}`,
      body: `Lead ${lead.id} needs follow-up`,
    });
    return;
  }

  if (job.type === "outbound.message") {
    const gate = await assertAutomationMayRun({
      organizationId: job.organizationId,
      workflowKey: String(payload.workflowKey || "outbound"),
      requireOutbound: true,
      recipient: String(payload.to || ""),
    });
    if (!gate.allowed) {
      safeInfo("[worker] outbound blocked", { jobId: job.id, reasons: gate.reasons });
      return;
    }
    const channel = String(payload.channel || "sms") as "sms" | "email" | "voice";
    const suppression = await checkOutboundAllowed({
      organizationId: job.organizationId,
      contactId: payload.contactId ? String(payload.contactId) : undefined,
      email: payload.email ? String(payload.email) : undefined,
      phone: payload.phone ? String(payload.phone) : undefined,
      channel,
      purpose: payload.purpose ? String(payload.purpose) : undefined,
    });
    if (!suppression.allowed) {
      safeInfo("[worker] suppressed", { jobId: job.id, reasons: suppression.reasons });
      return;
    }
    if (channel === "sms") {
      await getMockProviders().sms.send({
        to: String(payload.phone),
        body: String(payload.body || ""),
        purpose: String(payload.purpose || "general"),
      });
    } else if (channel === "email") {
      await getMockProviders().email.send({
        to: String(payload.email),
        subject: String(payload.subject || "Hart Family Dental"),
        text: String(payload.body || ""),
        purpose: String(payload.purpose || "general"),
      });
    }
  }
}

async function loop() {
  const env = getEnv();
  safeInfo("[worker] starting", {
    workerId: env.workerId,
    mode: env.workerExecutionMode,
  });

  while (!shuttingDown) {
    try {
      await processOutboxBatch(20);
      const job = await claimNextJob(env.workerId);
      if (!job) {
        await new Promise((r) => setTimeout(r, env.workerPollMs));
        continue;
      }
      try {
        await handleJob(job);
        await completeJob(job.id);
      } catch (err) {
        await failJob(
          job.id,
          "handler_error",
          err instanceof Error ? err.message : "unknown",
        );
      }
    } catch (err) {
      safeError("[worker] loop error", {
        error: err instanceof Error ? err.message : "unknown",
      });
      await new Promise((r) => setTimeout(r, env.workerPollMs));
    }
  }

  await prisma.$disconnect();
  safeInfo("[worker] shutdown complete", { workerId: env.workerId });
}

process.on("SIGINT", () => {
  shuttingDown = true;
});
process.on("SIGTERM", () => {
  shuttingDown = true;
});

loop().catch(async (err) => {
  safeError("[worker] fatal", { error: err instanceof Error ? err.message : "unknown" });
  await prisma.$disconnect();
  process.exit(1);
});
