import Link from "next/link";

export function MaruMark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <Link className={compact ? "brand brand--compact" : "brand"} href="/" aria-label="MaruCheck overview">
      <span className="brand__mark" aria-hidden="true">
        <span />
      </span>
      <span className="brand__name">
        Maru<span>Check</span>
      </span>
    </Link>
  );
}
