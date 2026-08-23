import Image from "next/image";
import Link from "next/link";

export function MaruMark({
  compact = false,
  href = "/",
}: {
  readonly compact?: boolean;
  readonly href?: string;
}) {
  return (
    <Link
      className={compact ? "brand brand--compact" : "brand"}
      href={href}
      aria-label="MaruCheck home"
    >
      <Image
        className="brand__mark"
        src="/brand/marucheck-logo.png"
        alt=""
        width={28}
        height={28}
        aria-hidden="true"
      />
      <span className="brand__name">
        Maru<span>Check</span>
      </span>
    </Link>
  );
}
