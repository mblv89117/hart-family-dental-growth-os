/** Fields that may describe a person or a health concern. Never send these to analytics. */
const SENSITIVE_QUERY_KEYS = new Set([
  "service",
  "name",
  "email",
  "phone",
  "message",
  "goals",
  "concerns",
  "patient",
  "transcript",
  "treatment",
  "appointment",
  "preferreddaytime",
  "smsconsent",
  "emailconsent",
  "companywebsite",
  "priorortho",
  "dentalvisit",
]);

const ALLOWED_EVENT_KEYS = new Set(["formType", "location", "path", "office"]);

export function sanitizeAnalyticsParams(
  params?: Record<string, string | number | boolean | undefined | null>,
): Record<string, string> {
  const clean: Record<string, string> = {};
  if (!params) return clean;
  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED_EVENT_KEYS.has(key) || value == null || value === "") continue;
    let text = String(value).slice(0, 120);
    if (key === "path") {
      text = text.split("?")[0]?.split("#")[0] || "";
      if (!text.startsWith("/")) continue;
    }
    if ((key === "location" || key === "office") && text !== "yucca-valley" && text !== "desert-hot-springs") {
      continue;
    }
    clean[key] = text;
  }
  return clean;
}

/** Keep campaign params. Drop form contents and clinical query keys before GA/ads. */
export function pageLocationWithoutSensitiveQuery(href: string): string {
  const url = new URL(href);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  return url.toString();
}

export function referrerWithoutQuery(referrer: string): string {
  if (!referrer) return "";
  try {
    const url = new URL(referrer);
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return "";
  }
}
