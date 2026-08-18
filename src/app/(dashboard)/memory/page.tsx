import { PageHeader, PrimaryLink, SeverityPill } from "@/components/dashboard-ui";
import { Icon } from "@/components/icon";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function MemoryPage() {
  const { memory } = await getDashboardSnapshot();
  return (
    <div className="page-stack">
      <PageHeader action={<PrimaryLink href="/memory/new">Record memory</PrimaryLink>} description="Confirmed failures that should change how future work is verified." eyebrow="Knowledge / QA memory" title="QA memory" />
      <section className="memory-search panel"><Icon name="search" /><label><span className="sr-only">Search QA memory</span><input placeholder="Search bugs, root causes, files, contracts, or tags" /></label><kbd>⌘ K</kbd></section>
      <section className="memory-layout">
        <aside className="memory-filters"><strong>Filter memory</strong><button className="memory-filter memory-filter--active" type="button"><span>All records</span><b>{memory.length}</b></button><button className="memory-filter" type="button"><span>Security</span><b>1</b></button><button className="memory-filter" type="button"><span>Billing</span><b>1</b></button><button className="memory-filter" type="button"><span>Data integrity</span><b>1</b></button><hr /><small>Sort by</small><button className="memory-filter" type="button"><span>Most recently matched</span><Icon name="chevron" /></button></aside>
        <div className="memory-cards">
          {memory.map((record) => (
            <article className="memory-card" key={record.id}>
              <header><span className="memory-card__seal">◎</span><div><SeverityPill severity={record.severity} /><small>{record.id}</small></div><button aria-label={`Open ${record.title}`} type="button"><Icon name="arrow" /></button></header>
              <h2>{record.title}</h2><p>{record.summary}</p>
              <div className="tag-list">{record.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <footer><span><b>{record.regressions}</b> regression tests</span><span>Matched {record.lastMatched}</span></footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
