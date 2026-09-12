import type { JsonLdNode } from "@/lib/structured-data";
import { graph } from "@/lib/structured-data";

/**
 * Emits one `application/ld+json` block per page. Nodes are wrapped in an
 * `@graph` so multiple schema types share a single script tag and can
 * cross-reference each other by `@id`.
 */
export function JsonLd({ nodes }: { readonly nodes: readonly JsonLdNode[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema payloads are built from static, server-side constants.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph(nodes)) }}
    />
  );
}
