import Link from 'next/link';

const outfitPieces = [
  { label: 'White oxford', className: 'piece-shirt' },
  { label: 'Charcoal trouser', className: 'piece-trouser' },
  { label: 'Black loafers', className: 'piece-shoes' },
  { label: 'Olive rain shell', className: 'piece-shell' }
];

export default function HomePage() {
  return (
    <main className="site-shell home-page">
      <section className="hero-editorial">
        <div className="hero-copy">
          <p className="eyebrow">Your closet, ready before you are</p>
          <h1>Tell it the day. Leave with the outfit.</h1>
          <p className="lede hero-lede">
            A private stylist that works from clothes you already own, checks the context around your day, and gives you one clear answer.
          </p>
          <div className="actions">
            <Link className="button" href="/voice">Dress me now</Link>
            <Link className="button secondary" href="/closet">Open my closet</Link>
          </div>
          <div className="trust-stack" aria-label="Product boundaries">
            <span>Closet-backed recommendations</span>
            <span>No shopping feed</span>
            <span>Permission-based context</span>
          </div>
        </div>

        <aside className="today-card" aria-label="Today’s outfit example">
          <div className="today-card-header">
            <div>
              <p className="card-label">Ready for you</p>
              <h2>Dinner in 20 minutes</h2>
            </div>
            <span className="weather-chip">16° · Rain</span>
          </div>
          <div className="outfit-visual" aria-label="Four-piece outfit preview">
            {outfitPieces.map((piece) => (
              <div className={`outfit-piece ${piece.className}`} key={piece.label}>
                <span>{piece.label}</span>
              </div>
            ))}
          </div>
          <div className="stylist-note">
            <span className="note-avatar" aria-hidden="true">A</span>
            <p><strong>Wear this.</strong> Polished enough for dinner, comfortable for the walk, and covered for the rain.</p>
          </div>
          <Link className="text-link" href="/voice">See the full decision <span aria-hidden="true">→</span></Link>
        </aside>
      </section>

      <section className="decision-section" aria-labelledby="decision-title">
        <div className="section-heading">
          <p className="eyebrow">Less browsing. Better decisions.</p>
          <h2 id="decision-title">One useful answer, built from four signals.</h2>
        </div>
        <div className="signal-grid">
          <article>
            <span className="signal-number">01</span>
            <h3>Your actual clothes</h3>
            <p>Every recommendation points to an item already saved in your wardrobe.</p>
          </article>
          <article>
            <span className="signal-number">02</span>
            <h3>The day ahead</h3>
            <p>Weather, time, destination, and occasion narrow the choice before you ask.</p>
          </article>
          <article>
            <span className="signal-number">03</span>
            <h3>How you like to dress</h3>
            <p>Fit, comfort, formality, and the combinations you accept shape the next answer.</p>
          </article>
          <article>
            <span className="signal-number">04</span>
            <h3>What is available</h3>
            <p>Laundry, packing, and unavailable items stay out of the recommendation automatically.</p>
          </article>
        </div>
      </section>

      <section className="product-principle">
        <div>
          <p className="eyebrow">The product principle</p>
          <h2>The assistant should know your wardrobe well enough to stay quiet until it has something useful to say.</h2>
        </div>
        <Link className="button secondary light-button" href="/how-it-works">See how it works</Link>
      </section>
    </main>
  );
}
