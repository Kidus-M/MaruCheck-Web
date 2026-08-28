import type { Metadata } from "next";
import { CodeBlock, DocsCallout } from "@/components/docs-shell";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";

export const metadata: Metadata = {
  title: "Agent gate",
  description:
    "Register MaruCheck verification as a Claude Code Stop hook so a coding agent cannot end a turn while the release gate is blocked.",
};

export default function AgentGateDocsPage() {
  return (
    <>
      <span className="docs-kicker">Agent workflow</span>
      <h1>The agent gate</h1>
      <p className="docs-lead">
        Verification only protects a change if somebody runs it. When an AI agent writes the code,
        the agent decides whether to run it — and the agent is exactly who benefits from skipping
        it. The agent gate hands that decision to the harness instead: it registers verification as
        a Claude Code <strong>Stop hook</strong>, so the agent cannot end a turn while the release
        gate is blocked.
      </p>
      <section className="docs-section">
        <h2>Install</h2>
        <CodeBlock>{`npm install --save-dev --save-exact ${MARUCHECK_CLI_SPEC}\nnpx --no-install maru init\nnpx --no-install maru hook install`}</CodeBlock>
        <p>
          That merges one entry into <code>.claude/settings.json</code> and leaves every other
          setting and hook untouched. Running it twice is a no-op, and{" "}
          <code>maru hook uninstall</code> removes only the MaruCheck entry.
        </p>
      </section>
      <section className="docs-section">
        <h2>What the agent receives</h2>
        <p>
          When the agent tries to finish, Claude Code runs <code>maru hook run</code>. It verifies
          the working tree and, if the gate is blocked, refuses the stop and returns the verdict as
          the reason:
        </p>
        <CodeBlock label="Blocked turn">{`MaruCheck gate: BLOCKED.\nRisk critical (91). 2 requirement(s) failed, 0 inconclusive.\n\nBlocking findings:\n- usage-quota#QUOTA-001: QUOTA-001 verification failed\n    expected:  Free plan users may perform at most 10 generations per calendar month.\n    actual:    Received: 1000\n    reproduce: maru verify --diff\n\nChange the code so the approved contract holds. Do not edit or re-approve the\ncontract to make this pass; if the contract itself is wrong, stop and tell the\nhuman to run maru drift propose.`}</CodeBlock>
        <p>
          The closing instruction is deliberate. The cheapest way to make a failing contract pass is
          to edit the contract, so the gate says out loud that this is not an available move.
          Approval stays a human action with a recorded owner and version hash.
        </p>
      </section>
      <DocsCallout>
        <strong>The gate never wedges a session.</strong>
        <p>
          Only a blocked gate stops a turn. If the repository is not initialized, is not a Git
          working tree, or verification itself cannot run, the hook exits cleanly and the turn ends
          with a one-line note. A gate that keeps blocking gives up after three consecutive attempts
          in the same session and hands control back to you.
        </p>
      </DocsCallout>
      <section className="docs-section">
        <h2>Commands</h2>
        <dl className="docs-command-list">
          <dt>
            <code>maru hook install</code>
          </dt>
          <dd>Register the Stop hook in .claude/settings.json. Idempotent.</dd>
          <dt>
            <code>maru hook uninstall</code>
          </dt>
          <dd>Remove the MaruCheck Stop hook and leave every other hook in place.</dd>
          <dt>
            <code>maru hook run</code>
          </dt>
          <dd>
            The hook entrypoint. Reads the payload on stdin and exits 2 to block a turn, with the
            reason on stderr.
          </dd>
        </dl>
      </section>
      <section className="docs-section">
        <h2>Cost and scope</h2>
        <p>
          The gate runs <code>maru verify --diff</code> at the end of a turn, so it costs whatever
          the selected tests cost — and verification selects only the tests linked to the changed
          requirements, not the whole suite. Everything still runs locally: the hook makes no
          network request, and no source code leaves the machine.
        </p>
      </section>
    </>
  );
}
