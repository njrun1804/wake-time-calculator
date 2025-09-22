// Main application logic for MoodEats
// Coordinates all modules and handles initialization

import { embeddedMeals } from './meals-data.js';
import { nutritionEstimates } from './nutrition-data.js';
import {
    savePlanToStorage,
    loadPlanFromStorage,
    saveDailyPlan,
    loadDailyPlan,
    getSavedPlans,
    loadPlanByDate as loadPlanByDateStorage
} from './storage.js';
import {
    updateSlotDisplay,
    updateDailyTotals,
    displayModalMeals,
    displaySavedPlans
} from './ui.js';

// State management
let meals = [];
let dailyPlan = {
    breakfast: null,
    lunch: null,
    dinner: null,
    snacks: null
};
let currentSlot = null;
let fuse;

// Load meals
function loadMeals() {
    console.log('Loading meals, embeddedMeals:', typeof embeddedMeals);

    if (typeof embeddedMeals !== 'undefined' && embeddedMeals) {
        meals = embeddedMeals;
    }

    window.meals = meals;
    console.log('Set window.meals:', meals.length);

    initFuzzySearch();
    loadDailyPlanOnStartup();

    // Setup event listeners AFTER meals are loaded
    setupAllEventListeners();
}

function initFuzzySearch() {
    if (typeof Fuse !== 'undefined' && meals.length > 0) {
        fuse = new Fuse(meals, {
            keys: ['name', 'searchTerms', 'moods', 'ingredients.core'],
            threshold: 0.4
        });
    }
}

function loadDailyPlanOnStartup() {
    const saved = loadDailyPlan();
    if (saved) {
        dailyPlan = saved;
        Object.entries(dailyPlan).forEach(([slot, meal]) => {
            updateSlotDisplay(slot, meal, dailyPlan);
        });
        updateDailyTotals(dailyPlan);
        displaySavedPlans();
    }
}

