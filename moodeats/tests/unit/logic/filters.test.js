/**
 * Filter Logic Tests
 * Tests for meal filtering by mood, category, and combinations
 */

const testMeals = require('../../fixtures/test-meals.json');

// Helper functions matching app logic
function filterMealsByMood(meals, mood) {
  if (!meals) return meals; // Handle null/undefined
  if (!mood || mood === 'all') return meals;
  return meals.filter(meal => meal.moods && meal.moods.includes(mood));
}

function filterMealsByMultipleMoods(meals, moods) {
  if (!moods || moods.length === 0) return meals;
  return meals.filter(meal => {
    if (!meal.moods) return false;
    return moods.every(mood => meal.moods.includes(mood));
  });
}

function filterMealsByCategory(meals, category) {
  if (!category) return meals;
  return meals.filter(meal => meal.category === category);
}

function filterBreakfastMeals(meals, isBreakfastTime) {
  if (isBreakfastTime) {
    return meals.filter(meal => meal.moods && meal.moods.includes('breakfast'));
  } else {
    return meals.filter(meal => !meal.moods || !meal.moods.includes('breakfast'));
  }
}

function getUniqueMoods(meals) {
  const moodsSet = new Set();
  meals.forEach(meal => {
    if (meal.moods) {
      meal.moods.forEach(mood => moodsSet.add(mood));
    }
  });
  return Array.from(moodsSet);
}

