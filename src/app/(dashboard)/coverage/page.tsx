import { CoverageBar, EmptyState, PageHeader, SectionHeading } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function CoveragePage() {
  const { coverage } = await getDashboardSnapshot();
  const covered = coverage.reduce((sum, area) => sum + area.covered, 0);
  const total = coverage.reduce((sum, area) => sum + area.total, 0);
  if (total === 0) {
    return (
      <div className="page-stack">
        <PageHeader description="Trace approved intent through requirements to the evidence that supports release." eyebrow="Proof / Coverage" title="Requirement coverage" />
        <EmptyState
          action={{ href: "/projects/connect", label: "Connect repository" }}
          description="Coverage is calculated from requirement-level evidence in ingested verification reports."
          title="No requirement evidence is stored."
        />
      </div>
    );
  }
  return (
    <div className="page-stack">
      <PageHeader description="Trace approved intent through requirements to the evidence that supports release." eyebrow="Proof / Coverage" title="Requirement coverage" />
      <section className="coverage-hero panel">
        <div className="coverage-hero__score"><span>{Math.round((covered / total) * 100)}</span><small>% covered</small></div>
        <div><p className="eyebrow">Feature → requirement → evidence</p><h2>{covered} of {total} protected requirements have conclusive proof.</h2><p>Seven requirements need stronger automated evidence before the organization reaches its 100% critical-coverage policy.</p></div>
        <dl><div><dt>Evidence objects</dt><dd>66</dd></div><div><dt>Critical coverage</dt><dd>92%</dd></div><div><dt>Planning gaps</dt><dd>3</dd></div></dl>
      </section>
      <div className="coverage-layout">
        <section className="panel coverage-map">
          <SectionHeading description="Grouped by product area" title="Coverage map" />
          {coverage.map((area) => {
            const value = Math.round((area.covered / area.total) * 100);
            return <article key={area.label}><span className={`coverage-map__mark coverage-map__mark--${area.color}`}>○</span><div><header><span><strong>{area.label}</strong><small>{area.covered} of {area.total} requirements</small></span><b>{value}%</b></header><CoverageBar value={value} /><footer><span>{area.evidence} evidence objects</span><button type="button">Inspect mapping<Icon name="arrow" /></button></footer></div></article>;
          })}
        </section>
        <aside className="panel coverage-gaps">
          <SectionHeading description="Highest release impact first" title="Coverage gaps" />
          <ol><li><span>01</span><div><strong>Webhook replay defense</strong><p>Automated evidence is inconclusive.</p><small>subscription-management#SUB-009</small></div></li><li><span>02</span><div><strong>Last-owner preservation</strong><p>No regression test is linked.</p><small>workspace-membership#TEAM-007</small></div></li><li><span>03</span><div><strong>Dashboard error boundary</strong><p>Manual review only.</p><small>web-foundation#WEB-004</small></div></li></ol>
        </aside>
      </div>
    </div>
  );
}
