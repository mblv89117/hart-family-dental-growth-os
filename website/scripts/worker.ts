import "dotenv/config";
import { getEnv } from "../src/server/env";
import { processOutboxBatch, claimNextJob, completeJob, failJob } from "../src/server/jobs/queue";
import { prisma } from "../src/server/db";
import { safeError, safeInfo } from "../src/server/audit";
import { assertPatientOutboundMaySend } from "../src/server/messaging/outboundGate";
import { getMockProviders } from "../src/server/messaging/providers";
import {
  createPatientEmailProvider,
  createPatientSmsProvider,
} from "../src/server/messaging/patientProviders";
import { emitAlert } from "../src/server/alerting";

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
    const channel = String(payload.channel || "sms") as "sms" | "email" | "voice";
    const gate = await assertPatientOutboundMaySend({
      organizationId: job.organizationId,
      workflowKey: String(payload.workflowKey || "outbound"),
      channel,
      purpose: String(payload.purpose || "general"),
      recipient: String(payload.to || payload.phone || payload.email || ""),
      contactId: payload.contactId ? String(payload.contactId) : undefined,
      email: payload.email ? String(payload.email) : undefined,
      phone: payload.phone ? String(payload.phone) : undefined,
      requireConsent: Boolean(payload.requireConsent ?? true),
    });
    if (!gate.allowed) {
      safeInfo("[worker] outbound blocked", { jobId: job.id, reasons: gate.reasons });
      return;
    }
    // Prefer patient adapters (fail-closed until BAA vendor). Local synthetic drills use mock.
    if (channel === "sms") {
      const patient = await createPatientSmsProvider().send({
        to: String(payload.phone),
        body: String(payload.body || ""),
        correlationId: job.correlationId || job.id,
      });
      if (!patient.ok) {
        await emitAlert({
          kind: "message_provider_failure",
          severity: "warning",
          organizationId: job.organizationId,
          correlationId: job.correlationId || undefined,
          summary: "Patient SMS provider rejected send",
          detail: { provider: patient.provider },
        });
        if (getEnv().workerExecutionMode === "local") {
          await getMockProviders().sms.send({
            to: String(payload.phone),
            body: String(payload.body || ""),
            purpose: String(payload.purpose || "general"),
          });
        } else {
          throw new Error(patient.detail);
        }
      }
    } else if (channel === "email") {
      const patient = await createPatientEmailProvider().send({
        to: String(payload.email),
        body: String(payload.body || ""),
        correlationId: job.correlationId || job.id,
      });
      if (!patient.ok) {
        await emitAlert({
          kind: "message_provider_failure",
          severity: "warning",
          organizationId: job.organizationId,
          correlationId: job.correlationId || undefined,
          summary: "Patient email provider rejected send",
          detail: { provider: patient.provider },
        });
        if (getEnv().workerExecutionMode === "local") {
          await getMockProviders().email.send({
            to: String(payload.email),
            subject: String(payload.subject || "Hart Family Dental"),
            text: String(payload.body || ""),
            purpose: String(payload.purpose || "general"),
          });
        } else {
          throw new Error(patient.detail);
        }
      }
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
        await emitAlert({
          kind: "worker_failure",
          severity: "critical",
          organizationId: job.organizationId,
          correlationId: job.correlationId || undefined,
          summary: "Worker job handler failed",
          detail: { jobType: job.type },
        });
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
