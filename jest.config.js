/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^kubo-rpc-client$': '<rootDir>/node_modules/kubo-rpc-client/dist/src/index.js',
    '^uint8arrays/(.*)$': '<rootDir>/node_modules/uint8arrays/dist/src/$1.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uint8arrays)/)'
  ]
}; 