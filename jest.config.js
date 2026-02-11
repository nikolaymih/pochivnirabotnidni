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
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!lib/calendar/bridgeDays.test.ts', // Exclude test files
    '!lib/calendar/dates.test.ts',
    '!lib/vacation/rollover.test.ts',
    '!lib/avatar/initials.test.ts',
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
