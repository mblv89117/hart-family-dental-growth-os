import { describe, expect, it } from "vitest";
import { isOptOutText } from "@/server/compliance/consent";
import { scrubForLog } from "@/server/audit";
import { createMockGateway, resetMockOpenDentalStores } from "@/server/opendental/mockGateway";
import { getEnv, resetEnvCache } from "@/server/env";
import { draftFirstResponse } from "@/server/messaging/providers";

describe("unit safety primitives", () => {
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

  it("defaults automation mode to draft and OD writes/outbound off", () => {
    resetEnvCache();
    process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test-auth-secret-min-32-characters!!";
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      "postgresql://hfd:hfd_local_dev@127.0.0.1:5432/hfd_growth_os?schema=public";
    delete process.env.AUTOMATION_MODE;
    delete process.env.OPEN_DENTAL_WRITES_ENABLED;
    delete process.env.OUTBOUND_COMMUNICATIONS_ENABLED;
    resetEnvCache();
    const env = getEnv();
    expect(env.automationMode).toBe("draft");
    expect(env.openDentalWritesEnabled).toBe(false);
    expect(env.outboundCommunicationsEnabled).toBe(false);
  });

  it("keeps separate Open Dental mock connections isolated", async () => {
    resetMockOpenDentalStores();
    const a = createMockGateway("yv-separate");
    const b = createMockGateway("dhs-separate");
    const aPatients = await a.findPatientCandidates({ FName: "Synthetic", LName: "PatientAlpha" });
    const bPatients = await b.findPatientCandidates({ FName: "Synthetic", LName: "PatientAlpha" });
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
