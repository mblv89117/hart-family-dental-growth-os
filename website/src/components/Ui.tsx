import Link from "next/link";

export function CtaRow({
  primaryHref = "/contact#request",
  primaryLabel = "Request appointment",
  phoneHref,
  phoneLabel,
  secondaryHref,
  secondaryLabel,
}: {
  primaryHref?: string;
  primaryLabel?: string;
  phoneHref?: string;
  phoneLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={primaryHref}
        className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
      >
        {primaryLabel}
      </Link>
      {phoneHref && phoneLabel ? (
        <a
          href={phoneHref}
          className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white focus-ring"
        >
          Call {phoneLabel}
        </a>
      ) : null}
      {secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white focus-ring"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl text-sky-deep md:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-ink-soft">{body}</p> : null}
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {items.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="cursor-pointer list-none font-medium text-ink marker:content-none focus-ring rounded">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <span className="text-sky transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </span>
          </summary>
          <p className="mt-2 max-w-3xl text-sm text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Shared conversion strip used on service and financing surfaces */
export function ConversionStrip() {
  return (
    <div className="rounded-[1.25rem] bg-[linear-gradient(160deg,color-mix(in_oklab,var(--sky)_14%,white),white)] p-6 ring-1 ring-[var(--line)]">
      <p className="font-display text-2xl text-sky-deep">Ready for the next step?</p>
      <p className="mt-2 text-sm text-ink-soft">
        New patients are welcome. Ask about CareCredit financing, same-day openings, and the soonest available visit.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/contact#request"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-deep focus-ring"
        >
          Request appointment
        </Link>
        <Link
          href="/new-patients"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] focus-ring"
        >
          New patient info
        </Link>
        <Link
          href="/financing"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] focus-ring"
        >
          CareCredit &amp; payment
        </Link>
        <Link
          href="/services/tooth-pain-broken-teeth"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-brand ring-1 ring-[var(--line)] focus-ring"
        >
          Tooth pain / urgent care
        </Link>
      </div>
    </div>
  );
}
