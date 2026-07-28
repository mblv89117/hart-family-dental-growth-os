import type { SuppressionType } from "@prisma/client";
import { prisma } from "../db";

const STOP_WORDS = [
  "stop",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
  "revoke",
  "opt out",
  "opt-out",
];

export function isOptOutText(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/[!.]+$/g, "");
  return STOP_WORDS.some((w) => normalized === w || normalized.startsWith(`${w} `));
}

export async function recordOptOut(input: {
  organizationId: string;
  contactId?: string;
  email?: string;
  phone?: string;
  channel: "sms" | "email" | "voice" | "all";
  source: string;
  reason?: string;
}) {
  const types: SuppressionType[] =
    input.channel === "all"
      ? ["global", "sms", "email", "voice", "marketing"]
      : input.channel === "sms"
        ? ["sms", "marketing"]
        : input.channel === "email"
          ? ["email", "marketing"]
          : ["voice", "marketing"];

  const created = [];
  for (const type of types) {
    created.push(
      await prisma.suppressionRecord.create({
        data: {
          organizationId: input.organizationId,
          contactId: input.contactId,
          email: input.email?.toLowerCase(),
          phone: input.phone,
          type,
          reason: input.reason || "opt_out",
          source: input.source,
          active: true,
        },
      }),
    );
  }
  return created;
}

export type OutboundCheck = {
  allowed: boolean;
  reasons: string[];
};

/** Must be called immediately before send execution, not only at queue time. */
export async function checkOutboundAllowed(input: {
  organizationId: string;
  contactId?: string;
  email?: string;
  phone?: string;
  channel: "sms" | "email" | "voice";
  purpose?: string;
}): Promise<OutboundCheck> {
  const reasons: string[] = [];
  const now = new Date();

  const records = await prisma.suppressionRecord.findMany({
    where: {
      organizationId: input.organizationId,
      active: true,
      OR: [
        input.contactId ? { contactId: input.contactId } : undefined,
        input.email ? { email: input.email.toLowerCase() } : undefined,
        input.phone ? { phone: input.phone } : undefined,
      ].filter(Boolean) as object[],
    },
  });

  for (const r of records) {
    if (r.expiresAt && r.expiresAt < now) continue;
    if (r.type === "global" || r.type === "deceased" || r.type === "legal_hold" || r.type === "temporary_pause") {
      reasons.push(r.type);
    }
    if (r.type === "wrong_number" && (input.channel === "sms" || input.channel === "voice")) {
      reasons.push("wrong_number");
    }
    if (r.type === input.channel) reasons.push(r.type);
    if (r.type === "marketing" && input.purpose === "marketing") reasons.push("marketing");
    if (r.type === "recall" && input.purpose === "recall") reasons.push("recall");
  }

  return { allowed: reasons.length === 0, reasons: [...new Set(reasons)] };
}

export async function recordConsent(input: {
  organizationId: string;
  leadId?: string;
  contactId?: string;
  channel: string;
  purpose: string;
  source: string;
  granted: boolean;
  languageVersion?: string;
  ipAddress?: string;
}) {
  return prisma.consentRecord.create({
    data: {
      organizationId: input.organizationId,
      leadId: input.leadId,
      contactId: input.contactId,
      channel: input.channel,
      purpose: input.purpose,
      source: input.source,
      granted: input.granted,
      languageVersion: input.languageVersion || "v1",
      ipAddress: input.ipAddress,
    },
  });
}

/**
 * Latest applicable consent for channel/purpose. Fail closed when no grant.
 * Opt-out/suppression is checked separately via checkOutboundAllowed (opt-out wins).
 */
export async function hasActiveConsent(input: {
  organizationId: string;
  contactId?: string;
  leadId?: string;
  channel: string;
  purpose?: string;
}): Promise<boolean> {
  if (!input.contactId && !input.leadId) return false;
  const now = new Date();
  const records = await prisma.consentRecord.findMany({
    where: {
      organizationId: input.organizationId,
      channel: input.channel,
      ...(input.contactId ? { contactId: input.contactId } : {}),
      ...(input.leadId ? { leadId: input.leadId } : {}),
      ...(input.purpose ? { purpose: input.purpose } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  for (const r of records) {
    if (r.expiresAt && r.expiresAt < now) continue;
    if (r.revokedAt) return false;
    if (r.granted) return true;
    return false;
  }
  return false;
}

/** Idempotent opt-out: reuse active matching suppressions when present. */
export async function recordOptOutIdempotent(input: {
  organizationId: string;
  contactId?: string;
  email?: string;
  phone?: string;
  channel: "sms" | "email" | "voice" | "all";
  source: string;
  reason?: string;
}) {
  const existing = await prisma.suppressionRecord.findFirst({
    where: {
      organizationId: input.organizationId,
      active: true,
      reason: input.reason || "opt_out",
      OR: [
        input.contactId ? { contactId: input.contactId } : undefined,
        input.email ? { email: input.email.toLowerCase() } : undefined,
        input.phone ? { phone: input.phone } : undefined,
      ].filter(Boolean) as object[],
    },
  });
  if (existing) return [existing];
  return recordOptOut(input);
}
