import Link from "next/link";
import { CoverageBar, PageHeader, PrimaryLink, StatusPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function ProjectsPage() {
  const { projects } = await getDashboardSnapshot();
  return (
    <div className="page-stack">
      <PageHeader
        action={<PrimaryLink href="/projects/connect">Connect repository</PrimaryLink>}
        description="Repositories that send verification metadata and evidence to this organization."
        eyebrow="Workspace / Projects"
        title="Projects"
      />
      <section className="project-card-grid" aria-label="Connected projects">
        {projects.map((project) => (
          <Link className="project-card" href={`/projects/${project.name}`} key={project.id}>
            <div className="project-card__top">
              <span className="project-seal project-seal--large">
                {project.name.slice(5, 7).toUpperCase()}
              </span>
              <StatusPill status={project.status} />
            </div>
            <div className="project-card__title">
              <h2>{project.name}</h2>
              <p>{project.repository}</p>
            </div>
            <dl className="project-card__stats">
              <div>
                <dt>Risk</dt>
                <dd>
                  {project.risk}
                  <small>/100</small>
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
            <div className="project-card__coverage">
              <span>
                <small>Requirement coverage</small>
                <b>{project.coverage}%</b>
              </span>
              <CoverageBar value={project.coverage} />
            </div>
            <footer>
              <span>
                <Icon name="branch" />
                {project.branch}
              </span>
              <span>{project.lastVerified}</span>
              <Icon name="arrow" />
            </footer>
          </Link>
        ))}
      </section>
      <section className="empty-invitation">
        <span className="empty-invitation__orbit" aria-hidden="true">
          <span />
        </span>
        <div>
          <p className="eyebrow">Keep the loop complete</p>
          <h2>Connect the next repository before it ships without proof.</h2>
          <p>
            MaruCheck stores only configured metadata and evidence. Source execution remains in
            local development and CI.
          </p>
        </div>
        <PrimaryLink href="/projects/connect">Connect project</PrimaryLink>
      </section>
    </div>
  );
}
