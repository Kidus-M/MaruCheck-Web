import { MARUCHECK_SOURCE_URL } from "@/lib/public-release";

const GITHUB_API_ORIGIN = "https://api.github.com";
const STAR_COUNT_REVALIDATE_SECONDS = 21_600;
const STAR_COUNT_TIMEOUT_MS = 2_500;

/** "https://github.com/owner/repo" -> "owner/repo" */
function repositorySlug(sourceUrl: string): string {
  return new URL(sourceUrl).pathname.replace(/^\/|\/$/g, "");
}

/**
 * Stars are decoration, never a dependency: any failure (offline build, rate
 * limit, slow API) resolves to null and the badge simply renders without a count.
 */
export async function fetchStarCount(
  sourceUrl: string = MARUCHECK_SOURCE_URL,
): Promise<number | null> {
  try {
    const response = await fetch(`${GITHUB_API_ORIGIN}/repos/${repositorySlug(sourceUrl)}`, {
      headers: { accept: "application/vnd.github+json" },
      next: { revalidate: STAR_COUNT_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(STAR_COUNT_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const count = (payload as { stargazers_count?: unknown }).stargazers_count;
    return typeof count === "number" && Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

export function formatStarCount(count: number): string {
  if (count < 1_000) return String(count);
  return `${(count / 1_000).toFixed(count < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
}
