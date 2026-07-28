import { describe, expect, it, beforeEach } from "vitest";
import { isOptOutText } from "@/server/compliance/consent";
import { scrubForLog } from "@/server/logging";
import { createMockGateway, resetMockOpenDentalStores } from "@/server/opendental/mockGateway";
import { getRuntimeFlags, isPlatformEnabled, resetEnvCache } from "@/server/env";
import { draftFirstResponse } from "@/server/messaging/providers";

describe("unit safety primitives", () => {
  beforeEach(() => {
    resetEnvCache();
  });

  it("detects STOP and equivalent opt-out phrases", () => {
    expect(isOptOutText("STOP")).toBe(true);
    expect(isOptOutText("unsubscribe")).toBe(true);
    expect(isOptOutText("hello")).toBe(false);
  });

  it("scrubs authorization and message bodies from logs", () => {
    const scrubbed = scrubForLog({
      Authorization: "ODFHIR secret/secret",
      body: "patient clinical note",
      ok: true,
    }) as Record<string, unknown>;
    expect(scrubbed.Authorization).toBe("[REDACTED]");
    expect(scrubbed.body).toBe("[OMITTED]");
    expect(scrubbed.ok).toBe(true);
  });

  it("defaults automation mode to draft and OD writes/outbound off; platform off by default", () => {
    delete process.env.AUTOMATION_MODE;
    delete process.env.OPEN_DENTAL_WRITES_ENABLED;
    delete process.env.OUTBOUND_COMMUNICATIONS_ENABLED;
    delete process.env.GROWTH_OS_PLATFORM_ENABLED;
    delete process.env.OPS_ENABLED;
    process.env.AUTH_MODE = "local_credentials";
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    resetEnvCache();
    const flags = getRuntimeFlags();
    expect(flags.automationMode).toBe("draft");
    expect(flags.openDentalWritesEnabled).toBe(false);
    expect(flags.outboundCommunicationsEnabled).toBe(false);
    expect(isPlatformEnabled()).toBe(false);
    expect(flags.opsEnabled).toBe(false);
  });

  it("rejects production OPS with local_credentials even if AUTH_PRODUCTION_APPROVED=true", () => {
    (process.env as Record<string, string>)["NODE_ENV"] = "production";
    process.env.OPS_ENABLED = "true";
    process.env.AUTH_MODE = "local_credentials";
    process.env.AUTH_PRODUCTION_APPROVED = "true";
    resetEnvCache();
    expect(() => getRuntimeFlags()).toThrow(/local_credentials/);
  });

  it("allows development local_credentials with OPS enabled", () => {
    (process.env as Record<string, string>)["NODE_ENV"] = "development";
    process.env.OPS_ENABLED = "true";
    process.env.AUTH_MODE = "local_credentials";
    process.env.AUTH_PRODUCTION_APPROVED = "false";
    resetEnvCache();
    expect(getRuntimeFlags().opsEnabled).toBe(true);
  });

  it("keeps separate Open Dental mock connections isolated", async () => {
    resetMockOpenDentalStores();
    const a = createMockGateway("yv-separate");
    const b = createMockGateway("dhs-separate");
    const aPatients = await a.findPatientCandidates({ FName: "Synthetic", LName: "PatientAlpha" });
    const bPatients = await b.findPatientCandidates({ FName: "Synthetic", LName: "PatientBeta" });
    expect(aPatients[0].PatNum).not.toEqual(bPatients[0].PatNum);
    await a.createAppointment({
      PatNum: aPatients[0].PatNum,
      AptDateTime: new Date(Date.now() + 86400000).toISOString(),
    });
    const bApts = await b.getAppointments({
      dateStart: new Date().toISOString(),
      dateEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    expect(bApts).toHaveLength(0);
  });

  it("mock Open Dental health check succeeds", async () => {
    resetMockOpenDentalStores();
    const gw = createMockGateway("shared-clinics");
    const health = await gw.healthCheck();
    expect(health.ok).toBe(true);
  });

  it("builds deterministic draft responses", () => {
    const draft = draftFirstResponse({
      name: "Alex",
      locationName: "Yucca Valley",
      service: "Implants",
    });
    expect(draft).toContain("Alex");
    expect(draft).toContain("Yucca Valley");
    expect(draft).toContain("STOP");
  });
});
