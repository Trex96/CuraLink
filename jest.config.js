module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/types$': '<rootDir>/types/index',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};