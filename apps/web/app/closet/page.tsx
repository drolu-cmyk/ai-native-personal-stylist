const items = ['Navy merino crew tee', 'Charcoal tapered trouser', 'Olive packable rain shell', 'White oxford shirt', 'Black cushioned walking loafers', 'Silver low-profile watch'];

export default function ClosetPage() {
  return (
    <main className="site-shell">
      <section className="panel">
        <p className="eyebrow">Digital closet</p>
        <h1>The trust layer.</h1>
        <p className="lede">Users should see the inventory the agent can use before trusting recommendations.</p>
        <div className="section-grid">
          {items.map((item) => (
            <article key={item}><h2>{item}</h2><p>Mock inventory item ready for scoring and recommendation.</p></article>
          ))}
        </div>
      </section>
    </main>
  );
}
