# MoodEats Maintenance Guide

## Quick Commands

### Add a new meal
```bash
# Open meals.json and add to the array
open meals.json
```

### Test locally
```bash
# Serve with Python (has CORS headers for JSON)
python3 -m http.server 8000
open http://localhost:8000/moodeats-v2.html
```

### Deploy updates
```bash
git add -A
git commit -m "Update meals database"
git push moodeats main
```

## File Structure
```
moodeats/
├── index.html          # Production (copy of moodeats-v2.html)
├── moodeats-v2.html    # Latest version with choice optimization
├── moodeats.html       # Old version (meals embedded)
├── meals.json          # Meal database (76+ meals)
├── choice-analysis.md  # Choice theory documentation
└── README.md          # Public documentation
```

## Meal Schema
Each meal in `meals.json` must have:
```json
{
  "name": "Meal Name",
  "category": "breakfast|italian|japanese|chinese|texmex|seafood|soup|sandwich|side",
  "moods": ["cozy", "fresh", "hearty", "quick", "breakfast", "seafood", "asian", "italian"],
  "ingredients": {
    "core": ["Main ingredients"],
    "pantry": ["Pantry staples"]
  },
  "searchTerms": ["keywords", "for", "fuzzy", "search"]
}
```

## Adding Meals

### Valid moods (use existing only)
- `cozy` - Comfort food, warm, soothing
- `fresh` - Light, crisp, healthy
- `hearty` - Filling, substantial, protein-heavy
- `quick` - Under 30 minutes
- `breakfast` - Morning meals
- `seafood` - Fish/shellfish primary
- `asian` - Japanese/Chinese cuisine
- `italian` - Italian/Italian-American

### Categories (for variety algorithm)
- `breakfast` - Morning meals
- `italian` - Pasta, pizza, Italian-American
- `japanese` - Sushi, teriyaki, ramen, etc.
- `chinese` - Stir-fry, takeout classics
- `texmex` - Tacos, burritos, Tex-Mex
- `seafood` - Fish/shellfish focused
- `soup` - Soups and stews
- `sandwich` - Sandwiches, wraps, subs
- `side` - Side dishes

### Search terms tips
- Include common misspellings
- Add related words (e.g., "pasta" for spaghetti dishes)
- Include cooking methods (e.g., "baked", "fried")
- Add dietary markers (e.g., "vegetarian", "no vinegar")

## Testing Changes

### Validate JSON
```bash
# Check JSON syntax
python3 -c "import json; json.load(open('meals.json'))"
```

### Check for duplicates
```bash
# Find duplicate meal names
grep '"name":' meals.json | sort | uniq -d
```

### Count meals by mood
```bash
# See mood distribution
grep -o '"moods": \[.*\]' meals.json | grep -c "cozy"
```

## Choice Theory Implementation

Current settings optimize for decision-making:
- **Shows 3 meals initially** (not 5) - reduces decision paralysis
- **"Show 3 more" button** - chunked decisions
- **Smart ordering** - variety + quick options prioritized
- **Recently viewed** - tracks last 3 selections

To adjust:
```javascript
// In moodeats-v2.html
const INITIAL_SHOW = 3;    // Meals shown initially
const MORE_INCREMENT = 3;   // Meals added per click
const MAX_RECENT = 3;      // Recent meals tracked
```

## Common Maintenance Tasks

### Remove a meal
1. Open `meals.json`
2. Find the meal by name
3. Delete the entire object (including comma)
4. Test locally
5. Commit and push

### Edit ingredients
1. Find meal in `meals.json`
2. Edit `ingredients.core` or `ingredients.pantry`
3. Keep formatting consistent
4. Test locally

### Bulk operations
```javascript
// Example: Add "weeknight" searchTerm to all quick meals
const meals = require('./meals.json');
meals.forEach(meal => {
  if (meal.moods.includes('quick') && !meal.searchTerms.includes('weeknight')) {
    meal.searchTerms.push('weeknight');
  }
});
require('fs').writeFileSync('meals.json', JSON.stringify(meals, null, 2));
```

## Deployment Checklist

1. [ ] JSON validates without errors
2. [ ] No duplicate meal names
3. [ ] Test locally with Python server
4. [ ] Copy moodeats-v2.html to index.html
5. [ ] Commit with descriptive message
6. [ ] Push to moodeats repository
7. [ ] Wait 2-3 minutes for GitHub Pages
8. [ ] Test at https://njrun1804.github.io/moodeats/

## User Preferences to Remember

- **No cilantro** - Never add
- **No pickled onions** - Never add
- **Minimal citrus** - Zest only, no juice
- **Low acid** - Use passata, not regular tomato sauce
- **Mild spice** - Nothing beyond mild heat
- **Melty > crumbly cheese** - Provolone, mozzarella preferred
- **Minimal cream sauces** - Avoid heavy dairy

## Future Enhancements

### Phase 1 (Current)
- ✅ Separated data from presentation
- ✅ Choice theory optimization (3 meals)
- ✅ Recently viewed tracking
- ✅ Smart ordering

### Phase 2 (Planned)
- [ ] Favorites/stars system
- [ ] "Not feeling these" temporary hiding
- [ ] Time-aware suggestions
- [ ] Meal history tracking

### Phase 3 (Maybe)
- [ ] Weather API integration
- [ ] Grocery list generation
- [ ] Meal planning mode
- [ ] Share meal selections

## Troubleshooting

### Meals not loading
- Check browser console for CORS errors
- Ensure meals.json is valid JSON
- Use Python server for local testing (not file://)

### Search not working
- Check Fuse.js CDN is accessible
- Verify searchTerms arrays in meals.json
- Check threshold setting (currently 0.4)

### GitHub Pages not updating
- Check Actions tab for build errors
- Ensure index.html is updated
- Clear browser cache (Cmd+Shift+R)