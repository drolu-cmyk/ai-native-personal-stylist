'use client';

import { useMemo, useState } from 'react';
import type { ClothingItem, ClothingItemId, StyleRecommendationPayload } from '@stylist/shared';
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
  const [busyItemId, setBusyItemId] = useState<ClothingItemId | null>(null);
  const [recommendation, setRecommendation] = useState<StyleRecommendationPayload | null>(null);
  const [status, setStatus] = useState('Mock closet loaded locally.');

  const availableCount = useMemo(() => items.filter((item) => item.available).length, [items]);

  async function refreshCloset() {
    try {
      const closet = await fetchCloset(alphaUserId);
      setItems(closet.items);
      setStatus('Synced with API mock closet.');
    } catch {
      setStatus('API unavailable; showing local mock closet.');
    }
  }

  async function requestRecommendation() {
    try {
      const payload = await requestAutonomousRecommendation(alphaUserId);
      setRecommendation(payload);
      setStatus('Autonomous recommendation generated from active closet items.');
    } catch {
      setStatus('Start the API on port 4000 to verify live recommendation fallback behavior.');
    }
  }

  async function handleToggle(item: ClothingItem, available: boolean) {
    setBusyItemId(item.id);
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
      setBusyItemId(null);
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
        <button onClick={refreshCloset} type="button">Sync closet</button>
        <button onClick={requestRecommendation} type="button">Run proactive loop</button>
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
            isBusy={busyItemId === item.id}
            item={item}
            key={item.id}
            onToggle={handleToggle}
          />
        ))}
      </section>
    </main>
  );
}
