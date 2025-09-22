# MoodEats Maintenance Guide - v2.0

## Project Structure (Refactored)

```
moodeats/
├── index.html              # Production HTML (uses bundled JS)
├── index-modular.html      # Development HTML (uses ES modules)
├── dist/
│   └── moodeats-bundle.js  # Bundled JavaScript for production
├── src/
│   ├── css/
│   │   └── styles.css      # Custom styles
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── meals-data.js   # Meals array (76+ meals)
│   │   ├── nutrition-data.js # Nutrition estimates
│   │   ├── storage.js      # LocalStorage functions
│   │   └── ui.js           # UI update functions
│   └── data/
│       └── (future: meals.json processed)
├── scripts/
│   └── build.js            # Build bundled version
├── tests/
│   ├── unit/               # Unit tests
│   ├── e2e/                # End-to-end tests
│   └── fixtures/           # Test data
├── archive/                # Old versions for reference
└── docs/                   # Documentation

```

## Quick Commands

### Local Development
```bash
# Serve locally
python3 -m http.server 8000
open http://localhost:8000/index.html

# Run tests
npm test

# Lint code
npm run lint
```

### Build & Deploy
```bash
# Build bundled version
node scripts/build.js

# Deploy to GitHub Pages
git add -A
git commit -m "Your message"
git push moodeats main

# Site live at: https://njrun1804.github.io/moodeats/
```

## Architecture Overview

### Modular Design
The app is now split into logical modules:

1. **meals-data.js** - Contains the array of 76+ meals
2. **nutrition-data.js** - Nutrition estimates for each meal
3. **storage.js** - All localStorage operations
4. **ui.js** - DOM manipulation and display updates
5. **app.js** - Main application logic and initialization

### Data Flow
```
app.js (coordinator)
  ├── loads meals-data.js
  ├── uses nutrition-data.js for calculations
  ├── calls storage.js for persistence
  └── updates DOM via ui.js
```

## Adding New Features

### Add a New Meal
1. Edit `src/js/meals-data.js`
2. Add meal object to the `embeddedMeals` array:
```javascript
{
  "name": "Meal Name",
  "category": "breakfast|italian|japanese|chinese|texmex|seafood|soup|sandwich|side",
  "moods": ["cozy", "fresh", "hearty", "quick"],
  "ingredients": {
    "core": ["Main ingredients"],
    "pantry": ["Pantry staples"]
  },
  "searchTerms": ["keywords"]
}
```

3. Add nutrition data in `src/js/nutrition-data.js`:
```javascript
"Meal Name": { protein: 30, carbs: 45, fat: 20, calories: 480 }
```

4. Run build: `node scripts/build.js`

### Add a New Mood
1. Update HTML buttons in `index.html`
2. Add filtering logic in `app.js` → `selectMealForSlot()`
3. Update meal data with new mood tags

### Modify Nutrition Calculations
- Edit `ui.js` → `calculateRunnerScore()` for scoring logic
- Edit `ui.js` → `updateDailyTotals()` for totals display

## Key Functions Reference

### app.js
- `initializeApp()` - Entry point
- `selectMealForSlot(slot)` - Opens modal for meal selection
- `selectMeal(meal)` - Adds meal to daily plan
- `addManualMeal()` - Adds custom typed meal

### storage.js
- `savePlanToStorage()` - Saves current plan
- `loadDailyPlan()` - Loads saved plan
- `saveDailyPlan()` - Archives daily plan

### ui.js
- `updateSlotDisplay(slot, meal)` - Updates meal slot UI
- `updateDailyTotals()` - Calculates and displays totals
- `displayModalMeals()` - Shows meals in selection modal

## Testing

### Unit Tests
```bash
npm run test:unit        # Run all unit tests
npm run test:coverage    # With coverage report
```

### E2E Tests
```bash
npm run test:e2e         # Run all E2E tests
npm run test:headed      # Run with browser visible
npm run test:ui          # Open Playwright UI
```

## Maintenance Tasks

### Update All Nutrition Values
```bash
# Future: Create script to calculate calories
# calories = (protein * 4) + (carbs * 4) + (fat * 9)
```

### Clean Up Old Plans
```javascript
// In storage.js, adjust retention period (currently 30 days)
cutoff.setDate(cutoff.getDate() - 30); // Change 30 to desired days
```

### Performance Optimization
- Bundle is currently ~100KB
- Consider lazy loading meal data if grows > 200KB
- Use service worker for offline support

## User Preferences

Current dietary restrictions handled:
- No cilantro (excluded from ingredients)
- Minimal citrus (zest only, no juice)
- Low acid (passata instead of tomato sauce)
- Mild spice only
- Melty cheese preferred (provolone, mozzarella)

## Troubleshooting

### Meals Not Loading
1. Check browser console for errors
2. Verify `embeddedMeals` exists in meals-data.js
3. Check Fuse.js CDN is loading
4. Run build script: `node scripts/build.js`

### LocalStorage Issues
- Check localStorage quota (usually 5-10MB)
- Clear old data: `localStorage.clear()`
- Check for 'moodeats:' prefix on all keys

### Build Issues
- Ensure Node.js installed
- Check file paths in build.js
- Verify src files exist before building

## Future Enhancements

### Phase 1 ✅ (Completed)
- Modular architecture
- Nutrition tracking
- Manual meal entry
- Snacks section

### Phase 2 (Next)
- [ ] Favorites system
- [ ] Meal history export
- [ ] Weekly planning
- [ ] Shopping list generation

### Phase 3 (Future)
- [ ] Recipe integration
- [ ] Nutrition API integration
- [ ] Multi-user support
- [ ] Mobile app version

## Git Workflow

```bash
# Feature branch
git checkout -b feature-name
# Make changes
git add -A
git commit -m "feat: description"
git push origin feature-name

# Merge to main
git checkout main
git merge feature-name
git push moodeats main
```

## Performance Metrics

Target metrics:
- Initial load: < 2s
- Time to interactive: < 3s
- Lighthouse score: > 90
- Bundle size: < 200KB

Current (after refactor):
- HTML: 11KB (was 65KB)
- JavaScript: ~100KB bundled
- CSS: 1KB
- Total: ~112KB (was 65KB monolithic)

---

*Last updated: Sep 22, 2025 - Major refactoring to modular architecture*