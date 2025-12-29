# Lambda-Lite: Distributed Task Executor

A mini AWS Lambda system for learning serverless architecture, distributed processing, and sandboxing. Execute JavaScript code in isolated Docker containers with resource limits and real-time monitoring.

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│    Redis    │
│   (React)   │      │  (Node.js)  │      │   (Queue)   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │   MongoDB   │      │   Worker    │
                     │  (Storage)  │      │  (Executor) │
                     └─────────────┘      └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │   Sandbox   │
                                          │  (Docker)   │
                                          └─────────────┘
```

## ✨ Features

- **Serverless Execution**: Submit JavaScript code and execute it in isolated environments
- **Sandboxing**: Docker containers with resource limits (CPU, memory, timeout)
- **Distributed Processing**: BullMQ-based job queue with horizontal scaling
- **Real-time Monitoring**: Live job status updates and log streaming
- **Metrics**: Prometheus integration for performance monitoring
- **Modern UI**: React frontend with Monaco code editor

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Run with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd lambda-lite

# Build and start all services
docker-compose -f infra/docker-compose.yml up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Prometheus: http://localhost:9090
```

### Local Development

#### Backend

```bash
cd apps/backend
npm install
npm run dev
```

#### Worker

```bash
cd apps/worker
npm install
npm run dev
```

#### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

## 📝 API Documentation

### Submit Job

```bash
POST /api/jobs
Content-Type: application/json

{
  "code": "function main(a, b) { return a + b; }",
  "args": [2, 3],
  "timeout": 30000
}
```

### Get Job Status

```bash
GET /api/jobs/:id
```

### Get Job Logs

```bash
GET /api/jobs/:id/logs
```

### List All Jobs

```bash
GET /api/jobs?page=1&limit=20
```

## 🔧 Configuration

### Environment Variables

#### Backend

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port

#### Worker

- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `SANDBOX_IMAGE`: Docker image for sandbox (default: lambda-lite-sandbox:latest)

#### Frontend

- `VITE_API_URL`: Backend API URL

## 📊 Monitoring

Access Prometheus metrics at `http://localhost:9090`

Available metrics:
- `lambda_lite_jobs_submitted_total`: Total jobs submitted
- `lambda_lite_jobs_completed_total`: Total jobs completed (by status)
- `lambda_lite_job_execution_duration_seconds`: Job execution time histogram
- `lambda_lite_active_jobs`: Current active jobs
- `lambda_lite_queue_size`: Jobs in queue

## 🔒 Security

- **Code Validation**: Basic security checks for dangerous operations
- **Sandboxing**: Isolated Docker containers with:
  - No network access
  - Read-only filesystem
  - CPU and memory limits
  - Execution timeout
- **Resource Limits**: Configurable CPU, memory, and timeout constraints

## 🧪 Example Usage

### Simple Addition

```javascript
function main(a, b) {
  console.log('Adding', a, 'and', b);
  return a + b;
}
```

Arguments: `[2, 3]`

### Array Processing

```javascript
function main(numbers) {
  console.log('Processing array:', numbers);
  return numbers.reduce((sum, n) => sum + n, 0);
}
```

Arguments: `[[1, 2, 3, 4, 5]]`

### Async Operations

```javascript
async function main(delay) {
  console.log('Waiting', delay, 'ms');
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log('Done!');
  return 'Completed';
}
```

Arguments: `[1000]`

## 🏗️ Project Structure

```
lambda-lite/
├── apps/
│   ├── backend/          # REST API service
│   ├── worker/           # Job execution service
│   └── frontend/         # React UI
├── docker/
│   └── sandbox/          # Sandbox Docker image
├── infra/
│   ├── docker-compose.yml
│   ├── prometheus.yml
│   └── redis.conf
└── shared/               # Shared TypeScript types
```

## 🔄 Scaling

Scale workers horizontally:

```bash
docker-compose -f infra/docker-compose.yml up --scale worker=5
```

## 📚 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Worker**: Node.js, Dockerode, TypeScript
- **Queue**: Redis, BullMQ
- **Database**: MongoDB
- **Monitoring**: Prometheus
- **Frontend**: React, TypeScript, Monaco Editor, Vite
- **Containerization**: Docker, Docker Compose

## 🤝 Contributing

Contributions are welcome! This is a learning project demonstrating:
- Serverless architecture patterns
- Distributed job processing
- Container-based sandboxing
- Real-time monitoring
- Microservices communication

## 📄 License

MIT License - feel free to use this project for learning and experimentation.

## 🎯 Learning Objectives

This project demonstrates:
1. **Distributed Systems**: Job queue, worker pool, horizontal scaling
2. **Sandboxing**: Secure code execution in isolated environments
3. **Microservices**: Backend, worker, and frontend as separate services
4. **Real-time Updates**: Polling-based status updates
5. **Monitoring**: Prometheus metrics and observability
6. **Docker**: Multi-stage builds, Docker-in-Docker, resource limits
7. **Full-stack Development**: React frontend + Node.js backend

## 🐛 Troubleshooting

### Worker can't connect to Docker

Ensure Docker socket is mounted:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

### Jobs stuck in PENDING

Check worker logs:
```bash
docker-compose -f infra/docker-compose.yml logs worker
```

### Frontend can't reach backend

Check API proxy configuration in `nginx.conf` or `vite.config.ts`

---

Built with ❤️ for learning distributed systems and serverless architecture