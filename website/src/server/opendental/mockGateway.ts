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

type MockStore = {
  clinics: OdClinic[];
  providers: OdProvider[];
  operatories: OdOperatory[];
  patients: OdPatient[];
  appointments: OdAppointment[];
  nextApt: number;
  unavailable: boolean;
};

const stores = new Map<string, MockStore>();

function storeFor(connectionKey: string): MockStore {
  let s = stores.get(connectionKey);
  if (!s) {
    // Prefix keeps separate connection stores isolated even when local IDs look similar.
    const p = `c_${connectionKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}_`;
    s = {
      clinics: [
        { ClinicNum: "1", Description: `${connectionKey} Clinic 1`, Abbr: "C1" },
        { ClinicNum: "2", Description: `${connectionKey} Clinic 2`, Abbr: "C2" },
      ],
      providers: [
        { ProvNum: `${p}P1`, Abbr: "DRH", FName: "Harry", LName: "Hart" },
        { ProvNum: `${p}P2`, Abbr: "HYG", FName: "Pat", LName: "Hygienist" },
      ],
      operatories: [
        { OperatoryNum: `${p}O1`, OpName: "Op 1", ClinicNum: "1" },
        { OperatoryNum: `${p}O2`, OpName: "Op 2", ClinicNum: "2" },
      ],
      patients: [
        {
          PatNum: `${p}100`,
          FName: "Synthetic",
          LName: "PatientAlpha",
          Birthdate: "1985-04-12",
          WirelessPhone: "7605550101",
          Email: "synthetic.alpha@example.test",
          ClinicNum: "1",
        },
        {
          PatNum: `${p}101`,
          FName: "Synthetic",
          LName: "PatientBeta",
          Birthdate: "1990-08-22",
          WirelessPhone: "7605550102",
          Email: "synthetic.beta@example.test",
          ClinicNum: "2",
        },
        {
          PatNum: `${p}102`,
          FName: "Jordan",
          LName: "Example",
          Birthdate: "1978-01-05",
          WirelessPhone: "7605550199",
          Email: "jordan.example@example.test",
          ClinicNum: "1",
        },
        {
          PatNum: `${p}103`,
          FName: "Jordan",
          LName: "Example",
          Birthdate: "1982-11-11",
          WirelessPhone: "7605550188",
          Email: "jordan.other@example.test",
          ClinicNum: "1",
        },
      ],
      appointments: [],
      nextApt: 5000,
      unavailable: false,
    };
    stores.set(connectionKey, s);
  }
  return s;
}

/** Reset mock data between tests. */
export function resetMockOpenDentalStores() {
  stores.clear();
}

