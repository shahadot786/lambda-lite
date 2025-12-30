# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared /shared
WORKDIR /shared
COPY shared/package*.json shared/yarn.lock* ./
RUN yarn install

# Copy worker package files
WORKDIR /app
COPY apps/worker/package*.json apps/worker/yarn.lock* ./
COPY apps/worker/tsconfig.json ./

# Install dependencies
RUN yarn install

# Copy worker source code
COPY apps/worker .

# Build TypeScript
RUN yarn build

# Prune dev dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Docker CLI for Docker-in-Docker
RUN apk add --no-cache docker-cli

# Copy shared package from builder
COPY --from=builder /shared /shared

# Copy package files and node_modules from builder
COPY apps/worker/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Start worker
CMD ["node", "dist/index.js"]
