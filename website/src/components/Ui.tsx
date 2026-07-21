import Link from "next/link";

export function CtaRow({
  primaryHref = "/contact#request",
  primaryLabel = "Request appointment",
  phoneHref,
  phoneLabel,
}: {
  primaryHref?: string;
  primaryLabel?: string;
  phoneHref?: string;
  phoneLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={primaryHref}
        className="rounded-full bg-sage px-5 py-3 text-sm font-medium text-white transition hover:bg-sage-deep"
      >
        {primaryLabel}
      </Link>
      {phoneHref && phoneLabel ? (
        <a
          href={phoneHref}
          className="rounded-full bg-white/70 px-5 py-3 text-sm font-medium text-sky-deep ring-1 ring-[var(--line)] backdrop-blur transition hover:bg-white"
        >
          Call {phoneLabel}
        </a>
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
          <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <span className="text-sky transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-2 max-w-3xl text-sm text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
