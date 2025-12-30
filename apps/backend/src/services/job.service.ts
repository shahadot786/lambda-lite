import { Job } from '../models/Job.model';
import { JobStatus, JobSubmission } from '@lambda-lite/shared';
import { QueueService } from './queue.service';
import { jobSubmissionGauge, jobCompletionGauge, jobExecutionHistogram, activeJobsGauge, queueSizeGauge } from '../metrics/prometheus';

export class JobService {
  /**
   * Validate user code for basic security
   */
  static validateCode(code: string): { valid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Code cannot be empty' };
    }

    if (code.length > 50000) {
      return { valid: false, error: 'Code is too long (max 50KB)' };
    }

    // Basic security checks
    const dangerousPatterns = [
      /require\s*\(\s*['"]child_process['"]\s*\)/,
      /require\s*\(\s*['"]fs['"]\s*\)/,
      /require\s*\(\s*['"]net['"]\s*\)/,
      /require\s*\(\s*['"]http['"]\s*\)/,
      /require\s*\(\s*['"]https['"]\s*\)/,
      /process\.exit/,
      /process\.kill/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          valid: false,
          error: 'Code contains potentially dangerous operations',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Create and submit a new job
   */
  static async createJob(submission: JobSubmission) {
    const { code, args = [], timeout = 30000 } = submission;

    // Validate code
    const validation = this.validateCode(code);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create job in database
    const job = new Job({
      code,
      args,
      status: JobStatus.PENDING,
    });

    await job.save();

    await job.save();

    // Add to queue
    await QueueService.addJob(job._id.toString(), code, args, timeout);

    return job;
  }

  /**
   * Get job by ID
   */
  static async getJob(jobId: string) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  /**
   * Get all jobs with pagination
   */
  static async getJobs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(),
    ]);

    return {
      jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get job logs
   */
  static async getJobLogs(jobId: string) {
    const job = await this.getJob(jobId);
    return {
      logs: job.logs || '',
      error: job.error,
    };
  }

  /**
   * Update job status (called by worker)
   */
  static async updateJobStatus(
    jobId: string,
    status: JobStatus,
    updates: Partial<{
      result: any;
      logs: string;
      error: string;
      executionTime: number;
      startedAt: Date;
      completedAt: Date;
    }> = {}
  ) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    job.status = status;
    Object.assign(job, updates);

    await job.save();

    // Track execution latency if available
    if ((status === JobStatus.COMPLETED || status === JobStatus.FAILED) && updates.executionTime) {
      // Convert ms to seconds for Prometheus histogram
      jobExecutionHistogram.observe(updates.executionTime / 1000);
    }

    return job;
  }

  /**
   * Get aggregated analytics
   */
  static async getAnalytics() {
    const [totalJobs, statusStats, avgExecution] = await Promise.all([
      Job.countDocuments(),
      Job.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $match: { status: JobStatus.COMPLETED, executionTime: { $exists: true } } },
        { $group: { _id: null, avgTime: { $avg: '$executionTime' } } }
      ])
    ]);

    const stats: Record<string, number> = {
      total: totalJobs,
      completed: 0,
      failed: 0,
      pending: 0,
      running: 0,
    };

    statusStats.forEach(s => {
      if (s._id) stats[s._id.toLowerCase()] = s.count;
    });

    // Get Queue stats from BullMQ
    const [waiting, active] = await Promise.all([
      QueueService.jobQueue.getWaitingCount(),
      QueueService.jobQueue.getActiveCount()
    ]);

    return {
      overview: {
        totalJobs,
        successRate: totalJobs > 0 ? (stats.completed / totalJobs) * 100 : 0,
        avgExecutionTime: avgExecution[0]?.avgTime || 0,
      },
      statusDistribution: stats,
      queuePressure: {
        waiting,
        active,
      }
    };
  }

  /**
   * Sync Prometheus metrics with current system state
   */
  static async syncMetrics() {
    const [stats, [waiting, active]] = await Promise.all([
      Job.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Promise.all([
        QueueService.jobQueue.getWaitingCount(),
        QueueService.jobQueue.getActiveCount()
      ])
    ]);

    let total = 0;
    stats.forEach(s => {
      const count = s.count || 0;
      total += count;
      jobCompletionGauge.set({ status: s._id }, count);
    });

    jobSubmissionGauge.set(total);
    queueSizeGauge.set(waiting);
    activeJobsGauge.set(active);
  }

  /**
   * Re-run an existing job
   */
  static async rerunJob(jobId: string) {
    const original = await this.getJob(jobId);
    return this.createJob({
      code: original.code,
      args: original.args,
    });
  }

  /**
   * Purge all jobs
   */
  static async purgeJobs() {
    await Promise.all([
      Job.deleteMany({}),
      QueueService.jobQueue.drain(),
    ]);
  }
}
