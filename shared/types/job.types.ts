export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface JobSubmission {
  code: string;
  args?: any[];
  timeout?: number; // milliseconds, default 30000
}

export interface Job {
  id: string;
  code: string;
  args: any[];
  status: JobStatus;
  result?: any;
  logs?: string;
  error?: string;
  executionTime?: number; // milliseconds
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface JobExecutionResult {
  success: boolean;
  result?: any;
  logs: string;
  error?: string;
  executionTime: number;
}

export interface ResourceLimits {
  cpus: number;
  memory: number; // in MB
  timeout: number; // in milliseconds
}
