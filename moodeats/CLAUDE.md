# MoodEats - Browse-Only Version

## Overview
MoodEats is a simplified meal suggestion app that helps users find meals based on their mood. Users can click on mood buttons to see relevant meal suggestions with nutrition information and ingredients.

## Features
- 🎯 Browse meals by mood (Cozy, Fresh, Hearty, Quick, Asian, Italian, Seafood, Breakfast)
- 🔍 Search functionality to find specific meals
- 📊 Nutrition information display (protein, carbs, fat, calories)
- 🥘 Main ingredients list for each meal
- 🏷️ Mood tags on each meal card

## Project Structure

```
moodeats/
├── index.html              # Main HTML file (simplified browse-only)
├── dist/
│   └── moodeats-simple.js  # Bundled JavaScript for production
├── src/
│   ├── css/
│   │   └── styles.css      # Custom styles
│   └── js/
│       ├── app-simple.js   # Main application logic (browse-only)
│       ├── meals-data.js   # Meals array (74 meals)
│       └── nutrition-data.js # Nutrition estimates for each meal
├── scripts/
│   └── build-browse-only.js # Build script for bundled version
├── tests/
│   └── e2e/
│       └── browse-only.spec.js # End-to-end tests for browse functionality
└── package.json
```

## Quick Commands

### Local Development
```bash
# Serve locally
python3 -m http.server 8000
open http://localhost:8000

# Run tests
npm test

# Build for production
npm run build
```

### Deploy
```bash
# Build and deploy to GitHub Pages
npm run build
git add -A
git commit -m "Your message"
git push moodeats main

# Site live at: https://njrun1804.github.io/moodeats/
```

## How It Works

1. **User clicks a mood button** → Shows all meals tagged with that mood
2. **User searches for a meal** → Fuzzy search through meal names, ingredients, and tags
3. **Each meal card displays**:
   - Meal name
   - Nutrition info (protein, carbs, fat, calories)
   - Main ingredients
   - Mood tags

## Adding New Meals

Edit `src/js/meals-data.js` and add to the `embeddedMeals` array:

```javascript
{
  "name": "Meal Name",
  "category": "breakfast|italian|japanese|chinese|texmex|seafood|soup|sandwich|side",
  "moods": ["cozy", "fresh", "hearty", "quick", "asian", "italian", "seafood", "breakfast"],
  "ingredients": {
    "core": ["Main ingredient 1", "Main ingredient 2"],
    "pantry": ["Pantry item 1", "Pantry item 2"]
  },
  "searchTerms": ["keyword1", "keyword2"]
}
```

Then add nutrition data in `src/js/nutrition-data.js`:

```javascript
"Meal Name": { protein: 30, carbs: 45, fat: 20, calories: 480 }
```

Run `npm run build` to rebuild the bundle.

## Testing

```bash
# Run browse-only tests
npm test

# Run with visible browser
npm run test:headed

# Run specific test
npx playwright test tests/e2e/browse-only.spec.js
```

## User Preferences

Current dietary preferences handled:
- No cilantro
- Minimal citrus (zest only, no juice)
- Low acid (passata instead of tomato sauce)
- Mild spice only
- Melty cheese preferred

## Performance

- Bundle size: ~90KB
- No external dependencies except CDN (Tailwind, DaisyUI, Fuse.js)
- Fast load time
- Mobile responsive

---

*Last updated: Sep 22, 2025 - Simplified to browse-only version*