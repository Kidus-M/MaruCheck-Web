import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = {
  title: "Quality Contracts",
  description: "Write durable, executable behavior contracts for MaruCheck.",
};

export default function ContractsDocsPage() {
  return (
    <>
      <span className="docs-kicker">Core concept</span>
      <h1>Quality Contracts</h1>
      <p className="docs-lead">
        A Quality Contract is the durable boundary between what people approved and what an
        implementation happens to do today.
      </p>
      <section className="docs-section">
        <h2>What belongs in a contract</h2>
        <ul>
          <li>Behavior that must remain true across refactors</li>
          <li>Authorization and ownership boundaries</li>
          <li>Limits, retries, expiry, and failure behavior</li>
          <li>Observable acceptance criteria</li>
        </ul>
      </section>
      <DocsCallout>
        <strong>Write the promise, not the implementation.</strong>
        <p>
          “A user can only read invoices belonging to their organization” survives a framework
          change. “Call middleware X before handler Y” does not.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Illustrative structure</h2>
        <CodeBlock>{`contract: invoice-access\nowner: billing\ncriticality: critical\nrequirements:\n  - id: INV-001\n    intent: A user can only read invoices owned by their organization\n    evidence:\n      - authorization-test\n      - cross-tenant-challenge`}</CodeBlock>
        <p>
          Use the schema produced by the current CLI as the canonical format; this example shows the
          conceptual fields.
        </p>
      </section>
      <section className="docs-section">
        <h2>Review rules</h2>
        <ol>
          <li>Give every requirement a stable identity.</li>
          <li>Make the expected behavior observable.</li>
          <li>Call out security and data boundaries explicitly.</li>
          <li>Approve contract changes separately from incidental code changes.</li>
        </ol>
      </section>
    </>
  );
}
