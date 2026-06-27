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
