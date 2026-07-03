export function AgentFlowDiagram() {
  return (
    <div className="flow" aria-label="Outfit steps">
      <div className="flow-step"><span className="kicker">01</span><h2>Plan</h2><p>The user says where they are going.</p></div>
      <div className="flow-step"><span className="kicker">02</span><h2>Closet</h2><p>The app checks saved clothes.</p></div>
      <div className="flow-step"><span className="kicker">03</span><h2>Outfit</h2><p>The result uses saved items only.</p></div>
    </div>
  );
}
