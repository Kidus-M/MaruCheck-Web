import { CoverageBar, PageHeader, PrimaryLink } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function ContractsPage() {
  const { contracts } = await getDashboardSnapshot();
  return (
    <div className="page-stack">
      <PageHeader action={<PrimaryLink href="/contracts/new">New contract</PrimaryLink>} description="Approved product meaning, requirement coverage, and evidence mapping." eyebrow="Proof / Contracts" title="Quality Contracts" />
      <section className="contract-list">
        {contracts.map((contract) => (
          <article className="contract-card" key={contract.id}>
            <header><span className="contract-monogram">{contract.status === "approved" ? "◎" : "○"}</span><div><span className={`contract-state contract-state--${contract.status}`}>{contract.status}</span><h2>{contract.title}</h2><p>{contract.id}</p></div><button aria-label={`Open ${contract.title}`} type="button"><Icon name="arrow" /></button></header>
            <div className="contract-card__statement"><span>Protected intent</span><p>{contract.id === "invoice-access" ? "Every invoice read is authorized against the authenticated account." : contract.id === "subscription-management" ? "Subscription state changes only after verified billing events." : contract.id === "workspace-membership" ? "Membership changes preserve accountable ownership and least privilege." : "The hosted surface remains healthy, attributable, and observable."}</p></div>
            <footer><div><span>Coverage</span><strong>{contract.coverage}%</strong><CoverageBar value={contract.coverage} /></div><dl><div><dt>Requirements</dt><dd>{contract.requirements}</dd></div><div><dt>Version</dt><dd>{contract.version}</dd></div><div><dt>Owner</dt><dd>{contract.owner}</dd></div><div><dt>Updated</dt><dd>{contract.updated}</dd></div></dl></footer>
          </article>
        ))}
      </section>
    </div>
  );
}
