"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { locations } from "@/lib/locations";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background,box-shadow,backdrop-filter] ${
        scrolled || open
          ? "border-b border-[var(--line)] bg-white/90 shadow-[0_8px_30px_rgba(42,85,112,0.08)] backdrop-blur-md"
          : "bg-white/55 backdrop-blur-[2px]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5 md:gap-4 md:px-8 md:py-3">
        <BrandLogo variant="horizontal" size={200} priority className="shrink-0" />
        <nav className="hidden min-w-0 items-center gap-3 text-sm text-ink-soft xl:flex xl:gap-4" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-ink focus-ring rounded">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/contact#request"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring sm:inline-flex"
          >
            Request appointment
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-3 py-2 text-sm text-ink focus-ring xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className="border-t border-[var(--line)]/70 bg-[color-mix(in_oklab,var(--paper-deep)_40%,white)]">
        <div className="mx-auto hidden max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-8 py-1.5 text-xs text-ink-soft md:flex">
          {locations.map((loc) => (
            <a key={loc.id} href={loc.phoneHref} className="rounded hover:text-ink focus-ring">
              Call {loc.shortName}: {loc.phone}
            </a>
          ))}
        </div>
      </div>
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--line)] bg-white/98 px-5 py-4 shadow-[var(--shadow)] xl:hidden"
        >
          <nav className="flex flex-col gap-1 text-sm" aria-label="Mobile">
            <div className="mb-2 flex justify-start">
              <BrandLogo variant="horizontal" size={150} href={null} />
            </div>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-2.5 hover:bg-[color-mix(in_oklab,var(--paper-deep)_55%,white)] focus-ring"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {locations.map((loc) => (
              <a
                key={loc.id}
                href={loc.phoneHref}
                className="rounded-lg px-2 py-2.5 font-medium text-brand focus-ring"
                onClick={() => setOpen(false)}
              >
                Call {loc.shortName}: {loc.phone}
              </a>
            ))}
            <Link
              href="/contact#request"
              className="mt-2 rounded-full bg-brand px-4 py-3 text-center font-medium text-white focus-ring"
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
