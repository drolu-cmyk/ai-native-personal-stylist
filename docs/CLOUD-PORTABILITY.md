# Cloud Portability

The application must stay portable by depending on standard containers, HTTP APIs, and provider adapters.

## Initial targets

- Google Cloud Run for the API container.
- AWS App Runner or ECS Fargate as the matching AWS path.
- Secret Manager equivalents for provider credentials.
- Artifact registries for container images.

## Rule

Product logic must not depend directly on one cloud SDK. Use adapters and interfaces so provider changes are operational decisions, not rewrites.
