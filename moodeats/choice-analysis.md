# MoodEats Choice Architecture Analysis

## Current State
- **76+ meals** in database
- Shows **5 at a time** with "show more" button
- Random shuffling on each mood/search

## Choice Theory Principles

### 1. Paradox of Choice (Barry Schwartz)
- **Too many options** → decision paralysis, regret, escalation of expectations
- **Sweet spot**: 5-9 options for satisficers (good-enough deciders)
- You're a **mood-driven eater** = likely a satisficer when hungry

### 2. Hick's Law
- Decision time = log₂(n+1) where n = number of choices
- **3 choices**: ~1.6 units of time
- **5 choices**: ~2.3 units of time
- **10 choices**: ~3.3 units of time
- Diminishing returns after 5-7 options

### 3. Miller's Law (7±2 Rule)
- Working memory holds 5-9 items comfortably
- Beyond this, cognitive load increases significantly

### 4. Peak-End Rule (Kahneman)
- People judge experiences by peak moment + how it ended
- First and last options shown matter most

## Recommendations for MoodEats

### Optimal Presentation
1. **Show 3 meals initially** (not 5)
   - Faster decision-making when hungry
   - Less overwhelming
   - Still gives variety

2. **"Show 3 more" button** (not "show something else")
   - Clear expectation setting
   - Chunked decisions

3. **Smart ordering** instead of pure random:
   - **1st slot**: Most popular for that mood/search (comfort pick)
   - **2nd slot**: Something slightly adventurous (discovery)
   - **3rd slot**: Quick/easy option (fallback)

4. **Progressive disclosure**:
   - Text search shows 3 results
   - If <3 results, show "closest matches" section with 2-3 more
   - Mood buttons show 3, with option to narrow ("Cozy + Quick?")

### Behavioral Patterns to Support
- **Mood-first browsing**: When you don't know what you want
- **Craving-first searching**: When you have a specific desire
- **Ingredient-driven**: "I have salmon, what can I make?"

### Anti-Patterns to Avoid
- Infinite scroll (causes decision fatigue)
- Too many filters (analysis paralysis)
- Showing all 76 options at once
- Re-shuffling when they haven't decided (causes FOMO)

## Implementation Changes

### Phase 1: Presentation
```javascript
// Instead of 5 random meals
const INITIAL_SHOW = 3;
const MORE_INCREMENT = 3;

// Smart ordering based on:
// - Popularity score (track clicks over time)
// - Complexity score (quick/medium/involved)
// - Last eaten (if tracking)
```

### Phase 2: Memory
- Add "Recently picked" section (last 3 meals selected)
- Optional: Star favorites for quick access
- Optional: "Not feeling these" to temporarily hide meals

### Phase 3: Context
- Time-aware suggestions (breakfast before 11am)
- Weather-aware (cozy soups on cold days via API)
- Day-of-week patterns (quick meals on weekdays)