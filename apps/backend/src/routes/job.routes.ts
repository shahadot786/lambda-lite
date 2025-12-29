import { Router } from 'express';
import { body } from 'express-validator';
import { JobController } from '../controllers/job.controller';

const router = Router();

/**
 * POST /api/jobs - Submit a new job
 */
router.post(
  '/',
  [
    body('code').isString().notEmpty().withMessage('Code is required'),
    body('args').optional().isArray().withMessage('Args must be an array'),
    body('timeout').optional().isInt({ min: 1000, max: 300000 }).withMessage('Timeout must be between 1s and 5min'),
  ],
  JobController.submitJob
);

/**
 * GET /api/jobs/analytics - Get aggregated analytics
 */
router.get('/analytics', JobController.getAnalytics);

/**
 * GET /api/jobs - Get all jobs
 */
router.get('/', JobController.getJobs);

/**
 * GET /api/jobs/:id - Get job by ID
 */
router.get('/:id', JobController.getJob);

/**
 * GET /api/jobs/:id/logs - Get job logs
 */
router.get('/:id/logs', JobController.getJobLogs);

export default router;
