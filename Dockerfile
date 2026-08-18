# Stage 1: Build
FROM oven/bun:1.3.11 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Opt-in QA annotation overlay: inlined at build time by Astro, so it must be
# present as an env var during `bun run build`, and again at runtime for the
# /api/prototype-feedback route.
ARG ANNOTATION_SYSTEM=""
ENV ANNOTATION_SYSTEM=${ANNOTATION_SYSTEM}

COPY . .
RUN bun run build

# Stage 2: Runtime
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ARG ANNOTATION_SYSTEM=""
ENV ANNOTATION_SYSTEM=${ANNOTATION_SYSTEM}

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
