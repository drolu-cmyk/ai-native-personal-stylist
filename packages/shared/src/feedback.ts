import type { ClothingItemId, ISODateTime, UserId } from './index.js';

export type FeedbackReason = 'accepted' | 'too-formal' | 'too-casual' | 'weather' | 'fit' | 'swap';

export interface RecommendationFeedback {
  recommendationId: string;
  userId: UserId;
  accepted: boolean;
  reason: FeedbackReason;
  rejectedItemIds: ClothingItemId[];
  swappedItemIds: ClothingItemId[];
  createdAt: ISODateTime;
}
