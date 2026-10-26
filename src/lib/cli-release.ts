import { MARUCHECK_CLI_FALLBACK_VERSION, MARUCHECK_CLI_PACKAGE } from "@/lib/public-release";

const NPM_REGISTRY_ORIGIN = "https://registry.npmjs.org";
const CLI_RELEASE_REVALIDATE_SECONDS = 3_600;
const CLI_RELEASE_TIMEOUT_MS = 2_500;
const RELEASE_VERSION = /^\d+\.\d+\.\d+$/;

export type CliRelease = {
  /** Exact install spec, e.g. "marucheck@0.6.1". */
  readonly spec: string;
  readonly version: string;
};

export function cliRelease(version: string): CliRelease {
  return { spec: `${MARUCHECK_CLI_PACKAGE}@${version}`, version };
}

/**
 * The version every page advertises is whatever npm currently tags `latest`, so
 * publishing the CLI updates the site within the revalidate window without a
 * redeploy. Any failure (offline build, registry outage, prerelease tag) falls
 * back to the pinned version instead of breaking the page.
 */
export async function fetchCliRelease(fetcher: typeof fetch = fetch): Promise<CliRelease> {
  try {
    const response = await fetcher(`${NPM_REGISTRY_ORIGIN}/${MARUCHECK_CLI_PACKAGE}/latest`, {
      headers: { accept: "application/json" },
      next: { revalidate: CLI_RELEASE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(CLI_RELEASE_TIMEOUT_MS),
    });
    if (!response.ok) return cliRelease(MARUCHECK_CLI_FALLBACK_VERSION);
    const payload: unknown = await response.json();
    const version = (payload as { version?: unknown }).version;
    return typeof version === "string" && RELEASE_VERSION.test(version)
      ? cliRelease(version)
      : cliRelease(MARUCHECK_CLI_FALLBACK_VERSION);
  } catch {
    return cliRelease(MARUCHECK_CLI_FALLBACK_VERSION);
  }
}
