import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { validationResult } from 'express-validator';

export class JobController {
  /**
   * Submit a new job
   * POST /api/jobs
   */
  static async submitJob(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, args, timeout } = req.body;

      const job = await JobService.createJob({ code, args, timeout });

      res.status(201).json({
        success: true,
        job: {
          id: job._id,
          status: job.status,
          createdAt: job.createdAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get job status and details
   * GET /api/jobs/:id
   */
  static async getJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.getJob(id);

      res.json({
        success: true,
        job: {
          id: job._id,
          code: job.code,
          args: job.args,
          status: job.status,
          result: job.result,
          logs: job.logs,
          error: job.error,
          executionTime: job.executionTime,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
        },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all jobs with pagination
   * GET /api/jobs
   */
  static async getJobs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await JobService.getJobs(page, limit);

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get job logs
   * GET /api/jobs/:id/logs
   */
  static async getJobLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const logs = await JobService.getJobLogs(id);

      res.json({
        success: true,
        ...logs,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get job analytics
   * GET /api/jobs/analytics
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      const stats = await JobService.getAnalytics();
      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
