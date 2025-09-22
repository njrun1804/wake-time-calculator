#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

// Test results storage
let testResults = [];

// Test function
function test(name, testFn) {
    try {
        testFn();
        testResults.push({ name, passed: true });
        console.log(`${colors.green}✓${colors.reset} ${name}`);
        return true;
    } catch (error) {
        testResults.push({ name, passed: false, error: error.message });
        console.log(`${colors.red}✗${colors.reset} ${name}: ${error.message}`);
        return false;
    }
}

// Assert function
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Load and test meals.json
function runTests() {
    console.log('\n🧪 MoodEats Test Suite\n');
    console.log('='.repeat(50));

    // Load meals.json
    let meals;
    try {
        const mealsPath = path.join(__dirname, 'meals.json');
        const mealsContent = fs.readFileSync(mealsPath, 'utf8');
        meals = JSON.parse(mealsContent);
    } catch (error) {
        console.error(`${colors.red}Failed to load meals.json: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    // Test 1: Basic structure
    test('meals.json is valid JSON array', () => {
        assert(Array.isArray(meals), 'meals.json should be an array');
    });

    test('has at least 70 meals', () => {
        assert(meals.length >= 70, `Expected at least 70 meals, got ${meals.length}`);
    });

    // Test 2: Validate meal structure
    test('all meals have required fields', () => {
        meals.forEach((meal, index) => {
            assert(meal.name, `Meal at index ${index} missing name`);
            assert(meal.category, `${meal.name} missing category`);
            assert(Array.isArray(meal.moods), `${meal.name} moods is not an array`);
            assert(meal.ingredients, `${meal.name} missing ingredients`);
            assert(Array.isArray(meal.ingredients.core), `${meal.name} core ingredients is not an array`);
            assert(Array.isArray(meal.searchTerms), `${meal.name} searchTerms is not an array`);
        });
    });

    // Test 3: Breakfast meals
    test('at least 10 breakfast meals exist', () => {
        const breakfastMeals = meals.filter(m => m.moods.includes('breakfast'));
        assert(breakfastMeals.length >= 10, `Only ${breakfastMeals.length} breakfast meals found, need at least 10`);
    });

    test('all breakfast-mood meals have breakfast category', () => {
        const breakfastMeals = meals.filter(m => m.moods.includes('breakfast'));
        const wrongCategory = breakfastMeals.filter(m => m.category !== 'breakfast');
        assert(wrongCategory.length === 0, `${wrongCategory.length} breakfast meals have wrong category`);
    });

    // Test 4: Mood coverage
    const moods = ['cozy', 'fresh', 'hearty', 'quick', 'breakfast', 'seafood', 'asian', 'italian'];

    moods.forEach(mood => {
        test(`mood "${mood}" has meals`, () => {
            const moodMeals = meals.filter(m => m.moods.includes(mood));
            assert(moodMeals.length > 0, `No meals found for mood: ${mood}`);
        });
    });

    test('hearty mood has at least 20 meals', () => {
        const heartyMeals = meals.filter(m => m.moods.includes('hearty'));
        assert(heartyMeals.length >= 20, `Only ${heartyMeals.length} hearty meals, need at least 20`);
    });

    // Test 5: Search functionality
    test('toast search term exists in multiple meals', () => {
        const toastMeals = meals.filter(m =>
            m.searchTerms.some(term => term.toLowerCase().includes('toast'))
        );
        assert(toastMeals.length >= 3, `Only ${toastMeals.length} meals with 'toast' search term`);
    });

    // Test 6: No duplicates
    test('no duplicate meal names', () => {
        const names = meals.map(m => m.name);
        const uniqueNames = new Set(names);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        assert(names.length === uniqueNames.size, `Found duplicate meals: ${duplicates.join(', ')}`);
    });

    // Test 7: Category validation
    const validCategories = ['breakfast', 'italian', 'japanese', 'chinese', 'texmex', 'seafood', 'soup', 'sandwich', 'side'];

    test('all meals have valid categories', () => {
        const invalidMeals = meals.filter(m => !validCategories.includes(m.category));
        assert(invalidMeals.length === 0, `Invalid categories in: ${invalidMeals.map(m => m.name).join(', ')}`);
    });

    // Test 8: Filtering logic
    test('breakfast/non-breakfast filtering works', () => {
        const breakfast = meals.filter(m => m.moods.includes('breakfast'));
        const nonBreakfast = meals.filter(m => !m.moods.includes('breakfast'));

        assert(breakfast.length > 0, 'No breakfast meals');
        assert(nonBreakfast.length > 0, 'No non-breakfast meals');
        assert(breakfast.length + nonBreakfast.length === meals.length, 'Filtering math error');
    });

    // Test 9: Specific important meals exist
    const importantMeals = [
        'Chicken Teriyaki',
        'Scrambled Eggs on Buttered Rye',
        'Salmon Teriyaki',
        'Turkey Taco Rice Bowl'
    ];

    importantMeals.forEach(mealName => {
        test(`"${mealName}" exists`, () => {
            const meal = meals.find(m => m.name === mealName);
            assert(meal, `${mealName} not found in meals`);
        });
    });

    // Test 10: Ingredients validation
    test('all meals have at least one core ingredient', () => {
        const noCore = meals.filter(m => !m.ingredients.core || m.ingredients.core.length === 0);
        assert(noCore.length === 0, `Meals missing core ingredients: ${noCore.map(m => m.name).join(', ')}`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;

    console.log(`\n📊 Test Summary:`);
    console.log(`   Total: ${total}`);
    console.log(`   ${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`   ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`   Success Rate: ${Math.round((passed/total) * 100)}%`);

    if (failed === 0) {
        console.log(`\n${colors.green}🎉 ALL TESTS PASSED!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}⚠️  SOME TESTS FAILED${colors.reset}\n`);
        console.log('Failed tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
        process.exit(1);
    }
}

// Run tests
runTests();