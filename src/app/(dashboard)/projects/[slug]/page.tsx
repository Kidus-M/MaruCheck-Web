import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CoverageBar,
  PageHeader,
  PrimaryLink,
  SectionHeading,
  SeverityPill,
  StatusPill,
} from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { ProjectTokenManager } from "@/components/project-token-manager";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { getProjectTokenSummaries } from "@/lib/project-token-data";

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const data = await getDashboardSnapshot();
  // Accept the original display-name URL so bookmarks created before slug persistence still work.
  const project = data.projects.find((item) => item.slug === slug || item.name === slug);
  if (project === undefined) notFound();
  if (slug !== project.slug) redirect(`/projects/${project.slug}`);
  const tokens = await getProjectTokenSummaries(project.id);
  const runs = data.runs.filter((run) => run.project === project.name);
  const findings = data.findings.filter((finding) => finding.project === project.name);
  const contracts = data.contracts.filter((contract) => contract.projectId === project.id);

  return (
    <div className="page-stack">
      <PageHeader
        action={
          runs[0] ? (
            <PrimaryLink href={`/runs/${runs[0].id}`}>Open latest run</PrimaryLink>
          ) : undefined
        }
        description={`${project.repository} · ${project.branch} · Last verified ${project.lastVerified}`}
        eyebrow="Projects / Project overview"
        title={project.name}
      />
      <section className="project-hero panel">
        <div>
          <StatusPill status={project.status} />
          <h2>
            {runs.length === 0
              ? "Waiting for the first verification report"
              : project.status === "blocked"
                ? "Release held by one critical finding"
                : "Current release proof is complete"}
          </h2>
          <p>
            {runs.length === 0
              ? "The project and its ingestion credential are ready. Source execution remains local or in CI until a versioned report is submitted."
              : project.status === "blocked"
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
          {contracts.map((contract) => (
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
      <ProjectTokenManager
        canManage={data.viewer.role === "Owner"}
        projectSlug={project.slug}
        tokens={tokens}
      />
    </div>
  );
}
