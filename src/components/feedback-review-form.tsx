"use client";

import { useActionState } from "react";
import {
  reviewProductionFeedbackAction,
  type ReviewFeedbackState,
} from "@/lib/product-actions";

const INITIAL_STATE: ReviewFeedbackState = { message: "", status: "idle" };

export function FeedbackReviewForm({
  candidateId,
  suggestedAdapter,
  suggestedPath,
}: {
  readonly candidateId: string;
  readonly suggestedAdapter?: "playwright" | "vitest";
  readonly suggestedPath?: string;
}) {
  const [state, action, pending] = useActionState(
    reviewProductionFeedbackAction,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="feedback-review form-card panel">
      <input name="candidateId" type="hidden" value={candidateId} />
      <header>
        <p className="eyebrow">Human checkpoint</p>
        <h2>Confirm before memory</h2>
        <p>
          Production telemetry is not proof of root cause. Confirm the cause and link a reviewed
          regression before activating QA memory.
        </p>
      </header>
      <label>
        <span>Confirmed root cause</span>
        <textarea
          name="rootCause"
          placeholder="Which implementation condition caused the production failure?"
          required
          rows={4}
        />
      </label>
      <div className="form-row">
        <label>
          <span>Regression adapter</span>
          <select defaultValue={suggestedAdapter ?? "vitest"} name="regressionAdapter" required>
            <option value="vitest">Vitest</option>
            <option value="playwright">Playwright</option>
          </select>
        </label>
        <label>
          <span>Regression ID</span>
          <input name="regressionId" placeholder="invoice-ownership" required />
        </label>
      </div>
      <label>
        <span>Reviewed regression path</span>
        <input
          defaultValue={suggestedPath}
          name="regressionPath"
          placeholder="tests/invoices/ownership.test.ts"
          required
        />
      </label>
      {state.message ? (
        <p className={`form-message form-message--${state.status}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div className="form-actions">
        <button
          className="button button--secondary"
          disabled={pending}
          formNoValidate
          name="decision"
          type="submit"
          value="reject"
        >
          Reject proposal
        </button>
        <button
          className="button button--primary"
          disabled={pending}
          name="decision"
          type="submit"
          value="approve"
        >
          {pending ? "Saving review..." : "Activate QA memory"}
        </button>
      </div>
    </form>
  );
}
