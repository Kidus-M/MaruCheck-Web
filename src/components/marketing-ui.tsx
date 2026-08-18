import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export function Eyebrow({ children }: { readonly children: ReactNode }) {
  return <p className="marketing-eyebrow">{children}</p>;
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
    <Link className={secondary ? "button button--paper" : "button button--coral"} href={href}>
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
      <div className="marketing-container" data-reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-orbit" aria-hidden="true">
        <i />
        <i />
      </div>
    </section>
  );
}

export function ProofDiagram() {
  return (
    <div className="proof-diagram" aria-label="A release proof orbit showing one blocked gap">
      <div className="proof-diagram__ring proof-diagram__ring--outer">
        <i />
        <i />
        <i />
      </div>
      <div className="proof-diagram__ring proof-diagram__ring--inner">
        <i />
        <i />
      </div>
      <div className="proof-diagram__core">
        <span>Release</span>
        <strong>Blocked</strong>
        <small>1 proof gap</small>
      </div>
      <span className="proof-diagram__label proof-diagram__label--intent">Approved intent</span>
      <span className="proof-diagram__label proof-diagram__label--evidence">Evidence retained</span>
      <span className="proof-diagram__label proof-diagram__label--gap">Gap found</span>
    </div>
  );
}
