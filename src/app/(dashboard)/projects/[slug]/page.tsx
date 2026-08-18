import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CoverageBar,
  PageHeader,
  PrimaryLink,
  SectionHeading,
  SeverityPill,
  StatusPill,
} from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export async function generateStaticParams() {
  const { projects } = await getDashboardSnapshot();
  return projects.map((project) => ({ slug: project.name }));
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const data = await getDashboardSnapshot();
  const project = data.projects.find((item) => item.name === slug);
  if (project === undefined) notFound();
  const runs = data.runs.filter((run) => run.project === project.name);
  const findings = data.findings.filter((finding) => finding.project === project.name);

  return (
    <div className="page-stack">
      <PageHeader
        action={<PrimaryLink href="/runs/RUN-1048">Verify latest change</PrimaryLink>}
        description={`${project.repository} · ${project.branch} · Last verified ${project.lastVerified}`}
        eyebrow="Projects / Project overview"
        title={project.name}
      />
      <section className="project-hero panel">
        <div>
          <StatusPill status={project.status} />
          <h2>
            {project.status === "blocked"
              ? "Release held by one critical finding"
              : "Current release proof is complete"}
          </h2>
          <p>
            {project.status === "blocked"
              ? "The latest verification found a contract-level authorization failure. All source execution remained in GitHub Actions."
              : "Every selected blocking requirement has conclusive evidence for the latest commit."}
          </p>
        </div>
        <dl>
          <div>
            <dt>Risk</dt>
            <dd>
              {project.risk}
              <small>/100</small>
            </dd>
          </div>
          <div>
            <dt>Coverage</dt>
            <dd>
              {project.coverage}
              <small>%</small>
            </dd>
          </div>
          <div>
            <dt>Contracts</dt>
            <dd>{project.activeContracts}</dd>
          </div>
          <div>
            <dt>Findings</dt>
            <dd>{project.findingCount}</dd>
          </div>
        </dl>
      </section>
      <div className="overview-grid">
        <section className="panel">
          <SectionHeading
            action={{ href: "/runs", label: "All runs" }}
            title="Recent verification"
          />
          <div className="compact-list">
            {runs.length === 0 ? (
              <p className="empty-copy">No verification runs yet.</p>
            ) : (
              runs.map((run) => (
                <Link href={`/runs/${run.id}`} key={run.id}>
                  <StatusPill status={run.status} />
                  <span>
                    <strong>{run.title}</strong>
                    <small>
                      {run.commit} · {run.completedAt}
                    </small>
                  </span>
                  <Icon name="chevron" />
                </Link>
              ))
            )}
          </div>
        </section>
        <section className="panel">
          <SectionHeading
            action={{ href: "/findings", label: "All findings" }}
            title="Open findings"
          />
          <div className="compact-list">
            {findings.length === 0 ? (
              <p className="empty-copy">No open findings.</p>
            ) : (
              findings.map((finding) => (
                <Link href={`/findings/${finding.id}`} key={finding.id}>
                  <SeverityPill severity={finding.severity} />
                  <span>
                    <strong>{finding.title}</strong>
                    <small>
                      {finding.contract} · {finding.age} ago
                    </small>
                  </span>
                  <Icon name="chevron" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
      <section className="panel">
        <SectionHeading
          description="Approved intent with linked evidence"
          title="Contract coverage"
        />
        <div className="contract-coverage-list">
          {data.contracts.slice(0, project.activeContracts).map((contract) => (
            <Link href="/contracts" key={contract.id}>
              <span className="contract-monogram">◯</span>
              <span>
                <strong>{contract.title}</strong>
                <small>
                  {contract.id} · {contract.requirements} requirements
                </small>
              </span>
              <CoverageBar value={contract.coverage} />
              <b>{contract.coverage}%</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
