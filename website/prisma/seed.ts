import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "hart-family-dental" },
    create: { name: "Hart Family Dental", slug: "hart-family-dental" },
    update: {},
  });

  const yv = await prisma.location.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "yucca-valley" } },
    create: {
      organizationId: org.id,
      key: "yucca-valley",
      name: "Hart Family Dental — Yucca Valley",
      shortName: "Yucca Valley",
      street: "56728 Twentynine Palms Highway",
      city: "Yucca Valley",
      state: "CA",
      zip: "92284",
      phone: "(760) 365-6595",
      leadNotifyEmail: "hartdentalyv@hotmail.com",
    },
    update: {},
  });

  const dhs = await prisma.location.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "desert-hot-springs" } },
    create: {
      organizationId: org.id,
      key: "desert-hot-springs",
      name: "Hart Family Dental — Desert Hot Springs",
      shortName: "Desert Hot Springs",
      street: "11523 Palm Drive",
      city: "Desert Hot Springs",
      state: "CA",
      zip: "92240",
      phone: "(760) 329-6713",
      leadNotifyEmail: "hartdental02@hotmail.com",
    },
    update: {},
  });

  const passwordHash = await bcrypt.hash("LocalDev!Wendy2026", 12);
  const ownerHash = await bcrypt.hash("LocalDev!Owner2026", 12);
  const adminHash = await bcrypt.hash("LocalDev!Admin2026", 12);
  const readonlyHash = await bcrypt.hash("LocalDev!Read2026", 12);

  async function upsertUser(email: string, name: string, role: Role, hash: string, locations: string[]) {
    const user = await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email } },
      create: {
        organizationId: org.id,
        email,
        name,
        role,
        passwordHash: hash,
        active: true,
      },
      update: { name, role, passwordHash: hash, active: true },
    });
    for (const locId of locations) {
      await prisma.userLocationAccess.upsert({
        where: { userId_locationId: { userId: user.id, locationId: locId } },
        create: { userId: user.id, locationId: locId },
        update: {},
      });
    }
    return user;
  }

  await upsertUser("owner@local.test", "Synthetic Owner", "Owner", ownerHash, [yv.id, dhs.id]);
  await upsertUser("lindsay@local.test", "Lindsay Hawkins (synthetic)", "Administrator", adminHash, [
    yv.id,
    dhs.id,
  ]);
  const wendy = await upsertUser(
    "wendy@local.test",
    "Wendy Delgado (synthetic)",
    "FrontDesk",
    passwordHash,
    [yv.id, dhs.id],
  );
  await upsertUser("readonly@local.test", "Read Only (synthetic)", "ReadOnly", readonlyHash, [yv.id]);
  // Front desk limited to YV only — for location isolation tests
  await upsertUser(
    "yv-only@local.test",
    "YV Only Desk (synthetic)",
    "FrontDesk",
    await bcrypt.hash("LocalDev!YvOnly2026", 12),
    [yv.id],
  );

  void wendy;

  // Shared DB + clinics connection (config A)
  const shared = await prisma.openDentalConnection.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "shared-clinics" } },
    create: {
      organizationId: org.id,
      key: "shared-clinics",
      name: "Shared Open Dental (Clinics)",
      mode: "mock",
      officeVersion: "mock-24.0",
    },
    update: { mode: "mock" },
  });

  // Separate connections (config B)
  const yvConn = await prisma.openDentalConnection.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "yv-separate" } },
    create: {
      organizationId: org.id,
      key: "yv-separate",
      name: "Yucca Valley Separate DB",
      mode: "mock",
    },
    update: {},
  });
  const dhsConn = await prisma.openDentalConnection.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "dhs-separate" } },
    create: {
      organizationId: org.id,
      key: "dhs-separate",
      name: "Desert Hot Springs Separate DB",
      mode: "mock",
    },
    update: {},
  });

  await prisma.openDentalClinicMapping.upsert({
    where: { connectionId_locationId: { connectionId: shared.id, locationId: yv.id } },
    create: {
      connectionId: shared.id,
      locationId: yv.id,
      externalClinicId: "1",
      name: "YV Clinic",
    },
    update: { externalClinicId: "1" },
  });
  await prisma.openDentalClinicMapping.upsert({
    where: { connectionId_locationId: { connectionId: shared.id, locationId: dhs.id } },
    create: {
      connectionId: shared.id,
      locationId: dhs.id,
      externalClinicId: "2",
      name: "DHS Clinic",
    },
    update: { externalClinicId: "2" },
  });

  await prisma.integrationHealth.upsert({
    where: { connectionId: shared.id },
    create: { connectionId: shared.id, status: "healthy", lastSuccessAt: new Date() },
    update: { status: "healthy", lastSuccessAt: new Date() },
  });
  await prisma.capabilityMatrix.upsert({
    where: { connectionId: shared.id },
    create: {
      connectionId: shared.id,
      officeVersion: "mock-24.0",
      endpoints: {
        clinics: true,
        providers: true,
        operatories: true,
        appointments: true,
        patients: true,
        slots: true,
      },
      lastSmokeAt: new Date(),
    },
    update: {},
  });

  const categories = [
    ["new_patient_exam", "New patient exam", "New patient exam"],
    ["hygiene_recall", "Hygiene or recall", "Hygiene / recall visit"],
    ["emergency_request", "Emergency appointment request", "Urgent dental concern"],
    ["implant_consult", "Implant consultation", "Dental implant consultation"],
    ["aligner_consult", "Clear-aligner consultation", "Clear aligner consultation"],
    ["cosmetic_consult", "Cosmetic consultation", "Cosmetic dentistry consultation"],
    ["treatment_followup", "Existing treatment follow-up", "Treatment follow-up"],
    ["other_staff_review", "Other or staff review", "Other — staff will review"],
  ] as const;

  for (const [key, internalName, patientFacingName] of categories) {
    await prisma.appointmentCategory.upsert({
      where: { organizationId_key: { organizationId: org.id, key } },
      create: {
        organizationId: org.id,
        key,
        internalName,
        patientFacingName,
        durationMinutes: key === "emergency_request" ? 30 : 60,
        autoBook: false,
        requiresHumanApproval: true,
        active: false,
      },
      update: { autoBook: false, active: false, requiresHumanApproval: true },
    });
  }

  const newPatient = await prisma.appointmentCategory.findUniqueOrThrow({
    where: { organizationId_key: { organizationId: org.id, key: "new_patient_exam" } },
  });

  // Synthetic scheduling rules for staff-supervised mock booking (active for ops testing; autoBook still false)
  for (const loc of [yv, dhs]) {
    const existing = await prisma.schedulingRule.findFirst({
      where: { organizationId: org.id, locationId: loc.id, categoryId: newPatient.id },
    });
    const data = {
      organizationId: org.id,
      locationId: loc.id,
      connectionId: shared.id,
      categoryId: newPatient.id,
      externalClinicId: loc.key === "yucca-valley" ? "1" : "2",
      durationMinutes: 60,
      pattern: "XXXXXXXXXXXX",
      minNoticeMinutes: 120,
      maxDaysAhead: 21,
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      timeWindows: [
        { start: "08:00", end: "16:00" },
        { start: "09:00", end: "14:00" },
      ],
      dailyCap: 8,
      requiredFields: ["name", "phone", "email"],
      requiresHumanApproval: true,
      autoBook: false,
      active: true,
    };
    if (existing) {
      await prisma.schedulingRule.update({ where: { id: existing.id }, data });
    } else {
      await prisma.schedulingRule.create({ data });
    }
  }

  // Safety defaults
  await prisma.featureFlag.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "emergency_stop" } },
    create: {
      organizationId: org.id,
      key: "emergency_stop",
      enabled: false,
      description: "Global kill switch",
    },
    update: {},
  });
  await prisma.featureFlag.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "workflow:new_lead_response" } },
    create: {
      organizationId: org.id,
      key: "workflow:new_lead_response",
      enabled: true,
      description: "New lead response workflow (draft mode)",
    },
    update: { enabled: true },
  });

  const modeExisting = await prisma.systemSetting.findFirst({
    where: { organizationId: org.id, key: "automation_mode", locationId: null },
  });
  if (modeExisting) {
    await prisma.systemSetting.update({
      where: { id: modeExisting.id },
      data: { value: { mode: "draft" } },
    });
  } else {
    await prisma.systemSetting.create({
      data: { organizationId: org.id, key: "automation_mode", value: { mode: "draft" } },
    });
  }

  const capsExisting = await prisma.systemSetting.findFirst({
    where: { organizationId: org.id, key: "daily_caps", locationId: null },
  });
  if (!capsExisting) {
    await prisma.systemSetting.create({
      data: { organizationId: org.id, key: "daily_caps", value: { actions: 50, messages: 25 } },
    });
  }

  await prisma.messageTemplate.upsert({
    where: {
      organizationId_key_version: { organizationId: org.id, key: "new_lead_first_response", version: 1 },
    },
    create: {
      organizationId: org.id,
      key: "new_lead_first_response",
      name: "New lead first response",
      channel: "sms",
      purpose: "appointment_administration",
      body: "Hello {{name}}, thank you for contacting Hart Family Dental. A team member will follow up shortly. Reply STOP to opt out.",
      status: "draft",
      version: 1,
    },
    update: { status: "draft" },
  });

  console.info("Seed complete", {
    org: org.slug,
    locations: [yv.key, dhs.key],
    connections: [shared.key, yvConn.key, dhsConn.key],
    syntheticUsers: [
      "owner@local.test",
      "lindsay@local.test",
      "wendy@local.test",
      "readonly@local.test",
      "yv-only@local.test",
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
