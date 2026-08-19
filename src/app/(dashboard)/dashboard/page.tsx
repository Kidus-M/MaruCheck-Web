import Link from "next/link";
import {
  CoverageBar,
  EmptyState,
  PageHeader,
  PrimaryLink,
  ProofOrbit,
  SectionHeading,
  SeverityPill,
  StatusPill,
} from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const data = await getDashboardSnapshot();
  const { viewer } = data;
  const latestRun = data.runs[0];
  const latestFinding = data.findings[0];

  if (!latestRun || data.projects.length === 0) {
    return (
      <div className="page-stack">
        <PageHeader
          description="Connect a repository, then send a verification report from local development or CI."
          eyebrow="Workspace ready"
          title={`Good to see you, ${viewer.name.split(" ")[0]}.`}
        />
        <EmptyState
          action={{ href: "/projects/connect", label: "Connect first project" }}
          description="MaruCheck will show release decisions here after the connected repository sends its first versioned report. Source execution stays in the repository's own environment."
          title="No hosted verification data yet."
        />
      </div>
    );
  }

  const highestRiskProject = [...data.projects].sort((a, b) => b.risk - a.risk)[0]!;
  const openFindings = data.findings.length;
  const evidenceCount = data.runs.reduce((total, run) => total + run.evidence, 0);
  const averageCoverage = Math.round(
    data.projects.reduce((total, project) => total + project.coverage, 0) / data.projects.length,
  );
  const coveredRequirements = data.coverage.reduce((total, area) => total + area.covered, 0);
  const totalRequirements = data.coverage.reduce((total, area) => total + area.total, 0);
  const criticalFindings = data.findings.filter(
    (finding) => finding.severity === "critical",
  ).length;
  const highFindings = data.findings.filter((finding) => finding.severity === "high").length;

  return (
    <div className="page-stack">
      <PageHeader
        action={<PrimaryLink href={`/runs/${latestRun.id}`}>Open latest run</PrimaryLink>}
        description="The release decision, its supporting evidence, and the gaps that need attention."
        eyebrow={new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date())}
        title={`Good afternoon, ${viewer.name.split(" ")[0]}.`}
      />

      <section className="release-card" aria-labelledby="release-heading">
        <div className="release-card__orbit">
          <ProofOrbit coverage={averageCoverage} score={100 - highestRiskProject.risk} />
          <p>
            <span className="legend-dot legend-dot--indigo" />
            Evidence linked
          </p>
          <p>
            <span className="legend-dot legend-dot--coral" />
            Gap detected
          </p>
        </div>
        <div className="release-card__decision">
          <div className="release-card__label">
            <span>Release decision</span>
            <StatusPill status={latestRun.status} />
          </div>
          <h2 id="release-heading">
            {latestRun.status === "blocked"
              ? "Verified evidence is holding this release."
              : latestRun.status === "passed"
                ? "The latest change has enough proof to release."
                : "Verification is still collecting evidence."}
          </h2>
          <p>
            {latestFinding
              ? `${latestFinding.title}. Review the linked expectation and retained evidence before changing the gate.`
              : "Every selected blocking requirement has conclusive evidence for this change."}
          </p>
          {latestFinding ? (
            <div className="release-card__finding">
              <span className="finding-index">01</span>
              <div>
                <strong>{latestFinding.title}</strong>
                <small>
                  {latestFinding.contract} · {latestFinding.severity}
                </small>
              </div>
              <Link
                href={`/findings/${latestFinding.id}`}
                aria-label={`Open ${latestFinding.title}`}
              >
                <Icon name="arrow" />
              </Link>
            </div>
          ) : null}
        </div>
        <div className="release-card__meta">
          <span>Latest proof</span>
          <strong>{latestRun.commit}</strong>
          <small>{latestRun.completedAt}</small>
        </div>
      </section>

      <section className="metric-grid" aria-label="Quality metrics">
        <article className="metric-card">
          <span>Requirement coverage</span>
          <strong>
            {averageCoverage}
            <small>%</small>
          </strong>
          <CoverageBar value={averageCoverage} />
          <p>
            {coveredRequirements} of {totalRequirements} protected requirements
          </p>
        </article>
        <article className="metric-card">
          <span>Open findings</span>
          <strong>
            {openFindings}
            <small> total</small>
          </strong>
          <p className="metric-split">
            <b>{criticalFindings} critical</b>
            <span>
              {highFindings} high · {openFindings - criticalFindings - highFindings} other
            </span>
          </p>
        </article>
        <article className="metric-card">
          <span>Evidence retained</span>
          <strong>
            {evidenceCount}
            <small> objects</small>
          </strong>
          <p>Across {data.runs.length} retained verification runs</p>
        </article>
        <article className="metric-card metric-card--risk">
          <span>Highest active risk</span>
          <strong>
            {highestRiskProject.risk}
            <small>/100</small>
          </strong>
          <p>{highestRiskProject.name} · latest analyzed change</p>
        </article>
      </section>

      <div className="overview-grid">
        <section className="panel panel--findings">
          <SectionHeading
            action={{ href: "/findings", label: "All findings" }}
            description="Ranked by release impact"
            title="Needs attention"
          />
          <div className="finding-list">
            {data.findings.map((finding, index) => (
              <Link className="finding-row" href={`/findings/${finding.id}`} key={finding.id}>
                <span className="finding-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="finding-row__body">
                  <span>
                    <SeverityPill severity={finding.severity} />
                    <small>{finding.contract}</small>
                  </span>
                  <strong>{finding.title}</strong>
                  <small>
                    {finding.project} · {finding.age} ago
                  </small>
                </span>
                <Icon name="chevron" />
              </Link>
            ))}
          </div>
        </section>

        <section className="panel panel--activity">
          <SectionHeading description="Contract, run, and memory events" title="Proof trail" />
          <ol className="activity-list">
            {data.activity.map((item) => (
              <li key={item.id}>
                <span
                  className={`activity-mark activity-mark--${item.status}`}
                  aria-hidden="true"
                />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <small>{item.time}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel panel--projects">
        <SectionHeading
          action={{ href: "/projects", label: "Manage projects" }}
          description="The repositories producing current proof"
          title="Project health"
        />
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Gate</th>
                <th>Risk</th>
                <th>Coverage</th>
                <th>Last verified</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link className="table-project" href={`/projects/${project.name}`}>
                      <span className="project-seal">{project.name.slice(5, 7).toUpperCase()}</span>
                      <span>
                        <strong>{project.name}</strong>
                        <small>{project.repository}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <StatusPill status={project.status} />
                  </td>
                  <td className="tabular">
                    <strong>{project.risk}</strong>
                    <small>/100</small>
                  </td>
                  <td>
                    <span className="coverage-cell">
                      <CoverageBar value={project.coverage} />
                      <small>{project.coverage}%</small>
                    </span>
                  </td>
                  <td>{project.lastVerified}</td>
                  <td>
                    <Link
                      className="row-arrow"
                      href={`/projects/${project.name}`}
                      aria-label={`Open ${project.name}`}
                    >
                      <Icon name="chevron" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
