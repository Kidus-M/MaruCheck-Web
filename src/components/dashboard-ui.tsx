import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import type { GateStatus, Severity } from "@/lib/dashboard-data";

export function PageHeader({
  action,
  description,
  eyebrow,
  title,
}: {
  readonly action?: ReactNode;
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {action === undefined ? null : <div className="page-header__action">{action}</div>}
    </header>
  );
}

export function StatusPill({ status }: { readonly status: GateStatus }) {
  return (
    <span className={`status-pill status-pill--${status}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}

export function SeverityPill({ severity }: { readonly severity: Severity }) {
  return <span className={`severity severity--${severity}`}>{severity}</span>;
}

export function SectionHeading({
  action,
  description,
  title,
}: {
  readonly action?: { readonly href: string; readonly label: string };
  readonly description?: string;
  readonly title: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description === undefined ? null : <p>{description}</p>}
      </div>
      {action === undefined ? null : (
        <Link href={action.href}>
          {action.label}
          <Icon name="arrow" />
        </Link>
      )}
    </div>
  );
}

export function PrimaryLink({
  children,
  href,
}: {
  readonly children: ReactNode;
  readonly href: string;
}) {
  return (
    <Link className="button button--primary" href={href}>
      {children}
      <Icon name="arrow" />
    </Link>
  );
}

export function SecondaryLink({
  children,
  href,
}: {
  readonly children: ReactNode;
  readonly href: string;
}) {
  return (
    <Link className="button button--secondary" href={href}>
      {children}
    </Link>
  );
}

export function ProofOrbit({
  coverage,
  score,
}: {
  readonly coverage: number;
  readonly score: number;
}) {
  const circumference = 2 * Math.PI * 48;
  const covered = circumference * (coverage / 100);
  const uncovered = circumference - covered;
  return (
    <figure
      className="proof-orbit"
      aria-label={`${score} quality score with ${coverage}% requirement coverage`}
    >
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <circle className="proof-orbit__track" cx="60" cy="60" r="48" />
        <circle
          className="proof-orbit__coverage"
          cx="60"
          cy="60"
          r="48"
          strokeDasharray={`${covered.toFixed(1)} ${uncovered.toFixed(1)}`}
        />
        <circle className="proof-orbit__inner" cx="60" cy="60" r="36" />
        <circle className="proof-orbit__issue" cx="26" cy="26" r="4" />
      </svg>
      <figcaption>
        <strong>{score}</strong>
        <span>quality score</span>
      </figcaption>
    </figure>
  );
}

export function CoverageBar({ value }: { readonly value: number }) {
  return (
    <span className="coverage-bar" aria-label={`${value}% covered`}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}
