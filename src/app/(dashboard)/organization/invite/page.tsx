import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";

export default function InviteMemberPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description="Invite someone to review evidence and manage contracts in Maru Labs."
        eyebrow="Organization / Members"
        title="Invite a member"
      />
      <form className="form-card panel">
        <label>
          <span>Work email</span>
          <input type="email" placeholder="teammate@company.com" />
        </label>
        <label>
          <span>Role</span>
          <select defaultValue="Member">
            <option>Member</option>
            <option>Owner</option>
          </select>
        </label>
        <p className="form-note">
          Members can inspect projects, contracts, runs, findings, coverage, and QA memory. Owners
          can also manage organization settings.
        </p>
        <div className="form-actions">
          <SecondaryLink href="/organization">Cancel</SecondaryLink>
          <button className="button button--primary" type="button">
            Send invitation
          </button>
        </div>
      </form>
    </div>
  );
}
