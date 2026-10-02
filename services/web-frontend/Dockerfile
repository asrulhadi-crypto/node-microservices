# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY services/web-frontend/package*.json ./services/web-frontend/
COPY services/web-frontend/tsconfig.json ./services/web-frontend/

# Install all dependencies (including dev, for tsc)
RUN npm install

# Copy shared sources and build it
COPY packages/shared/src ./packages/shared/src
RUN npm run build --workspace=@shared/utils

# Copy service sources and build it
COPY services/web-frontend/src ./services/web-frontend/src
RUN npm run build --workspace=web-frontend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/web-frontend/package*.json ./services/web-frontend/

RUN npm install --omit=dev --workspace=@shared/utils --workspace=web-frontend

# Copy built files from builder (server + static assets)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/web-frontend/dist ./services/web-frontend/dist
COPY services/web-frontend/src/public ./services/web-frontend/dist/public

WORKDIR /app/services/web-frontend

# Create logs directory
RUN mkdir -p /app/services/web-frontend/logs && chown -R node:node /app/services/web-frontend/logs

EXPOSE 8080

USER node

CMD ["node", "dist/index.js"]
