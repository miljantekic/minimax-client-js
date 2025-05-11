// This file will run before all tests
// It's useful for setting up global mocks or configurations

// Example: Setting up global timeout
jest.setTimeout(30000); // 30 seconds

// Example: Suppress console logs during tests (optional)
// Uncomment if you want to suppress console output during tests
/*
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // Keep error and warn for debugging purposes
  // error: jest.fn(),
  // warn: jest.fn(),
};
*/
