import { z } from "zod";

export const OdClinicSchema = z.object({
  ClinicNum: z.union([z.string(), z.number()]).transform(String),
  Description: z.string().optional(),
  Abbr: z.string().optional(),
});

export const OdProviderSchema = z.object({
  ProvNum: z.union([z.string(), z.number()]).transform(String),
  Abbr: z.string().optional(),
  FName: z.string().optional(),
  LName: z.string().optional(),
});

export const OdOperatorySchema = z.object({
  OperatoryNum: z.union([z.string(), z.number()]).transform(String),
  OpName: z.string().optional(),
  ClinicNum: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const OdAppointmentSchema = z.object({
  AptNum: z.union([z.string(), z.number()]).transform(String),
  PatNum: z.union([z.string(), z.number()]).transform(String),
  AptStatus: z.string().optional(),
  AptDateTime: z.string(),
  Op: z.union([z.string(), z.number()]).transform(String).optional(),
  ProvNum: z.union([z.string(), z.number()]).transform(String).optional(),
  ClinicNum: z.union([z.string(), z.number()]).transform(String).optional(),
  Pattern: z.string().optional(),
  Note: z.string().optional(),
});

export const OdPatientSchema = z.object({
  PatNum: z.union([z.string(), z.number()]).transform(String),
  FName: z.string(),
  LName: z.string(),
  Birthdate: z.string().optional(),
  WirelessPhone: z.string().optional(),
  Email: z.string().optional(),
  ClinicNum: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const OdSlotSchema = z.object({
  DateTimeStart: z.string(),
  DateTimeEnd: z.string(),
  ProvNum: z.string().optional(),
  Op: z.string().optional(),
  ClinicNum: z.string().optional(),
});

export type OdClinic = z.infer<typeof OdClinicSchema>;
export type OdProvider = z.infer<typeof OdProviderSchema>;
export type OdOperatory = z.infer<typeof OdOperatorySchema>;
export type OdAppointment = z.infer<typeof OdAppointmentSchema>;
export type OdPatient = z.infer<typeof OdPatientSchema>;
export type OdSlot = z.infer<typeof OdSlotSchema>;

export type PatientSearchQuery = {
  FName?: string;
  LName?: string;
  Birthdate?: string;
  Phone?: string;
  Email?: string;
  PatNum?: string;
};

export type CreateAppointmentInput = {
  PatNum: string;
  AptDateTime: string;
  Op?: string;
  ProvNum?: string;
  ClinicNum?: string;
  Pattern?: string;
  Note?: string;
};

export type OpenDentalGateway = {
  connectionKey: string;
  healthCheck(): Promise<{ ok: boolean; detail: string }>;
  getClinics(): Promise<OdClinic[]>;
  getProviders(): Promise<OdProvider[]>;
  getOperatories(): Promise<OdOperatory[]>;
  getSchedules(params: { dateStart: string; dateEnd: string }): Promise<unknown[]>;
  getAppointments(params: { dateStart: string; dateEnd: string; ClinicNum?: string }): Promise<OdAppointment[]>;
  getAppointment(aptNum: string): Promise<OdAppointment | null>;
  getAvailableSlots(params: {
    dateStart: string;
    dateEnd: string;
    lengthMinutes: number;
    ClinicNum?: string;
    ProvNum?: string;
    Op?: string;
  }): Promise<OdSlot[]>;
  findPatientCandidates(query: PatientSearchQuery): Promise<OdPatient[]>;
  getPatient(patNum: string): Promise<OdPatient | null>;
  getRecalls(params?: { DateStart?: string; DateEnd?: string }): Promise<unknown[]>;
  getCommLogs(patNum: string): Promise<unknown[]>;
  createAppointment(input: CreateAppointmentInput): Promise<OdAppointment>;
  updateAppointment(aptNum: string, patch: Partial<CreateAppointmentInput>): Promise<OdAppointment>;
  confirmAppointment(aptNum: string): Promise<OdAppointment>;
  addAppointmentNote(aptNum: string, note: string): Promise<OdAppointment>;
  /** Test helper / downtime simulation */
  setUnavailable?(unavailable: boolean): void;
};
