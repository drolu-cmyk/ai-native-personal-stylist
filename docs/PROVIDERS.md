# Providers

The app should not depend on one cloud provider. Production providers sit behind adapters.

## Preferred public path

- Voice: Google voice provider for public voice quality.
- Maps: Google Maps for places, routes, geocoding, and destination context.
- Weather: provider adapter selected by coverage and cost.
- Model: provider adapter selected by latency, quality, and price.

## AWS path

AWS remains useful for hosting, storage, database, auth, jobs, and edge delivery.

Use AWS for:

- web hosting
- API hosting
- data storage
- image storage
- auth
- logs
- deployment

## Product rule

The user experience should stay the same if the provider changes. Provider code should not leak into the web app copy or the outfit result.

## Production rule

Production must use real providers. Mock mode is allowed only for local development, tests, CI, and demo or sandbox mode.

Required production provider categories:

- AI provider: `AI_PROVIDER`
- Speech-to-text provider: `VOICE_STT_PROVIDER`
- Text-to-speech provider: `VOICE_TTS_PROVIDER`
- Vision/image handling provider: `VISION_PROVIDER`
- Weather provider: `WEATHER_PROVIDER`
- Maps/location provider: `MAPS_PROVIDER`
- Auth provider: `AUTH_PROVIDER`
- Database/storage provider: `DATABASE_PROVIDER`
- Image/object storage provider: `OBJECT_STORAGE_PROVIDER`
- Logging/observability provider: `OBSERVABILITY_PROVIDER`
- Hosting/runtime provider: `HOSTING_PROVIDER`

Set explicit provider names through environment variables. Keep keys, tokens, JSON credentials, images, audio, billing data, and live location trails outside git.
