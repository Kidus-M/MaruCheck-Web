import { redirect } from "next/navigation";
import { MaruMark } from "@/components/maru-mark";
import { OnboardingForm } from "@/components/onboarding-form";
import { getWorkspaceContext, requireSession } from "@/lib/session";

export default async function OnboardingPage() {
  await requireSession();
  if ((await getWorkspaceContext()) !== null) redirect("/dashboard");
  return <main className="onboarding-page" id="main-content"><MaruMark /><div><p className="eyebrow">One circle to begin</p><h1>Create your workspace.</h1><p>An organization owns projects, contracts, findings, and the evidence your team chooses to sync.</p><OnboardingForm /></div></main>;
}
