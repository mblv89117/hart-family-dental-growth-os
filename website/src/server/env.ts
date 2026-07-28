import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const bool = (v: string | undefined, fallback: boolean) => {
  if (v === undefined || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
};

export type AuthMode = "local_credentials" | "oidc" | "oauth" | "magic_link" | "passkey" | "disabled";

export type AppDeploymentEnv = "development" | "test" | "staging" | "production";

export type OpenDentalMode = "mock" | "remote" | "remote_readonly";

export type RuntimeFlags = {
  nodeEnv: string;
  /** Logical deployment environment (APP_ENV). Staging shows ops banners and forbids local_credentials when hosted. */
  appEnv: AppDeploymentEnv;
  growthOsPlatformEnabled: boolean;
  opsEnabled: boolean;
  authMode: AuthMode;
  authProductionApproved: boolean;
  automationMode: "off" | "observe" | "draft" | "supervised" | "autonomous";
  outboundCommunicationsEnabled: boolean;
  outboundAllowlist: string[];
  openDentalMode: OpenDentalMode;
  openDentalWritesEnabled: boolean;
  /** False in remote_readonly; otherwise mirrors OPEN_DENTAL_WRITES_ENABLED for remote mode. */
  openDentalWritesAllowed: boolean;
  aiEnabled: boolean;
  aiPhiAllowed: boolean;
};

export type PlatformEnv = RuntimeFlags & {
  databaseUrl: string;
  directUrl: string;
  authSecret: string;
  sessionTtlHours: number;
  openDentalBaseUrl: string;
  openDentalTimeoutMs: number;
  workerExecutionMode: string;
  workerId: string;
  workerLeaseSeconds: number;
  workerPollMs: number;
};

/** @deprecated Prefer getRuntimeFlags / getPlatformEnv — kept for call sites during transition */
export type AppEnv = PlatformEnv;

let flagsCache: RuntimeFlags | null = null;
let platformCache: PlatformEnv | null = null;

function parseAuthMode(raw: string | undefined): AuthMode {
  const v = (raw || "local_credentials").toLowerCase();
  const allowed: AuthMode[] = ["local_credentials", "oidc", "oauth", "magic_link", "passkey", "disabled"];
  if (allowed.includes(v as AuthMode)) return v as AuthMode;
  throw new Error(`Invalid AUTH_MODE: ${raw}`);
}

function parseAppEnv(raw: string | undefined, nodeEnv: string): AppDeploymentEnv {
  const v = (raw || "").toLowerCase();
  if (v === "staging" || v === "production" || v === "test" || v === "development") return v;
  if (nodeEnv === "test") return "test";
  if (nodeEnv === "production") return "production";
  return "development";
}

function parseOpenDentalMode(raw: string | undefined): OpenDentalMode {
  const v = (raw || "mock").toLowerCase();
  if (v === "remote_readonly" || v === "remote-readonly") return "remote_readonly";
  if (v === "remote") return "remote";
  return "mock";
}

/**
 * Lightweight flags safe to read without DATABASE_URL / AUTH_SECRET.
 * Used by public lead routing and middleware-adjacent checks.
 */
export function getRuntimeFlags(): RuntimeFlags {
  if (flagsCache) return flagsCache;
  const nodeEnv = process.env.NODE_ENV || "development";
  const appEnv = parseAppEnv(process.env.APP_ENV, nodeEnv);
  const growthOsPlatformEnabled = bool(process.env.GROWTH_OS_PLATFORM_ENABLED, false);
  const opsEnabled = bool(process.env.OPS_ENABLED, false);
  const authMode = parseAuthMode(process.env.AUTH_MODE);
  const authProductionApproved = bool(process.env.AUTH_PRODUCTION_APPROVED, false);
  const openDentalMode = parseOpenDentalMode(process.env.OPEN_DENTAL_MODE);
  const openDentalWritesEnabled = bool(process.env.OPEN_DENTAL_WRITES_ENABLED, false);
  // remote_readonly hard-blocks writes even if OPEN_DENTAL_WRITES_ENABLED=true
  const openDentalWritesAllowed =
    openDentalMode === "remote_readonly"
      ? false
      : openDentalMode === "remote"
        ? openDentalWritesEnabled
        : true; // mock is synthetic; booking still checks the writes flag separately

  // Hosted staging/production ops must never use local_credentials or disabled.
  const hostedOps = opsEnabled && (appEnv === "production" || appEnv === "staging" || nodeEnv === "production");
  if (hostedOps) {
    if (authMode === "local_credentials" || authMode === "disabled") {
      throw new Error(
        "Fail-closed: hosted staging/production OPS_ENABLED cannot use AUTH_MODE=local_credentials or disabled.",
      );
    }
    if (appEnv === "production" || nodeEnv === "production") {
      if (!authProductionApproved) {
        throw new Error(
          "Fail-closed: OPS_ENABLED=true in production requires AUTH_PRODUCTION_APPROVED=true and a supported production auth provider.",
        );
      }
    }
    if (!["oidc", "oauth", "magic_link", "passkey"].includes(authMode)) {
      throw new Error(`Fail-closed: unsupported hosted AUTH_MODE=${authMode}`);
    }
    // Hosted MFA providers are registered but not yet wired (see auth/providers.ts).
    // Fail closed until OIDC (or approved alternate) is implemented.
    throw new Error(
      `Fail-closed: hosted staff authentication AUTH_MODE=${authMode} is not implemented yet. Complete OIDC+MFA wiring before enabling OPS in staging/production.`,
    );
  }

  flagsCache = {
    nodeEnv,
    appEnv,
    growthOsPlatformEnabled,
    opsEnabled,
    authMode,
    authProductionApproved,
    automationMode: (process.env.AUTOMATION_MODE as RuntimeFlags["automationMode"]) || "draft",
    outboundCommunicationsEnabled: bool(process.env.OUTBOUND_COMMUNICATIONS_ENABLED, false),
    outboundAllowlist: (process.env.OUTBOUND_ALLOWLIST || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    openDentalMode,
    openDentalWritesEnabled,
    openDentalWritesAllowed,
    aiEnabled: bool(process.env.AI_ENABLED, false),
    aiPhiAllowed: bool(process.env.AI_PHI_ALLOWED, false),
  };
  return flagsCache;
}

export function isStagingEnv(): boolean {
  try {
    return getRuntimeFlags().appEnv === "staging";
  } catch {
    return (process.env.APP_ENV || "").toLowerCase() === "staging";
  }
}

/** Whether Open Dental remote API writes may proceed for the current mode/flags. */
export function areOpenDentalWritesAllowed(): boolean {
  return getRuntimeFlags().openDentalWritesAllowed;
}

export function isPlatformEnabled(): boolean {
  return bool(process.env.GROWTH_OS_PLATFORM_ENABLED, false);
}

export function isOpsEnabled(): boolean {
  return bool(process.env.OPS_ENABLED, false);
}

/**
 * Full platform environment. Requires DATABASE_URL and AUTH_SECRET.
 * Only call when GROWTH_OS_PLATFORM_ENABLED or OPS_ENABLED paths need them.
 */
export function getPlatformEnv(): PlatformEnv {
  if (platformCache) return platformCache;
  const flags = getRuntimeFlags();

  if (!flags.growthOsPlatformEnabled && !flags.opsEnabled) {
    // Still allow explicit platform env load in worker/tests that set vars
  }

  const schema = z.object({
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().optional(),
    AUTH_SECRET: z.string().min(16),
    SESSION_TTL_HOURS: z.string().optional(),
    OPEN_DENTAL_BASE_URL: z.string().optional(),
    OPEN_DENTAL_REQUEST_TIMEOUT_MS: z.string().optional(),
    WORKER_EXECUTION_MODE: z.string().optional(),
    WORKER_ID: z.string().optional(),
    WORKER_LEASE_SECONDS: z.string().optional(),
    WORKER_POLL_MS: z.string().optional(),
  });
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid platform environment: ${parsed.error.message}`);
  }
  const e = parsed.data;
  platformCache = {
    ...flags,
    databaseUrl: e.DATABASE_URL,
    directUrl: e.DIRECT_URL || e.DATABASE_URL,
    authSecret: e.AUTH_SECRET,
    sessionTtlHours: Number(e.SESSION_TTL_HOURS || "8"),
    openDentalBaseUrl: e.OPEN_DENTAL_BASE_URL || "",
    openDentalTimeoutMs: Number(e.OPEN_DENTAL_REQUEST_TIMEOUT_MS || "15000"),
    workerExecutionMode: e.WORKER_EXECUTION_MODE || "local",
    workerId: e.WORKER_ID || `worker-${randomBytes(4).toString("hex")}`,
    workerLeaseSeconds: Number(e.WORKER_LEASE_SECONDS || "60"),
    workerPollMs: Number(e.WORKER_POLL_MS || "1000"),
  };
  return platformCache;
}

/** Alias used by existing call sites — requires platform secrets. */
export function getEnv(): PlatformEnv {
  return getPlatformEnv();
}

export function resetEnvCache() {
  flagsCache = null;
  platformCache = null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newCorrelationId(): string {
  return `corr_${randomBytes(12).toString("hex")}`;
}

/** Assert ops may start given current env — throws if fail-closed. */
export function assertOpsMayStart(): void {
  if (!isOpsEnabled()) {
    throw new Error("OPS_ENABLED=false");
  }
  getRuntimeFlags(); // enforces production auth rules
  getPlatformEnv(); // requires secrets when ops is on
}
