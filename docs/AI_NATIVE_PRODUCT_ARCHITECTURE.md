# AI Native Product Architecture

The product is a voice-first personal styling agent. It should recommend outfits from the user's real closet, explain the reason, and learn from approval or rejection.

## Core loop

Capture -> Interpret -> Retrieve -> Constrain -> Recommend -> Explain -> Approve -> Learn

## Agents

1. Voice Intent Agent: turns a normal request into occasion, formality, urgency, weather concern, and constraints.
2. Closet Understanding Agent: keeps inventory metadata usable for decisions.
3. Outfit Planning Agent: selects inventory-bound outfit candidates.
4. Constraint Guardrail Agent: blocks unavailable items, excluded tags, and item IDs outside the closet.
5. Explanation Agent: returns a short speech-ready reason for the outfit.
6. Feedback Learning Agent: records acceptance, rejection, swaps, and reasons.
7. Wardrobe Gap Agent: finds coverage gaps across weather, formality, season, comfort, and occasion.

## Product surfaces

- `/voice`: fast request-to-outfit loop.
- `/closet`: inventory and trust layer.
- `/how-it-works`: agent flow explanation.
- `/wardrobe-intelligence`: coverage, gaps, and readiness.
- `/recommendation/[id]`: recommendation record.

## Success standard

The app is AI-native when voice requests work without prompt engineering, every outfit slot references a real `item_...` ID, the recommendation explains the moment, feedback changes future behavior, and providers remain behind adapters.
