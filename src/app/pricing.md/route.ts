import { renderPricingMarkdown } from "@/lib/agent-files";
import { fetchCliRelease } from "@/lib/cli-release";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return new Response(renderPricingMarkdown(await fetchCliRelease()), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
