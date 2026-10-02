# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY services/product-service/package*.json ./services/product-service/
COPY services/product-service/tsconfig.json ./services/product-service/

# Install all dependencies (including dev, for tsc)
RUN npm install

# Copy shared sources and build it
COPY packages/shared/src ./packages/shared/src
RUN npm run build --workspace=@shared/utils

# Copy service sources and build it
COPY services/product-service/src ./services/product-service/src
RUN npm run build --workspace=product-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/product-service/package*.json ./services/product-service/

RUN npm install --omit=dev --workspace=@shared/utils --workspace=product-service

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/product-service/dist ./services/product-service/dist

WORKDIR /app/services/product-service

# Create logs directory
RUN mkdir -p /app/services/product-service/logs && chown -R node:node /app/services/product-service/logs

EXPOSE 3002

USER node

CMD ["node", "dist/index.js"]
