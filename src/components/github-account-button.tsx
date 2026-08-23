"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth-client";

type GitHubAccountAction = "link" | "private-access" | "reconnect";

export function GitHubAccountButton({ action }: { readonly action: GitHubAccountAction }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function linkGitHub() {
    if (pending) return;
    setError(undefined);
    setPending(true);

    const result = await authClient.linkSocial({
      callbackURL: "/projects/connect",
      errorCallbackURL: "/projects/connect?github=error",
      provider: "github",
      scopes: action === "private-access" ? ["repo"] : undefined,
    });

    if (result?.error) {
      setError(result.error.message ?? "GitHub could not be connected.");
      setPending(false);
    }
  }

  return (
    <div className="github-account-action">
      <button
        className="button button--primary"
        disabled={pending}
        onClick={linkGitHub}
        type="button"
      >
        {pending ? "Opening GitHub…" : actionLabel(action)}
        {!pending && <Icon name="arrow" />}
      </button>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function actionLabel(action: GitHubAccountAction): string {
  if (action === "private-access") return "Include private repositories";
  if (action === "reconnect") return "Reconnect GitHub";
  return "Connect GitHub";
}
