import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { MaruMark } from "@/components/maru-mark";
import {
  getSignupMode,
  isAuthConfigured,
  isGithubAuthConfigured,
  isGoogleAuthConfigured,
} from "@/lib/auth";
import { getSession } from "@/lib/session";

export default async function SignInPage() {
  if (isAuthConfigured() && (await getSession()) !== null) redirect("/dashboard");

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-story">
        <MaruMark />
        <div className="auth-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="eyebrow">Proof has a shape</p>
          <h1>Close the loop between intent and release.</h1>
          <p>
            Inspired by the Kobayashi Maru concept, MaruCheck tests software under difficult and
            unexpected conditions—not only the happy path.
          </p>
        </div>
        <footer>
          <span>○ Intent</span>
          <span>○ Challenge</span>
          <span>◎ Evidence</span>
        </footer>
      </section>
      <section className="auth-form">
        <Suspense fallback={<AuthPanelFallback />}>
          <AuthPanel
            configured={isAuthConfigured()}
            githubConfigured={isGithubAuthConfigured()}
            googleConfigured={isGoogleAuthConfigured()}
            signupMode={getSignupMode()}
          />
        </Suspense>
        <footer>
          Early access is limited to approved accounts.{" "}
          <Link href="/">Return to the product site</Link>
        </footer>
      </section>
    </main>
  );
}

function AuthPanelFallback() {
  return (
    <div className="auth-panel-loading" aria-busy="true" aria-live="polite">
      <p className="eyebrow">Welcome to MaruCheck</p>
      <h2>Sign in to your workspace</h2>
      <p>Preparing secure sign-in…</p>
      <div className="auth-loading-line" aria-hidden="true" />
      <div className="auth-loading-field" aria-hidden="true" />
      <div className="auth-loading-field" aria-hidden="true" />
      <div className="auth-loading-button" aria-hidden="true" />
    </div>
  );
}
