import { notFound } from "next/navigation";
import { PageHeader, SectionHeading, StatusPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function generateStaticParams() {
  const { runs } = await getDashboardSnapshot();
  return runs.map((run) => ({ id: run.id }));
}

export default async function RunDetailPage({ params }: PageProps<"/runs/[id]">) {
  const { id } = await params;
  const data = await getDashboardSnapshot();
  const run = data.runs.find((item) => item.id === id);
  if (run === undefined) notFound();
  return (
    <div className="page-stack">
      <PageHeader description={`${run.project} · ${run.commit} · ${run.completedAt}`} eyebrow={`Runs / ${run.id}`} title={run.title} />
      <section className="run-decision panel"><div><StatusPill status={run.status} /><h2>{run.status === "blocked" ? "Verification blocked this release" : run.status === "passed" ? "Verification supports release" : "Verification is still collecting evidence"}</h2><p>{run.status === "blocked" ? "A critical approved requirement has contradictory evidence. Review the finding before changing the gate." : "Selected requirements have conclusive evidence for this change."}</p></div><dl><div><dt>Risk</dt><dd>{run.risk}<small>/100</small></dd></div><div><dt>Evidence</dt><dd>{run.evidence}</dd></div><div><dt>Duration</dt><dd>{run.duration}</dd></div></dl></section>
      <div className="overview-grid">
        <section className="panel"><SectionHeading description="Why these checks ran" title="Verification plan" /><ol className="plan-list"><li><span>01</span><div><strong>Assess changed authorization paths</strong><p>Critical historical memory and invoice contract matched.</p></div><Icon name="check" /></li><li><span>02</span><div><strong>Run contract-linked Vitest files</strong><p>12 tests selected across billing and access control.</p></div><Icon name="check" /></li><li><span>03</span><div><strong>Run cross-account regression</strong><p>MEM-0143 restored the invoice ownership test.</p></div><Icon name={run.status === "blocked" ? "alert" : "check"} /></li></ol></section>
        <section className="panel"><SectionHeading description="Immutable artifacts from CI" title="Evidence bundle" /><div className="artifact-list"><span><Icon name="contracts" /><span><strong>report.json</strong><small>Structured findings and release gate</small></span><b>42 KB</b></span><span><Icon name="contracts" /><span><strong>verification-plan.json</strong><small>Selected requirements and test reasons</small></span><b>18 KB</b></span><span><Icon name="contracts" /><span><strong>vitest-stderr.txt</strong><small>Bounded adapter diagnostic</small></span><b>6 KB</b></span></div></section>
      </div>
    </div>
  );
}
