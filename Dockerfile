# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production API_PORT=4000
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs stylist
COPY --from=build --chown=stylist:nodejs /app /app
USER stylist
EXPOSE 4000
CMD ["pnpm", "--filter", "@stylist/api", "start"]
