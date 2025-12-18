import nextJest from 'next/jest'
import type { Config } from 'jest'

const createJestConfig = nextJest({
  dir: './',
})

const customConfig: Config = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  cache: true,
  maxWorkers: '50%',
  testTimeout: 10000,
  verbose: false, 

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@/client/(.*)$': '<rootDir>/client/$1',
    '^@/server/(.*)$': '<rootDir>/server/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
  },
  roots: ['<rootDir>/client', '<rootDir>/server', '<rootDir>/shared'],
  testMatch: [
    '**/?(*.)+(test|spec).[tj]s?(x)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'client/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!shared/database/**',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: [
    'text',
    'text-summary',
    'json',
    'lcov',
    'clover',
    'html',
  ],

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

export default createJestConfig(customConfig)
