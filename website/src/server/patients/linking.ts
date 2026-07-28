import { PatientLinkState } from "@prisma/client";
import { prisma } from "../db";
import { getGatewayForConnection } from "../opendental";
import { writeAudit } from "../audit";

export async function matchPatientForLead(input: {
  organizationId: string;
  connectionId: string;
  leadId: string;
  actorUserId?: string;
  /** Explicit DOB for verification — never auto-link on name alone */
  birthdate?: string;
  verifiedCode?: boolean;
}) {
  const lead = await prisma.lead.findFirstOrThrow({
    where: { id: input.leadId, organizationId: input.organizationId },
    include: { contact: true },
  });

  const [firstName, ...rest] = lead.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;
  const gateway = await getGatewayForConnection(input.connectionId);

  const nameOnly = await gateway.findPatientCandidates({ FName: firstName, LName: lastName });

  // Never auto-link on name alone
  if (!input.birthdate && !lead.phone && !lead.email) {
    const link = await prisma.patientLink.create({
      data: {
        organizationId: input.organizationId,
        connectionId: input.connectionId,
        leadId: lead.id,
        contactId: lead.contactId,
        state: PatientLinkState.UNLINKED,
        matchCandidates: nameOnly.map((p) => ({ PatNum: p.PatNum, FName: p.FName, LName: p.LName })),
      },
    });
    return link;
  }

  const candidates = await gateway.findPatientCandidates({
    FName: firstName,
    LName: lastName,
    Birthdate: input.birthdate,
    Phone: lead.phone,
    Email: lead.email,
  });

  // If query was name-only fields effectively (no dob/phone/email match specificity beyond name)
  const strong = candidates.filter((c) => {
    const phoneMatch = lead.phone && c.WirelessPhone === lead.phone;
    const emailMatch = lead.email && (c.Email || "").toLowerCase() === lead.email.toLowerCase();
    const dobMatch = input.birthdate && c.Birthdate === input.birthdate;
    return phoneMatch || emailMatch || dobMatch;
  });

  if (nameOnly.length > 0 && strong.length === 0 && !input.birthdate) {
    const link = await prisma.patientLink.create({
      data: {
        organizationId: input.organizationId,
        connectionId: input.connectionId,
        leadId: lead.id,
        contactId: lead.contactId,
        state: PatientLinkState.MANUAL_REVIEW,
        matchCandidates: nameOnly.map((p) => ({
          PatNum: p.PatNum,
          FName: p.FName,
          LName: p.LName,
          Birthdate: p.Birthdate,
        })),
        notes: "Name-only matches — automatic link forbidden",
      },
    });
    await prisma.frontDeskTask.create({
      data: {
        organizationId: input.organizationId,
        locationId: lead.locationId,
        leadId: lead.id,
        title: "Patient match requires manual review",
        description: `${nameOnly.length} name candidates — do not auto-link`,
        type: "patient_match_review",
        priority: "high",
        status: "open",
      },
    });
    await writeAudit({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      actorType: input.actorUserId ? "human" : "system",
      action: "patient.manual_review",
      resourceType: "PatientLink",
      resourceId: link.id,
      result: "pending",
    });
    return link;
  }

  if (strong.length > 1) {
    const link = await prisma.patientLink.create({
      data: {
        organizationId: input.organizationId,
        connectionId: input.connectionId,
        leadId: lead.id,
        contactId: lead.contactId,
        state: PatientLinkState.MANUAL_REVIEW,
        matchCandidates: strong.map((p) => ({ PatNum: p.PatNum, FName: p.FName, LName: p.LName })),
      },
    });
    await prisma.frontDeskTask.create({
      data: {
        organizationId: input.organizationId,
        locationId: lead.locationId,
        leadId: lead.id,
        title: "Multiple patient matches",
        description: `${strong.length} plausible matches — choose manually`,
        type: "patient_match_review",
        priority: "high",
        status: "open",
      },
    });
    return link;
  }

  if (strong.length === 1) {
    const state = input.verifiedCode
      ? PatientLinkState.LINKED
      : PatientLinkState.VERIFICATION_REQUIRED;
    return prisma.patientLink.create({
      data: {
        organizationId: input.organizationId,
        connectionId: input.connectionId,
        leadId: lead.id,
        contactId: lead.contactId,
        state,
        externalPatNum: strong[0].PatNum,
        matchCandidates: [{ PatNum: strong[0].PatNum }],
        verifiedAt: input.verifiedCode ? new Date() : null,
      },
    });
  }

  return prisma.patientLink.create({
    data: {
      organizationId: input.organizationId,
      connectionId: input.connectionId,
      leadId: lead.id,
      contactId: lead.contactId,
      state: PatientLinkState.UNLINKED,
      matchCandidates: [],
      notes: "No Open Dental candidates — treat as new patient when booking allowed",
    },
  });
}
