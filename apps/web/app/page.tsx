export default function HomePage() {
  return (
    <main className="site-shell">
      <section className="hero-grid">
        <div>
          <p className="eyebrow">Voice-first AI styling</p>
          <h1>Ask what to wear. Get an outfit from your real closet.</h1>
          <p className="lede">
            A personal styling agent that combines your clothes, the weather, your calendar, fit preferences, and the occasion before recommending an outfit.
          </p>
          <div className="actions">
            <a className="button" href="/voice">Try the voice loop</a>
            <a className="button secondary" href="/how-it-works">See how it works</a>
          </div>
          <p className="trust-line">No imaginary clothes. Every outfit slot must reference an item the user actually owns.</p>
        </div>
        <aside className="agent-card" aria-label="Sample outfit reasoning">
          <p className="card-label">Agent decision</p>
          <h2>Dinner in 20 minutes. Rain likely.</h2>
          <ol>
            <li>Reads the voice request.</li>
            <li>Checks weather, calendar, and closet.</li>
            <li>Filters unavailable and excluded items.</li>
            <li>Returns a speech-ready outfit plan.</li>
          </ol>
        </aside>
      </section>
      <section className="section-grid">
        <article><h2>Closet-bound</h2><p>Recommendations point to existing item IDs instead of generic fashion text.</p></article>
        <article><h2>Context-aware</h2><p>Weather, time, formality, comfort, and occasion shape the result.</p></article>
        <article><h2>Feedback-ready</h2><p>Acceptance, rejection, and swaps become signals for future decisions.</p></article>
      </section>
    </main>
  );
}
