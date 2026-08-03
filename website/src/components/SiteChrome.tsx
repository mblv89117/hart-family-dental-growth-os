import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { locations, paymentFinancingCopy } from "@/lib/locations";
import { footerLinks, site } from "@/lib/site";
import { serviceCategories } from "@/lib/services";

function LocationSocialLinks({ loc }: { loc: (typeof locations)[number] }) {
  const links: { label: string; href: string }[] = [];
  if (loc.social.facebook) links.push({ label: "Facebook", href: loc.social.facebook });
  if (loc.social.yelp) links.push({ label: "Yelp", href: loc.social.yelp });
  if (loc.social.googleBusinessProfile) {
    links.push({ label: "Google", href: loc.social.googleBusinessProfile });
  }
  if (links.length === 0) return null;
  return (
    <>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-deep hover:underline focus-ring rounded"
        >
          {loc.shortName} {link.label}
        </a>
      ))}
    </>
  );
}

export { SiteHeader } from "@/components/SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--paper-deep)_70%,white)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <BrandLogo variant="horizontal" size={180} />
          <p className="mt-3 max-w-sm text-sm text-ink-soft">{site.tagline}</p>
          <p className="mt-4 text-xs text-ink-soft">
            Website content is educational and not a diagnosis. Treatment recommendations are based on an individual
            evaluation. Web leads are followed up by Wendy Delgado for both offices.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-ink-soft">
            {locations.map((loc) => (
              <li key={loc.id}>
                <span className="font-medium text-ink">{loc.shortName}:</span> {loc.hoursNote}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {locations.map((loc) => (
              <LocationSocialLinks key={loc.id} loc={loc} />
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-soft">{paymentFinancingCopy}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">Locations</p>
          <ul className="mt-4 space-y-4 text-sm">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Link href={loc.path} className="font-medium hover:underline">
                  {loc.shortName}
                </Link>
                <p className="text-ink-soft">
                  {loc.street}
                  <br />
                  {loc.city}, {loc.state} {loc.zip}
                </p>
                <a href={loc.phoneHref} className="text-brand-deep hover:underline focus-ring rounded">
                  {loc.phone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">Services</p>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {serviceCategories.map((c) => (
              <li key={c.id}>
                <Link href={`/services/${c.slug}`} className="hover:text-ink">
                  {c.title}
                </Link>
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
