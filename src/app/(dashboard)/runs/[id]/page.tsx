import { notFound } from "next/navigation";
import { PageHeader, SectionHeading, StatusPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { runDecisionContent } from "@/lib/run-decision";

export default async function RunDetailPage({ params }: PageProps<"/runs/[id]">) {
  const { id } = await params;
  const data = await getDashboardSnapshot();
  const run = data.runs.find((item) => item.id === id);
  if (run === undefined) notFound();
  const decision = runDecisionContent(run);
  return (
    <div className="page-stack">
      <PageHeader
        description={`${run.project} · ${run.commit} · ${run.completedAt}`}
        eyebrow={`Runs / ${run.id}`}
        title={run.title}
      />
      <section className="run-decision panel">
        <div>
          <StatusPill status={run.status} />
          <h2>{decision.title}</h2>
          <p>{decision.summary}</p>
        </div>
        <dl>
          <div>
            <dt>Risk</dt>
            <dd>
              {run.risk}
              <small>/100</small>
            </dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{run.evidence}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{run.duration}</dd>
          </div>
        </dl>
      </section>
      <div className="overview-grid">
        <section className="panel">
          <SectionHeading description="Why these checks ran" title="Verification plan" />
          <ol className="plan-list">
            <li>
              <span>01</span>
              <div>
                <strong>Analyze the changed surface</strong>
                <p>The submitted report calculated a {run.risk}/100 change-risk score.</p>
              </div>
              <Icon name="check" />
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Evaluate selected verification evidence</strong>
                <p>{run.evidence} normalized evidence objects were retained for this run.</p>
              </div>
              <Icon name="check" />
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Apply the release gate</strong>
                <p>The submitted evidence produced a {run.status} decision.</p>
              </div>
              <Icon name={run.status === "blocked" ? "alert" : "check"} />
            </li>
          </ol>
        </section>
        <section className="panel">
          <SectionHeading description="Immutable artifacts from CI" title="Evidence bundle" />
          <div className="artifact-list">
            <span>
              <Icon name="contracts" />
              <span>
                <strong>{run.evidence} evidence objects</strong>
                <small>Normalized from the schema-versioned report</small>
              </span>
              <b>v1</b>
            </span>
            <span>
              <Icon name="contracts" />
              <span>
                <strong>{run.commit}</strong>
                <small>Verified commit</small>
              </span>
              <b>{run.project}</b>
            </span>
            <span>
              <Icon name="contracts" />
              <span>
                <strong>{run.duration}</strong>
                <small>Recorded verification duration</small>
              </span>
              <b>{run.completedAt}</b>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
