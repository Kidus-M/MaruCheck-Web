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
      <span className="brand__mark" aria-hidden="true">
        <span />
      </span>
      <span className="brand__name">
        Maru<span>Check</span>
      </span>
    </Link>
  );
}
