import { MaruMark } from "@/components/maru-mark";
import { AcceptInvitationCard } from "@/components/accept-invitation-card";
import { requireSession } from "@/lib/session";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ id?: string }>;
}) {
  await requireSession();
  const { id } = await searchParams;

  return (
    <main className="onboarding-page" id="main-content">
      <MaruMark />
      <div>
        <p className="eyebrow">Complete the circle</p>
        <h1>Join your team workspace.</h1>
        <p>
          Accept the invitation to review contracts, verification runs, findings, and release
          evidence with your team.
        </p>
        {id ? (
          <AcceptInvitationCard invitationId={id} />
        ) : (
          <p className="auth-error" role="alert">
            This invitation link is missing its invitation ID.
          </p>
        )}
      </div>
    </main>
  );
}
