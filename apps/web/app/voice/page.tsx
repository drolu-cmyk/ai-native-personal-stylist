'use client';

import { useMemo, useState } from 'react';

type OutfitSlot = { slot: string; itemId: string; reasonCode: string; confidence: number };
type Recommendation = {
  recommendationId: string;
  outfit: OutfitSlot[];
  fallbackAlternatives: OutfitSlot[];
  cautions: string[];
  ttsSummary: string;
};

type ClosetItem = { id: string; name: string };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const userId = 'user_alpha';

export default function VoicePage() {
  const [requestText, setRequestText] = useState('I need dinner clothes and it might rain.');
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const itemNames = useMemo(() => new Map(closetItems.map((item) => [item.id, item.name])), [closetItems]);

  async function loadCloset() {
    const response = await fetch(`${apiBaseUrl}/api/closet?userId=${userId}`);
    if (!response.ok) throw new Error('Closet could not be loaded.');
    const payload = await response.json();
    setClosetItems(payload.closet.items);
  }

  async function getRecommendation() {
    setIsLoading(true);
    setMessage('');
    try {
      await loadCloset();
      const response = await fetch(`${apiBaseUrl}/api/voice-recommend`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId,
          transcript: requestText,
          capturedAt: new Date().toISOString(),
          locale: 'en-US',
          urgency: 'immediate',
          latencyBudgetMs: 4000,
          ambient: {
            timeOfDay: 'evening',
            weather: { condition: 'rain', temperatureC: 16, precipitationChance: 0.7 },
            calendarEvent: {
              title: 'Dinner reservation',
              startsAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
              formalityHint: 'business'
            }
          }
        })
      });
      if (!response.ok) throw new Error('No outfit came back.');
      setRecommendation(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  async function sendFeedback(accepted: boolean) {
    if (!recommendation) return;
    const response = await fetch(`${apiBaseUrl}/api/recommendation-feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recommendationId: recommendation.recommendationId, userId, accepted, reason: accepted ? 'accepted' : 'swap' })
    });
    setMessage(response.ok ? (accepted ? 'Saved.' : 'Noted. Try another mix next.') : 'Could not save that response.');
  }

  return (
    <main className="site-shell">
      <section className="voice-layout">
        <div className="panel">
          <p className="eyebrow">What should I wear?</p>
          <h1>Say the plan. See the outfit.</h1>
          <p className="lede">The answer uses clothes from the closet only.</p>
          <label className="field-label" htmlFor="requestText">Your request</label>
          <textarea id="requestText" value={requestText} onChange={(event) => setRequestText(event.target.value)} rows={4} />
          <button className="button" type="button" onClick={getRecommendation} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Find an outfit'}
          </button>
          {message ? <p className="status-text">{message}</p> : null}
        </div>

        <div className="panel result-panel">
          <p className="eyebrow">Outfit</p>
          {recommendation ? (
            <>
              <h2>{recommendation.ttsSummary}</h2>
              <div className="slot-list">
                {recommendation.outfit.map((slot) => (
                  <div className="slot-card" key={`${slot.slot}-${slot.itemId}`}>
                    <span>{slot.slot}</span>
                    <strong>{itemNames.get(slot.itemId) || slot.itemId}</strong>
                    <p>{slot.reasonCode.replace('-', ' ')}</p>
                  </div>
                ))}
              </div>
              {recommendation.cautions.length ? <p className="status-text">{recommendation.cautions[0]}</p> : null}
              <div className="actions">
                <button className="button" type="button" onClick={() => sendFeedback(true)}>This works</button>
                <button className="button secondary" type="button" onClick={() => sendFeedback(false)}>Try another mix</button>
              </div>
            </>
          ) : (
            <p className="lede">Your outfit will appear here.</p>
          )}
        </div>
      </section>
    </main>
  );
}
