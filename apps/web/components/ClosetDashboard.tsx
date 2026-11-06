'use client';

import { useMemo, useRef, useState } from 'react';
import type { ClothingItem, StyleRecommendationPayload } from '@stylist/shared';
import { ClosetItemCard } from './ClosetItemCard';
import {
  alphaUserId,
  fetchCloset,
  initialClosetItems,
  requestAutonomousRecommendation,
  toggleClosetAvailability
} from '../lib/closetClient';

interface ClosetDashboardProps {
  initialItems?: ClothingItem[];
}

export function ClosetDashboard({ initialItems = initialClosetItems }: ClosetDashboardProps) {
  const [items, setItems] = useState<ClothingItem[]>(initialItems);
  const [isBusy, setIsBusy] = useState(false);
  const actionInFlight = useRef(false);
  const [recommendation, setRecommendation] = useState<StyleRecommendationPayload | null>(null);
  const [status, setStatus] = useState('Mock closet loaded locally.');

  const availableCount = useMemo(() => items.filter((item) => item.available).length, [items]);

  async function refreshCloset() {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setIsBusy(true);
    try {
      const closet = await fetchCloset(alphaUserId);
      setItems(closet.items);
      setStatus('Synced with API mock closet.');
    } catch {
      setStatus('API unavailable; showing local mock closet.');
    } finally {
      actionInFlight.current = false;
      setIsBusy(false);
    }
  }

  async function requestRecommendation() {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setIsBusy(true);
    try {
      const payload = await requestAutonomousRecommendation(alphaUserId);
      setRecommendation(payload);
      setStatus('Autonomous recommendation generated from active closet items.');
    } catch {
      setStatus('Start the API on port 4000 to verify live recommendation fallback behavior.');
    } finally {
      actionInFlight.current = false;
      setIsBusy(false);
    }
  }

  async function handleToggle(item: ClothingItem, available: boolean) {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setIsBusy(true);
    setItems((currentItems) =>
      currentItems.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, available } : currentItem))
    );

    try {
      const result = await toggleClosetAvailability(alphaUserId, item.id, available);
      setItems(result.closet.items);
      setStatus(`${item.name} marked ${available ? 'available' : 'unavailable'} for recommendations.`);
    } catch {
      setStatus('API unavailable; local UI state updated for demo only.');
    } finally {
      actionInFlight.current = false;
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="closet-header">
        <div>
          <p className="eyebrow">Private Digital Closet</p>
          <h1>Inventory control for recommendation truth.</h1>
          <p>
            Toggle availability to prove the agent is constrained by owned, active clothing item IDs instead of generic style text.
          </p>
        </div>
        <div className="closet-summary" aria-label="Closet summary">
          <strong>{availableCount}</strong>
          <span>available items</span>
        </div>
      </section>

      <section className="toolbar" aria-label="Closet actions">
        <button disabled={isBusy} onClick={refreshCloset} type="button">Sync closet</button>
        <button disabled={isBusy} onClick={requestRecommendation} type="button">Run proactive loop</button>
        <span>{status}</span>
      </section>

      {recommendation ? (
        <section className="recommendation-panel" aria-label="Latest autonomous recommendation">
          <h2>Latest proactive recommendation</h2>
          <p>{recommendation.ttsSummary}</p>
          <div className="tag-row">
            {recommendation.outfit.map((slot) => (
              <span className="tag" key={`${slot.slot}-${slot.itemId}`}>{slot.slot}: {slot.itemId}</span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="closet-grid" aria-label="Wardrobe inventory">
        {items.map((item) => (
          <ClosetItemCard
            isBusy={isBusy}
            item={item}
            key={item.id}
            onToggle={handleToggle}
          />
        ))}
      </section>
    </main>
  );
}
