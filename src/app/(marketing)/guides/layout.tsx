import type { ReactNode } from "react";
import { GuidesShell } from "@/components/guides-shell";

export default function GuidesLayout({ children }: { readonly children: ReactNode }) {
  return <GuidesShell>{children}</GuidesShell>;
}
