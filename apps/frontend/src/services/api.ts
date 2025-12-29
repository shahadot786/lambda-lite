import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface JobSubmission {
  code: string;
  args?: any[];
  timeout?: number;
}

export interface Job {
  id: string;
  code: string;
  args: any[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: any;
  logs?: string;
  error?: string;
  executionTime?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export const jobService = {
  async submitJob(submission: JobSubmission) {
    const response = await api.post('/jobs', submission);
    return response.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data.job;
  },

  async getJobs(page: number = 1, limit: number = 20) {
    const response = await api.get('/jobs', { params: { page, limit } });
    return response.data;
  },

  async getJobLogs(id: string) {
    const response = await api.get(`/jobs/${id}/logs`);
    return response.data;
  },
};
