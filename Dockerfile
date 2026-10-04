# Targets: `web` serves the built game as static files, `e2e` runs Playwright against it.
ARG NODE_VERSION=24
# Must match the @playwright/test version in package.json; scripts/test-e2e.sh passes it in.
ARG PLAYWRIGHT_VERSION=1.63.0

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY tools ./tools
RUN npm run build

FROM nginx:1.30-alpine AS web
COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.html
HEALTHCHECK --interval=2s --timeout=2s --retries=15 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble AS e2e
WORKDIR /work
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY tests/e2e ./tests/e2e
COPY tests/postdeploy ./tests/postdeploy
COPY --from=build /app/dist/index.html ./dist/index.html
ENTRYPOINT ["npx", "playwright", "test", "--config", "tests/e2e/playwright.config.js"]
