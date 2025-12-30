# Lambda-Lite Learning Guide

Comprehensive guide to understanding the Lambda-Lite distributed task executor system architecture, components, and implementation details.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Shared Types Package](#shared-types-package)
4. [Backend API](#backend-api)
5. [Worker Service](#worker-service)
6. [Docker Sandbox](#docker-sandbox)
7. [Frontend Application](#frontend-application)
8. [Queue System (BullMQ)](#queue-system-bullmq)
9. [Database Models](#database-models)
10. [Code Execution Flow](#code-execution-flow)
11. [Security Considerations](#security-considerations)

---

## System Overview

Lambda-Lite is a **distributed task executor** that allows users to submit JavaScript code for execution in isolated Docker containers. It's similar to AWS Lambda but runs on your own infrastructure.

### Key Features

- **Secure Code Execution**: User code runs in isolated Docker containers with resource limits
- **Distributed Processing**: Multiple worker instances can process jobs concurrently
- **Queue-Based Architecture**: Uses Redis and BullMQ for reliable job queuing
- **Real-time Monitoring**: WebSocket-based status updates and log streaming
- **Resource Management**: CPU, memory, and timeout limits for each execution
- **Web Interface**: React-based UI for submitting and monitoring jobs

### Use Cases

- **Code Playground**: Execute user-submitted code snippets
- **Automated Testing**: Run test suites in isolated environments
- **Data Processing**: Process data transformations in parallel
- **Microservices**: Execute small, stateless functions on demand

---

## Architecture

```
┌─────────────┐
│   Frontend  │  (React + Vite)
│  Port 5173  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │  (Express.js)
│  Port 8000  │
└──────┬──────┘
       │
       ├─────► MongoDB (Job Storage)
       │
       └─────► Redis (Job Queue)
                  │
                  ▼
            ┌──────────┐
            │  Worker  │  (BullMQ Consumer)
            │ Service  │
            └────┬─────┘
                 │
                 ▼
            ┌──────────┐
            │  Docker  │  (Sandbox Container)
            │ Executor │
            └──────────┘
```

### Component Responsibilities

|Component | Purpose | Technology |
|-----------|---------|------------|
| **Frontend** | User interface for job submission | React, Tailwind CSS v4, shadcn/ui |
| **Backend** | REST API, job management | Express.js, Mongoose, prom-client |
| **Worker** | Job processing, code execution | BullMQ, Dockerode |
| **Sandbox** | Isolated code execution | Docker, Node.js VM |
| **MongoDB** | Persistent job storage | MongoDB 7 |
| **Redis** | Job queue and pub/sub | Redis 7 |

---

## Shared Types Package

**Location**: `shared/`

The shared package contains TypeScript type definitions used across all services, ensuring type safety and consistency.

### Key Types

#### JobStatus Enum
```typescript
export enum JobStatus {
  PENDING = 'PENDING',      // Job created, waiting for worker
  RUNNING = 'RUNNING',      // Worker is executing the job
  COMPLETED = 'COMPLETED',  // Job finished successfully
  FAILED = 'FAILED',        // Job failed with error
}
```

#### JobSubmission Interface
```typescript
export interface JobSubmission {
  code: string;           // User's JavaScript code
  args?: any[];          // Arguments to pass to main()
  timeout?: number;      // Max execution time (ms)
}
```

#### Job Interface
```typescript
export interface Job {
  id: string;
  code: string;
  args: any[];
  status: JobStatus;
  result?: any;          // Return value from main()
  logs?: string;         // Console output
  error?: string;        // Error message if failed
  executionTime?: number; // Actual execution time (ms)
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

#### ResourceLimits Interface
```typescript
export interface ResourceLimits {
  cpus: number;          // Number of CPU cores
  memory: number;        // Memory limit in MB
  timeout: number;       // Timeout in milliseconds
}
```

### Why Shared Types?

1. **Type Safety**: Catch errors at compile time
2. **Consistency**: Same types across frontend, backend, and worker
3. **Maintainability**: Change types in one place
4. **Documentation**: Types serve as inline documentation

### Usage Example

```typescript
// In backend
import { JobStatus, JobSubmission } from '@lambda-lite/shared';

// In worker
import { ResourceLimits, JobExecutionResult } from '@lambda-lite/shared';
```

---

## Backend API

**Location**: `apps/backend/`

The backend is an Express.js REST API that handles job submission, retrieval, and status updates.

### Architecture

```
apps/backend/
├── src/
│   ├── server.ts           # Express app setup
│   ├── routes/
│   │   └── job.routes.ts   # Job endpoints
│   ├── controllers/
│   │   └── job.controller.ts  # Request handlers
│   ├── services/
│   │   └── job.service.ts  # Business logic
│   ├── models/
│   │   └── Job.model.ts    # Mongoose schema
│   └── queue/
│       └── job.queue.ts    # BullMQ producer
```

### Key Endpoints

#### POST /api/jobs
Submit a new job for execution.

**Request**:
```json
{
  "code": "function main(a, b) { return a + b; }",
  "args": [2, 3],
  "timeout": 30000
}
```

**Response**:
```json
{
  "_id": "6952de2a1bfe9ce5362d1fb1",
  "code": "function main(a, b) { return a + b; }",
  "args": [2, 3],
  "status": "PENDING",
  "createdAt": "2025-12-29T20:01:46.323Z"
}
```

#### GET /api/jobs
List all jobs with pagination.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Jobs per page (default: 10)
- `status`: Filter by status (optional)

#### GET /api/jobs/:id
Get a specific job by ID.

**Response**:
```json
{
  "_id": "...",
  "status": "COMPLETED",
  "result": 5,
  "logs": "Adding 2 and 3\n",
  "executionTime": 150
}
```

### Job Submission Flow

1. **Validation**: Validate request body (code, args, timeout)
2. **Create Job**: Save job to MongoDB with status `PENDING`
3. **Queue Job**: Add job to Redis queue via BullMQ
4. **Return Response**: Return job object to client

```typescript
// Simplified job submission
async function submitJob(submission: JobSubmission) {
  // 1. Create job in database
  const job = await JobModel.create({
    code: submission.code,
    args: submission.args || [],
    status: JobStatus.PENDING,
    createdAt: new Date(),
  });

  // 2. Add to queue
  await jobQueue.add('execute', {
    jobId: job._id,
    code: job.code,
    args: job.args,
    timeout: submission.timeout || 30000,
  });

  return job;
}
```

---

## Worker Service

**Location**: `apps/worker/`

The worker service consumes jobs from the Redis queue and executes them in Docker containers.

### Architecture

```
apps/worker/
├── src/
│   ├── index.ts              # Worker startup
│   ├── queue/
│   │   └── job.consumer.ts   # BullMQ worker
│   ├── executor/
│   │   └── dockerExecutor.ts # Docker integration
│   └── logger/
│       └── jobLogger.ts      # Winston logger
```

### Job Consumer

The `job.consumer.ts` file sets up a BullMQ worker that:

1. **Listens** for jobs on the `jobs` queue
2. **Updates** job status to `RUNNING`
3. **Executes** code via DockerExecutor
4. **Updates** job with results or errors
5. **Handles** failures and retries

```typescript
export const jobWorker = new Worker(
  'jobs',
  async (job: Job) => {
    const { jobId, code, args, timeout } = job.data;

    // Update status to RUNNING
    await JobModel.findByIdAndUpdate(jobId, {
      status: JobStatus.RUNNING,
      startedAt: new Date(),
    });

    // Execute in Docker
    const result = await dockerExecutor.execute(code, args, {
      cpus: 1,
      memory: 512,
      timeout: timeout || 30000,
    });

    // Update with result
    if (result.success) {
      await JobModel.findByIdAndUpdate(jobId, {
        status: JobStatus.COMPLETED,
        result: result.result,
        logs: result.logs,
        executionTime: result.executionTime,
        completedAt: new Date(),
      });
    } else {
      await JobModel.findByIdAndUpdate(jobId, {
        status: JobStatus.FAILED,
        error: result.error,
        logs: result.logs,
        executionTime: result.executionTime,
        completedAt: new Date(),
      });
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,  // Process 5 jobs at once
  }
);
```

### Concurrency & Scaling

- **Concurrency**: Each worker can process 5 jobs simultaneously
- **Multiple Workers**: Run multiple worker instances for horizontal scaling
- **Rate Limiting**: Max 10 jobs per second per worker

---

## Docker Sandbox

**Location**: `docker/sandbox/`

The sandbox is a minimal Docker container that executes user code in an isolated environment.

### Sandbox Components

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install tini for signal handling
RUN apk add --no-cache tini

# Copy runner script
COPY runner.js /app/runner.js

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Run the runner
CMD ["node", "/app/runner.js"]
```

#### Runner Script (`runner.js`)

The runner script:
1. **Reads** JSON input from stdin: `{ code, args }`
2. **Executes** code in a VM context with limited globals
3. **Captures** console output
4. **Returns** JSON result: `{ success, result, logs, error }`

```javascript
// Simplified runner logic
async function executeCode(code, args) {
  // Create sandbox with limited globals
  const sandbox = {
    console,
    Math,
    JSON,
    Array,
    Object,
    // ... safe globals only
  };

  // Wrap code to call main()
  const wrappedCode = `
    (async function() {
      ${code}
      if (typeof main === 'function') {
        return await main(...${JSON.stringify(args)});
      }
    })();
  `;

  // Execute with timeout
  const script = new vm.Script(wrappedCode);
  const result = await script.runInContext(
    vm.createContext(sandbox),
    { timeout: 30000 }
  );

  return { success: true, result, logs };
}
```

### Security Features

1. **No Network Access**: `NetworkMode: 'none'`
2. **Read-Only Filesystem**: `ReadonlyRootfs: true`
3. **Resource Limits**: CPU and memory constraints
4. **Limited Globals**: No `require`, `process`, `fs`, etc.
5. **Timeout Protection**: Kills long-running code
6. **Isolated Execution**: Each job runs in a fresh container

---

## Frontend Application

**Location**: `apps/frontend/`

### Modern Design System
The UI is built with a **Premium & Adaptive** philosophy:
- **Tailwind CSS v4**: Leveraging the latest in CSS-in-JS performance and utility-first styling.
- **shadcn/ui**: High-quality, accessible components for a professional look and feel.
- **Glassmorphism**: Sophisticated backdrop-blur effects and subtle shadows for a modern aesthetic.
- **Theme-Awareness**: Optimized for both high-contrast light mode and immersive dark mode.
- **Responsive Layouts**: Designed to be fully functional from mobile screens (using compact logos like "LL") to large monitors.

#### Code Panels
Uses Monaco Editor (VS Code's editor) for syntax highlighting:

```typescript
<MonacoEditor
  language="javascript"
  theme="vs-dark"
  value={code}
  onChange={setCode}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
  }}
/>
```

#### Job Submission
```typescript
async function submitJob() {
  const response = await axios.post('/api/jobs', {
    code,
    args: JSON.parse(argsInput),
    timeout: 30000,
  });
  
  setJobId(response.data._id);
  pollJobStatus(response.data._id);
}
```

#### Real-time Updates (WebSockets)
The frontend uses `socket.io-client` to listen for real-time updates from the backend:

```typescript
// apps/frontend/src/services/websocket.ts
this.socket.on('job:update', (data) => {
  console.log('Job update received:', data);
  this.emit('job:update', data);
});
```

---

## 📊 Monitoring & Analytics

Lambda-Lite features a dual-layer monitoring approach:

### 1. Prometheus Layer (Raw Data)
The backend exposes a `/metrics` endpoint using `prom-client`. This tracks:
- **Throughput**: Jobs submitted vs Jobs completed.
- **Latency**: Detailed histograms of sandbox execution time.
- **Saturation**: Current queue size and active worker threads.

### 2. Analytics Dashboard (Visual Layer)
A dedicated frontend page (`/analytics`) provides a premium visual summary:
- **KPI Summary**: High-level metrics for total workload, avg. time, and success rates.
- **Status breakdown**: Visual progress tracking for successful vs failed jobs.
- **Live Pressure**: Dynamic indicators for BullMQ queue state and active worker saturation.

---

## Queue System (BullMQ)

BullMQ is a Redis-based queue library for Node.js.

### Why BullMQ?

- **Reliable**: Jobs are persisted in Redis
- **Scalable**: Multiple workers can consume from the same queue
- **Features**: Retries, rate limiting, priorities, delayed jobs
- **Monitoring**: Built-in metrics and events

### Queue Configuration

```typescript
// Producer (Backend)
const jobQueue = new Queue('jobs', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

await jobQueue.add('execute', {
  jobId: '...',
  code: '...',
  args: [],
});

// Consumer (Worker)
const jobWorker = new Worker('jobs', async (job) => {
  // Process job
}, {
  connection: redisConnection,
  concurrency: 5,
});
```

### Job Lifecycle

```
PENDING → RUNNING → COMPLETED
                  ↘ FAILED
```

1. **PENDING**: Job added to queue, waiting for worker
2. **RUNNING**: Worker picked up job, executing
3. **COMPLETED**: Job finished successfully
4. **FAILED**: Job failed with error

---

## Database Models

### Job Model (Mongoose)

```typescript
const JobSchema = new mongoose.Schema({
  code: { type: String, required: true },
  args: [mongoose.Schema.Types.Mixed],
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  },
  result: mongoose.Schema.Types.Mixed,
  logs: String,
  error: String,
  executionTime: Number,
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
});
```

### Indexes

```typescript
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ createdAt: -1 });
```

---

## Code Execution Flow

### End-to-End Flow

```
1. User submits code via Frontend
   ↓
2. Frontend sends POST /api/jobs to Backend
   ↓
3. Backend creates Job in MongoDB (status: PENDING)
   ↓
4. Backend adds job to Redis queue via BullMQ
   ↓
5. Worker picks up job from queue
   ↓
6. Worker updates Job status to RUNNING
   ↓
7. Worker creates Docker container with resource limits
   ↓
8. Worker sends code + args to container via stdin
   ↓
9. Container executes code in VM sandbox
   ↓
10. Container returns result via stdout
   ↓
11. Worker parses result and updates Job
   ↓
12. Frontend polls and displays result
```

### Detailed Execution Steps

#### 1. Container Creation
```typescript
const container = await docker.createContainer({
  Image: 'lambda-lite-sandbox:latest',
  HostConfig: {
    Memory: 512 * 1024 * 1024,  // 512 MB
    NanoCpus: 1 * 1e9,          // 1 CPU
    NetworkMode: 'none',
    ReadonlyRootfs: true,
  },
});
```

#### 2. Stream Attachment
```typescript
// Attach BEFORE starting
const stream = await container.attach({
  stream: true,
  stdin: true,
  stdout: true,
  stderr: true,
});
```

#### 3. Container Start
```typescript
await container.start();
```

#### 4. Input Transmission
```typescript
const input = JSON.stringify({ code, args });
stream.write(input);
stream.end();
```

#### 5. Output Collection
```typescript
let output = '';
docker.modem.demuxStream(stream, {
  write: (chunk) => { output += chunk.toString(); }
}, {
  write: (chunk) => { errorOutput += chunk.toString(); }
});
```

#### 6. Result Parsing
```typescript
const result = JSON.parse(output);
// { success: true, result: 5, logs: "...", executionTime: 150 }
```

---

## Security Considerations

### Container Isolation

✅ **Implemented**:
- No network access
- Read-only filesystem
- Resource limits (CPU, memory)
- Timeout protection
- Limited Node.js globals

⚠️ **Not Implemented** (Production Recommendations):
- User authentication
- Rate limiting per user
- Code scanning for malicious patterns
- Seccomp/AppArmor profiles
- Container runtime security (gVisor, Kata)

### Code Execution Risks

**Potential Attacks**:
1. **Infinite Loops**: Mitigated by timeout
2. **Memory Bombs**: Mitigated by memory limits
3. **CPU Exhaustion**: Mitigated by CPU limits
4. **Network Requests**: Blocked by `NetworkMode: 'none'`
5. **File System Access**: Blocked by read-only filesystem

### Production Hardening

For production use, consider:
1. **User Authentication**: JWT tokens, API keys
2. **Rate Limiting**: Per-user job submission limits
3. **Code Validation**: AST parsing to detect dangerous patterns
4. **Audit Logging**: Track all job submissions
5. **Container Security**: Use gVisor or Firecracker
6. **Network Isolation**: Separate network for workers
7. **Secrets Management**: Vault for credentials

---

## Learning Path

### Beginner
1. Understand the overall architecture
2. Run the system locally
3. Submit test jobs via the frontend
4. Examine job records in MongoDB

### Intermediate
1. Study the shared types package
2. Trace a job through the entire system
3. Modify resource limits
4. Add custom logging

### Advanced
1. Implement job priorities
2. Add support for other languages (Python, Go)
3. Build a job scheduler
4. Implement distributed tracing
5. Add metrics and monitoring

---

## Additional Resources

- **BullMQ Documentation**: https://docs.bullmq.io/
- **Dockerode API**: https://github.com/apocas/dockerode
- **Node.js VM Module**: https://nodejs.org/api/vm.html
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/

---

## Summary

Lambda-Lite demonstrates key concepts in distributed systems:
- **Microservices Architecture**: Separate services with clear responsibilities
- **Queue-Based Processing**: Decoupled job submission and execution
- **Container Orchestration**: Dynamic container lifecycle management
- **Security Isolation**: Sandboxed code execution
- **Scalability**: Horizontal scaling via multiple workers

This system can serve as a foundation for building serverless platforms, code playgrounds, or automated testing systems.
