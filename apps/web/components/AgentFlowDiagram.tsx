const steps = [
  'Voice request',
  'Intent signals',
  'Weather + calendar',
  'Closet constraints',
  'Inventory-bound outfit',
  'Explanation + feedback'
];

export function AgentFlowDiagram() {
  return (
    <div className="flow" aria-label="AI styling flow">
      {steps.map((step, index) => (
        <div className="flow-step" key={step}>
          <span className="kicker">{String(index + 1).padStart(2, '0')}</span>
          <h2>{step}</h2>
          <p>{copy[index]}</p>
        </div>
      ))}
    </div>
  );
}

const copy = [
  'The user speaks in plain language instead of filling out a prompt form.',
  'The system extracts occasion, urgency, formality, and weather concern.',
  'Ambient context sharpens the recommendation before clothing is selected.',
  'Unavailable items and excluded tags are removed before ranking.',
  'The answer uses real closet item IDs, not imaginary clothes.',
  'The user can accept, reject, or swap so the next answer improves.'
];
