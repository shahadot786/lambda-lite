import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '@lambda-lite/shared';

export interface IJob extends Document {
  code: string;
  args: any[];
  status: JobStatus;
  result?: any;
  logs?: string;
  error?: string;
  executionTime?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const JobSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
  },
  args: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.PENDING,
  },
  result: {
    type: Schema.Types.Mixed,
  },
  logs: {
    type: String,
  },
  error: {
    type: String,
  },
  executionTime: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
});

// Index for efficient queries
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
