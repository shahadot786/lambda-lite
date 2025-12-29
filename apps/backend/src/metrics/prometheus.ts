import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a Registry
export const register = new Registry();

// Job submission metrics
export const jobSubmissionCounter = new Counter({
  name: 'lambda_lite_jobs_submitted_total',
  help: 'Total number of jobs submitted',
  registers: [register],
});

// Job completion metrics
export const jobCompletionCounter = new Counter({
  name: 'lambda_lite_jobs_completed_total',
  help: 'Total number of jobs completed',
  labelNames: ['status'],
  registers: [register],
});

// Job execution time
export const jobExecutionHistogram = new Histogram({
  name: 'lambda_lite_job_execution_duration_seconds',
  help: 'Job execution duration in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

// Active jobs gauge
export const activeJobsGauge = new Gauge({
  name: 'lambda_lite_active_jobs',
  help: 'Number of currently active jobs',
  registers: [register],
});

// Queue size gauge
export const queueSizeGauge = new Gauge({
  name: 'lambda_lite_queue_size',
  help: 'Number of jobs in queue',
  registers: [register],
});
