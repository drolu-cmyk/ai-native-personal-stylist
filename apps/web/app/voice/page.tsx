'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  getLocalClosetItems,
  getPreferenceSignals,
  mergeUnique,
  removeValues,
  savePreferenceSignals,
  type LocalClosetItem,
  type PreferenceSignals
} from '../localStore';

type OutfitSlot = { slot: string; itemId: string; reasonCode: string; confidence: number };
type Recommendation = {
  recommendationId: string;
  outfit: OutfitSlot[];
  fallbackAlternatives: OutfitSlot[];
  alternativeOutfits?: OutfitSlot[][];
  cautions: string[];
  ttsSummary: string;
  confidence: number;
  learningSummary?: string[];
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const userId = 'user_alpha' as const;

const quickRequests = [
  'I have dinner in 20 minutes and it might rain.',
  'I need something sharp but comfortable for a work presentation.',
  'Choose a simple outfit for church this morning.',
  'I am flying today and need something comfortable for the airport.'
];

function humanize(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function mergeClosets(baseItems: LocalClosetItem[], localItems: LocalClosetItem[]) {
  const localById = new Map(localItems.map((item) => [item.id, item]));
  const mergedBase = baseItems.map((item) => localById.get(item.id) || item);
  const baseIds = new Set(baseItems.map((item) => item.id));
  return [...mergedBase, ...localItems.filter((item) => !baseIds.has(item.id))];
}

export default function VoicePage() {
  const [requestText, setRequestText] = useState(quickRequests[0]);
  const [closetItems, setClosetItems] = useState<LocalClosetItem[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const itemLookup = useMemo(
    () => new Map(closetItems.map((item) => [item.id, item])),
    [closetItems]
  );

  async function loadCloset(): Promise<LocalClosetItem[]> {
    const response = await fetch(`${apiBaseUrl}/api/closet?userId=${userId}`);
    if (!response.ok) throw new Error('Your closet could not be loaded.');
    const payload = await response.json();
    const merged = mergeClosets(payload.closet.items, getLocalClosetItems());
    setClosetItems(merged);
    return merged;
  }

  function contextFromRequest() {
    const request = requestText.toLowerCase();
    const isRainy = request.includes('rain') || request.includes('storm');
    const isSnowy = request.includes('snow');
    const isCold = request.includes('cold') || request.includes('winter');
    const isHot = request.includes('hot') || request.includes('summer');
    const isWork = request.includes('work') || request.includes('presentation') || request.includes('office') || request.includes('meeting');
    const isChurch = request.includes('church') || request.includes('service');
    const isTravel = request.includes('airport') || request.includes('flight') || request.includes('travel');
    const isFormal = request.includes('formal') || request.includes('wedding') || request.includes('gala');

    const eventTitle = isWork
      ? 'Work presentation'
      : isChurch
        ? 'Church service'
        : isTravel
          ? 'Airport departure'
          : isFormal
            ? 'Formal event'
            : 'Dinner reservation';

    const formalityHint = isFormal ? 'formal' : isTravel ? 'smart-casual' : 'business';
    const condition = isSnowy ? 'snow' : isRainy ? 'rain' : isHot ? 'hot' : isCold ? 'cold' : 'clear';

    return {
      timeOfDay: isChurch ? 'morning' : 'evening',
      weather: {
        condition,
        temperatureC: isSnowy || isCold ? 4 : isHot ? 29 : isRainy ? 16 : 22,
        precipitationChance: isRainy || isSnowy ? 0.72 : 0.1
      },
      calendarEvent: {
        title: eventTitle,
        startsAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        formalityHint
      },
      destination: {
        label: eventTitle,
        etaMinutes: 20,
        expectedAesthetic: isTravel ? 'airport travel' : eventTitle.toLowerCase()
      }
    };
  }

  function startListening() {
    if (typeof window === 'undefined') return;
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setMessage('Voice capture is not available in this browser. You can still type the request.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setRequestText(transcript);
    };
    recognition.onerror = () => setMessage('Voice capture stopped before a clear request was received.');
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    setMessage('Listening. Describe where you are going and what matters.');
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function speakRecommendation() {
    if (!recommendation || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(recommendation.ttsSummary);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
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
      const mergedCloset = await loadCloset();
      const preferenceSignals = getPreferenceSignals();
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
          ambient: contextFromRequest(),
          preferenceSignals,
          closetSnapshot: {
            userId,
            items: mergedCloset,
            updatedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || 'The stylist could not build an outfit.');
      }
      setRecommendation(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateLearning(accepted: boolean, itemIds: string[]): PreferenceSignals {
    const current = getPreferenceSignals();
    const selectedTags = itemIds.flatMap((itemId) => itemLookup.get(itemId)?.tags || []);
    const next = accepted
      ? {
          ...current,
          acceptedItemIds: mergeUnique(current.acceptedItemIds, itemIds),
          rejectedItemIds: removeValues(current.rejectedItemIds, itemIds),
          preferredTags: mergeUnique(current.preferredTags, selectedTags.slice(0, 8))
        }
      : {
          ...current,
          rejectedItemIds: mergeUnique(current.rejectedItemIds, itemIds),
          acceptedItemIds: removeValues(current.acceptedItemIds, itemIds)
        };
    savePreferenceSignals(next);
    return next;
  }

  async function sendFeedback(accepted: boolean) {
    if (!recommendation) return;
    const itemIds = recommendation.outfit.map((slot) => slot.itemId);
    updateLearning(accepted, itemIds);

    const response = await fetch(`${apiBaseUrl}/api/recommendation-feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recommendationId: recommendation.recommendationId,
        userId,
        accepted,
        reason: accepted ? 'accepted' : 'swap',
        itemIds
      })
    });

    if (!response.ok) {
      setMessage('Your local preference was saved, but the API could not acknowledge it.');
      return;
    }

    setShowAlternatives(!accepted);
    setMessage(accepted
      ? 'Outfit accepted. Its pieces and useful attributes will influence the next recommendation.'
      : 'This mix was deprioritized. Choose an alternative or ask for a new decision.');
  }

  function useAlternative(slots: OutfitSlot[]) {
    if (!recommendation) return;
    const summary = `Wear ${slots.map((slot) => itemLookup.get(slot.itemId)?.name || slot.itemId).join(', ')}.`;
    setRecommendation({ ...recommendation, outfit: slots, ttsSummary: summary });
    setShowAlternatives(false);
    setMessage('Alternative selected. Confirm it if this is the outfit you will wear.');
  }

  const alternatives = recommendation?.alternativeOutfits?.length
    ? recommendation.alternativeOutfits
    : recommendation?.fallbackAlternatives?.length
      ? [recommendation.fallbackAlternatives]
      : [];

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
          <div className="voice-controls">
            <button className="voice-button" type="button" onClick={isListening ? stopListening : startListening}>
              <span className={isListening ? 'voice-dot listening' : 'voice-dot'} aria-hidden="true" />
              {isListening ? 'Stop listening' : 'Speak the plan'}
            </button>
            <span>Voice is transcribed by the browser and is not stored as an audio file.</span>
          </div>
          <div className="quick-prompts" aria-label="Example requests">
            {quickRequests.map((request) => (
              <button type="button" onClick={() => setRequestText(request)} key={request}>{request}</button>
            ))}
          </div>
          <button className="button wide-button" type="button" onClick={getRecommendation} disabled={isLoading}>
            {isLoading ? 'Comparing complete outfits...' : 'Build my outfit'}
          </button>
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
              <div className="summary-row">
                <p className="recommendation-summary">{recommendation.ttsSummary}</p>
                <button className="listen-button" type="button" onClick={speakRecommendation}>Hear it</button>
              </div>
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

              {recommendation.cautions.map((caution) => <p className="caution-note" key={caution}>{caution}</p>)}
              {recommendation.learningSummary?.length ? (
                <div className="learning-note">
                  <strong>What influenced this</strong>
                  {recommendation.learningSummary.map((signal) => <span key={signal}>{signal}</span>)}
                </div>
              ) : null}

              <div className="actions">
                <button className="button" type="button" onClick={() => sendFeedback(true)}>I’ll wear this</button>
                <button className="button secondary" type="button" onClick={() => sendFeedback(false)}>Not this mix</button>
              </div>

              {showAlternatives && alternatives.length ? (
                <div className="alternatives-panel">
                  <p className="card-label">Complete alternatives</p>
                  {alternatives.map((alternative, index) => (
                    <article className="alternative-outfit" key={`alternative-${index}`}>
                      <div>
                        {alternative.map((slot) => {
                          const item = itemLookup.get(slot.itemId);
                          return (
                            <div className="alternative-row" key={`${index}-${slot.slot}-${slot.itemId}`}>
                              <span className="item-swatch small-swatch" style={{ background: item?.primaryColor || '#d9d5ce' }} aria-hidden="true" />
                              <span><strong>{item?.name || slot.itemId}</strong><small>{humanize(slot.slot)}</small></span>
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => useAlternative(alternative)}>Use this mix</button>
                    </article>
                  ))}
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
              <p>One complete outfit, ranked for context, fit, color, comfort, availability, and what the stylist has learned.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
