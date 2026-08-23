"use client";

import { FormEvent, useState } from "react";
import { SecondaryLink } from "@/components/dashboard-ui";
import { authClient } from "@/lib/auth-client";

export function InviteMemberForm({ organizationId }: { readonly organizationId: string }) {
  const [error, setError] = useState<string>();
  const [inviteUrl, setInviteUrl] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError(undefined);
    setInviteUrl(undefined);
    setPending(true);

    try {
      const result = await authClient.organization.inviteMember({
        email: String(form.get("email") ?? "").trim(),
        organizationId,
        role: String(form.get("role") ?? "member") as "member" | "owner",
      });

      if (result.error) {
        setError(result.error.message ?? "The invitation could not be created.");
      } else if (result.data) {
        setInviteUrl(`${window.location.origin}/accept-invitation?id=${result.data.id}`);
        formElement.reset();
      }
    } catch {
      setError("The invitation could not be created. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function copyInvite() {
    if (inviteUrl) await navigator.clipboard.writeText(inviteUrl);
  }

  return (
    <form className="form-card panel" onSubmit={submit}>
      <label>
        <span>Work email</span>
        <input name="email" placeholder="teammate@company.com" required type="email" />
      </label>
      <label>
        <span>Role</span>
        <select defaultValue="member" name="role">
          <option value="member">Member</option>
          <option value="owner">Owner</option>
        </select>
      </label>
      <p className="form-note">
        Members can inspect workspace evidence. Owners can also invite people and manage the
        organization.
      </p>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {inviteUrl && (
        <div className="invite-result" role="status">
          <strong>Invitation created</strong>
          <span>
            Email delivery is not configured yet. Share this single-use link with the invited
            teammate.
          </span>
          <input aria-label="Invitation link" readOnly value={inviteUrl} />
          <button className="button button--secondary" onClick={copyInvite} type="button">
            Copy invitation link
          </button>
        </div>
      )}
      <div className="form-actions">
        <SecondaryLink href="/organization">Cancel</SecondaryLink>
        <button className="button button--primary" disabled={pending} type="submit">
          {pending ? "Creating invitation…" : "Create invitation"}
        </button>
      </div>
    </form>
  );
}
