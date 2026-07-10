'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type OutfitSlot = { slot: string; itemId: string; reasonCode: string; confidence: number };
type Recommendation = {
  recommendationId: string;
  outfit: OutfitSlot[];
  fallbackAlternatives: OutfitSlot[];
  cautions: string[];
  ttsSummary: string;
  confidence: number;
};

type ClosetItem = { id: string; name: string; primaryColor?: string };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const userId = 'user_alpha';

const quickRequests = [
  'I have dinner in 20 minutes and it might rain.',
  'I need something sharp but comfortable for a work presentation.',
  'Choose a simple outfit for church this morning.',
  'I am flying today and need something comfortable for the airport.'
];

function humanize(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function VoicePage() {
  const [requestText, setRequestText] = useState(quickRequests[0]);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const itemLookup = useMemo(
    () => new Map(closetItems.map((item) => [item.id, item])),
    [closetItems]
  );

  async function loadCloset() {
    const response = await fetch(`${apiBaseUrl}/api/closet?userId=${userId}`);
    if (!response.ok) throw new Error('Your closet could not be loaded.');
    const payload = await response.json();
    setClosetItems(payload.closet.items);
  }

  function contextFromRequest() {
    const request = requestText.toLowerCase();
    const isRainy = request.includes('rain');
    const isWork = request.includes('work') || request.includes('presentation') || request.includes('office');
    const isChurch = request.includes('church') || request.includes('service');
    const isTravel = request.includes('airport') || request.includes('flight') || request.includes('travel');

    const eventTitle = isWork
      ? 'Work presentation'
      : isChurch
        ? 'Church service'
        : isTravel
          ? 'Airport departure'
          : 'Dinner reservation';

    return {
      timeOfDay: isChurch ? 'morning' : 'evening',
      weather: {
        condition: isRainy ? 'rain' : 'clear',
        temperatureC: isRainy ? 16 : 22,
        precipitationChance: isRainy ? 0.7 : 0.1
      },
      calendarEvent: {
        title: eventTitle,
        startsAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        formalityHint: isTravel ? 'smart-casual' : 'business'
      },
      destination: {
        label: eventTitle,
        etaMinutes: 20,
        expectedAesthetic: isTravel ? 'airport travel' : eventTitle.toLowerCase()
      }
    };
  }

  async function getRecommendation() {
    if (!requestText.trim()) {
      setMessage('Tell the stylist where you are going or what the day requires.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setShowAlternatives(false);

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
          ambient: contextFromRequest()
        })
      });

      if (!response.ok) throw new Error('The stylist could not build an outfit.');
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
      body: JSON.stringify({
        recommendationId: recommendation.recommendationId,
        userId,
        accepted,
        reason: accepted ? 'accepted' : 'swap'
      })
    });

    if (!response.ok) {
      setMessage('Your response could not be saved.');
      return;
    }

    setShowAlternatives(!accepted);
    setMessage(accepted ? 'Outfit accepted. This preference can shape future recommendations.' : 'Here are the closest swap options from your closet.');
  }

  return (
    <main className="site-shell stylist-page">
      <section className="stylist-intro">
        <div>
          <p className="eyebrow">Dress me</p>
          <h1>What does the day require?</h1>
          <p className="lede">Describe the plan in your own words. The answer stays inside your saved closet.</p>
        </div>
        <Link className="text-link" href="/closet">Review available clothes <span aria-hidden="true">→</span></Link>
      </section>

      <section className="stylist-workspace">
        <div className="request-panel">
          <label className="field-label" htmlFor="requestText">Tell your stylist</label>
          <textarea
            id="requestText"
            value={requestText}
            onChange={(event) => setRequestText(event.target.value)}
            rows={5}
            placeholder="Dinner in an hour, business casual, and I will be walking..."
          />
          <div className="quick-prompts" aria-label="Example requests">
            {quickRequests.map((request) => (
              <button type="button" onClick={() => setRequestText(request)} key={request}>{request}</button>
            ))}
          </div>
          <button className="button wide-button" type="button" onClick={getRecommendation} disabled={isLoading}>
            {isLoading ? 'Checking your closet...' : 'Build my outfit'}
          </button>
          <p className="privacy-note">The current prototype sends text and structured context. It does not store a voice recording.</p>
          {message ? <p className="status-text" role="status">{message}</p> : null}
        </div>

        <div className="recommendation-panel" aria-live="polite">
          <div className="recommendation-header">
            <div>
              <p className="card-label">Stylist decision</p>
              <h2>{recommendation ? 'Wear this.' : 'Your outfit will appear here.'}</h2>
            </div>
            {recommendation ? <span className="confidence-pill">{Math.round(recommendation.confidence * 100)}% fit</span> : null}
          </div>

          {recommendation ? (
            <>
              <p className="recommendation-summary">{recommendation.ttsSummary}</p>
              <div className="outfit-list">
                {recommendation.outfit.map((slot) => {
                  const item = itemLookup.get(slot.itemId);
                  return (
                    <article className="outfit-row" key={`${slot.slot}-${slot.itemId}`}>
                      <span className="item-swatch" style={{ background: item?.primaryColor || '#d9d5ce' }} aria-hidden="true" />
                      <div>
                        <span className="slot-label">{humanize(slot.slot)}</span>
                        <strong>{item?.name || slot.itemId}</strong>
                        <p>{humanize(slot.reasonCode)}</p>
                      </div>
                      <span className="row-confidence">{Math.round(slot.confidence * 100)}%</span>
                    </article>
                  );
                })}
              </div>

              {recommendation.cautions.length ? <p className="caution-note">{recommendation.cautions[0]}</p> : null}

              <div className="actions">
                <button className="button" type="button" onClick={() => sendFeedback(true)}>I’ll wear this</button>
                <button className="button secondary" type="button" onClick={() => sendFeedback(false)}>Show swap options</button>
              </div>

              {showAlternatives && recommendation.fallbackAlternatives.length ? (
                <div className="alternatives-panel">
                  <p className="card-label">Closest alternatives</p>
                  {recommendation.fallbackAlternatives.map((slot) => {
                    const item = itemLookup.get(slot.itemId);
                    return (
                      <div className="alternative-row" key={`${slot.slot}-${slot.itemId}`}>
                        <span className="item-swatch small-swatch" style={{ background: item?.primaryColor || '#d9d5ce' }} aria-hidden="true" />
                        <span><strong>{item?.name || slot.itemId}</strong><small>{humanize(slot.slot)}</small></span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-decision">
              <div className="empty-outfit" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>One outfit. A short reason. A useful alternative only when you need it.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
