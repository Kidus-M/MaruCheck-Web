import { notFound } from "next/navigation";
import { FeedbackReviewForm } from "@/components/feedback-review-form";
import { PageHeader, SeverityPill } from "@/components/dashboard-ui";
import { getProductionFeedback } from "@/lib/feedback-data";

export default async function ProductionFeedbackDetailPage({
  params,
}: PageProps<"/feedback/[id]">) {
  const { id } = await params;
  const feedback = (await getProductionFeedback()).find((item) => item.id === id);
  if (!feedback) notFound();

  return (
    <div className="page-stack">
      <PageHeader
        description={`${feedback.project} / ${feedback.environment} / Last seen ${feedback.lastSeen}`}
        eyebrow={`Production feedback / ${feedback.source}`}
        title={feedback.title}
      />
      <section className="feedback-detail-grid">
        <article className="feedback-diagnostic panel">
          <header>
            <SeverityPill severity={feedback.severity} />
            <span>{feedback.type}</span>
            <span>{feedback.occurrences} occurrences</span>
          </header>
          <div>
            <p className="eyebrow">Observed failure</p>
            <h2>{feedback.exceptionType}</h2>
            <p>{feedback.message}</p>
          </div>
          <dl>
            <div>
              <dt>Commit</dt>
              <dd>{feedback.commit ?? "Not supplied"}</dd>
            </div>
            <div>
              <dt>Prior verification</dt>
              <dd>{feedback.regressionRun ?? "No exact commit match"}</dd>
            </div>
            <div>
              <dt>Contracts</dt>
              <dd>{feedback.relatedContracts.join(", ") || "Unlinked"}</dd>
            </div>
            <div>
              <dt>Requirements</dt>
              <dd>{feedback.requirementRefs.join(", ") || "Unlinked"}</dd>
            </div>
          </dl>
          <section>
            <p className="eyebrow">Structured frames</p>
            {feedback.frames.length === 0 ? (
              <p>No structured frames were supplied.</p>
            ) : (
              <ol className="feedback-frames">
                {feedback.frames.map((frame, index) => (
                  <li key={`${frame.file}-${index}`}>
                    <code>
                      {frame.file}
                      {frame.line === undefined ? "" : `:${frame.line}`}
                      {frame.column === undefined ? "" : `:${frame.column}`}
                    </code>
                    <span>{frame.function ?? "anonymous frame"}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </article>
        <aside className="feedback-proposal panel">
          <p className="eyebrow">Candidate / {feedback.candidate.status}</p>
          <h2>Regression proposal</h2>
          <p>{feedback.candidate.regressionProposal.objective}</p>
          <dl>
            <div>
              <dt>Adapter</dt>
              <dd>{feedback.candidate.regressionProposal.suggestedAdapter ?? "Reviewer chooses"}</dd>
            </div>
            <div>
              <dt>Suggested path</dt>
              <dd>{feedback.candidate.regressionProposal.suggestedPath ?? "Reviewer chooses"}</dd>
            </div>
          </dl>
          <p className="feedback-boundary">
            No executable test was generated. The reviewer must link a repository test and confirm
            the root cause.
          </p>
        </aside>
      </section>
      {feedback.candidate.status === "pending" ? (
        <FeedbackReviewForm
          candidateId={feedback.candidate.id}
          suggestedAdapter={feedback.candidate.regressionProposal.suggestedAdapter}
          suggestedPath={feedback.candidate.regressionProposal.suggestedPath}
        />
      ) : (
        <section className="review-complete panel">
          <p className="eyebrow">Review complete</p>
          <h2>{feedback.candidate.status === "approved" ? "QA memory active" : "Proposal rejected"}</h2>
          <p>
            {feedback.candidate.rootCause ??
              "No QA memory or regression link was created from this production signal."}
          </p>
          <small>
            {feedback.candidate.reviewedBy ?? "Reviewer"} / {feedback.candidate.reviewedAt}
          </small>
        </section>
      )}
    </div>
  );
}
