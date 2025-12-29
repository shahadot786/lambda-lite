FROM node:20-alpine

WORKDIR /app

# Install minimal dependencies
RUN apk add --no-cache tini

# Copy runner script
COPY runner.js /app/runner.js

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Run the runner script
CMD ["node", "/app/runner.js"]
