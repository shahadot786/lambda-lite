# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json apps/frontend/yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy source code
COPY apps/frontend .

# Build app
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
