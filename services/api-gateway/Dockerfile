# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY services/api-gateway/tsconfig.json ./services/api-gateway/

# Install all dependencies (including dev, for tsc)
RUN npm install

# Copy shared sources and build it
COPY packages/shared/src ./packages/shared/src
RUN npm run build --workspace=@shared/utils

# Copy service sources and build it
COPY services/api-gateway/src ./services/api-gateway/src
RUN npm run build --workspace=api-gateway

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm install --omit=dev --workspace=@shared/utils --workspace=api-gateway

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway

# Create logs directory (other services already do this; gateway was missing it)
RUN mkdir -p /app/services/api-gateway/logs && chown -R node:node /app/services/api-gateway/logs

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
