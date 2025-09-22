/**
 * Jest Unit Tests for MoodEats
 */

const fs = require('fs');
const path = require('path');

describe('Meals Data', () => {
  let meals;

  beforeAll(() => {
    const mealsPath = path.join(__dirname, '../../meals.json');
    const mealsContent = fs.readFileSync(mealsPath, 'utf8');
    meals = JSON.parse(mealsContent);
  });

  test('should have at least 70 meals', () => {
    expect(meals.length).toBeGreaterThanOrEqual(70);
  });

  test('should have exactly 76 meals', () => {
    expect(meals.length).toBe(76);
  });

  test('all meals should have required fields', () => {
    meals.forEach(meal => {
      expect(meal).toHaveProperty('name');
      expect(meal).toHaveProperty('category');
      expect(meal).toHaveProperty('moods');
      expect(meal).toHaveProperty('ingredients');
      expect(meal).toHaveProperty('searchTerms');

      expect(Array.isArray(meal.moods)).toBe(true);
      expect(Array.isArray(meal.searchTerms)).toBe(true);
      expect(meal.ingredients).toHaveProperty('core');
      expect(meal.ingredients).toHaveProperty('pantry');
    });
  });

  test('should have no duplicate meal names', () => {
    const names = meals.map(m => m.name);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);
  });

  describe('Mood Coverage', () => {
    const moods = ['breakfast', 'fresh', 'cozy', 'hearty', 'quick', 'seafood', 'asian', 'italian'];

    moods.forEach(mood => {
      test(`should have meals for ${mood} mood`, () => {
        const moodMeals = meals.filter(m => m.moods.includes(mood));
        expect(moodMeals.length).toBeGreaterThan(0);
      });
    });

    test('breakfast mood should have at least 10 meals', () => {
      const breakfastMeals = meals.filter(m => m.moods.includes('breakfast'));
      expect(breakfastMeals.length).toBeGreaterThanOrEqual(10);
    });

    test('hearty mood should have at least 20 meals', () => {
      const heartyMeals = meals.filter(m => m.moods.includes('hearty'));
      expect(heartyMeals.length).toBeGreaterThanOrEqual(20);
    });

    test('fresh mood should have at least 10 meals', () => {
      const freshMeals = meals.filter(m => m.moods.includes('fresh'));
      expect(freshMeals.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Search Terms', () => {
    test('toast search should return at least 3 results', () => {
      const toastMeals = meals.filter(m =>
        m.searchTerms.some(term => term.includes('toast')) ||
        m.name.toLowerCase().includes('toast')
      );
      expect(toastMeals.length).toBeGreaterThanOrEqual(3);
    });

    test('chicken search should return at least 10 results', () => {
      const chickenMeals = meals.filter(m =>
        m.searchTerms.some(term => term.includes('chicken')) ||
        m.name.toLowerCase().includes('chicken')
      );
      expect(chickenMeals.length).toBeGreaterThanOrEqual(10);
    });

    test('eggs search should return at least 5 results', () => {
      const eggMeals = meals.filter(m =>
        m.searchTerms.some(term => term.includes('egg')) ||
        m.name.toLowerCase().includes('egg')
      );
      expect(eggMeals.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Category Validation', () => {
    const validCategories = ['breakfast', 'italian', 'japanese', 'chinese', 'texmex', 'seafood', 'soup', 'sandwich', 'side'];

    test('all meals should have valid categories', () => {
      meals.forEach(meal => {
        expect(validCategories).toContain(meal.category);
      });
    });

    test('breakfast meals should have breakfast category', () => {
      const breakfastMoods = meals.filter(m => m.moods.includes('breakfast'));
      breakfastMoods.forEach(meal => {
        expect(meal.category).toBe('breakfast');
      });
    });
  });

  describe('Ingredients Validation', () => {
    test('all meals should have at least one core ingredient', () => {
      meals.forEach(meal => {
        expect(meal.ingredients.core.length).toBeGreaterThan(0);
      });
    });

    test('core ingredients should be non-empty strings', () => {
      meals.forEach(meal => {
        meal.ingredients.core.forEach(ingredient => {
          expect(typeof ingredient).toBe('string');
          expect(ingredient.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Specific Meals', () => {
    const importantMeals = [
      'Chicken Teriyaki',
      'Scrambled Eggs on Buttered Rye',
      'Salmon Teriyaki',
      'Turkey Taco Rice Bowl'
    ];

    importantMeals.forEach(mealName => {
      test(`${mealName} should exist`, () => {
        const meal = meals.find(m => m.name === mealName);
        expect(meal).toBeDefined();
      });
    });
  });

  describe('Filtering Logic', () => {
    test('breakfast/non-breakfast filtering should work correctly', () => {
      const breakfast = meals.filter(m => m.moods.includes('breakfast'));
      const nonBreakfast = meals.filter(m => !m.moods.includes('breakfast'));

      expect(breakfast.length).toBeGreaterThan(0);
      expect(nonBreakfast.length).toBeGreaterThan(0);
      expect(breakfast.length + nonBreakfast.length).toBe(meals.length);
    });

    test('quick meals should exist in multiple categories', () => {
      const quickMeals = meals.filter(m => m.moods.includes('quick'));
      const categories = new Set(quickMeals.map(m => m.category));
      expect(categories.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Search Performance', () => {
    test('pasta search should return at least 5 results', () => {
      const pastaMeals = meals.filter(m =>
        m.searchTerms.some(term => term.includes('pasta')) ||
        m.name.toLowerCase().includes('pasta')
      );
      expect(pastaMeals.length).toBeGreaterThanOrEqual(5);
    });

    test('salmon search should return at least 3 results', () => {
      const salmonMeals = meals.filter(m =>
        m.searchTerms.some(term => term.includes('salmon')) ||
        m.name.toLowerCase().includes('salmon')
      );
      expect(salmonMeals.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Data Consistency', () => {
    test('all seafood category meals should have seafood mood', () => {
      const seafoodCategory = meals.filter(m => m.category === 'seafood');
      const allHaveMood = seafoodCategory.every(m => m.moods.includes('seafood'));
      expect(allHaveMood).toBe(true);
    });

    test('meal names should be reasonable length', () => {
      meals.forEach(meal => {
        expect(meal.name.length).toBeLessThanOrEqual(50);
        expect(meal.name.length).toBeGreaterThan(0);
      });
    });

    test('all meals should have non-empty search terms', () => {
      meals.forEach(meal => {
        expect(meal.searchTerms.length).toBeGreaterThan(0);
        meal.searchTerms.forEach(term => {
          expect(term.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('Planner HTML Structure', () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.join(__dirname, '../../moodeats-planner.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  });

  test('should have embedded meals data', () => {
    expect(htmlContent).toContain('const embeddedMeals =');
  });

  test('should have all 8 mood buttons', () => {
    const moods = ['cozy', 'fresh', 'hearty', 'quick', 'breakfast', 'seafood', 'asian', 'italian'];
    moods.forEach(mood => {
      expect(htmlContent).toContain(`data-mood="${mood}"`);
    });
  });

  test('should call setupBrowseViewEventListeners after loadMeals', () => {
    const loadMealsMatch = htmlContent.match(/function loadMeals\(\)[\s\S]*?\n\s*}/);
    expect(loadMealsMatch).toBeTruthy();
    expect(loadMealsMatch[0]).toContain('setupBrowseViewEventListeners()');
  });

  test('should have no duplicate element IDs', () => {
    const idMatches = htmlContent.match(/id="([^"]+)"/g) || [];
    const ids = idMatches.map(m => m.replace(/id="|"/g, ''));
    const uniqueIds = new Set(ids);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    expect(duplicates).toEqual([]);
  });

  test('should have required functions defined', () => {
    const requiredFunctions = [
      'function loadMeals()',
      'function setupBrowseViewEventListeners()',
      'function selectMealForSlot(',
      'function displayModalMeals(',
      'function selectMeal(',
      'function updateSlotDisplay(',
      'function updateDailyTotals('
    ];

    requiredFunctions.forEach(func => {
      expect(htmlContent).toContain(func);
    });
  });

  test('should use localStorage with proper prefix', () => {
    const storageMatches = htmlContent.match(/localStorage\.(get|set)Item\(['"]([^'"]+)['"]/g) || [];
    storageMatches.forEach(match => {
      const keyMatch = match.match(/['"]([^'"]+)['"]/);
      if (keyMatch) {
        const key = keyMatch[1];
        expect(key).toMatch(/^moodeats:/);
      }
    });
  });
});