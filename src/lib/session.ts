import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import type { Organization, Viewer } from "@/lib/dashboard-data";

export const getSession = cache(async () => {
  if (!isAuthConfigured()) return null;
  return getAuth().api.getSession({ headers: await headers() });
});

export const getWorkspaceContext = cache(
  async (): Promise<{
    readonly organization: Organization;
    readonly viewer: Viewer;
  } | null> => {
    const session = await getSession();
    if (session === null) return null;

    const requestHeaders = await headers();
    const auth = getAuth();
    const organizations = await auth.api.listOrganizations({ headers: requestHeaders });
    const activeOrganization =
      organizations.find(
        (organization) => organization.id === session.session.activeOrganizationId,
      ) ?? organizations[0];

    if (activeOrganization === undefined) return null;

    const fullOrganization = await auth.api.getFullOrganization({
      headers: requestHeaders,
      query: { organizationId: activeOrganization.id },
    });
    const currentMember = fullOrganization?.members.find(
      (member) => member.userId === session.user.id,
    );
    const normalizedRole = currentMember?.role.split(",")[0];

    return {
      organization: {
        id: activeOrganization.id,
        memberCount: fullOrganization?.members.length ?? 1,
        name: activeOrganization.name,
        plan: "Founding team",
        slug: activeOrganization.slug,
      },
      viewer: {
        email: session.user.email,
        initials: initialsFor(session.user.name),
        name: session.user.name,
        role: normalizedRole === "owner" || normalizedRole === "admin" ? "Owner" : "Member",
      },
    };
  },
);

export async function requireSession() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const session = await getSession();
  if (session === null) redirect("/sign-in?callbackURL=/dashboard");
  return session;
}

export async function requireWorkspaceContext() {
  await requireSession();
  const context = await getWorkspaceContext();
  if (context === null) redirect("/onboarding");
  return context;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
