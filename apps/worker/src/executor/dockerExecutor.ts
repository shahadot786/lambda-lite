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
          AutoRemove: true, // Auto-remove after execution
        },
      });

      logger.info('Starting container', { containerId: container.id });

      // Start container
      await container.start();

      // Attach to container streams
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      // Send input data
      const input = JSON.stringify({ code, args });
      stream.write(input);
      stream.end();

      // Collect output
      let output = '';
      let errorOutput = '';

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(async () => {
          logger.warn('Execution timeout, killing container', {
            timeout: limits.timeout,
          });

          try {
            await container?.kill();
          } catch (err) {
            logger.error('Error killing container', { error: err });
          }

          resolve({
            success: false,
            error: `Execution timeout (${limits.timeout}ms)`,
            logs: output + errorOutput,
            executionTime: Date.now() - startTime,
          });
        }, limits.timeout);

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

        stream.on('end', async () => {
          clearTimeout(timeoutId);

          try {
            // Wait for container to finish
            const data = await container!.wait();
            const executionTime = Date.now() - startTime;

            logger.info('Container finished', {
              exitCode: data.StatusCode,
              executionTime,
            });

            // Parse output
            try {
              const result = JSON.parse(output);
              resolve({
                ...result,
                executionTime,
              });
            } catch (parseError) {
              resolve({
                success: false,
                error: 'Failed to parse execution result',
                logs: output + errorOutput,
                executionTime,
              });
            }
          } catch (err: any) {
            clearTimeout(timeoutId);
            reject(err);
          }
        });

        stream.on('error', (err: Error) => {
          clearTimeout(timeoutId);
          reject(err);
        });
      });
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
