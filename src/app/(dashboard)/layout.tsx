import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireWorkspaceContext } from "@/lib/session";

export default async function ProductLayout({ children }: { readonly children: ReactNode }) {
  const { organization, organizations, viewer } = await requireWorkspaceContext();
  return (
    <DashboardShell organization={organization} organizations={organizations} viewer={viewer}>
      {children}
    </DashboardShell>
  );
}
