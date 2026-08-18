"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AcceptInvitationCard({ invitationId }: { readonly invitationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function accept() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    const result = await authClient.organization.acceptInvitation({ invitationId });
    if (result.error) {
      setError(result.error.message ?? "The invitation could not be accepted.");
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="onboarding-form">
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button--primary" disabled={pending} onClick={accept} type="button">
        {pending ? "Joining workspace…" : "Accept invitation"}
      </button>
    </div>
  );
}
