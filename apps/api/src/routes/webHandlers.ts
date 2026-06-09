import type { ApiErrorPayload, ClothingItemId, UserId, VoiceUtteranceContext } from '@stylist/shared';
import { generateAutonomousRecommendation, generateVoiceRecommendation } from '../agents/recommendationEngine.js';
import { getDigitalCloset, setClothingItemAvailability } from '../data/mockCloset.js';

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
    typeof candidate.ambient?.timeOfDay === 'string'
  );
}

export async function voiceRecommendHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Use POST for /api/voice-recommend.');
  }

  const body = await readJson(request);
  if (!isVoiceContext(body)) {
    return errorResponse(400, 'bad_request', 'VoiceUtteranceContext is required.');
  }

  try {
    const recommendation = await generateVoiceRecommendation(body);
    return jsonResponse(recommendation, { status: 200 });
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
    return jsonResponse(recommendation, { status: 200 });
  } catch (error) {
    return errorResponse(404, 'not_found', error instanceof Error ? error.message : 'Unable to generate recommendation.');
  }
}

export async function closetHandler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse(405, 'method_not_allowed', 'Use GET for /api/closet.');
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') as UserId | null;

  if (!userId) {
    return errorResponse(400, 'bad_request', 'userId query parameter is required.');
  }

  const closet = await getDigitalCloset(userId);
  if (!closet) {
    return errorResponse(404, 'not_found', `No closet found for ${userId}.`);
  }

  return jsonResponse(closet, { status: 200 });
}

export async function toggleClosetAvailabilityHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Use POST for /api/closet/toggle-availability.');
  }

  const body = (await readJson(request)) as { userId?: unknown; itemId?: unknown; available?: unknown } | null;
  const userId = typeof body?.userId === 'string' ? (body.userId as UserId) : null;
  const itemId = typeof body?.itemId === 'string' && body.itemId.startsWith('item_') ? (body.itemId as ClothingItemId) : null;
  const available = typeof body?.available === 'boolean' ? body.available : null;

  if (!userId || !itemId || available === null) {
    return errorResponse(400, 'bad_request', 'userId, itemId, and available are required.');
  }

  const item = await setClothingItemAvailability(userId, itemId, available);
  if (!item) {
    return errorResponse(404, 'not_found', `No closet item found for ${itemId}.`);
  }

  const closet = await getDigitalCloset(userId);
  return jsonResponse({ item, closet }, { status: 200 });
}
