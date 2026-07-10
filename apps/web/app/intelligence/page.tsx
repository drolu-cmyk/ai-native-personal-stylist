const insights = [
  {
    metric: 'Most reliable',
    title: 'Your black walking loafers solve the most situations.',
    body: 'They support work, formal events, travel, rain, and long walking days without forcing a trade-off between polish and comfort.',
    featured: true
  },
  {
    metric: 'Weather gap',
    title: 'You have rain protection, but only at a casual level.',
    body: 'The olive shell works for travel and commuting. A more polished rain layer would cover formal evenings.'
  },
  {
    metric: 'Underused',
    title: 'The navy merino tee can do more than casual days.',
    body: 'Pair it with the charcoal trouser and loafers for a quieter smart-casual combination.'
  },
  {
    metric: 'Strongest category',
    title: 'Your business basics are already coherent.',
    body: 'The white oxford, charcoal trouser, black blazer, watch, and loafers create several complete combinations.'
  },
  {
    metric: 'Next learning signal',
    title: 'The stylist needs your reaction to warm-weather outfits.',
    body: 'Accepting or rejecting combinations with the linen chinos will improve summer recommendations.'
  }
];

export default function IntelligencePage() {
  return (
    <main className="site-shell intelligence-page">
      <section>
        <p className="eyebrow">Wardrobe intelligence</p>
        <h1>Know what works before buying anything else.</h1>
        <p className="lede">
          This layer turns closet data and outfit feedback into practical observations: what earns its place, what is missing, and what the stylist still needs to learn.
        </p>
      </section>

      <section className="insight-grid" aria-label="Wardrobe insights">
        {insights.map((insight) => (
          <article className={`insight-card${insight.featured ? ' featured' : ''}`} key={insight.title}>
            <span className="metric">{insight.metric}</span>
            <h2>{insight.title}</h2>
            <p>{insight.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
