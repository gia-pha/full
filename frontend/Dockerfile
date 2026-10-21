FROM node:26-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
# Baked into the bundle at build time (vite): point at the real auth
# service (live mode) or at the pact stub server (demo mode).
ARG VITE_AUTH_BACKEND_URL=http://localhost:8080
ENV VITE_AUTH_BACKEND_URL=${VITE_AUTH_BACKEND_URL}
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
