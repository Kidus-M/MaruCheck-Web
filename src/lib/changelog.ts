import { MARUCHECK_SOURCE_URL, MARUCHECK_WEB_SOURCE_URL } from "@/lib/public-release";

const GITHUB_API_ORIGIN = "https://api.github.com";
const CHANGELOG_REVALIDATE_SECONDS = 1_800;
const CHANGELOG_TIMEOUT_MS = 4_000;
const MAX_ENTRIES = 80;
const MAX_DETAIL_LENGTH = 220;

export type ChangeKind = "added" | "documented" | "fixed" | "improved" | "released" | "solved";
export type ChangeRepository = "cli" | "web";

export interface ChangeAuthor {
  readonly avatarUrl: string | null;
  readonly login: string;
  readonly url: string | null;
}

export interface ChangeReference {
  readonly label: string;
  readonly url: string;
}

export interface ChangeEntry {
  readonly author: ChangeAuthor | null;
  /** ISO timestamp of the commit, merge, close, or publish. */
  readonly date: string;
  readonly detail: string | null;
  readonly id: string;
  readonly kind: ChangeKind;
  readonly references: readonly ChangeReference[];
  readonly repository: ChangeRepository;
  readonly title: string;
  readonly url: string;
}

export interface ContributorSummary {
  readonly author: ChangeAuthor;
  readonly counts: Readonly<Record<ChangeKind, number>>;
  readonly total: number;
}

export interface ChangelogFeed {
  readonly contributors: readonly ContributorSummary[];
  readonly entries: readonly ChangeEntry[];
  /** Repositories whose GitHub data could not be loaded; their entries are simply absent. */
  readonly unavailable: readonly ChangeRepository[];
}

export const CHANGE_KIND_LABELS: Readonly<Record<ChangeKind, string>> = {
  added: "Added",
  documented: "Documented",
  fixed: "Fixed",
  improved: "Improved",
  released: "Released",
  solved: "Solved",
};

export const CHANGE_REPOSITORY_LABELS: Readonly<Record<ChangeRepository, string>> = {
  cli: "CLI",
  web: "Web",
};

const REPOSITORIES: Readonly<Record<ChangeRepository, string>> = {
  cli: MARUCHECK_SOURCE_URL,
  web: MARUCHECK_WEB_SOURCE_URL,
};

const CONVENTIONAL_PREFIX = /^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/u;
const ISSUE_REFERENCE =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:[\w.-]+\/[\w.-]+)?#(\d+)/giu;
const KIND_BY_TYPE: Readonly<Record<string, ChangeKind>> = {
  build: "improved",
  chore: "improved",
  ci: "improved",
  docs: "documented",
  feat: "added",
  feature: "added",
  fix: "fixed",
  hotfix: "fixed",
  perf: "improved",
  refactor: "improved",
  revert: "fixed",
  style: "improved",
  test: "improved",
};

function repositorySlug(sourceUrl: string): string {
  return new URL(sourceUrl).pathname.replace(/^\/|\/$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isoDate(value: unknown): string | null {
  const raw = text(value);
  return raw !== null && Number.isFinite(Date.parse(raw)) ? new Date(raw).toISOString() : null;
}

function author(value: unknown): ChangeAuthor | null {
  if (!isRecord(value)) return null;
  const login = text(value.login);
  if (login === null) return null;
  return { avatarUrl: text(value.avatar_url), login, url: text(value.html_url) };
}

/** Split a conventional commit headline into a human label and a plain subject. */
export function classifyChange(headline: string): { kind: ChangeKind; title: string } {
  const match = CONVENTIONAL_PREFIX.exec(headline.trim());
  const type = match?.[1];
  const subject = match?.[2];
  if (type !== undefined && subject !== undefined && type in KIND_BY_TYPE) {
    return { kind: KIND_BY_TYPE[type]!, title: capitalize(subject.trim()) };
  }
  return { kind: "improved", title: capitalize(headline.trim()) };
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0]!.toUpperCase()}${value.slice(1)}`;
}

function truncate(value: string): string {
  const flattened = value.replace(/\s+/gu, " ").trim();
  return flattened.length <= MAX_DETAIL_LENGTH
    ? flattened
    : `${flattened.slice(0, MAX_DETAIL_LENGTH - 1).trimEnd()}…`;
}

/** Issue numbers a commit or pull request message claims to close. */
export function referencedIssues(message: string): number[] {
  return [...new Set([...message.matchAll(ISSUE_REFERENCE)].map((match) => Number(match[1])))];
}

function issueReference(repository: ChangeRepository, number: number): ChangeReference {
  return { label: `#${number}`, url: `${REPOSITORIES[repository]}/issues/${number}` };
}

