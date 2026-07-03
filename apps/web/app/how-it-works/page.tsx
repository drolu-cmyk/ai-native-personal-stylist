const steps = [
  ['1', 'Tell it the plan', 'Dinner, work, travel, church, rain, heat, or anything else that affects what you wear.'],
  ['2', 'It checks your closet', 'Only saved clothes are used. If an item is not available, it stays out.'],
  ['3', 'It gives a clear outfit', 'You see the items, the reason, and another option when needed.']
];

export default function HowItWorksPage() {
  return (
    <main className="site-shell">
      <section className="panel">
        <p className="eyebrow">How it works</p>
        <h1>From plan to outfit.</h1>
        <p className="lede">Simple steps. No long prompt. No made-up clothes.</p>
        <div className="flow">
          {steps.map(([number, title, body]) => (
            <div className="flow-step" key={number}>
              <span className="kicker">{number}</span>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
