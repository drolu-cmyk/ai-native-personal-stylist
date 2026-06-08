import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function registerStylingRoutes(app: FastifyInstance, config: AppConfig) {
  app.post('/style/recommend', async (request) => {
    const body = request.body as { prompt?: string; occasion?: string };
    return {
      providerMode: config.providers.ai,
      recommendation: {
        summary: 'Use mock mode until a real provider adapter is configured.',
        prompt: body?.prompt || null,
        occasion: body?.occasion || null,
        items: ['neutral base layer', 'occasion-appropriate outer layer', 'comfortable shoes']
      }
    };
  });
}
