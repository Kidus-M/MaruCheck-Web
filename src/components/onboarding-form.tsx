"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth-client";

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    setPending(true);
    setError(undefined);
    const result = await authClient.organization.create({ name, slug: slugify(name) });
    if (result.error) {
      setError(result.error.message ?? "The workspace could not be created.");
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <form className="form-card panel onboarding-form" onSubmit={submit}>
      <label>
        <span>Workspace name</span>
        <input autoFocus minLength={2} name="name" placeholder="Maru Labs" required />
      </label>
      <p className="form-note">
        You will become the first owner. Projects and other members can be connected afterward.
      </p>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button--primary" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create workspace"}
        <Icon name="arrow" />
      </button>
    </form>
  );
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `workspace-${Date.now().toString(36)}`;
}
