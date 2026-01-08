// Production entry point for the portfolio server
// This file imports and runs the compiled TypeScript server or falls back to tsx
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
  // Development/fallback mode: use tsx to run TypeScript directly
  console.log('dist/index.js not found, running server in development mode with tsx...');
  
  // Use platform-specific tsx binary path
  const tsxBinary = platform() === 'win32' ? 'tsx.cmd' : 'tsx';
  const tsxPath = join(__dirname, 'node_modules', '.bin', tsxBinary);
  const serverPath = join(__dirname, 'server', 'index.ts');
  
  // Verify tsx is installed
  if (!existsSync(tsxPath)) {
    console.error('Error: tsx not found. Please run "npm install" first.');
    process.exit(1);
  }
  
  // Use development mode when dist doesn't exist (unless explicitly overridden)
  const child = spawn(tsxPath, [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
  });
  
  child.on('error', (err) => {
    console.error('Failed to start server:', err);
    console.error('Make sure dependencies are installed: npm install');
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
