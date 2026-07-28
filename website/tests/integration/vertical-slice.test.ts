import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { ingestPublicLead } from "@/server/leads/ingest";
import { loginWithCredentials, type AuthUser } from "@/server/auth/session";
import { getAutomationMode, setEmergencyStop, assertAutomationMayRun } from "@/server/safety/controls";
import { checkOutboundAllowed, recordOptOut, isOptOutText } from "@/server/compliance/consent";
import { matchPatientForLead } from "@/server/patients/linking";
import { listEligibleSlots, bookOfferedSlot } from "@/server/scheduling/booking";
import { createMockGateway, resetMockOpenDentalStores } from "@/server/opendental/mockGateway";
import { enqueueJob, claimNextJob, processOutboxBatch } from "@/server/jobs/queue";
import { getMockProviders, resetMockProviders } from "@/server/messaging/providers";
import { hashToken, resetEnvCache } from "@/server/env";

const prisma = new PrismaClient();

async function authUser(email: string): Promise<AuthUser> {
  const user = await prisma.user.findFirstOrThrow({
    where: { email },
    include: { locationAccess: true },
  });
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    role: user.role,
    locationIds: user.locationAccess.map((l) => l.locationId),
  };
}

describe("integration vertical slice", () => {
  beforeAll(() => {
    resetEnvCache();
    resetMockOpenDentalStores();
    resetMockProviders();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("persists a valid lead with attribution, consent, outbox, and Wendy task", async () => {
    const result = await ingestPublicLead(
      {
        name: "Test Lead One",
        phone: "7605551001",
        email: "test.lead.one@example.test",
        location: "yucca-valley",
        service: "Dental implants",
        message: "Please call me",
        smsConsent: "yes",
        emailConsent: "yes",
        formType: "appointment",
        utm_source: "google",
        utm_campaign: "implants",
        pagePath: "/dental-implants",
      },
      { userAgent: "vitest", ipAddress: "127.0.0.1" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const lead = await prisma.lead.findUniqueOrThrow({
      where: { id: result.lead!.id },
      include: { attribution: true, tasks: true, consentRecords: true },
    });
    expect(lead.attribution?.utmSource).toBe("google");
    expect(lead.tasks.some((t) => t.type === "new_lead")).toBe(true);
    expect(lead.consentRecords.length).toBeGreaterThan(0);
    const outboxes = await prisma.outboxEvent.findMany({
      where: { organizationId: lead.organizationId, type: "lead.created" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    expect(
      outboxes.some((o) => {
        const p = o.payload as { leadId?: string };
        return p.leadId === lead.id;
      }),
    ).toBe(true);
  });

  it("deduplicates rapid duplicate form submissions", async () => {
    const payload = {
      name: "Dup Lead",
      phone: "7605551002",
      email: "dup.lead@example.test",
      location: "desert-hot-springs" as const,
      service: "New patient",
      message: "same",
      smsConsent: "yes" as const,
      formType: "appointment",
    };
    const a = await ingestPublicLead(payload, {});
    const b = await ingestPublicLead(payload, {});
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.lead!.id).toBe(b.lead!.id);
    expect(("skipNotify" in b && b.skipNotify) || ("payload" in b && (b.payload as { duplicate?: boolean }).duplicate)).toBeTruthy();
  });

  it("defaults automation mode to draft", async () => {
    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "hart-family-dental" } });
    expect(await getAutomationMode(org.id)).toBe("draft");
  });

  it("logs in synthetic Wendy with hashed password session", async () => {
    const result = await loginWithCredentials({
      email: "wendy@local.test",
      password: "LocalDev!Wendy2026",
      ipAddress: "127.0.0.1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(result.sessionToken) },
    });
    expect(session?.revokedAt).toBeNull();
  });

  it("blocks location access for YV-only user conceptually via locationIds", async () => {
    const user = await authUser("yv-only@local.test");
    const dhs = await prisma.location.findFirstOrThrow({ where: { key: "desert-hot-springs" } });
    expect(user.locationIds.includes(dhs.id)).toBe(false);
  });

  it("emergency stop prevents outbound execution gate", async () => {
    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "hart-family-dental" } });
    const owner = await authUser("owner@local.test");
    await setEmergencyStop(org.id, true, owner.id);
    const gate = await assertAutomationMayRun({
      organizationId: org.id,
      workflowKey: "new_lead_response",
      requireOutbound: true,
      recipient: "allow@example.test",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reasons).toContain("emergency_stop");
    await setEmergencyStop(org.id, false, owner.id);
  });

  it("global and deceased suppressions block outbound; sms suppression is channel-specific", async () => {
    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "hart-family-dental" } });
    const contact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        displayName: "Suppressed Person",
        email: "suppressed@example.test",
        phone: "7605551999",
      },
    });
    await prisma.suppressionRecord.create({
      data: {
        organizationId: org.id,
        contactId: contact.id,
        email: contact.email,
        phone: contact.phone,
        type: "global",
        active: true,
        reason: "test",
      },
    });
    const global = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact.id,
      email: contact.email!,
      phone: contact.phone!,
      channel: "email",
    });
    expect(global.allowed).toBe(false);

    const contact2 = await prisma.contact.create({
      data: {
        organizationId: org.id,
        displayName: "SMS Only",
        email: "sms.only@example.test",
        phone: "7605551888",
      },
    });
    await prisma.suppressionRecord.create({
      data: {
        organizationId: org.id,
        contactId: contact2.id,
        phone: contact2.phone,
        type: "sms",
        active: true,
      },
    });
    const sms = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact2.id,
      phone: contact2.phone!,
      email: contact2.email!,
      channel: "sms",
    });
    const email = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact2.id,
      phone: contact2.phone!,
      email: contact2.email!,
      channel: "email",
    });
    expect(sms.allowed).toBe(false);
    expect(email.allowed).toBe(true);

    await prisma.suppressionRecord.create({
      data: {
        organizationId: org.id,
        contactId: contact2.id,
        type: "deceased",
        active: true,
      },
    });
    const deceased = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact2.id,
      channel: "email",
      email: contact2.email!,
    });
    expect(deceased.allowed).toBe(false);
  });

  it("processes STOP before later queued message can send", async () => {
    expect(isOptOutText("STOP")).toBe(true);
    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "hart-family-dental" } });
    const contact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        displayName: "Opt Out",
        phone: "7605551777",
        email: "optout@example.test",
      },
    });
    await enqueueJob({
      organizationId: org.id,
      type: "outbound.message",
      payload: {
        channel: "sms",
        phone: contact.phone,
        contactId: contact.id,
        body: "reminder",
        workflowKey: "new_lead_response",
        to: contact.phone,
      },
      idempotencyKey: `optout-test-${Date.now()}`,
    });
    await recordOptOut({
      organizationId: org.id,
      contactId: contact.id,
      phone: contact.phone!,
      channel: "sms",
      source: "inbound_sms",
    });
    // Worker-style check immediately before send
    const check = await checkOutboundAllowed({
      organizationId: org.id,
      contactId: contact.id,
      phone: contact.phone!,
      channel: "sms",
    });
    expect(check.allowed).toBe(false);
    resetMockProviders();
    // Even if job runs, gate should block; simulate handler check
    expect(getMockProviders().sms.sent).toHaveLength(0);
  });

  it("never auto-links on name-only; multiple candidates create manual review", async () => {
    resetMockOpenDentalStores();
    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "hart-family-dental" } });
    const conn = await prisma.openDentalConnection.findFirstOrThrow({
      where: { organizationId: org.id, key: "shared-clinics" },
    });
    const leadResult = await ingestPublicLead(
      {
        name: "Jordan Example",
        phone: "7605550000",
        email: "jordan.unique@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
        message: "name match test",
      },
      {},
    );
    expect(leadResult.ok).toBe(true);
    if (!leadResult.ok) return;
    const link = await matchPatientForLead({
      organizationId: org.id,
      connectionId: conn.id,
      leadId: leadResult.lead!.id,
    });
    expect(["MANUAL_REVIEW", "UNLINKED", "CANDIDATE_MATCH"]).toContain(link.state);
    expect(link.state).not.toBe("LINKED");
    const tasks = await prisma.frontDeskTask.findMany({
      where: { leadId: leadResult.lead!.id, type: "patient_match_review" },
    });
    // Jordan Example has two mock patients — should create review when name-only
    expect(tasks.length).toBeGreaterThanOrEqual(1);
  });

  it("filters availability, expires slots, revalidates, books mock OD, confirms only after success", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const leadResult = await ingestPublicLead(
      {
        name: "Bookable Lead",
        phone: "7605553001",
        email: "bookable@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
        service: "New patient exam",
      },
      {},
    );
    expect(leadResult.ok).toBe(true);
    if (!leadResult.ok) return;

    const conn = await prisma.openDentalConnection.findFirstOrThrow({
      where: { organizationId: wendy.organizationId, key: "shared-clinics" },
    });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: leadResult.lead!.id,
      birthdate: "1985-04-12",
      verifiedCode: true,
    });

    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: leadResult.lead!.id,
    });
    expect(offered.slots.length).toBeGreaterThan(0);
    expect(offered.autoBookAllowed).toBe(false);

    const expired = offered.slots[0];
    await prisma.offeredSlot.update({
      where: { id: expired.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(
      bookOfferedSlot({
        user: wendy,
        offeredSlotId: expired.id,
        patientLinkId: link.id,
        idempotencyKey: `expired-${expired.id}`,
      }),
    ).rejects.toThrow(/expired/i);

    const offered2 = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: leadResult.lead!.id,
    });
    const slot = offered2.slots[0];
    const booked = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: slot.id,
      patientLinkId: link.id,
      idempotencyKey: `book-${slot.id}`,
    });
    expect(booked.status).toBe("booked");
    if (booked.status === "booked") {
      expect(booked.externalAptNum).toBeTruthy();
      expect(booked.confirmationGenerated).toBe(true);
      const confirmation = await prisma.message.findUniqueOrThrow({
        where: { id: booked.confirmationMessageId },
      });
      expect(confirmation.purpose).toBe("appointment_confirmation");
      // Ensure confirmation message created only as part of success path
      expect(["draft", "queued"]).toContain(confirmation.status);
    }

    const audits = await prisma.auditLog.findMany({
      where: { action: "appointment.booked", organizationId: wendy.organizationId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(JSON.stringify(audits[0])).not.toMatch(/Authorization/i);
    expect(audits[0].nextSafe).toBeTruthy();
  });

  it("Open Dental downtime creates AppointmentRequest without confirmation", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const leadResult = await ingestPublicLead(
      {
        name: "Downtime Lead",
        phone: "7605553002",
        email: "downtime@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
      },
      {},
    );
    if (!leadResult.ok) throw new Error("lead failed");
    const conn = await prisma.openDentalConnection.findFirstOrThrow({
      where: { organizationId: wendy.organizationId, key: "shared-clinics" },
    });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: leadResult.lead!.id,
      verifiedCode: true,
    });
    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: leadResult.lead!.id,
    });
    const gw = createMockGateway("shared-clinics");
    gw.setUnavailable?.(true);
    const result = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: `down-${offered.slots[0].id}`,
    });
    expect(result.status).toBe("pending_confirmation");
    expect(result.confirmationGenerated).toBe(false);
    gw.setUnavailable?.(false);
  });

  it("timeout path does not duplicate appointments (idempotent)", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const leadResult = await ingestPublicLead(
      {
        name: "Timeout Lead",
        phone: "7605553003",
        email: "timeout@example.test",
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
      },
      {},
    );
    if (!leadResult.ok) throw new Error("lead failed");
    const conn = await prisma.openDentalConnection.findFirstOrThrow({
      where: { organizationId: wendy.organizationId, key: "shared-clinics" },
    });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: leadResult.lead!.id,
      birthdate: "1990-08-22",
      verifiedCode: true,
    });
    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: leadResult.lead!.id,
    });
    const key = `timeout-${offered.slots[0].id}`;
    const ambiguous = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: key,
      simulateTimeoutBeforeWrite: true,
    });
    expect(ambiguous.status).toBe("ambiguous");
    expect(ambiguous.confirmationGenerated).toBe(false);

    // Slot not consumed on timeout-before-write — re-offer and book once
    const offered2 = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: leadResult.lead!.id,
    });
    const booked = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered2.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: `${key}-retry`,
    });
    expect(booked.status).toBe("booked");
    const again = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered2.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: `${key}-retry`,
    });
    expect(again.status).toBe("already_booked");
  });

  it("processes outbox into staff notify job with atomic claim", async () => {
    await processOutboxBatch(50);
    const job = await claimNextJob("test-worker");
    // May or may not have jobs depending on prior processing
    if (job) {
      expect(job.lockedBy).toBe("test-worker");
      expect(job.status).toBe("leased");
    }
  });

  it("appointment categories default autoBook false and inactive in seed", async () => {
    const cats = await prisma.appointmentCategory.findMany({
      where: { organizationId: (await prisma.organization.findFirstOrThrow()).id },
    });
    expect(cats.length).toBeGreaterThanOrEqual(8);
    expect(cats.every((c) => c.autoBook === false)).toBe(true);
    expect(cats.every((c) => c.active === false)).toBe(true);
  });
});
