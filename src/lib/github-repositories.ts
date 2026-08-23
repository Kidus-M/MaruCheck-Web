import "server-only";

import { headers } from "next/headers";
import { getAuth, isGithubAuthConfigured } from "@/lib/auth";
import { requireSession } from "@/lib/session";

export interface GitHubRepository {
  readonly archived: boolean;
  readonly defaultBranch: string;
  readonly description: string | null;
  readonly fullName: string;
  readonly id: string;
  readonly name: string;
  readonly private: boolean;
  readonly pushedAt: string | null;
}

export type GitHubRepositoryConnection =
  | {
      readonly privateAccess: false;
      readonly repositories: readonly [];
      readonly status: "unconfigured" | "unlinked";
    }
  | {
      readonly message: string;
      readonly privateAccess: boolean;
      readonly repositories: readonly [];
      readonly status: "error";
    }
  | {
      readonly privateAccess: boolean;
      readonly repositories: readonly GitHubRepository[];
      readonly status: "ready";
    };

/** Load repositories with the current user's linked GitHub token without exposing it to the UI. */
export async function getGitHubRepositoryConnection(): Promise<GitHubRepositoryConnection> {
  if (!isGithubAuthConfigured()) {
    return { privateAccess: false, repositories: [], status: "unconfigured" };
  }

  await requireSession();
  const requestHeaders = await headers();
  const auth = getAuth();
  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const githubAccount = accounts.find((account) => account.providerId === "github");
  if (!githubAccount) {
    return { privateAccess: false, repositories: [], status: "unlinked" };
  }

  const privateAccess = githubAccount.scopes.includes("repo");
  try {
    const { accessToken, scopes } = await auth.api.getAccessToken({
      body: { accountId: githubAccount.id },
      headers: requestHeaders,
    });
    return {
      privateAccess: privateAccess || scopes.includes("repo"),
      repositories: await fetchGitHubRepositories(accessToken),
      status: "ready",
    };
  } catch (error) {
    console.error("Unable to load repositories from the linked GitHub account", error);
    return {
      message:
        "MaruCheck could not read the linked GitHub account. Reconnect GitHub and try again.",
      privateAccess,
      repositories: [],
      status: "error",
    };
  }
}

export async function fetchGitHubRepositories(
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<readonly GitHubRepository[]> {
  const response = await fetcher(
    "https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&direction=desc&per_page=100&sort=pushed",
    {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MaruCheck",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub repository request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("GitHub returned an invalid repository response.");

  return payload.flatMap((value): GitHubRepository[] => {
    if (!isRecord(value)) return [];
    const id = typeof value.id === "number" || typeof value.id === "string" ? String(value.id) : "";
    const name = stringValue(value.name);
    const fullName = stringValue(value.full_name);
    const defaultBranch = stringValue(value.default_branch);
    if (!id || !name || !fullName || !defaultBranch) return [];

    return [
      {
        archived: value.archived === true,
        defaultBranch,
        description: typeof value.description === "string" ? value.description : null,
        fullName,
        id,
        name,
        private: value.private === true,
        pushedAt: typeof value.pushed_at === "string" ? value.pushed_at : null,
      },
    ];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
