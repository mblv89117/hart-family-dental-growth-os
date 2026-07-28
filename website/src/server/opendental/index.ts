import { prisma } from "../db";
import { getEnv } from "../env";
import { createMockGateway } from "./mockGateway";
import { createRemoteGateway } from "./remoteGateway";
import type { OpenDentalGateway } from "./types";

export type { OpenDentalGateway } from "./types";
export { resetMockOpenDentalStores } from "./mockGateway";
export { findRecentMatchingAppointment } from "./mockGateway";

export async function getGatewayForConnection(connectionId: string): Promise<OpenDentalGateway> {
  const conn = await prisma.openDentalConnection.findUniqueOrThrow({ where: { id: connectionId } });
  const mode = conn.mode || getEnv().openDentalMode;

  if (mode === "mock" || getEnv().openDentalMode === "mock") {
    return createMockGateway(conn.key);
  }

  const developerKey = conn.developerKeyEnv
    ? process.env[conn.developerKeyEnv] || ""
    : process.env.OPEN_DENTAL_DEVELOPER_KEY || "";
  const customerKey = conn.customerKeyEnv
    ? process.env[conn.customerKeyEnv] || ""
    : process.env.OPEN_DENTAL_CUSTOMER_KEY || "";
  const baseUrl = conn.baseUrl || process.env.OPEN_DENTAL_BASE_URL || "";

  if (!baseUrl || !developerKey || !customerKey) {
    throw new Error(`Open Dental remote credentials not configured for connection ${conn.key}`);
  }

  return createRemoteGateway({
    connectionKey: conn.key,
    baseUrl,
    developerKey,
    customerKey,
  });
}

export async function getGatewayByKey(organizationId: string, key: string): Promise<OpenDentalGateway> {
  const conn = await prisma.openDentalConnection.findUniqueOrThrow({
    where: { organizationId_key: { organizationId, key } },
  });
  return getGatewayForConnection(conn.id);
}

export async function recordWebhookOnce(input: {
  organizationId: string;
  source: string;
  externalEventId: string;
  payloadHash: string;
}): Promise<{ duplicate: boolean }> {
  try {
    await prisma.webhookEvent.create({
      data: {
        organizationId: input.organizationId,
        source: input.source,
        externalEventId: input.externalEventId,
        payloadHash: input.payloadHash,
        processedAt: new Date(),
      },
    });
    return { duplicate: false };
  } catch {
    return { duplicate: true };
  }
}
