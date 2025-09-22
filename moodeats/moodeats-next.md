# MoodEats Next Features

## 1. Meal Rating & Preference Learning

### Quick Feedback System
After selecting a meal, add subtle feedback options:
```
[Selected: Chicken Teriyaki]
How was it?
😍 Loved it | 👍 Good | 🤷 Meh | 👎 Not for me
```

### Data to Track
```javascript
// In localStorage
preferences: {
  "Chicken Teriyaki": {
    rating: 5,        // 1-5 scale
    lastMade: "2024-01-20",
    frequency: 3,     // times selected
    avgDaysBetween: 7 // learning patterns
  }
}
```

### Smart Suggestions Based on Feedback
- **Loved it (5)**: Show similar meals more often
- **Good (3-4)**: Normal rotation
- **Meh/Nope (1-2)**: Hide for 30+ days, then retry

### Implementation: Lightweight
- Store in localStorage (no backend needed)
- Weight suggestions by: `(rating × 0.5) + (recency × 0.3) + (variety × 0.2)`
- If you rate "Chicken Teriyaki" 5/5, boost other `japanese` + `quick` meals

## 2. "I Have X" Ingredient Search

### New Search Mode
```
🔍 Search mode: [Mood] [Craving] [→ I Have ←]

Type what you have: "leftover tuna"
or "chicken to use up"
```

### Smart Parsing
```javascript
// Parse input
"leftover tuna" → ingredient: "tuna", preference: "quick"
"chicken thighs expiring" → ingredient: "chicken", urgency: high
"need to use spinach" → ingredient: "spinach", filter: true

// Return meals containing that ingredient
// Prioritize by:
// 1. Exact ingredient match
// 2. Quick prep (for leftovers)
// 3. Uses most of the ingredient
```

### Pairing Mode
```
"What goes with chicken parm?"
→ Shows sides/salads that complement
→ Filter by: italian mood, no competing proteins
```

### Example Results
Input: "leftover tuna"
```
1. Tuna Melt on Rye (Quick)
2. Tuna, Olive & Capers Rigatoni
3. [New] Tuna Rice Bowl (add to DB)
```

## 3. Runner Nutrition Awareness

### Add Nutrition Estimates to meals.json
```json
{
  "name": "Chicken Teriyaki",
  "nutrition": {
    "protein": 35,      // grams
    "carbs": 65,        // grams
    "fat": 12,          // grams
    "calories": 500,
    "runnerScore": 9    // 1-10 for endurance
  }
}
```

### Display Options
```
[Chicken Teriyaki]
Runner fuel: ⚡⚡⚡⚡⚡ (Great!)
~35g protein | 65g carbs | Low fat
```

### Runner-Optimized Filters
New mood buttons:
- 🏃 **Pre-Run** (3-4 hrs before): High carb, moderate protein, low fat/fiber
- 💪 **Post-Run** (within 30min): 3:1 or 4:1 carb:protein ratio
- 🌙 **Night Recovery**: Higher protein (30g+), complex carbs

### Auto-Tag Existing Meals
```javascript
// Auto-calculate runner scores
if (protein >= 25 && protein <= 35 &&
    carbs >= 50 && fat <= 20) {
  runnerScore = 9; // Excellent
}
```

## Implementation Priority

### Phase 1: Ingredient Search (Highest Value)
**Why first**: Solves real problem of food waste, practical daily use
**Effort**: Medium (need to parse natural language)
**Implementation**:
1. Add `primaryIngredients` array to each meal
2. Create "I have" search mode
3. Fuzzy match ingredients

### Phase 2: Nutrition Tags
**Why second**: One-time data addition, helps training
**Effort**: Low-Medium (estimate nutrition, add to DB)
**Implementation**:
1. Add nutrition object to meals.json
2. Calculate runner scores
3. Add filter badges

### Phase 3: Preference Learning
**Why third**: Needs time to collect data to be useful
**Effort**: Medium (localStorage, weighting algorithm)
**Implementation**:
1. Add feedback UI after selection
2. Store ratings in localStorage
3. Weight future suggestions

## Quick Wins We Could Do Now

### 1. Add "Quick Substitutions" to meals
```json
"substitutions": {
  "chicken": ["turkey", "tofu"],
  "rice": ["quinoa", "orzo"]
}
```

### 2. Time-Based Filtering
```javascript
const hour = new Date().getHours();
if (hour < 11) {
  // Boost breakfast moods
} else if (hour > 20) {
  // Boost quick moods
}
```

### 3. "Cook Together" Suggestions
When you select a main, suggest compatible sides:
```
Selected: Salmon Teriyaki
Add a side?
→ Edamame | Miso Soup | Cucumber Salad
```

## Technical Approach

### Keep It Simple
- **No backend**: Everything in browser storage
- **No accounts**: Device-specific preferences
- **No complexity**: Progressive enhancement

### Storage Structure
```javascript
localStorage: {
  'moodeats:recent': [...],      // existing
  'moodeats:ratings': {...},     // new
  'moodeats:inventory': [...],   // what you have
  'moodeats:preferences': {...}  // learned patterns
}
```

### Natural Language Parsing
```javascript
// Simple keyword matching first
const hasIngredient = (query) => {
  const proteins = ['chicken', 'beef', 'turkey', 'salmon', ...];
  const found = proteins.filter(p => query.includes(p));
  return found[0];
}

// Then context clues
const isLeftover = query.includes('leftover') ||
                   query.includes('extra');
const needsQuick = isLeftover || query.includes('quick');
```

## Next Step Recommendation

**Start with Ingredient Search** - it's the most immediately useful:

1. Add `primaryIngredients` field to meals.json
2. Create "I have" toggle in search bar
3. Parse "chicken" → show all chicken dishes
4. Parse "leftover X" → prioritize quick + reheatable

This solves your "what do I do with this leftover tuna" problem without adding complexity.