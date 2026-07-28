import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  assertLocationAccess,
  requireAuthUser,
  requireCsrf,
} from "@/server/auth/session";
import { getEnv } from "@/server/env";
import { canBookAppointments } from "@/server/authz/roles";
import { listEligibleSlots, bookOfferedSlot } from "@/server/scheduling/booking";
import { matchPatientForLead } from "@/server/patients/linking";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!getEnv().opsEnabled) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    if (!canBookAppointments(user.role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const locationId = req.nextUrl.searchParams.get("locationId");
    const categoryKey = req.nextUrl.searchParams.get("categoryKey") || "new_patient_exam";
    const leadId = req.nextUrl.searchParams.get("leadId") || undefined;
    if (!locationId) {
      return NextResponse.json({ ok: false, error: "locationId required" }, { status: 400 });
    }
    assertLocationAccess(user, locationId);
    const result = await listEligibleSlots({
      user,
      locationId,
      categoryKey,
      leadId,
    });
    return NextResponse.json({ ok: true, ...result });
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

export async function POST(req: NextRequest) {
  if (!getEnv().opsEnabled) return new NextResponse("Not Found", { status: 404 });
  try {
    const user = await requireAuthUser();
    if (!canBookAppointments(user.role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    await requireCsrf(req.headers.get("x-csrf-token"));
    const body = await req.json();

    if (body.action === "match_patient") {
      const lead = await prisma.lead.findFirstOrThrow({
        where: { id: body.leadId, organizationId: user.organizationId },
      });
      assertLocationAccess(user, lead.locationId);
      const conn = await prisma.openDentalConnection.findFirstOrThrow({
        where: { organizationId: user.organizationId, key: body.connectionKey || "shared-clinics" },
      });
      const link = await matchPatientForLead({
        organizationId: user.organizationId,
        connectionId: conn.id,
        leadId: lead.id,
        actorUserId: user.id,
        birthdate: body.birthdate,
        verifiedCode: Boolean(body.verifiedCode),
      });
      return NextResponse.json({ ok: true, patientLink: link });
    }

    if (body.action === "book") {
      const result = await bookOfferedSlot({
        user,
        offeredSlotId: body.offeredSlotId,
        patientLinkId: body.patientLinkId,
        idempotencyKey: body.idempotencyKey,
        simulateTimeoutBeforeWrite: Boolean(body.simulateTimeoutBeforeWrite),
      });
      return NextResponse.json({ ok: true, ...result });
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
