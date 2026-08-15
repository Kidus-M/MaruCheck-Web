export default function Home() {
  return (
    <main className="shell">
      <header className="masthead">
        <a className="wordmark" href="#main" aria-label="MaruCheck home">
          MARU<span>CHECK</span>
        </a>
        <p className="system-status">
          <span aria-hidden="true" /> Hosted foundation online
        </p>
      </header>

      <section className="hero" id="main">
        <p className="eyebrow">Independent verification layer</p>
        <h1>
          Your AI built it.
          <strong>Now prove it works.</strong>
        </h1>
        <p className="lede">
          MaruCheck turns intended behavior into persistent Quality Contracts, tests the risky
          edges, and preserves evidence you can inspect.
        </p>

        <div className="verification-rail" aria-label="MaruCheck verification workflow">
          <div>
            <span>01 / Intent</span>
            <strong>Define what must remain true</strong>
          </div>
          <div>
            <span>02 / Challenge</span>
            <strong>Test beyond the happy path</strong>
          </div>
          <div>
            <span>03 / Evidence</span>
            <strong>Release with proof</strong>
          </div>
        </div>
      </section>

      <footer>
        <p>Local-first CLI and hosted dashboard. Separate releases, one verification protocol.</p>
        <code>maru verify --diff</code>
      </footer>
    </main>
  );
}
