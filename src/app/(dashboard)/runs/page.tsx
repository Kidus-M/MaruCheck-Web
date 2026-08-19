import Link from "next/link";
import { EmptyState, PageHeader, StatusPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function RunsPage() {
  const { runs } = await getDashboardSnapshot();
  return (
    <div className="page-stack">
      <PageHeader
        description="Every verification decision, from diff and plan to findings and retained artifacts."
        eyebrow="Proof / Runs"
        title="Verification runs"
      />
      {runs.length === 0 ? (
        <EmptyState
          action={{ href: "/projects/connect", label: "Connect repository" }}
          description="Runs appear after a connected project posts a schema-versioned MaruCheck report."
          title="No verification runs have been ingested."
        />
      ) : (
        <section className="panel table-panel">
          <div className="filter-row">
            <button className="filter-chip filter-chip--active" type="button">
              All runs <span>{runs.length}</span>
            </button>
            <button className="filter-chip" type="button">
              Blocked <span>{runs.filter((run) => run.status === "blocked").length}</span>
            </button>
            <button className="filter-chip" type="button">
              Passed <span>{runs.filter((run) => run.status === "passed").length}</span>
            </button>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Status</th>
                  <th>Project</th>
                  <th>Risk</th>
                  <th>Evidence</th>
                  <th>Duration</th>
                  <th>Completed</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <Link className="run-title" href={`/runs/${run.id}`}>
                        <strong>{run.title}</strong>
                        <small>
                          {run.id} · {run.commit}
                        </small>
                      </Link>
                    </td>
                    <td>
                      <StatusPill status={run.status} />
                    </td>
                    <td>{run.project}</td>
                    <td className="tabular">
                      {run.risk}
                      <small>/100</small>
                    </td>
                    <td className="tabular">{run.evidence}</td>
                    <td>{run.duration}</td>
                    <td>{run.completedAt}</td>
                    <td>
                      <Link
                        className="row-arrow"
                        href={`/runs/${run.id}`}
                        aria-label={`Open ${run.id}`}
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
      )}
    </div>
  );
}
