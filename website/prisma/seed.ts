import "dotenv/config";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

function requireDevSeed(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error(
      "Refusing to seed synthetic users in production. Set ALLOW_PRODUCTION_SEED=true only for controlled non-PHI bootstrap (still never use local_credentials in production ops).",
    );
  }
}

function passwordFromEnvOrGenerate(envKey: string): { password: string; generated: boolean } {
  const fromEnv = process.env[envKey];
  if (fromEnv && fromEnv.length >= 12) {
    return { password: fromEnv, generated: false };
  }
  const password = `Dev_${randomBytes(18).toString("base64url")}`;
  return { password, generated: true };
}

async function main() {
  requireDevSeed();

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
      phone: "(760) 389-7707",
      leadNotifyEmail: "hartdentalyv@hotmail.com",
    },
    update: {
      phone: "(760) 389-7707",
    },
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
      phone: "(760) 314-4160",
      leadNotifyEmail: "hartdental02@hotmail.com",
    },
    update: {
      phone: "(760) 314-4160",
    },
  });

  const wendyPw = passwordFromEnvOrGenerate("DEV_SEED_WENDY_PASSWORD");
  const ownerPw = passwordFromEnvOrGenerate("DEV_SEED_OWNER_PASSWORD");
  const adminPw = passwordFromEnvOrGenerate("DEV_SEED_LINDSAY_PASSWORD");
  const readPw = passwordFromEnvOrGenerate("DEV_SEED_READONLY_PASSWORD");
  const yvOnlyPw = passwordFromEnvOrGenerate("DEV_SEED_YVONLY_PASSWORD");

  const printed: Array<{ email: string; password: string; generated: boolean }> = [];

  async function upsertUser(
    email: string,
    name: string,
    role: Role,
    password: string,
    generated: boolean,
    locations: string[],
  ) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email } },
      create: {
        organizationId: org.id,
        email,
        name,
        role,
        passwordHash,
        active: true,
      },
      update: { name, role, passwordHash, active: true },
    });
    for (const locId of locations) {
      await prisma.userLocationAccess.upsert({
        where: { userId_locationId: { userId: user.id, locationId: locId } },
        create: { userId: user.id, locationId: locId },
        update: {},
      });
    }
    printed.push({ email, password, generated });
    return user;
  }

  await upsertUser("owner@local.test", "Synthetic Owner", "Owner", ownerPw.password, ownerPw.generated, [
    yv.id,
    dhs.id,
  ]);
  await upsertUser(
    "lindsay@local.test",
    "Lindsay Hawkins (synthetic)",
    "Administrator",
    adminPw.password,
    adminPw.generated,
    [yv.id, dhs.id],
  );
  await upsertUser(
    "wendy@local.test",
    "Wendy Delgado (synthetic)",
    "FrontDesk",
    wendyPw.password,
    wendyPw.generated,
    [yv.id, dhs.id],
  );
  await upsertUser(
    "readonly@local.test",
    "Read Only (synthetic)",
    "ReadOnly",
    readPw.password,
    readPw.generated,
    [yv.id],
  );
  await upsertUser(
    "yv-only@local.test",
    "YV Only Desk (synthetic)",
    "FrontDesk",
    yvOnlyPw.password,
    yvOnlyPw.generated,
    [yv.id],
  );

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
    syntheticUsers: printed.map((p) => p.email),
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("——— Synthetic login credentials (local/dev only — do not commit) ———");
    for (const p of printed) {
      console.info(
        `${p.email}  password=${p.password}${p.generated ? "  (generated — set DEV_SEED_*_PASSWORD to pin)" : "  (from env)"}`,
      );
    }
    console.info("———————————————————————————————————————————————————————————————");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
