#!/usr/bin/env node

/**
 * Sandbox Runner - Executes user code in isolated environment
 * Receives: { code: string, args: any[] }
 * Returns: { success: boolean, result?: any, error?: string, logs: string }
 */

const vm = require('vm');
const { performance } = require('perf_hooks');

// Capture console output
let logs = '';
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

console.log = (...args) => {
  logs += args.join(' ') + '\n';
  originalConsole.log(...args);
};

console.error = (...args) => {
  logs += '[ERROR] ' + args.join(' ') + '\n';
  originalConsole.error(...args);
};

console.warn = (...args) => {
  logs += '[WARN] ' + args.join(' ') + '\n';
  originalConsole.warn(...args);
};

console.info = (...args) => {
  logs += '[INFO] ' + args.join(' ') + '\n';
  originalConsole.info(...args);
};

async function executeCode(code, args) {
  const startTime = performance.now();
  
  try {
    // Create sandbox context with limited globals
    const sandbox = {
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Math,
      JSON,
      Date,
      RegExp,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
    };

    // Create VM context
    const context = vm.createContext(sandbox);

    // Wrap user code in an async function
    const wrappedCode = `
      (async function() {
        ${code}
        
        // If code defines a main function, call it with args
        if (typeof main === 'function') {
          return await main(...${JSON.stringify(args)});
        }
        
        // Otherwise, return undefined
        return undefined;
      })();
    `;

    // Execute code with timeout
    const script = new vm.Script(wrappedCode);
    const result = await script.runInContext(context, {
      timeout: 30000, // 30 seconds default
      displayErrors: true,
    });

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      result,
      logs,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;

    return {
      success: false,
      error: error.message,
      logs,
      executionTime,
    };
  }
}

// Read input from stdin
let inputData = '';

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    const { code, args = [] } = JSON.parse(inputData);
    
    if (!code) {
      throw new Error('No code provided');
    }

    const result = await executeCode(code, args);
    
    // Output result as JSON
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    const errorResult = {
      success: false,
      error: error.message,
      logs,
      executionTime: 0,
    };
    
    process.stdout.write(JSON.stringify(errorResult));
    process.exit(1);
  }
});
