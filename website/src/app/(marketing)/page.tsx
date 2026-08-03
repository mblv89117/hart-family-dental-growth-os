import Link from "next/link";
import { AppointmentForm } from "@/components/AppointmentForm";
import { SectionHeading } from "@/components/Ui";
import { locations } from "@/lib/locations";
import { services } from "@/lib/site";

const highlights = [
  "New patients welcome at both offices",
  "Same-day appointments subject to availability",
  "English- and Spanish-speaking team",
  "Dental implants and full-arch options",
  "Full, partial, and implant-supported dentures",
  "Restorative care: crowns, bridges, extractions & more",
  "3D CBCT imaging and digital impressions",
];

export default function HomePage() {
  return (
    <>
      <section className="desert-sky relative overflow-hidden">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 md:px-8 md:pb-14 md:pt-20">
          <h1 className="reveal max-w-2xl text-3xl font-medium leading-tight text-ink md:text-5xl">
            Comprehensive Dental Care for Healthy, Confident Smiles
          </h1>
          <p className="reveal-delay mt-4 max-w-xl text-ink-soft md:mt-5">
            Hart Family Dental provides personalized general, restorative, implant, and denture care at convenient
            locations in Desert Hot Springs and Yucca Valley.
          </p>
          <div className="reveal-delay-2 mt-7 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact#request"
                className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
              >
                Request Appointment
              </Link>
              <Link
                href="#locations"
                className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white focus-ring"
              >
                Choose a Location
              </Link>
              <Link
                href="/services/tooth-pain-broken-teeth"
                className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-brand ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white focus-ring"
              >
                Tooth pain / urgent care
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {locations.map((loc) => (
                <a
                  key={loc.id}
                  href={loc.phoneHref}
                  className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white focus-ring"
                >
                  Call {loc.shortName}
                </a>
              ))}
            </div>
          </div>
          <div className="float-soft pointer-events-none absolute right-[-10%] top-[18%] hidden h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_70%)] md:block" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <li
              key={h}
              className="rounded-[1.1rem] bg-white/70 p-5 text-sm font-medium text-ink-soft ring-1 ring-[var(--line)]"
            >
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section id="locations" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <SectionHeading
          eyebrow="Locations"
          title="Care close to home"
          body="Choose the office that fits your drive — same brand, same commitment to comfortable, honest care."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={loc.path}
              className="group rounded-[1.4rem] bg-[linear-gradient(160deg,color-mix(in_oklab,var(--sky)_16%,white),white)] p-7 ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
            >
              <p className="font-display text-3xl text-sky-deep">{loc.shortName}</p>
              <p className="mt-3 text-sm text-ink-soft">
                {loc.street}
                <br />
                {loc.city}, {loc.state} {loc.zip}
              </p>
              <p className="mt-4 text-sm text-ink-soft">{loc.hoursNote}</p>
              <p className="mt-4 text-sage group-hover:underline">{loc.phone}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[color-mix(in_oklab,var(--paper-deep)_55%,white)] py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Services"
            title="Everyday care and advanced solutions"
            body="We help patients maintain healthy smiles — and restore comfort, confidence, and function when more is needed."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="block h-full border-t border-[var(--line)] pt-5 transition hover:border-sage">
                  <h3 className="font-display text-2xl text-sky-deep">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.05fr] md:px-8">
        <div>
          <SectionHeading
            eyebrow="Next step"
            title="Request a visit"
            body="New patients are welcome. Prefer the phone? Call your closest office and we’ll help you get scheduled — appointments are confirmed by our team, not guaranteed online."
          />
          <div className="mt-8 space-y-3 text-sm">
            {locations.map((loc) => (
              <a key={loc.id} href={loc.phoneHref} className="block font-medium text-sage hover:underline">
                {loc.shortName}: {loc.phone}
              </a>
            ))}
          </div>
        </div>
        <AppointmentForm />
      </section>
    </>
  );
}
