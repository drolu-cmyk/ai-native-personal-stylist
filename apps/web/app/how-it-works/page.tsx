const steps = [
  ['01', 'Build the private closet', 'Save each piece with its category, color, fit, formality, season, availability, and optional image reference. The system cannot recommend what is not there.'],
  ['02', 'Read the immediate context', 'The user describes the plan. With permission, weather, calendar timing, destination, and travel conditions add useful context without turning the product into a general assistant.'],
  ['03', 'Rank complete combinations', 'The stylist filters unavailable or unsuitable pieces, compares valid combinations, and returns one outfit made only from saved item IDs.'],
  ['04', 'Explain the decision briefly', 'The user sees the pieces, the reason they work, any caution, and a close alternative. The product avoids a long fashion essay.'],
  ['05', 'Learn from the response', 'Accepting, swapping, skipping, or marking an item unavailable becomes a preference signal for future recommendations.']
];

export default function HowItWorksPage() {
  return (
    <main className="site-shell how-page">
      <section>
        <p className="eyebrow">How it works</p>
        <h1>A narrow system for one recurring decision.</h1>
        <p className="lede">
          The value is not an open-ended chat. It is the combination of wardrobe memory, immediate context, constrained recommendation, and feedback over time.
        </p>
      </section>

      <section className="flow" aria-label="Stylist system flow">
        {steps.map(([number, title, body]) => (
          <article className="flow-step" key={number}>
            <span className="kicker">{number}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
