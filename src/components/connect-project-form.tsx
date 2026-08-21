"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icon";
import { connectProjectAction } from "@/lib/product-actions";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";
import type { ConnectProjectState } from "@/lib/product-actions";

const initialConnectProjectState: ConnectProjectState = { message: "", status: "idle" };
const endpoint = "/api/v1/ingest/runs";

export function ConnectProjectForm({ hostedURL }: { readonly hostedURL: string }) {
  const [state, action, pending] = useActionState(connectProjectAction, initialConnectProjectState);
  const uploadCommand = `npx --yes ${MARUCHECK_CLI_SPEC} upload --report .maru/artifacts/runs/<run-id>/report.json --url ${hostedURL}`;

  if (state.status === "success" && state.token && state.projectSlug) {
    return (
      <section className="connect-success panel" aria-live="polite">
        <header className="connect-success__header">
          <span className="connect-success__seal" aria-hidden="true">
            <Icon name="check" />
          </span>
          <div>
            <p className="eyebrow">Connection established</p>
            <h2>Repository ready for proof.</h2>
            <p>
              The credential exists even before the first run. Save it now; MaruCheck stores only
              its hash.
            </p>
          </div>
          <span className="connection-state">
            <i /> Awaiting first report
          </span>
        </header>

        <div className="connect-success__grid">
          <div className="credential-reveal">
            <span className="credential-reveal__label">
              Project token
              <small>Shown once</small>
            </span>
            <div className="credential-reveal__value">
              <code>{state.token}</code>
              <CopyButton label="Copy token" value={state.token} />
            </div>
            <p>
              Add this value to your repository&apos;s encrypted CI secrets as
              <code> MARUCHECK_TOKEN</code>.
            </p>
          </div>

          <aside className="handoff-steps">
            <p className="eyebrow">Complete the handoff</p>
            <ol>
              <li>
                <span>1</span>
                <p>
                  <strong>Store the token</strong>
                  <small>Encrypted CI secret · never commit it</small>
                </p>
              </li>
              <li>
                <span>2</span>
                <p>
                  <strong>Verify the change</strong>
                  <small>Run maru verify --diff in the repository</small>
                </p>
              </li>
              <li>
                <span>3</span>
                <p>
                  <strong>Upload the report</strong>
                  <small>Use the command below with MARUCHECK_TOKEN set</small>
                </p>
              </li>
            </ol>
          </aside>
        </div>

        <div className="endpoint-strip endpoint-strip--command">
          <span>CLI</span>
          <code>{uploadCommand}</code>
          <CopyButton label="Copy upload command" value={uploadCommand} />
        </div>

        <footer className="connect-success__footer">
          <p>
            Set the copied token as <code>MARUCHECK_TOKEN</code>; never place it in the command or
            commit it. Lost it? Open the project and rotate it.
          </p>
          <Link className="button button--primary" href={`/projects/${state.projectSlug}`}>
            Open project
            <Icon name="arrow" />
          </Link>
        </footer>
      </section>
    );
  }

  return (
    <section className="connect-console panel">
      <aside className="connect-rail" aria-label="Connection sequence">
        <div className="connect-rail__mark">
          <span>
            <Icon name="branch" />
          </span>
          <p>
            <strong>GitHub repository</strong>
            <small>Manual connection</small>
          </p>
        </div>
        <ol>
          <li className="is-active">
            <span>01</span>
            <p>
              <strong>Identify</strong>
              <small>Name the source of proof</small>
            </p>
          </li>
          <li>
            <span>02</span>
            <p>
              <strong>Authorize</strong>
              <small>Create a scoped credential</small>
            </p>
          </li>
          <li>
            <span>03</span>
            <p>
              <strong>Verify</strong>
              <small>Await the first report</small>
            </p>
          </li>
        </ol>
        <div className="connect-rail__boundary">
          <span aria-hidden="true">◉</span>
          <p>
            <strong>Source stays put.</strong>
            <small>MaruCheck receives verification metadata, not repository code.</small>
          </p>
        </div>
      </aside>

      <form action={action} className="connect-form">
        <header>
          <p className="eyebrow">Repository identity</p>
          <h2>Connect a source of truth.</h2>
          <p>
            Use the name engineers already recognize. You can configure GitHub automation after the
            credential is created.
          </p>
        </header>

        <div className="connect-provider">
          <span className="connect-provider__icon">
            <Icon name="branch" />
          </span>
          <span>
            <strong>GitHub</strong>
            <small>Repository metadata + CI report ingestion</small>
          </span>
          <b>Selected</b>
        </div>

        <div className="connect-fields">
          <label>
            <span>
              Project name <small>Shown throughout MaruCheck</small>
            </span>
            <input autoComplete="off" name="name" placeholder="maru-web" required />
          </label>
          <label>
            <span>
              Repository <small>owner/repository</small>
            </span>
            <div className="input-prefix">
              <span>github.com/</span>
              <input
                autoComplete="off"
                name="repository"
                placeholder="Kidus-M/MaruCheck-Web"
                required
              />
            </div>
          </label>
          <label>
            <span>
              Production branch <small>Used as the default baseline</small>
            </span>
            <div className="input-prefix input-prefix--branch">
              <span>
                <Icon name="branch" />
              </span>
              <input defaultValue="main" name="branch" required />
            </div>
          </label>
        </div>

        {state.status === "error" ? (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        ) : null}

        <footer>
          <p>
            <span aria-hidden="true">◌</span> A project-scoped token will be generated next.
          </p>
          <button className="button button--primary" disabled={pending} type="submit">
            {pending ? "Establishing connection…" : "Connect repository"}
            <Icon name="arrow" />
          </button>
        </footer>
      </form>

      <aside className="connect-preview">
        <p className="eyebrow">What crosses the boundary</p>
        <div className="connect-preview__flow">
          <span>
            <i /> Your CI
          </span>
          <b aria-hidden="true">→</b>
          <span>
            <i /> MaruCheck
          </span>
        </div>
        <dl>
          <div>
            <dt>Verification result</dt>
            <dd>Passed / blocked</dd>
          </div>
          <div>
            <dt>Risk score</dt>
            <dd>0–100 + reasons</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>Metadata + artifact refs</dd>
          </div>
          <div>
            <dt>Source code</dt>
            <dd className="is-denied">Never uploaded</dd>
          </div>
          <div>
            <dt>Repository secrets</dt>
            <dd className="is-denied">Never uploaded</dd>
          </div>
        </dl>
        <div className="connect-preview__command">
          <span>INGEST TARGET</span>
          <code>POST {endpoint}</code>
        </div>
      </aside>
    </section>
  );
}
