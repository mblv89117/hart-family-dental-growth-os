import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuthUser, requireCsrf } from "@/server/auth/session";
import { getEnv, isOpsEnabled } from "@/server/env";
import { prisma } from "@/server/db";
import { canManageSafety } from "@/server/authz/roles";
import {
  getAutomationMode,
  getDailyCaps,
  getOutboundAllowlist,
  isEmergencyStopped,
  setAutomationMode,
  setEmergencyStop,
} from "@/server/safety/controls";
import type { AutomationMode } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  if (!isOpsEnabled()) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    const orgId = user.organizationId;
    const [mode, emergency, caps, allowlist, flags, jobs, health, recentActions] = await Promise.all([
      getAutomationMode(orgId),
      isEmergencyStopped(orgId),
      getDailyCaps(orgId),
      getOutboundAllowlist(orgId),
      prisma.featureFlag.findMany({ where: { organizationId: orgId } }),
      prisma.job.findMany({
        where: { organizationId: orgId, status: { in: ["failed", "dead_letter"] } },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: {
          id: true,
          type: true,
          status: true,
          lastErrorCode: true,
          lastErrorSummary: true,
          attempts: true,
          updatedAt: true,
        },
      }),
      prisma.integrationHealth.findMany({
        include: { connection: { select: { key: true, name: true, mode: true } } },
      }),
      prisma.auditLog.findMany({
        where: {
          organizationId: orgId,
          actorType: { in: ["automation", "system"] },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, action: true, result: true, createdAt: true, resourceType: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      safety: {
        automationMode: mode,
        emergencyStop: emergency,
        dailyCaps: caps,
        outboundAllowlist: allowlist,
        openDentalWritesEnabled: getEnv().openDentalWritesEnabled,
        outboundCommunicationsEnabled: getEnv().outboundCommunicationsEnabled,
        openDentalMode: getEnv().openDentalMode,
        workflows: flags.filter((f) => f.key.startsWith("workflow:")),
        failedAndDeadLetterJobs: jobs,
        integrationHealth: health,
        recentAutomatedActions: recentActions,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  if (!isOpsEnabled()) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    if (!canManageSafety(user.role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    await requireCsrf(req.headers.get("x-csrf-token"));
    const body = await req.json();

    if (body.action === "emergency_stop") {
      await setEmergencyStop(user.organizationId, Boolean(body.enabled), user.id);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "set_automation_mode") {
      await setAutomationMode(
        user.organizationId,
        body.mode as AutomationMode,
        user.id,
        user.role,
      );
      return NextResponse.json({ ok: true });
    }
    if (body.action === "set_workflow") {
      await prisma.featureFlag.upsert({
        where: {
          organizationId_key: {
            organizationId: user.organizationId,
            key: `workflow:${body.workflowKey}`,
          },
        },
        create: {
          organizationId: user.organizationId,
          key: `workflow:${body.workflowKey}`,
          enabled: Boolean(body.enabled),
        },
        update: { enabled: Boolean(body.enabled) },
      });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "set_daily_caps") {
      const existing = await prisma.systemSetting.findFirst({
        where: { organizationId: user.organizationId, key: "daily_caps", locationId: null },
      });
      const value = {
        actions: Number(body.actions ?? 50),
        messages: Number(body.messages ?? 25),
      };
      if (existing) {
        await prisma.systemSetting.update({ where: { id: existing.id }, data: { value } });
      } else {
        await prisma.systemSetting.create({
          data: { organizationId: user.organizationId, key: "daily_caps", value },
        });
      }
      return NextResponse.json({ ok: true });
    }
    if (body.action === "set_allowlist") {
      const list = Array.isArray(body.allowlist)
        ? body.allowlist.map((s: string) => String(s).toLowerCase())
        : [];
      const existing = await prisma.systemSetting.findFirst({
        where: { organizationId: user.organizationId, key: "outbound_allowlist", locationId: null },
      });
      if (existing) {
        await prisma.systemSetting.update({ where: { id: existing.id }, data: { value: list } });
      } else {
        await prisma.systemSetting.create({
          data: { organizationId: user.organizationId, key: "outbound_allowlist", value: list },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code === "FORBIDDEN" ? 403 : 401 });
    }
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "error",
    }, { status: 400 });
  }
}
