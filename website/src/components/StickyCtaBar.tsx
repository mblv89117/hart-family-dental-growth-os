"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { locations } from "@/lib/locations";

/**
 * Mobile conversion bar: Schedule + Call.
 * Hidden while the user is inside the appointment form to avoid covering inputs.
 */
export function StickyCtaBar() {
  const [hidden, setHidden] = useState(false);
  const primary = locations[0];

  useEffect(() => {
    const form = document.getElementById("request");
    if (!form || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(Boolean(entry?.isIntersecting)),
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(42,85,112,0.12)] backdrop-blur md:hidden"
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <Link
          href="/contact#request"
          className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
        >
          Schedule appointment
        </Link>
        <a
          href={primary.phoneHref}
          className="flex-1 rounded-full bg-sky-deep px-4 py-3 text-center text-sm font-medium text-white transition hover:opacity-90 focus-ring"
        >
          Call now
        </a>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-6xl justify-center gap-4 text-[11px] text-ink-soft">
        {locations.map((loc) => (
          <a key={loc.id} href={loc.phoneHref} className="hover:text-ink focus-ring rounded">
            {loc.shortName}
          </a>
        ))}
      </div>
    </div>
  );
}
