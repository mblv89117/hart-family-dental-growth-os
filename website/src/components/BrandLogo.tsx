import Image from "next/image";
import Link from "next/link";

type Props = {
  size?: number;
  withWordmark?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 40,
  withWordmark = true,
  href = "/",
  className = "",
  priority = false,
}: Props) {
  const mark = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Hart Family Dental"
        width={size}
        height={size}
        priority={priority}
        className="rounded-[22%]"
      />
      {withWordmark ? (
        <span
          className="font-display tracking-tight text-[var(--brand)]"
          style={{ fontSize: Math.max(18, size * 0.55) }}
        >
          Hart Family Dental
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="group inline-flex" aria-label="Hart Family Dental home">
      {mark}
    </Link>
  );
}
