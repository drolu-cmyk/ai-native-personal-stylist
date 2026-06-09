import {
  ensureClosetItemIds,
  type AmbientConditionTriggers,
  type ClothingItem,
  type DigitalCloset,
  type RecommendedOutfitSlot,
  type StyleRecommendationPayload,
  type StylingOccasion,
  type UserId,
  type UserProfile,
  type VoiceUtteranceContext
} from '@stylist/shared';
import { getActiveClosetItems, getDigitalCloset, getUserProfile } from '../data/mockCloset.js';

function nowIso() {
  return new Date().toISOString();
}

async function fetchMockWeatherContext(): Promise<NonNullable<AmbientConditionTriggers['weather']>> {
  return {
    condition: 'rain',
    temperatureC: 16,
    precipitationChance: 0.72
  };
}

async function fetchMockCalendarContext(): Promise<NonNullable<AmbientConditionTriggers['calendarEvent']>> {
  return {
    title: 'Dinner reservation',
    startsAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    locationLabel: 'Downtown',
    formalityHint: 'business'
  };
}

function assertAutonomousPayload(recommendation: StyleRecommendationPayload): StyleRecommendationPayload {
  if (recommendation.source !== 'autonomous-agent') {
    throw new Error('Autonomous recommendation source must be autonomous-agent.');
  }

  if (recommendation.providerMode !== 'mock') {
    throw new Error('Autonomous recommendation provider mode must remain mock in the foundation.');
  }

  if (recommendation.outfit.length === 0) {
    throw new Error('Autonomous recommendation could not select any active closet items.');
  }

  return recommendation;
}

function scoreItem(item: ClothingItem, context: AmbientConditionTriggers, profile: UserProfile): number {
  let score = 10;
  const lowerTags = item.tags.map((tag) => tag.toLowerCase());

  if (context.weather?.condition === 'rain' && (lowerTags.includes('rainy-day') || item.fabric.waterResistance !== 'none')) {
    score += 8;
  }

  if (context.weather && context.weather.temperatureC < 10 && item.warmth >= 3) score += 4;
  if (context.weather && context.weather.temperatureC > 24 && item.fabric.breathability === 'high') score += 4;
  if (context.calendarEvent?.formalityHint && item.formality === context.calendarEvent.formalityHint) score += 7;
  if (profile.fit.footwearComfortPriority === 'high' && item.tags.includes('comfort')) score += 5;
  return score;
}

function isAllowedCandidate(item: ClothingItem, profile: UserProfile): boolean {
  if (!item.available) return false;

  const lowerTags = item.tags.map((tag) => tag.toLowerCase());
  return !profile.constraints.excludedTags.some((tag) => lowerTags.includes(tag.toLowerCase()));
}

function bestByCategory(
  closet: DigitalCloset,
  profile: UserProfile,
  context: AmbientConditionTriggers,
  categories: ClothingItem['category'][]
): ClothingItem | undefined {
  return closet.items
    .filter((item) => categories.includes(item.category) && isAllowedCandidate(item, profile))
    .sort((a, b) => scoreItem(b, context, profile) - scoreItem(a, context, profile))[0];
}

function slotFor(item: ClothingItem): RecommendedOutfitSlot['slot'] {
  if (item.category === 'base-layer') return 'base';
  if (item.category === 'top') return 'top';
  if (item.category === 'bottom') return 'bottom';
  if (item.category === 'dress') return 'one-piece';
  return item.category;
}

function reasonFor(item: ClothingItem, context: AmbientConditionTriggers): RecommendedOutfitSlot['reasonCode'] {
  if (context.weather?.condition === 'rain' && item.tags.includes('rainy-day')) return 'weather-fit';
  if (context.calendarEvent?.formalityHint && item.formality === context.calendarEvent.formalityHint) return 'calendar-context';
  if (item.tags.includes('comfort')) return 'comfort';
  return 'user-preference';
}

function occasionFromContext(context: AmbientConditionTriggers): StylingOccasion | undefined {
  const eventTitle = context.calendarEvent?.title.toLowerCase() || '';
  const destination = context.destination?.expectedAesthetic?.toLowerCase() || '';
  if (eventTitle.includes('service')) return 'religious-service';
  if (eventTitle.includes('office') || eventTitle.includes('meeting') || eventTitle.includes('presentation')) return 'corporate';
  if (eventTitle.includes('dinner') || destination.includes('dinner')) return 'date-night';
  if (destination.includes('airport') || destination.includes('travel')) return 'travel';
  return undefined;
}

function confidenceFor(item: ClothingItem, context: AmbientConditionTriggers): number {
  let confidence = item.fit.confidence;
  const occasion = occasionFromContext(context);
  if (occasion && item.occasionSupport.includes(occasion)) confidence += 0.03;
  if (context.weather?.condition === 'rain' && item.tags.includes('rainy-day')) confidence += 0.02;
  return Math.min(0.99, Number(confidence.toFixed(2)));
}

