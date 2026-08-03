import { afterEach, describe, expect, it } from "vitest";
import { resetEnvCache, getRuntimeFlags, isPlatformEnabled } from "@/server/env";

function setEnv( partial: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(partial)) {
    if (v === undefined) delete process.env[k];
    else (process.env as Record<string,string|undefined>)[k] = v;
  }
  resetEnvCache();
}

describe("production auth fail-closed", () => {
  const keys = [
    "NODE_ENV",
    "OPS_ENABLED",
    "AUTH_MODE",
    "AUTH_PRODUCTION_APPROVED",
    "GROWTH_OS_PLATFORM_ENABLED",
    "APP_ENV",
  ] as const;
  const snapshot: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of keys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else (process.env as Record<string,string|undefined>)[k] = snapshot[k];
    }
    resetEnvCache();
  });

  it("1. development + local_credentials permitted", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "development",
      OPS_ENABLED: "true",
      AUTH_MODE: "local_credentials",
      AUTH_PRODUCTION_APPROVED: "false",
    });
    expect(getRuntimeFlags().authMode).toBe("local_credentials");
  });

  it("2. test + local_credentials permitted", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "test",
      OPS_ENABLED: "true",
      AUTH_MODE: "local_credentials",
    });
    expect(getRuntimeFlags().opsEnabled).toBe(true);
  });

  it("3. production + OPS disabled remains safe", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "false",
      AUTH_MODE: "local_credentials",
    });
    expect(getRuntimeFlags().opsEnabled).toBe(false);
  });

  it("4. production + OPS + local_credentials fails", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "true",
      AUTH_MODE: "local_credentials",
      AUTH_PRODUCTION_APPROVED: "false",
    });
    expect(() => getRuntimeFlags()).toThrow(/local_credentials/);
  });

  it("5. production + OPS + disabled auth fails", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "true",
      AUTH_MODE: "disabled",
      AUTH_PRODUCTION_APPROVED: "true",
    });
    expect(() => getRuntimeFlags()).toThrow(/disabled/);
  });

  it("6. production + OPS + incomplete production auth fails", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "true",
      AUTH_MODE: "oidc",
      AUTH_PRODUCTION_APPROVED: "false",
    });
    expect(() => getRuntimeFlags()).toThrow(/AUTH_PRODUCTION_APPROVED/);
  });

  it("7. AUTH_PRODUCTION_APPROVED alone does not permit local credentials", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "true",
      AUTH_MODE: "local_credentials",
      AUTH_PRODUCTION_APPROVED: "true",
    });
    expect(() => getRuntimeFlags()).toThrow(/local_credentials/);
  });

  it("platform disabled by default", () => {
    for (const k of keys) snapshot[k] = process.env[k];
    setEnv({
      NODE_ENV: "production",
      OPS_ENABLED: "false",
      AUTH_MODE: "local_credentials",
      GROWTH_OS_PLATFORM_ENABLED: undefined,
    });
    expect(isPlatformEnabled()).toBe(false);
  });
});
