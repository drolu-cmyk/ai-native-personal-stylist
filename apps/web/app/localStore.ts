export type LocalClosetItem = {
  id: `item_${string}`;
  userId: `user_${string}`;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'footwear' | 'accessory' | 'base-layer';
  primaryColor: `#${string}`;
  secondaryColors: `#${string}`[];
  fabric: {
    label: string;
    weight: 'ultralight' | 'light' | 'midweight' | 'heavy';
    breathability: 'low' | 'medium' | 'high';
    waterResistance: 'none' | 'light' | 'moderate' | 'high';
  };
  fit: {
    rating: 'too-small' | 'snug' | 'true-to-size' | 'relaxed' | 'oversized';
    confidence: number;
    notes?: string;
  };
  formality: 'casual' | 'smart-casual' | 'business' | 'formal';
  warmth: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  seasonality: Array<'spring' | 'summer' | 'fall' | 'winter' | 'all-season'>;
  occasionSupport: Array<'corporate' | 'formal' | 'casual' | 'religious-service' | 'travel' | 'date-night' | 'custom'>;
  lastWornAt?: string;
  available: boolean;
};

export type PreferenceSignals = {
  acceptedItemIds: string[];
  rejectedItemIds: string[];
  preferredTags: string[];
  avoidedTags: string[];
};

const CLOSET_KEY = 'ai-native-stylist.local-closet.v1';
const IMAGE_KEY = 'ai-native-stylist.local-images.v1';
const PREFERENCE_KEY = 'ai-native-stylist.preferences.v1';

function parseArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalClosetItems(): LocalClosetItem[] {
  if (typeof window === 'undefined') return [];
  return parseArray<LocalClosetItem>(window.localStorage.getItem(CLOSET_KEY));
}

export function saveLocalClosetItems(items: LocalClosetItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CLOSET_KEY, JSON.stringify(items));
}

export function getLocalImages(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(IMAGE_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveLocalImage(itemId: string, dataUrl: string) {
  if (typeof window === 'undefined') return;
  const images = getLocalImages();
  images[itemId] = dataUrl;
  window.localStorage.setItem(IMAGE_KEY, JSON.stringify(images));
}

export function getPreferenceSignals(): PreferenceSignals {
  if (typeof window === 'undefined') {
    return { acceptedItemIds: [], rejectedItemIds: [], preferredTags: [], avoidedTags: [] };
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) || '{}') as Partial<PreferenceSignals>;
    return {
      acceptedItemIds: parsed.acceptedItemIds || [],
      rejectedItemIds: parsed.rejectedItemIds || [],
      preferredTags: parsed.preferredTags || [],
      avoidedTags: parsed.avoidedTags || []
    };
  } catch {
    return { acceptedItemIds: [], rejectedItemIds: [], preferredTags: [], avoidedTags: [] };
  }
}

export function savePreferenceSignals(signals: PreferenceSignals) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(signals));
}

export function mergeUnique(values: string[], additions: string[]) {
  return [...new Set([...values, ...additions])];
}

export function removeValues(values: string[], removals: string[]) {
  const blocked = new Set(removals);
  return values.filter((value) => !blocked.has(value));
}
