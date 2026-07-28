import { getEnv } from "../env";
import { safeError, safeInfo } from "../audit";
import type {
  CreateAppointmentInput,
  OdAppointment,
  OdClinic,
  OdOperatory,
  OdPatient,
  OdProvider,
  OdSlot,
  OpenDentalGateway,
  PatientSearchQuery,
} from "./types";
import {
  OdAppointmentSchema,
  OdClinicSchema,
  OdOperatorySchema,
  OdPatientSchema,
  OdProviderSchema,
  OdSlotSchema,
} from "./types";

type CircuitState = { failures: number; openUntil?: number };

const circuits = new Map<string, CircuitState>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(base: number) {
  return base + Math.floor(Math.random() * base * 0.3);
}

export function createRemoteGateway(input: {
  connectionKey: string;
  baseUrl: string;
  developerKey: string;
  customerKey: string;
}): OpenDentalGateway {
  const env = getEnv();
  if (!env.openDentalWritesEnabled) {
    // Writes still exist as methods but throw unless flag is on — checked per call.
  }

  async function request<T>(
    method: string,
    path: string,
    opts?: { body?: unknown; write?: boolean; schema?: { parse: (v: unknown) => T } },
  ): Promise<T> {
    if (opts?.write && !getEnv().openDentalWritesEnabled) {
      throw new Error("Open Dental writes are disabled (OPEN_DENTAL_WRITES_ENABLED=false).");
    }
    const circuit = circuits.get(input.connectionKey) || { failures: 0 };
    if (circuit.openUntil && Date.now() < circuit.openUntil) {
      throw new Error("Open Dental circuit open");
    }

    const url = `${input.baseUrl.replace(/\/$/, "")}${path}`;
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      attempt += 1;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), env.openDentalTimeoutMs);
      try {
        const res = await fetch(url, {
          method,
          signal: controller.signal,
          headers: {
            Authorization: `ODFHIR ${input.developerKey}/${input.customerKey}`,
            "Content-Type": "application/json",
            "X-Correlation-Id": `od_${Date.now()}`,
          },
          body: opts?.body ? JSON.stringify(opts.body) : undefined,
        });
        clearTimeout(timer);

        if (res.status === 429 || res.status >= 500) {
          const retryAfter = Number(res.headers.get("Retry-After") || "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : jitter(200 * 2 ** attempt);
          safeInfo("[od] retryable", { connectionKey: input.connectionKey, status: res.status, attempt });
          await sleep(delay);
          continue;
        }
        if (!res.ok) {
          circuit.failures += 1;
          if (circuit.failures >= 5) circuit.openUntil = Date.now() + 60_000;
          circuits.set(input.connectionKey, circuit);
          throw new Error(`Open Dental HTTP ${res.status}`);
        }
        circuit.failures = 0;
        circuit.openUntil = undefined;
        circuits.set(input.connectionKey, circuit);
        const json = await res.json();
        return opts?.schema ? opts.schema.parse(json) : (json as T);
      } catch (err) {
        clearTimeout(timer);
        safeError("[od] request failed", {
          connectionKey: input.connectionKey,
          path,
          attempt,
          error: err instanceof Error ? err.message : "unknown",
        });
        if (attempt >= maxAttempts) {
          circuit.failures += 1;
          if (circuit.failures >= 5) circuit.openUntil = Date.now() + 60_000;
          circuits.set(input.connectionKey, circuit);
          throw err;
        }
        await sleep(jitter(200 * 2 ** attempt));
      }
    }
    throw new Error("Open Dental request failed");
  }

  return {
    connectionKey: input.connectionKey,
    async healthCheck() {
      try {
        await request("GET", "/clinics?Limit=1");
        return { ok: true, detail: "remote_ok" };
      } catch (e) {
        return { ok: false, detail: e instanceof Error ? e.message : "error" };
      }
    },
    async getClinics() {
      const rows = await request<unknown[]>("GET", "/clinics");
      return (rows as unknown[]).map((r) => OdClinicSchema.parse(r));
    },
    async getProviders() {
      const rows = await request<unknown[]>("GET", "/providers");
      return (rows as unknown[]).map((r) => OdProviderSchema.parse(r));
    },
    async getOperatories() {
      const rows = await request<unknown[]>("GET", "/operatories");
      return (rows as unknown[]).map((r) => OdOperatorySchema.parse(r));
    },
    async getSchedules(params) {
      return request("GET", `/schedules?DateStart=${params.dateStart}&DateEnd=${params.dateEnd}`);
    },
    async getAppointments(params) {
      const q = new URLSearchParams({
        DateStart: params.dateStart,
        DateEnd: params.dateEnd,
      });
      if (params.ClinicNum) q.set("ClinicNum", params.ClinicNum);
      const rows = await request<unknown[]>("GET", `/appointments?${q}`);
      return (rows as unknown[]).map((r) => OdAppointmentSchema.parse(r));
    },
    async getAppointment(aptNum) {
      try {
        const row = await request("GET", `/appointments/${aptNum}`);
        return OdAppointmentSchema.parse(row);
      } catch {
        return null;
      }
    },
    async getAvailableSlots(params) {
      // Official API does not always expose a universal slots endpoint; degrade gracefully.
      try {
        const q = new URLSearchParams({
          DateStart: params.dateStart,
          DateEnd: params.dateEnd,
          Length: String(params.lengthMinutes),
        });
        const rows = await request<unknown[]>("GET", `/appointments/Slots?${q}`);
        return (rows as unknown[]).map((r) => OdSlotSchema.parse(r));
      } catch {
        return [] as OdSlot[];
      }
    },
    async findPatientCandidates(query: PatientSearchQuery) {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v) q.set(k, v);
      }
      const rows = await request<unknown[]>("GET", `/patients?${q}`);
      return (rows as unknown[]).map((r) => OdPatientSchema.parse(r));
    },
    async getPatient(patNum) {
      try {
        const row = await request("GET", `/patients/${patNum}`);
        return OdPatientSchema.parse(row);
      } catch {
        return null;
      }
    },
    async getRecalls(params) {
      const q = new URLSearchParams(params as Record<string, string>);
      return request("GET", `/recalls?${q}`);
    },
    async getCommLogs(patNum) {
      return request("GET", `/commlogs?PatNum=${patNum}`);
    },
    async createAppointment(body: CreateAppointmentInput) {
      const row = await request("POST", "/appointments", { body, write: true });
      return OdAppointmentSchema.parse(row);
    },
    async updateAppointment(aptNum, patch) {
      const row = await request("PUT", `/appointments/${aptNum}`, { body: patch, write: true });
      return OdAppointmentSchema.parse(row);
    },
    async confirmAppointment(aptNum) {
      const row = await request("PUT", `/appointments/${aptNum}`, {
        body: { Confirm: "Yes" },
        write: true,
      });
      return OdAppointmentSchema.parse(row);
    },
    async addAppointmentNote(aptNum, note) {
      const row = await request("PUT", `/appointments/${aptNum}`, { body: { Note: note }, write: true });
      return OdAppointmentSchema.parse(row);
    },
  };
}

// type exports used by index
export type { OdClinic, OdProvider, OdOperatory, OdAppointment, OdPatient };
