import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { MarketingCta } from "@/components/marketing-ui";
import {
  CHANGE_KIND_LABELS,
  CHANGE_REPOSITORY_LABELS,
  fetchChangelog,
  formatChangeDay,
  groupChangesByMonth,
  type ChangeAuthor,
  type ChangeKind,
  type ChangelogFeed,
  type ContributorSummary,
} from "@/lib/changelog";
import {
  MARUCHECK_RELEASES_URL,
  MARUCHECK_SOURCE_URL,
  MARUCHECK_WEB_SOURCE_URL,
} from "@/lib/public-release";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  description:
    "What's new in MaruCheck: every feature added, bug fixed, issue solved, and release published across the CLI and web repositories, with the person who did it, straight from GitHub.",
  keywords: ["MaruCheck changelog", "MaruCheck release notes", "what's new in MaruCheck"],
  path: "/changelog",
  title: "What's new",
});

const KIND_ORDER: readonly ChangeKind[] = [
  "added",
  "fixed",
  "solved",
  "improved",
  "documented",
  "released",
];

function isChangeKind(value: string | undefined): value is ChangeKind {
  return value !== undefined && (KIND_ORDER as readonly string[]).includes(value);
}

function avatarSource(url: string): string {
  try {
    const sized = new URL(url);
    sized.searchParams.set("s", "56");
    return sized.toString();
  } catch {
    return url;
  }
}

function Avatar({ author }: { readonly author: ChangeAuthor | null }) {
  if (author === null) {
    return (
      <span className="changelog-author changelog-author--unknown">
        <i aria-hidden="true">?</i>
        <span>unattributed</span>
      </span>
    );
  }
  const body = (
    <>
      {author.avatarUrl === null ? (
        <i aria-hidden="true">{author.login.slice(0, 1).toUpperCase()}</i>
      ) : (
        // GitHub avatars are remote and decorative; a plain img avoids the image-domain allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" height={28} loading="lazy" src={avatarSource(author.avatarUrl)} width={28} />
      )}
      <span>@{author.login}</span>
    </>
  );
  return author.url === null ? (
    <span className="changelog-author">{body}</span>
  ) : (
    <a className="changelog-author" href={author.url} rel="noreferrer" target="_blank">
      {body}
    </a>
  );
}

function Contributor({ summary }: { readonly summary: ContributorSummary }) {
  const active = KIND_ORDER.filter((kind) => summary.counts[kind] > 0);
  return (
    <li className="changelog-contributor" data-gsap>
      <Avatar author={summary.author} />
      <strong>{summary.total}</strong>
      <ul aria-label={`Changes by ${summary.author.login}`}>
        {active.map((kind) => (
          <li data-kind={kind} key={kind}>
            <b>{summary.counts[kind]}</b> {CHANGE_KIND_LABELS[kind].toLowerCase()}
          </li>
        ))}
      </ul>
    </li>
  );
}

function Filters({
  feed,
  selected,
}: {
  readonly feed: ChangelogFeed;
  readonly selected?: ChangeKind;
}) {
  const counts = KIND_ORDER.map((kind) => ({
    count: feed.entries.filter((entry) => entry.kind === kind).length,
    kind,
  }));
  return (
    <nav aria-label="Filter changes by kind" className="changelog-filters">
      <Link aria-current={selected === undefined ? "page" : undefined} href="/changelog">
        All <b>{feed.entries.length}</b>
      </Link>
      {counts.map(({ count, kind }) => (
        <Link
          aria-current={selected === kind ? "page" : undefined}
          data-kind={kind}
          href={`/changelog?kind=${kind}`}
          key={kind}
        >
          {CHANGE_KIND_LABELS[kind]} <b>{count}</b>
        </Link>
      ))}
    </nav>
  );
}

