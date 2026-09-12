import { renderLlmsTxt } from "@/lib/agent-files";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsTxt(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