function assertAvailable(store: MockStore) {
  if (store.unavailable) {
    throw new Error("Open Dental unavailable (mock downtime)");
  }
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function createMockGateway(connectionKey: string): OpenDentalGateway {
  const store = storeFor(connectionKey);

  return {
    connectionKey,
    setUnavailable(unavailable: boolean) {
      store.unavailable = unavailable;
    },
    async healthCheck() {
      if (store.unavailable) return { ok: false, detail: "mock_unavailable" };
      return { ok: true, detail: "mock_ok" };
    },
    async getClinics() {
      assertAvailable(store);
      return [...store.clinics];
    },
    async getProviders() {
      assertAvailable(store);
      return [...store.providers];
    },
    async getOperatories() {
      assertAvailable(store);
      return [...store.operatories];
    },
    async getSchedules() {
      assertAvailable(store);
      return [];
    },
    async getAppointments(params) {
      assertAvailable(store);
      return store.appointments.filter((a) => {
        const t = new Date(a.AptDateTime).getTime();
        const okRange = t >= new Date(params.dateStart).getTime() && t <= new Date(params.dateEnd).getTime();
        const okClinic = !params.ClinicNum || a.ClinicNum === params.ClinicNum;
        return okRange && okClinic;
      });
    },
    async getAppointment(aptNum) {
      assertAvailable(store);
      return store.appointments.find((a) => a.AptNum === aptNum) || null;
    },
    async getAvailableSlots(params) {
      assertAvailable(store);
      const slots: OdSlot[] = [];
      const startDay = new Date(params.dateStart);
      const endDay = new Date(params.dateEnd);
      for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
        const day = d.getUTCDay();
        if (day === 0 || day === 6) continue; // weekends closed
        for (const hour of [9, 10, 11, 13, 14, 15]) {
          const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hour, 0, 0));
          if (start.getTime() < Date.now() + 2 * 60 * 60 * 1000) continue;
          const end = new Date(start.getTime() + params.lengthMinutes * 60_000);
          const clinic = params.ClinicNum || store.clinics[0].ClinicNum;
          const op =
            params.Op ||
            store.operatories.find((o) => o.ClinicNum === clinic)?.OperatoryNum ||
            store.operatories[0].OperatoryNum;
          const prov = params.ProvNum || store.providers[0].ProvNum;
          const conflict = store.appointments.some(
            (a) =>
              a.Op === op &&
              Math.abs(new Date(a.AptDateTime).getTime() - start.getTime()) < params.lengthMinutes * 60_000,
          );
          if (conflict) continue;
          slots.push({
            DateTimeStart: start.toISOString(),
            DateTimeEnd: end.toISOString(),
            ProvNum: prov,
            Op: op,
            ClinicNum: clinic,
          });
        }
      }
      return slots.slice(0, 20);
    },
    async findPatientCandidates(query: PatientSearchQuery) {
      assertAvailable(store);
      if (query.PatNum) {
        return store.patients.filter((p) => p.PatNum === query.PatNum);
      }
      // Name-only is insufficient for auto-link; still return candidates for review.
      return store.patients.filter((p) => {
        const nameOk =
          (!query.FName || p.FName.toLowerCase() === query.FName.toLowerCase()) &&
          (!query.LName || p.LName.toLowerCase() === query.LName.toLowerCase());
        if (!nameOk) return false;
        if (query.Birthdate && p.Birthdate !== query.Birthdate) return false;
        if (query.Phone && (p.WirelessPhone || "") !== query.Phone) return false;
        if (query.Email && (p.Email || "").toLowerCase() !== query.Email.toLowerCase()) return false;
        // If only name provided, return matches (caller must not auto-link)
        return true;
      });
    },
    async getPatient(patNum) {
      assertAvailable(store);
      return store.patients.find((p) => p.PatNum === patNum) || null;
    },
    async getRecalls() {
      assertAvailable(store);
      return [];
    },
    async getCommLogs() {
      assertAvailable(store);
      return [];
    },
    async createAppointment(input: CreateAppointmentInput) {
      assertAvailable(store);
      const apt: OdAppointment = {
        AptNum: String(store.nextApt++),
        PatNum: input.PatNum,
        AptStatus: "Scheduled",
        AptDateTime: input.AptDateTime,
        Op: input.Op,
        ProvNum: input.ProvNum,
        ClinicNum: input.ClinicNum,
        Pattern: input.Pattern || "XXXXXXXX",
        Note: input.Note,
      };
      store.appointments.push(apt);
      return apt;
    },
    async updateAppointment(aptNum, patch) {
      assertAvailable(store);
      const apt = store.appointments.find((a) => a.AptNum === aptNum);
      if (!apt) throw new Error("Appointment not found");
      Object.assign(apt, patch);
      return apt;
    },
    async confirmAppointment(aptNum) {
      assertAvailable(store);
      const apt = store.appointments.find((a) => a.AptNum === aptNum);
      if (!apt) throw new Error("Appointment not found");
      apt.AptStatus = "Confirmed";
      return apt;
    },
    async addAppointmentNote(aptNum, note) {
      assertAvailable(store);
      const apt = store.appointments.find((a) => a.AptNum === aptNum);
      if (!apt) throw new Error("Appointment not found");
      apt.Note = `${apt.Note || ""}\n${note}`.trim();
      return apt;
    },
  };
}

export function findRecentMatchingAppointment(
  connectionKey: string,
  input: { PatNum: string; AptDateTime: string },
): OdAppointment | null {
  const store = storeFor(connectionKey);
  const target = new Date(input.AptDateTime).getTime();
  return (
    store.appointments.find(
      (a) => a.PatNum === input.PatNum && Math.abs(new Date(a.AptDateTime).getTime() - target) < 60_000,
    ) || null
  );
}

// silence unused helper warning in some builds
void addMinutes;
