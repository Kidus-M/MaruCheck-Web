import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { ConnectProjectForm } from "@/components/connect-project-form";

export default function ConnectProjectPage() {
  return (
    <div className="page-stack">
      <PageHeader
        description="Choose a repository and keep verification execution in its own CI environment."
        eyebrow="Projects / Connect"
        title="Connect a project"
      />
      <ConnectProjectForm />
      <SecondaryLink href="/projects">Back to projects</SecondaryLink>
    </div>
  );
}
