import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { MarketingPageHeader } from "@/components/marketing-ui";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start with MaruCheck locally, then add shared proof workflows as your team grows.",
};

const tiers = [
  {
    name: "Local",
    price: "Free preview",
    note: "For individual projects and local evaluation.",
    items: [
      "Quality Contracts",
      "Risk-directed local runs",
      "CLI and MCP workflow",
      "Local evidence reports",
    ],
    cta: "Read the quickstart",
    href: "/docs/getting-started",
    featured: false,
  },
  {
    name: "Team",
    price: "Private beta",
    note: "For teams that need shared release evidence.",
    items: [
      "Everything in Local",
      "Hosted proof dashboard",
      "GitHub pull-request gates",
      "Shared findings and QA memory",
    ],
    cta: "Explore the dashboard",
    href: "/dashboard",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Design partner",
    note: "For organizations shaping advanced controls.",
    items: [
      "Everything in Team",
      "Organization-level controls",
      "Custom retention requirements",
      "Migration and workflow support",
    ],
    cta: "Review the architecture",
    href: "/docs",
    featured: false,
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Simple stages, honest status"
        title="Start local. Add shared proof when the team needs it."
        description="The local workflow is available to evaluate now. Hosted team billing is not active yet, so we show the product stage instead of pretending there is a finished price sheet."
      />
      <section className="marketing-section pricing-section">
        <div className="marketing-container pricing-grid">
          {tiers.map((tier) => (
            <article
              className={tier.featured ? "pricing-card pricing-card--featured" : "pricing-card"}
              data-reveal
              key={tier.name}
            >
              {tier.featured && <span className="pricing-card__flag">Current focus</span>}
              <p>{tier.name}</p>
              <h2>{tier.price}</h2>
              <span>{tier.note}</span>
              <ul>
                {tier.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                className={tier.featured ? "button button--coral" : "button button--paper"}
                href={tier.href}
              >
                {tier.cta}
                <Icon name="arrow" />
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note marketing-container">
          No payment flow is connected in this build. Final hosted pricing will be published before
          billing is enabled.
        </p>
      </section>
    </>
  );
}
