import { Job } from '../models/Job.model';
import { JobStatus, JobSubmission } from '@lambda-lite/shared';
import { QueueService } from './queue.service';

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
    return job;
  }
}
