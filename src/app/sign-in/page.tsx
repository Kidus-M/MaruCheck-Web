import Link from "next/link";
import { Icon } from "@/components/icon";
import { MaruMark } from "@/components/maru-mark";

export default function SignInPage() {
  return (
    <main className="auth-page">
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
            Maru is the circle used to mark an answer correct. MaruCheck gives every release that
            same standard: approved meaning, challenged behavior, and inspectable proof.
          </p>
        </div>
        <footer>
          <span>○ Intent</span>
          <span>○ Challenge</span>
          <span>◎ Evidence</span>
        </footer>
      </section>
      <section className="auth-form">
        <div>
          <p className="eyebrow">Welcome to MaruCheck</p>
          <h2>Sign in to your workspace</h2>
          <p>Use your work account to review contracts, runs, and release evidence.</p>
          <button className="auth-provider" type="button">
            <span>G</span>Continue with Google
            <Icon name="arrow" />
          </button>
          <button className="auth-provider" type="button">
            <span>GH</span>Continue with GitHub
            <Icon name="arrow" />
          </button>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <label>
            <span>Work email</span>
            <input type="email" placeholder="you@company.com" />
          </label>
          <button className="button button--primary auth-submit" type="button">
            Continue with email
            <Icon name="arrow" />
          </button>
          <small>
            Authentication provider will be connected after the hosted stack is selected.
          </small>
        </div>
        <footer>
          By continuing, you agree to the Terms and Privacy Policy.{" "}
          <Link href="/">View demo dashboard</Link>
        </footer>
      </section>
    </main>
  );
}
