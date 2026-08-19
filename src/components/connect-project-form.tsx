"use client";

import Link from "next/link";
import { useActionState } from "react";
import { connectProjectAction } from "@/lib/product-actions";
import type { ConnectProjectState } from "@/lib/product-actions";

const initialConnectProjectState: ConnectProjectState = { message: "", status: "idle" };

export function ConnectProjectForm() {
  const [state, action, pending] = useActionState(connectProjectAction, initialConnectProjectState);

  if (state.status === "success" && state.token && state.projectSlug) {
    return (
      <section className="form-card panel token-result" aria-live="polite">
        <p className="eyebrow">Repository connected</p>
        <h2>Save this ingestion token now.</h2>
        <p>{state.message}</p>
        <code>{state.token}</code>
        <p>
          Send it as <code>Authorization: Bearer $MARUCHECK_TOKEN</code> to the versioned ingestion
          endpoint. Do not commit it to the repository.
        </p>
        <Link className="button button--primary" href={`/projects/${state.projectSlug}`}>
          Open project
        </Link>
      </section>
    );
  }

  return (
    <form action={action} className="form-card panel">
      <label>
        <span>Project name</span>
        <input name="name" placeholder="maru-web" required />
      </label>
      <label>
        <span>GitHub repository</span>
        <input name="repository" placeholder="Kidus-M/MaruCheck-Web" required />
      </label>
      <label>
        <span>Default branch</span>
        <input defaultValue="main" name="branch" required />
      </label>
      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="button button--primary" disabled={pending} type="submit">
        {pending ? "Connecting…" : "Connect repository"}
      </button>
    </form>
  );
}
