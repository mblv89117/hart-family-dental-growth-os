import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

type Variant = "horizontal" | "mark" | "auto";

type Props = {
  /** Mark height in px when using mark/auto on small screens */
  size?: number;
  /** Prefer full horizontal lockup when space permits */
  variant?: Variant;
  withWordmark?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

/**
 * Logo assets ship on black plates. We frame them in matching rounded brand plates
 * so they read intentionally on light UI rather than as floating black boxes.
 */
export function BrandLogo({
  size = 40,
  variant = "auto",
  withWordmark = false,
  href = "/",
  className = "",
  priority = false,
}: Props) {
  const useHorizontal = variant === "horizontal" || variant === "auto";
  const horizontalHeight = Math.max(40, size);

  const mark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {useHorizontal ? (
        <>
          <span
            className="hidden overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-black/20 sm:inline-flex"
            style={{ height: horizontalHeight }}
          >
            <Image
              src={site.logo.horizontalSm}
              alt="Hart Family Dental"
              width={800}
              height={400}
              priority={priority}
              sizes="(max-width: 640px) 0px, 240px"
              className="h-full w-auto"
            />
          </span>
          <span
            className="inline-flex overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-black/20 sm:hidden"
            style={{ width: size, height: size }}
          >
            <Image
              src={site.logo.markSm}
              alt="Hart Family Dental"
              width={256}
              height={256}
              priority={priority}
              sizes={`${size}px`}
              className="h-full w-full object-cover"
            />
          </span>
        </>
      ) : (
        <span
          className="inline-flex overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-black/20"
          style={{ width: size, height: size }}
        >
          <Image
            src={site.logo.markSm}
            alt="Hart Family Dental"
            width={256}
            height={256}
            priority={priority}
            sizes={`${size}px`}
            className="h-full w-full object-cover"
          />
        </span>
      )}
      {withWordmark ? (
        <span
          className="font-display tracking-tight text-[var(--brand)] sm:hidden"
          style={{ fontSize: Math.max(18, size * 0.55) }}
        >
          Hart Family Dental
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="group inline-flex focus-ring rounded-xl" aria-label="Hart Family Dental home">
      {mark}
    </Link>
  );
}
