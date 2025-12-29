import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue('jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

export class QueueService {
  static jobQueue = jobQueue;
  
  static async addJob(jobId: string, code: string, args: any[], timeout: number = 30000) {
    await jobQueue.add(
      'execute',
      {
        jobId,
        code,
        args,
        timeout,
      },
      {
        jobId,
      }
    );
  }

  static async getJobStatus(jobId: string) {
    const job = await jobQueue.getJob(jobId);
    return job;
  }

  static async removeJob(jobId: string) {
    const job = await jobQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}