interface RepositoryPayloads {
  readonly commits: unknown;
  readonly issues: unknown;
  readonly pulls: unknown;
  readonly releases: unknown;
}

function commitEntries(
  repository: ChangeRepository,
  payload: unknown,
): { entries: ChangeEntry[]; solvers: Map<number, ChangeAuthor> } {
  const entries: ChangeEntry[] = [];
  const solvers = new Map<number, ChangeAuthor>();
  if (!Array.isArray(payload)) return { entries, solvers };
  for (const item of payload) {
    if (!isRecord(item) || !isRecord(item.commit)) continue;
    const sha = text(item.sha);
    const url = text(item.html_url);
    const message = text(item.commit.message);
    const date = isoDate(isRecord(item.commit.author) ? item.commit.author.date : undefined);
    if (sha === null || url === null || message === null || date === null) continue;
    // Merge commits duplicate the pull request that already appears in the feed.
    if (Array.isArray(item.parents) && item.parents.length > 1) continue;
    const [headline = "", ...rest] = message.split(/\r?\n/u);
    const body = rest.join("\n").trim();
    const { kind, title } = classifyChange(headline);
    const who = author(item.author);
    const issues = referencedIssues(message);
    if (who !== null) for (const issue of issues) solvers.set(issue, who);
    entries.push({
      author: who,
      date,
      detail: body.length === 0 ? null : truncate(body.split(/\n\s*\n/u)[0] ?? ""),
      id: `${repository}-commit-${sha}`,
      kind,
      references: issues.map((issue) => issueReference(repository, issue)),
      repository,
      title,
      url,
    });
  }
  return { entries, solvers };
}

function pullEntries(
  repository: ChangeRepository,
  payload: unknown,
): { entries: ChangeEntry[]; solvers: Map<number, ChangeAuthor> } {
  const entries: ChangeEntry[] = [];
  const solvers = new Map<number, ChangeAuthor>();
  if (!Array.isArray(payload)) return { entries, solvers };
  for (const item of payload) {
    if (!isRecord(item)) continue;
    const number = typeof item.number === "number" ? item.number : null;
    const url = text(item.html_url);
    const headline = text(item.title);
    const date = isoDate(item.merged_at);
    if (number === null || url === null || headline === null || date === null) continue;
    const { kind, title } = classifyChange(headline);
    const who = author(item.user);
    const issues = referencedIssues(`${headline}\n${text(item.body) ?? ""}`);
    if (who !== null) for (const issue of issues) solvers.set(issue, who);
    entries.push({
      author: who,
      date,
      detail: `Pull request #${number} merged`,
      id: `${repository}-pull-${number}`,
      kind,
      references: [
        { label: `PR #${number}`, url },
        ...issues.map((issue) => issueReference(repository, issue)),
      ],
      repository,
      title,
      url,
    });
  }
  return { entries, solvers };
}

function issueEntries(
  repository: ChangeRepository,
  payload: unknown,
  solvers: ReadonlyMap<number, ChangeAuthor>,
): ChangeEntry[] {
  if (!Array.isArray(payload)) return [];
  const entries: ChangeEntry[] = [];
  for (const item of payload) {
    if (!isRecord(item) || "pull_request" in item) continue;
    if (item.state_reason === "not_planned" || item.state_reason === "duplicate") continue;
    const number = typeof item.number === "number" ? item.number : null;
    const url = text(item.html_url);
    const title = text(item.title);
    const date = isoDate(item.closed_at);
    if (number === null || url === null || title === null || date === null) continue;
    const reporter = author(item.user);
    const assignee = Array.isArray(item.assignees) ? author(item.assignees[0]) : null;
    const solver = solvers.get(number) ?? assignee;
    entries.push({
      author: solver,
      date,
      detail: reporter === null ? null : `Reported by @${reporter.login}`,
      id: `${repository}-issue-${number}`,
      kind: "solved",
      references: [{ label: `#${number}`, url }],
      repository,
      title,
      url,
    });
  }
  return entries;
}

function releaseEntries(repository: ChangeRepository, payload: unknown): ChangeEntry[] {
  if (!Array.isArray(payload)) return [];
  const entries: ChangeEntry[] = [];
  for (const item of payload) {
    if (!isRecord(item) || item.draft === true) continue;
    const tag = text(item.tag_name);
    const url = text(item.html_url);
    const date = isoDate(item.published_at);
    if (tag === null || url === null || date === null) continue;
    const name = text(item.name);
    const body = text(item.body);
    entries.push({
      author: author(item.author),
      date,
      detail: body === null ? null : truncate(body.split(/\n\s*\n/u)[0] ?? ""),
      id: `${repository}-release-${tag}`,
      kind: "released",
      references: [{ label: tag, url }],
      repository,
      title: name !== null && name !== tag ? `${name} (${tag})` : `Release ${tag}`,
      url,
    });
  }
  return entries;
}

