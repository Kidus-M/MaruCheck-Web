import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function ProductLayout({ children }: { readonly children: ReactNode }) {
  const { organization, viewer } = await getDashboardSnapshot();
  return (
    <DashboardShell organization={organization} viewer={viewer}>
      {children}
    </DashboardShell>
  );
}
