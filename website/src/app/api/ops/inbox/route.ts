import { NextRequest, NextResponse } from "next/server";
import { AuthError, assertLocationAccess, requireAuthUser } from "@/server/auth/session";
import { isOpsEnabled } from "@/server/env";
import { prisma } from "@/server/db";
import { canManageLeads } from "@/server/authz/roles";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isOpsEnabled()) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    if (!canManageLeads(user.role) && user.role !== "ReadOnly") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const locationId = req.nextUrl.searchParams.get("locationId");
    if (locationId) assertLocationAccess(user, locationId);

    const where = {
      organizationId: user.organizationId,
      ...(locationId
        ? { locationId }
        : user.role === "Owner" || user.role === "Administrator"
          ? {}
          : { locationId: { in: user.locationIds } }),
    };

    const [tasks, leads, conversations] = await Promise.all([
      prisma.frontDeskTask.findMany({
        where: { ...where, status: { in: ["open", "in_progress", "waiting", "paused"] } },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 50,
        include: {
          lead: { select: { id: true, name: true, email: true, phone: true, status: true, service: true } },
          location: { select: { id: true, key: true, shortName: true } },
        },
      }),
      prisma.lead.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        take: 50,
        include: {
          attribution: true,
          location: { select: { key: true, shortName: true } },
          contact: {
            include: {
              consentRecords: { take: 5, orderBy: { createdAt: "desc" } },
              suppressionRecords: { where: { active: true }, take: 10 },
            },
          },
        },
      }),
      prisma.conversation.findMany({
        where: { organizationId: user.organizationId, status: "open" },
        orderBy: { updatedAt: "desc" },
        take: 30,
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          leads: { select: { id: true, name: true, locationId: true } },
        },
      }),
    ]);

    return NextResponse.json({ ok: true, tasks, leads, conversations });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw err;
  }
}
