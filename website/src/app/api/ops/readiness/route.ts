import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/session";
import { canManageSafety, canViewIntegrations } from "@/server/authz/roles";
import { getRuntimeFlags, isStagingEnv } from "@/server/env";
import { prisma } from "@/server/db";
import { listUnresolvedMappings } from "@/server/opendental/mappingQueue";
import { getOrganizationId, isEmergencyStopped } from "@/server/safety/controls";

export const dynamic = "force-dynamic";

/**
 * Authenticated environment-health snapshot for Ops / monitoring.
 * Never returns secrets or PHI.
 */
export async function GET() {
  let user;
  try {
    user = await requireAuthUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!canViewIntegrations(user.role) && !canManageSafety(user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const flags = getRuntimeFlags();
  const orgId = await getOrganizationId();
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const [deadLetters, mappingGaps, emergencyStop, healthRows] = await Promise.all([
    prisma.job.count({ where: { organizationId: orgId, status: "dead_letter" } }),
    listUnresolvedMappings(orgId),
    isEmergencyStopped(orgId),
    prisma.integrationHealth.findMany({
      where: { connection: { organizationId: orgId } },
      select: {
        status: true,
        consecutiveFailures: true,
        lastErrorSummary: true,
        lastSuccessAt: true,
        circuitOpenUntil: true,
        connection: { select: { key: true } },
      },
    }),
  ]);

  return NextResponse.json({
    appEnv: flags.appEnv,
    staging: isStagingEnv(),
    database: dbOk ? "ok" : "unavailable",
    emergencyStop,
    flags: {
      growthOsPlatformEnabled: flags.growthOsPlatformEnabled,
      opsEnabled: flags.opsEnabled,
      authMode: flags.authMode,
      openDentalMode: flags.openDentalMode,
      openDentalWritesAllowed: flags.openDentalWritesAllowed,
      outboundCommunicationsEnabled: flags.outboundCommunicationsEnabled,
      aiEnabled: flags.aiEnabled,
    },
    deadLetterJobs: deadLetters,
    unresolvedMappingCount: mappingGaps.length,
    integrations: healthRows.map((h) => ({
      connectionKey: h.connection.key,
      status: h.status,
      consecutiveFailures: h.consecutiveFailures,
      lastSuccessAt: h.lastSuccessAt,
      circuitOpenUntil: h.circuitOpenUntil,
      lastErrorSummary: h.lastErrorSummary,
    })),
  });
}
