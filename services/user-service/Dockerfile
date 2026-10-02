# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY services/user-service/package*.json ./services/user-service/
COPY services/user-service/tsconfig.json ./services/user-service/

# Install all dependencies (including dev, for tsc)
RUN npm install

# Copy shared sources and build it
COPY packages/shared/src ./packages/shared/src
RUN npm run build --workspace=@shared/utils

# Copy service sources and build it
COPY services/user-service/src ./services/user-service/src
RUN npm run build --workspace=user-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/user-service/package*.json ./services/user-service/

RUN npm install --omit=dev --workspace=@shared/utils --workspace=user-service

# Copy built files from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/user-service/dist ./services/user-service/dist

WORKDIR /app/services/user-service

# Create logs directory
RUN mkdir -p /app/services/user-service/logs && chown -R node:node /app/services/user-service/logs

EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
