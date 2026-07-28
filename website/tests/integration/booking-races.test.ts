import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { listEligibleSlots, bookOfferedSlot } from "@/server/scheduling/booking";
import { matchPatientForLead } from "@/server/patients/linking";
import { ingestPublicLead } from "@/server/leads/ingest";
import { resetMockOpenDentalStores, createMockGateway } from "@/server/opendental/mockGateway";
import type { AuthUser } from "@/server/auth/session";

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

describe("booking race and idempotency", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("concurrent bookings of same slot: at most one success", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const lead = await ingestPublicLead(
      {
        name: "Race Lead",
        phone: "7605558001",
        email: `race.${Date.now()}@example.test`,
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
      },
      {},
    );
    if (!lead.ok) throw new Error("lead failed");
    const conn = await prisma.openDentalConnection.findFirstOrThrow({
      where: { key: "shared-clinics" },
    });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: lead.lead!.id,
      birthdate: "1985-04-12",
      verifiedCode: true,
    });
    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: lead.lead!.id,
    });
    const slotId = offered.slots[0].id;
    const results = await Promise.allSettled([
      bookOfferedSlot({
        user: wendy,
        offeredSlotId: slotId,
        patientLinkId: link.id,
        idempotencyKey: `race-a-${slotId}`,
      }),
      bookOfferedSlot({
        user: wendy,
        offeredSlotId: slotId,
        patientLinkId: link.id,
        idempotencyKey: `race-b-${slotId}`,
      }),
    ]);
    const successes = results.filter(
      (r) => r.status === "fulfilled" && (r.value.status === "booked" || r.value.status === "already_booked"),
    );
    expect(successes.length).toBeLessThanOrEqual(1);
    const mirrors = await prisma.appointmentMirror.count({
      where: { organizationId: wendy.organizationId, patientLinkId: link.id },
    });
    expect(mirrors).toBeLessThanOrEqual(1);
  });

  it("repeated client timeout uses idempotency and does not duplicate", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const lead = await ingestPublicLead(
      {
        name: "Idem Lead",
        phone: "7605558002",
        email: `idem.${Date.now()}@example.test`,
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
      },
      {},
    );
    if (!lead.ok) throw new Error("lead");
    const conn = await prisma.openDentalConnection.findFirstOrThrow({ where: { key: "shared-clinics" } });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: lead.lead!.id,
      birthdate: "1990-08-22",
      verifiedCode: true,
    });
    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: lead.lead!.id,
    });
    const key = `idem-${offered.slots[0].id}`;
    const first = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: key,
    });
    expect(first.status).toBe("booked");
    const second = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: key,
    });
    expect(second.status).toBe("already_booked");
    if (first.status === "booked" && second.status === "already_booked") {
      expect(second.externalAptNum).toBe(first.externalAptNum);
    }
  });

  it("expired slot cannot book; downtime creates AppointmentRequest without confirmation", async () => {
    resetMockOpenDentalStores();
    const wendy = await authUser("wendy@local.test");
    const yv = await prisma.location.findFirstOrThrow({ where: { key: "yucca-valley" } });
    const lead = await ingestPublicLead(
      {
        name: "Expire Lead",
        phone: "7605558003",
        email: `expire.${Date.now()}@example.test`,
        location: "yucca-valley",
        smsConsent: "yes",
        formType: "appointment",
      },
      {},
    );
    if (!lead.ok) throw new Error("lead");
    const conn = await prisma.openDentalConnection.findFirstOrThrow({ where: { key: "shared-clinics" } });
    const link = await matchPatientForLead({
      organizationId: wendy.organizationId,
      connectionId: conn.id,
      leadId: lead.lead!.id,
      verifiedCode: true,
    });
    const offered = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: lead.lead!.id,
    });
    await prisma.offeredSlot.update({
      where: { id: offered.slots[0].id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(
      bookOfferedSlot({
        user: wendy,
        offeredSlotId: offered.slots[0].id,
        patientLinkId: link.id,
        idempotencyKey: `exp-${offered.slots[0].id}`,
      }),
    ).rejects.toThrow(/expired/i);

    const offered2 = await listEligibleSlots({
      user: wendy,
      locationId: yv.id,
      categoryKey: "new_patient_exam",
      leadId: lead.lead!.id,
    });
    createMockGateway("shared-clinics").setUnavailable?.(true);
    const down = await bookOfferedSlot({
      user: wendy,
      offeredSlotId: offered2.slots[0].id,
      patientLinkId: link.id,
      idempotencyKey: `down-${offered2.slots[0].id}`,
    });
    expect(down.status).toBe("pending_confirmation");
    expect(down.confirmationGenerated).toBe(false);
    createMockGateway("shared-clinics").setUnavailable?.(false);
  });
});
