import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = {
  title: "Hosted verification reports",
  description: "Connect a project and send completed MaruCheck proof metadata to the dashboard.",
};

export default function ReportIngestionDocsPage() {
  return (
    <>
      <span className="docs-kicker">Optional hosted proof</span>
      <h1>Send a report to the dashboard</h1>
      <p className="docs-lead">
        Verification still runs in your repository. The hosted API receives a bounded report and
        artifact references so a team can inspect runs, findings, contracts, and coverage together.
      </p>
      <DocsCallout>
        <strong>There is no automatic upload in CLI v0.1.0.</strong>
        <p>
          Upload is an explicit API or CI step. MaruCheck does not send source code, run repository
          commands in the hosted service, or upload a report merely because you signed in.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>1. Connect the project</h2>
        <ol>
          <li>Sign in and open <Link href="/projects/connect">Connect project</Link>.</li>
          <li>Use the same project name reported by <code>maru scan</code>.</li>
          <li>Copy the one-time <code>maru_…</code> token before leaving the confirmation screen.</li>
          <li>Store it as <code>MARUCHECK_TOKEN</code> in your CI provider’s encrypted secrets.</li>
        </ol>
        <p>
          The dashboard stores only a token hash. Owners can rotate or revoke the credential from
          the project page if the original token is lost or exposed.
        </p>
      </section>
      <section className="docs-section">
        <h2>2. Produce the local report</h2>
        <CodeBlock>{`npx --no-install maru verify --diff\n# Copy the report path printed by the command:\n# .maru/artifacts/runs/<run-id>/report.json`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>3. Wrap the report</h2>
        <p>
          Create <code>ingest.json</code> with run metadata and place the complete generated
          <code>report.json</code> object in the <code>report</code> field.
        </p>
        <CodeBlock label="JSON">{`{
  "schemaVersion": 1,
  "branch": "main",
  "commitSha": "8f2c1a7d5e3b",
  "title": "fix: enforce invoice ownership",
  "startedAt": "2026-08-21T10:00:00.000Z",
  "completedAt": "2026-08-21T10:01:42.000Z",
  "report": {
    "schemaVersion": 1,
    "generatedAt": "2026-08-21T10:01:42.000Z",
    "project": { "name": "your-project-name" },
    "runId": "RUN-1048",
    "risk": { "level": "high", "score": 78 },
    "gate": { "status": "passed", "reasons": [] },
    "evidence": [],
    "findings": [],
    "requirementEvidence": []
  }
}`}</CodeBlock>
      </section>
      <section className="docs-section">
        <h2>4. Send it</h2>
        <CodeBlock>{`curl --fail-with-body https://your-marucheck-host/api/v1/ingest/runs \\
  -H "Authorization: Bearer $MARUCHECK_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data-binary @ingest.json`}</CodeBlock>
        <p>
          A successful request returns <code>202</code>. Reusing a run ID updates that project’s
          normalized run instead of creating an unrelated duplicate. The request body is limited to
          2 MB.
        </p>
      </section>
      <section className="docs-section">
        <h2>Common failures</h2>
        <ul>
          <li><code>400</code>: the envelope or embedded report does not match schema version 1.</li>
          <li><code>401</code>: the project token is missing, invalid, expired, or revoked.</li>
          <li><code>409</code>: the report project name differs from the connected project.</li>
          <li><code>413</code>: the request exceeds the 2 MB boundary.</li>
        </ul>
      </section>
    </>
  );
}
