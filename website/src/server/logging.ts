/** PHI/secret-safe console helpers — no database dependency. */

export function scrubForLog(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/authorization/i.test(value) || /bearer\s+/i.test(value)) return "[REDACTED]";
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (Array.isArray(value)) return value.map(scrubForLog);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/authorization|password|secret|api[_-]?key|token|database_url|smtp_pass|session/i.test(k)) {
        out[k] = "[REDACTED]";
      } else if (/body|message|content|clinical|phi|birthdate|dob|email|phone|name/i.test(k)) {
        // Keep ids and booleans; omit likely PHI field values from general logs
        if (typeof v === "boolean" || typeof v === "number") out[k] = v;
        else if (k === "formType" || k === "location" || k === "id" || k.endsWith("Id")) out[k] = scrubForLog(v);
        else out[k] = "[OMITTED]";
      } else {
        out[k] = scrubForLog(v);
      }
    }
    return out;
  }
  return value;
}

export function safeInfo(message: string, meta?: Record<string, unknown>) {
  console.info(message, meta ? scrubForLog(meta) : undefined);
}

export function safeError(message: string, meta?: Record<string, unknown>) {
  console.error(message, meta ? scrubForLog(meta) : undefined);
}
