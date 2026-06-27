import type { AmbientConditionTriggers, ClothingItem, UserProfile, VoiceUtteranceContext } from './index.js';

export interface VoiceIntentSignal {
  rewrittenUserIntent: string;
  occasionHint?: string;
  formalityHint?: string;
  weatherConcern?: string;
  confidence: number;
}

export interface StylingDecisionSignal {
  itemId: ClothingItem['id'];
  score: number;
  reasons: string[];
}

export function parseVoiceIntentSignal(context: VoiceUtteranceContext): VoiceIntentSignal {
  const text = context.transcript.toLowerCase();
  const weatherConcern = text.includes('rain') ? 'rain' : text.includes('snow') ? 'snow' : text.includes('hot') ? 'heat' : text.includes('cold') ? 'cold' : undefined;
  const occasionHint = text.includes('dinner') ? 'date-night' : text.includes('meeting') || text.includes('office') ? 'corporate' : text.includes('travel') ? 'travel' : undefined;
  const formalityHint = text.includes('formal') ? 'formal' : text.includes('business') || text.includes('meeting') ? 'business' : text.includes('casual') ? 'casual' : context.ambient.calendarEvent?.formalityHint;

  return {
    rewrittenUserIntent: context.transcript.trim(),
    occasionHint,
    formalityHint,
    weatherConcern,
    confidence: Number((0.72 + (occasionHint ? 0.08 : 0) + (formalityHint ? 0.08 : 0) + (weatherConcern ? 0.06 : 0)).toFixed(2))
  };
}

export function scoreStylingItem(item: ClothingItem, profile: UserProfile, ambient: AmbientConditionTriggers): StylingDecisionSignal {
  const reasons: string[] = [];
  let score = 10;
  const tags = item.tags.map((tag) => tag.toLowerCase());

  if (!item.available) {
    return { itemId: item.id, score: -100, reasons: ['unavailable'] };
  }
  if (profile.constraints.excludedTags.some((tag) => tags.includes(tag.toLowerCase()))) {
    return { itemId: item.id, score: -90, reasons: ['excluded-tag'] };
  }
  if (ambient.weather?.condition === 'rain' && (tags.includes('rainy-day') || item.fabric.waterResistance !== 'none')) {
    score += 6;
    reasons.push('weather-fit');
  }
  if (ambient.calendarEvent?.formalityHint && item.formality === ambient.calendarEvent.formalityHint) {
    score += 7;
    reasons.push('formality-match');
  }
  if (profile.fit.footwearComfortPriority === 'high' && tags.includes('comfort')) {
    score += 4;
    reasons.push('comfort');
  }

  return { itemId: item.id, score, reasons: reasons.length ? reasons : ['user-preference'] };
}
