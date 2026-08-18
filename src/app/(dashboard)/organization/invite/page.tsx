import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard-ui";
import { InviteMemberForm } from "@/components/invite-member-form";
import { requireWorkspaceContext } from "@/lib/session";

export default async function InviteMemberPage() {
  const { organization, viewer } = await requireWorkspaceContext();
  if (viewer.role !== "Owner") redirect("/organization");

  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description={`Invite someone to review evidence and manage contracts in ${organization.name}.`}
        eyebrow="Organization / Members"
        title="Invite a member"
      />
      <InviteMemberForm organizationId={organization.id} />
    </div>
  );
}
