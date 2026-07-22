import Image from "next/image";
import Link from "next/link";
import { AppointmentForm } from "@/components/AppointmentForm";
import { CtaRow, SectionHeading } from "@/components/Ui";
import { locations } from "@/lib/locations";
import { services, site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="desert-sky relative min-h-[100svh] overflow-hidden">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-36 md:justify-center md:px-8 md:pb-24 md:pt-40">
          <div className="reveal flex items-center gap-4 md:gap-6">
            <Image
              src="/logo.svg"
              alt=""
              width={88}
              height={88}
              priority
              className="rounded-[1.35rem] shadow-[var(--shadow)] md:h-[112px] md:w-[112px]"
            />
            <p className="font-display text-4xl leading-[0.95] tracking-tight text-brand md:text-6xl lg:text-7xl">
              {site.brand}
            </p>
          </div>
          <h1 className="reveal-delay mt-6 max-w-xl text-xl font-medium text-ink md:text-2xl">
            Family dentistry that feels welcoming — with advanced options when you’re ready.
          </h1>
          <p className="reveal-delay-2 mt-4 max-w-lg text-ink-soft">
            Two High Desert & Coachella Valley offices. Clear next steps for checkups, implants, restorative care, and
            dentist-supervised teeth straightening.
          </p>
          <div className="reveal-delay-2 mt-8">
            <CtaRow />
          </div>
          <div className="float-soft pointer-events-none absolute right-[-10%] top-[22%] hidden h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_70%)] md:block" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <SectionHeading
          eyebrow="Locations"
          title="Care close to home"
          body="Choose the office that fits your drive — same brand, same commitment to comfortable, honest care."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/${loc.slug}`}
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
            body="New patients are welcome. Prefer the phone? Call your closest office and we’ll help you get scheduled."
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
