const { test, expect } = require('@playwright/test');

test.describe('Live Site - Browse Only', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://njrun1804.github.io/moodeats/');
        await page.waitForLoadState('networkidle');
    });

    test('JavaScript loads and initializes', async ({ page }) => {
        // Check if window.meals exists
        const mealsLoaded = await page.evaluate(() => {
            return typeof window.meals !== 'undefined' && window.meals.length > 0;
        });
        expect(mealsLoaded).toBeTruthy();
    });

    test('mood buttons work', async ({ page }) => {
        // Click Italian mood
        await page.click('[data-mood="italian"]');

        // Suggestions should appear
        const suggestionsArea = page.locator('#suggestionsArea');
        await expect(suggestionsArea).toBeVisible();

        // Should have Italian meals
        const mealCards = page.locator('#mealSuggestions .card');
        const count = await mealCards.count();
        expect(count).toBeGreaterThan(0);

        // Check a meal shows nutrition
        const firstMeal = mealCards.first();
        const mealText = await firstMeal.textContent();
        expect(mealText).toContain('protein');
        expect(mealText).toContain('Main ingredients');
    });

    test('search works', async ({ page }) => {
        // First click a mood to show the search box
        await page.click('[data-mood="asian"]');

        // Search for chicken
        await page.fill('#searchInput', 'chicken');

        // Check results
        const mealCards = page.locator('#mealSuggestions .card');
        const count = await mealCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('no planning features exist', async ({ page }) => {
        // Check that planning-related elements don't exist
        const planTab = page.locator('#planTab');
        await expect(planTab).toHaveCount(0);

        const planView = page.locator('#planView');
        await expect(planView).toHaveCount(0);

        const mealModal = page.locator('#mealModal');
        await expect(mealModal).toHaveCount(0);

        const dailyTotals = page.locator('#totalCalories');
        await expect(dailyTotals).toHaveCount(0);
    });
});