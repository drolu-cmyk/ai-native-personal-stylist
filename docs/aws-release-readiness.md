# AWS release readiness

This repo is ready for an AWS release only after the code checks pass and production configuration is present outside git.

## Current safe path

Use the existing Dockerfile as the deployable API artifact. Keep provider mode set to `mock` until live provider credentials, privacy review, and user data handling are approved.

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

Provider credentials must stay in AWS Secrets Manager, Parameter Store, or the runtime platform secret store. Do not commit credentials, service account JSON, user wardrobe images, voice samples, billing data, or live location trails.

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
- CORS uses production origins, not wildcards.
- No private user data exists in the repository.
- The rollback path is known before deploy.

## Suggested AWS target

For the first safe release, use a small container runtime such as ECS Fargate behind an HTTPS load balancer, or AWS App Runner if the project should avoid managing cluster capacity. The web app can be released separately after its public URL and API origin are final.
