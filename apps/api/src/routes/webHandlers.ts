import type { ApiErrorPayload, VoiceUtteranceContext } from '@stylist/shared';
import { generateAutonomousRecommendation, generateVoiceRecommendation } from '../agents/recommendationEngine.js';

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
