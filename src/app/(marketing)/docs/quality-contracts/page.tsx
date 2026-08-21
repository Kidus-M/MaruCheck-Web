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
        <h2>Version 1 structure</h2>
        <CodeBlock>{`version: 1\nid: invoice-access\ntitle: Invoice Access\nstatus: draft\ncriticality: critical\nintent: Keep invoice reads inside the authenticated organization.\nowners:\n  - billing\nrequirements:\n  - id: INV-001\n    statement: A user can only read invoices owned by their organization.\n    priority: required\ninvariants:\n  - id: INV-INV-001\n    statement: A client-supplied organization ID never grants invoice access.\nedge_cases:\n  - a user guesses an invoice ID from another organization\nsecurity:\n  - enforce organization ownership on the server\ndata_integrity:\n  - preserve the invoice organization relationship\nevidence_policy:\n  blocking_requirements:\n    - INV-001\n    - INV-INV-001`}</CodeBlock>
        <p>
          This uses the current version 1 schema. Create contracts through the CLI when possible so
          validation and review prompts are applied consistently.
        </p>
      </section>
      <section className="docs-section">
        <h2>Review rules</h2>
        <ol>
          <li>Give every requirement a stable identity.</li>
          <li>Make the expected behavior observable.</li>
          <li>Call out security and data boundaries explicitly.</li>
          <li>Approve contract changes separately from incidental code changes.</li>
          <li>
            Keep a contract in draft or review until its proposed blocking policy is ready to gate
            releases.
          </li>
        </ol>
      </section>
    </>
  );
}
