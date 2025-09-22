// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Real User Behavior Test', () => {
  test('actually click buttons like a real user would', async ({ page }) => {
    console.log('🌐 Opening the production site...');
    await page.goto('https://njrun1804.github.io/moodeats/moodeats-planner.html');

    // Wait for page to fully load like a user would
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // REAL USER ACTION 1: Click Browse tab
    console.log('\n👆 USER CLICKS: Browse tab');
    const browseTab = page.locator('#browseTab');

    // Verify the tab is visible before clicking
    await expect(browseTab).toBeVisible();
    await browseTab.click();
    await page.waitForTimeout(500);

    // VERIFY: Did the Browse view actually appear?
    const browseView = page.locator('#browseView');
    const isBrowseVisible = await browseView.isVisible();
    console.log(`✓ Browse view visible after clicking tab: ${isBrowseVisible}`);

    if (!isBrowseVisible) {
      console.log('❌ FAIL: Browse tab click did nothing!');
      throw new Error('Browse tab does not work - view did not become visible');
    }

    // REAL USER ACTION 2: Click a mood button (Fresh)
    console.log('\n👆 USER CLICKS: Fresh mood button');
    const freshButton = page.locator('[data-mood="fresh"]');

    // Check if button is visible
    const isFreshVisible = await freshButton.isVisible();
    console.log(`✓ Fresh button visible: ${isFreshVisible}`);

    if (!isFreshVisible) {
      console.log('❌ FAIL: Fresh button not visible even though Browse view is open');
      throw new Error('Mood buttons are not visible');
    }

    await freshButton.click();
    await page.waitForTimeout(1000);

    // VERIFY: Did suggestions appear?
    const suggestionsArea = page.locator('#suggestionsArea');
    const areSuggestionsVisible = await suggestionsArea.isVisible();
    console.log(`✓ Suggestions area visible after clicking Fresh: ${areSuggestionsVisible}`);

    if (!areSuggestionsVisible) {
      console.log('❌ FAIL: Fresh button click did nothing!');
      throw new Error('Fresh button does not work - no suggestions appeared');
    }

    // VERIFY: Are there actual meal cards?
    const mealCards = page.locator('#mealSuggestions .card');
    const cardCount = await mealCards.count();
    console.log(`✓ Number of meal cards shown: ${cardCount}`);

    if (cardCount === 0) {
      console.log('❌ FAIL: No meal cards shown even though suggestions area is visible');
      throw new Error('No meals displayed after clicking mood button');
    }

    // REAL USER ACTION 3: Click Plan tab to go back
    console.log('\n👆 USER CLICKS: Plan tab to go back');
    const planTab = page.locator('#planTab');
    await planTab.click();
    await page.waitForTimeout(500);

    const planView = page.locator('#planView');
    const isPlanVisible = await planView.isVisible();
    console.log(`✓ Plan view visible after clicking tab: ${isPlanVisible}`);

    if (!isPlanVisible) {
      console.log('❌ FAIL: Plan tab click did nothing!');
      throw new Error('Plan tab does not work');
    }

    // REAL USER ACTION 4: Click breakfast Select button
    console.log('\n👆 USER CLICKS: Breakfast Select button');
    const breakfastBtn = page.locator('button').filter({ hasText: 'Select' }).first();

    const isSelectVisible = await breakfastBtn.isVisible();
    console.log(`✓ Select button visible: ${isSelectVisible}`);

    await breakfastBtn.click();
    await page.waitForTimeout(1000);

    // VERIFY: Did modal open?
    const modal = page.locator('#mealModal');
    const modalOpen = await modal.getAttribute('open');
    const isModalOpen = modalOpen !== null;
    console.log(`✓ Modal opened after clicking Select: ${isModalOpen}`);

    if (!isModalOpen) {
      console.log('❌ FAIL: Select button did nothing - modal did not open!');
      throw new Error('Meal selection modal does not open');
    }

    // REAL USER ACTION 5: Search in the modal
    console.log('\n⌨️ USER TYPES: "eggs" in modal search');
    const modalSearch = page.locator('#modalSearch');

    const isSearchVisible = await modalSearch.isVisible();
    if (isSearchVisible) {
      await modalSearch.fill('eggs');
      await page.waitForTimeout(500);

      const modalMeals = page.locator('#modalMeals .card');
      const modalMealCount = await modalMeals.count();
      console.log(`✓ Meals shown after searching "eggs": ${modalMealCount}`);
    }

    console.log('\n✅ ALL USER ACTIONS WORK!');
  });
});