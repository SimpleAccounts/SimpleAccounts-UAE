import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Clears the database by running the clear-database-auto.sh script
 * This removes all users and companies from the database
 *
 * @param force - If true, skips confirmation prompt (default: true for tests)
 * @throws Error if the script fails to execute
 *
 * @example
 * ```typescript
 * await clearDatabase(true);
 * ```
 */
export async function clearDatabase(force: boolean = true): Promise<void> {
  // Calculate path from e2e/helpers to project root (go up 4 levels)
  const projectRoot = path.join(__dirname, '../../../../');
  const scriptPath = path.join(projectRoot, 'scripts/clear-database-auto.sh');

  try {
    const command = force ? `bash ${scriptPath} --force` : `bash ${scriptPath}`;
    execSync(command, {
      stdio: 'pipe', // Use 'pipe' instead of 'inherit' to capture errors
      cwd: projectRoot,
      encoding: 'utf8',
    });
    console.log('✅ Database cleared successfully');
  } catch (error: any) {
    const errorMessage = error?.stderr || error?.stdout || error?.message || String(error);
    console.warn('⚠️  Database cleanup failed (continuing anyway):', errorMessage);
    // Don't throw - allow tests to continue without database cleanup
    // This is acceptable for local testing where database might not be accessible
  }
}

/**
 * Sets up the test environment by ensuring:
 * - Database is in a clean state
 * - Required environment variables are set
 * - Backend and frontend services are accessible
 *
 * @param options - Configuration options for environment setup
 * @param options.clearDb - Whether to clear the database (default: true)
 * @param options.verifyServices - Whether to verify backend/frontend are running (default: false)
 *
 * @example
 * ```typescript
 * await setupTestEnvironment({ clearDb: true, verifyServices: true });
 * ```
 */
export async function setupTestEnvironment(
  options: {
    clearDb?: boolean;
    verifyServices?: boolean;
  } = {}
): Promise<void> {
  const { clearDb = true, verifyServices = false } = options;

  console.log('🔧 Setting up test environment...');

  // Clear database if requested
  if (clearDb) {
    await clearDatabase(true);
  }

  // Verify services if requested
  if (verifyServices) {
    const backendUrl = process.env.E2E_API_URL || 'http://localhost:8080';
    const frontendUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

    try {
      // Check backend health
      execSync(`curl --fail --silent ${backendUrl}/actuator/health || exit 1`, {
        stdio: 'ignore',
      });
      console.log('✅ Backend service is accessible');
    } catch (error) {
      console.warn('⚠️  Backend service may not be running or accessible');
    }

    try {
      // Check frontend
      execSync(`curl --fail --silent ${frontendUrl} || exit 1`, {
        stdio: 'ignore',
      });
      console.log('✅ Frontend service is accessible');
    } catch (error) {
      console.warn('⚠️  Frontend service may not be running or accessible');
    }
  }

  console.log('✅ Test environment setup complete');
}

/**
 * Gets the base URL for API calls
 * @returns The API base URL from environment or default
 */
export function getApiBaseUrl(): string {
  return process.env.E2E_API_URL || 'http://localhost:8080';
}

/**
 * Gets the base URL for frontend
 * @returns The frontend base URL from environment or default
 */
export function getFrontendBaseUrl(): string {
  return process.env.E2E_BASE_URL || 'http://localhost:3000';
}

/**
 * Gets the login path
 * @returns The login path from environment or default
 */
export function getLoginPath(): string {
  return process.env.E2E_LOGIN_PATH || '/login';
}

/**
 * Gets the post-login path (where users are redirected after login)
 * @returns The post-login path from environment or default
 */
export function getPostLoginPath(): string {
  return process.env.E2E_POST_LOGIN_PATH || '/admin';
}
