# Development Plan

Every milestone below must end with a shippable artifact, a testable acceptance check, and a visual demo path suitable for a short public progress clip.

## Milestone 1: Inventory-Bound Voice Recommendation

Goal: Prove the moat by returning only closet-backed item IDs from a four-second voice request.

Build:
- Shared `UserProfile`, `DigitalCloset`, `VoiceUtteranceContext`, and `StyleRecommendationPayload` contracts.
- `POST /api/voice-recommend` with deterministic mock closet retrieval.
- Guardrails that reject recommendations referencing item IDs outside the user's closet.

Acceptance:
- `pnpm typecheck` passes.
- A sample voice request returns `item_...` IDs and no generic clothing names in the structured outfit slots.

Demo:
- Record a terminal or browser click-through showing a voice prompt payload and instant TTS-ready response.

## Milestone 2: Proactive Agent Loop

Goal: Show background styling intelligence that prepares an outfit before the user asks.

Build:
- `generateAutonomousRecommendation(userId)` with mocked weather, calendar, destination, and closet state.
- `POST /api/autonomous-recommend` route for local testing.
- Event payload shape that can later be triggered by schedulers, calendar webhooks, or queue messages.

Acceptance:
- The agent response includes `source: "autonomous-agent"`.
- The recommendation references only closet item IDs.

Demo:
- Record a before-event scenario: "rainy dinner in 20 minutes" generating a complete outfit.

## Milestone 3: Closet Management UI

Goal: Make the private inventory visible and demo-ready.

Build:
- A web page that lists closet items with color swatches, categories, tags, fit ratings, and availability.
- A local mock edit flow for marking an item unavailable.

Acceptance:
- Users can see exactly why the agent can only recommend owned items.
- Changing availability changes the next recommendation.

Demo:
- Click-through: mark shoes unavailable, request a recommendation, show fallback selection.

## Milestone 4: Voice Micro-Interaction Prototype

Goal: Reduce the styling loop to a low-friction interaction pattern.

Build:
- Browser microphone capture behind explicit user action.
- Mock speech-to-text adapter by default.
- Response panel optimized for immediate text-to-speech playback.

Acceptance:
- A user can trigger, submit, and receive a recommendation in one short flow.
- No raw voice recordings are stored.

Demo:
- Short screen recording of the closet-to-recommendation loop.

## Milestone 5: Visual Recognition Adapter Boundary

Goal: Prepare camera-based recognition without locking the product to one provider.

Build:
- `VisionProvider` interface.
- Mock item recognition response mapped to existing `ClothingItem` candidates.
- Human confirmation gate before adding or changing closet inventory.

Acceptance:
- Visual recognition suggestions cannot directly mutate the closet.
- Suggested matches must map to existing items or request user confirmation for a new item.

Demo:
- Click-through showing a camera-derived suggestion and human approval gate.

## Milestone 6: Context Integrations

Goal: Add real-world context without turning the product into a generic assistant.

Build:
- Weather adapter.
- Calendar context adapter.
- Transit and destination metadata interfaces kept provider-neutral.

Acceptance:
- Styling logic receives normalized context, not provider SDK objects.
- Disabling any provider leaves mock mode functional.

Demo:
- Scenario clip: upcoming event, rain, travel ETA, and closet constraints produce one outfit.

## Milestone 7: Security and Privacy Readiness

Goal: Prepare for real user data responsibly.

Build:
- Data retention policy.
- Explicit consent surfaces for images, voice, sizing, location, and wardrobe data.
- Secret scanning, dependency checks, and security review workflow.

Acceptance:
- Production data collection cannot be enabled without documented human approval.
- Environment validation blocks missing required runtime configuration.

Demo:
- Walkthrough of privacy gates and local-only mock mode.

## Out of Scope for This Foundation

- Real AI provider integration.
- Production data storage.
- Real calendar, weather, e-commerce, map, transit, or delivery integrations.
- Storage of real images, videos, or voice recordings.
- Production deployment, billing, or paid provider activation.
- Collection of production customer data.

## Public Demo Strategy

- Use mock closet data only.
- Show structured `item_...` recommendations instead of generic fashion prose.
- Record short clips around one shippable behavior at a time: voice request, autonomous rainy-dinner recommendation, closet availability change, and privacy gate walkthrough.
- Keep provider, funding, credential, and production operations strategy out of public demo materials.