function summarizeContributors(entries: readonly ChangeEntry[]): ContributorSummary[] {
  const byLogin = new Map<string, { author: ChangeAuthor; counts: Record<ChangeKind, number> }>();
  for (const entry of entries) {
    if (entry.author === null) continue;
    const existing = byLogin.get(entry.author.login) ?? {
      author: entry.author,
      counts: { added: 0, documented: 0, fixed: 0, improved: 0, released: 0, solved: 0 },
    };
    existing.counts[entry.kind] += 1;
    byLogin.set(entry.author.login, existing);
  }
  return [...byLogin.values()]
    .map((item) => ({
      ...item,
      total: Object.values(item.counts).reduce((sum, count) => sum + count, 0),
    }))
    .sort(
      (left, right) =>
        right.total - left.total || left.author.login.localeCompare(right.author.login),
    );
}

/** Pure assembly of a feed from already-fetched GitHub payloads; testable without the network. */
export function buildChangelog(
  payloads: Partial<Record<ChangeRepository, RepositoryPayloads>>,
): ChangelogFeed {
  const entries: ChangeEntry[] = [];
  const unavailable: ChangeRepository[] = [];
  for (const repository of Object.keys(REPOSITORIES) as ChangeRepository[]) {
    const payload = payloads[repository];
    if (payload === undefined) {
      unavailable.push(repository);
      continue;
    }
    const commits = commitEntries(repository, payload.commits);
    const pulls = pullEntries(repository, payload.pulls);
    const solvers = new Map([...pulls.solvers, ...commits.solvers]);
    entries.push(
      ...commits.entries,
      ...pulls.entries,
      ...issueEntries(repository, payload.issues, solvers),
      ...releaseEntries(repository, payload.releases),
    );
  }
  const sorted = entries
    .sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id))
    .slice(0, MAX_ENTRIES);
  return { contributors: summarizeContributors(sorted), entries: sorted, unavailable };
}

async function fetchJson(
  fetcher: typeof fetch,
  slug: string,
  resource: string,
  token: string | undefined,
): Promise<unknown> {
  const response = await fetcher(`${GITHUB_API_ORIGIN}/repos/${slug}/${resource}`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
    },
    next: { revalidate: CHANGELOG_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(CHANGELOG_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub responded ${response.status} for ${slug}/${resource}`);
  return response.json();
}

async function fetchRepositoryPayloads(
  fetcher: typeof fetch,
  sourceUrl: string,
  token: string | undefined,
): Promise<RepositoryPayloads | undefined> {
  const slug = repositorySlug(sourceUrl);
  try {
    const [commits, issues, pulls, releases] = await Promise.all([
      fetchJson(fetcher, slug, "commits?per_page=60", token),
      fetchJson(
        fetcher,
        slug,
        "issues?state=closed&sort=updated&direction=desc&per_page=30",
        token,
      ),
      fetchJson(fetcher, slug, "pulls?state=closed&sort=updated&direction=desc&per_page=30", token),
      fetchJson(fetcher, slug, "releases?per_page=10", token),
    ]);
    return { commits, issues, pulls, releases };
  } catch {
    // The feed is informational: a rate limit or offline build hides that repository, not the page.
    return undefined;
  }
}

/**
 * Load recent activity for both public repositories. An optional GITHUB_CHANGELOG_TOKEN raises
 * the unauthenticated API rate limit; nothing else changes.
 */
export async function fetchChangelog(
  fetcher: typeof fetch = fetch,
  token: string | undefined = process.env.GITHUB_CHANGELOG_TOKEN,
): Promise<ChangelogFeed> {
  const [cli, web] = await Promise.all([
    fetchRepositoryPayloads(fetcher, REPOSITORIES.cli, token),
    fetchRepositoryPayloads(fetcher, REPOSITORIES.web, token),
  ]);
  return buildChangelog({
    ...(cli === undefined ? {} : { cli }),
    ...(web === undefined ? {} : { web }),
  });
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});
const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatChangeMonth(date: string): string {
  return MONTH_FORMAT.format(new Date(date));
}

export function formatChangeDay(date: string): string {
  return DAY_FORMAT.format(new Date(date));
}

/** Group entries by calendar month, newest first, preserving the feed order inside each group. */
export function groupChangesByMonth(
  entries: readonly ChangeEntry[],
): readonly { readonly entries: readonly ChangeEntry[]; readonly month: string }[] {
  const groups = new Map<string, ChangeEntry[]>();
  for (const entry of entries) {
    const month = formatChangeMonth(entry.date);
    groups.set(month, [...(groups.get(month) ?? []), entry]);
  }
  return [...groups].map(([month, grouped]) => ({ entries: grouped, month }));
}
