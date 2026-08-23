import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { ConnectProjectForm } from "@/components/connect-project-form";
import { getGitHubRepositoryConnection } from "@/lib/github-repositories";

export default async function ConnectProjectPage() {
  const github = await getGitHubRepositoryConnection();
  const hostedURL =
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  return (
    <div className="page-stack">
      <PageHeader
        description="Choose a repository and keep verification execution in its own CI environment."
        eyebrow="Projects / Connect"
        title="Connect a project"
      />
      <ConnectProjectForm github={github} hostedURL={hostedURL} />
      <SecondaryLink href="/projects">Back to projects</SecondaryLink>
    </div>
  );
}
