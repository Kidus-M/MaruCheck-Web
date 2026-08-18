"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountMenu({ initials, label }: { readonly initials: string; readonly label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }
  return <details className="account-menu"><summary className="avatar" aria-label={label}>{initials}</summary><div><Link href="/organization">Organization</Link><button disabled={pending} onClick={signOut} type="button">{pending ? "Signing out…" : "Sign out"}</button></div></details>;
}
