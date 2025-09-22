# Daily Meal Planner Design

## Core Concept
Plan your full day by selecting breakfast, lunch, and dinner - then see nutrition totals and make swaps.

## UI Design

### Main Planning View
```
┌─────────────────────────────────────────────┐
│          📅 Today's Meal Plan               │
│                                             │
│  🌅 Breakfast          [+ Select]           │
│  ┌─────────────────────────────┐           │
│  │ (Empty - tap to add)        │           │
│  └─────────────────────────────┘           │
│                                             │
│  ☀️ Lunch              [+ Select]           │
│  ┌─────────────────────────────┐           │
│  │ (Empty - tap to add)        │           │
│  └─────────────────────────────┘           │
│                                             │
│  🌙 Dinner             [+ Select]           │
│  ┌─────────────────────────────┐           │
│  │ (Empty - tap to add)        │           │
│  └─────────────────────────────┘           │
│                                             │
│  ─────────────────────────────────          │
│  Daily Totals:                              │
│  Protein: 0g | Carbs: 0g | Fat: 0g         │
│  Calories: 0 | Runner Score: --            │
└─────────────────────────────────────────────┘
```

### After Selecting Meals
```
┌─────────────────────────────────────────────┐
│          📅 Today's Meal Plan               │
│                                             │
│  🌅 Breakfast                    [Change]   │
│  ┌─────────────────────────────┐           │
│  │ Scrambled Eggs on Rye       │           │
│  │ 20g protein • 35g carbs     │           │
│  └─────────────────────────────┘           │
│                                             │
│  ☀️ Lunch                        [Change]   │
│  ┌─────────────────────────────┐           │
│  │ Chicken Teriyaki            │           │
│  │ 35g protein • 65g carbs     │           │
│  └─────────────────────────────┘           │
│                                             │
│  🌙 Dinner                       [Change]   │
│  ┌─────────────────────────────┐           │
│  │ Salmon with Asparagus       │           │
│  │ 40g protein • 45g carbs     │           │
│  └─────────────────────────────┘           │
│                                             │
│  ─────────────────────────────────          │
│  Daily Totals:                              │
│  ✅ Protein: 95g | Carbs: 145g | Fat: 42g  │
│  Calories: 1,330 | Runner Score: 9/10 ⚡    │
│                                             │
│  [Save Plan] [Share] [Clear All]           │
└─────────────────────────────────────────────┘
```

## Selection Flow

### When clicking "Select" for any meal slot:
1. **Filter by meal type first**
   - Breakfast slot → Show only breakfast-tagged meals
   - Lunch/Dinner → Show all non-breakfast meals

2. **Then allow mood/search refinement**
   ```
   Selecting lunch:
   [All Lunch Options] [Quick] [Hearty] [Fresh]
   🔍 Search lunches...
   ```

3. **Smart suggestions based on other slots**
   - If dinner is Italian, deprioritize Italian for lunch
   - If breakfast is light, suggest heartier lunch
   - Balance protein across meals

## Intelligence Features

### Meal Compatibility Checking
```javascript
// Avoid repetition
if (breakfast.category === 'eggs' && lunch.category === 'eggs') {
  showWarning("Two egg meals - consider variety?");
}

// Nutrition balance
if (totalProtein < 75) {
  suggestHighProtein = true;
}

// Running schedule aware
if (userRunsAt === 'evening') {
  dinner.preferLight = true;
}
```

### Daily Templates
Quick-start templates:
- **Training Day**: High carb breakfast, balanced lunch, protein dinner
- **Rest Day**: Lower carb, higher protein throughout
- **Race Week**: Carb-loading progression

### Swap Intelligence
When changing a meal, show alternatives that:
1. Maintain similar nutrition profile
2. Keep daily totals balanced
3. Use available ingredients
4. Complement other meals

## Data Structure

### In localStorage
```javascript
mealPlans: {
  "2024-01-20": {
    breakfast: "Scrambled Eggs on Rye",
    lunch: "Chicken Teriyaki",
    dinner: "Salmon with Asparagus",
    totalNutrition: {
      protein: 95,
      carbs: 145,
      fat: 42,
      calories: 1330
    },
    notes: "Long run day"
  }
}
```

### Weekly View
```
Mon: ✅ Planned (95g protein)
Tue: ✅ Planned (88g protein)
Wed: ⚠️ Partial (lunch missing)
Thu: -- Empty
Fri: -- Empty
Sat: 🏃 Race day plan
Sun: -- Empty
```

## Integration with Existing Features

### Works WITH mood selection:
- "I'm feeling cozy" → Shows only cozy options for that slot
- Recent meals appear but marked if already in today's plan

### Enhancement: Grocery Integration
```
Today's Plan needs:
□ 3 eggs
□ Rye bread
□ Chicken thighs (300g)
□ Salmon fillet (200g)
[Copy List] [Send to Notes]
```

### Future: Meal Prep Mode
```
Planning 3 days of lunches:
Mon: Chicken Teriyaki ──┐
Tue: Chicken Teriyaki ──┼── Make 3x batch Sunday
Wed: Chicken Teriyaki ──┘
```

## Implementation Approach

### Phase 1: Basic Planning
1. Add "Plan My Day" tab to main screen
2. Three slots with select buttons
3. Store selections in localStorage
4. Calculate basic totals

### Phase 2: Smart Features
1. Add nutrition to meals.json
2. Compatibility warnings
3. Swap suggestions
4. Templates

### Phase 3: Calendar
1. Save plans by date
2. Week view
3. Copy previous days
4. Stats/patterns

## Why This Works for You

1. **Reduces decision fatigue**: Plan once in the morning, done
2. **Nutrition visibility**: See if you're hitting protein goals
3. **Prevents conflicts**: No accidental pasta-pasta days
4. **Shopping clarity**: Know exactly what to buy
5. **Running optimization**: Balance meals around training

## Quick Mock-up Code

```javascript
// Core state
let dailyPlan = {
  breakfast: null,
  lunch: null,
  dinner: null
};

// Selection function
function selectMealForSlot(slot) {
  // Filter appropriate meals
  let options = meals;
  if (slot === 'breakfast') {
    options = meals.filter(m => m.moods.includes('breakfast'));
  }

  // Check conflicts
  const otherMeals = Object.values(dailyPlan).filter(m => m);
  options = smartFilter(options, otherMeals);

  // Show selection UI
  showMealSelector(options, (selected) => {
    dailyPlan[slot] = selected;
    updateTotals();
    saveToLocalStorage();
  });
}

// Calculate totals
function updateTotals() {
  const meals = Object.values(dailyPlan).filter(m => m);
  const totals = meals.reduce((acc, meal) => {
    acc.protein += meal.nutrition?.protein || 0;
    acc.carbs += meal.nutrition?.carbs || 0;
    return acc;
  }, {protein: 0, carbs: 0});

  displayTotals(totals);
  checkRunnerGoals(totals);
}
```