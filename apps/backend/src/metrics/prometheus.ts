import { Registry, Gauge, Histogram } from 'prom-client';

// Create a Registry
export const register = new Registry();

// Job submission metrics (Converted to Gauge for DB sync)
export const jobSubmissionGauge = new Gauge({
  name: 'lambda_lite_jobs_total',
  help: 'Total number of jobs in the system',
  registers: [register],
});

// Job completion metrics (Converted to Gauge for DB sync)
export const jobCompletionGauge = new Gauge({
  name: 'lambda_lite_jobs_by_status',
  help: 'Number of jobs partitioned by status',
  labelNames: ['status'],
  registers: [register],
});

// Job execution time (Still a histogram, will be per-instance but useful)
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
