import { getLocationById, type LocationId } from "@/lib/locations";

const OFFICE_IDS: readonly LocationId[] = ["yucca-valley", "desert-hot-springs"];

/** Exact office ids only. Unknown, blank, or "either" values fail closed. */
export function resolveOfficeId(value: string | null | undefined): LocationId | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return OFFICE_IDS.includes(normalized as LocationId) ? (normalized as LocationId) : null;
}

export function officeFromPathname(pathname: string): LocationId | null {
  const path = pathname.split("?")[0]?.split("#")[0] || "/";
  if (path === "/locations/yucca-valley" || path.startsWith("/locations/yucca-valley/")) {
    return "yucca-valley";
  }
  if (path === "/locations/desert-hot-springs" || path.startsWith("/locations/desert-hot-springs/")) {
    return "desert-hot-springs";
  }
  return null;
}

export function officeFromTel(href: string): LocationId | null {
  const digits = href.replace(/\D/g, "");
  if (digits.endsWith("7603897707")) return "yucca-valley";
  if (digits.endsWith("7603144160")) return "desert-hot-springs";
  return null;
}

export function officeInbox(locationId: string): string | null {
  const office = resolveOfficeId(locationId);
  if (!office) return null;
  return getLocationById(office)?.leadNotifyEmail ?? null;
}

/** Thank-you URL carries the office id only — never clinical service text. */
export function thankYouPath(location: string): string {
  const office = resolveOfficeId(location);
  return office ? `/thank-you?location=${office}` : "/thank-you";
}
