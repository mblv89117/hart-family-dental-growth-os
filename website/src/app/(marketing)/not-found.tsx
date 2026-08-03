import Link from "next/link";
import { PageHero, Prose } from "@/components/PageHero";
import { locations } from "@/lib/locations";

export default function NotFound() {
  return (
    <>
      <PageHero
        title="Page not found"
        body="That address isn’t on this site. Use the links below or call an office for help."
        primaryHref="/contact#request"
        secondaryHref="/"
        secondaryLabel="Back to home"
      />
      <Prose>
        <ul className="space-y-3 text-sm text-ink-soft">
          <li>
            <Link href="/" className="text-sage hover:underline focus-ring rounded">
              Home
            </Link>
          </li>
          <li>
            <Link href="/services" className="text-sage hover:underline focus-ring rounded">
              Services
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-sage hover:underline focus-ring rounded">
              Contact &amp; scheduling
            </Link>
          </li>
          {locations.map((loc) => (
            <li key={loc.id}>
              <Link href={loc.path} className="text-sage hover:underline focus-ring rounded">
                {loc.shortName}
              </Link>
              {" · "}
              <a href={loc.phoneHref} className="hover:underline focus-ring rounded">
                {loc.phone}
              </a>
            </li>
          ))}
        </ul>
      </Prose>
    </>
  );
}
