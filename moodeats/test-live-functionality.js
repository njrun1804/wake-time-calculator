#!/usr/bin/env node

// Test script to verify live site functionality
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Testing live MoodEats site...');

    // Navigate to the live site
    await page.goto('https://njrun1804.github.io/moodeats/', { waitUntil: 'networkidle2' });

    // Test 1: Check if JavaScript loaded (window.meals should exist)
    const mealsLoaded = await page.evaluate(() => {
        return typeof window.meals !== 'undefined' && window.meals.length > 0;
    });
    console.log(`✓ Meals data loaded: ${mealsLoaded ? 'YES' : 'NO'}`);

    // Test 2: Click Browse tab
    await page.click('#browseTab');
    await page.waitForTimeout(500);
    const browseViewVisible = await page.evaluate(() => {
        const browseView = document.getElementById('browseView');
        return browseView && !browseView.classList.contains('hidden');
    });
    console.log(`✓ Browse tab works: ${browseViewVisible ? 'YES' : 'NO'}`);

    // Test 3: Click a mood button
    await page.click('[data-mood="cozy"]');
    await page.waitForTimeout(500);
    const suggestionsVisible = await page.evaluate(() => {
        const suggestionsArea = document.getElementById('suggestionsArea');
        const suggestions = document.querySelectorAll('#mealSuggestions .meal-suggestion');
        return suggestionsArea && !suggestionsArea.classList.contains('hidden') && suggestions.length > 0;
    });
    console.log(`✓ Mood button shows suggestions: ${suggestionsVisible ? 'YES' : 'NO'}`);

    // Test 4: Switch back to Plan tab
    await page.click('#planTab');
    await page.waitForTimeout(500);

    // Test 5: Click Select button for breakfast
    await page.click('[onclick="selectMealForSlot(\'breakfast\')"]');
    await page.waitForTimeout(500);
    const modalOpen = await page.evaluate(() => {
        const modal = document.getElementById('mealModal');
        return modal && modal.open;
    });
    console.log(`✓ Select button opens modal: ${modalOpen ? 'YES' : 'NO'}`);

    // Test 6: Check if meals are in modal
    const mealsInModal = await page.evaluate(() => {
        const modalMeals = document.querySelectorAll('#modalMeals .meal-option');
        return modalMeals.length;
    });
    console.log(`✓ Meals displayed in modal: ${mealsInModal} meals`);

    // Test 7: Select a meal
    if (mealsInModal > 0) {
        await page.click('#modalMeals .meal-option:first-child');
        await page.waitForTimeout(500);
        const mealSelected = await page.evaluate(() => {
            const breakfastSlot = document.getElementById('breakfast-slot');
            return breakfastSlot && !breakfastSlot.innerHTML.includes('Tap select');
        });
        console.log(`✓ Meal selection works: ${mealSelected ? 'YES' : 'NO'}`);
    }

    console.log('\n🎉 Live site testing complete!');

    await browser.close();
})();