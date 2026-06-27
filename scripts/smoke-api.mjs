#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const apiPort = Number(process.env.API_PORT || 4100);
const baseUrl = `http://127.0.0.1:${apiPort}`;
const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'test',
  APP_ENV: process.env.APP_ENV || 'smoke',
  API_PORT: String(apiPort),
  PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME || 'AI Native Personal Stylist',
  PUBLIC_WEB_URL: process.env.PUBLIC_WEB_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || baseUrl,
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  VOICE_STT_PROVIDER: process.env.VOICE_STT_PROVIDER || 'mock',
  VOICE_TTS_PROVIDER: process.env.VOICE_TTS_PROVIDER || 'mock',
  VISION_PROVIDER: process.env.VISION_PROVIDER || 'mock',
  WEATHER_PROVIDER: process.env.WEATHER_PROVIDER || 'mock',
  MAPS_PROVIDER: process.env.MAPS_PROVIDER || 'mock',
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '100',
  MAX_IMAGE_UPLOAD_MB: process.env.MAX_IMAGE_UPLOAD_MB || '8'
};

const server = spawn(process.execPath, ['apps/api/dist/index.js'], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

const mockClosetSource = await readFile('apps/api/src/data/mockCloset.ts', 'utf8');
const validClosetItemIds = new Set([...mockClosetSource.matchAll(/id: '(item_[^']+)'/g)].map((match) => match[1]));

let output = '';
server.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

function fail(message) {
  server.kill();
  console.error(message);
  if (output.trim()) console.error(output.trim());
  process.exit(1);
}

async function waitForHealth() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  fail('API smoke test failed: /health did not become ready.');
}

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) fail(`API smoke test failed: ${path} returned ${response.status}.`);
  return response.json();
}

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) fail(`API smoke test failed: ${path} returned ${response.status}.`);
  return response.json();
}

function assertInventoryBound(payload, source) {
  if (payload.source !== source) fail(`Expected source ${source}, received ${payload.source}.`);
  if (!Array.isArray(payload.outfit) || payload.outfit.length === 0) fail(`${source} returned no outfit slots.`);

  for (const slot of [...payload.outfit, ...(payload.fallbackAlternatives || [])]) {
    if (typeof slot.itemId !== 'string' || !slot.itemId.startsWith('item_')) {
      fail(`${source} returned a non-inventory item reference: ${JSON.stringify(slot)}.`);
    }
    if (!validClosetItemIds.has(slot.itemId)) {
      fail(`${source} returned an item ID that is not present in the mock closet: ${slot.itemId}.`);
    }
  }

  if (typeof payload.ttsSummary !== 'string' || payload.ttsSummary.length === 0) {
    fail(`${source} did not return a text-to-speech summary.`);
  }

  if (payload.providerMode !== 'mock') fail(`${source} should remain mock-only for this foundation.`);
  if (typeof payload.confidence !== 'number' || payload.confidence <= 0) fail(`${source} did not return confidence.`);
  if (!Array.isArray(payload.cautions)) fail(`${source} did not return cautions.`);
}

try {
  await waitForHealth();

  const closetPayload = await getJson('/api/closet?userId=user_alpha');
  if (!Array.isArray(closetPayload.closet?.items) || closetPayload.closet.items.length === 0) {
    fail('Closet endpoint returned no items.');
  }

  const voicePayload = await postJson('/api/voice-recommend', {
    userId: 'user_alpha',
    transcript: 'I need dinner clothes and it might rain.',
    capturedAt: '2026-06-08T18:00:00.000Z',
    locale: 'en-US',
    urgency: 'immediate',
    latencyBudgetMs: 4000,
    ambient: {
      timeOfDay: 'evening',
      weather: { condition: 'rain', temperatureC: 16, precipitationChance: 0.7 },
      calendarEvent: {
        title: 'Dinner reservation',
        startsAt: '2026-06-08T18:20:00.000Z',
        formalityHint: 'business'
      }
    }
  });

  const autonomousPayload = await postJson('/api/autonomous-recommend', { userId: 'user_alpha' });

  assertInventoryBound(voicePayload, 'voice-loop');
  assertInventoryBound(autonomousPayload, 'autonomous-agent');

  const feedbackPayload = await postJson('/api/recommendation-feedback', {
    recommendationId: voicePayload.recommendationId,
    userId: 'user_alpha',
    accepted: true,
    reason: 'accepted'
  });
  if (feedbackPayload.ok !== true) fail('Feedback endpoint did not acknowledge the response.');

  console.log('API smoke test passed: closet, voice, autonomous, and feedback routes work.');
} finally {
  server.kill();
}
