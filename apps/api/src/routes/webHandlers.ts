import type { ApiErrorPayload, VoiceUtteranceContext } from '@stylist/shared';
import { generateAutonomousRecommendation, generateVoiceRecommendation } from '../agents/recommendationEngine.js';
import { getDigitalCloset, getUserProfile } from '../data/mockCloset.js';

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...jsonHeaders, ...init?.headers }
  });
}

function errorResponse(status: number, code: ApiErrorPayload['error']['code'], message: string) {
  return jsonResponse({ error: { code, message } } satisfies ApiErrorPayload, { status });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isValidClosetSnapshot(candidate: Partial<VoiceUtteranceContext>) {
  if (!candidate.closetSnapshot) return true;
  return (
    candidate.closetSnapshot.userId === candidate.userId &&
    Array.isArray(candidate.closetSnapshot.items) &&
    candidate.closetSnapshot.items.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        item.id.startsWith('item_') &&
        item.userId === candidate.userId &&
        typeof item.name === 'string' &&
        typeof item.category === 'string' &&
        typeof item.primaryColor === 'string' &&
        typeof item.available === 'boolean'
    )
  );
}

function isVoiceContext(value: unknown): value is VoiceUtteranceContext {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VoiceUtteranceContext>;

  return (
    typeof candidate.userId === 'string' &&
    candidate.userId.startsWith('user_') &&
    typeof candidate.transcript === 'string' &&
    candidate.transcript.trim().length > 0 &&
    typeof candidate.capturedAt === 'string' &&
    typeof candidate.locale === 'string' &&
    typeof candidate.latencyBudgetMs === 'number' &&
    candidate.latencyBudgetMs > 0 &&
    typeof candidate.urgency === 'string' &&
    Boolean(candidate.ambient) &&
    typeof candidate.ambient?.timeOfDay === 'string' &&
    isValidClosetSnapshot(candidate)
  );
}

export async function voiceRecommendHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Use POST for /api/voice-recommend.');
  }

  const body = await readJson(request);
  if (!isVoiceContext(body)) {
    return errorResponse(400, 'bad_request', 'A valid VoiceUtteranceContext and closet snapshot are required.');
  }

  try {
    const recommendation = await generateVoiceRecommendation(body);
    return jsonResponse({ ...recommendation, providerMode: 'internal-ranker' }, { status: 200 });
  } catch (error) {
    return errorResponse(404, 'not_found', error instanceof Error ? error.message : 'Unable to generate recommendation.');
  }
}

export async function autonomousRecommendationHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Use POST for /api/autonomous-recommend.');
  }

  const body = await readJson(request);
  const userId = typeof (body as { userId?: unknown } | null)?.userId === 'string' ? (body as { userId: string }).userId : null;

  if (!userId) {
    return errorResponse(400, 'bad_request', 'userId is required.');
  }

  try {
    const recommendation = await generateAutonomousRecommendation(userId);
    return jsonResponse({ ...recommendation, providerMode: 'internal-ranker' }, { status: 200 });
  } catch (error) {
    return errorResponse(404, 'not_found', error instanceof Error ? error.message : 'Unable to generate recommendation.');
  }
}

export async function closetHandler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return errorResponse(405, 'method_not_allowed', 'Use GET for /api/closet.');
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId || !userId.startsWith('user_')) return errorResponse(400, 'bad_request', 'A valid userId is required.');
  const [profile, closet] = await Promise.all([getUserProfile(userId as any), getDigitalCloset(userId as any)]);
  if (!profile || !closet) return errorResponse(404, 'not_found', `No closet found for ${userId}.`);
  return jsonResponse({ profile, closet }, { status: 200 });
}

export async function recommendationFeedbackHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST for /api/recommendation-feedback.');
  const body = await readJson(request);
  const item = body as { recommendationId?: unknown; userId?: unknown; accepted?: unknown; reason?: unknown; itemIds?: unknown } | null;
  if (
    !item ||
    typeof item.recommendationId !== 'string' ||
    typeof item.userId !== 'string' ||
    typeof item.accepted !== 'boolean' ||
    typeof item.reason !== 'string' ||
    (item.itemIds !== undefined && (!Array.isArray(item.itemIds) || !item.itemIds.every((id) => typeof id === 'string' && id.startsWith('item_'))))
  ) {
    return errorResponse(400, 'bad_request', 'Feedback requires recommendationId, userId, accepted, reason, and optional closet item IDs.');
  }
  return jsonResponse(
    {
      ok: true,
      receivedAt: new Date().toISOString(),
      providerMode: 'internal-ranker',
      learningSignal: {
        accepted: item.accepted,
        itemIds: item.itemIds || [],
        reason: item.reason
      }
    },
    { status: 202 }
  );
}
