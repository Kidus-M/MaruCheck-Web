import { notFound } from "next/navigation";
import { PageHeader, SeverityPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function generateStaticParams() {
  const { findings } = await getDashboardSnapshot();
  return findings.map((finding) => ({ id: finding.id }));
}

export default async function FindingDetailPage({ params }: PageProps<"/findings/[id]">) {
  const { id } = await params;
  const { findings } = await getDashboardSnapshot();
  const finding = findings.find((item) => item.id === id);
  if (finding === undefined) notFound();
  return (
    <div className="page-stack page-stack--detail">
      <PageHeader description={`${finding.project} · ${finding.contract} · Opened ${finding.age} ago`} eyebrow={`Findings / ${finding.id}`} title={finding.title} />
      <div className="finding-detail-grid">
        <article className="panel finding-detail">
          <header><SeverityPill severity={finding.severity} /><span className="status-pill status-pill--blocked"><i />blocking</span></header>
          <section><span>Expected behavior</span><p>{finding.expected}</p></section>
          <section className="finding-detail__actual"><span>Observed behavior</span><p>{finding.actual}</p></section>
          <section><span>Why this blocks</span><p>An approved required expectation has failed. The result is reproducible and linked to retained automated evidence.</p></section>
          <section><span>Reproduce</span><code>maru verify --diff</code></section>
        </article>
        <aside className="finding-aside">
          <section className="panel"><h2>Accountability</h2><dl><div><dt>Owner</dt><dd>{finding.owner}</dd></div><div><dt>Status</dt><dd>Open</dd></div><div><dt>First seen</dt><dd>{finding.age} ago</dd></div><div><dt>Occurrences</dt><dd>1</dd></div></dl><button className="button button--primary" type="button">Assign finding<Icon name="arrow" /></button></section>
          <section className="panel"><h2>Evidence</h2><a href="#evidence"><Icon name="contracts" /><span><strong>vitest-stderr.txt</strong><small>Adapter diagnostic · 6 KB</small></span><Icon name="chevron" /></a><a href="#evidence"><Icon name="contracts" /><span><strong>report.json</strong><small>Structured report · 42 KB</small></span><Icon name="chevron" /></a></section>
        </aside>
      </div>
    </div>
  );
}
