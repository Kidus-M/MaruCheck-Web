import Link from "next/link";
import {
  CoverageBar,
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
  const blockedProject = data.projects.find((project) => project.status === "blocked")!;
  const openFindings = data.findings.length;
  const evidenceCount = data.runs.reduce((total, run) => total + run.evidence, 0);

  return (
    <div className="page-stack">
      <PageHeader
        action={<PrimaryLink href="/runs/RUN-1048">Open latest run</PrimaryLink>}
        description="The release decision, its supporting evidence, and the gaps that need attention."
        eyebrow="Tuesday · 18 August"
        title={`Good afternoon, ${data.viewer.name.split(" ")[0]}.`}
      />

      <section className="release-card" aria-labelledby="release-heading">
        <div className="release-card__orbit">
          <ProofOrbit coverage={86} score={87} />
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
            <StatusPill status="blocked" />
          </div>
          <h2 id="release-heading">One proof gap stands between this commit and release.</h2>
          <p>
            Invoice ownership failed against an approved critical requirement. The rest of the
            selected evidence is conclusive.
          </p>
          <div className="release-card__finding">
            <span className="finding-index">01</span>
            <div>
              <strong>Invoice ownership check can be bypassed</strong>
              <small>invoice-access#INV-001 · Critical</small>
            </div>
            <Link href="/findings/FIND-0092" aria-label="Open invoice ownership finding">
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="release-card__meta">
          <span>Latest proof</span>
          <strong>8f2c1a7</strong>
          <small>8 min ago</small>
        </div>
      </section>

      <section className="metric-grid" aria-label="Quality metrics">
        <article className="metric-card">
          <span>Requirement coverage</span>
          <strong>
            86<small>%</small>
          </strong>
          <CoverageBar value={86} />
          <p>26 of 33 protected requirements</p>
        </article>
        <article className="metric-card">
          <span>Open findings</span>
          <strong>
            {openFindings}
            <small> total</small>
          </strong>
          <p className="metric-split">
            <b>1 critical</b>
            <span>1 high · 1 medium</span>
          </p>
        </article>
        <article className="metric-card">
          <span>Evidence retained</span>
          <strong>
            {evidenceCount}
            <small> objects</small>
          </strong>
          <p>Across the four latest verification runs</p>
        </article>
        <article className="metric-card metric-card--risk">
          <span>Highest active risk</span>
          <strong>
            {blockedProject.risk}
            <small>/100</small>
          </strong>
          <p>{blockedProject.name} · authorization change</p>
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
