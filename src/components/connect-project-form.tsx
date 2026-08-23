"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import { GitHubAccountButton } from "@/components/github-account-button";
import { Icon } from "@/components/icon";
import { connectProjectAction } from "@/lib/product-actions";
import { MARUCHECK_CLI_SPEC } from "@/lib/public-release";
import type { GitHubRepositoryConnection } from "@/lib/github-repositories";
import type { ConnectProjectState } from "@/lib/product-actions";

const initialConnectProjectState: ConnectProjectState = { message: "", status: "idle" };
const endpoint = "/api/v1/ingest/runs";

export function ConnectProjectForm({
  github,
  hostedURL,
}: {
  readonly github: GitHubRepositoryConnection;
  readonly hostedURL: string;
}) {
  const [state, action, pending] = useActionState(connectProjectAction, initialConnectProjectState);
  const uploadCommand = `npx --yes ${MARUCHECK_CLI_SPEC} upload`;

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
              <div className="credential-reveal__actions">
                <CopyButton label="Copy token" value={state.token} />
                <CopyButton
                  label="Copy connection setup"
                  value={`MARUCHECK_URL=${hostedURL}\nMARUCHECK_TOKEN=${state.token}`}
                />
              </div>
            </div>
            <p>
              Paste the connection setup into <code>.maru/connection.env</code>. MaruCheck init
              keeps that local credentials file out of Git.
            </p>
          </div>

          <aside className="handoff-steps">
            <p className="eyebrow">Complete the handoff</p>
            <ol>
              <li>
                <span>1</span>
                <p>
                  <strong>Save connection setup</strong>
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
                  <small>The newest completed run is selected automatically</small>
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
            CI may set the same two values as encrypted environment secrets. Lost the token? Open
            the project and rotate it.
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
            <small>Fetched from GitHub</small>
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
          <p className="eyebrow">GitHub repositories</p>
          <h2>Choose a source of truth.</h2>
          <p>
            MaruCheck reads repository identity and the default branch from GitHub. Source code and
            repository secrets stay where they are.
          </p>
        </header>

        <div className="connect-provider">
          <span className="connect-provider__icon">
            <Icon name="branch" />
          </span>
          <span>
            <strong>GitHub</strong>
            <small>Repository metadata only + CI report ingestion</small>
          </span>
          <b>{githubProviderStatus(github)}</b>
        </div>

        {github.status === "ready" && github.repositories.length > 0 ? (
          <>
            <fieldset className="repository-picker">
              <legend>
                Available repositories{" "}
                <small>{github.repositories.length} most recently pushed</small>
              </legend>
              <div>
                {github.repositories.map((repository, index) => (
                  <label key={repository.id}>
                    <input
                      defaultChecked={index === 0}
                      name="repository"
                      required
                      type="radio"
                      value={repository.fullName}
                    />
                    <span>
                      <strong>{repository.fullName}</strong>
                      <small>{repository.description ?? "No repository description"}</small>
                    </span>
                    <span className="repository-picker__meta">
                      <b>{repository.private ? "Private" : "Public"}</b>
                      <small>
                        {repository.defaultBranch}
                        {repository.archived ? " · Archived" : ""}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {!github.privateAccess ? (
              <div className="private-repository-access">
                <p>
                  <strong>Need a private repository?</strong>
                  GitHub OAuth exposes private repositories through its broad <code>repo</code>
                  permission. Request it only if you need it.
                </p>
                <GitHubAccountButton action="private-access" />
              </div>
            ) : null}
          </>
        ) : (
          <GitHubRepositorySetup github={github} />
        )}

        {state.status === "error" ? (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        ) : null}

        {github.status === "ready" && github.repositories.length > 0 ? (
          <footer>
            <p>
              <span aria-hidden="true">◌</span> Name and default branch will be verified with
              GitHub.
            </p>
            <button className="button button--primary" disabled={pending} type="submit">
              {pending ? "Establishing connection…" : "Connect repository"}
              <Icon name="arrow" />
            </button>
          </footer>
        ) : null}
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

function GitHubRepositorySetup({ github }: { readonly github: GitHubRepositoryConnection }) {
  if (github.status === "unconfigured") {
    return (
      <div className="repository-setup auth-notice" role="status">
        <strong>GitHub OAuth is not configured.</strong>
        <span>Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET, then restart MaruCheck.</span>
      </div>
    );
  }

  if (github.status === "error") {
    return (
      <div className="repository-setup">
        <p className="form-error" role="alert">
          {github.message}
        </p>
        <GitHubAccountButton action="reconnect" />
      </div>
    );
  }

  if (github.status === "unlinked") {
    return (
      <div className="repository-setup">
        <p>
          <strong>Connect your GitHub account.</strong>
          MaruCheck will request identity access first and return here with your public
          repositories.
        </p>
        <GitHubAccountButton action="link" />
      </div>
    );
  }

  return (
    <div className="repository-setup">
      <p>
        <strong>No repositories were returned.</strong>
        If the repository is private, grant private repository access and try again.
      </p>
      {!github.privateAccess ? <GitHubAccountButton action="private-access" /> : null}
    </div>
  );
}

function githubProviderStatus(github: GitHubRepositoryConnection): string {
  if (github.status === "ready") return github.privateAccess ? "Private access" : "Connected";
  if (github.status === "error") return "Needs attention";
  if (github.status === "unlinked") return "Not connected";
  return "Setup required";
}
