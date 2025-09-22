/**
 * Nutrition Calculation Tests
 * Tests for meal nutrition calculations and daily totals
 */

// Helper functions that match the app's logic
function calculateDailyTotals(meals) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  meals.forEach(meal => {
    if (meal && meal.nutrition) {
      totals.calories += meal.nutrition.calories || 0;
      totals.protein += meal.nutrition.protein || 0;
      totals.carbs += meal.nutrition.carbs || 0;
      totals.fat += meal.nutrition.fat || 0;
    }
  });

  return totals;
}

function formatNutritionDisplay(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return Math.round(value).toString();
}

describe('Nutrition Calculations', () => {
  describe('Daily Totals', () => {
    test('correctly sums daily totals for complete nutrition data', () => {
      const meals = [
        { nutrition: { calories: 500, protein: 30, carbs: 50, fat: 20 } },
        { nutrition: { calories: 600, protein: 40, carbs: 60, fat: 25 } },
        { nutrition: { calories: 700, protein: 35, carbs: 80, fat: 30 } }
      ];

      const totals = calculateDailyTotals(meals);
      expect(totals.calories).toBe(1800);
      expect(totals.protein).toBe(105);
      expect(totals.carbs).toBe(190);
      expect(totals.fat).toBe(75);
    });

    test('handles missing nutrition data gracefully', () => {
      const meals = [
        { nutrition: { calories: 500 } }, // Partial data
        { }, // No nutrition field
        { nutrition: { calories: 600, protein: 40 } },
        null, // Null meal
        undefined // Undefined meal
      ];

      const totals = calculateDailyTotals(meals);
      expect(totals.calories).toBe(1100);
      expect(totals.protein).toBe(40);
      expect(totals.carbs).toBe(0);
      expect(totals.fat).toBe(0);
    });

    test('handles partial nutrition data correctly', () => {
      const meals = [
        { nutrition: { calories: 400, protein: 25, carbs: 45 } }, // Missing fat
        { nutrition: { calories: 500, fat: 20 } }, // Missing protein and carbs
        { nutrition: { protein: 30, carbs: 50, fat: 15 } } // Missing calories
      ];

      const totals = calculateDailyTotals(meals);
      expect(totals.calories).toBe(900);
      expect(totals.protein).toBe(55);
      expect(totals.carbs).toBe(95);
      expect(totals.fat).toBe(35);
    });

    test('returns zeros for empty meal array', () => {
      const meals = [];
      const totals = calculateDailyTotals(meals);

      expect(totals.calories).toBe(0);
      expect(totals.protein).toBe(0);
      expect(totals.carbs).toBe(0);
      expect(totals.fat).toBe(0);
    });

    test('handles negative nutrition values', () => {
      const meals = [
        { nutrition: { calories: -100, protein: 20, carbs: 30, fat: 10 } },
        { nutrition: { calories: 500, protein: -5, carbs: 50, fat: 20 } }
      ];

      const totals = calculateDailyTotals(meals);
      // Should still sum even negative values (edge case handling)
      expect(totals.calories).toBe(400);
      expect(totals.protein).toBe(15);
      expect(totals.carbs).toBe(80);
      expect(totals.fat).toBe(30);
    });
  });

  describe('Nutrition Display Formatting', () => {
    test('formats valid numbers correctly', () => {
      expect(formatNutritionDisplay(45.7)).toBe('46');
      expect(formatNutritionDisplay(100)).toBe('100');
      expect(formatNutritionDisplay(0)).toBe('0');
      expect(formatNutritionDisplay(999.9)).toBe('1000');
    });

    test('handles invalid values', () => {
      expect(formatNutritionDisplay(null)).toBe('0');
      expect(formatNutritionDisplay(undefined)).toBe('0');
      expect(formatNutritionDisplay(NaN)).toBe('0');
      expect(formatNutritionDisplay('not a number')).toBe('0');
    });
  });

  describe('Meal Combinations', () => {
    test('calculates balanced day correctly', () => {
      const meals = [
        { name: 'Breakfast', nutrition: { calories: 400, protein: 20, carbs: 60, fat: 10 } },
        { name: 'Lunch', nutrition: { calories: 600, protein: 40, carbs: 70, fat: 20 } },
        { name: 'Dinner', nutrition: { calories: 700, protein: 50, carbs: 80, fat: 25 } }
      ];

      const totals = calculateDailyTotals(meals);

      // Check if within healthy daily ranges
      expect(totals.calories).toBeGreaterThanOrEqual(1500);
      expect(totals.calories).toBeLessThanOrEqual(2500);
      expect(totals.protein).toBeGreaterThanOrEqual(50);
      expect(totals.carbs).toBeGreaterThanOrEqual(130);
    });

    test('identifies high-calorie days', () => {
      const meals = [
        { nutrition: { calories: 800, protein: 30, carbs: 100, fat: 35 } },
        { nutrition: { calories: 900, protein: 40, carbs: 110, fat: 40 } },
        { nutrition: { calories: 1000, protein: 45, carbs: 120, fat: 45 } }
      ];

      const totals = calculateDailyTotals(meals);
      expect(totals.calories).toBeGreaterThan(2500);
    });

    test('handles single meal day', () => {
      const meals = [
        { nutrition: { calories: 650, protein: 45, carbs: 70, fat: 20 } }
      ];

      const totals = calculateDailyTotals(meals);
      expect(totals.calories).toBe(650);
      expect(totals.protein).toBe(45);
      expect(totals.carbs).toBe(70);
      expect(totals.fat).toBe(20);
    });
  });

  describe('Real Meal Data', () => {
    const testMeals = require('../../fixtures/test-meals.json');

    test('calculates totals for minimal test meals', () => {
      const totals = calculateDailyTotals(testMeals.minimal);

      expect(totals.calories).toBe(1150); // 250 + 380 + 520
      expect(totals.protein).toBe(68); // 18 + 35 + 15
      expect(totals.carbs).toBe(93); // 3 + 15 + 75
      expect(totals.fat).toBe(57); // 19 + 20 + 18
    });

    test('handles edge case meals correctly', () => {
      const totals = calculateDailyTotals(testMeals.edge);

      // Should handle missing and partial nutrition gracefully
      expect(totals.calories).toBe(500); // Only from "Partial Nutrition"
      expect(totals.protein).toBe(30); // Only from "Partial Nutrition"
      expect(totals.carbs).toBe(0); // No carbs data in edge cases
      expect(totals.fat).toBe(0); // No fat data in edge cases
    });
  });
});