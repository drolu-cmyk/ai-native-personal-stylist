# Contributing

Thank you for helping improve the personal stylist app.

## Development

Use mock providers by default. Do not add real provider keys, user images, voice recordings, billing data, or live location trails to git.

```bash
pnpm install
cp .env.example .env.local
pnpm validate:env
pnpm typecheck
pnpm build
pnpm smoke:api
```

## Pull requests

Keep changes small and reviewable. Include the user flow affected, the API route affected, and the checks you ran.

## Product rules

- Keep the user-facing language plain.
- Recommend saved closet items only.
- Keep provider logic behind adapters.
- Treat voice, images, location, and calendar data as sensitive.
- Keep shopping separate from the core outfit decision until the user asks.
