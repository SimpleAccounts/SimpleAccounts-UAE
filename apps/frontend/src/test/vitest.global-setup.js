// Global setup for Vitest - runs once before all tests
export default async function setup() {
  // Set up any global state needed before tests run
  console.log('Vitest global setup complete');
}

export async function teardown() {
  // Clean up after all tests complete
  console.log('Vitest global teardown complete');
}
