import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuthUser, requireCsrf, assertCanManageLeads } from "@/server/auth/session";
import { isOpsEnabled } from "@/server/env";
import { prisma } from "@/server/db";
import { writeAudit } from "@/server/audit";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isOpsEnabled()) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    assertCanManageLeads(user);
    await requireCsrf(req.headers.get("x-csrf-token"));
    const { id } = await ctx.params;
    const body = await req.json();
    const task = await prisma.frontDeskTask.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!task) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const updated = await prisma.frontDeskTask.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        assigneeId: body.assigneeId,
        priority: body.priority,
        closedAt: body.status === "closed" ? new Date() : undefined,
      },
    });

    await writeAudit({
      organizationId: user.organizationId,
      actorUserId: user.id,
      actorRole: user.role,
      actorType: "human",
      action: "task.updated",
      resourceType: "FrontDeskTask",
      resourceId: id,
      result: "success",
      nextSafe: { status: updated.status },
    });

    return NextResponse.json({ ok: true, task: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw err;
  }
}
