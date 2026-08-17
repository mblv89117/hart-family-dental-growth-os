import { getLocationById, type Location, type LocationId } from "./locations";

const OFFICE_IDS: LocationId[] = ["yucca-valley", "desert-hot-springs"];

/** Marketing office context only. Never a patient identifier. */
export function parseOfficeParam(value: string | string[] | undefined | null): LocationId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  return OFFICE_IDS.includes(normalized as LocationId) ? (normalized as LocationId) : null;
}

export function officeFromSearch(search: string): LocationId | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return parseOfficeParam(params.get("office"));
}

export function locationForOffice(office: LocationId | null): Location | null {
  if (!office) return null;
  return getLocationById(office) ?? null;
}

export const FORBIDDEN_URL_PARAM_KEYS = [
  "name",
  "email",
  "phone",
  "patient",
  "transcript",
  "treatment",
  "appointment",
] as const;