describe('Meal Filtering Logic', () => {
  const allMeals = [...testMeals.minimal, ...testMeals.standard];

  describe('Single Mood Filtering', () => {
    test('filters by breakfast mood correctly', () => {
      const breakfastMeals = filterMealsByMood(allMeals, 'breakfast');

      expect(breakfastMeals.length).toBeGreaterThan(0);
      breakfastMeals.forEach(meal => {
        expect(meal.moods).toContain('breakfast');
      });
    });

    test('filters by fresh mood correctly', () => {
      const freshMeals = filterMealsByMood(allMeals, 'fresh');

      expect(freshMeals.length).toBeGreaterThan(0);
      freshMeals.forEach(meal => {
        expect(meal.moods).toContain('fresh');
      });
    });

    test('filters by hearty mood correctly', () => {
      const heartyMeals = filterMealsByMood(allMeals, 'hearty');

      expect(heartyMeals.length).toBeGreaterThan(0);
      heartyMeals.forEach(meal => {
        expect(meal.moods).toContain('hearty');
      });
    });

    test('returns all meals when mood is "all"', () => {
      const filtered = filterMealsByMood(allMeals, 'all');
      expect(filtered.length).toBe(allMeals.length);
    });

    test('returns empty array for non-existent mood', () => {
      const filtered = filterMealsByMood(allMeals, 'nonexistent');
      expect(filtered.length).toBe(0);
    });

    test('handles meals without moods array', () => {
      const mealsWithoutMoods = [
        { name: 'No Mood Meal', category: 'lunch' },
        ...allMeals
      ];

      const filtered = filterMealsByMood(mealsWithoutMoods, 'fresh');
      filtered.forEach(meal => {
        expect(meal.moods).toContain('fresh');
      });
    });
  });

  describe('Multiple Mood Filtering (AND logic)', () => {
    test('filters meals with both quick AND hearty moods', () => {
      const filtered = filterMealsByMultipleMoods(allMeals, ['quick', 'hearty']);

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(meal => {
        expect(meal.moods).toContain('quick');
        expect(meal.moods).toContain('hearty');
      });
    });

    test('filters meals with breakfast AND quick moods', () => {
      const filtered = filterMealsByMultipleMoods(allMeals, ['breakfast', 'quick']);

      // Test Scrambled Eggs should match
      const hasTestEggs = filtered.some(meal => meal.name === 'Test Scrambled Eggs');
      expect(hasTestEggs).toBe(true);

      filtered.forEach(meal => {
        expect(meal.moods).toContain('breakfast');
        expect(meal.moods).toContain('quick');
      });
    });

    test('returns empty array when no meals match all moods', () => {
      const filtered = filterMealsByMultipleMoods(allMeals, ['breakfast', 'seafood', 'italian']);
      expect(filtered.length).toBe(0);
    });

    test('handles empty moods array', () => {
      const filtered = filterMealsByMultipleMoods(allMeals, []);
      expect(filtered.length).toBe(allMeals.length);
    });

    test('filters with three moods correctly', () => {
      const filtered = filterMealsByMultipleMoods(allMeals, ['hearty', 'asian', 'quick']);

      // Chicken Teriyaki Bowl should match
      const hasChickenTeriyaki = filtered.some(meal => meal.name === 'Chicken Teriyaki Bowl');
      expect(hasChickenTeriyaki).toBe(true);

      filtered.forEach(meal => {
        expect(meal.moods).toContain('hearty');
        expect(meal.moods).toContain('asian');
        expect(meal.moods).toContain('quick');
      });
    });
  });

  describe('Category Filtering', () => {
    test('filters by breakfast category', () => {
      const breakfastCat = filterMealsByCategory(allMeals, 'breakfast');

      expect(breakfastCat.length).toBeGreaterThan(0);
      breakfastCat.forEach(meal => {
        expect(meal.category).toBe('breakfast');
      });
    });

    test('filters by italian category', () => {
      const italianCat = filterMealsByCategory(allMeals, 'italian');

      expect(italianCat.length).toBeGreaterThan(0);
      italianCat.forEach(meal => {
        expect(meal.category).toBe('italian');
      });
    });

    test('returns empty array for non-existent category', () => {
      const filtered = filterMealsByCategory(allMeals, 'invalid');
      expect(filtered.length).toBe(0);
    });
  });

  describe('Breakfast/Non-Breakfast Filtering', () => {
    test('filters breakfast meals for morning', () => {
      const breakfastOnly = filterBreakfastMeals(allMeals, true);

      expect(breakfastOnly.length).toBeGreaterThan(0);
      breakfastOnly.forEach(meal => {
        expect(meal.moods).toContain('breakfast');
      });
    });

    test('excludes breakfast meals for lunch/dinner', () => {
      const nonBreakfast = filterBreakfastMeals(allMeals, false);

      expect(nonBreakfast.length).toBeGreaterThan(0);
      nonBreakfast.forEach(meal => {
        if (meal.moods) {
          expect(meal.moods).not.toContain('breakfast');
        }
      });
    });

    test('breakfast and non-breakfast are mutually exclusive', () => {
      const breakfast = filterBreakfastMeals(allMeals, true);
      const nonBreakfast = filterBreakfastMeals(allMeals, false);

      // Combined should equal total
      expect(breakfast.length + nonBreakfast.length).toBe(allMeals.length);

      // No overlap
      breakfast.forEach(meal => {
        expect(nonBreakfast).not.toContainEqual(meal);
      });
    });
  });

  describe('Complex Filter Combinations', () => {
    test('combines mood and category filters', () => {
      // First filter by category
      let filtered = filterMealsByCategory(allMeals, 'japanese');
      // Then filter by mood
      filtered = filterMealsByMood(filtered, 'hearty');

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(meal => {
        expect(meal.category).toBe('japanese');
        expect(meal.moods).toContain('hearty');
      });
    });

    test('breakfast time with additional mood filter', () => {
      // Get breakfast meals
      let filtered = filterBreakfastMeals(allMeals, true);
      // Then filter for quick breakfast
      filtered = filterMealsByMood(filtered, 'quick');

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(meal => {
        expect(meal.moods).toContain('breakfast');
        expect(meal.moods).toContain('quick');
      });
    });
  });

  describe('Mood Discovery', () => {
    test('extracts all unique moods from meals', () => {
      const moods = getUniqueMoods(allMeals);

      expect(moods).toContain('breakfast');
      expect(moods).toContain('fresh');
      expect(moods).toContain('hearty');
      expect(moods).toContain('quick');
      expect(moods).toContain('cozy');
      expect(moods).toContain('asian');
      expect(moods).toContain('italian');
      expect(moods).toContain('seafood');
    });

    test('handles meals without moods in unique extraction', () => {
      const mealsWithMissing = [
        { name: 'No Moods', category: 'lunch' },
        ...testMeals.minimal
      ];

      const moods = getUniqueMoods(mealsWithMissing);
      expect(moods.length).toBeGreaterThan(0);
      expect(moods).not.toContain(undefined);
      expect(moods).not.toContain(null);
    });
  });

  describe('Edge Cases', () => {
    test('handles null meals array', () => {
      expect(filterMealsByMood(null, 'fresh')).toEqual(null);
      expect(filterMealsByMood(undefined, 'fresh')).toEqual(undefined);
    });

    test('handles empty meals array', () => {
      const filtered = filterMealsByMood([], 'fresh');
      expect(filtered).toEqual([]);
    });

    test('handles meals with empty moods array', () => {
      const mealsWithEmpty = [
        { name: 'Empty Moods', moods: [], category: 'lunch' }
      ];

      const filtered = filterMealsByMood(mealsWithEmpty, 'fresh');
      expect(filtered.length).toBe(0);
    });
  });
});