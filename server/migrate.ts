import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force');
    
    if (stderr && !stderr.includes('No config path provided')) {
      console.error('Migration stderr:', stderr);
    }
    
    if (stdout) {
      console.log('Migration output:', stdout);
    }
    
    console.log('Database migrations completed successfully');
  } catch (error: any) {
    console.error('Failed to run migrations:', error.message);
    throw error;
  }
}
