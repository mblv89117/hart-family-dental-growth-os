import { createHash } from "crypto";
import { PatientLinkState } from "@prisma/client";
import { prisma } from "../db";
import { getEnv, newCorrelationId } from "../env";
import { writeAudit } from "../audit";
import { getGatewayForConnection, findRecentMatchingAppointment } from "../opendental";
import { assertLocationAccess, type AuthUser } from "../auth/session";
import { canBookAppointments } from "../authz/roles";

const SLOT_TTL_MS = 5 * 60 * 1000;

function dayName(d: Date) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
}

export async function listEligibleSlots(input: {
  user: AuthUser;
  locationId: string;
  categoryKey: string;
  leadId?: string;
  connectionId?: string;
}) {
  if (!canBookAppointments(input.user.role)) {
    throw new Error("Forbidden");
  }
  assertLocationAccess(input.user, input.locationId);

  const category = await prisma.appointmentCategory.findFirst({
    where: {
      organizationId: input.user.organizationId,
      key: input.categoryKey,
    },
  });
  if (!category) throw new Error("Unknown appointment category");

  // For supervised mock booking in ops, allow listing against inactive categories
  // that exist in seed when explicitly requested by staff — still no autoBook.
  const rule = await prisma.schedulingRule.findFirst({
    where: {
      organizationId: input.user.organizationId,
      locationId: input.locationId,
      categoryId: category.id,
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!rule) throw new Error("No scheduling rule configured for this category/location");

  const connectionId = input.connectionId || rule.connectionId;
  const gateway = await getGatewayForConnection(connectionId);
  const health = await gateway.healthCheck();
  if (!health.ok) {
    throw new Error("Open Dental unavailable");
  }

  const now = new Date();
  const minStart = new Date(now.getTime() + rule.minNoticeMinutes * 60_000);
  const maxEnd = new Date(now.getTime() + rule.maxDaysAhead * 24 * 60 * 60_000);
  const raw = await gateway.getAvailableSlots({
    dateStart: minStart.toISOString(),
    dateEnd: maxEnd.toISOString(),
    lengthMinutes: rule.durationMinutes,
    ClinicNum: rule.externalClinicId || undefined,
  });

  const days = Array.isArray(rule.daysOfWeek) ? (rule.daysOfWeek as string[]) : [];
  const windows = Array.isArray(rule.timeWindows)
    ? (rule.timeWindows as Array<{ start: string; end: string }>)
    : [];

  const filtered = raw.filter((slot) => {
    const start = new Date(slot.DateTimeStart);
    if (start < minStart || start > maxEnd) return false;
    if (days.length && !days.includes(dayName(start))) return false;
    if (windows.length) {
      const hhmm = `${String(start.getUTCHours()).padStart(2, "0")}:${String(start.getUTCMinutes()).padStart(2, "0")}`;
      const inWindow = windows.some((w) => hhmm >= w.start && hhmm < w.end);
      if (!inWindow) return false;
    }
    return true;
  });

  const expiresAt = new Date(Date.now() + SLOT_TTL_MS);
  const offered = [];
  for (const slot of filtered.slice(0, 5)) {
    const row = await prisma.offeredSlot.create({
      data: {
        organizationId: input.user.organizationId,
        locationId: input.locationId,
        categoryId: category.id,
        connectionId,
        startAt: new Date(slot.DateTimeStart),
        endAt: new Date(slot.DateTimeEnd),
        externalClinicId: slot.ClinicNum,
        externalProvNum: slot.ProvNum,
        externalOperatoryNum: slot.Op,
        expiresAt,
        leadId: input.leadId,
      },
    });
    offered.push(row);
  }

  await writeAudit({
    organizationId: input.user.organizationId,
    locationId: input.locationId,
    actorUserId: input.user.id,
    actorRole: input.user.role,
    actorType: "human",
    action: "appointment.options_presented",
    resourceType: "OfferedSlot",
    result: "success",
    nextSafe: { count: offered.length, categoryKey: input.categoryKey },
  });

  return { expiresAt, slots: offered, autoBookAllowed: rule.autoBook && category.autoBook };
}

export async function bookOfferedSlot(input: {
  user: AuthUser;
  offeredSlotId: string;
  patientLinkId: string;
  idempotencyKey: string;
  simulateTimeoutBeforeWrite?: boolean;
}) {
  if (!canBookAppointments(input.user.role)) throw new Error("Forbidden");
  if (getEnv().openDentalWritesEnabled === false && getEnv().openDentalMode !== "mock") {
    // Mock writes are local-only and always allowed for supervised mock booking.
  }

  const existingOp = await prisma.appointmentOperation.findUnique({
    where: {
      organizationId_idempotencyKey: {
        organizationId: input.user.organizationId,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });
  if (existingOp?.status === "succeeded" && existingOp.externalAptNum) {
    return {
      status: "already_booked" as const,
      externalAptNum: existingOp.externalAptNum,
      confirmationGenerated: true,
    };
  }

  const slot = await prisma.offeredSlot.findFirst({
    where: { id: input.offeredSlotId, organizationId: input.user.organizationId },
  });
  if (!slot) throw new Error("Offered slot not found");
  assertLocationAccess(input.user, slot.locationId);
  if (slot.consumedAt) throw new Error("Slot already consumed");
  if (slot.expiresAt < new Date()) throw new Error("Offered slot expired");

  const patientLink = await prisma.patientLink.findFirstOrThrow({
    where: { id: input.patientLinkId, organizationId: input.user.organizationId },
  });
  const allowedStates: PatientLinkState[] = [
    PatientLinkState.LINKED,
    PatientLinkState.VERIFIED,
    PatientLinkState.UNLINKED,
  ];
  if (!allowedStates.includes(patientLink.state)) {
    if (patientLink.state === PatientLinkState.MANUAL_REVIEW || patientLink.state === PatientLinkState.CONFLICT) {
      throw new Error("Patient identity requires manual review before booking");
    }
  }

  const correlationId = newCorrelationId();
  const requestHash = createHash("sha256")
    .update(`${slot.id}:${patientLink.id}:${slot.startAt.toISOString()}`)
    .digest("hex");

  const operation = existingOp
    ? await prisma.appointmentOperation.update({
        where: { id: existingOp.id },
        data: { status: "in_progress", correlationId, requestHash },
      })
    : await prisma.appointmentOperation.create({
        data: {
          organizationId: input.user.organizationId,
          connectionId: slot.connectionId,
          idempotencyKey: input.idempotencyKey,
          type: "create",
          status: "in_progress",
          requestHash,
          correlationId,
        },
      });

  const gateway = await getGatewayForConnection(slot.connectionId);
  const health = await gateway.healthCheck();
  if (!health.ok) {
    const req = await prisma.appointmentRequest.create({
      data: {
        organizationId: input.user.organizationId,
        locationId: slot.locationId,
        leadId: slot.leadId || undefined,
        patientLinkId: patientLink.id,
        categoryId: slot.categoryId,
        preferredStart: slot.startAt,
        preferredEnd: slot.endAt,
        status: "pending_confirmation",
        reason: "open_dental_unavailable",
      },
    });
    await prisma.frontDeskTask.create({
      data: {
        organizationId: input.user.organizationId,
        locationId: slot.locationId,
        leadId: slot.leadId || undefined,
        title: "Appointment request awaiting Open Dental",
        description: "Do not tell the patient the appointment is booked.",
        type: "appointment_request",
        priority: "urgent",
        status: "open",
      },
    });
    await prisma.appointmentOperation.update({
      where: { id: operation.id },
      data: { status: "failed", errorSummary: "open_dental_unavailable" },
    });
    return {
      status: "pending_confirmation" as const,
      appointmentRequestId: req.id,
      confirmationGenerated: false,
      message: "Request received and awaiting confirmation. Not booked yet.",
    };
  }

  // Revalidate availability
  const fresh = await gateway.getAvailableSlots({
    dateStart: slot.startAt.toISOString(),
    dateEnd: slot.endAt.toISOString(),
    lengthMinutes: Math.max(15, Math.round((slot.endAt.getTime() - slot.startAt.getTime()) / 60000)),
    ClinicNum: slot.externalClinicId || undefined,
    ProvNum: slot.externalProvNum || undefined,
    Op: slot.externalOperatoryNum || undefined,
  });
  const stillOpen = fresh.some(
    (s) => Math.abs(new Date(s.DateTimeStart).getTime() - slot.startAt.getTime()) < 60_000,
  );
  if (!stillOpen) {
    await prisma.appointmentOperation.update({
      where: { id: operation.id },
      data: { status: "failed", errorSummary: "slot_no_longer_available" },
    });
    throw new Error("Selected slot is no longer available");
  }

  let patNum = patientLink.externalPatNum;
  if (!patNum) {
    // Synthetic new-patient placeholder for mock booking only
    const createdCandidates = await gateway.findPatientCandidates({
      Email: "new.patient.placeholder@example.test",
    });
    patNum = createdCandidates[0]?.PatNum || "NEW1";
    if (getEnv().openDentalMode === "mock") {
      // Mock gateway patients are pre-seeded; assign a synthetic PatNum for new-patient mock booking.
      patNum = "SYN_NEW";
      await prisma.patientLink.update({
        where: { id: patientLink.id },
        data: { externalPatNum: patNum, state: PatientLinkState.LINKED, verifiedAt: new Date() },
      });
    }
  }

  if (input.simulateTimeoutBeforeWrite) {
    // Simulate timeout: do not write, but a concurrent success may have occurred — requery path
    const recent = findRecentMatchingAppointment(gateway.connectionKey, {
      PatNum: patNum!,
      AptDateTime: slot.startAt.toISOString(),
    });
    if (recent) {
      await prisma.appointmentOperation.update({
        where: { id: operation.id },
        data: {
          status: "succeeded",
          externalAptNum: recent.AptNum,
          completedAt: new Date(),
        },
      });
      return {
        status: "already_booked" as const,
        externalAptNum: recent.AptNum,
        confirmationGenerated: true,
      };
    }
    await prisma.appointmentOperation.update({
      where: { id: operation.id },
      data: { status: "ambiguous", errorSummary: "timeout_before_write" },
    });
    await prisma.frontDeskTask.create({
      data: {
        organizationId: input.user.organizationId,
        locationId: slot.locationId,
        leadId: slot.leadId || undefined,
        title: "Ambiguous booking timeout — manual review",
        type: "booking_ambiguous",
        priority: "urgent",
        status: "open",
      },
    });
    return {
      status: "ambiguous" as const,
      confirmationGenerated: false,
      message: "Booking timed out. Manual review required. Do not assume booked.",
    };
  }

  // Booking lock via consumedAt optimistic update
  const locked = await prisma.offeredSlot.updateMany({
    where: { id: slot.id, consumedAt: null, expiresAt: { gt: new Date() } },
    data: { consumedAt: new Date() },
  });
  if (locked.count === 0) throw new Error("Could not acquire booking lock");

  let apt;
  try {
    apt = await gateway.createAppointment({
      PatNum: patNum!,
      AptDateTime: slot.startAt.toISOString(),
      Op: slot.externalOperatoryNum || undefined,
      ProvNum: slot.externalProvNum || undefined,
      ClinicNum: slot.externalClinicId || undefined,
      Note: "Created by Growth OS mock booking",
    });
  } catch (err) {
    // Timeout / failure — requery before retrying
    const recent = findRecentMatchingAppointment(gateway.connectionKey, {
      PatNum: patNum!,
      AptDateTime: slot.startAt.toISOString(),
    });
    if (recent) {
      apt = recent;
    } else {
      await prisma.offeredSlot.update({ where: { id: slot.id }, data: { consumedAt: null } });
      await prisma.appointmentOperation.update({
        where: { id: operation.id },
        data: {
          status: "failed",
          errorSummary: err instanceof Error ? err.message.slice(0, 200) : "create_failed",
        },
      });
      throw err;
    }
  }

  const mirror = await prisma.appointmentMirror.upsert({
    where: {
      connectionId_externalAptNum: {
        connectionId: slot.connectionId,
        externalAptNum: apt.AptNum,
      },
    },
    create: {
      organizationId: input.user.organizationId,
      locationId: slot.locationId,
      connectionId: slot.connectionId,
      patientLinkId: patientLink.id,
      externalAptNum: apt.AptNum,
      status: apt.AptStatus || "Scheduled",
      confirmed: false,
      startAt: slot.startAt,
      endAt: slot.endAt,
      categoryKey: (await prisma.appointmentCategory.findUnique({ where: { id: slot.categoryId } }))?.key,
    },
    update: {
      status: apt.AptStatus || "Scheduled",
      startAt: slot.startAt,
      endAt: slot.endAt,
      patientLinkId: patientLink.id,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.appointmentOperation.update({
    where: { id: operation.id },
    data: {
      status: "succeeded",
      externalAptNum: apt.AptNum,
      appointmentMirrorId: mirror.id,
      completedAt: new Date(),
    },
  });

  if (slot.leadId) {
    await prisma.lead.update({
      where: { id: slot.leadId },
      data: { status: "booked", nurtureStopped: true },
    });
  }

  // Confirmation only AFTER success
  const confirmation = await prisma.message.create({
    data: {
      organizationId: input.user.organizationId,
      channel: "email",
      direction: "outbound",
      purpose: "appointment_confirmation",
      status: getEnv().outboundCommunicationsEnabled ? "queued" : "draft",
      contentHash: createHash("sha256").update(`confirm:${apt.AptNum}`).digest("hex"),
      bodyPreview: "Your appointment request was booked successfully.",
      workflow: "appointment_confirmation",
      actorType: "automation",
      actorUserId: input.user.id,
    },
  });

  await writeAudit({
    organizationId: input.user.organizationId,
    locationId: slot.locationId,
    actorUserId: input.user.id,
    actorRole: input.user.role,
    actorType: "human",
    action: "appointment.booked",
    resourceType: "AppointmentMirror",
    resourceId: mirror.id,
    result: "success",
    correlationId,
    nextSafe: { externalAptNum: apt.AptNum, confirmationMessageId: confirmation.id },
  });

  return {
    status: "booked" as const,
    externalAptNum: apt.AptNum,
    appointmentMirrorId: mirror.id,
    confirmationGenerated: true,
    confirmationMessageId: confirmation.id,
    confirmationStatus: confirmation.status,
  };
}
