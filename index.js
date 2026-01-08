// Production entry point for the portfolio server
// This file imports and runs the compiled TypeScript server or builds if needed
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist', 'index.js');

if (existsSync(distPath)) {
  // Production mode: use pre-built dist/index.js
  await import('./dist/index.js');
} else {
  // Build mode: build the application first, then run it
  console.log('dist/index.js not found, building the application...');
  
  const npmCommand = platform() === 'win32' ? 'npm.cmd' : 'npm';
  
  // Run npm run build without shell for better security
  const buildProcess = spawn(npmCommand, ['run', 'build'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  buildProcess.on('error', (err) => {
    console.error('Failed to build:', err);
    console.error('Make sure dependencies are installed: npm install');
    process.exit(1);
  });
  
  buildProcess.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Build failed with exit code ${code}`);
      process.exit(code || 1);
    }
    
    // Build succeeded, now run the server
    console.log('Build complete! Starting server...');
    
    // Import and run the built server
    try {
      await import('./dist/index.js');
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
}
