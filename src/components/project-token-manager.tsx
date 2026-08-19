"use client";

import { useActionState, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { revokeProjectTokenAction, rotateProjectTokenAction } from "@/lib/product-actions";
import type { RotateProjectTokenState } from "@/lib/product-actions";
import type { ProjectTokenSummary } from "@/lib/project-token-data";

const initialState: RotateProjectTokenState = { message: "", status: "idle" };

export function ProjectTokenManager({
  canManage,
  projectSlug,
  tokens,
}: {
  readonly canManage: boolean;
  readonly projectSlug: string;
  readonly tokens: readonly ProjectTokenSummary[];
}) {
  const [state, rotateAction, pending] = useActionState(rotateProjectTokenAction, initialState);
  const [confirmation, setConfirmation] = useState<"rotate" | string | null>(null);
  const hasActiveToken = tokens.some((token) => token.status === "active");

  return (
    <section className="panel project-tokens">
      <header>
        <div>
          <p className="eyebrow">Machine access</p>
          <h2>Project ingestion tokens</h2>
          <p>
            Raw tokens are shown once. MaruCheck stores only a hash, so a lost token must be rotated
            rather than recovered.
          </p>
        </div>
        {canManage ? (
          confirmation === "rotate" ? (
            <form action={rotateAction} className="token-confirmation">
              <input name="slug" type="hidden" value={projectSlug} />
              <span>{hasActiveToken ? "Current token stops immediately." : "Create the first CI token?"}</span>
              <button onClick={() => setConfirmation(null)} type="button">Cancel</button>
              <button disabled={pending} type="submit">{pending ? "Working…" : "Confirm"}</button>
            </form>
          ) : (
            <button
              className="button button--secondary"
              onClick={() => setConfirmation("rotate")}
              type="button"
            >
              {hasActiveToken ? "Rotate token" : "Create token"}
            </button>
          )
        ) : null}
      </header>

      {state.status === "success" && state.token ? (
        <div className="token-result token-result--compact" role="status">
          <strong>Copy the replacement token now</strong>
          <div className="credential-reveal__value">
            <code>{state.token}</code>
            <CopyButton label="Copy token" value={state.token} />
          </div>
          <p>{state.message}</p>
        </div>
      ) : state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      {tokens.length === 0 ? (
        <p className="empty-copy">No token exists yet. Create one before configuring CI.</p>
      ) : (
        <div className="token-list">
          {tokens.map((token) => (
            <article key={token.id}>
              <div>
                <strong>{token.name}</strong>
                <code>{token.prefix}</code>
              </div>
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{token.status}</dd>
                </div>
                <div>
                  <dt>Last used</dt>
                  <dd>{token.lastUsed}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{token.created}</dd>
                </div>
                <div>
                  <dt>Expiry</dt>
                  <dd>{token.expires}</dd>
                </div>
              </dl>
              {canManage && token.status === "active" ? (
                confirmation === token.id ? (
                  <form action={revokeProjectTokenAction} className="token-confirmation">
                    <input name="slug" type="hidden" value={projectSlug} />
                    <input name="tokenId" type="hidden" value={token.id} />
                    <span>CI will stop ingesting.</span>
                    <button onClick={() => setConfirmation(null)} type="button">Cancel</button>
                    <button type="submit">Revoke</button>
                  </form>
                ) : (
                  <button
                    className="button button--secondary"
                    onClick={() => setConfirmation(token.id)}
                    type="button"
                  >
                    Revoke
                  </button>
                )
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
