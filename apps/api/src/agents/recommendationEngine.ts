import {
  ensureClosetItemIds,
  type AmbientConditionTriggers,
  type ClothingItem,
  type DigitalCloset,
  type Formality,
  type PreferenceSignals,
  type RecommendedOutfitSlot,
  type StyleRecommendationPayload,
  type StylingOccasion,
  type UserId,
  type UserProfile,
  type VoiceUtteranceContext
} from '@stylist/shared';
import { getDigitalCloset, getUserProfile } from '../data/mockCloset.js';

export type RankedOutfit = {
  items: ClothingItem[];
  score: number;
  colorScore: number;
};

function nowIso() {
  return new Date().toISOString();
}

const formalityRank: Record<Formality, number> = {
  casual: 0,
  'smart-casual': 1,
  business: 2,
  formal: 3
};

function occasionFromContext(context: AmbientConditionTriggers): StylingOccasion | undefined {
  const eventTitle = context.calendarEvent?.title.toLowerCase() || '';
  const destination = context.destination?.expectedAesthetic?.toLowerCase() || '';
  if (eventTitle.includes('service') || eventTitle.includes('church')) return 'religious-service';
  if (eventTitle.includes('office') || eventTitle.includes('meeting') || eventTitle.includes('presentation')) return 'corporate';
  if (eventTitle.includes('dinner') || destination.includes('dinner')) return 'date-night';
  if (eventTitle.includes('airport') || destination.includes('airport') || destination.includes('travel')) return 'travel';
  return undefined;
}

function preferenceScore(item: ClothingItem, signals?: PreferenceSignals): number {
  if (!signals) return 0;
  let score = 0;
  if (signals.acceptedItemIds?.includes(item.id)) score += 5;
  if (signals.rejectedItemIds?.includes(item.id)) score -= 9;
  score += item.tags.filter((tag) => signals.preferredTags?.includes(tag)).length * 2;
  score -= item.tags.filter((tag) => signals.avoidedTags?.includes(tag)).length * 5;
  return score;
}

function scoreItem(
  item: ClothingItem,
  context: AmbientConditionTriggers,
  profile: UserProfile,
  signals?: PreferenceSignals
): number {
  let score = 10 + preferenceScore(item, signals);
  const lowerTags = item.tags.map((tag) => tag.toLowerCase());
  const occasion = occasionFromContext(context);

  if (context.weather?.condition === 'rain' && (lowerTags.includes('rainy-day') || item.fabric.waterResistance !== 'none')) score += 8;
  if (context.weather?.condition === 'snow' && item.warmth >= 4) score += 8;
  if (context.weather && context.weather.temperatureC < 10 && item.warmth >= 3) score += 4;
  if (context.weather && context.weather.temperatureC > 24 && item.fabric.breathability === 'high') score += 4;
  if (context.calendarEvent?.formalityHint && item.formality === context.calendarEvent.formalityHint) score += 7;
  if (occasion && item.occasionSupport.includes(occasion)) score += 6;
  if (profile.fit.footwearComfortPriority === 'high' && item.category === 'footwear' && item.tags.includes('comfort')) score += 5;
  if (profile.constraints.preferredAesthetics.some((aesthetic) => lowerTags.includes(aesthetic.toLowerCase()))) score += 2;

  if (item.lastWornAt) {
    const elapsedHours = (Date.now() - new Date(item.lastWornAt).getTime()) / 3_600_000;
    if (elapsedHours < 36) score -= 4;
  }

  return score;
}

function isAllowedCandidate(item: ClothingItem, profile: UserProfile): boolean {
  if (!item.available) return false;
  const lowerTags = item.tags.map((tag) => tag.toLowerCase());
  return !profile.constraints.excludedTags.some((tag) => lowerTags.includes(tag.toLowerCase()));
}

function hexToHsl(hex: string): { hue: number; saturation: number; lightness: number } {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    if (max === green) hue = 60 * ((blue - red) / delta + 2);
    if (max === blue) hue = 60 * ((red - green) / delta + 4);
  }

  if (hue < 0) hue += 360;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { hue, saturation, lightness };
}

