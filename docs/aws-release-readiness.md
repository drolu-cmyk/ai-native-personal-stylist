# AWS release readiness

This repo is ready for an AWS release only after the code checks pass and production configuration is present outside git.

## Current safe path

Use the outfit-flow foundation for local demos and CI only. Production release readiness now requires explicit real provider names and fails if any required provider remains unset or `mock`.

## Required GitHub configuration

For the automatic main-branch preflight, set these as GitHub repository variables or secrets before merge:

- `AWS_ROLE_TO_ASSUME`: GitHub OIDC role with least privilege for ECR and the target runtime.
- `AWS_REGION`: AWS region for ECR and runtime resources.
- `ECR_REPOSITORY`: ECR repository name for the API image.
- `PUBLIC_WEB_URL`: production web origin.
- `API_BASE_URL`: production API origin.
- `CORS_ORIGINS`: allowed production origins.
- `RATE_LIMIT_MAX`: production request limit.
- `MAX_IMAGE_UPLOAD_MB`: upload cap.
- `AI_PROVIDER`: production AI provider.
- `VOICE_STT_PROVIDER`: production speech-to-text provider.
- `VOICE_TTS_PROVIDER`: production text-to-speech provider.
- `VISION_PROVIDER`: production vision/image handling provider.
- `WEATHER_PROVIDER`: production weather provider.
- `MAPS_PROVIDER`: production maps/location provider.
- `AUTH_PROVIDER`: production auth provider.
- `DATABASE_PROVIDER`: production database/storage provider.
- `OBJECT_STORAGE_PROVIDER`: production image/object storage provider.
- `OBSERVABILITY_PROVIDER`: production logging/observability provider.
- `HOSTING_PROVIDER`: production hosting/runtime provider.
- `STORAGE_DELETION_PRIVACY_READINESS_ACK`: set to `true` only after storage, deletion, privacy, consent, and logging readiness are reviewed.

Provider credentials must stay in AWS Secrets Manager, Parameter Store, GitHub secrets, or the runtime platform secret store. Do not commit credentials, service account JSON, user wardrobe images, voice samples, billing data, or live location trails.

## Automatic preflight

The `AWS Release Preflight` workflow runs automatically on pushes to `main` and can also be started manually. It does not deploy live traffic. It verifies release configuration, validates production env, assumes the configured AWS OIDC role, verifies the ECR target exists, runs typecheck/build/smoke/audit, and builds the Docker image.

Run these checks locally before deployment:

```bash
pnpm install --frozen-lockfile
pnpm validate:env --mode=production
pnpm aws:preflight
pnpm typecheck
pnpm build
pnpm smoke:api
pnpm audit --audit-level moderate
docker build -t personal-stylist-api:release .
```

## Human release gate

Do not deploy live unless all of the following are true:

- CI and CodeQL pass on the release commit.
- The branch is mergeable.
- Production secrets and variables are configured outside git.
- The automatic AWS preflight passes on `main`.
- Provider modes are intentionally selected.
- No production provider is unset or `mock`.
- CORS uses production origins, not wildcards.
- `PUBLIC_WEB_URL` and `API_BASE_URL` are valid HTTPS URLs.
- Storage, deletion, privacy, consent, and logging readiness are acknowledged in configuration and release notes.
- No private user data exists in the repository.
- The rollback path is known before deploy.

## Release sequence

1. Merge the outfit-flow foundation only.
2. Merge the production-readiness change that rejects production mock providers.
3. Configure provider secrets in AWS, GitHub, and runtime secret stores.
4. Run main-branch CI, CodeQL, AWS Release Preflight, API smoke test, dependency audit, and Docker release build.
5. Deploy a restricted live beta using real providers and controlled test data.
6. Allow real wardrobe images, voice input, billing, or location data only after privacy, consent, storage, deletion, and logging controls are safe.

## Suggested AWS target

For the first safe release, use a small container runtime such as ECS Fargate behind an HTTPS load balancer, or AWS App Runner if the project should avoid managing cluster capacity. The web app can be released separately after its public URL and API origin are final.
