import Docker from 'dockerode';
import { logger } from '../logger/jobLogger';
import { JobExecutionResult, ResourceLimits } from '@lambda-lite/shared';
import { spawn } from 'child_process';

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

    try {
      logger.info('Executing code in sandbox', { image: this.sandboxImage });

      // Prepare input data
      const input = JSON.stringify({ code, args });

      // Use docker run with stdin
      const dockerArgs = [
        'run',
        '--rm',
        '-i',
        `--memory=${limits.memory}m`,
        `--cpus=${limits.cpus}`,
        '--network=none',
        '--read-only',
        this.sandboxImage,
      ];

      logger.info('Starting docker process', { args: dockerArgs });

      return new Promise((resolve) => {
        const dockerProcess = spawn('docker', dockerArgs);

        let output = '';
        let errorOutput = '';
        let timedOut = false;

        // Set timeout
        const timeoutId = setTimeout(() => {
          timedOut = true;
          logger.warn('Execution timeout, killing process', {
            timeout: limits.timeout,
          });
          dockerProcess.kill('SIGKILL');
        }, limits.timeout);

        // Collect stdout
        dockerProcess.stdout.on('data', (chunk) => {
          output += chunk.toString();
        });

        // Collect stderr
        dockerProcess.stderr.on('data', (chunk) => {
          errorOutput += chunk.toString();
        });

        // Handle process exit
        dockerProcess.on('close', (code) => {
          clearTimeout(timeoutId);
          const executionTime = Date.now() - startTime;

          logger.info('Docker process exited', {
            exitCode: code,
            executionTime,
            outputLength: output.length,
          });

          if (timedOut) {
            resolve({
              success: false,
              error: `Execution timeout (${limits.timeout}ms)`,
              logs: output + errorOutput,
              executionTime,
            });
            return;
          }

          // Parse output
          try {
            const result = JSON.parse(output);
            resolve({
              ...result,
              executionTime,
            });
          } catch (parseError) {
            logger.error('Failed to parse execution result', {
              output,
              errorOutput,
              parseError,
            });
            resolve({
              success: false,
              error: 'Failed to parse execution result',
              logs: output + errorOutput,
              executionTime,
            });
          }
        });

        // Handle process errors
        dockerProcess.on('error', (error) => {
          clearTimeout(timeoutId);
          logger.error('Docker process error', { error: error.message });
          resolve({
            success: false,
            error: error.message,
            logs: errorOutput,
            executionTime: Date.now() - startTime,
          });
        });

        // Send input to stdin
        dockerProcess.stdin.write(input);
        dockerProcess.stdin.end();
      });
    } catch (error: any) {
      logger.error('Docker execution error', { error: error.message });

      return {
        success: false,
        error: error.message,
        logs: '',
        executionTime: Date.now() - startTime,
      };
    }
  }
}
