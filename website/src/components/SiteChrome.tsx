import Link from "next/link";
import { locations } from "@/lib/locations";
import { footerLinks, nav, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={36} height={36} className="rounded-md" />
          <span className="font-display text-xl tracking-tight text-sky-deep md:text-2xl">
            {site.brand}
          </span>
        </Link>
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
            className="rounded-full bg-sage px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-deep"
          >
            Request appointment
          </Link>
        </div>
      </div>
      <div className="mx-auto hidden max-w-6xl gap-6 px-8 pb-2 text-xs text-ink-soft md:flex">
        {locations.map((loc) => (
          <a key={loc.id} href={loc.phoneHref} className="hover:text-ink">
            {loc.shortName}: {loc.phone}
          </a>
        ))}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--paper-deep)_70%,white)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl text-sky-deep">{site.brand}</p>
          <p className="mt-3 max-w-sm text-sm text-ink-soft">{site.tagline}</p>
          <p className="mt-4 text-xs text-ink-soft">
            Hours vary by location — please call to confirm. Website content is educational and not a diagnosis.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">Locations</p>
          <ul className="mt-4 space-y-4 text-sm">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Link href={`/${loc.slug}`} className="font-medium hover:underline">
                  {loc.shortName}
                </Link>
                <p className="text-ink-soft">
                  {loc.street}
                  <br />
                  {loc.city}, {loc.state} {loc.zip}
                </p>
                <a href={loc.phoneHref} className="text-sage hover:underline">
                  {loc.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">More</p>
          <ul className="mt-4 columns-2 gap-6 text-sm text-ink-soft">
            {footerLinks.map((l) => (
              <li key={l.href} className="mb-2 break-inside-avoid">
                <Link href={l.href} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-5 py-5 text-center text-xs text-ink-soft md:px-8">
        © {new Date().getFullYear()} {site.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
