import { NextResponse } from "next/server";
import { AuthError, requireAuthUser } from "@/server/auth/session";
import { isOpsEnabled } from "@/server/env";
import { prisma } from "@/server/db";
import { canManageLeads } from "@/server/authz/roles";

export const runtime = "nodejs";

export async function GET() {
  if (!isOpsEnabled()) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    if (!canManageLeads(user.role) && user.role !== "ReadOnly") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const locationFilter =
      user.role === "Owner" || user.role === "Administrator"
        ? {}
        : { locationId: { in: user.locationIds } };

    const [newLeads, openTasks, escalations, failedJobs, deadJobs, recentAudit] = await Promise.all([
      prisma.lead.count({
        where: { organizationId: user.organizationId, status: "new", ...locationFilter },
      }),
      prisma.frontDeskTask.count({
        where: {
          organizationId: user.organizationId,
          status: { in: ["open", "in_progress"] },
          ...locationFilter,
        },
      }),
      prisma.frontDeskTask.count({
        where: {
          organizationId: user.organizationId,
          priority: "urgent",
          status: { in: ["open", "in_progress"] },
          ...locationFilter,
        },
      }),
      prisma.job.count({
        where: { organizationId: user.organizationId, status: "failed" },
      }),
      prisma.job.count({
        where: { organizationId: user.organizationId, status: "dead_letter" },
      }),
      prisma.auditLog.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          resourceType: true,
          result: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      dashboard: {
        newLeads,
        openTasks,
        escalations,
        failedJobs,
        deadJobs,
        recentAudit,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    throw err;
  }
}
