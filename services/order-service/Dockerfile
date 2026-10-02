# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY services/order-service/package*.json ./services/order-service/
COPY services/order-service/tsconfig.json ./services/order-service/

# Install all dependencies (including dev, for tsc)
RUN npm install

# Copy shared sources and build it
COPY packages/shared/src ./packages/shared/src
RUN npm run build --workspace=@shared/utils

# Copy service sources and build it
COPY services/order-service/src ./services/order-service/src
RUN npm run build --workspace=order-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/order-service/package*.json ./services/order-service/

RUN npm install --omit=dev --workspace=@shared/utils --workspace=order-service

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist

WORKDIR /app/services/order-service

# Create logs directory
RUN mkdir -p /app/services/order-service/logs && chown -R node:node /app/services/order-service/logs

EXPOSE 3003

USER node

CMD ["node", "dist/index.js"]
