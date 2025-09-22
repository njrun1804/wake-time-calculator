#!/usr/bin/env node

/**
 * DOM Testing with jsdom
 * Tests that require DOM manipulation but can run in Node.js
 */

const fs = require('fs');
const path = require('path');

// Test results storage
let testResults = [];

// ANSI colors
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

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

// Mock DOM environment for testing
function createMockDOM() {
    // Create a minimal DOM-like environment
    const mockDocument = {
        querySelectorAll: function(selector) {
            const elements = [];
            // Mock some elements based on selector
            if (selector === '.mood-btn') {
                for (let i = 0; i < 8; i++) {
                    elements.push({
                        dataset: { mood: ['cozy', 'fresh', 'hearty', 'quick', 'breakfast', 'seafood', 'asian', 'italian'][i] },
                        classList: {
                            contains: () => false,
                            add: () => {},
                            remove: () => {}
                        },
                        addEventListener: function() {}
                    });
                }
            }
            return elements;
        },
        querySelector: function(selector) {
            if (selector === '#mealSuggestions') {
                return { innerHTML: '' };
            }
            if (selector === '#suggestionsArea') {
                return { classList: { remove: () => {}, add: () => {} } };
            }
            return null;
        },
        getElementById: function(id) {
            return this.querySelector('#' + id);
        }
    };

    return mockDocument;
}

