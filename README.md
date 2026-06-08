# AI Native Personal Stylist

Voice-first, AI-native personal styling application built in public with a security-first engineering model.

The app helps users decide what to wear by combining voice input, camera context, color theory, fit, height, weather, occasion, cultural context, and style intent.

## Architecture

- `apps/web`: Next.js user interface.
- `apps/api`: Node.js API and provider adapters.
- `packages/shared`: shared TypeScript contracts.
- `docs`: security, portability, approval gates, and startup-credit strategy.

All provider-specific services must sit behind adapters so the application remains portable across Google Cloud, AWS, and any OCI container platform.

## Security model

This repository is public. Public code is allowed. Private operational assets are not allowed in git.

Never commit credentials, billing data, service account files, private deployment tokens, user wardrobe images, voice recordings, or production configuration values.

Outside contributors should work through forks and pull requests. Direct commits to `main` should be disabled after the first bootstrap commit.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm validate:env
pnpm dev
```

The default provider mode is `mock`, so contributors can run the system without paid services.

## Docker

```bash
docker compose up --build
```

The API container is designed for Google Cloud Run, AWS App Runner, ECS, Kubernetes, Render, Fly.io, or any platform that accepts OCI images.

## Automation

The repository includes CI, CodeQL, Dependabot, environment validation, and documentation for hardening GitHub settings. Human approval is still required for billing, cloud credits, production credentials, maintainer access, and collection of real user data.
