import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './', // backend root
  testMatch: ['<rootDir>/test/**/*.spec.ts'], // tests 
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', 
  },
  coverageDirectory: '<rootDir>/coverage',
};

export default config;