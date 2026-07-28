import type { AutomationMode } from "@prisma/client";
import { prisma } from "../db";
import { getEnv } from "../env";
import { writeAudit } from "../audit";

const ORG_SLUG = "hart-family-dental";

export async function getOrganizationId(): Promise<string> {
  const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } });
  if (!org) throw new Error("Organization not seeded.");
  return org.id;
}

export async function getAutomationMode(organizationId: string): Promise<AutomationMode> {
  const setting = await prisma.systemSetting.findFirst({
    where: { organizationId, key: "automation_mode", locationId: null },
  });
  if (setting && typeof setting.value === "string") {
    return setting.value as AutomationMode;
  }
  if (setting && setting.value && typeof setting.value === "object" && "mode" in (setting.value as object)) {
    return (setting.value as { mode: AutomationMode }).mode;
  }
  return getEnv().automationMode;
}

export async function isEmergencyStopped(organizationId: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({
    where: { organizationId_key: { organizationId, key: "emergency_stop" } },
  });
  return Boolean(flag?.enabled);
}

export async function isWorkflowEnabled(organizationId: string, workflowKey: string): Promise<boolean> {
  if (await isEmergencyStopped(organizationId)) return false;
  const flag = await prisma.featureFlag.findUnique({
    where: { organizationId_key: { organizationId, key: `workflow:${workflowKey}` } },
  });
  // Missing flag = disabled (fail closed for automation workflows)
  return Boolean(flag?.enabled);
}

export async function getDailyCaps(organizationId: string) {
  const setting = await prisma.systemSetting.findFirst({
    where: { organizationId, key: "daily_caps", locationId: null },
  });
  const value = (setting?.value || {}) as { actions?: number; messages?: number };
  return {
    actions: value.actions ?? 50,
    messages: value.messages ?? 25,
  };
}

export async function getOutboundAllowlist(organizationId: string): Promise<string[]> {
  const setting = await prisma.systemSetting.findFirst({
    where: { organizationId, key: "outbound_allowlist", locationId: null },
  });
  const fromDb = Array.isArray(setting?.value) ? (setting?.value as string[]) : [];
  return [...new Set([...getEnv().outboundAllowlist, ...fromDb.map((s) => s.toLowerCase())])];
}

export type SafetyGateResult = {
  allowed: boolean;
  reasons: string[];
};

export async function assertAutomationMayRun(input: {
  organizationId: string;
  workflowKey: string;
  requireOutbound?: boolean;
  recipient?: string;
}): Promise<SafetyGateResult> {
  const reasons: string[] = [];
  const mode = await getAutomationMode(input.organizationId);
  if (mode === "off") reasons.push("automation_mode_off");
  if (await isEmergencyStopped(input.organizationId)) reasons.push("emergency_stop");
  if (!(await isWorkflowEnabled(input.organizationId, input.workflowKey))) {
    reasons.push("workflow_disabled");
  }
  if (input.requireOutbound) {
    if (!getEnv().outboundCommunicationsEnabled) reasons.push("outbound_disabled");
    if (input.recipient) {
      const allow = await getOutboundAllowlist(input.organizationId);
      if (allow.length === 0 || !allow.includes(input.recipient.toLowerCase())) {
        reasons.push("recipient_not_allowlisted");
      }
    }
  }
  // Draft/observe never auto-send
  if (input.requireOutbound && (mode === "draft" || mode === "observe")) {
    reasons.push(`mode_${mode}_no_send`);
  }
  return { allowed: reasons.length === 0, reasons };
}

export async function setEmergencyStop(organizationId: string, enabled: boolean, actorUserId: string) {
  await prisma.featureFlag.upsert({
    where: { organizationId_key: { organizationId, key: "emergency_stop" } },
    create: {
      organizationId,
      key: "emergency_stop",
      enabled,
      description: "Global kill switch for outbound automation",
    },
    update: { enabled },
  });
  await writeAudit({
    organizationId,
    actorUserId,
    actorType: "human",
    action: enabled ? "safety.emergency_stop_on" : "safety.emergency_stop_off",
    resourceType: "FeatureFlag",
    resourceId: "emergency_stop",
    result: "success",
  });
}

export async function setAutomationMode(
  organizationId: string,
  mode: AutomationMode,
  actorUserId: string,
  actorRole: string,
) {
  if (mode === "autonomous" && actorRole !== "Owner" && actorRole !== "Administrator") {
    throw new Error("Only Owner or Administrator may enable autonomous mode.");
  }
  await prisma.systemSetting.upsert({
    where: {
      organizationId_locationId_key: {
        organizationId,
        locationId: "",
        key: "automation_mode",
      },
    },
    create: {
      organizationId,
      locationId: null,
      key: "automation_mode",
      value: { mode },
    },
    update: { value: { mode } },
  }).catch(async () => {
    // Prisma unique with null locationId is awkward — use findFirst + update/create
    const existing = await prisma.systemSetting.findFirst({
      where: { organizationId, key: "automation_mode", locationId: null },
    });
    if (existing) {
      await prisma.systemSetting.update({
        where: { id: existing.id },
        data: { value: { mode } },
      });
    } else {
      await prisma.systemSetting.create({
        data: { organizationId, key: "automation_mode", value: { mode } },
      });
    }
  });
  await writeAudit({
    organizationId,
    actorUserId,
    actorRole,
    actorType: "human",
    action: "safety.set_automation_mode",
    resourceType: "SystemSetting",
    resourceId: "automation_mode",
    result: "success",
    nextSafe: { mode },
  });
}
