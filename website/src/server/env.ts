import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const bool = (v: string | undefined, fallback: boolean) => {
  if (v === undefined || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
};

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  OPS_ENABLED: z.string().optional(),
  AUTH_MODE: z.string().optional(),
  AUTH_PRODUCTION_APPROVED: z.string().optional(),
  AUTH_SECRET: z.string().min(16),
  SESSION_TTL_HOURS: z.string().optional(),
  AUTOMATION_MODE: z.enum(["off", "observe", "draft", "supervised", "autonomous"]).optional(),
  OUTBOUND_COMMUNICATIONS_ENABLED: z.string().optional(),
  OUTBOUND_ALLOWLIST: z.string().optional(),
  OPEN_DENTAL_MODE: z.enum(["mock", "remote"]).optional(),
  OPEN_DENTAL_WRITES_ENABLED: z.string().optional(),
  OPEN_DENTAL_BASE_URL: z.string().optional(),
  OPEN_DENTAL_DEVELOPER_KEY: z.string().optional(),
  OPEN_DENTAL_CUSTOMER_KEY: z.string().optional(),
  OPEN_DENTAL_REQUEST_TIMEOUT_MS: z.string().optional(),
  AI_ENABLED: z.string().optional(),
  AI_PHI_ALLOWED: z.string().optional(),
  WORKER_EXECUTION_MODE: z.string().optional(),
  WORKER_ID: z.string().optional(),
  WORKER_LEASE_SECONDS: z.string().optional(),
  WORKER_POLL_MS: z.string().optional(),
});

export type AppEnv = {
  nodeEnv: string;
  databaseUrl: string;
  directUrl: string;
  opsEnabled: boolean;
  authMode: "local_credentials";
  authProductionApproved: boolean;
  authSecret: string;
  sessionTtlHours: number;
  automationMode: "off" | "observe" | "draft" | "supervised" | "autonomous";
  outboundCommunicationsEnabled: boolean;
  outboundAllowlist: string[];
  openDentalMode: "mock" | "remote";
  openDentalWritesEnabled: boolean;
  openDentalBaseUrl: string;
  openDentalTimeoutMs: number;
  aiEnabled: boolean;
  aiPhiAllowed: boolean;
  workerExecutionMode: string;
  workerId: string;
  workerLeaseSeconds: number;
  workerPollMs: number;
};

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  const e = parsed.data;
  const nodeEnv = e.NODE_ENV || "development";
  const opsEnabled = bool(e.OPS_ENABLED, false);
  const authProductionApproved = bool(e.AUTH_PRODUCTION_APPROVED, false);

  if (nodeEnv === "production" && opsEnabled && !authProductionApproved) {
    throw new Error(
      "Fail-closed: OPS_ENABLED=true in production requires AUTH_PRODUCTION_APPROVED=true with an owner-approved auth method.",
    );
  }

  cached = {
    nodeEnv,
    databaseUrl: e.DATABASE_URL,
    directUrl: e.DIRECT_URL || e.DATABASE_URL,
    opsEnabled,
    authMode: "local_credentials",
    authProductionApproved,
    authSecret: e.AUTH_SECRET,
    sessionTtlHours: Number(e.SESSION_TTL_HOURS || "8"),
    automationMode: e.AUTOMATION_MODE || "draft",
    outboundCommunicationsEnabled: bool(e.OUTBOUND_COMMUNICATIONS_ENABLED, false),
    outboundAllowlist: (e.OUTBOUND_ALLOWLIST || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    openDentalMode: e.OPEN_DENTAL_MODE || "mock",
    openDentalWritesEnabled: bool(e.OPEN_DENTAL_WRITES_ENABLED, false),
    openDentalBaseUrl: e.OPEN_DENTAL_BASE_URL || "",
    openDentalTimeoutMs: Number(e.OPEN_DENTAL_REQUEST_TIMEOUT_MS || "15000"),
    aiEnabled: bool(e.AI_ENABLED, false),
    aiPhiAllowed: bool(e.AI_PHI_ALLOWED, false),
    workerExecutionMode: e.WORKER_EXECUTION_MODE || "local",
    workerId: e.WORKER_ID || `worker-${randomBytes(4).toString("hex")}`,
    workerLeaseSeconds: Number(e.WORKER_LEASE_SECONDS || "60"),
    workerPollMs: Number(e.WORKER_POLL_MS || "1000"),
  };
  return cached;
}

export function resetEnvCache() {
  cached = null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// re-export for tests / callers that imported from session historically
export { hashToken as hashSessionToken };

export function newCorrelationId(): string {
  return `corr_${randomBytes(12).toString("hex")}`;
}
