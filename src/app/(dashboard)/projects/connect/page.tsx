import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";

export default function ConnectProjectPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader description="Choose a repository and keep verification execution in its own CI environment." eyebrow="Projects / Connect" title="Connect a project" />
      <section className="connect-card panel">
        <span className="connect-card__icon"><Icon name="branch" /></span>
        <div><h2>GitHub repository</h2><p>Import project metadata, contracts, reports, and configured evidence artifacts. Source code is not uploaded.</p></div>
        <button className="button button--primary" type="button">Continue with GitHub<Icon name="arrow" /></button>
      </section>
      <section className="privacy-note"><span className="proof-mini"><span /></span><div><strong>Execution stays local</strong><p>The hosted dashboard receives metadata and evidence only when your workflow is configured to send it.</p></div></section>
      <SecondaryLink href="/projects">Back to projects</SecondaryLink>
    </div>
  );
}