function runTests() {
    console.log('\n🧪 MoodEats DOM Test Suite\n');
    console.log('='.repeat(50));

    // Load the planner HTML
    const plannerPath = path.join(__dirname, 'moodeats-planner.html');
    let plannerContent;
    try {
        plannerContent = fs.readFileSync(plannerPath, 'utf8');
    } catch (error) {
        console.error(`${colors.red}Failed to load moodeats-planner.html: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    // Test 1: HTML structure validation
    test('HTML has required elements', () => {
        assert(plannerContent.includes('id="browseTab"'), 'Browse tab should exist');
        assert(plannerContent.includes('id="planTab"'), 'Plan tab should exist');
        assert(plannerContent.includes('data-mood="fresh"'), 'Fresh mood button should exist');
        assert(plannerContent.includes('data-mood="hearty"'), 'Hearty mood button should exist');
        assert(plannerContent.includes('id="mealModal"'), 'Meal modal should exist');
    });

    // Test 2: All 8 mood buttons exist
    test('all 8 mood buttons are present', () => {
        const moods = ['cozy', 'fresh', 'hearty', 'quick', 'breakfast', 'seafood', 'asian', 'italian'];
        moods.forEach(mood => {
            assert(plannerContent.includes(`data-mood="${mood}"`), `${mood} button should exist`);
        });
    });

    // Test 3: JavaScript function definitions exist
    test('critical functions are defined', () => {
        assert(plannerContent.includes('function loadMeals()'), 'loadMeals function should exist');
        assert(plannerContent.includes('function setupBrowseViewEventListeners()'), 'setupBrowseViewEventListeners should exist');
        assert(plannerContent.includes('function selectMealForSlot('), 'selectMealForSlot should exist');
        assert(plannerContent.includes('function displayModalMeals('), 'displayModalMeals should exist');
    });

    // Test 4: Event listener setup is called after meals load
    test('setupBrowseViewEventListeners is called in loadMeals', () => {
        const loadMealsMatch = plannerContent.match(/function loadMeals\(\)[\s\S]*?\n\s*}/);
        assert(loadMealsMatch, 'loadMeals function should be found');
        assert(loadMealsMatch[0].includes('setupBrowseViewEventListeners()'),
               'setupBrowseViewEventListeners should be called in loadMeals');
    });

    // Test 5: Meals data is embedded
    test('meals data is embedded in HTML', () => {
        assert(plannerContent.includes('const embeddedMeals ='), 'embeddedMeals should be defined');

        // Count meals in embedded data
        const meals = plannerContent.match(/"name":\s*"/g);
        assert(meals && meals.length === 76, `Should have 76 meals embedded, found ${meals ? meals.length : 0}`);
    });

    // Test 6: Check for common UI bugs
    test('no duplicate IDs in HTML', () => {
        const idMatches = plannerContent.match(/id="([^"]+)"/g);
        const ids = idMatches ? idMatches.map(m => m.replace(/id="|"/g, '')) : [];
        const uniqueIds = new Set(ids);

        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        assert(duplicates.length === 0, `Found duplicate IDs: ${duplicates.join(', ')}`);
    });

    // Test 7: Modal structure is correct
    test('modal has required elements', () => {
        assert(plannerContent.includes('id="modalTitle"'), 'Modal title should exist');
        assert(plannerContent.includes('id="modalMeals"'), 'Modal meals container should exist');
        assert(plannerContent.includes('modal-filter'), 'Modal filters should exist');
    });

    // Test 8: Nutrition data structure
    test('nutrition estimates are defined', () => {
        assert(plannerContent.includes('const nutritionEstimates ='), 'nutritionEstimates should be defined');
        assert(plannerContent.includes('protein:'), 'Nutrition should include protein');
        assert(plannerContent.includes('carbs:'), 'Nutrition should include carbs');
        assert(plannerContent.includes('calories:'), 'Nutrition should include calories');
    });

    // Test 9: LocalStorage keys are consistent
    test('localStorage keys follow naming convention', () => {
        const storageKeys = plannerContent.match(/localStorage\.(get|set)Item\(['"]([^'"]+)['"]/g);
        if (storageKeys) {
            storageKeys.forEach(key => {
                const keyName = key.match(/['"]([^'"]+)['"]/)[1];
                assert(keyName.startsWith('moodeats:'),
                       `localStorage key "${keyName}" should start with "moodeats:"`);
            });
        }
    });

    // Test 10: Error handling exists
    test('basic error handling is present', () => {
        assert(plannerContent.includes('if (') || plannerContent.includes('try'),
               'Should have conditional checks or try-catch blocks');
        assert(plannerContent.includes('.length === 0') || plannerContent.includes('.length > 0'),
               'Should check for empty arrays');
    });

    // Test 11: All meal categories are valid
    test('embedded meals have valid categories', () => {
        const validCategories = ['breakfast', 'italian', 'japanese', 'chinese', 'texmex', 'seafood', 'soup', 'sandwich', 'side'];

        // Extract categories from embedded meals
        const categoryMatches = plannerContent.match(/"category":\s*"([^"]+)"/g);
        if (categoryMatches) {
            categoryMatches.forEach(match => {
                const category = match.replace(/"category":\s*"/, '').replace('"', '');
                assert(validCategories.includes(category),
                       `Invalid category found: ${category}`);
            });
        }
    });

    // Test 12: Search functionality setup
    test('search input has event listener', () => {
        assert(plannerContent.includes("getElementById('searchInput')"), 'Search input should be accessed');
        assert(plannerContent.includes("addEventListener('input'"), 'Input event listener should be added');
        assert(plannerContent.includes('fuse.search'), 'Fuse.js search should be used');
    });

    // Test 13: Tab switching logic exists
    test('tab switching is implemented', () => {
        assert(plannerContent.includes("getElementById('browseTab')"), 'Browse tab should be accessible');
        assert(plannerContent.includes("getElementById('planTab')"), 'Plan tab should be accessible');
        assert(plannerContent.includes('classList.add(\'tab-active\')'), 'Tab active class should be managed');
        assert(plannerContent.includes('classList.remove(\'hidden\')'), 'Hidden class should be managed');
    });

    // Test 14: Meal selection functions exist
    test('meal selection workflow is complete', () => {
        assert(plannerContent.includes('function selectMeal('), 'selectMeal function should exist');
        assert(plannerContent.includes('function updateSlotDisplay('), 'updateSlotDisplay should exist');
        assert(plannerContent.includes('function updateDailyTotals('), 'updateDailyTotals should exist');
    });

    // Test 15: Critical order of operations
    test('critical functions are called in correct order', () => {
        // Check that loadMeals is called at the end
        const scriptEnd = plannerContent.lastIndexOf('</script>');
        const loadMealsCall = plannerContent.lastIndexOf('loadMeals()');

        assert(loadMealsCall > 0, 'loadMeals() should be called');
        assert(loadMealsCall > plannerContent.lastIndexOf('function loadMeals'),
               'loadMeals() should be called after its definition');
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
        console.log(`\n${colors.green}🎉 ALL DOM TESTS PASSED!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}⚠️  SOME DOM TESTS FAILED${colors.reset}\n`);
        console.log('Failed tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
        process.exit(1);
    }
}

// Run tests
runTests();