import Docker from 'dockerode';
import { logger } from '../logger/jobLogger';
import { JobExecutionResult, ResourceLimits } from '@lambda-lite/shared';

const docker = new Docker();

export class DockerExecutor {
  private sandboxImage: string;

  constructor(sandboxImage: string = 'lambda-lite-sandbox:latest') {
    this.sandboxImage = sandboxImage;
  }

  /**
   * Execute user code in Docker sandbox
   */
  async execute(
    code: string,
    args: any[] = [],
    limits: ResourceLimits = {
      cpus: 1,
      memory: 512, // MB
      timeout: 30000, // ms
    }
  ): Promise<JobExecutionResult> {
    const startTime = Date.now();
    let container: Docker.Container | null = null;

    try {
      logger.info('Creating sandbox container', { image: this.sandboxImage });

      // Prepare input data
      const input = JSON.stringify({ code, args });

      // Create container with resource limits
      container = await docker.createContainer({
        Image: this.sandboxImage,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: true,
        Tty: false,
        HostConfig: {
          Memory: limits.memory * 1024 * 1024, // Convert MB to bytes
          MemorySwap: limits.memory * 1024 * 1024, // No swap
          NanoCpus: limits.cpus * 1e9, // Convert CPUs to nano CPUs
          NetworkMode: 'none', // No network access
          ReadonlyRootfs: true, // Read-only filesystem
          AutoRemove: false, // Don't auto-remove, we'll do it manually
        },
      });

      logger.info('Container created', { containerId: container.id });

      // Attach to container BEFORE starting it
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      // Collect output
      let output = '';
      let errorOutput = '';
      let streamEnded = false;

      // Set up stream handlers BEFORE starting container
      const outputPromise = new Promise<void>((resolve) => {
        // Demultiplex Docker stream
        docker.modem.demuxStream(
          stream,
          {
            write: (chunk: Buffer) => {
              output += chunk.toString();
            },
          } as any,
          {
            write: (chunk: Buffer) => {
              errorOutput += chunk.toString();
            },
          } as any
        );

        stream.on('end', () => {
          streamEnded = true;
          resolve();
        });
      });

      // Now start the container
      await container.start();
      logger.info('Container started', { containerId: container.id });

      // Send input data
      stream.write(input);
      stream.end();

      // Wait for execution with timeout
      const executionPromise = Promise.race([
        outputPromise.then(async () => {
          // Wait for container to finish
          await container!.wait();
          return { timedOut: false };
        }),
        new Promise<{ timedOut: boolean }>((resolve) => {
          setTimeout(() => {
            resolve({ timedOut: true });
          }, limits.timeout);
        }),
      ]);

      const { timedOut } = await executionPromise;

      if (timedOut) {
        logger.warn('Execution timeout, killing container', {
          timeout: limits.timeout,
        });

        try {
          await container.kill();
        } catch (err) {
          logger.error('Error killing container', { error: err });
        }

        // Clean up
        try {
          await container.remove({ force: true });
        } catch (cleanupError) {
          logger.error('Error removing container', { error: cleanupError });
        }

        return {
          success: false,
          error: `Execution timeout (${limits.timeout}ms)`,
          logs: output + errorOutput,
          executionTime: Date.now() - startTime,
        };
      }

      const executionTime = Date.now() - startTime;

      logger.info('Container finished', {
        executionTime,
        outputLength: output.length,
      });

      // Clean up container
      try {
        await container.remove({ force: true });
      } catch (cleanupError) {
        logger.error('Error removing container', { error: cleanupError });
      }

      // Parse output
      try {
        const result = JSON.parse(output);
        return {
          ...result,
          executionTime,
        };
      } catch (parseError) {
        logger.error('Failed to parse execution result', {
          output,
          errorOutput,
          parseError,
        });
        return {
          success: false,
          error: 'Failed to parse execution result',
          logs: output + errorOutput,
          executionTime,
        };
      }
    } catch (error: any) {
      logger.error('Docker execution error', { error: error.message });

      // Clean up container if it exists
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (cleanupError) {
          logger.error('Error cleaning up container', { error: cleanupError });
        }
      }

      return {
        success: false,
        error: error.message,
        logs: '',
        executionTime: Date.now() - startTime,
      };
    }
  }
}
