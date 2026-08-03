/** Client-side attribution + conversion helpers (no fabricated IDs). */

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const STORAGE_KEY = "hfd_attribution";

export function captureAttributionFromLocation(search: string, referrer: string): UtmParams {
  const params = new URLSearchParams(search);
  const data: UtmParams = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) data[key] = v.slice(0, 200);
  }
  if (referrer) data.referrer = referrer.slice(0, 500);
  if (Object.keys(data).length) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }
  return readAttribution();
}

export function readAttribution(): UtmParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean | undefined>) {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    hfdTrack?: (event: string, params?: Record<string, unknown>) => void;
    fbq?: (...args: unknown[]) => void;
  };

  if (typeof w.hfdTrack === "function") {
    w.hfdTrack(name, params);
  } else {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: name, ...params });
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params || {});
    }
  }

  // Meta Pixel conversion hooks when pixel is configured via Analytics
  if (typeof w.fbq === "function" && name === "form_submit_success") {
    w.fbq("track", "Lead", params || {});
  }
}
