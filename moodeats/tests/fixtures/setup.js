/**
 * Jest Test Setup
 * Global test configuration and helpers
 */

// Mock localStorage for all tests
const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

// Setup global mocks
beforeEach(() => {
  // Reset localStorage mock
  mockLocalStorage.clear();
  jest.clearAllMocks();

  // Setup localStorage on window and global
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  global.localStorage = mockLocalStorage;
});

// Global test utilities
global.testUtils = {
  // Helper to create test meals
  createTestMeal: (overrides = {}) => ({
    name: 'Test Meal',
    category: 'italian',
    moods: ['hearty', 'cozy'],
    ingredients: {
      core: ['Test ingredient'],
      pantry: ['Salt']
    },
    searchTerms: ['test', 'meal'],
    nutrition: {
      calories: 500,
      protein: 30,
      carbs: 60,
      fat: 15
    },
    ...overrides
  }),

  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate test data
  generateMeals: (count, prefix = 'Test Meal') => {
    return Array.from({ length: count }, (_, i) => ({
      name: `${prefix} ${i + 1}`,
      category: ['breakfast', 'italian', 'japanese', 'chinese'][i % 4],
      moods: [['hearty'], ['fresh'], ['cozy'], ['quick']][i % 4],
      ingredients: {
        core: [`Ingredient ${i + 1}`],
        pantry: ['Salt', 'Pepper']
      },
      searchTerms: [`test${i + 1}`, 'meal']
    }));
  }
};

// Console error suppression for expected errors in tests
const originalError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('React does not recognize'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});

// Global timeout for all tests
jest.setTimeout(10000);