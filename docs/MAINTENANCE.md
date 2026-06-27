# Maintenance

Maintenance work is part of the product, not cleanup after launch.

## Debt categories

- Product debt: unclear user flow, weak copy, or extra steps.
- Technical debt: duplicated logic, weak types, missing tests, or brittle adapters.
- Security debt: loose permissions, exposed secrets, unsafe logging, or unreviewed dependencies.
- Data debt: unclear ownership, missing deletion path, or unnecessary retention.
- Operations debt: missing health checks, unclear deploy path, or weak incident notes.

## Rules

- Every known debt item should have an owner, severity, and next action.
- High severity items block release.
- Medium severity items need an issue before release.
- Low severity items can be batched.
- Security and privacy debt always outrank visual polish.

## Release review

Before a public release, check:

- CI passed.
- CodeQL passed.
- Dependency audit passed.
- API smoke test passed.
- Environment variables are documented.
- No secrets or user data are in git.
- Logs do not include voice, private images, provider keys, or live location trails.
- OpenAPI file matches the live routes.
