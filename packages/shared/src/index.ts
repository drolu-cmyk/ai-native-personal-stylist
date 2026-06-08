export type StylingOccasion = 'corporate' | 'formal' | 'casual' | 'religious-service' | 'travel' | 'custom';

export interface StylingRequest {
  prompt: string;
  occasion?: StylingOccasion;
  heightCm?: number;
  climate?: string;
  culturalContext?: string;
  styleIcon?: string;
}

export interface OutfitRecommendation {
  summary: string;
  colorLogic: string[];
  fitNotes: string[];
  items: string[];
  cautions: string[];
}
