import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadConfig } from './config.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerStylingRoutes } from './routes/styling.js';

const config = loadConfig();
const app = Fastify({ logger: true });

await app.register(cors, { origin: config.corsOrigins });
await app.register(rateLimit, { max: config.rateLimitMax, timeWindow: '1 minute' });
await registerHealthRoutes(app);
await registerStylingRoutes(app, config);

await app.listen({ port: config.apiPort, host: '0.0.0.0' });
