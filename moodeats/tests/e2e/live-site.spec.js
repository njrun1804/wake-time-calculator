const { test, expect } = require('@playwright/test');

test.describe('Live Site Functionality', () => {
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

    test('Browse tab switching works', async ({ page }) => {
        // Click Browse tab
        await page.click('#browseTab');

        // Browse view should be visible
        const browseView = page.locator('#browseView');
        await expect(browseView).toBeVisible();

        // Plan view should be hidden
        const planView = page.locator('#planView');
        await expect(planView).toBeHidden();
    });

    test('Mood buttons show suggestions', async ({ page }) => {
        // Switch to Browse tab
        await page.click('#browseTab');

        // Click a mood button
        await page.click('[data-mood="cozy"]');

        // Suggestions should appear
        const suggestionsArea = page.locator('#suggestionsArea');
        await expect(suggestionsArea).toBeVisible();

        // Should have meal suggestions (they are .card elements)
        const suggestions = page.locator('#mealSuggestions .card');
        const count = await suggestions.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Select button opens modal with meals', async ({ page }) => {
        // Click Select button for breakfast
        await page.click('button:has-text("Select"):near(:text("Breakfast"))');

        // Modal should open
        const modal = page.locator('#mealModal');
        await expect(modal).toBeVisible();

        // Modal should have meals (they are .card elements)
        const meals = page.locator('#modalMeals .card');
        const count = await meals.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Can select a meal', async ({ page }) => {
        // Click Select button for breakfast
        await page.click('button:has-text("Select"):near(:text("Breakfast"))');

        // Wait for modal with meals
        await page.waitForSelector('#modalMeals .card');

        // Click first meal card
        await page.click('#modalMeals .card:first-child');

        // Check if meal was added to breakfast slot
        const breakfastSlot = page.locator('#breakfast-slot');
        const slotText = await breakfastSlot.textContent();

        // Should not contain the placeholder text
        expect(slotText).not.toContain('Tap select to choose breakfast');

        // Should contain nutrition info
        expect(slotText).toContain('protein');
        expect(slotText).toContain('carbs');
        expect(slotText).toContain('fat');
    });

    test('Daily totals update', async ({ page }) => {
        // Select a meal for breakfast
        await page.click('button:has-text("Select"):near(:text("Breakfast"))');
        await page.waitForSelector('#modalMeals .card');
        await page.click('#modalMeals .card:first-child');

        // Check that totals are not zero
        const totalProtein = page.locator('#totalProtein');
        const proteinText = await totalProtein.textContent();
        expect(proteinText).not.toBe('0g');

        const totalCalories = page.locator('#totalCalories');
        const caloriesText = await totalCalories.textContent();
        expect(caloriesText).not.toBe('0');
    });
});