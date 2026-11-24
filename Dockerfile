# Build: prerender every page, Markdown copy, OG image and the nginx header snippet.
FROM node:26-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Serve: unprivileged nginx (uid 101) on port 8080 with static files only.
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:56b8272e43a0525f67aed68d1e0794a712d10e3e45a563e118e9a77c817e6f86
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist-nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
