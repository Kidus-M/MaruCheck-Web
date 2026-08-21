import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = {
  title: "Production feedback",
  description: "Send bounded production failures into MaruCheck's reviewed QA-memory workflow.",
};

export default function ProductionFeedbackDocsPage() {
  return (
    <>
      <span className="docs-kicker">After release</span>
      <h1>Production feedback</h1>
      <p className="docs-lead">
        Bring a production failure back to the proof loop without uploading source or letting
        telemetry silently rewrite product intent.
      </p>
      <section className="docs-section">
        <h2>The trust boundary</h2>
        <ol>
          <li>Your producer sends structured exception metadata with a stable event ID.</li>
          <li>MaruCheck binds it to the project token and an exact commit when available.</li>
          <li>Repeated fingerprints aggregate; exact delivery replays do not inflate counts.</li>
          <li>A reviewer confirms the root cause and links a real regression test.</li>
          <li>Only then does the failure become active QA Memory.</li>
        </ol>
      </section>
      <DocsCallout>
        <strong>Telemetry is evidence, not authority.</strong>
        <p>
          The endpoint rejects raw source, command fields, absolute paths, and unbounded nested
          payloads. It never executes the proposed reproduction or changes a Quality Contract.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Send one event</h2>
        <p>
          Use the one-time project token from the connection flow. The idempotency header must
          exactly match the event ID in the JSON body.
        </p>
        <CodeBlock>{`curl --fail-with-body https://your-marucheck-host/api/v1/production-events \\
  -H "Authorization: Bearer $MARUCHECK_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: evt-prod-0001" \\
  --data-binary @production-event.json`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>Review before memory</h2>
        <p>
          Open the production-feedback queue in the dashboard. Approval requires a confirmed root
          cause, Vitest or Playwright adapter, stable regression ID, and project-relative test path.
          Rejecting the proposal creates no memory and no test link.
        </p>
      </section>
      <section className="docs-section">
        <h2>Delivery rules</h2>
        <ul>
          <li>New event IDs return 201.</li>
          <li>An identical retry returns 200 and preserves the occurrence count.</li>
          <li>Reusing an event ID with altered content returns 409.</li>
          <li>A project token may send at most 60 events per minute.</li>
          <li>Production aggregates are retained for 90 days.</li>
        </ul>
      </section>
    </>
  );
}
