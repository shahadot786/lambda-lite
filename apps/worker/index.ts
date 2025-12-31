import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './src/logger/jobLogger';
import { jobWorker } from './src/queue/job.consumer';
import { connectToBackend } from './src/websocket/client';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/lambda-lite';

async function startWorker() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    logger.info('✓ MongoDB connected');

    // Connect to backend WebSocket
    connectToBackend();
    logger.info('✓ WebSocket client connected');

    logger.info('✓ Worker started and listening for jobs');
    logger.info(`  - Queue: jobs`);
    logger.info(`  - Concurrency: 5`);
    logger.info(`  - Sandbox image: ${process.env.SANDBOX_IMAGE || 'lambda-lite-sandbox:latest'}`);
  } catch (error: any) {
    logger.error('Failed to start worker', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await jobWorker.close();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await jobWorker.close();
  await mongoose.connection.close();
  process.exit(0);
});

startWorker();
