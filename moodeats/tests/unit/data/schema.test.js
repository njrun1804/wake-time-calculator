/**
 * Schema Validation Tests
 * Tests for meal data structure validation using JSON schema
 */

const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

describe('Meal Schema Validation', () => {
  let meals;
  let mealSchema;
  let ajv;
  let validate;

  beforeAll(() => {
    // Load actual meals data
    const mealsPath = path.join(__dirname, '../../../meals.json');
    const mealsContent = fs.readFileSync(mealsPath, 'utf8');
    meals = JSON.parse(mealsContent);

    // Load schema
    const schemaPath = path.join(__dirname, '../../fixtures/meal-schema.json');
    mealSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    // Setup AJV validator
    ajv = new Ajv({ allErrors: true });
    validate = ajv.compile(mealSchema);
  });

  describe('All Meals Schema Compliance', () => {
    test('all meals match the defined schema', () => {
      const invalidMeals = [];

      meals.forEach((meal, index) => {
        const valid = validate(meal);
        if (!valid) {
          invalidMeals.push({
            index,
            name: meal.name,
            errors: validate.errors
          });
        }
      });

      if (invalidMeals.length > 0) {
        console.error('Invalid meals found:', invalidMeals);
        invalidMeals.forEach(invalid => {
          console.error(`Meal "${invalid.name}" (index ${invalid.index}):`, invalid.errors);
        });
      }

      expect(invalidMeals).toEqual([]);
    });

    test('all meals have required fields', () => {
      const requiredFields = ['name', 'category', 'moods', 'ingredients', 'searchTerms'];

      meals.forEach(meal => {
        requiredFields.forEach(field => {
          expect(meal).toHaveProperty(field);
          expect(meal[field]).toBeDefined();
          expect(meal[field]).not.toBeNull();
        });
      });
    });

    test('all meal names are unique', () => {
      const names = meals.map(m => m.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    test('all meal names are reasonable length', () => {
      meals.forEach(meal => {
        expect(meal.name.length).toBeGreaterThan(0);
        expect(meal.name.length).toBeLessThanOrEqual(50);
        expect(typeof meal.name).toBe('string');
      });
    });
  });

  describe('Category Validation', () => {
    const validCategories = ['breakfast', 'italian', 'japanese', 'chinese', 'texmex', 'seafood', 'soup', 'sandwich', 'side'];

    test('all categories are valid', () => {
      meals.forEach(meal => {
        expect(validCategories).toContain(meal.category);
      });
    });

    test('each valid category has at least one meal', () => {
      validCategories.forEach(category => {
        const categoryMeals = meals.filter(m => m.category === category);
        expect(categoryMeals.length).toBeGreaterThan(0);
      });
    });

    test('category distribution is reasonable', () => {
      const categoryCounts = {};
      validCategories.forEach(cat => categoryCounts[cat] = 0);

      meals.forEach(meal => {
        categoryCounts[meal.category]++;
      });

      // Each category should have at least 2 meals, none should dominate
      Object.values(categoryCounts).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThan(meals.length * 0.4); // No category > 40% of meals
      });
    });
  });

  describe('Mood Validation', () => {
    const validMoods = ['cozy', 'fresh', 'hearty', 'quick', 'breakfast', 'seafood', 'asian', 'italian'];

    test('all moods are valid', () => {
      meals.forEach(meal => {
        expect(Array.isArray(meal.moods)).toBe(true);
        expect(meal.moods.length).toBeGreaterThan(0);

        meal.moods.forEach(mood => {
          expect(validMoods).toContain(mood);
        });
      });
    });

    test('each valid mood has at least one meal', () => {
      validMoods.forEach(mood => {
        const moodMeals = meals.filter(m => m.moods.includes(mood));
        expect(moodMeals.length).toBeGreaterThan(0);
      });
    });

    test('breakfast mood correlates with breakfast category', () => {
      meals.forEach(meal => {
        // Breakfast mood should correlate with breakfast category (this is the main rule)
        if (meal.moods.includes('breakfast')) {
          expect(meal.category).toBe('breakfast');
        }
      });
    });

    test('seafood category meals have seafood mood', () => {
      const seafoodCategoryMeals = meals.filter(m => m.category === 'seafood');
      seafoodCategoryMeals.forEach(meal => {
        expect(meal.moods).toContain('seafood');
      });
    });
  });

  describe('Ingredients Validation', () => {
    test('all meals have core ingredients', () => {
      meals.forEach(meal => {
        expect(meal.ingredients).toHaveProperty('core');
        expect(meal.ingredients).toHaveProperty('pantry');
        expect(Array.isArray(meal.ingredients.core)).toBe(true);
        expect(Array.isArray(meal.ingredients.pantry)).toBe(true);
        expect(meal.ingredients.core.length).toBeGreaterThan(0);
      });
    });

    test('ingredient strings are non-empty', () => {
      meals.forEach(meal => {
        meal.ingredients.core.forEach(ingredient => {
          expect(typeof ingredient).toBe('string');
          expect(ingredient.length).toBeGreaterThan(0);
          expect(ingredient.trim().length).toBeGreaterThan(0);
        });

        meal.ingredients.pantry.forEach(ingredient => {
          expect(typeof ingredient).toBe('string');
          expect(ingredient.length).toBeGreaterThan(0);
          expect(ingredient.trim().length).toBeGreaterThan(0);
        });
      });
    });

    test('ingredients follow naming conventions', () => {
      meals.forEach(meal => {
        [...meal.ingredients.core, ...meal.ingredients.pantry].forEach(ingredient => {
          // Should be properly capitalized
          expect(ingredient.charAt(0)).toBe(ingredient.charAt(0).toUpperCase());
          // Should not end with punctuation
          expect(ingredient).not.toMatch(/[.!?]$/);
          // Should be reasonable length
          expect(ingredient.length).toBeLessThan(50);
        });
      });
    });
  });

  describe('Search Terms Validation', () => {
    test('all meals have search terms', () => {
      meals.forEach(meal => {
        expect(Array.isArray(meal.searchTerms)).toBe(true);
        expect(meal.searchTerms.length).toBeGreaterThan(0);

        meal.searchTerms.forEach(term => {
          expect(typeof term).toBe('string');
          expect(term.length).toBeGreaterThan(0);
        });
      });
    });

    test('search terms include meal name keywords', () => {
      meals.forEach(meal => {
        const nameWords = meal.name.toLowerCase().split(/\s+/);
        const searchTermsLower = meal.searchTerms.map(t => t.toLowerCase());

        // At least one word from the name should be in search terms
        const hasNameKeyword = nameWords.some(word =>
          searchTermsLower.some(term => term.includes(word) || word.includes(term))
        );

        expect(hasNameKeyword).toBe(true);
      });
    });

    test('search terms are lowercase', () => {
      meals.forEach(meal => {
        meal.searchTerms.forEach(term => {
          expect(term).toBe(term.toLowerCase());
        });
      });
    });
  });

  describe('Nutrition Data Validation', () => {
    test('nutrition data is valid when present', () => {
      meals.forEach(meal => {
        if (meal.nutrition) {
          // All nutrition values should be non-negative numbers
          Object.values(meal.nutrition).forEach(value => {
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(value)).toBe(true);
          });

          // Reasonable calorie ranges
          if (meal.nutrition.calories) {
            expect(meal.nutrition.calories).toBeGreaterThan(50); // Minimum reasonable calories
            expect(meal.nutrition.calories).toBeLessThan(2000); // Maximum reasonable calories for single meal
          }

          // Reasonable protein ranges
          if (meal.nutrition.protein) {
            expect(meal.nutrition.protein).toBeLessThan(100); // Very high protein limit
          }

          // Reasonable carb ranges
          if (meal.nutrition.carbs) {
            expect(meal.nutrition.carbs).toBeLessThan(150); // Very high carb limit
          }

          // Reasonable fat ranges
          if (meal.nutrition.fat) {
            expect(meal.nutrition.fat).toBeLessThan(80); // Very high fat limit
          }
        }
      });
    });

    test('nutrition data structure is valid when present', () => {
      const mealsWithNutrition = meals.filter(meal => meal.nutrition && Object.keys(meal.nutrition).length > 0);

      // If nutrition data exists, it should be well-formed
      mealsWithNutrition.forEach(meal => {
        Object.values(meal.nutrition).forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(value)).toBe(true);
        });
      });

      // This is okay - nutrition data is optional
      expect(mealsWithNutrition.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Consistency', () => {
    test('breakfast category meals have breakfast mood', () => {
      const breakfastCategoryMeals = meals.filter(m => m.category === 'breakfast');
      breakfastCategoryMeals.forEach(meal => {
        expect(meal.moods).toContain('breakfast');
      });
    });

    test('seafood category meals have seafood mood', () => {
      const seafoodCategoryMeals = meals.filter(m => m.category === 'seafood');
      seafoodCategoryMeals.forEach(meal => {
        expect(meal.moods).toContain('seafood');
      });
    });

    test('no duplicate meals with identical content', () => {
      for (let i = 0; i < meals.length; i++) {
        for (let j = i + 1; j < meals.length; j++) {
          const meal1 = meals[i];
          const meal2 = meals[j];

          // Names should be unique
          expect(meal1.name).not.toBe(meal2.name);

          // Even if names are similar, content should differ significantly
          const similarName = meal1.name.toLowerCase().replace(/\s+/g, '') === meal2.name.toLowerCase().replace(/\s+/g, '');
          if (similarName) {
            const sameCategory = meal1.category === meal2.category;
            const sameMoods = JSON.stringify(meal1.moods.sort()) === JSON.stringify(meal2.moods.sort());
            const sameCore = JSON.stringify(meal1.ingredients.core.sort()) === JSON.stringify(meal2.ingredients.core.sort());

            // If names are very similar, other attributes should differ
            expect(sameCategory && sameMoods && sameCore).toBe(false);
          }
        }
      }
    });
  });
});