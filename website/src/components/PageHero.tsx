import Link from "next/link";
import { ReactNode } from "react";
import { CtaRow } from "@/components/Ui";

export function PageHero({
  brandSignal = "Hart Family Dental",
  title,
  body,
  phoneHref,
  phoneLabel,
  primaryHref = "/contact#request",
}: {
  brandSignal?: string;
  title: string;
  body: string;
  phoneHref?: string;
  phoneLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="desert-sky relative overflow-hidden pt-32">
      <div className="grain absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pb-20">
        <p className="reveal font-display text-4xl text-sky-deep md:text-5xl">{brandSignal}</p>
        <h1 className="reveal-delay mt-4 max-w-3xl text-2xl font-medium text-ink md:text-3xl">{title}</h1>
        <p className="reveal-delay-2 mt-4 max-w-2xl text-ink-soft">{body}</p>
        <div className="reveal-delay-2 mt-8">
          <CtaRow primaryHref={primaryHref} phoneHref={phoneHref} phoneLabel={phoneLabel} />
        </div>
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">{children}</div>;
}

export function LegalDoc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero title={title} body="Please review carefully. Drafts may be updated after legal review." />
      <Prose>
        <article className="prose-hfd max-w-3xl space-y-4 text-sm text-ink-soft">{children}</article>
        <p className="mt-10 text-sm">
          <Link href="/contact" className="text-sage hover:underline">
            Contact us
          </Link>
        </p>
      </Prose>
    </>
  );
}
