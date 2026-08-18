import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export function Eyebrow({ children }: { readonly children: ReactNode }) {
  return (
    <p className="signal-label">
      <span /> {children}
    </p>
  );
}

export function MarketingCta({
  children,
  href,
  secondary = false,
}: {
  readonly children: ReactNode;
  readonly href: string;
  readonly secondary?: boolean;
}) {
  return (
    <Link
      className={
        secondary
          ? "marketing-button marketing-button--ghost"
          : "marketing-button marketing-button--signal"
      }
      href={href}
    >
      {children}
      <Icon name="arrow" />
    </Link>
  );
}

export function MarketingPageHeader({
  eyebrow,
  title,
  description,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <section className="marketing-page-hero">
      <div className="marketing-container marketing-page-hero__grid">
        <div data-reveal>
          <Eyebrow>{eyebrow}</Eyrow>
          <h1>{title}</h1>
        </div>
        <div className="marketing-page-hero__aside" data-reveal>
          <span>MARU / PUBLIC SYSTEM</span>
          <p>{description}</p>
        </div>
      </div>
      <div className="page-scanline" aria-hidden="true" />
    </section>
  );
}
