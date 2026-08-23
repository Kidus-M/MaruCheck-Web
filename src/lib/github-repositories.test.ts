import { describe, expect, it, vi } from "vitest";
import { fetchGitHubRepositories } from "./github-repositories";

describe("GitHub repository discovery", () => {
  it("normalizes valid repositories and ignores malformed entries", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json([
        {
          archived: false,
          default_branch: "main",
          description: "Hosted verification",
          full_name: "Kidus-M/MaruCheck",
          id: 42,
          name: "MaruCheck",
          private: true,
          pushed_at: "2026-08-23T12:00:00Z",
        },
        { id: 43, name: "missing-fields" },
      ]),
    ) as unknown as typeof fetch;

    const repositories = await fetchGitHubRepositories("github-token", fetcher);

    expect(repositories).toEqual([
      {
        archived: false,
        defaultBranch: "main",
        description: "Hosted verification",
        fullName: "Kidus-M/MaruCheck",
        id: "42",
        name: "MaruCheck",
        private: true,
        pushedAt: "2026-08-23T12:00:00Z",
      },
    ]);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/user/repos?"),
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({ Authorization: "Bearer github-token" }),
      }),
    );
  });

  it("rejects unsuccessful GitHub responses", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 403 })) as unknown as typeof fetch;

    await expect(fetchGitHubRepositories("github-token", fetcher)).rejects.toThrow(
      "GitHub repository request failed with status 403.",
    );
  });

  it("rejects a non-list repository payload", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ message: "unexpected" })) as unknown as
      typeof fetch;

    await expect(fetchGitHubRepositories("github-token", fetcher)).rejects.toThrow(
      "GitHub returned an invalid repository response.",
    );
  });
});
