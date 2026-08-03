/**
 * PHI-safe operational alerts. Delivery is logged until an owner-approved
 * alert channel (email/PagerDuty/etc.) is configured. Never include PHI.
 */

import { createHash } from "crypto";
import { safeError, safeInfo, writeAudit } from "./audit";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertKind =
  | "database_unavailable"
  | "worker_failure"
  | "dead_letter"
  | "open_dental_unavailable"
  | "open_dental_write_attempt"
  | "auth_failure_spike"
  | "message_provider_failure"
  | "emergency_stop"
  | "integration_health";

export type AlertEvent = {
  kind: AlertKind;
  severity: AlertSeverity;
  organizationId?: string;
  correlationId?: string;
  summary: string;
  detail?: Record<string, string | number | boolean | null>;
};

function redactDetail(detail: AlertEvent["detail"]): Record<string, string | number | boolean | null> | undefined {
  if (!detail) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(detail)) {
    const key = k.toLowerCase();
    if (
      key.includes("password") ||
      key.includes("secret") ||
      key.includes("token") ||
      key.includes("key") ||
      key.includes("ssn") ||
      key.includes("dob") ||
      key.includes("phone") ||
      key.includes("email") ||
      key.includes("name")
    ) {
      out[k] = "[redacted]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Emit an actionable alert. Returns a stable fingerprint for dedupe/tests. */
export async function emitAlert(event: AlertEvent): Promise<{ fingerprint: string }> {
  const safeDetail = redactDetail(event.detail);
  const fingerprint = createHash("sha256")
    .update(`${event.kind}|${event.severity}|${event.summary}`)
    .digest("hex")
    .slice(0, 16);

  const payload = {
    kind: event.kind,
    severity: event.severity,
    summary: event.summary,
    correlationId: event.correlationId || null,
    fingerprint,
    detail: safeDetail || null,
  };

  if (event.severity === "critical") {
    safeError("[alert]", payload);
  } else {
    safeInfo("[alert]", payload);
  }

  if (event.organizationId) {
    try {
      await writeAudit({
        organizationId: event.organizationId,
        actorType: "system",
        action: `alert.${event.kind}`,
        resourceType: "Alert",
        resourceId: fingerprint,
        result: event.severity === "critical" ? "error" : "success",
        nextSafe: payload,
      });
    } catch {
      // Audit must not block alerting
    }
  }

  return { fingerprint };
}
