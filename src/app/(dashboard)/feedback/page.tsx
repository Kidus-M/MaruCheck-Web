import Link from "next/link";
import { EmptyState, PageHeader, SeverityPill } from "@/components/dashboard-ui";
import { getProductionFeedback } from "@/lib/feedback-data";

export default async function ProductionFeedbackPage() {
  const feedback = await getProductionFeedback();
  const pending = feedback.filter((item) => item.candidate.status === "pending").length;

  return (
    <div className="page-stack">
      <PageHeader
        description="Production failures linked to commits, Quality Contracts, verification runs, and review-required QA-memory proposals."
        eyebrow="Knowledge / Production"
        title="Production feedback"
      />
      {feedback.length === 0 ? (
        <EmptyState
          description="Send a bounded generic event with a project token. Source code and raw stack text are never accepted."
          eyebrow="Awaiting production signal"
          title="No production failures have been ingested."
        />
      ) : (
        <>
          <section className="feedback-summary panel">
            <div>
              <span>Review queue</span>
              <strong>{pending}</strong>
              <small>pending memory candidates</small>
            </div>
            <div>
              <span>Aggregated failures</span>
              <strong>{feedback.length}</strong>
              <small>unique fingerprints</small>
            </div>
            <div>
              <span>Observed occurrences</span>
              <strong>{feedback.reduce((total, item) => total + item.occurrences, 0)}</strong>
              <small>replays excluded</small>
            </div>
          </section>
          <section className="feedback-list">
            {feedback.map((item, index) => (
              <Link className="feedback-row panel" href={`/feedback/${item.id}`} key={item.id}>
                <span className="feedback-row__index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <header>
                    <SeverityPill severity={item.severity} />
                    <small>{item.project}</small>
                    <small>{item.environment}</small>
                  </header>
                  <h2>{item.title}</h2>
                  <p>{item.message}</p>
                  <footer>
                    <span>{item.occurrences} occurrences</span>
                    <span>Last seen {item.lastSeen}</span>
                    <span>{item.candidate.status} review</span>
                  </footer>
                </div>
                <span className={`feedback-state feedback-state--${item.candidate.status}`}>
                  {item.candidate.status}
                </span>
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
