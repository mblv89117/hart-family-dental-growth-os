import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "../db";
import { newCorrelationId } from "../env";
import { recordConsent } from "../compliance/consent";
import { writeAudit } from "../audit";

export const publicLeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(120),
  location: z.enum(["yucca-valley", "desert-hot-springs"]),
  service: z.string().trim().max(80).optional().default(""),
  followUp: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  smsConsent: z.union([z.literal("yes"), z.literal("no"), z.boolean()]),
  emailConsent: z.union([z.literal("yes"), z.literal("no"), z.boolean()]).optional(),
  formType: z.string().trim().max(80).optional().default("appointment"),
  goals: z.string().trim().max(200).optional().default(""),
  priorOrtho: z.string().trim().max(80).optional().default(""),
  dentalVisit: z.string().trim().max(80).optional().default(""),
  concerns: z.string().trim().max(500).optional().default(""),
  companyWebsite: z.string().trim().max(80).optional().default(""),
  pagePath: z.string().trim().max(120).optional().default(""),
  utm_source: z.string().trim().max(80).optional().default(""),
  utm_medium: z.string().trim().max(80).optional().default(""),
  utm_campaign: z.string().trim().max(120).optional().default(""),
  utm_content: z.string().trim().max(120).optional().default(""),
  utm_term: z.string().trim().max(120).optional().default(""),
  gclid: z.string().trim().max(120).optional().default(""),
  fbclid: z.string().trim().max(120).optional().default(""),
  referrer: z.string().trim().max(500).optional().default(""),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;

function yes(v: unknown) {
  return v === true || v === "yes";
}

function fingerprint(input: {
  email: string;
  phone: string;
  location: string;
  formType: string;
  message: string;
}) {
  return createHash("sha256")
    .update(
      [
        input.email.toLowerCase(),
        input.phone.replace(/\D/g, ""),
        input.location,
        input.formType,
        input.message.slice(0, 80),
      ].join("|"),
    )
    .digest("hex");
}

