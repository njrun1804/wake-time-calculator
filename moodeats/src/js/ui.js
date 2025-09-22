// UI update functions for MoodEats
// Handles all DOM manipulations and display updates

import { nutritionEstimates } from './nutrition-data.js';

function updateSlotDisplay(slot, meal, dailyPlan) {
    const slotElement = document.getElementById(`${slot}-slot`);
    const btnElement = document.getElementById(`${slot}-btn-text`);

    if (meal) {
        const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
        slotElement.innerHTML = `
            <div>
                <h4 class="font-semibold">${meal.name}</h4>
                <div class="text-sm text-base-content/60 mt-1">
                    ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat • ${nutrition.calories} cal
                </div>
            </div>
        `;
        btnElement.textContent = 'Change';
    } else {
        const defaultText = {
            breakfast: 'Tap select to choose breakfast',
            lunch: 'Tap select to choose lunch',
            dinner: 'Tap select to choose dinner',
            snacks: 'Tap select to choose snacks'
        };
        slotElement.innerHTML = `<p class="text-base-content/40">${defaultText[slot]}</p>`;
        btnElement.textContent = 'Select';
    }
}

function updateDailyTotals(dailyPlan) {
    const totals = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    let mealCount = 0;

    Object.values(dailyPlan).forEach(meal => {
        if (meal) {
            const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
            totals.protein += nutrition.protein;
            totals.carbs += nutrition.carbs;
            totals.fat += nutrition.fat;
            totals.calories += nutrition.calories;
            mealCount++;
        }
    });

    document.getElementById('totalProtein').textContent = `${totals.protein}g`;
    document.getElementById('totalCarbs').textContent = `${totals.carbs}g`;
    document.getElementById('totalFat').textContent = `${totals.fat}g`;
    document.getElementById('totalCalories').textContent = totals.calories;

    const score = calculateRunnerScore(totals);
    const scoreElement = document.getElementById('runnerScore');
    const scoreText = document.getElementById('scoreText');

    scoreElement.textContent = score;
    scoreElement.className = score >= 8 ? 'font-bold text-green-600' :
                            score >= 6 ? 'font-bold text-yellow-600' :
                            'font-bold text-red-600';

    const messages = {
        high: "Great fuel for your run! 🏃‍♂️",
        medium: "Good balance, consider more carbs 🥖",
        low: "Add more meals for energy! 🍝"
    };

    scoreText.textContent = score >= 8 ? messages.high :
                           score >= 6 ? messages.medium :
                           messages.low;
}

function calculateRunnerScore(totals) {
    let score = 0;
    if (totals.calories >= 1800 && totals.calories <= 2500) score += 3;
    else if (totals.calories >= 1500 && totals.calories <= 3000) score += 2;
    else if (totals.calories > 0) score += 1;

    if (totals.carbs >= 200 && totals.carbs <= 400) score += 3;
    else if (totals.carbs >= 150) score += 2;
    else if (totals.carbs > 0) score += 1;

    if (totals.protein >= 80 && totals.protein <= 150) score += 2;
    else if (totals.protein >= 50) score += 1;

    const ratio = totals.carbs / (totals.protein + 0.1);
    if (ratio >= 2 && ratio <= 4) score += 2;
    else if (ratio >= 1.5) score += 1;

    return score;
}

function displayModalMeals(mealList, otherMeals, currentSlot) {
    const container = document.getElementById('modalMeals');
    container.innerHTML = '';

    mealList.forEach(meal => {
        const isDuplicate = otherMeals.some(m => m && m.name === meal.name);
        const mealCard = document.createElement('div');
        mealCard.className = `card bg-base-100 cursor-pointer hover:bg-base-300 transition-colors ${isDuplicate ? 'opacity-50' : ''}`;

        const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };

        mealCard.innerHTML = `
            <div class="card-body p-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold">${meal.name}</h4>
                        <p class="text-xs text-base-content/60 mt-1">
                            ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat
                        </p>
                        ${isDuplicate ? '<p class="text-xs text-warning mt-1">Already selected</p>' : ''}
                    </div>
                    <span class="text-xs text-base-content/40">${nutrition.calories} cal</span>
                </div>
            </div>
        `;

        mealCard.onclick = () => window.selectMeal(meal);
        container.appendChild(mealCard);
    });
}

function displaySavedPlans() {
    const plans = JSON.parse(localStorage.getItem('moodeats:dailyPlans') || '{}');
    const container = document.getElementById('savedPlansList');
    const savedPlansDiv = document.getElementById('savedPlans');

    if (Object.keys(plans).length === 0) {
        savedPlansDiv.classList.add('hidden');
        return;
    }

    savedPlansDiv.classList.remove('hidden');
    container.innerHTML = '';

    const sortedDates = Object.keys(plans).sort((a, b) => new Date(b) - new Date(a)).slice(0, 5);

    sortedDates.forEach(date => {
        const plan = plans[date];
        const mealCount = Object.values(plan).filter(m => m).length;
        const dateObj = new Date(date + 'T12:00:00');
        const isToday = date === new Date().toISOString().split('T')[0];

        const planElement = document.createElement('div');
        planElement.className = 'text-xs p-2 bg-base-100 rounded cursor-pointer hover:bg-base-300';
        planElement.innerHTML = `
            <div class="flex justify-between">
                <span>${isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span class="text-base-content/60">${mealCount} meals</span>
            </div>
        `;
        planElement.onclick = () => window.loadPlanByDate(date);
        container.appendChild(planElement);
    });
}

export {
    updateSlotDisplay,
    updateDailyTotals,
    calculateRunnerScore,
    displayModalMeals,
    displaySavedPlans
};