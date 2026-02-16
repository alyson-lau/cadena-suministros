// tests/setup.js - Jest setup file
beforeAll(async () => {
  // Configuración global de timeouts
  jest.setTimeout(30000);
});

afterEach(() => {
  // Limpiar mocks después de cada test
  jest.clearAllMocks();
});

// Suppressing console warnings during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('mongoose') ||
       args[0].includes('Warning'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('experimental') ||
       args[0].includes('deprecated'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
