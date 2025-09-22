// Storage functions for MoodEats
// Handles localStorage operations for meal plans

function savePlanToStorage(dailyPlan) {
    localStorage.setItem('moodeats:currentPlan', JSON.stringify(dailyPlan));
}

function loadPlanFromStorage() {
    const saved = localStorage.getItem('moodeats:currentPlan');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading saved plan:', e);
            return null;
        }
    }
    return null;
}

function saveDailyPlan(dailyPlan) {
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
}

function loadDailyPlan() {
    const saved = loadPlanFromStorage();
    if (saved) {
        return saved;
    }

    // Try to load today's plan
    const date = new Date().toISOString().split('T')[0];
    const plans = JSON.parse(localStorage.getItem('moodeats:dailyPlans') || '{}');
    if (plans[date]) {
        return plans[date];
    }

    return { breakfast: null, lunch: null, dinner: null, snacks: null };
}

function getSavedPlans() {
    return JSON.parse(localStorage.getItem('moodeats:dailyPlans') || '{}');
}

function loadPlanByDate(date, updateSlotDisplay, updateDailyTotals, savePlanToStorage) {
    const plans = getSavedPlans();
    if (plans[date]) {
        const dailyPlan = plans[date];
        Object.entries(dailyPlan).forEach(([slot, meal]) => {
            updateSlotDisplay(slot, meal);
        });
        updateDailyTotals();
        savePlanToStorage();
        return dailyPlan;
    }
    return null;
}

export {
    savePlanToStorage,
    loadPlanFromStorage,
    saveDailyPlan,
    loadDailyPlan,
    getSavedPlans,
    loadPlanByDate
};