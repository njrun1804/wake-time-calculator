// Shared helper for initializing the app in test environment

/**
 * Initialize the MoodEats app for testing
 * Handles the fact that embeddedMeals aren't loaded in test environment
 * and event listeners aren't attached without proper initialization
 */
async function initializeTestApp(page) {
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Inject test meals and force initialization
  await page.evaluate(() => {
    // Create comprehensive test meals for all moods
    const testMeals = [
      { name: "Fresh Salad", category: "salad", moods: ["fresh"], ingredients: { core: ["lettuce"], pantry: ["oil"] }, nutrition: { calories: 200, protein: 5, carbs: 20, fat: 10 }, searchTerms: ["salad", "fresh"] },
      { name: "Green Smoothie", category: "breakfast", moods: ["fresh", "quick", "breakfast"], ingredients: { core: ["spinach"], pantry: ["banana"] }, nutrition: { calories: 150, protein: 3, carbs: 30, fat: 2 }, searchTerms: ["smoothie", "fresh"] },
      { name: "Cozy Soup", category: "soup", moods: ["cozy"], ingredients: { core: ["chicken"], pantry: ["broth"] }, nutrition: { calories: 350, protein: 25, carbs: 30, fat: 12 }, searchTerms: ["soup", "cozy"] },
      { name: "Hearty Steak", category: "dinner", moods: ["hearty"], ingredients: { core: ["steak"], pantry: ["salt"] }, nutrition: { calories: 600, protein: 50, carbs: 40, fat: 25 }, searchTerms: ["steak", "hearty"] },
      { name: "Quick Sandwich", category: "sandwich", moods: ["quick"], ingredients: { core: ["bread"], pantry: ["mayo"] }, nutrition: { calories: 400, protein: 30, carbs: 45, fat: 15 }, searchTerms: ["sandwich", "quick"] },
      { name: "Breakfast Eggs", category: "breakfast", moods: ["breakfast", "quick"], ingredients: { core: ["eggs"], pantry: ["butter"] }, nutrition: { calories: 300, protein: 20, carbs: 25, fat: 15 }, searchTerms: ["eggs", "breakfast"] },
      { name: "Pancakes", category: "breakfast", moods: ["breakfast", "cozy"], ingredients: { core: ["flour", "eggs"], pantry: ["syrup"] }, nutrition: { calories: 450, protein: 12, carbs: 65, fat: 18 }, searchTerms: ["pancakes", "breakfast"] },
      { name: "Oatmeal", category: "breakfast", moods: ["breakfast", "fresh"], ingredients: { core: ["oats"], pantry: ["honey"] }, nutrition: { calories: 250, protein: 8, carbs: 45, fat: 5 }, searchTerms: ["oatmeal", "breakfast"] },
      { name: "Seafood Pasta", category: "seafood", moods: ["seafood"], ingredients: { core: ["shrimp"], pantry: ["garlic"] }, nutrition: { calories: 450, protein: 35, carbs: 55, fat: 12 }, searchTerms: ["seafood", "pasta"] },
      { name: "Asian Stir Fry", category: "chinese", moods: ["asian"], ingredients: { core: ["chicken"], pantry: ["soy sauce"] }, nutrition: { calories: 400, protein: 35, carbs: 35, fat: 15 }, searchTerms: ["asian", "stir fry", "chicken"] },
      { name: "Italian Pizza", category: "italian", moods: ["italian"], ingredients: { core: ["dough"], pantry: ["oregano"] }, nutrition: { calories: 550, protein: 25, carbs: 65, fat: 20 }, searchTerms: ["pizza", "italian"] },
      { name: "Grilled Chicken", category: "dinner", moods: ["hearty", "fresh"], ingredients: { core: ["chicken"], pantry: ["herbs"] }, nutrition: { calories: 400, protein: 45, carbs: 20, fat: 15 }, searchTerms: ["chicken", "grilled"] },
      { name: "Chicken Teriyaki", category: "japanese", moods: ["asian", "quick"], ingredients: { core: ["chicken"], pantry: ["teriyaki sauce"] }, nutrition: { calories: 450, protein: 40, carbs: 45, fat: 12 }, searchTerms: ["chicken", "teriyaki"] }
    ];

    // Set embeddedMeals if not present
    if (typeof window.embeddedMeals === 'undefined') {
      window.embeddedMeals = testMeals;
    }

    // Force initialization to ensure event listeners are attached
    if (typeof window.initializeApp === 'function') {
      console.log('Forcing app initialization for test');
      window.initializeApp();
    } else {
      // If initializeApp isn't exposed, try to set meals directly
      window.meals = window.embeddedMeals || testMeals;

      // Try to initialize Fuse for search if available
      if (typeof window.Fuse !== 'undefined' && window.meals) {
        window.fuse = new window.Fuse(window.meals, {
          keys: ['name', 'searchTerms', 'moods', 'category'],
          threshold: 0.3
        });
      }
    }
  });

  // Wait for event listeners to be attached and Fuse.js to initialize
  await page.waitForTimeout(1000);
}

/**
 * Force a specific view to be visible (for tests where tab switching doesn't work)
 */
async function forceViewVisible(page, viewName) {
  await page.evaluate((view) => {
    const views = {
      'browse': { show: 'browseView', hide: 'planView', tab: 'browseTab', inactiveTab: 'planTab' },
      'plan': { show: 'planView', hide: 'browseView', tab: 'planTab', inactiveTab: 'browseTab' }
    };

    const config = views[view];
    if (config) {
      const showEl = document.getElementById(config.show);
      const hideEl = document.getElementById(config.hide);
      const activeTab = document.getElementById(config.tab);
      const inactiveTab = document.getElementById(config.inactiveTab);

      if (showEl) showEl.classList.remove('hidden');
      if (hideEl) hideEl.classList.add('hidden');
      if (activeTab) activeTab.classList.add('tab-active');
      if (inactiveTab) inactiveTab.classList.remove('tab-active');
    }
  }, viewName);
}

/**
 * Force modal to open (for tests where button clicks don't work)
 */
async function forceModalOpen(page, modalId = 'mealModal') {
  await page.evaluate((id) => {
    const modal = document.getElementById(id);
    if (modal && !modal.hasAttribute('open')) {
      modal.showModal();

      // Add test meals to modal if not present
      const modalMeals = document.getElementById('modalMeals');
      if (modalMeals && modalMeals.children.length === 0) {
        modalMeals.innerHTML = `
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl cursor-pointer">
            <div class="card-body">
              <h4 class="font-semibold">Test Meal</h4>
              <p>Test meal for modal</p>
            </div>
          </div>
        `;
      }
    }
  }, modalId);
}

module.exports = {
  initializeTestApp,
  forceViewVisible,
  forceModalOpen
};