# Cloud Portability

The application must stay portable by depending on standard containers, HTTP APIs, and provider adapters.

## Runtime targets

- Any OCI-compatible API container runtime.
- Managed secret storage for provider credentials.
- A container image registry controlled by the project owner.
- HTTP event sources for voice requests, scheduled agent loops, and future integration callbacks.

## Rule

Product logic must not depend directly on one cloud SDK. Use adapters and interfaces so provider changes are operational decisions, not rewrites.
