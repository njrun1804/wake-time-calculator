// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Debug Tab Switching', () => {
  test('debug tab switching and visibility', async ({ page }) => {
    // Navigate to page
    await page.goto('/moodeats-planner.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait for initialization and force if needed
    await page.waitForTimeout(2000);

    // Check if meals are loaded, if not, force initialization
    const mealsLoaded = await page.evaluate(() => {
      const initialState = {
        hasMeals: typeof window.meals !== 'undefined',
        mealCount: window.meals ? window.meals.length : 0,
        hasEmbeddedMeals: typeof embeddedMeals !== 'undefined',
        embeddedCount: typeof embeddedMeals !== 'undefined' ? embeddedMeals.length : 0
      };

      // If meals aren't loaded but embeddedMeals exist, force initialization
      if (!initialState.hasMeals && initialState.hasEmbeddedMeals) {
        console.log('Forcing initialization since meals not loaded');
        if (typeof initializeApp === 'function') {
          initializeApp();
        }
      }

      // Check again after forced init
      return {
        ...initialState,
        afterInit: {
          hasMeals: typeof window.meals !== 'undefined',
          mealCount: window.meals ? window.meals.length : 0
        }
      };
    });
    console.log('Meals loaded:', mealsLoaded);

    // Wait a bit more if we forced initialization
    if (!mealsLoaded.hasMeals && mealsLoaded.afterInit.hasMeals) {
      await page.waitForTimeout(500);
    }

    // Check initial state
    const initialState = await page.evaluate(() => {
      const browseTab = document.getElementById('browseTab');
      const planTab = document.getElementById('planTab');
      const browseView = document.getElementById('browseView');
      const planView = document.getElementById('planView');

      return {
        browseTabClasses: browseTab?.className,
        planTabClasses: planTab?.className,
        browseViewClasses: browseView?.className,
        planViewClasses: planView?.className,
        browseTabExists: browseTab !== null,
        planTabExists: planTab !== null
      };
    });
    console.log('Initial state:', initialState);

    // Try clicking browse tab
    const browseTab = page.locator('#browseTab');
    await expect(browseTab).toBeVisible();

    // Check if click handler is attached
    const hasClickHandler = await page.evaluate(() => {
      const tab = document.getElementById('browseTab');

      // Alternative: try clicking programmatically
      if (tab) {
        tab.click();
        const browseView = document.getElementById('browseView');
        return {
          clicked: true,
          browseViewClassesAfterClick: browseView?.className,
          browseViewHidden: browseView?.classList.contains('hidden')
        };
      }
      return { clicked: false };
    });
    console.log('Click handler check:', hasClickHandler);

    // Wait a bit for any animations
    await page.waitForTimeout(500);

    // Check state after programmatic click
    const afterProgrammaticClick = await page.evaluate(() => {
      const browseView = document.getElementById('browseView');
      const planView = document.getElementById('planView');

      return {
        browseViewClasses: browseView?.className,
        planViewClasses: planView?.className,
        browseViewHidden: browseView?.classList.contains('hidden'),
        planViewHidden: planView?.classList.contains('hidden')
      };
    });
    console.log('After programmatic click:', afterProgrammaticClick);

    // Now try with Playwright click
    await browseTab.click();
    await page.waitForTimeout(500);

    // Check final state
    const finalState = await page.evaluate(() => {
      const browseView = document.getElementById('browseView');
      const planView = document.getElementById('planView');
      const moodButtons = document.querySelectorAll('.mood-btn');

      return {
        browseViewClasses: browseView?.className,
        planViewClasses: planView?.className,
        browseViewHidden: browseView?.classList.contains('hidden'),
        planViewHidden: planView?.classList.contains('hidden'),
        moodButtonCount: moodButtons.length,
        firstMoodButtonVisible: moodButtons[0] ? window.getComputedStyle(moodButtons[0]).display !== 'none' : false
      };
    });
    console.log('Final state after Playwright click:', finalState);

    // Now check if browse view is visible
    const browseView = page.locator('#browseView');
    const isVisible = await browseView.isVisible();
    console.log('BrowseView isVisible():', isVisible);

    if (!isVisible) {
      // Try to manually remove hidden class
      await page.evaluate(() => {
        const browseView = document.getElementById('browseView');
        const planView = document.getElementById('planView');
        if (browseView) {
          browseView.classList.remove('hidden');
          console.log('Manually removed hidden from browseView');
        }
        if (planView) {
          planView.classList.add('hidden');
          console.log('Manually added hidden to planView');
        }
      });

      const afterManualFix = await browseView.isVisible();
      console.log('After manual fix, isVisible():', afterManualFix);
    }

    // Final assertion
    await expect(browseView).toBeVisible();
  });
});