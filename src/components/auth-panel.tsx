"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth-client";

export function AuthPanel({ configured, githubConfigured }: { readonly configured: boolean; readonly githubConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const callbackURL = safeCallback(searchParams.get("callbackURL"));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setError(undefined);
    setPending(true);

    try {
      if (mode === "sign-in") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message ?? "Sign-in failed.");
        router.push(callbackURL);
      } else {
        const name = String(form.get("name") ?? "").trim();
        const workspaceName = String(form.get("workspace") ?? "").trim();
        const result = await authClient.signUp.email({ email, name, password });
        if (result.error) throw new Error(result.error.message ?? "Account creation failed.");
        const organization = await authClient.organization.create({
          name: workspaceName,
          slug: slugify(workspaceName),
        });
        if (organization.error) {
          router.push("/onboarding");
          router.refresh();
          return;
        }
        router.push(callbackURL);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function signInWithGithub() {
    if (!configured || !githubConfigured || pending) return;
    setPending(true);
    setError(undefined);
    const result = await authClient.signIn.social({ provider: "github", callbackURL });
    if (result?.error) {
      setError(result.error.message ?? "GitHub sign-in failed.");
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Welcome to MaruCheck</p>
      <h2>{mode === "sign-in" ? "Sign in to your workspace" : "Create your proof workspace"}</h2>
      <p>{mode === "sign-in" ? "Review contracts, runs, and release evidence." : "Create the owner account and first organization for your team."}</p>
      {!configured && <div className="auth-notice" role="status"><strong>Hosted authentication needs its environment.</strong><span>Add the Neon connection and Better Auth secret described in .env.example.</span></div>}
      {githubConfigured && mode === "sign-in" && <button className="auth-provider" disabled={!configured || pending} onClick={signInWithGithub} type="button"><span>GH</span>Continue with GitHub<Icon name="arrow" /></button>}
      {githubConfigured && mode === "sign-in" && <div className="auth-divider"><span>or</span></div>}
      <form className="auth-fields" onSubmit={submit}>
        {mode === "sign-up" && <><label><span>Your name</span><input autoComplete="name" disabled={!configured} name="name" required /></label><label><span>Workspace name</span><input disabled={!configured} minLength={2} name="workspace" placeholder="Maru Labs" required /></label></>}
        <label><span>Work email</span><input autoComplete="email" disabled={!configured} name="email" placeholder="you@company.com" required type="email" /></label>
        <label><span>Password</span><input autoComplete={mode === "sign-in" ? "current-password" : "new-password"} disabled={!configured} minLength={12} name="password" required type="password" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button button--primary auth-submit" disabled={!configured || pending} type="submit">{pending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create workspace"}{!pending && <Icon name="arrow" />}</button>
      </form>
      <button className="auth-mode-switch" disabled={pending} onClick={() => { setError(undefined); setMode(mode === "sign-in" ? "sign-up" : "sign-in"); }} type="button">{mode === "sign-in" ? "New to MaruCheck? Create a workspace" : "Already have an account? Sign in"}</button>
      <small>Passwords must contain at least 12 characters. GitHub sign-in appears when its OAuth credentials are configured.</small>
    </div>
  );
}

function safeCallback(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function slugify(value: string): string {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug || `workspace-${Date.now().toString(36)}`;
}
