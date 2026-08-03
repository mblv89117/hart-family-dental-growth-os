/**
 * Unified pre-send gate for patient outbound messages.
 * Consent + suppression + daily caps + emergency stop + allowlist.
 * Does not send — only decides allow/deny.
 */

import { prisma } from "../db";
import { checkOutboundAllowed, hasActiveConsent } from "../compliance/consent";
import { assertAutomationMayRun, getDailyCaps } from "../safety/controls";

export type OutboundGateInput = {
  organizationId: string;
  workflowKey: string;
  channel: "sms" | "email" | "voice";
  purpose: string;
  recipient: string;
  contactId?: string;
  email?: string;
  phone?: string;
  requireConsent?: boolean;
};

export type OutboundGateResult = {
  allowed: boolean;
  reasons: string[];
};

export async function countMessagesSentToday(organizationId: string): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return prisma.message.count({
    where: {
      organizationId,
      direction: "outbound",
      createdAt: { gte: start },
      status: { in: ["sent", "queued", "delivered"] },
    },
  });
}

export async function assertPatientOutboundMaySend(input: OutboundGateInput): Promise<OutboundGateResult> {
  const reasons: string[] = [];

  const automation = await assertAutomationMayRun({
    organizationId: input.organizationId,
    workflowKey: input.workflowKey,
    requireOutbound: true,
    recipient: input.recipient,
  });
  if (!automation.allowed) reasons.push(...automation.reasons);

  const suppression = await checkOutboundAllowed({
    organizationId: input.organizationId,
    contactId: input.contactId,
    email: input.email,
    phone: input.phone,
    channel: input.channel,
    purpose: input.purpose,
  });
  if (!suppression.allowed) reasons.push(...suppression.reasons);

  if (input.requireConsent !== false) {
    const consented = await hasActiveConsent({
      organizationId: input.organizationId,
      contactId: input.contactId,
      channel: input.channel,
      purpose: input.purpose,
    });
    if (!consented) reasons.push("consent_missing");
  }

  const caps = await getDailyCaps(input.organizationId);
  const sentToday = await countMessagesSentToday(input.organizationId);
  if (sentToday >= caps.messages) {
    reasons.push("daily_message_cap");
  }

  return { allowed: reasons.length === 0, reasons: [...new Set(reasons)] };
}
