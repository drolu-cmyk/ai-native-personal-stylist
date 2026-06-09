import type { ClothingItem, DigitalCloset, StyleRecommendationPayload, UserId } from '@stylist/shared';

export const alphaUserId = 'user_alpha' satisfies UserId;

export const initialClosetItems: ClothingItem[] = [
  {
    id: 'item_navy_merino_tee',
    userId: alphaUserId,
    name: 'Navy merino crew tee',
    category: 'top',
    primaryColor: '#1f3a5f',
    secondaryColors: [],
    fabric: { label: 'merino wool', weight: 'light', breathability: 'high', waterResistance: 'light' },
    fit: { rating: 'true-to-size', confidence: 0.95 },
    formality: 'smart-casual',
    warmth: 2,
    tags: ['summer', 'travel', 'layering', 'voice-fast'],
    seasonality: ['spring', 'summer', 'fall'],
    occasionSupport: ['casual', 'travel'],
    imageReference: { referenceId: 'imgref_navy_merino_tee', altText: 'Navy merino crew tee', source: 'mock' },
    available: true
  },
  {
    id: 'item_charcoal_trouser',
    userId: alphaUserId,
    name: 'Charcoal tapered trouser',
    category: 'bottom',
    primaryColor: '#34383f',
    secondaryColors: ['#23262b'],
    fabric: { label: 'stretch wool blend', weight: 'midweight', breathability: 'medium', waterResistance: 'light' },
    fit: { rating: 'true-to-size', confidence: 0.9 },
    formality: 'business',
    warmth: 3,
    tags: ['formal', 'dinner', 'office', 'rainy-day'],
    seasonality: ['fall', 'winter', 'spring'],
    occasionSupport: ['corporate', 'formal', 'date-night', 'religious-service'],
    imageReference: { referenceId: 'imgref_charcoal_trouser', altText: 'Charcoal tapered trouser', source: 'mock' },
    available: true
  },
  {
    id: 'item_olive_rain_shell',
    userId: alphaUserId,
    name: 'Olive packable rain shell',
    category: 'outerwear',
    primaryColor: '#566b48',
    secondaryColors: ['#2f3a2a'],
    fabric: { label: 'recycled nylon', weight: 'light', breathability: 'medium', waterResistance: 'high' },
    fit: { rating: 'relaxed', confidence: 0.88 },
    formality: 'casual',
    warmth: 2,
    tags: ['rainy-day', 'travel', 'commute', 'layering'],
    seasonality: ['spring', 'fall', 'winter'],
    occasionSupport: ['casual', 'travel'],
    imageReference: { referenceId: 'imgref_olive_rain_shell', altText: 'Olive packable rain shell', source: 'mock' },
    available: true
  },
  {
    id: 'item_black_walking_loafers',
    userId: alphaUserId,
    name: 'Black cushioned walking loafers',
    category: 'footwear',
    primaryColor: '#111111',
    secondaryColors: [],
    fabric: { label: 'leather', weight: 'midweight', breathability: 'medium', waterResistance: 'moderate' },
    fit: { rating: 'true-to-size', confidence: 0.97 },
    formality: 'business',
    warmth: 2,
    tags: ['formal', 'comfort', 'rainy-day', 'commute'],
    seasonality: ['all-season'],
    occasionSupport: ['corporate', 'formal', 'religious-service', 'travel'],
    imageReference: { referenceId: 'imgref_black_walking_loafers', altText: 'Black cushioned walking loafers', source: 'mock' },
    available: true
  }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function fetchCloset(userId: UserId): Promise<DigitalCloset> {
  const response = await fetch(`${apiBaseUrl}/api/closet?userId=${encodeURIComponent(userId)}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch closet: ${response.status}`);
  }

  return response.json() as Promise<DigitalCloset>;
}

export async function toggleClosetAvailability(userId: UserId, itemId: ClothingItem['id'], available: boolean) {
  const response = await fetch(`${apiBaseUrl}/api/closet/toggle-availability`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId, itemId, available })
  });

  if (!response.ok) {
    throw new Error(`Unable to toggle closet item: ${response.status}`);
  }

  return response.json() as Promise<{ item: ClothingItem; closet: DigitalCloset }>;
}

export async function requestAutonomousRecommendation(userId: UserId): Promise<StyleRecommendationPayload> {
  const response = await fetch(`${apiBaseUrl}/api/autonomous-recommend`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error(`Unable to run proactive recommendation: ${response.status}`);
  }

  return response.json() as Promise<StyleRecommendationPayload>;
}
