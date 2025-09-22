/**
 * LocalStorage Tests
 * Tests for localStorage operations and data persistence
 */

// Mock localStorage for Node.js testing environment
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

// Mock implementation of localStorage functions from the app
function saveMealSelection(slot, meal) {
  const key = `moodeats:${slot}`;
  localStorage.setItem(key, JSON.stringify(meal));
}

function loadMealSelection(slot) {
  const key = `moodeats:${slot}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Invalid JSON in localStorage for key:', key);
    return null;
  }
}

function clearMealSelection(slot) {
  const key = `moodeats:${slot}`;
  localStorage.removeItem(key);
}

function saveRecentMeals(meals) {
  localStorage.setItem('moodeats:recentMeals', JSON.stringify(meals));
}

function loadRecentMeals() {
  const stored = localStorage.getItem('moodeats:recentMeals');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Invalid JSON in recentMeals localStorage');
    return [];
  }
}

function clearAllMealSelections() {
  ['breakfast', 'lunch', 'dinner'].forEach(slot => {
    clearMealSelection(slot);
  });
}

describe('LocalStorage Operations', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    global.localStorage = mockLocalStorage;

    // Clear storage before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Meal Selection Storage', () => {
    const testMeal = {
      name: 'Test Chicken Teriyaki',
      category: 'japanese',
      moods: ['hearty', 'quick', 'asian'],
      nutrition: { calories: 580, protein: 45, carbs: 62, fat: 12 }
    };

    test('saves meal selection correctly', () => {
      saveMealSelection('lunch', testMeal);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'moodeats:lunch',
        JSON.stringify(testMeal)
      );
    });

    test('loads meal selection correctly', () => {
      // Setup storage with test data
      mockLocalStorage.setItem('moodeats:breakfast', JSON.stringify(testMeal));

      const loaded = loadMealSelection('breakfast');

      expect(localStorage.getItem).toHaveBeenCalledWith('moodeats:breakfast');
      expect(loaded).toEqual(testMeal);
    });

    test('returns null for non-existent meal selection', () => {
      const loaded = loadMealSelection('dinner');

      expect(loaded).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('moodeats:dinner');
    });

    test('clears meal selection correctly', () => {
      clearMealSelection('lunch');

      expect(localStorage.removeItem).toHaveBeenCalledWith('moodeats:lunch');
    });

    test('handles corrupted JSON gracefully', () => {
      // Set invalid JSON
      mockLocalStorage.setItem('moodeats:lunch', 'invalid json {');

      const loaded = loadMealSelection('lunch');
      expect(loaded).toBeNull();
    });

    test('saves all three meal slots independently', () => {
      const breakfast = { name: 'Eggs', category: 'breakfast' };
      const lunch = { name: 'Salad', category: 'sandwich' };
      const dinner = { name: 'Pasta', category: 'italian' };

      saveMealSelection('breakfast', breakfast);
      saveMealSelection('lunch', lunch);
      saveMealSelection('dinner', dinner);

      expect(loadMealSelection('breakfast')).toEqual(breakfast);
      expect(loadMealSelection('lunch')).toEqual(lunch);
      expect(loadMealSelection('dinner')).toEqual(dinner);
    });
  });

  describe('Recent Meals Storage', () => {
    const recentMeals = [
      { name: 'Recent 1', category: 'italian' },
      { name: 'Recent 2', category: 'japanese' },
      { name: 'Recent 3', category: 'chinese' }
    ];

    test('saves recent meals correctly', () => {
      saveRecentMeals(recentMeals);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'moodeats:recentMeals',
        JSON.stringify(recentMeals)
      );
    });

    test('loads recent meals correctly', () => {
      mockLocalStorage.setItem('moodeats:recentMeals', JSON.stringify(recentMeals));

      const loaded = loadRecentMeals();

      expect(loaded).toEqual(recentMeals);
      expect(localStorage.getItem).toHaveBeenCalledWith('moodeats:recentMeals');
    });

    test('returns empty array for no recent meals', () => {
      const loaded = loadRecentMeals();

      expect(loaded).toEqual([]);
    });

    test('handles corrupted recent meals JSON', () => {
      mockLocalStorage.setItem('moodeats:recentMeals', 'corrupted');

      const loaded = loadRecentMeals();

      // Should return empty array on error
      expect(Array.isArray(loaded)).toBe(true);
      expect(loaded.length).toBe(0);
    });
  });

  describe('Bulk Operations', () => {
    test('clears all meal selections', () => {
      // Setup some stored meals
      saveMealSelection('breakfast', { name: 'Eggs' });
      saveMealSelection('lunch', { name: 'Salad' });
      saveMealSelection('dinner', { name: 'Pasta' });

      clearAllMealSelections();

      expect(localStorage.removeItem).toHaveBeenCalledWith('moodeats:breakfast');
      expect(localStorage.removeItem).toHaveBeenCalledWith('moodeats:lunch');
      expect(localStorage.removeItem).toHaveBeenCalledWith('moodeats:dinner');
    });

    test('verifies all storage keys use moodeats prefix', () => {
      saveMealSelection('breakfast', { name: 'Test' });
      saveMealSelection('lunch', { name: 'Test' });
      saveMealSelection('dinner', { name: 'Test' });
      saveRecentMeals([{ name: 'Test' }]);

      const setItemCalls = localStorage.setItem.mock.calls;
      setItemCalls.forEach(call => {
        const key = call[0];
        expect(key).toMatch(/^moodeats:/);
      });
    });
  });

  describe('Storage Limits and Edge Cases', () => {
    test('handles very large meal objects', () => {
      const largeMeal = {
        name: 'Large Meal',
        category: 'italian',
        moods: ['hearty'],
        ingredients: {
          core: new Array(100).fill('Large ingredient'),
          pantry: new Array(50).fill('Pantry item')
        },
        searchTerms: new Array(200).fill('search term'),
        description: 'A'.repeat(1000)
      };

      expect(() => {
        saveMealSelection('lunch', largeMeal);
        const loaded = loadMealSelection('lunch');
        expect(loaded.name).toBe(largeMeal.name);
      }).not.toThrow();
    });

    test('handles special characters in meal names', () => {
      const specialMeal = {
        name: 'Meal with "quotes" & <tags> and émojiś 🍕',
        category: 'italian',
        moods: ['cozy']
      };

      saveMealSelection('dinner', specialMeal);
      const loaded = loadMealSelection('dinner');

      expect(loaded.name).toBe(specialMeal.name);
    });

    test('handles empty meal objects', () => {
      const emptyMeal = {};

      saveMealSelection('breakfast', emptyMeal);
      const loaded = loadMealSelection('breakfast');

      expect(loaded).toEqual(emptyMeal);
    });

    test('handles null and undefined values', () => {
      saveMealSelection('lunch', null);
      const loadedNull = loadMealSelection('lunch');
      expect(loadedNull).toBeNull();

      saveMealSelection('dinner', undefined);
      const loadedUndefined = loadMealSelection('dinner');
      // JSON.stringify(undefined) returns undefined, which becomes null in storage
      expect(loadedUndefined).toBeNull();
    });
  });

  describe('Migration and Compatibility', () => {
    test('handles old storage format gracefully', () => {
      // Simulate old format without prefix
      mockLocalStorage.setItem('breakfast', JSON.stringify({ name: 'Old Format' }));

      // Should not interfere with new format
      const loaded = loadMealSelection('breakfast');
      expect(loaded).toBeNull(); // New format looks for 'moodeats:breakfast'
    });

    test('handles multiple versions of the same meal', () => {
      const mealV1 = { name: 'Chicken', category: 'japanese' };
      const mealV2 = {
        name: 'Chicken Teriyaki',
        category: 'japanese',
        moods: ['hearty'],
        nutrition: { calories: 500 }
      };

      // Save v1, then update to v2
      saveMealSelection('lunch', mealV1);
      saveMealSelection('lunch', mealV2);

      const loaded = loadMealSelection('lunch');
      expect(loaded).toEqual(mealV2);
      expect(loaded.nutrition).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('localStorage operations complete quickly', () => {
      const testMeal = { name: 'Performance Test', category: 'test' };
      const iterations = 100;

      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        saveMealSelection('test', testMeal);
        loadMealSelection('test');
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete 100 operations in under 100ms (very generous)
      expect(totalTime).toBeLessThan(100);
    });
  });
});