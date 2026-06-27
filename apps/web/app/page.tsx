export default function HomePage() {
  return (
    <main className="site-shell">
      <section className="hero-grid">
        <div>
          <p className="eyebrow">Personal stylist</p>
          <h1>Ask what to wear. Use what you own.</h1>
          <p className="lede">
            Tell the app where you are going. It checks your closet, the weather, and the occasion, then gives you a simple outfit.
          </p>
          <div className="actions">
            <a className="button" href="/voice">Find an outfit</a>
            <a className="button secondary" href="/closet">View closet</a>
          </div>
          <p className="trust-line">The outfit comes from saved closet items only.</p>
        </div>
        <aside className="agent-card" aria-label="Sample outfit">
          <p className="card-label">Example</p>
          <h2>Dinner soon. Rain likely.</h2>
          <ol>
            <li>Checks the plan.</li>
            <li>Checks the weather.</li>
            <li>Checks saved clothes.</li>
            <li>Shows the outfit and a backup.</li>
          </ol>
        </aside>
      </section>
      <section className="section-grid">
        <article><h2>Your closet</h2><p>The app works from clothes you have already saved.</p></article>
        <article><h2>The day ahead</h2><p>Weather, time, and the occasion help narrow the choice.</p></article>
        <article><h2>Your response</h2><p>Say yes, ask for another mix, or mark an item unavailable.</p></article>
      </section>
    </main>
  );
}