// Meal selection for slot
function selectMealForSlot(slot) {
    currentSlot = slot;
    const modal = document.getElementById('mealModal');
    document.getElementById('modalTitle').textContent = `Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;

    // Filter appropriate meals
    let filteredMeals = meals;
    if (slot === 'breakfast') {
        filteredMeals = meals.filter(m => m.moods.includes('breakfast'));
    } else if (slot === 'snacks') {
        // For snacks, show sides and quick items
        filteredMeals = meals.filter(m => m.category === 'side' || m.moods.includes('quick'));
    } else {
        filteredMeals = meals.filter(m => !m.moods.includes('breakfast'));
    }

    // Check for conflicts
    const otherMeals = Object.entries(dailyPlan)
        .filter(([s, m]) => s !== slot && m)
        .map(([s, m]) => m);

    displayModalMeals(filteredMeals, otherMeals, currentSlot);
    modal.showModal();
}

function selectMeal(meal) {
    dailyPlan[currentSlot] = meal;
    updateSlotDisplay(currentSlot, meal, dailyPlan);
    updateDailyTotals(dailyPlan);
    savePlanToStorage(dailyPlan);
    document.getElementById('mealModal').close();
}

function addManualMeal() {
    const manualMealName = document.getElementById('manualMealName').value.trim();
    if (!manualMealName) {
        alert('Please enter a meal name');
        return;
    }

    // Create a custom meal object
    const customMeal = {
        name: manualMealName,
        category: 'custom',
        moods: [],
        ingredients: { core: [], pantry: [] },
        searchTerms: []
    };

    // Add to daily plan
    dailyPlan[currentSlot] = customMeal;
    updateSlotDisplay(currentSlot, customMeal, dailyPlan);
    updateDailyTotals(dailyPlan);
    savePlanToStorage(dailyPlan);

    // Clear input and close modal
    document.getElementById('manualMealName').value = '';
    document.getElementById('mealModal').close();
}

function clearDailyPlan() {
    if (confirm('Clear all selected meals?')) {
        dailyPlan = { breakfast: null, lunch: null, dinner: null, snacks: null };
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(slot => updateSlotDisplay(slot, null, dailyPlan));
        updateDailyTotals(dailyPlan);
        savePlanToStorage(dailyPlan);
    }
}

function saveDailyPlanHandler() {
    const date = new Date().toISOString().split('T')[0];
    let plans = JSON.parse(localStorage.getItem('moodeats:dailyPlans') || '{}');
    plans[date] = dailyPlan;

    // Keep only last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    Object.keys(plans).forEach(planDate => {
        if (new Date(planDate) < cutoff) {
            delete plans[planDate];
        }
    });

    localStorage.setItem('moodeats:dailyPlans', JSON.stringify(plans));
    displaySavedPlans();
    alert('Daily plan saved!');
}

function loadPlanByDate(date) {
    const result = loadPlanByDateStorage(date,
        (slot, meal) => updateSlotDisplay(slot, meal, dailyPlan),
        () => updateDailyTotals(dailyPlan),
        () => savePlanToStorage(dailyPlan)
    );
    if (result) {
        dailyPlan = result;
    }
}

// Setup event listeners
function setupAllEventListeners() {
    // Tab switching
    document.getElementById('browseTab')?.addEventListener('click', () => {
        document.getElementById('browseTab').classList.add('tab-active');
        document.getElementById('planTab').classList.remove('tab-active');
        document.getElementById('browseView').classList.remove('hidden');
        document.getElementById('planView').classList.add('hidden');
    });

    document.getElementById('planTab')?.addEventListener('click', () => {
        document.getElementById('planTab').classList.add('tab-active');
        document.getElementById('browseTab').classList.remove('tab-active');
        document.getElementById('planView').classList.remove('hidden');
        document.getElementById('browseView').classList.add('hidden');
    });

    // Browse view mood buttons
    setupBrowseViewEventListeners();

    // Modal search
    document.getElementById('modalSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        let results;

        if (query) {
            results = fuse.search(query).map(r => r.item);
        } else {
            results = currentSlot === 'breakfast'
                ? meals.filter(m => m.moods.includes('breakfast'))
                : currentSlot === 'snacks'
                ? meals.filter(m => m.category === 'side' || m.moods.includes('quick'))
                : meals.filter(m => !m.moods.includes('breakfast'));
        }

        const otherMeals = Object.entries(dailyPlan)
            .filter(([s, m]) => s !== currentSlot && m)
            .map(([s, m]) => m);

        displayModalMeals(results, otherMeals, currentSlot);
    });

    // Modal filters
    document.querySelectorAll('.modal-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            let filteredMeals = meals;

            if (currentSlot === 'breakfast') {
                filteredMeals = meals.filter(m => m.moods.includes('breakfast'));
            } else if (currentSlot === 'snacks') {
                filteredMeals = meals.filter(m => m.category === 'side' || m.moods.includes('quick'));
            } else {
                filteredMeals = meals.filter(m => !m.moods.includes('breakfast'));
            }

            if (filter !== 'all') {
                filteredMeals = filteredMeals.filter(m => m.moods.includes(filter));
            }

            const otherMeals = Object.entries(dailyPlan)
                .filter(([s, m]) => s !== currentSlot && m)
                .map(([s, m]) => m);

            displayModalMeals(filteredMeals, otherMeals, currentSlot);
        });
    });
}

function setupBrowseViewEventListeners() {
    // Browse view mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('btn-primary'));
            btn.classList.add('btn-primary');

            const mood = btn.dataset.mood;
            const moodMeals = meals.filter(m => m.moods.includes(mood));

            const container = document.getElementById('mealSuggestions');
            container.innerHTML = '';

            if (moodMeals.length === 0) {
                container.innerHTML = '<p class="text-base-content/60">No meals found for this mood.</p>';
            } else {
                // Show all meals for the selected mood (no "Show 3 more" button)
                moodMeals.forEach(meal => {
                    const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
                    const mealCard = document.createElement('div');
                    mealCard.className = 'card bg-base-100 p-3 hover:bg-base-200 cursor-pointer';
                    mealCard.innerHTML = `
                        <h4 class="font-semibold">${meal.name}</h4>
                        <p class="text-xs text-base-content/60 mt-1">
                            ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat
                        </p>
                    `;
                    container.appendChild(mealCard);
                });
            }

            document.getElementById('suggestionsArea').classList.remove('hidden');
        });
    });
}

// Initialize everything when DOM is ready
function initializeApp() {
    loadMeals();
    // setupAllEventListeners is now called at the end of loadMeals()
}

// Expose functions for global access
window.initializeApp = initializeApp;
window.selectMealForSlot = selectMealForSlot;
window.selectMeal = selectMeal;
window.addManualMeal = addManualMeal;
window.clearDailyPlan = clearDailyPlan;
window.saveDailyPlan = saveDailyPlanHandler;
window.loadPlanByDate = loadPlanByDate;
window.loadMeals = loadMeals;
window.setupAllEventListeners = setupAllEventListeners;

// Set current date
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
});