import type { ReactNode } from "react";
import { MarketingShell } from "@/components/marketing-shell";

export default function PublicLayout({ children }: { readonly children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