function colorHarmonyScore(items: ClothingItem[]): number {
  const colors = items
    .filter((item) => item.category !== 'accessory')
    .map((item) => hexToHsl(item.primaryColor));

  if (colors.length < 2) return 0;
  let score = 0;

  for (let index = 0; index < colors.length; index += 1) {
    for (let next = index + 1; next < colors.length; next += 1) {
      const first = colors[index];
      const second = colors[next];
      const firstNeutral = first.saturation < 0.18;
      const secondNeutral = second.saturation < 0.18;
      const hueDistance = Math.min(Math.abs(first.hue - second.hue), 360 - Math.abs(first.hue - second.hue));

      if (firstNeutral || secondNeutral) score += 2;
      else if (hueDistance < 38) score += 2;
      else if (hueDistance > 145 && hueDistance < 215) score += 1;
      else score -= 1;

      if (Math.abs(first.lightness - second.lightness) > 0.6) score -= 1;
    }
  }

  return score;
}

function needsOuterwear(context: AmbientConditionTriggers): boolean {
  const condition = context.weather?.condition;
  return condition === 'rain' || condition === 'snow' || condition === 'wind' || (context.weather?.temperatureC ?? 20) < 12;
}

function formalityCoherence(items: ClothingItem[], context: AmbientConditionTriggers): number {
  const ranks = items.map((item) => formalityRank[item.formality]);
  const spread = Math.max(...ranks) - Math.min(...ranks);
  let score = spread <= 1 ? 5 : spread === 2 ? 0 : -5;
  const target = context.calendarEvent?.formalityHint;

  if (target) {
    const targetRank = formalityRank[target];
    const average = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
    score += Math.max(-4, 5 - Math.abs(targetRank - average) * 3);
  }

  return score;
}

function candidateItems(
  closet: DigitalCloset,
  profile: UserProfile,
  context: AmbientConditionTriggers,
  category: ClothingItem['category'],
  signals?: PreferenceSignals,
  limit = 4
): ClothingItem[] {
  return closet.items
    .filter((item) => item.category === category && isAllowedCandidate(item, profile))
    .sort((a, b) => scoreItem(b, context, profile, signals) - scoreItem(a, context, profile, signals))
    .slice(0, limit);
}

function outfitScore(
  items: ClothingItem[],
  context: AmbientConditionTriggers,
  profile: UserProfile,
  signals?: PreferenceSignals
): RankedOutfit {
  const colorScore = colorHarmonyScore(items);
  const occasion = occasionFromContext(context);
  let score = items.reduce((sum, item) => sum + scoreItem(item, context, profile, signals), 0);
  score += colorScore;
  score += formalityCoherence(items, context);
  score += items.filter((item) => occasion && item.occasionSupport.includes(occasion)).length * 2;
  if (needsOuterwear(context) && !items.some((item) => item.category === 'outerwear')) score -= 20;
  if (items.some((item) => item.category === 'footwear')) score += 4;
  return { items, score, colorScore };
}

