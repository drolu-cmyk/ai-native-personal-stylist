# Shipping

This app is prepared for the next release gate. The first live version should be a restricted beta using real providers and controlled test data.

## Release path

1. Web app: ship the outfit request flow.
2. API: keep closet, outfit, and user response routes live.
3. Voice: use a provider adapter. Prefer Google voice for the public voice path.
4. Location: use a provider adapter. Prefer Google Maps for places, routes, and destination context.
5. Data: keep closet, images, feedback, and location access behind clear consent.

Mock providers are not a production fallback. Use mock mode only for local development, tests, CI, and demo or sandbox mode.

## Voice

Voice answers should be short and useful.

Example: Wear the white oxford, charcoal trouser, black loafers, and rain shell. It fits dinner, the rain, and the walk.

## Location and maps

Location is used only when allowed by the user.

Useful signals include destination weather, walking distance, transit time, indoor or outdoor venue, rain, snow, heat, wind, and humidity.

Google Maps should be the preferred production path for places, routes, geocoding, and destination context. AWS Location can remain an adapter option.

## Restricted live beta

Before live traffic, configure real provider secrets outside git, run main-branch CI, CodeQL, AWS Release Preflight, API smoke test, dependency audit, and Docker release build. Do not allow real wardrobe images, voice input, billing, or location data until privacy, consent, storage, deletion, and logging controls are safe.

## Olu AI Skills

The Olu AI Skills repo supports product education and launch assets: walkthroughs, onboarding clips, outfit flow diagrams, release note videos, and help-center visuals.
