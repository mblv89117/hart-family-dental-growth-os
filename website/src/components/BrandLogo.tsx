import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { site } from "@/lib/site";

type Variant = "horizontal" | "mark" | "auto";

type Props = {
  /**
   * Horizontal: preferred desktop display width in px (~170–220).
   * Mark: square edge length in px.
   */
  size?: number;
  /** Prefer full horizontal lockup when space permits */
  variant?: Variant;
  withWordmark?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

/** Intrinsic size of cropped light horizontal lockup (transparent). */
const HORIZONTAL_INTRINSIC = { width: 1080, height: 319 } as const;

/**
 * Header/footer logos use the light transparent horizontal crop
 * (`hart-family-dental-logo-horizontal-light.png`) — no black plate.
 * Mark variant keeps a compact square for menus/icons.
 */
export function BrandLogo({
  size = 200,
  variant = "auto",
  withWordmark = false,
  href = "/",
  className = "",
  priority = false,
}: Props) {
  const useHorizontal = variant === "horizontal" || variant === "auto";
  const preferred = useHorizontal ? Math.min(220, Math.max(135, size)) : size;
  const desktopWidth = preferred;
  /** Mobile stays in ~135–165; honor compact sizes (e.g. mobile menu). */
  const mobileWidth = useHorizontal
    ? preferred <= 165
      ? preferred
      : Math.min(165, Math.max(135, Math.round(preferred * 0.75)))
    : size;

  const logoVars = {
    ["--logo-w-mobile"]: `${mobileWidth}px`,
    ["--logo-w-desktop"]: `${desktopWidth}px`,
  } as CSSProperties;

  const content = useHorizontal ? (
    <span className={`inline-flex items-center gap-2 ${className}`} style={logoVars}>
      <Image
        src={site.logo.horizontalLight}
        alt="Hart Family Dental"
        width={HORIZONTAL_INTRINSIC.width}
        height={HORIZONTAL_INTRINSIC.height}
        priority={priority}
        sizes={`(max-width: 639px) ${mobileWidth}px, ${desktopWidth}px`}
        className="h-auto w-[min(52vw,var(--logo-w-mobile))] sm:w-[var(--logo-w-desktop)]"
      />
      {withWordmark ? (
        <span className="font-display tracking-tight text-[var(--brand)] sm:hidden" style={{ fontSize: 18 }}>
          Hart Family Dental
        </span>
      ) : null}
    </span>
  ) : (
    <span className={`inline-flex items-center gap-2 ${className}`}>
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

  if (!href) return content;
  return (
    <Link href={href} className="group inline-flex focus-ring rounded-lg" aria-label="Hart Family Dental home">
      {content}
    </Link>
  );
}
