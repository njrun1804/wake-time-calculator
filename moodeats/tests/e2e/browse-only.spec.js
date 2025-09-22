const { test, expect } = require('@playwright/test');

test.describe('MoodEats Browse-Only', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test('page loads with mood buttons', async ({ page }) => {
        // Check title
        await expect(page.locator('h1')).toContainText('MoodEats');

        // Check mood buttons exist
        const moodButtons = page.locator('.mood-btn');
        await expect(moodButtons).toHaveCount(8);
    });

    test('clicking mood shows suggestions', async ({ page }) => {
        // Click on a mood button
        await page.click('[data-mood="italian"]');

        // Check that suggestions appear
        const suggestionsArea = page.locator('#suggestionsArea');
        await expect(suggestionsArea).toBeVisible();

        // Check that meal cards are displayed
        const mealCards = page.locator('#mealSuggestions .card');
        const count = await mealCards.count();
        expect(count).toBeGreaterThan(0);

        // Check that meals contain nutrition info
        const firstMeal = mealCards.first();
        const mealText = await firstMeal.textContent();
        expect(mealText).toContain('protein');
        expect(mealText).toContain('carbs');
        expect(mealText).toContain('fat');
        expect(mealText).toContain('cal');
    });

    test('search functionality works', async ({ page }) => {
        // First click a mood to show suggestions area
        await page.click('[data-mood="italian"]');

        // Type in search
        await page.fill('#searchInput', 'pasta');

        // Check that results are filtered
        const mealCards = page.locator('#mealSuggestions .card');
        const count = await mealCards.count();
        expect(count).toBeGreaterThan(0);

        // Verify pasta-related meals appear
        const meals = await mealCards.allTextContents();
        const hasPasta = meals.some(meal => meal.toLowerCase().includes('pasta') ||
                                            meal.toLowerCase().includes('spaghetti') ||
                                            meal.toLowerCase().includes('linguine'));
        expect(hasPasta).toBeTruthy();
    });

    test('mood badges are displayed', async ({ page }) => {
        // Click on a mood
        await page.click('[data-mood="quick"]');

        // Check that meal cards have mood badges
        const badges = page.locator('#mealSuggestions .badge');
        const count = await badges.count();
        expect(count).toBeGreaterThan(0);
    });

    test('ingredients are shown', async ({ page }) => {
        // Click on a mood
        await page.click('[data-mood="breakfast"]');

        // Check that ingredients are displayed
        const firstMeal = page.locator('#mealSuggestions .card').first();
        const mealText = await firstMeal.textContent();
        expect(mealText).toContain('Main ingredients:');
    });

    test('all moods work', async ({ page }) => {
        const moods = ['cozy', 'fresh', 'hearty', 'quick', 'asian', 'italian', 'seafood', 'breakfast'];

        for (const mood of moods) {
            await page.click(`[data-mood="${mood}"]`);

            // Check button is selected
            const button = page.locator(`[data-mood="${mood}"]`);
            await expect(button).toHaveClass(/btn-primary/);

            // Check suggestions appear
            const suggestionsArea = page.locator('#suggestionsArea');
            await expect(suggestionsArea).toBeVisible();

            // Check meals are shown
            const mealCards = page.locator('#mealSuggestions .card');
            const count = await mealCards.count();
            expect(count).toBeGreaterThan(0);

            // Clear search for next test
            await page.fill('#searchInput', '');
        }
    });
});