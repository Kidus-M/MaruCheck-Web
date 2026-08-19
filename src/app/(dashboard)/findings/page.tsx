import Link from "next/link";
import { EmptyState, PageHeader, SeverityPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function FindingsPage() {
  const { findings } = await getDashboardSnapshot();
  const blocking = findings.filter((finding) =>
    ["critical", "high"].includes(finding.severity),
  ).length;
  return (
    <div className="page-stack">
      <PageHeader
        description="Contract violations and evidence gaps ordered by release impact."
        eyebrow="Proof / Findings"
        title="Open findings"
      />
      {findings.length === 0 ? (
        <EmptyState
          description="No open contract violations or evidence gaps are stored for this organization."
          eyebrow="Gate clear"
          title="No findings need attention."
        />
      ) : (
        <section className="finding-board">
          <div className="finding-board__summary">
            <p>
              <span>{findings.length}</span> open
            </p>
            <p>
              <span>{blocking}</span> blocking
            </p>
            <p>
              <span>{findings.length - blocking}</span> advisory
            </p>
            <div>
              <button className="filter-chip filter-chip--active" type="button">
                All
              </button>
              <button className="filter-chip" type="button">
                Assigned to me
              </button>
            </div>
          </div>
          <div className="finding-cards">
            {findings.map((finding, index) => (
              <Link href={`/findings/${finding.id}`} className="finding-card" key={finding.id}>
                <span className="finding-card__number">{String(index + 1).padStart(2, "0")}</span>
                <div className="finding-card__main">
                  <span>
                    <SeverityPill severity={finding.severity} />
                    <small>{finding.id}</small>
                  </span>
                  <h2>{finding.title}</h2>
                  <p>{finding.actual}</p>
                  <footer>
                    <span>{finding.contract}</span>
                    <span>{finding.project}</span>
                    <span>{finding.age} ago</span>
                  </footer>
                </div>
                <div className="finding-card__owner">
                  <span>{finding.owner.slice(0, 2).toUpperCase()}</span>
                  <small>{finding.owner}</small>
                  <Icon name="arrow" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
