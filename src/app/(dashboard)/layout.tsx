import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireWorkspaceContext } from "@/lib/session";

export default async function ProductLayout({ children }: { readonly children: ReactNode }) {
  const { organization, viewer } = await requireWorkspaceContext();
  return (
    <DashboardShell organization={organization} viewer={viewer}>
      {children}
    </DashboardShell>
  );
}
