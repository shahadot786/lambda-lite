// Test script to debug Docker executor
import Docker from 'dockerode';

const docker = new Docker();

async function testExecution() {
  console.log('Starting test...');
  
  const code = 'function main(a, b) { console.log("Adding", a, "and", b); return a + b; }';
  const args = [2, 3];
  const input = JSON.stringify({ code, args });
  
  console.log('Input:', input);
  
  try {
    // Create container
    const container = await docker.createContainer({
      Image: 'lambda-lite-sandbox:latest',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
      Tty: false,
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        NanoCpus: 1 * 1e9,
        NetworkMode: 'none',
        ReadonlyRootfs: true,
        AutoRemove: false,
      },
    });
    
    console.log('Container created:', container.id);
    
    // Attach BEFORE starting
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
    });
    
    console.log('Stream attached');
    
    let output = '';
    let errorOutput = '';
    
    // Set up handlers
    docker.modem.demuxStream(
      stream,
      {
        write: (chunk) => {
          console.log('STDOUT chunk:', chunk.toString());
          output += chunk.toString();
        },
      },
      {
        write: (chunk) => {
          console.log('STDERR chunk:', chunk.toString());
          errorOutput += chunk.toString();
        },
      }
    );
    
    stream.on('end', () => {
      console.log('Stream ended');
    });
    
    // Start container
    await container.start();
    console.log('Container started');
    
    // Send input
    console.log('Writing input...');
    stream.write(input);
    stream.end();
    console.log('Input sent');
    
    // Wait for container
    const result = await container.wait();
    console.log('Container exited with code:', result.StatusCode);
    
    console.log('Output:', output);
    console.log('Error output:', errorOutput);
    
    // Cleanup
    await container.remove({ force: true });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testExecution();
