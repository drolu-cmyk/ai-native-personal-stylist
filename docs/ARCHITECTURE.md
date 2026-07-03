# Architecture

The app helps a person choose what to wear from clothes they already own.

## Main loop

1. The user gives the plan.
2. The app reads the closet.
3. The app checks weather and place context when allowed.
4. The app returns one outfit and one backup.
5. The user accepts it or asks for another mix.

## Services

- Voice input and voice output sit behind provider adapters.
- Maps and place context sit behind provider adapters.
- Weather sits behind a provider adapter.
- The outfit service only returns saved closet item IDs.
- User response is saved for future outfit choices.

## Public release path

- `/voice`: outfit request and response.
- `/closet`: saved clothes.
- `/how-it-works`: short explanation.
- `/intelligence`: closet gaps and patterns.

## Rules

- Do not invent clothes.
- Do not expose provider details in the user experience.
- Do not store live location trails in git or logs.
- Keep voice answers short.
- Keep the web app simple and quiet.
