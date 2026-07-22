import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { locations } from "@/lib/locations";
import { footerLinks, site } from "@/lib/site";

export { SiteHeader } from "@/components/SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--paper-deep)_70%,white)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <BrandLogo size={44} />
          <p className="mt-3 max-w-sm text-sm text-ink-soft">{site.tagline}</p>
          <p className="mt-4 text-xs text-ink-soft">
            Hours: Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat &amp; Sun Closed (both offices). Website content
            is educational and not a diagnosis. Web leads are followed up by Wendy Delgado for both offices.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-ink-soft">
            {locations.map((loc) => (
              <li key={loc.id}>
                <span className="font-medium text-ink">{loc.shortName}:</span> {loc.hoursNote}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Locations</p>
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
                <a href={loc.phoneHref} className="text-brand hover:underline">
                  {loc.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">More</p>
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
