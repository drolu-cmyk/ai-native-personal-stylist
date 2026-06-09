import type { ClothingItem, DigitalCloset, UserId, UserProfile } from '@stylist/shared';

const userId = 'user_alpha' satisfies UserId;

export const mockUserProfile: UserProfile = {
  id: userId,
  displayName: 'Alpha User',
  sizing: {
    heightCm: 178,
    topSize: 'M',
    bottomSize: '32',
    shoeSize: '10'
  },
  fit: {
    shoulderFit: 'true-to-size',
    waistFit: 'true-to-size',
    lengthPreference: 'standard',
    footwearComfortPriority: 'high',
    mobilityNeeds: ['walkable commute']
  },
  constraints: {
    colorMismatchesToAvoid: ['#ff0000'],
    preferredAesthetics: ['minimal', 'sharp casual', 'weather-ready'],
    culturalFashionPreferences: ['polished without overstatement'],
    excludedTags: ['dry-clean-only']
  },
  location: {
    city: 'New York',
    region: 'NY',
    country: 'US',
    timezone: 'America/New_York'
  },
  privacyConsent: {
    profileDataConsent: true,
    closetInventoryConsent: true,
    voiceTranscriptConsent: true,
    locationContextConsent: true,
    imageReferenceConsent: false,
    consentedAt: '2026-06-08T12:00:00.000Z'
  },
  updatedAt: '2026-06-08T12:00:00.000Z'
};

export const mockCloset: DigitalCloset = {
  userId,
  updatedAt: '2026-06-08T12:00:00.000Z',
  items: [
    {
      id: 'item_navy_merino_tee',
      userId,
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
      userId,
      name: 'Charcoal tapered trouser',
      category: 'bottom',
      primaryColor: '#34383f',
      secondaryColors: ['#23262b'],
      fabric: { label: 'stretch wool blend', weight: 'midweight', breathability: 'medium', waterResistance: 'light' },
      fit: { rating: 'true-to-size', confidence: 0.9, notes: 'Best fit for smart casual and dinner contexts.' },
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
      userId,
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
      id: 'item_white_oxford',
      userId,
      name: 'White oxford shirt',
      category: 'top',
      primaryColor: '#f7f4ee',
      secondaryColors: [],
      fabric: { label: 'cotton oxford', weight: 'midweight', breathability: 'medium', waterResistance: 'none' },
      fit: { rating: 'true-to-size', confidence: 0.92 },
      formality: 'business',
      warmth: 2,
      tags: ['formal', 'office', 'dinner', 'classic'],
      seasonality: ['all-season'],
      occasionSupport: ['corporate', 'formal', 'religious-service'],
      imageReference: { referenceId: 'imgref_white_oxford', altText: 'White oxford shirt', source: 'mock' },
      available: true
    },
    {
      id: 'item_black_walking_loafers',
      userId,
      name: 'Black cushioned walking loafers',
      category: 'footwear',
      primaryColor: '#111111',
      secondaryColors: [],
      fabric: { label: 'leather', weight: 'midweight', breathability: 'medium', waterResistance: 'moderate' },
      fit: { rating: 'true-to-size', confidence: 0.97, notes: 'Comfortable for long walks and quick transit changes.' },
      formality: 'business',
      warmth: 2,
      tags: ['formal', 'comfort', 'rainy-day', 'commute'],
      seasonality: ['all-season'],
      occasionSupport: ['corporate', 'formal', 'religious-service', 'travel'],
      imageReference: { referenceId: 'imgref_black_walking_loafers', altText: 'Black cushioned walking loafers', source: 'mock' },
      available: true
    },
    {
      id: 'item_silver_watch',
      userId,
      name: 'Silver low-profile watch',
      category: 'accessory',
      primaryColor: '#c0c4c8',
      secondaryColors: ['#111111'],
      fabric: { label: 'stainless steel', weight: 'heavy', breathability: 'low', waterResistance: 'high' },
      fit: { rating: 'true-to-size', confidence: 0.99 },
      formality: 'formal',
      warmth: 1,
      tags: ['formal', 'minimal', 'dinner'],
      seasonality: ['all-season'],
      occasionSupport: ['corporate', 'formal', 'religious-service', 'date-night'],
      imageReference: { referenceId: 'imgref_silver_watch', altText: 'Silver low-profile watch', source: 'mock' },
      available: true
    },
    {
      id: 'item_linen_sand_chinos',
      userId,
      name: 'Lightweight linen chinos',
      category: 'bottom',
      primaryColor: '#c8b89a',
      secondaryColors: ['#efe6d2'],
      fabric: { label: 'linen cotton blend', weight: 'light', breathability: 'high', waterResistance: 'none' },
      fit: { rating: 'relaxed', confidence: 0.86, notes: 'Best for hot casual or travel days.' },
      formality: 'smart-casual',
      warmth: 1,
      tags: ['summer', 'casual', 'travel', 'breathable'],
      seasonality: ['summer', 'spring'],
      occasionSupport: ['casual', 'travel'],
      imageReference: { referenceId: 'imgref_linen_sand_chinos', altText: 'Lightweight linen chinos', source: 'mock' },
      available: true
    },
    {
      id: 'item_black_wool_blazer',
      userId,
      name: 'Black wool blazer',
      category: 'outerwear',
      primaryColor: '#161616',
      secondaryColors: ['#2b2b2b'],
      fabric: { label: 'wool', weight: 'midweight', breathability: 'medium', waterResistance: 'light' },
      fit: { rating: 'true-to-size', confidence: 0.91 },
      formality: 'formal',
      warmth: 3,
      tags: ['corporate', 'formal', 'religious-service', 'presentation'],
      seasonality: ['fall', 'winter', 'spring'],
      occasionSupport: ['corporate', 'formal', 'religious-service'],
      imageReference: { referenceId: 'imgref_black_wool_blazer', altText: 'Black wool blazer', source: 'mock' },
      available: true
    }
  ] satisfies ClothingItem[]
};

export async function getUserProfile(requestedUserId: UserId): Promise<UserProfile | null> {
  return requestedUserId === mockUserProfile.id ? mockUserProfile : null;
}

export async function getDigitalCloset(requestedUserId: UserId): Promise<DigitalCloset | null> {
  return requestedUserId === mockCloset.userId ? mockCloset : null;
}

export async function getActiveClosetItems(requestedUserId: UserId): Promise<ClothingItem[]> {
  const closet = await getDigitalCloset(requestedUserId);
  return closet?.items.filter((item) => item.available) ?? [];
}

export async function setClothingItemAvailability(
  requestedUserId: UserId,
  itemId: ClothingItem['id'],
  available: boolean
): Promise<ClothingItem | null> {
  const closet = await getDigitalCloset(requestedUserId);
  const item = closet?.items.find((closetItem) => closetItem.id === itemId);

  if (!item) return null;

  item.available = available;
  mockCloset.updatedAt = new Date().toISOString();
  return item;
}
