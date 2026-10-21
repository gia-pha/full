// Contract tests run in a node environment (they drive the real fetch-based
// service code against a Pact mock provider) and are executed separately via
// `pnpm test:contracts`.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/contracts/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
