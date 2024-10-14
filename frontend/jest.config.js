// jest.config.js
module.exports = {
    testEnvironment: 'jsdom', // Set the environment to jsdom
    moduleNameMapper: {
      '^@components/(.*)$': '<rootDir>/src/components/$1',
    },
  };