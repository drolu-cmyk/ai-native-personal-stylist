export default function VoicePage() {
  return (
    <main className="site-shell">
      <section className="hero-grid">
        <div>
          <p className="eyebrow">Voice loop</p>
          <h1>Say the situation. Get a structured outfit plan.</h1>
          <p className="lede">The demo payload uses mock providers so the loop can be tested without paid services.</p>
          <div className="demo-box">
            <p>I need dinner clothes and it might rain.</p>
          </div>
        </div>
        <aside className="agent-card">
          <p className="card-label">Expected result</p>
          <h2>Outfit slots, alternatives, cautions, and TTS summary.</h2>
          <p>Primary slots stay bound to closet item IDs.</p>
        </aside>
      </section>
    </main>
  );
}
