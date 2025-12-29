import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { logger } from '../logger/jobLogger';
import { DockerExecutor } from '../executor/dockerExecutor';
import { JobStatus } from '@lambda-lite/shared';

// Import Job model (we'll need to connect to MongoDB)
const JobSchema = new mongoose.Schema({
  code: String,
  args: [mongoose.Schema.Types.Mixed],
  status: String,
  result: mongoose.Schema.Types.Mixed,
  logs: String,
  error: String,
  executionTime: Number,
  createdAt: Date,
  startedAt: Date,
  completedAt: Date,
});

const JobModel = mongoose.model('Job', JobSchema);

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const sandboxImage = process.env.SANDBOX_IMAGE || 'lambda-lite-sandbox:latest';
const dockerExecutor = new DockerExecutor(sandboxImage);

export const jobWorker = new Worker(
  'jobs',
  async (job: Job) => {
    const { jobId, code, args, timeout } = job.data;

    logger.info('Processing job', { jobId, jobName: job.name });

    try {
      // Update job status to RUNNING
      await JobModel.findByIdAndUpdate(jobId, {
        status: JobStatus.RUNNING,
        startedAt: new Date(),
      });

      logger.info('Job started', { jobId });

      // Execute code in sandbox
      const result = await dockerExecutor.execute(code, args, {
        cpus: 1,
        memory: 512,
        timeout: timeout || 30000,
      });

      logger.info('Job execution completed', {
        jobId,
        success: result.success,
        executionTime: result.executionTime,
      });

      // Update job with result
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

      return result;
    } catch (error: any) {
      logger.error('Job processing error', { jobId, error: error.message });

      // Update job status to FAILED
      await JobModel.findByIdAndUpdate(jobId, {
        status: JobStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // per second
    },
  }
);

// Worker event handlers
jobWorker.on('completed', (job) => {
  logger.info('Job completed', { jobId: job.id });
});

jobWorker.on('failed', (job, err) => {
  logger.error('Job failed', { jobId: job?.id, error: err.message });
});

jobWorker.on('error', (err) => {
  logger.error('Worker error', { error: err.message });
});