export async function ingestPublicLead(raw: unknown, meta: { userAgent?: string; ipAddress?: string }) {
  const parsed = publicLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const body = parsed.data;
  if (body.companyWebsite) {
    return {
      ok: true as const,
      status: 200,
      payload: { ok: true, id: `lead_spam_${Date.now()}`, emailDelivered: false },
      spam: true,
    };
  }
  if (!yes(body.smsConsent)) {
    return { ok: false as const, status: 400, error: "SMS consent is required for appointment follow-up." };
  }

  const org = await prisma.organization.findUnique({ where: { slug: "hart-family-dental" } });
  if (!org) {
    return { ok: false as const, status: 503, error: "Service temporarily unavailable." };
  }
  const location = await prisma.location.findUnique({
    where: { organizationId_key: { organizationId: org.id, key: body.location } },
  });
  if (!location) {
    return { ok: false as const, status: 400, error: "Preferred office is required." };
  }

  const fp = fingerprint({
    email: body.email,
    phone: body.phone,
    location: body.location,
    formType: body.formType,
    message: body.message,
  });
  const windowStart = new Date(Date.now() - 10 * 60 * 1000);
  const recentDup = await prisma.lead.findFirst({
    where: {
      organizationId: org.id,
      email: body.email.toLowerCase(),
      phone: body.phone,
      locationId: location.id,
      formType: body.formType,
      receivedAt: { gte: windowStart },
    },
    orderBy: { receivedAt: "desc" },
  });

  const correlationId = newCorrelationId();
  const wendy = await prisma.user.findFirst({
    where: { organizationId: org.id, email: "wendy@local.test" },
  });

  if (recentDup) {
    await writeAudit({
      organizationId: org.id,
      locationId: location.id,
      actorType: "system",
      action: "lead.duplicate_suppressed",
      resourceType: "Lead",
      resourceId: recentDup.id,
      result: "success",
      correlationId,
      nextSafe: { fingerprint: fp.slice(0, 12) },
    });
    return {
      ok: true as const,
      status: 200,
      payload: {
        ok: true,
        id: recentDup.id,
        notifyInbox: location.leadNotifyEmail,
        recipients: [location.leadNotifyEmail],
        emailDelivered: false,
        deliveries: [],
        duplicate: true,
      },
      lead: recentDup,
      location,
      org,
      correlationId,
      skipNotify: true,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        organizationId: org.id,
        locationId: location.id,
        displayName: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone,
      },
    });

    const conversation = await tx.conversation.create({
      data: {
        organizationId: org.id,
        subject: `Web lead — ${body.service || body.formType}`,
        channel: "web",
        status: "open",
        priority: "high",
        participants: {
          create: { contactId: contact.id, role: "patient" },
        },
      },
    });

    const lead = await tx.lead.create({
      data: {
        organizationId: org.id,
        locationId: location.id,
        externalKey: fp,
        formType: body.formType,
        name: body.name,
        phone: body.phone,
        email: body.email.toLowerCase(),
        service: body.service || null,
        followUp: body.followUp || null,
        message: body.message || null,
        smsConsent: true,
        emailConsent: yes(body.emailConsent),
        goals: body.goals || null,
        priorOrtho: body.priorOrtho || null,
        dentalVisit: body.dentalVisit || null,
        concerns: body.concerns || null,
        ownerName: "Wendy Delgado",
        contactId: contact.id,
        conversationId: conversation.id,
        attribution: {
          create: {
            pagePath: body.pagePath || null,
            utmSource: body.utm_source || null,
            utmMedium: body.utm_medium || null,
            utmCampaign: body.utm_campaign || null,
            utmContent: body.utm_content || null,
            utmTerm: body.utm_term || null,
            gclid: body.gclid || null,
            fbclid: body.fbclid || null,
            referrer: body.referrer || null,
            userAgent: meta.userAgent?.slice(0, 200) || null,
          },
        },
      },
    });

    await tx.outboxEvent.create({
      data: {
        organizationId: org.id,
        type: "lead.created",
        payload: { leadId: lead.id, locationId: location.id, contactId: contact.id },
        correlationId,
      },
    });

    await tx.domainEvent.create({
      data: {
        organizationId: org.id,
        type: "lead.created",
        payload: { leadId: lead.id },
        correlationId,
      },
    });

    await tx.frontDeskTask.create({
      data: {
        organizationId: org.id,
        locationId: location.id,
        leadId: lead.id,
        conversationId: conversation.id,
        assigneeId: wendy?.id,
        title: `New web lead: ${body.name}`,
        description: `Service interest: ${body.service || "unspecified"}. Respond within SLA.`,
        type: "new_lead",
        priority: "high",
        status: "open",
      },
    });

    await tx.message.create({
      data: {
        organizationId: org.id,
        conversationId: conversation.id,
        contactId: contact.id,
        channel: "web",
        direction: "inbound",
        purpose: "lead_intake",
        contentHash: createHash("sha256").update(body.message || "").digest("hex"),
        bodyPreview: (body.message || "Appointment request").slice(0, 120),
        status: "received",
        actorType: "patient",
      },
    });

    return { lead, contact, conversation };
  });

  await recordConsent({
    organizationId: org.id,
    leadId: result.lead.id,
    contactId: result.contact.id,
    channel: "sms",
    purpose: "appointment_administration",
    source: "website_form",
    granted: true,
    languageVersion: "web-form-v1",
    ipAddress: meta.ipAddress,
  });
  if (yes(body.emailConsent)) {
    await recordConsent({
      organizationId: org.id,
      leadId: result.lead.id,
      contactId: result.contact.id,
      channel: "email",
      purpose: "appointment_administration",
      source: "website_form",
      granted: true,
      languageVersion: "web-form-v1",
      ipAddress: meta.ipAddress,
    });
  }

  await writeAudit({
    organizationId: org.id,
    locationId: location.id,
    actorType: "system",
    action: "lead.created",
    resourceType: "Lead",
    resourceId: result.lead.id,
    result: "success",
    correlationId,
  });

  return {
    ok: true as const,
    status: 200,
    lead: result.lead,
    contact: result.contact,
    location,
    org,
    correlationId,
    skipNotify: false,
    payload: {
      ok: true,
      id: result.lead.id,
      notifyInbox: location.leadNotifyEmail,
      recipients: [location.leadNotifyEmail] as string[],
      emailDelivered: false as boolean,
      deliveries: [] as Array<{ channel: string; ok: boolean; detail: string }>,
    },
  };
}
