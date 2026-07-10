export type ISODateTime = string;
export type HexColor = `#${string}`;
export type UserId = `user_${string}`;
export type ClothingItemId = `item_${string}`;

export type ClothingCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'footwear'
  | 'accessory'
  | 'base-layer';

export type FabricWeight = 'ultralight' | 'light' | 'midweight' | 'heavy';
export type FitRating = 'too-small' | 'snug' | 'true-to-size' | 'relaxed' | 'oversized';
export type Formality = 'casual' | 'smart-casual' | 'business' | 'formal';
export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'wind' | 'humid' | 'hot' | 'cold';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
export type StylingOccasion =
  | 'corporate'
  | 'formal'
  | 'casual'
  | 'religious-service'
  | 'travel'
  | 'date-night'
  | 'custom';
export type ProviderMode = 'mock' | 'internal-ranker' | 'openai' | 'google' | 'aws';

export interface LocationMetadata {
  city?: string;
  region?: string;
  country?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface SizingProfile {
  heightCm?: number;
  weightKg?: number;
  topSize?: string;
  bottomSize?: string;
  dressSize?: string;
  shoeSize?: string;
  preferredInseamCm?: number;
}

export interface FitProfile {
  shoulderFit?: FitRating;
  waistFit?: FitRating;
  lengthPreference?: 'cropped' | 'standard' | 'longline';
  footwearComfortPriority: 'low' | 'medium' | 'high';
  mobilityNeeds?: string[];
}

export interface StyleConstraints {
  colorMismatchesToAvoid: HexColor[];
  preferredAesthetics: string[];
  culturalFashionPreferences: string[];
  modestyPreferences?: string[];
  excludedTags: string[];
  requiredTags?: string[];
}

export interface PrivacyConsentMetadata {
  profileDataConsent: boolean;
  closetInventoryConsent: boolean;
  voiceTranscriptConsent: boolean;
  locationContextConsent: boolean;
  imageReferenceConsent: boolean;
  consentedAt?: ISODateTime;
  revokedAt?: ISODateTime;
}

export interface UserProfile {
  id: UserId;
  displayName: string;
  sizing: SizingProfile;
  fit: FitProfile;
  constraints: StyleConstraints;
  location: LocationMetadata;
  privacyConsent: PrivacyConsentMetadata;
  updatedAt: ISODateTime;
}

export interface ClothingImageReference {
  referenceId: `imgref_${string}`;
  altText: string;
  source: 'user-confirmed-reference' | 'catalog-placeholder' | 'mock';
}

export interface ClothingItem {
  id: ClothingItemId;
  userId: UserId;
  name: string;
  category: ClothingCategory;
  primaryColor: HexColor;
  secondaryColors: HexColor[];
  fabric: {
    label: string;
    weight: FabricWeight;
    breathability: 'low' | 'medium' | 'high';
    waterResistance: 'none' | 'light' | 'moderate' | 'high';
  };
  fit: {
    rating: FitRating;
    confidence: number;
    notes?: string;
  };
  formality: Formality;
  warmth: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  seasonality: Season[];
  occasionSupport: StylingOccasion[];
  imageReference?: ClothingImageReference;
  lastWornAt?: ISODateTime;
  available: boolean;
}

export interface DigitalCloset {
  userId: UserId;
  items: ClothingItem[];
  updatedAt: ISODateTime;
}

export interface PreferenceSignals {
  acceptedItemIds?: ClothingItemId[];
  rejectedItemIds?: ClothingItemId[];
  preferredTags?: string[];
  avoidedTags?: string[];
}

export interface AmbientConditionTriggers {
  weather?: {
    condition: WeatherCondition;
    temperatureC: number;
    precipitationChance: number;
  };
  timeOfDay: TimeOfDay;
  calendarEvent?: {
    title: string;
    startsAt: ISODateTime;
    locationLabel?: string;
    formalityHint?: Formality;
  };
  destination?: {
    label: string;
    etaMinutes?: number;
    expectedAesthetic?: string;
  };
}

export interface VoiceUtteranceContext {
  userId: UserId;
  transcript: string;
  capturedAt: ISODateTime;
  locale: string;
  ambient: AmbientConditionTriggers;
  urgency: 'low' | 'normal' | 'high' | 'immediate';
  latencyBudgetMs: number;
  maxRecommendationCount?: number;
  preferenceSignals?: PreferenceSignals;
  /**
   * Local-first beta support. Production deployments should replace this with
   * an authenticated closet read from the configured database provider.
   */
  closetSnapshot?: DigitalCloset;
}

export interface RecommendedOutfitSlot {
  slot: 'base' | 'top' | 'bottom' | 'one-piece' | 'outerwear' | 'footwear' | 'accessory';
  itemId: ClothingItemId;
  reasonCode:
    | 'weather-fit'
    | 'color-harmony'
    | 'formality-match'
    | 'comfort'
    | 'calendar-context'
    | 'user-preference'
    | 'fallback';
  confidence: number;
}

/**
 * This contract intentionally separates human-readable speech from inventory references.
 * Agent code can explain a recommendation, but every outfit slot must point to a
 * ClothingItemId that already exists in the user's DigitalCloset.
 */
export interface StyleRecommendationPayload {
  recommendationId: `rec_${string}`;
  userId: UserId;
  generatedAt: ISODateTime;
  source: 'voice-loop' | 'autonomous-agent';
  providerMode: ProviderMode;
  outfit: RecommendedOutfitSlot[];
  fallbackAlternatives: RecommendedOutfitSlot[];
  alternativeOutfits?: RecommendedOutfitSlot[][];
  confidence: number;
  cautions: string[];
  orchestrationReason: string;
  ttsSummary: string;
  constraintsApplied: string[];
  rejectedItemIds: ClothingItemId[];
  learningSummary?: string[];
}

export interface ApiErrorPayload {
  error: {
    code: 'bad_request' | 'not_found' | 'method_not_allowed' | 'internal_error';
    message: string;
  };
}

export function isHexColor(value: string): value is HexColor {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function ensureClosetItemIds(
  recommendation: StyleRecommendationPayload,
  closet: DigitalCloset
): StyleRecommendationPayload {
  const validIds = new Set(closet.items.map((item) => item.id));
  const alternativeIds = (recommendation.alternativeOutfits || []).flat().map((slot) => slot.itemId);
  const allRecommendedIds: ClothingItemId[] = [
    ...recommendation.outfit.map((slot) => slot.itemId),
    ...recommendation.fallbackAlternatives.map((slot) => slot.itemId),
    ...alternativeIds
  ];
  const unknownIds = allRecommendedIds.filter((itemId) => !validIds.has(itemId));

  if (unknownIds.length > 0) {
    throw new Error(`Recommendation referenced item IDs outside the user's closet: ${unknownIds.join(', ')}`);
  }

  return recommendation;
}
