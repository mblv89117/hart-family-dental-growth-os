import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  assertCanManageLeads,
  assertLocationAccess,
  requireAuthUser,
  requireCsrf,
} from "@/server/auth/session";
import { getEnv } from "@/server/env";
import { prisma } from "@/server/db";
import { draftFirstResponse } from "@/server/messaging/providers";
import { writeAudit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!getEnv().opsEnabled) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    assertCanManageLeads(user);
    const { id } = await ctx.params;
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        attribution: true,
        location: true,
        contact: {
          include: {
            consentRecords: { orderBy: { createdAt: "desc" } },
            suppressionRecords: { where: { active: true } },
          },
        },
        conversation: {
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
        tasks: { orderBy: { createdAt: "desc" } },
        patientLinks: true,
      },
    });
    if (!lead) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    assertLocationAccess(user, lead.locationId);

    const audits = await prisma.auditLog.findMany({
      where: {
        organizationId: user.organizationId,
        resourceType: "Lead",
        resourceId: lead.id,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const draft = draftFirstResponse({
      name: lead.name,
      locationName: lead.location.shortName,
      service: lead.service || undefined,
    });

    return NextResponse.json({ ok: true, lead, audits, suggestedDraft: draft });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw err;
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!getEnv().opsEnabled) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    assertCanManageLeads(user);
    await requireCsrf(req.headers.get("x-csrf-token"));
    const { id } = await ctx.params;
    const body = await req.json();
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!lead) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    assertLocationAccess(user, lead.locationId);

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: typeof body.status === "string" ? body.status : undefined,
        nurtureStopped: typeof body.nurtureStopped === "boolean" ? body.nurtureStopped : undefined,
      },
    });

    if (body.pauseAutomation === true) {
      await prisma.frontDeskTask.updateMany({
        where: { leadId: id, status: { in: ["open", "in_progress"] } },
        data: { status: "paused", notes: "Automation paused by staff" },
      });
      updated.nurtureStopped = true;
      await prisma.lead.update({ where: { id }, data: { nurtureStopped: true } });
    }

    await writeAudit({
      organizationId: user.organizationId,
      locationId: lead.locationId,
      actorUserId: user.id,
      actorRole: user.role,
      actorType: "human",
      action: "lead.updated",
      resourceType: "Lead",
      resourceId: id,
      result: "success",
      nextSafe: { status: updated.status, nurtureStopped: updated.nurtureStopped },
    });

    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw err;
  }
}
