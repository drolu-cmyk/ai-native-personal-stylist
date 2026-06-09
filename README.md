# AI-Native Personal Stylist

Voice-first, AI-native personal styling application built in public with a security-first engineering model.

The app helps users decide what to wear by combining fast voice input, private closet inventory, color and fit constraints, weather, occasion, cultural context, and style intent.

## Architecture

- `apps/web`: Next.js user interface.
- `apps/api`: portable API service using standard Web `Request`/`Response` handlers behind a Fastify adapter.
- `packages/shared`: shared TypeScript contracts for user profiles, closet inventory, voice context, and strict recommendation payloads.
- `docs`: security, portability, human approval gates, and shippable development plan.

All provider-specific services must sit behind adapters so the application remains portable across container platforms.

## Product moat

General assistants can produce generic fashion text. This platform is designed around three narrower advantages:

- Private persistent inventory: recommendations must reference existing `ClothingItem` IDs from the user's own closet.
- Four-second voice loops: `/api/voice-recommend` accepts a compact `VoiceUtteranceContext` and returns a text-to-speech-ready payload.
- Proactive agent loops: `generateAutonomousRecommendation(userId)` simulates background preparation from weather, calendar, destination, and closet context.

## Current MVP API

- `GET /health`: service health check.
- `POST /api/voice-recommend`: low-latency voice micro-interaction route.
- `POST /api/autonomous-recommend`: mock proactive background recommendation route.
- `POST /style/recommend`: backward-compatible legacy placeholder.

Provider behavior is mock-only for now. The foundation does not call external AI, speech, vision, weather, calendar, e-commerce, map, or transit providers.

## Security model

This repository is public. Public code is allowed. Private operational assets are not allowed in git.

Never commit credentials, billing data, service account files, private deployment tokens, user wardrobe images, voice recordings, precise live location trails, or production configuration values.

Outside contributors should work through forks and pull requests. Direct commits to `main` should be disabled after the first bootstrap commit.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm validate:env
pnpm dev
```

The default provider mode is `mock`, so contributors can run the system without paid services.

## API examples

```bash
curl -X POST http://localhost:4000/api/voice-recommend \
  -H "content-type: application/json" \
  -d '{
    "userId": "user_alpha",
    "transcript": "I need dinner clothes and it might rain.",
    "capturedAt": "2026-06-08T18:00:00.000Z",
    "locale": "en-US",
    "urgency": "immediate",
    "latencyBudgetMs": 4000,
    "ambient": {
      "timeOfDay": "evening",
      "weather": { "condition": "rain", "temperatureC": 16, "precipitationChance": 0.7 },
      "calendarEvent": {
        "title": "Dinner reservation",
        "startsAt": "2026-06-08T18:20:00.000Z",
        "formalityHint": "business"
      }
    }
  }'
```

Example response shape:

```json
{
  "recommendationId": "rec_...",
  "userId": "user_alpha",
  "source": "voice-loop",
  "providerMode": "mock",
  "confidence": 0.93,
  "outfit": [
    { "slot": "top", "itemId": "item_white_oxford", "reasonCode": "calendar-context", "confidence": 0.95 }
  ],
  "fallbackAlternatives": [
    { "slot": "top", "itemId": "item_navy_merino_tee", "reasonCode": "fallback", "confidence": 0.95 }
  ],
  "cautions": ["Rain context applied; prioritize water-resistant items already present in the closet."],
  "orchestrationReason": "Inventory-bound agent selected existing closet items.",
  "ttsSummary": "Wear White oxford shirt.",
  "constraintsApplied": ["Only existing DigitalCloset item IDs may be recommended."],
  "rejectedItemIds": []
}
```

The human-readable fields support speech and demos, but primary outfit slots are always structured references to existing `item_...` closet IDs. This is the core guardrail against hallucinated wardrobe advice.

## Docker

```bash
docker compose up --build
```

The API container is designed for any platform that accepts OCI images.

## Automation

The repository includes CI, CodeQL, Dependabot, environment validation, and documentation for hardening GitHub settings. Human approval is still required for production credentials, maintainer access, paid service activation, and collection of real user data.
