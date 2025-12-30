# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared /shared
WORKDIR /shared
COPY shared/package*.json shared/yarn.lock* ./
RUN yarn install

# Copy backend package files
WORKDIR /app
COPY apps/backend/package*.json apps/backend/yarn.lock* ./
COPY apps/backend/tsconfig.json ./

# Install dependencies
RUN yarn install

# Copy backend source code
COPY apps/backend .

# Build TypeScript
RUN yarn build

# Prune dev dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy shared package from builder
COPY --from=builder /shared /shared

# Copy package files and node_modules from builder
COPY apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8000

# Start server
CMD ["node", "dist/server.js"]
