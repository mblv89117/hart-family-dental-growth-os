import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { CtaRow } from "@/components/Ui";
import { site } from "@/lib/site";

export function PageHero({
  brandSignal = "Hart Family Dental",
  title,
  body,
  phoneHref,
  phoneLabel,
  primaryHref = "/contact#request",
  secondaryHref,
  secondaryLabel,
}: {
  brandSignal?: string;
  title: string;
  body: string;
  phoneHref?: string;
  phoneLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="desert-sky relative overflow-hidden">
      <div className="grain absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-8 md:pb-16 md:pt-12">
        <div className="reveal flex items-center gap-3 md:gap-4">
          <Image
            src={site.logo.markSm}
            alt=""
            width={56}
            height={56}
            className="h-12 w-12 rounded-[0.9rem] bg-black object-cover ring-1 ring-black/20 md:h-14 md:w-14"
            priority
            sizes="56px"
          />
          <p className="font-display text-3xl text-brand md:text-5xl">{brandSignal}</p>
        </div>
        <h1 className="reveal-delay mt-4 max-w-3xl text-2xl font-medium text-ink md:text-3xl">{title}</h1>
        <p className="reveal-delay-2 mt-4 max-w-2xl text-ink-soft">{body}</p>
        <div className="reveal-delay-2 mt-8">
          <CtaRow
            primaryHref={primaryHref}
            phoneHref={phoneHref}
            phoneLabel={phoneLabel}
            secondaryHref={secondaryHref}
            secondaryLabel={secondaryLabel}
          />
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
          <Link href="/contact" className="text-sage hover:underline focus-ring rounded">
            Contact us
          </Link>
        </p>
      </Prose>
    </>
  );
}
