// Import data
import { embeddedMeals } from './meals-data.js';
import { nutritionEstimates } from './nutrition-data.js';

// Global variables
let meals = [];
let fuse;
let currentMood = null;

// Load meals data
function loadMeals() {
    console.log('Loading meals...');

    if (typeof embeddedMeals !== 'undefined' && embeddedMeals) {
        meals = embeddedMeals;
    }

    window.meals = meals;
    console.log('Loaded', meals.length, 'meals');

    initFuzzySearch();
    setupEventListeners();
}

// Initialize fuzzy search
function initFuzzySearch() {
    if (typeof Fuse !== 'undefined' && meals.length > 0) {
        fuse = new Fuse(meals, {
            keys: ['name', 'searchTerms', 'moods', 'ingredients.core'],
            threshold: 0.4
        });
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Clear search when clicking mood
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';

            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('btn-primary'));
            btn.classList.add('btn-primary');

            currentMood = btn.dataset.mood;
            showMealSuggestions(currentMood);
        });
    });

    // Search input - always visible at top
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query) {
                // Clear mood selection when typing
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('btn-primary'));
                currentMood = null;
                searchMeals(query);
            } else {
                // Hide suggestions if no query and no mood selected
                if (!currentMood) {
                    document.getElementById('suggestionsArea').classList.add('hidden');
                }
            }
        });
    }
}

// Show meal suggestions for a mood
function showMealSuggestions(mood) {
    const moodMeals = meals.filter(m => m.moods.includes(mood));
    displayMeals(moodMeals, `${mood.charAt(0).toUpperCase() + mood.slice(1)} meals`);
    document.getElementById('suggestionsArea').classList.remove('hidden');
}

// Search meals
function searchMeals(query) {
    const results = fuse.search(query).map(r => r.item);
    displayMeals(results, `Results for "${query}"`);
    document.getElementById('suggestionsArea').classList.remove('hidden');
}

// Display meals in the suggestions area
function displayMeals(mealList, title = 'Suggestions') {
    const container = document.getElementById('mealSuggestions');
    const titleElement = document.getElementById('suggestionsTitle');

    if (titleElement) {
        titleElement.textContent = title;
    }

    container.innerHTML = '';

    if (mealList.length === 0) {
        container.innerHTML = '<p class="text-base-content/60">No meals found. Try a different search term or browse by mood.</p>';
        return;
    }

    mealList.forEach(meal => {
        const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
        const mealCard = document.createElement('div');
        mealCard.className = 'card bg-base-100 p-4 hover:bg-base-200 transition-colors';

        // Build ingredients list
        const coreIngredients = meal.ingredients.core.join(', ');

        mealCard.innerHTML = `
            <h4 class="font-semibold text-lg">${meal.name}</h4>
            <p class="text-xs text-base-content/60 mt-1">
                ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat • ${nutrition.calories} cal
            </p>
            <p class="text-sm text-base-content/80 mt-2">
                <span class="font-medium">Main ingredients:</span> ${coreIngredients}
            </p>
            <div class="mt-2">
                ${meal.moods.map(mood => {
                    const moodEmoji = {
                        'cozy': '🔥',
                        'fresh': '🥗',
                        'hearty': '💪',
                        'quick': '⚡',
                        'asian': '🥢',
                        'italian': '🍝',
                        'seafood': '🐟',
                        'breakfast': '🌅'
                    };
                    return `<span class="badge badge-sm mr-1">${moodEmoji[mood] || ''} ${mood}</span>`;
                }).join('')}
            </div>
        `;

        container.appendChild(mealCard);
    });
}

// Initialize app when DOM is ready
function initializeApp() {
    loadMeals();
}

// Export functions for global access
window.initializeApp = initializeApp;
window.loadMeals = loadMeals;

// Auto-initialize
export { initializeApp };