export function rankOutfitCombinations(
  closet: DigitalCloset,
  profile: UserProfile,
  context: AmbientConditionTriggers,
  signals?: PreferenceSignals
): RankedOutfit[] {
  const tops = candidateItems(closet, profile, context, 'top', signals);
  const bottoms = candidateItems(closet, profile, context, 'bottom', signals);
  const dresses = candidateItems(closet, profile, context, 'dress', signals);
  const footwear = candidateItems(closet, profile, context, 'footwear', signals, 3);
  const outerwear = candidateItems(closet, profile, context, 'outerwear', signals, 3);
  const accessories = candidateItems(closet, profile, context, 'accessory', signals, 2);
  const outerOptions: Array<ClothingItem | undefined> = needsOuterwear(context)
    ? outerwear
    : [undefined, ...outerwear.slice(0, 2)];
  const accessoryOptions: Array<ClothingItem | undefined> = [undefined, ...accessories.slice(0, 1)];
  const combinations: RankedOutfit[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of footwear) {
        for (const layer of outerOptions.length ? outerOptions : [undefined]) {
          for (const accessory of accessoryOptions) {
            combinations.push(outfitScore([top, bottom, shoe, layer, accessory].filter(Boolean) as ClothingItem[], context, profile, signals));
          }
        }
      }
    }
  }

  for (const dress of dresses) {
    for (const shoe of footwear) {
      for (const layer of outerOptions.length ? outerOptions : [undefined]) {
        for (const accessory of accessoryOptions) {
          combinations.push(outfitScore([dress, shoe, layer, accessory].filter(Boolean) as ClothingItem[], context, profile, signals));
        }
      }
    }
  }

  if (combinations.length === 0) {
    const fallback = closet.items
      .filter((item) => isAllowedCandidate(item, profile))
      .sort((a, b) => scoreItem(b, context, profile, signals) - scoreItem(a, context, profile, signals))
      .slice(0, 5);
    if (fallback.length) combinations.push(outfitScore(fallback, context, profile, signals));
  }

  const seen = new Set<string>();
  return combinations
    .sort((a, b) => b.score - a.score)
    .filter((combination) => {
      const key = combination.items.map((item) => item.id).sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function slotFor(item: ClothingItem): RecommendedOutfitSlot['slot'] {
  if (item.category === 'base-layer') return 'base';
  if (item.category === 'top') return 'top';
  if (item.category === 'bottom') return 'bottom';
  if (item.category === 'dress') return 'one-piece';
  return item.category;
}

function reasonFor(
  item: ClothingItem,
  context: AmbientConditionTriggers,
  signals: PreferenceSignals | undefined,
  colorScore: number
): RecommendedOutfitSlot['reasonCode'] {
  if (context.weather?.condition === 'rain' && (item.tags.includes('rainy-day') || item.fabric.waterResistance !== 'none')) return 'weather-fit';
  if (context.calendarEvent?.formalityHint && item.formality === context.calendarEvent.formalityHint) return 'formality-match';
  if (item.category === 'footwear' && item.tags.includes('comfort')) return 'comfort';
  if (signals?.acceptedItemIds?.includes(item.id) || item.tags.some((tag) => signals?.preferredTags?.includes(tag))) return 'user-preference';
  if (colorScore > 1) return 'color-harmony';
  if (context.calendarEvent) return 'calendar-context';
  return 'user-preference';
}

function confidenceFor(item: ClothingItem, context: AmbientConditionTriggers, combinationScore: number): number {
  let confidence = item.fit.confidence;
  const occasion = occasionFromContext(context);
  if (occasion && item.occasionSupport.includes(occasion)) confidence += 0.03;
  if (context.weather?.condition === 'rain' && item.tags.includes('rainy-day')) confidence += 0.02;
  if (combinationScore > 70) confidence += 0.02;
  return Math.min(0.99, Number(confidence.toFixed(2)));
}

function slotsFor(
  ranked: RankedOutfit,
  context: AmbientConditionTriggers,
  signals?: PreferenceSignals,
  fallback = false
): RecommendedOutfitSlot[] {
  return ranked.items.map((item) => ({
    slot: slotFor(item),
    itemId: item.id,
    reasonCode: fallback ? 'fallback' : reasonFor(item, context, signals, ranked.colorScore),
    confidence: confidenceFor(item, context, ranked.score)
  }));
}

function spokenSummary(items: ClothingItem[]): string {
  const core = items.filter((item) => item.category !== 'outerwear' && item.category !== 'accessory');
  const layer = items.find((item) => item.category === 'outerwear');
  const accessory = items.find((item) => item.category === 'accessory');
  const sentences = [`Wear ${core.map((item) => item.name).join(', ')}.`];
  if (layer) sentences.push(`Add ${layer.name}.`);
  if (accessory) sentences.push(`Finish with ${accessory.name}.`);
  return sentences.join(' ');
}

function resolveCloset(baseCloset: DigitalCloset, context: VoiceUtteranceContext): DigitalCloset {
  const snapshot = context.closetSnapshot;
  if (!snapshot || snapshot.userId !== context.userId || !Array.isArray(snapshot.items)) return baseCloset;

  const safeItems = snapshot.items.filter((item) => item.userId === context.userId && item.id.startsWith('item_'));
  if (!safeItems.length) return baseCloset;

  const merged = new Map(baseCloset.items.map((item) => [item.id, item]));
  for (const item of safeItems) merged.set(item.id, item);
  return { userId: baseCloset.userId, items: [...merged.values()], updatedAt: nowIso() };
}

function buildRecommendation(params: {
  userId: UserId;
  profile: UserProfile;
  closet: DigitalCloset;
  context: AmbientConditionTriggers;
  source: StyleRecommendationPayload['source'];
  transcriptHint?: string;
  signals?: PreferenceSignals;
}): StyleRecommendationPayload {
  const { userId, profile, closet, context, source, transcriptHint, signals } = params;
  const ranked = rankOutfitCombinations(closet, profile, context, signals);
  const primary = ranked[0];
  const alternatives = ranked.slice(1, 3);

  if (!primary || primary.items.length === 0) throw new Error('No complete outfit could be built from the available closet.');

  const outfit = slotsFor(primary, context, signals);
  const alternativeOutfits = alternatives.map((alternative) => slotsFor(alternative, context, signals, true));
  const fallbackAlternatives = alternativeOutfits[0] || [];
  const outfitConfidence = Number((outfit.reduce((sum, slot) => sum + slot.confidence, 0) / outfit.length).toFixed(2));
  const cautions: string[] = [];

  if (context.weather?.condition === 'rain') cautions.push('Rain was applied to the decision; water-resistant pieces were prioritized where available.');
  if (needsOuterwear(context) && !primary.items.some((item) => item.category === 'outerwear')) cautions.push('No suitable outer layer is currently available in the closet.');
  if (outfitConfidence < 0.82) cautions.push('Fit confidence is limited for at least one selected item.');

  const learningSummary = [
    signals?.acceptedItemIds?.length ? `${signals.acceptedItemIds.length} previously accepted pieces influenced ranking.` : null,
    signals?.rejectedItemIds?.length ? `${signals.rejectedItemIds.length} previously rejected pieces were deprioritized.` : null,
    signals?.preferredTags?.length ? `Preferred signals: ${signals.preferredTags.join(', ')}.` : null
  ].filter((item): item is string => Boolean(item));

  const recommendation: StyleRecommendationPayload = {
    recommendationId: `rec_${Date.now()}`,
    userId,
    generatedAt: nowIso(),
    source,
    providerMode: 'mock',
    outfit,
    fallbackAlternatives,
    alternativeOutfits,
    confidence: outfitConfidence,
    cautions,
    orchestrationReason:
      `Combination-ranking agent compared ${ranked.length} valid closet-backed outfits for ${context.timeOfDay}` +
      `${context.calendarEvent ? ` before ${context.calendarEvent.title}` : ''}` +
      `${context.weather ? ` with ${context.weather.condition} at ${context.weather.temperatureC}C` : ''}.` +
      `${transcriptHint ? ` Voice intent: ${transcriptHint}` : ''}`,
    ttsSummary: spokenSummary(primary.items),
    constraintsApplied: [
      'Only existing DigitalCloset item IDs may be recommended.',
      'Unavailable items and excluded tags are removed before combination ranking.',
      'Weather, formality, color harmony, fit confidence, recency, and user feedback affect outfit ranking.'
    ],
    rejectedItemIds: closet.items.filter((item) => !item.available).map((item) => item.id),
    learningSummary
  };

  return ensureClosetItemIds(recommendation, closet);
}

export async function generateAutonomousRecommendation(userId: string): Promise<StyleRecommendationPayload> {
  const normalizedUserId = userId as UserId;
  const [profile, closet] = await Promise.all([getUserProfile(normalizedUserId), getDigitalCloset(normalizedUserId)]);

  if (!profile || !closet) throw new Error(`No profile or closet found for ${userId}`);

  const externalContext: AmbientConditionTriggers = {
    timeOfDay: 'evening',
    weather: { condition: 'rain', temperatureC: 16, precipitationChance: 0.72 },
    calendarEvent: {
      title: 'Dinner reservation',
      startsAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      locationLabel: 'Downtown',
      formalityHint: 'business'
    },
    destination: { label: 'Downtown restaurant', etaMinutes: 20, expectedAesthetic: 'polished dinner' }
  };

  return buildRecommendation({
    userId: normalizedUserId,
    profile,
    closet,
    context: externalContext,
    source: 'autonomous-agent'
  });
}

export async function generateVoiceRecommendation(context: VoiceUtteranceContext): Promise<StyleRecommendationPayload> {
  const [profile, storedCloset] = await Promise.all([getUserProfile(context.userId), getDigitalCloset(context.userId)]);
  if (!profile || !storedCloset) throw new Error(`No profile or closet found for ${context.userId}`);

  const closet = resolveCloset(storedCloset, context);
  return buildRecommendation({
    userId: context.userId,
    profile,
    closet,
    context: context.ambient,
    source: 'voice-loop',
    transcriptHint: context.transcript.slice(0, 160),
    signals: context.preferenceSignals
  });
}
