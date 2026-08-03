/**
 * Patient communication adapters (Growth OS outbound).
 * Separate from public-site Resend lead notifications in lib/lead-delivery.ts.
 *
 * Keep OUTBOUND_COMMUNICATIONS_ENABLED=false until BAA-covered vendor + staff UAT + owner approval.
 */

import { getRuntimeFlags } from "../env";

export type PatientMessageChannel = "sms" | "email";

export type PatientSendResult = {
  ok: boolean;
  provider: string;
  externalId?: string;
  detail: string;
};

export type PatientMessageProvider = {
  channel: PatientMessageChannel;
  name: string;
  send(input: {
    to: string;
    body: string;
    templateKey?: string;
    correlationId: string;
  }): Promise<PatientSendResult>;
};

/** Placeholder SMS adapter — fails closed until a BAA vendor is configured. */
export function createPatientSmsProvider(): PatientMessageProvider {
  return {
    channel: "sms",
    name: "unconfigured-sms",
    async send() {
      if (!getRuntimeFlags().outboundCommunicationsEnabled) {
        return { ok: false, provider: "unconfigured-sms", detail: "OUTBOUND_COMMUNICATIONS_ENABLED=false" };
      }
      return {
        ok: false,
        provider: "unconfigured-sms",
        detail: "No BAA-covered SMS provider configured. Do not use public Resend lead credentials for patients.",
      };
    },
  };
}

/** Placeholder patient email adapter — distinct from public lead Resend path. */
export function createPatientEmailProvider(): PatientMessageProvider {
  return {
    channel: "email",
    name: "unconfigured-patient-email",
    async send() {
      if (!getRuntimeFlags().outboundCommunicationsEnabled) {
        return {
          ok: false,
          provider: "unconfigured-patient-email",
          detail: "OUTBOUND_COMMUNICATIONS_ENABLED=false",
        };
      }
      return {
        ok: false,
        provider: "unconfigured-patient-email",
        detail: "No BAA-covered patient email provider configured.",
      };
    },
  };
}
