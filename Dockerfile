FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /opt/job-portal-api
COPY tsconfig.json package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY src src
RUN pnpm build

FROM base
COPY --from=prod-deps /opt/job-portal-api/node_modules /opt/job-portal-api/node_modules
COPY --from=build /opt/job-portal-api/dist /opt/job-portal-api/dist
COPY openapi.yaml .

EXPOSE 8000
CMD [ "pnpm", "start" ]
