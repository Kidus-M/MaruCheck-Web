import { describe, expect, it, vi } from "vitest";
import {
  buildChangelog,
  classifyChange,
  fetchChangelog,
  groupChangesByMonth,
  referencedIssues,
} from "./changelog";

const kidus = {
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  html_url: "https://github.com/Kidus-M",
  login: "Kidus-M",
};

function commit(sha: string, message: string, date: string, parents = 1) {
  return {
    author: kidus,
    commit: { author: { date }, message },
    html_url: `https://github.com/Kidus-M/MaruCheck/commit/${sha}`,
    parents: Array.from({ length: parents }, (_, index) => ({ sha: `parent-${index}` })),
    sha,
  };
}

const CLI_PAYLOADS = {
  commits: [
    commit(
      "a1",
      "feat: add deterministic freshness and relevance scoring to QA memory\n\nEvery historical risk match now carries a relevance result.\n\nCloses #3",
      "2026-09-20T10:10:00Z",
    ),
    commit("a2", "fix(cli): keep memory list stable on Windows", "2026-09-19T09:00:00Z"),
    commit("a3", "docs: describe the relevance model", "2026-08-30T09:00:00Z"),
    commit("a4", "Merge pull request #9 from someone/branch", "2026-08-29T09:00:00Z", 2),
    { sha: "broken" },
  ],
  issues: [
    {
      closed_at: "2026-09-20T10:15:00Z",
      html_url: "https://github.com/Kidus-M/MaruCheck/issues/3",
      number: 3,
      state_reason: "completed",
      title: "Add freshness and relevance scoring to QA Memory",
      user: { login: "reporter", html_url: "https://github.com/reporter" },
    },
    {
      closed_at: "2026-09-01T10:15:00Z",
      html_url: "https://github.com/Kidus-M/MaruCheck/issues/2",
      number: 2,
      state_reason: "not_planned",
      title: "Ignored idea",
      user: kidus,
    },
    {
      closed_at: "2026-09-02T10:15:00Z",
      html_url: "https://github.com/Kidus-M/MaruCheck/pull/4",
      number: 4,
      pull_request: {},
      title: "A pull request listed as an issue",
      user: kidus,
    },
  ],
  pulls: [
    {
      body: "Resolves #7",
      html_url: "https://github.com/Kidus-M/MaruCheck/pull/9",
      merged_at: "2026-08-29T09:00:00Z",
      number: 9,
      title: "feat: add Jest adapter",
      user: { login: "contributor", avatar_url: null, html_url: "https://github.com/contributor" },
    },
    {
      html_url: "https://github.com/Kidus-M/MaruCheck/pull/10",
      merged_at: null,
      number: 10,
      title: "chore: closed without merge",
      user: kidus,
    },
  ],
  releases: [
    {
      author: kidus,
      body: "## Highlights\n\nQA memory relevance.\n\nMore below.",
      draft: false,
      html_url: "https://github.com/Kidus-M/MaruCheck/releases/tag/v0.4.0",
      name: "MaruCheck 0.4.0",
      published_at: "2026-08-28T14:00:00Z",
      tag_name: "v0.4.0",
    },
    { draft: true, html_url: "x", published_at: "2026-09-30T00:00:00Z", tag_name: "v9" },
  ],
};

describe("changelog", () => {
  it("classifies conventional commit headlines into human change kinds", () => {
    expect(classifyChange("feat(memory): add relevance")).toEqual({
      kind: "added",
      title: "Add relevance",
    });
    expect(classifyChange("fix: correct rounding")).toEqual({
      kind: "fixed",
      title: "Correct rounding",
    });
    expect(classifyChange("docs: explain it")).toMatchObject({ kind: "documented" });
    expect(classifyChange("refactor!: tidy")).toMatchObject({ kind: "improved" });
    expect(classifyChange("Plain headline")).toEqual({
      kind: "improved",
      title: "Plain headline",
    });
    expect(referencedIssues("Closes #3, fixes #12 and resolves owner/repo#8; see #99")).toEqual([
      3, 12, 8,
    ]);
  });

  it("builds a dated feed from commits, merged pulls, solved issues, and releases", () => {
    const feed = buildChangelog({ cli: CLI_PAYLOADS });

    expect(feed.unavailable).toEqual(["web"]);
    expect(feed.entries.map((entry) => [entry.kind, entry.title, entry.author?.login])).toEqual([
      ["solved", "Add freshness and relevance scoring to QA Memory", "Kidus-M"],
      ["added", "Add deterministic freshness and relevance scoring to QA memory", "Kidus-M"],
      ["fixed", "Keep memory list stable on Windows", "Kidus-M"],
      ["documented", "Describe the relevance model", "Kidus-M"],
      ["added", "Add Jest adapter", "contributor"],
      ["released", "MaruCheck 0.4.0 (v0.4.0)", "Kidus-M"],
    ]);
    expect(feed.entries[0]).toMatchObject({
      detail: "Reported by @reporter",
      references: [{ label: "#3", url: "https://github.com/Kidus-M/MaruCheck/issues/3" }],
      repository: "cli",
    });
    expect(feed.entries[1]).toMatchObject({
      detail: "Every historical risk match now carries a relevance result.",
      references: [{ label: "#3", url: "https://github.com/Kidus-M/MaruCheck/issues/3" }],
    });
    expect(feed.entries[4]?.references).toEqual([
      { label: "PR #9", url: "https://github.com/Kidus-M/MaruCheck/pull/9" },
      { label: "#7", url: "https://github.com/Kidus-M/MaruCheck/issues/7" },
    ]);
    expect(feed.entries[5]?.detail).toBe("## Highlights");
    expect(feed.contributors).toEqual([
      {
        author: { avatarUrl: kidus.avatar_url, login: "Kidus-M", url: kidus.html_url },
        counts: { added: 1, documented: 1, fixed: 1, improved: 0, released: 1, solved: 1 },
        total: 5,
      },
      {
        author: { avatarUrl: null, login: "contributor", url: "https://github.com/contributor" },
        counts: { added: 1, documented: 0, fixed: 0, improved: 0, released: 0, solved: 0 },
        total: 1,
      },
    ]);
    expect(
      groupChangesByMonth(feed.entries).map((group) => [group.month, group.entries.length]),
    ).toEqual([
      ["September 2026", 3],
      ["August 2026", 3],
    ]);
  });

  it("fetches both repositories and hides one that fails without failing the page", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/MaruCheck-Web/")) return new Response("rate limited", { status: 403 });
      if (url.includes("/commits")) return Response.json(CLI_PAYLOADS.commits);
      if (url.includes("/issues")) return Response.json(CLI_PAYLOADS.issues);
      if (url.includes("/pulls")) return Response.json(CLI_PAYLOADS.pulls);
      return Response.json(CLI_PAYLOADS.releases);
    }) as unknown as typeof fetch;

    const feed = await fetchChangelog(fetcher, "token");

    expect(feed.unavailable).toEqual(["web"]);
    expect(feed.entries).toHaveLength(6);
    expect(fetcher).toHaveBeenCalledTimes(8);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.github.com/repos/Kidus-M/MaruCheck/commits?per_page=60",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer token" }),
        next: { revalidate: 1800 },
      }),
    );
  });

  it("returns an empty feed when GitHub is unreachable", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    await expect(fetchChangelog(fetcher, undefined)).resolves.toEqual({
      contributors: [],
      entries: [],
      unavailable: ["cli", "web"],
    });
  });
});