function buildRecommendation(
  params: {
    userId: UserId;
    profile: UserProfile;
    closet: DigitalCloset;
    context: AmbientConditionTriggers;
    source: StyleRecommendationPayload['source'];
    transcriptHint?: string;
  }
): StyleRecommendationPayload {
  const { userId, profile, closet, context, source, transcriptHint } = params;
  const top = bestByCategory(closet, profile, context, ['top']);
  const bottom = bestByCategory(closet, profile, context, ['bottom']);
  const footwear = bestByCategory(closet, profile, context, ['footwear']);
  const outerwear =
    context.weather?.condition === 'rain' || (context.weather?.temperatureC ?? 20) < 12
      ? bestByCategory(closet, profile, context, ['outerwear'])
      : undefined;
  const accessory = bestByCategory(closet, profile, context, ['accessory']);

  const selected = [top, bottom, outerwear, footwear, accessory].filter((item): item is ClothingItem => Boolean(item));
  const selectedIds = new Set(selected.map((item) => item.id));
  const alternatives = closet.items
    .filter((item) => isAllowedCandidate(item, profile) && !selectedIds.has(item.id))
    .sort((a, b) => scoreItem(b, context, profile) - scoreItem(a, context, profile))
    .slice(0, 2);

  const outfit = selected.map((item) => ({
    slot: slotFor(item),
    itemId: item.id,
    reasonCode: reasonFor(item, context),
    confidence: confidenceFor(item, context)
  }));
  const outfitConfidence =
    outfit.length > 0 ? Number((outfit.reduce((sum, slot) => sum + slot.confidence, 0) / outfit.length).toFixed(2)) : 0;
  const cautions =
    context.weather?.condition === 'rain'
      ? ['Rain context applied; prioritize water-resistant items already present in the closet.']
      : [];

  const recommendation: StyleRecommendationPayload = {
    recommendationId: `rec_${Date.now()}`,
    userId,
    generatedAt: nowIso(),
    source,
    providerMode: 'mock',
    outfit,
    fallbackAlternatives: alternatives.map((item) => ({
      slot: slotFor(item),
      itemId: item.id,
      reasonCode: 'fallback',
      confidence: confidenceFor(item, context)
    })),
    confidence: outfitConfidence,
    cautions,
    orchestrationReason:
      `Inventory-bound agent selected ${selected.length} available closet items for ${context.timeOfDay}` +
      `${context.calendarEvent ? ` before ${context.calendarEvent.title}` : ''}` +
      `${context.weather ? ` with ${context.weather.condition} at ${context.weather.temperatureC}C` : ''}.` +
      `${transcriptHint ? ` Voice intent: ${transcriptHint}` : ''}`,
    ttsSummary: `Wear ${selected.map((item) => item.name).join(', ')}.`,
    constraintsApplied: [
      'Only existing DigitalCloset item IDs may be recommended.',
      'Unavailable items are excluded.',
      'User excluded tags and fit preferences are applied before response creation.'
    ],
    rejectedItemIds: closet.items.filter((item) => !item.available).map((item) => item.id)
  };

  return ensureClosetItemIds(recommendation, closet);
}

export async function generateAutonomousRecommendation(userId: string): Promise<StyleRecommendationPayload> {
  const normalizedUserId = userId as UserId;
  const [profile, closet, activeItems, weather, calendarEvent] = await Promise.all([
    getUserProfile(normalizedUserId),
    getDigitalCloset(normalizedUserId),
    getActiveClosetItems(normalizedUserId),
    fetchMockWeatherContext(),
    fetchMockCalendarContext()
  ]);

  if (!profile || !closet) {
    throw new Error(`No profile or closet found for ${userId}`);
  }

  const activeCloset: DigitalCloset = {
    ...closet,
    items: activeItems
  };

  const externalContext: AmbientConditionTriggers = {
    timeOfDay: 'evening',
    weather,
    calendarEvent,
    destination: {
      label: 'Downtown restaurant',
      etaMinutes: 20,
      expectedAesthetic: 'polished dinner'
    }
  };

  return assertAutonomousPayload(buildRecommendation({
    userId: normalizedUserId,
    profile,
    closet: activeCloset,
    context: externalContext,
    source: 'autonomous-agent'
  }));
}

export async function generateVoiceRecommendation(
  context: VoiceUtteranceContext
): Promise<StyleRecommendationPayload> {
  const [profile, closet] = await Promise.all([getUserProfile(context.userId), getDigitalCloset(context.userId)]);

  if (!profile || !closet) {
    throw new Error(`No profile or closet found for ${context.userId}`);
  }

  return buildRecommendation({
    userId: context.userId,
    profile,
    closet,
    context: context.ambient,
    source: 'voice-loop',
    transcriptHint: context.transcript.slice(0, 160)
  });
}
