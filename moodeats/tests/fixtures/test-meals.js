// Test meal data for E2E tests
const testMeals = [
  {
    "name": "Fresh Salad",
    "category": "salad",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["lettuce", "tomatoes"],
      "pantry": ["olive oil", "vinegar"]
    },
    "nutrition": {
      "calories": 200,
      "protein": 5,
      "carbs": 20,
      "fat": 10
    },
    "searchTerms": ["salad", "fresh", "healthy"]
  },
  {
    "name": "Cozy Soup",
    "category": "soup",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["chicken", "vegetables"],
      "pantry": ["salt", "pepper"]
    },
    "nutrition": {
      "calories": 350,
      "protein": 25,
      "carbs": 30,
      "fat": 12
    },
    "searchTerms": ["soup", "cozy", "warm"]
  },
  {
    "name": "Hearty Steak",
    "category": "dinner",
    "moods": ["hearty"],
    "ingredients": {
      "core": ["steak", "potatoes"],
      "pantry": ["butter", "garlic"]
    },
    "nutrition": {
      "calories": 600,
      "protein": 50,
      "carbs": 40,
      "fat": 25
    },
    "searchTerms": ["steak", "hearty", "protein"]
  },
  {
    "name": "Quick Sandwich",
    "category": "sandwich",
    "moods": ["quick"],
    "ingredients": {
      "core": ["bread", "turkey"],
      "pantry": ["mustard", "mayo"]
    },
    "nutrition": {
      "calories": 400,
      "protein": 30,
      "carbs": 45,
      "fat": 15
    },
    "searchTerms": ["sandwich", "quick", "lunch"]
  },
  {
    "name": "Breakfast Eggs",
    "category": "breakfast",
    "moods": ["breakfast", "quick"],
    "ingredients": {
      "core": ["eggs", "toast"],
      "pantry": ["butter", "salt"]
    },
    "nutrition": {
      "calories": 300,
      "protein": 20,
      "carbs": 25,
      "fat": 15
    },
    "searchTerms": ["eggs", "breakfast", "morning"]
  },
  {
    "name": "Seafood Pasta",
    "category": "seafood",
    "moods": ["seafood", "italian"],
    "ingredients": {
      "core": ["shrimp", "pasta"],
      "pantry": ["garlic", "olive oil"]
    },
    "nutrition": {
      "calories": 450,
      "protein": 35,
      "carbs": 55,
      "fat": 12
    },
    "searchTerms": ["seafood", "pasta", "shrimp"]
  },
  {
    "name": "Asian Stir Fry",
    "category": "chinese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["chicken", "vegetables"],
      "pantry": ["soy sauce", "ginger"]
    },
    "nutrition": {
      "calories": 400,
      "protein": 35,
      "carbs": 35,
      "fat": 15
    },
    "searchTerms": ["asian", "stir fry", "chinese"]
  },
  {
    "name": "Italian Pizza",
    "category": "italian",
    "moods": ["italian", "cozy"],
    "ingredients": {
      "core": ["dough", "cheese", "tomato sauce"],
      "pantry": ["oregano", "basil"]
    },
    "nutrition": {
      "calories": 550,
      "protein": 25,
      "carbs": 65,
      "fat": 20
    },
    "searchTerms": ["pizza", "italian", "cheese"]
  },
  {
    "name": "Grilled Chicken",
    "category": "dinner",
    "moods": ["hearty", "fresh"],
    "ingredients": {
      "core": ["chicken breast", "vegetables"],
      "pantry": ["olive oil", "herbs"]
    },
    "nutrition": {
      "calories": 400,
      "protein": 45,
      "carbs": 20,
      "fat": 15
    },
    "searchTerms": ["chicken", "grilled", "healthy"]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = testMeals;
}