module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: 'tests/.*\\.test\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/interfaces/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: '<rootDir>/coverage'
};
