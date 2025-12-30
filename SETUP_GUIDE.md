# Lambda-Lite Setup Guide

Complete guide for setting up and running the Lambda-Lite distributed task executor system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Docker Setup](#docker-setup)
5. [Running Services](#running-services)
6. [Testing the System](#testing-the-system)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v9 or higher)
- **Docker** (v24 or higher)
- **Docker Compose** (v2.20 or higher)
- **MongoDB** (v7 or higher) - Can run via Docker
- **Redis** (v7 or higher) - Can run via Docker

### Verify Installation

```bash
node --version    # Should be v20+
npm --version     # Should be v9+
docker --version  # Should be v24+
docker compose version  # Should be v2.20+
```

---

## Project Structure

```
lambda-lite/
├── apps/
│   ├── backend/          # Express API server
│   ├── frontend/         # React web UI
│   └── worker/           # BullMQ worker service
├── shared/               # Shared TypeScript types
├── docker/
│   └── sandbox/          # Docker sandbox for code execution
└── infra/                # Docker Compose configurations
```

---

## Environment Setup

### 1. Install Dependencies

Install dependencies for all services:

```bash
# Root directory
cd /Users/shahadot/Desktop/LocalApps/Monorepos/lambda-lite

# Install shared package dependencies
cd shared && npm install && cd ..

# Install backend dependencies
cd apps/backend && npm install && cd ../..

# Install worker dependencies
cd apps/worker && npm install && cd ../..

# Install frontend dependencies
cd apps/frontend && npm install && cd ../..
```

### 2. Configure Environment Variables

Create `.env` files for each service:

#### Backend (.env)
```bash
# apps/backend/.env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/lambda-lite
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Worker (.env)
```bash
# apps/worker/.env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lambda-lite
REDIS_HOST=localhost
REDIS_PORT=6379
SANDBOX_IMAGE=lambda-lite-sandbox:latest
```

#### Frontend (.env)
```bash
# apps/frontend/.env
VITE_API_URL=http://localhost:8000
```

---

## Docker Setup

### 1. Build the Sandbox Image

The sandbox image is critical for executing user code securely:

```bash
cd docker/sandbox
docker build -t lambda-lite-sandbox:latest .
cd ../..
```

Verify the image was built:

```bash
docker images | grep lambda-lite-sandbox
```

You should see:
```
lambda-lite-sandbox   latest   <image-id>   <size>
```

### 2. Test the Sandbox

Test the sandbox manually to ensure it works:

```bash
echo '{"code":"function main(a, b) { return a + b; }","args":[2,3]}' | \
  docker run --rm -i lambda-lite-sandbox:latest
```

Expected output:
```json
{"success":true,"result":5,"logs":"","executionTime":4.7}
```

### 3. Start Infrastructure Services

Use Docker Compose to start MongoDB and Redis:

```bash
cd infra
docker compose up -d mongodb redis
```

Verify services are running:

```bash
docker compose ps
```

You should see both `mongodb` and `redis` with status "Up".

---

## Running Services

You have two options: **Development Mode** (recommended for development) or **Production Mode** (using Docker).

### Option 1: Development Mode (Recommended)

Run each service in a separate terminal window:

#### Terminal 1: Backend API
```bash
cd apps/backend
npm run dev
```

Expected output:
```
Server running on port 8000
Connected to MongoDB
Connected to Redis
```

#### Terminal 2: Worker Service
```bash
cd apps/worker
npm run dev
```

Expected output:
```
Worker started
Connected to MongoDB
Connected to Redis
Listening for jobs on queue: jobs
```

#### Terminal 3: Frontend UI
```bash
cd apps/frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Option 2: Production Mode (Docker)

Build and run all services using Docker Compose:

```bash
cd infra
docker compose up --build
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 8000)
- Worker Service (2 replicas)
- Frontend UI (port 5173)
- Prometheus (port 9090)

---

## Testing the System

### 1. Check Service Health

#### Backend API
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-30T02:00:00.000Z"}
```

#### Frontend & Analytics
Open your browser and navigate to:
```
http://localhost:5173            # Main application
http://localhost:5173/analytics  # Real-time Stats dashboard
```

### 2. Submit a Test Job

#### Using cURL
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function main(a, b) { console.log(\"Adding\", a, \"and\", b); return a + b; }",
    "args": [2, 3]
  }'
```

Expected response:
```json
{
  "id": "...",
  "code": "function main(a, b) { ... }",
  "args": [2, 3],
  "status": "PENDING",
  "createdAt": "..."
}
```

#### Using the Frontend
1. Open http://localhost:5173
2. Enter your code in the editor
3. Provide arguments as JSON array: `[2, 3]`
4. Click "Submit Job"
5. View the job status and results

### 3. Check Job Status

Get the job ID from the submission response, then:

```bash
curl http://localhost:8000/api/jobs/<job-id>
```

Expected response (after execution):
```json
{
  "_id": "...",
  "code": "function main(a, b) { ... }",
  "args": [2, 3],
  "status": "COMPLETED",
  "result": 5,
  "logs": "Adding 2 and 3\n",
  "executionTime": 150,
  "createdAt": "...",
  "startedAt": "...",
  "completedAt": "..."
}
```

### 4. List All Jobs

```bash
curl http://localhost:8000/api/jobs
```

### 5. Monitor with Analytics & Prometheus

1.  **Dashboard**: Open `http://localhost:5173/analytics` to see the real-time visual dashboard.
2.  **Raw Metrics**: Open `http://localhost:9090` (Production Mode Only) to access Prometheus metrics directly.

---

## Troubleshooting

### Issue: Jobs Timing Out

**Symptoms**: Jobs show status `FAILED` with error `Execution timeout (30000ms)`

**Solutions**:
1. **Check Docker is running**:
   ```bash
   docker ps
   ```

2. **Verify sandbox image exists**:
   ```bash
   docker images | grep lambda-lite-sandbox
   ```
   If missing, rebuild it:
   ```bash
   cd docker/sandbox && docker build -t lambda-lite-sandbox:latest .
   ```

3. **Check worker logs**:
   ```bash
   # Development mode
   Check the terminal running the worker
   
   # Production mode
   docker logs lambda-lite-worker
   ```

4. **Test sandbox manually**:
   ```bash
   echo '{"code":"function main() { return 42; }","args":[]}' | \
     docker run --rm -i lambda-lite-sandbox:latest
   ```

### Issue: Cannot Connect to MongoDB

**Symptoms**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions**:
1. **Check MongoDB is running**:
   ```bash
   docker compose -f infra/docker-compose.yml ps mongodb
   ```

2. **Start MongoDB**:
   ```bash
   cd infra && docker compose up -d mongodb
   ```

3. **Check connection string** in `.env` files matches the running MongoDB instance

### Issue: Cannot Connect to Redis

**Symptoms**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solutions**:
1. **Check Redis is running**:
   ```bash
   docker compose -f infra/docker-compose.yml ps redis
   ```

2. **Start Redis**:
   ```bash
   cd infra && docker compose up -d redis
   ```

### Issue: Frontend Cannot Reach Backend

**Symptoms**: Network errors in browser console

**Solutions**:
1. **Verify backend is running** on port 8000:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Check CORS settings** in `apps/backend/src/server.ts`

3. **Verify VITE_API_URL** in `apps/frontend/.env`:
   ```bash
   VITE_API_URL=http://localhost:8000
   ```

### Issue: Worker Not Processing Jobs

**Symptoms**: Jobs stuck in `PENDING` status

**Solutions**:
1. **Check worker is running** and connected to Redis:
   ```bash
   # Check worker logs for "Listening for jobs on queue: jobs"
   ```

2. **Verify Redis connection**:
   ```bash
   docker exec -it lambda-lite-redis redis-cli PING
   # Should return: PONG
   ```

3. **Check BullMQ queue**:
   ```bash
   docker exec -it lambda-lite-redis redis-cli KEYS "bull:jobs:*"
   ```

### Issue: Docker Permission Denied

**Symptoms**: `permission denied while trying to connect to the Docker daemon socket`

**Solutions**:
1. **Add user to docker group** (Linux/Mac):
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Start Docker Desktop** (Mac/Windows)

3. **Check Docker socket permissions**:
   ```bash
   ls -la /var/run/docker.sock
   ```

---

## Quick Start Commands

### Start Everything (Development)
```bash
# Terminal 1: Infrastructure
cd infra && docker compose up -d mongodb redis

# Terminal 2: Backend
cd apps/backend && npm run dev

# Terminal 3: Worker
cd apps/worker && npm run dev

# Terminal 4: Frontend
cd apps/frontend && npm run dev
```

### Stop Everything
```bash
# Stop dev servers: Ctrl+C in each terminal

# Stop Docker services
cd infra && docker compose down
```

### Reset Everything
```bash
# Stop all services
cd infra && docker compose down -v

# Remove all data
docker volume prune -f

# Rebuild sandbox
cd docker/sandbox && docker build -t lambda-lite-sandbox:latest .

# Restart
cd infra && docker compose up -d mongodb redis
# Then start backend, worker, and frontend as above
```

---

## Next Steps

- Read the [Learning Guide](./LEARNING_GUIDE.md) to understand the system architecture
- Explore the API documentation at http://localhost:8000/api/docs (if implemented)
- Check out example code snippets in the frontend
- Monitor system metrics with Prometheus

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Learning Guide](./LEARNING_GUIDE.md)
3. Check Docker and service logs for error messages
