module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: "node",
  preset: 'ts-jest',
  forceExit: true,
  moduleNameMapper: {
    '^@App/(.*)$': '<rootDir>/src/$1',
    '^lib/(.*)$': '<rootDir>/common/$1'
  }
};