export default async function ChangelogPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ kind?: string | string[] }>;
}) {
  const { kind } = await searchParams;
  const requested = Array.isArray(kind) ? kind[0] : kind;
  const selected = isChangeKind(requested) ? requested : undefined;
  const feed = await fetchChangelog();
  const visible =
    selected === undefined ? feed.entries : feed.entries.filter((entry) => entry.kind === selected);
  const months = groupChangesByMonth(visible);
  const latest = feed.entries[0];

  return (
    <>
      <section className="changelog-hero" data-gsap-hero>
        <div className="oss-hero__grid" aria-hidden="true" />
        <div className="marketing-container oss-hero__inner">
          <p className="v2-kicker">
            <span>WHAT&apos;S NEW / CHANGELOG</span> Read straight from the repositories
          </p>
          <h1>
            Who changed
            <br />
            <em>what.</em>
          </h1>
          <div className="oss-hero__foot">
            <p>
              Every feature added, bug fixed, issue solved, and release published across the
              MaruCheck CLI and web console, attributed to the person who did it. Nothing here is
              hand-written: it is the public GitHub history of both repositories.
            </p>
            <div className="marketing-actions">
              <MarketingCta href={MARUCHECK_RELEASES_URL}>Release notes</MarketingCta>
              <MarketingCta href={`${MARUCHECK_SOURCE_URL}/issues`} secondary>
                Report something
              </MarketingCta>
            </div>
          </div>
          {latest === undefined ? null : (
            <p className="changelog-hero__latest">
              <span>LATEST</span> {formatChangeDay(latest.date)} · {CHANGE_KIND_LABELS[latest.kind]}{" "}
              · <a href={latest.url}>{latest.title}</a>
            </p>
          )}
        </div>
      </section>

      <section className="changelog-people">
        <div className="marketing-container">
          <div className="oss-repositories__heading" data-gsap>
            <p className="section-index">01 — WHO DID WHAT</p>
            <h2>Every change has a name on it.</h2>
            <p>
              Counts cover the {feed.entries.length} most recent changes. Solved issues are credited
              to whoever closed them through a commit or pull request.
            </p>
          </div>
          {feed.contributors.length === 0 ? (
            <p className="changelog-empty">
              GitHub activity could not be loaded right now. The repositories themselves are always
              available: <a href={MARUCHECK_SOURCE_URL}>CLI</a> and{" "}
              <a href={MARUCHECK_WEB_SOURCE_URL}>Web</a>.
            </p>
          ) : (
            <ul className="changelog-contributors">
              {feed.contributors.map((summary) => (
                <Contributor key={summary.author.login} summary={summary} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="changelog-log">
        <div className="marketing-container">
          <div className="changelog-log__heading" data-gsap>
            <p className="section-index">02 — THE LOG</p>
            <h2>Newest first.</h2>
            <Filters feed={feed} selected={selected} />
            {feed.unavailable.length === 0 ? null : (
              <p className="changelog-note">
                {feed.unavailable
                  .map((repository) => CHANGE_REPOSITORY_LABELS[repository])
                  .join(" and ")}{" "}
                activity is temporarily unavailable from GitHub and is not shown below.
              </p>
            )}
          </div>
          {months.length === 0 ? (
            <p className="changelog-empty">
              {feed.entries.length === 0
                ? "No changes could be loaded from GitHub right now."
                : `No ${selected === undefined ? "" : CHANGE_KIND_LABELS[selected].toLowerCase()} changes in the recent history.`}
            </p>
          ) : (
            months.map((group) => (
              <section className="changelog-month" key={group.month}>
                <h3>{group.month}</h3>
                <ol>
                  {group.entries.map((entry) => (
                    <li className="changelog-entry" data-gsap data-kind={entry.kind} key={entry.id}>
                      <time dateTime={entry.date}>{formatChangeDay(entry.date)}</time>
                      <span className="changelog-kind">{CHANGE_KIND_LABELS[entry.kind]}</span>
                      <div className="changelog-entry__body">
                        <a href={entry.url} rel="noreferrer" target="_blank">
                          {entry.title}
                        </a>
                        {entry.detail === null ? null : <p>{entry.detail}</p>}
                        <div className="changelog-entry__meta">
                          <Avatar author={entry.author} />
                          <span className="changelog-repository">
                            {CHANGE_REPOSITORY_LABELS[entry.repository]}
                          </span>
                          {entry.references.map((reference) => (
                            <a
                              href={reference.url}
                              key={reference.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {reference.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))
          )}
        </div>
      </section>

      <JsonLd
        nodes={[
          breadcrumbSchema([
            { name: "MaruCheck", path: "/" },
            { name: "What's new", path: "/changelog" },
          ]),
        ]}
      />
    </>
  );
}
