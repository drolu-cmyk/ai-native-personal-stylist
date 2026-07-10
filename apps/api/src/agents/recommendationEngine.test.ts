import assert from 'node:assert/strict';
import test from 'node:test';
import type { AmbientConditionTriggers, ClothingItem, DigitalCloset, PreferenceSignals } from '@stylist/shared';
import { mockCloset, mockUserProfile } from '../data/mockCloset.js';
import { rankOutfitCombinations } from './recommendationEngine.js';

const rainyDinner: AmbientConditionTriggers = {
  timeOfDay: 'evening',
  weather: { condition: 'rain', temperatureC: 16, precipitationChance: 0.75 },
  calendarEvent: {
    title: 'Dinner reservation',
    startsAt: '2026-07-10T23:30:00.000Z',
    formalityHint: 'business'
  },
  destination: { label: 'Downtown restaurant', expectedAesthetic: 'polished dinner' }
};

const airportDay: AmbientConditionTriggers = {
  timeOfDay: 'morning',
  weather: { condition: 'clear', temperatureC: 22, precipitationChance: 0.05 },
  calendarEvent: {
    title: 'Airport departure',
    startsAt: '2026-07-11T13:00:00.000Z',
    formalityHint: 'smart-casual'
  },
  destination: { label: 'Airport', expectedAesthetic: 'comfortable travel' }
};

function cloneCloset(): DigitalCloset {
  return structuredClone(mockCloset);
}

test('ranks a complete rainy-weather outfit from available closet items', () => {
  const ranked = rankOutfitCombinations(cloneCloset(), mockUserProfile, rainyDinner);
  assert.ok(ranked.length > 0);

  const primary = ranked[0];
  const categories = new Set(primary.items.map((item) => item.category));
  assert.ok(categories.has('top') || categories.has('dress'));
  assert.ok(categories.has('bottom') || categories.has('dress'));
  assert.ok(categories.has('footwear'));
  assert.ok(categories.has('outerwear'));
  assert.ok(primary.items.every((item) => item.available));
});

test('never returns an unavailable garment', () => {
  const closet = cloneCloset();
  closet.items = closet.items.map((item) =>
    item.id === 'item_white_oxford' ? { ...item, available: false } : item
  );

  const ranked = rankOutfitCombinations(closet, mockUserProfile, rainyDinner);
  assert.ok(ranked.length > 0);
  assert.ok(ranked.every((outfit) => outfit.items.every((item) => item.id !== 'item_white_oxford')));
});

test('preference signals can move an alternative item ahead of a rejected item', () => {
  const closet = cloneCloset();
  const alternativeFootwear: ClothingItem = {
    ...structuredClone(closet.items.find((item) => item.id === 'item_black_walking_loafers')!),
    id: 'item_local_navy_travel_sneakers',
    name: 'Navy travel sneakers',
    primaryColor: '#28384d',
    formality: 'smart-casual',
    tags: ['comfort', 'travel', 'walkable', 'breathable'],
    occasionSupport: ['casual', 'travel'],
    fit: { rating: 'true-to-size', confidence: 0.94 }
  };
  closet.items.push(alternativeFootwear);

  const signals: PreferenceSignals = {
    rejectedItemIds: ['item_black_walking_loafers'],
    acceptedItemIds: ['item_local_navy_travel_sneakers'],
    preferredTags: ['travel', 'comfort'],
    avoidedTags: []
  };

  const ranked = rankOutfitCombinations(closet, mockUserProfile, airportDay, signals);
  assert.ok(ranked.length > 0);
  const footwear = ranked[0].items.find((item) => item.category === 'footwear');
  assert.equal(footwear?.id, 'item_local_navy_travel_sneakers');
});

test('all ranked item IDs remain bound to the supplied closet', () => {
  const closet = cloneCloset();
  const validIds = new Set(closet.items.map((item) => item.id));
  const ranked = rankOutfitCombinations(closet, mockUserProfile, rainyDinner);

  for (const outfit of ranked.slice(0, 10)) {
    assert.ok(outfit.items.every((item) => validIds.has(item.id)));
  }
});
