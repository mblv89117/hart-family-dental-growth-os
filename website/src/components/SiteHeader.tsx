"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { locations } from "@/lib/locations";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <BrandLogo size={40} priority />
        <nav className="hidden items-center gap-5 text-sm text-ink-soft lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-deep sm:inline-flex"
          >
            Request appointment
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className="mx-auto hidden max-w-6xl gap-6 px-8 pb-2 text-xs text-ink-soft md:flex">
        {locations.map((loc) => (
          <a key={loc.id} href={loc.phoneHref} className="hover:text-ink">
            {loc.shortName}: {loc.phone}
          </a>
        ))}
      </div>
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--line)] bg-white/95 px-5 py-4 shadow-[var(--shadow)] backdrop-blur lg:hidden"
        >
          <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="py-1" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/smile-assessment" className="py-1" onClick={() => setOpen(false)}>
              Smile assessment
            </Link>
            <Link
              href="/contact"
              className="mt-2 rounded-full bg-brand px-4 py-2 text-center font-medium text-white"
              onClick={() => setOpen(false)}
            >
              Request appointment
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
