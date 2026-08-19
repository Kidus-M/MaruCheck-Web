import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { ConnectProjectForm } from "@/components/connect-project-form";

export default function ConnectProjectPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description="Choose a repository and keep verification execution in its own CI environment."
        eyebrow="Projects / Connect"
        title="Connect a project"
      />
      <ConnectProjectForm />
      <section className="privacy-note">
        <span className="proof-mini">
          <span />
        </span>
        <div>
          <strong>Execution stays local</strong>
          <p>
            The hosted dashboard receives metadata and evidence only when your workflow is
            configured to send it.
          </p>
        </div>
      </section>
      <SecondaryLink href="/projects">Back to projects</SecondaryLink>
    </div>
  );
}
