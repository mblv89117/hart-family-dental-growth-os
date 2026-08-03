import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRemoteGateway } from "@/server/opendental/remoteGateway";
import {
  areOpenDentalWritesAllowed,
  getRuntimeFlags,
  resetEnvCache,
} from "@/server/env";
import { getAuthProviderCapability, assertHostedAuthReady } from "@/server/auth/providers";
import {
  createPatientEmailProvider,
  createPatientSmsProvider,
} from "@/server/messaging/patientProviders";
import { canAccessOps, canManageSafety, canWriteSchedulingConfig, canManageLeads } from "@/server/authz/roles";
import { emitAlert } from "@/server/alerting";
import { scrubForLog } from "@/server/logging";

describe("production-readiness: remote_readonly and hosted guards", () => {
  const envKeys = [
    "OPEN_DENTAL_MODE",
    "OPEN_DENTAL_WRITES_ENABLED",
    "AUTH_MODE",
    "NODE_ENV",
    "OPS_ENABLED",
    "APP_ENV",
    "AUTH_PRODUCTION_APPROVED",
    "OUTBOUND_COMMUNICATIONS_ENABLED",
    "DATABASE_URL",
    "AUTH_SECRET",
  ] as const;
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of envKeys) snapshot[k] = process.env[k];
    resetEnvCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    for (const k of envKeys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else (process.env as Record<string, string | undefined>)[k] = snapshot[k];
    }
    resetEnvCache();
  });

  it("parses OPEN_DENTAL_MODE=remote_readonly and blocks writes even when writes flag is true", async () => {
    process.env.OPEN_DENTAL_MODE = "remote_readonly";
    process.env.OPEN_DENTAL_WRITES_ENABLED = "true";
    process.env.AUTH_MODE = "local_credentials";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    delete process.env.OPS_ENABLED;
    delete process.env.APP_ENV;
    process.env.DATABASE_URL = "postgresql://hfd:hfd@127.0.0.1:5432/hfd_growth_os_test";
    process.env.AUTH_SECRET = "test-auth-secret-min-32-characters!!";
    resetEnvCache();

    const flags = getRuntimeFlags();
    expect(flags.openDentalMode).toBe("remote_readonly");
    expect(flags.openDentalWritesEnabled).toBe(true);
    expect(areOpenDentalWritesAllowed()).toBe(false);

    const gw = createRemoteGateway({
      connectionKey: "test-readonly",
      baseUrl: "https://example.test/api/v1",
      developerKey: "dev",
      customerKey: "cust",
      readOnly: true,
    });

    await expect(
      gw.createAppointment({
        PatNum: "1",
        AptDateTime: new Date().toISOString(),
      }),
    ).rejects.toThrow(/remote_readonly/);
    await expect(gw.updateAppointment("1", { Note: "x" })).rejects.toThrow(/remote_readonly/);
    await expect(gw.confirmAppointment("1")).rejects.toThrow(/remote_readonly/);
    await expect(gw.addAppointmentNote("1", "note")).rejects.toThrow(/remote_readonly/);
  });

  it("blocks remote writes when OPEN_DENTAL_WRITES_ENABLED=false", async () => {
    process.env.OPEN_DENTAL_MODE = "remote";
    process.env.OPEN_DENTAL_WRITES_ENABLED = "false";
    process.env.AUTH_MODE = "local_credentials";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    delete process.env.APP_ENV;
    process.env.DATABASE_URL = "postgresql://hfd:hfd@127.0.0.1:5432/hfd_growth_os_test";
    process.env.AUTH_SECRET = "test-auth-secret-min-32-characters!!";
    resetEnvCache();

    expect(areOpenDentalWritesAllowed()).toBe(false);
    const gw = createRemoteGateway({
      connectionKey: "test-remote",
      baseUrl: "https://example.test/api/v1",
      developerKey: "dev",
      customerKey: "cust",
    });
    await expect(
      gw.createAppointment({ PatNum: "1", AptDateTime: new Date().toISOString() }),
    ).rejects.toThrow(/writes are disabled/i);
  });

  it("rejects local_credentials for APP_ENV=staging when OPS is enabled", () => {
    process.env.APP_ENV = "staging";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    process.env.OPS_ENABLED = "true";
    process.env.AUTH_MODE = "local_credentials";
    resetEnvCache();
    expect(() => getRuntimeFlags()).toThrow(/local_credentials/);
  });

  it("rejects hosted OPS with OIDC until MFA provider is implemented", () => {
    process.env.APP_ENV = "staging";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    process.env.OPS_ENABLED = "true";
    process.env.AUTH_MODE = "oidc";
    resetEnvCache();
    expect(() => getRuntimeFlags()).toThrow(/not implemented/i);
  });

  it("rejects production OPS with OIDC approved but not implemented", () => {
    (process.env as Record<string, string>)["NODE_ENV"] = "production";
    process.env.APP_ENV = "production";
    process.env.OPS_ENABLED = "true";
    process.env.AUTH_MODE = "oidc";
    process.env.AUTH_PRODUCTION_APPROVED = "true";
    resetEnvCache();
    expect(() => getRuntimeFlags()).toThrow(/not implemented/i);
  });

  it("reports OIDC as MFA-capable but not yet implemented", () => {
    const oidc = getAuthProviderCapability("oidc");
    expect(oidc.mfaSupported).toBe(true);
    expect(oidc.implemented).toBe(false);
    expect(() => assertHostedAuthReady("oidc")).toThrow(/not ready/i);
    expect(() => assertHostedAuthReady("local_credentials")).toThrow(/not ready/i);
  });

  it("patient messaging adapters fail closed while outbound is disabled", async () => {
    process.env.OUTBOUND_COMMUNICATIONS_ENABLED = "false";
    process.env.AUTH_MODE = "local_credentials";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    delete process.env.OPS_ENABLED;
    delete process.env.APP_ENV;
    resetEnvCache();
    const sms = await createPatientSmsProvider().send({
      to: "+17605550100",
      body: "test",
      correlationId: "corr_test",
    });
    const email = await createPatientEmailProvider().send({
      to: "deployment-test@example.com",
      body: "test",
      correlationId: "corr_test",
    });
    expect(sms.ok).toBe(false);
    expect(email.ok).toBe(false);
    expect(sms.detail).toMatch(/OUTBOUND_COMMUNICATIONS_ENABLED=false/);
  });

  it("enforces role boundaries for Owner / Administrator / FrontDesk", () => {
    expect(canManageSafety("Owner")).toBe(true);
    expect(canManageSafety("Administrator")).toBe(true);
    expect(canManageSafety("FrontDesk")).toBe(false);
    expect(canWriteSchedulingConfig("FrontDesk")).toBe(false);
    expect(canWriteSchedulingConfig("Administrator")).toBe(true);
    expect(canManageLeads("FrontDesk")).toBe(true);
    expect(canAccessOps("FrontDesk")).toBe(true);
    expect(canAccessOps("SystemService")).toBe(false);
  });

  it("redacts secrets and contact fields from alerts/logs", async () => {
    const scrubbed = scrubForLog({
      phone: "+17605550199",
      Authorization: "secret",
      fingerprint: "abc",
    }) as Record<string, unknown>;
    expect(scrubbed.phone).toBe("[OMITTED]");
    expect(scrubbed.Authorization).toBe("[REDACTED]");

    const result = await emitAlert({
      kind: "open_dental_write_attempt",
      severity: "critical",
      summary: "Blocked write",
      detail: { phone: "+17605550199", reason: "remote_readonly" },
    });
    expect(result.fingerprint).toMatch(/^[a-f0-9]+$/);
  });
});
