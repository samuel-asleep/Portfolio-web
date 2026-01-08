// Production entry point for the portfolio server
// This file imports and runs the compiled TypeScript server or falls back to tsx
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist', 'index.js');

if (existsSync(distPath)) {
  // Production mode: use pre-built dist/index.js
  await import('./dist/index.js');
} else {
  // Development/fallback mode: use tsx to run TypeScript directly
  console.log('dist/index.js not found, running server in development mode with tsx...');
  const { spawn } = await import('child_process');
  const tsxPath = join(__dirname, 'node_modules', '.bin', 'tsx');
  const serverPath = join(__dirname, 'server', 'index.ts');
  
  // Force development mode when dist doesn't exist so Vite can serve the client
  const child = spawn(tsxPath, [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  child.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
