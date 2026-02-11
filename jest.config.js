/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed from 'node' for React component testing
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx', // Added for component tests
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // RTL custom matchers
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    // Exclude infrastructure/config files (tested via E2E, not unit tests)
    '!lib/supabase/**', // Supabase client/middleware/server setup
    '!lib/offline/**', // Network detection, retry (tested via E2E)
    '!lib/holidays/types.ts', // Pure type definitions, no logic
    '!lib/vacation/types.ts', // Pure type definitions, no logic
    '!lib/constants.ts', // String constants, no logic
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
  coverageProvider: 'v8', // Faster than babel
};

module.exports = config;
