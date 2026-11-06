"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { locations, type LocationId } from "@/lib/locations";
import { officeFromPathname, resolveOfficeId } from "@/lib/office-routing";

/**
 * Mobile conversion bar: Schedule + the CallRail number for this office.
 * Pages that are not a single office show both numbers. They do not default to Desert Hot Springs.
 * Hidden while the user is inside the appointment form to avoid covering inputs.
 */
export function StickyCtaBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [queryOffice, setQueryOffice] = useState<LocationId | null>(null);
  const pathOffice = officeFromPathname(pathname || "/");
  const officeId = pathOffice || queryOffice;
  const primary = officeId ? locations.find((loc) => loc.id === officeId) : undefined;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryOffice(resolveOfficeId(params.get("office") || params.get("location")));
    const form = document.getElementById("request");
    if (!form || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(Boolean(entry?.isIntersecting)),
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [pathname]);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(42,85,112,0.12)] backdrop-blur md:hidden"
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/contact#request"
            className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
          >
            Schedule appointment
          </Link>
          {primary ? (
            <a
              href={primary.phoneHref}
              className="flex-1 rounded-full bg-sky-deep px-4 py-3 text-center text-sm font-medium text-white transition hover:opacity-90 focus-ring"
            >
              Call {primary.shortName}
            </a>
          ) : null}
        </div>
        {primary ? (
          <div className="flex justify-center gap-4 text-[11px] text-ink-soft">
            {locations.map((loc) => (
              <a key={loc.id} href={loc.phoneHref} className="hover:text-ink focus-ring rounded">
                {loc.shortName}
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {locations.map((loc) => (
              <a
                key={loc.id}
                href={loc.phoneHref}
                aria-label={`Call ${loc.shortName} at ${loc.phone}`}
                className="rounded-full bg-sky-deep px-2 py-2.5 text-center text-[11px] font-medium leading-tight text-white transition hover:opacity-90 focus-ring"
              >
                Call {loc.shortName}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
