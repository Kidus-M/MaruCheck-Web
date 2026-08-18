import type { ReactNode } from "react";
import { DocsShell } from "@/components/docs-shell";

export default function DocumentationLayout({ children }: { readonly children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
