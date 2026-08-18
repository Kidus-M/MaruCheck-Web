import { PageHeader, PrimaryLink } from "@/components/dashboard-ui";
import { requireWorkspaceContext } from "@/lib/session";

export default async function OrganizationPage() {
  const { organization, viewer } = await requireWorkspaceContext();
  return (
    <div className="page-stack">
      <PageHeader
        action={<PrimaryLink href="/organization/invite">Invite member</PrimaryLink>}
        description="People, roles, and the hosted metadata boundary for this workspace."
        eyebrow="Workspace / Organization"
        title={organization.name}
      />
      <div className="organization-grid">
        <section className="panel organization-profile">
          <span className="organization-profile__seal">M</span>
          <div>
            <h2>{organization.name}</h2>
            <p>marucheck.dev/{organization.slug}</p>
            <span>{organization.plan}</span>
          </div>
          <dl>
            <div>
              <dt>Members</dt>
              <dd>{organization.memberCount}</dd>
            </div>
            <div>
              <dt>Projects</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>EU West</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Members</h2>
          <div className="member-row">
            <span className="avatar">{viewer.initials}</span>
            <span>
              <strong>{viewer.name}</strong>
              <small>{viewer.email}</small>
            </span>
            <b>{viewer.role}</b>
          </div>
          <div className="member-row">
            <span className="avatar avatar--muted">AR</span>
            <span>
              <strong>Ari R.</strong>
              <small>ari@marucheck.dev</small>
            </span>
            <b>Member</b>
          </div>
          <div className="member-row">
            <span className="avatar avatar--muted">NT</span>
            <span>
              <strong>Noah T.</strong>
              <small>noah@marucheck.dev</small>
            </span>
            <b>Member</b>
          </div>
        </section>
      </div>
      <section className="panel data-boundary">
        <div>
          <p className="eyebrow">Hosted data boundary</p>
          <h2>Your source stays where it runs.</h2>
          <p>
            MaruCheck cloud stores configured metadata, contracts, run summaries, findings,
            requirement coverage, QA memory, and selected evidence artifacts. Local and CI execution
            remains the default.
          </p>
        </div>
        <ul>
          <li>
            Repository source <strong>Local / CI only</strong>
          </li>
          <li>
            Quality Contracts <strong>Synced</strong>
          </li>
          <li>
            Verification evidence <strong>Configured artifacts</strong>
          </li>
          <li>
            Secrets <strong>Never stored in plaintext</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
