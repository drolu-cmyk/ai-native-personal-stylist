import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';
import {
  autonomousRecommendationHandler,
  closetHandler,
  recommendationFeedbackHandler,
  voiceRecommendHandler
} from './webHandlers.js';

async function toFastifyPayload(response: Response) {
  const contentType = response.headers.get('content-type') || 'application/json; charset=utf-8';
  return {
    status: response.status,
    contentType,
    body: await response.text()
  };
}

function requestFromFastify(url: string, method: string, body: unknown) {
  return new Request(`http://stylist.local${url}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function registerStylingRoutes(app: FastifyInstance, config: AppConfig) {
  app.post('/api/voice-recommend', async (request, reply) => {
    const response = await voiceRecommendHandler(requestFromFastify('/api/voice-recommend', request.method, request.body));
    const payload = await toFastifyPayload(response);
    return reply.status(payload.status).type(payload.contentType).send(payload.body);
  });

  app.post('/api/autonomous-recommend', async (request, reply) => {
    const response = await autonomousRecommendationHandler(
      requestFromFastify('/api/autonomous-recommend', request.method, request.body)
    );
    const payload = await toFastifyPayload(response);
    return reply.status(payload.status).type(payload.contentType).send(payload.body);
  });

  app.get('/api/closet', async (request, reply) => {
    const query = request.query as { userId?: string };
    const response = await closetHandler(new Request(`http://stylist.local/api/closet?userId=${query.userId || ''}`, { method: request.method }));
    const payload = await toFastifyPayload(response);
    return reply.status(payload.status).type(payload.contentType).send(payload.body);
  });

  app.post('/api/recommendation-feedback', async (request, reply) => {
    const response = await recommendationFeedbackHandler(
      requestFromFastify('/api/recommendation-feedback', request.method, request.body)
    );
    const payload = await toFastifyPayload(response);
    return reply.status(payload.status).type(payload.contentType).send(payload.body);
  });

  app.post('/style/recommend', async (request) => {
    const body = request.body as { prompt?: string; occasion?: string };
    return {
      providerMode: config.providers.ai,
      migrationNote: 'Use /api/voice-recommend for inventory-bound voice micro-interactions.',
      recommendation: {
        summary: 'Use mock mode until a real provider adapter is configured.',
        prompt: body?.prompt || null,
        occasion: body?.occasion || null,
        items: []
      }
    };
  });
}
