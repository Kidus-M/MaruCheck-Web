import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";

export const metadata: Metadata = {
  title: "CI integration",
  description: "Run MaruCheck as an evidence-backed continuous integration gate.",
};

export default function CiDocsPage() {
  return (
    <>
      <span className="docs-kicker">Automation</span>
      <h1>CI integration</h1>
      <p className="docs-lead">
        Run the same verification loop on pull requests so the release decision follows the
        change—not a reviewer’s memory.
      </p>
      <section className="docs-section">
        <h2>Recommended sequence</h2>
        <ol>
          <li>Install and build the project and MaruCheck CLI.</li>
          <li>Collect the pull-request diff.</li>
          <li>Run the MaruCheck check command.</li>
          <li>Upload the chosen evidence report as a CI artifact.</li>
          <li>Fail the job when the configured gate blocks.</li>
        </ol>
      </section>
      <section className="docs-section">
        <h2>GitHub Actions outline</h2>
        <CodeBlock>{`- name: Install project dependencies\n  run: npm ci\n\n- name: Verify changed behavior\n  run: npx --no-install maru ci verify`}</CodeBlock>
      </section>
      <DocsCallout>
        <strong>Adapt before copying.</strong>
        <p>
          The repositories are separate, so a production workflow should install a published CLI
          version instead of checking out sibling source. Pin that version when publication is
          enabled.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Evidence handling</h2>
        <p>
          Keep source execution inside the runner. Upload only the artifacts your policy permits,
          apply a retention period, and avoid placing secrets or raw sensitive payloads in evidence
          output.
        </p>
      </section>
    </>
  );
}
