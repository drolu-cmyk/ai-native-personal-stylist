# Personal Stylist App

A voice-first web app that helps someone choose what to wear from clothes they already own.

The app combines a saved closet, weather, occasion, fit preferences, and user response. The result is a clear outfit, not a shopping feed or a style essay.

## Apps and packages

- `apps/web`: Next.js web app.
- `apps/api`: Fastify API.
- `packages/shared`: TypeScript types for profiles, closet items, voice requests, outfits, and feedback.
- `docs`: product, security, and shipping notes.

## Current app flow

1. Open the web app.
2. Go to `/voice`.
3. Enter a request such as `I need dinner clothes and it might rain.`
4. The web app loads the saved closet.
5. The API returns an outfit made from saved item IDs.
6. The user can choose `This works` or `Try another mix`.

## API routes

- `GET /health`
- `GET /api/closet?userId=user_alpha`
- `POST /api/voice-recommend`
- `POST /api/autonomous-recommend`
- `POST /api/recommendation-feedback`
- `POST /style/recommend`

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm validate:env
pnpm typecheck
pnpm build
pnpm smoke:api
```

## Product rules

- Use saved closet items only.
- Keep voice answers short.
- Keep location use consented and narrow.
- Keep shopping separate from the outfit decision until the user asks.

## License

MIT. See `LICENSE.txt`.
