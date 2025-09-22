// MoodEats Browse-Only Bundle
// Generated from src/js/* files

(function() {
    'use strict';

    // ===== MEALS DATA =====
    


const embeddedMeals = [
  {
    "name": "Greek Yogurt Parfait with Berries & Muesli",
    "category": "breakfast",
    "moods": ["breakfast", "fresh", "quick"],
    "ingredients": {
      "core": ["Greek yogurt", "Mixed berries", "Muesli"],
      "pantry": ["Honey or maple syrup", "Salt (pinch)"]
    },
    "searchTerms": ["yogurt", "berries", "healthy", "light", "fruit", "morning", "easy"]
  },
  {
    "name": "Oatmeal with Banana & PB",
    "category": "breakfast",
    "moods": ["breakfast", "cozy", "quick"],
    "ingredients": {
      "core": ["Oats", "Banana", "Peanut butter"],
      "pantry": ["Water or milk", "Cinnamon (optional)"]
    },
    "searchTerms": ["oats", "oatmeal", "banana", "peanut butter", "warm", "filling", "comfort"]
  },
  {
    "name": "Scrambled Eggs on Buttered Rye",
    "category": "breakfast",
    "moods": ["breakfast", "cozy", "quick"],
    "ingredients": {
      "core": ["Eggs", "Rye bread", "Cherry tomatoes"],
      "pantry": ["Butter", "Olive oil", "Garlic", "Flaky salt"]
    },
    "searchTerms": ["eggs", "scrambled", "rye", "toast", "tomatoes", "savory", "protein", "bread"]
  },
  {
    "name": "Spinach & Mozzarella Omelet",
    "category": "breakfast",
    "moods": ["breakfast", "cozy"],
    "ingredients": {
      "core": ["Eggs", "Spinach", "Mozzarella or provolone"],
      "pantry": ["Butter", "Salt", "Pepper"]
    },
    "searchTerms": ["omelet", "eggs", "spinach", "cheese", "melty", "protein", "veggie"]
  },
  {
    "name": "Bagel with Lox & Cream Cheese",
    "category": "breakfast",
    "moods": ["breakfast", "fresh"],
    "ingredients": {
      "core": ["Bagel", "Smoked salmon", "Cream cheese"],
      "pantry": ["Dill", "Capers (rinsed)", "Lemon zest (optional)"]
    },
    "searchTerms": ["bagel", "lox", "salmon", "cream cheese", "deli", "jewish", "brunch"]
  },
  {
    "name": "Breakfast Burrito",
    "category": "breakfast",
    "moods": ["breakfast", "hearty"],
    "ingredients": {
      "core": ["Eggs", "Potatoes", "Cheese", "Tortilla"],
      "pantry": ["Mild salsa (cilantro-free)", "Guacamole (optional)"]
    },
    "searchTerms": ["burrito", "eggs", "potato", "cheese", "wrap", "mexican", "filling"]
  },
  {
    "name": "Avocado Toast with Egg",
    "category": "breakfast",
    "moods": ["breakfast", "fresh", "quick"],
    "ingredients": {
      "core": ["Avocado", "Bread", "Egg"],
      "pantry": ["Salt", "Olive oil"]
    },
    "searchTerms": ["avocado", "toast", "egg", "healthy", "trendy", "millennial", "brunch", "bread"]
  },
  {
    "name": "Savory Oats with Egg",
    "category": "breakfast",
    "moods": ["breakfast", "cozy"],
    "ingredients": {
      "core": ["Oats", "Egg", "Parmesan"],
      "pantry": ["Chicken stock", "Black pepper"]
    },
    "searchTerms": ["oats", "savory", "egg", "different", "unique", "umami", "broth"]
  },
  {
    "name": "Rye Toast with Burrata & Warm Tomatoes",
    "category": "breakfast",
    "moods": ["breakfast", "fresh"],
    "ingredients": {
      "core": ["Rye bread", "Burrata", "Cherry tomatoes"],
      "pantry": ["Olive oil", "Garlic", "Salt", "Lemon zest (optional)"]
    },
    "searchTerms": ["burrata", "tomatoes", "toast", "fancy", "italian", "creamy", "warm", "bread", "rye"]
  },
  {
    "name": "Fruit & Nuts Plate",
    "category": "breakfast",
    "moods": ["breakfast", "fresh", "quick"],
    "ingredients": {
      "core": ["Melon", "Grapes", "Nectarine or plum", "Mixed nuts"],
      "pantry": []
    },
    "searchTerms": ["fruit", "nuts", "healthy", "light", "raw", "no cook", "simple"]
  },
  {
    "name": "Egg & Cheese Bagel",
    "category": "breakfast",
    "moods": ["breakfast", "hearty", "quick"],
    "ingredients": {
      "core": ["Bagel", "Eggs", "Provolone or mozzarella"],
      "pantry": ["Butter", "Salt", "Pepper"]
    },
    "searchTerms": ["bagel", "egg and cheese", "breakfast", "classic", "quick", "sandwich", "bread"]
  },
  {
    "name": "Turkey Sausage, Egg & Cheese on Rye",
    "category": "breakfast",
    "moods": ["breakfast", "hearty"],
    "ingredients": {
      "core": ["Rye bread", "Turkey sausage", "Eggs", "Provolone"],
      "pantry": ["Butter", "Salt", "Pepper"]
    },
    "searchTerms": ["breakfast sandwich", "sausage egg cheese", "rye", "deli", "classic", "toast", "bread"]
  },
  {
    "name": "Lox, Eggs & Onions Scramble",
    "category": "breakfast",
    "moods": ["breakfast", "cozy", "quick"],
    "ingredients": {
      "core": ["Eggs", "Smoked salmon", "Onion"],
      "pantry": ["Butter", "Salt", "Pepper", "Dill (optional)"]
    },
    "searchTerms": ["lox and eggs", "scramble", "deli", "classic", "smoked salmon"]
  },
  {
    "name": "Spaghetti with Turkey Bolognese",
    "category": "italian",
    "moods": ["italian", "hearty", "cozy"],
    "ingredients": {
      "core": ["Spaghetti", "Ground turkey", "Zucchini (small, grated)", "Parmesan"],
      "pantry": ["Passata", "Onion", "Garlic", "Olive oil"]
    },
    "searchTerms": ["spaghetti", "bolognese", "pasta", "turkey", "meat sauce", "italian", "classic"]
  },
  {
    "name": "Turkey Meatballs in Marinara",
    "category": "italian",
    "moods": ["italian", "hearty", "cozy"],
    "ingredients": {
      "core": ["Ground turkey", "Spaghetti or sub roll", "Parmesan"],
      "pantry": ["Passata", "Breadcrumbs", "Egg", "Garlic", "Italian seasoning"]
    },
    "searchTerms": ["meatballs", "turkey", "marinara", "italian", "sub", "spaghetti", "comfort"]
  },
  {
    "name": "Shrimp Garlic-Butter Pasta",
    "category": "italian",
    "moods": ["italian", "seafood", "quick"],
    "ingredients": {
      "core": ["Pasta", "Shrimp", "Parsley"],
      "pantry": ["Butter", "Garlic", "Chicken stock", "Olive oil"]
    },
    "searchTerms": ["shrimp", "garlic", "butter", "pasta", "seafood", "scampi", "quick"]
  },
  {
    "name": "Tuna, Olive & Capers Rigatoni",
    "category": "italian",
    "moods": ["italian", "seafood", "quick"],
    "ingredients": {
      "core": ["Rigatoni", "Canned tuna", "Olives", "Capers (rinsed)"],
      "pantry": ["Passata", "Garlic", "Olive oil"]
    },
    "searchTerms": ["tuna", "pasta", "olives", "capers", "pantry", "mediterranean", "briny"]
  },
  {
    "name": "Sausage & Peppers with Orzo",
    "category": "italian",
    "moods": ["italian", "hearty"],
    "ingredients": {
      "core": ["Turkey sausage", "Bell peppers", "Onions", "Orzo", "Provolone"],
      "pantry": ["Olive oil", "Garlic", "Italian seasoning"]
    },
    "searchTerms": ["sausage", "peppers", "orzo", "italian", "sheet pan", "easy", "melty"]
  },
  {
    "name": "Pea & Parmesan Orzotto",
    "category": "italian",
    "moods": ["italian", "cozy", "quick"],
    "ingredients": {
      "core": ["Orzo", "Peas", "Parmesan"],
      "pantry": ["Chicken stock", "Butter", "Garlic"]
    },
    "searchTerms": ["orzo", "risotto", "peas", "parmesan", "creamy", "vegetarian", "comfort"]
  },
  {
    "name": "Chicken Parmesan (Baked)",
    "category": "italian",
    "moods": ["italian", "hearty"],
    "ingredients": {
      "core": ["Chicken breast", "Mozzarella", "Parmesan", "Spaghetti"],
      "pantry": ["Passata", "Breadcrumbs", "Flour", "Egg", "Olive oil", "Garlic", "Salt", "Pepper"]
    },
    "searchTerms": ["chicken parm", "parmesan", "baked", "italian american", "melty", "low acid sauce"]
  },
  {
    "name": "Cacio e Pepe (Parmesan)",
    "category": "italian",
    "moods": ["italian", "quick", "cozy"],
    "ingredients": {
      "core": ["Spaghetti", "Parmesan"],
      "pantry": ["Black pepper", "Butter", "Salt"]
    },
    "searchTerms": ["cacio e pepe", "cheesy", "pepper", "pasta", "classic", "no cream"]
  },
  {
    "name": "Pasta e Piselli (Pasta with Peas)",
    "category": "italian",
    "moods": ["italian", "cozy", "quick"],
    "ingredients": {
      "core": ["Small pasta (ditalini or shells)", "Peas", "Parmesan"],
      "pantry": ["Olive oil", "Garlic", "Chicken stock", "Salt", "Pepper"]
    },
    "searchTerms": ["peas", "pasta", "weeknight", "italian", "comfort", "low acid"]
  },
  {
    "name": "Chicken Teriyaki",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Chicken thighs", "Rice", "Broccoli or carrots or edamame"],
      "pantry": ["Soy sauce", "Mirin", "Sugar", "Garlic", "Ginger"]
    },
    "searchTerms": ["chicken", "teriyaki", "japanese", "asian", "rice", "sweet", "glazed"]
  },
  {
    "name": "Salmon Teriyaki",
    "category": "japanese",
    "moods": ["asian", "seafood", "quick"],
    "ingredients": {
      "core": ["Salmon", "Rice", "Asparagus or green beans"],
      "pantry": ["Soy sauce", "Mirin", "Sugar", "Sesame seeds"]
    },
    "searchTerms": ["salmon", "teriyaki", "japanese", "fish", "healthy", "glazed", "sesame"]
  },
  {
    "name": "Chicken Katsu Curry",
    "category": "japanese",
    "moods": ["asian", "hearty", "cozy"],
    "ingredients": {
      "core": ["Chicken breast", "Potatoes", "Carrots", "Japanese curry roux (mild)"],
      "pantry": ["Panko", "Flour", "Egg", "Oil for frying"]
    },
    "searchTerms": ["katsu", "curry", "japanese", "fried", "chicken", "comfort", "crispy"]
  },
  {
    "name": "Oyakodon (Chicken & Egg Rice Bowl)",
    "category": "japanese",
    "moods": ["asian", "cozy", "quick"],
    "ingredients": {
      "core": ["Chicken thighs", "Eggs", "Rice", "Scallions"],
      "pantry": ["Soy sauce", "Mirin", "Dashi or chicken stock", "Sugar"]
    },
    "searchTerms": ["oyakodon", "rice bowl", "chicken", "egg", "japanese", "comfort", "donburi"]
  },
  {
    "name": "Yaki Udon",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Udon noodles", "Chicken or shrimp", "Bell peppers", "Snap peas"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Sesame oil"]
    },
    "searchTerms": ["udon", "noodles", "stir fry", "japanese", "yakisoba", "quick", "veggie"]
  },
  {
    "name": "Gyudon (Beef & Onion Bowl)",
    "category": "japanese",
    "moods": ["asian", "cozy", "quick"],
    "ingredients": {
      "core": ["Beef (thin-sliced or ground)", "Onion", "Rice", "Scallions"],
      "pantry": ["Soy sauce", "Mirin", "Sugar", "Stock"]
    },
    "searchTerms": ["gyudon", "beef bowl", "japanese", "donburi", "comfort", "low acid"]
  },
  {
    "name": "Miso-Glazed Salmon",
    "category": "japanese",
    "moods": ["asian", "seafood", "quick"],
    "ingredients": {
      "core": ["Salmon", "Rice", "Asparagus or green beans"],
      "pantry": ["White miso", "Soy sauce", "Sugar", "Sesame seeds"]
    },
    "searchTerms": ["salmon", "miso", "glaze", "japanese", "seafood", "mild"]
  },
  {
    "name": "Yakitori-Style Chicken (Broiler)",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Chicken thighs", "Scallions", "Rice"],
      "pantry": ["Soy sauce", "Mirin", "Sugar"]
    },
    "searchTerms": ["yakitori", "skewers", "broiler", "japanese", "glaze", "weeknight"]
  },
  {
    "name": "Nikujaga (Soy-Potato Beef Stew)",
    "category": "japanese",
    "moods": ["asian", "cozy", "hearty"],
    "ingredients": {
      "core": ["Beef", "Potatoes", "Onion", "Carrot"],
      "pantry": ["Soy sauce", "Sugar", "Stock"]
    },
    "searchTerms": ["nikujaga", "japanese stew", "potato", "beef", "comfort", "low acid"]
  },
  {
    "name": "Chicken & Broccoli Stir-Fry",
    "category": "chinese",
    "moods": ["asian", "quick", "fresh"],
    "ingredients": {
      "core": ["Chicken breast", "Broccoli", "Rice"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Cornstarch", "Sesame oil"]
    },
    "searchTerms": ["chicken", "broccoli", "stir fry", "chinese", "takeout", "healthy", "quick"]
  },
  {
    "name": "Shrimp Fried Rice",
    "category": "chinese",
    "moods": ["asian", "seafood", "quick"],
    "ingredients": {
      "core": ["Shrimp", "Rice (day-old best)", "Peas", "Eggs", "Scallions"],
      "pantry": ["Soy sauce", "Sesame oil", "Garlic"]
    },
    "searchTerms": ["fried rice", "shrimp", "chinese", "leftover rice", "quick", "wok", "eggs"]
  },
  {
    "name": "Chicken Lo Mein",
    "category": "chinese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Lo mein noodles", "Chicken breast", "Bell peppers", "Snap peas"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Sesame oil"]
    },
    "searchTerms": ["lo mein", "noodles", "chicken", "chinese", "takeout", "stir fry", "veggie"]
  },
  {
    "name": "Egg Drop Soup",
    "category": "chinese",
    "moods": ["asian", "cozy", "quick"],
    "ingredients": {
      "core": ["Eggs", "Scallions"],
      "pantry": ["Chicken stock", "Cornstarch", "Soy sauce", "Sesame oil"]
    },
    "searchTerms": ["egg drop", "soup", "chinese", "broth", "light", "comfort", "easy"]
  },
  {
    "name": "Beef & Broccoli",
    "category": "chinese",
    "moods": ["asian", "hearty", "quick"],
    "ingredients": {
      "core": ["Beef", "Broccoli", "Rice"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Cornstarch", "Sesame oil"]
    },
    "searchTerms": ["beef", "broccoli", "stir fry", "takeout", "classic", "no vinegar"]
  },
  {
    "name": "Mongolian Beef",
    "category": "chinese",
    "moods": ["asian", "hearty", "quick"],
    "ingredients": {
      "core": ["Beef", "Scallions", "Rice"],
      "pantry": ["Soy sauce", "Brown sugar", "Garlic", "Cornstarch", "Sesame oil"]
    },
    "searchTerms": ["mongolian beef", "takeout", "sweet savory", "green onion", "classic"]
  },
  {
    "name": "Sesame Chicken (Mild, No Vinegar)",
    "category": "chinese",
    "moods": ["asian", "hearty"],
    "ingredients": {
      "core": ["Chicken", "Rice"],
      "pantry": ["Soy sauce", "Sugar", "Garlic", "Ginger", "Cornstarch", "Sesame seeds", "Oil"]
    },
    "searchTerms": ["sesame chicken", "takeout", "classic", "no vinegar", "sweet", "crisp"]
  },
  {
    "name": "Chicken & Snow Peas Stir-Fry",
    "category": "chinese",
    "moods": ["asian", "quick", "fresh"],
    "ingredients": {
      "core": ["Chicken breast", "Snow peas", "Rice"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Cornstarch", "Sesame oil"]
    },
    "searchTerms": ["stir fry", "snow peas", "chicken", "chinese", "takeout", "quick"]
  },
  {
    "name": "Turkey Taco Rice Bowl",
    "category": "texmex",
    "moods": ["hearty", "quick"],
    "ingredients": {
      "core": ["Ground turkey", "Rice", "Black or pinto beans", "Bell peppers", "Onions"],
      "pantry": ["Mild salsa", "Cumin", "Chili powder", "Garlic", "Guacamole (optional)"]
    },
    "searchTerms": ["taco", "bowl", "turkey", "rice", "mexican", "beans", "tex mex"]
  },
  {
    "name": "Chicken Quesadillas",
    "category": "texmex",
    "moods": ["quick", "hearty"],
    "ingredients": {
      "core": ["Chicken", "Gouda or provolone", "Onions", "Tortillas"],
      "pantry": ["Mild salsa", "Oil for cooking"]
    },
    "searchTerms": ["quesadilla", "chicken", "cheese", "mexican", "melty", "tortilla", "quick"]
  },
  {
    "name": "Chicken Fajitas",
    "category": "texmex",
    "moods": ["hearty", "fresh"],
    "ingredients": {
      "core": ["Chicken thighs", "Bell peppers", "Onions", "Tortillas"],
      "pantry": ["Garlic", "Cumin", "Chili powder", "Oil"]
    },
    "searchTerms": ["fajitas", "chicken", "peppers", "mexican", "sizzling", "tortilla", "skillet"]
  },
  {
    "name": "Turkey Chili with Beans",
    "category": "texmex",
    "moods": ["hearty", "cozy"],
    "ingredients": {
      "core": ["Ground turkey", "Beans (kidney, black, pinto)", "Tomatoes", "Onions"],
      "pantry": ["Chili powder", "Cumin", "Garlic", "Chicken stock"]
    },
    "searchTerms": ["chili", "turkey", "beans", "stew", "comfort", "warm", "spicy mild"]
  },
  {
    "name": "Chicken Soft Tacos (Skillet, Mild)",
    "category": "texmex",
    "moods": ["hearty", "quick", "fresh"],
    "ingredients": {
      "core": ["Chicken thighs", "Tortillas", "Onions", "Bell peppers"],
      "pantry": ["Cumin", "Chili powder", "Garlic", "Oil", "Salt"]
    },
    "searchTerms": ["tacos", "chicken", "skillet", "tex mex", "cilantro-free", "no lime"]
  },
  {
    "name": "Refried Bean & Cheese Quesadillas",
    "category": "texmex",
    "moods": ["quick", "hearty"],
    "ingredients": {
      "core": ["Refried beans", "Provolone or mozzarella", "Tortillas"],
      "pantry": ["Onion", "Oil", "Mild salsa"]
    },
    "searchTerms": ["quesadilla", "beans", "cheese", "tex mex", "vegetarian", "quick"]
  },
  {
    "name": "Turkey Enchilada Skillet",
    "category": "texmex",
    "moods": ["hearty", "cozy"],
    "ingredients": {
      "core": ["Ground turkey", "Tortillas", "Black beans", "Cheese"],
      "pantry": ["Passata or low-acid enchilada sauce", "Cumin", "Chili powder", "Garlic"]
    },
    "searchTerms": ["enchilada", "skillet", "tex mex", "easy", "weeknight", "no vinegar"]
  },
  {
    "name": "Pan-Seared Whitefish with Asparagus",
    "category": "seafood",
    "moods": ["seafood", "fresh", "quick"],
    "ingredients": {
      "core": ["White fish (cod, halibut)", "Asparagus", "Rice"],
      "pantry": ["Soy sauce", "Butter", "Lemon zest", "Olive oil"]
    },
    "searchTerms": ["fish", "whitefish", "cod", "halibut", "asparagus", "healthy", "light"]
  },
  {
    "name": "Salmon with Smashed Potatoes",
    "category": "seafood",
    "moods": ["seafood", "hearty"],
    "ingredients": {
      "core": ["Salmon", "Small potatoes", "Green beans or asparagus"],
      "pantry": ["Soy sauce", "Butter", "Olive oil", "Garlic"]
    },
    "searchTerms": ["salmon", "potatoes", "fish", "hearty", "crispy", "smashed", "dinner"]
  },
  {
    "name": "Linguine with Clams",
    "category": "seafood",
    "moods": ["seafood", "italian", "fresh"],
    "ingredients": {
      "core": ["Linguine", "Clams", "Parsley"],
      "pantry": ["Chicken stock", "Garlic", "Olive oil", "Chili flakes (light)"]
    },
    "searchTerms": ["clams", "linguine", "pasta", "seafood", "italian", "white sauce", "briny"]
  },
  {
    "name": "Mussels in Tomato-Garlic Broth",
    "category": "seafood",
    "moods": ["seafood", "cozy"],
    "ingredients": {
      "core": ["Mussels", "Crusty bread (rye or sourdough)"],
      "pantry": ["Passata", "Chicken stock", "Garlic", "Butter"]
    },
    "searchTerms": ["mussels", "seafood", "tomato", "broth", "bread", "dipping", "shellfish"]
  },
  {
    "name": "Crab Cakes",
    "category": "seafood",
    "moods": ["seafood", "hearty"],
    "ingredients": {
      "core": ["Crab meat", "Dill"],
      "pantry": ["Mayo", "Egg", "Breadcrumbs", "Mustard", "Oil for pan-frying"]
    },
    "searchTerms": ["crab", "cakes", "seafood", "fried", "dill", "appetizer", "maryland"]
  },
  {
    "name": "Baked Cod Oreganata",
    "category": "seafood",
    "moods": ["seafood", "italian", "fresh"],
    "ingredients": {
      "core": ["Cod", "Breadcrumbs", "Parsley"],
      "pantry": ["Olive oil", "Garlic", "Lemon zest", "Salt", "Pepper"]
    },
    "searchTerms": ["cod", "oreganata", "italian", "baked", "classic", "zest only"]
  },
  {
    "name": "Salmon with Dill Mayo",
    "category": "seafood",
    "moods": ["seafood", "fresh", "quick"],
    "ingredients": {
      "core": ["Salmon", "Dill"],
      "pantry": ["Mayonnaise", "Salt", "Pepper", "Lemon zest"]
    },
    "searchTerms": ["salmon", "dill", "mayo", "baked", "quick", "no citrus"]
  },
  {
    "name": "Crab Linguine (Zest, Not Juicy)",
    "category": "seafood",
    "moods": ["seafood", "italian", "quick"],
    "ingredients": {
      "core": ["Linguine", "Crab meat", "Parsley"],
      "pantry": ["Olive oil", "Garlic", "Butter", "Lemon zest"]
    },
    "searchTerms": ["crab pasta", "linguine", "seafood", "italian", "classic", "zest only"]
  },
  {
    "name": "Chicken Noodle Soup",
    "category": "soup",
    "moods": ["cozy", "quick"],
    "ingredients": {
      "core": ["Chicken", "Egg noodles", "Carrots", "Celery", "Onions"],
      "pantry": ["Chicken stock", "Dill or parsley"]
    },
    "searchTerms": ["soup", "chicken", "noodle", "comfort", "sick", "classic", "warm"]
  },
  {
    "name": "Chicken Tortilla Soup",
    "category": "soup",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Chicken", "Tortilla strips", "Tomatoes"],
      "pantry": ["Chicken stock", "Cumin", "Chili powder", "Garlic"]
    },
    "searchTerms": ["soup", "tortilla", "chicken", "mexican", "crispy", "warm", "tex mex"]
  },
  {
    "name": "Split Pea Soup with Turkey",
    "category": "soup",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Split peas", "Turkey (leftover or ground)", "Carrots", "Onions"],
      "pantry": ["Turkey or chicken stock", "Bay leaf"]
    },
    "searchTerms": ["split pea", "soup", "turkey", "hearty", "thick", "comfort", "winter"]
  },
  {
    "name": "Bean & Kale Minestrone",
    "category": "soup",
    "moods": ["cozy", "fresh"],
    "ingredients": {
      "core": ["Cannellini beans", "Kale", "Barley", "Parmesan rind"],
      "pantry": ["Vegetable or chicken stock", "Tomatoes", "Olive oil", "Garlic"]
    },
    "searchTerms": ["minestrone", "soup", "beans", "kale", "italian", "vegetable", "healthy"]
  },
  {
    "name": "Chicken Congee",
    "category": "soup",
    "moods": ["asian", "cozy"],
    "ingredients": {
      "core": ["Rice", "Chicken", "Scallions"],
      "pantry": ["Chicken stock", "Ginger", "Soy sauce", "Sesame oil"]
    },
    "searchTerms": ["congee", "porridge", "rice", "chicken", "asian", "comfort", "sick"]
  },
  {
    "name": "Italian Wedding Soup",
    "category": "soup",
    "moods": ["cozy", "italian"],
    "ingredients": {
      "core": ["Turkey meatballs", "Orzo", "Spinach"],
      "pantry": ["Chicken stock", "Parmesan rind", "Garlic", "Olive oil", "Salt", "Pepper"]
    },
    "searchTerms": ["soup", "italian", "meatballs", "greens", "classic", "comfort"]
  },
  {
    "name": "White Bean & Turkey Sausage Soup",
    "category": "soup",
    "moods": ["cozy", "hearty", "italian"],
    "ingredients": {
      "core": ["Turkey sausage", "Cannellini beans", "Kale or spinach"],
      "pantry": ["Chicken stock", "Garlic", "Olive oil"]
    },
    "searchTerms": ["white bean soup", "sausage", "italian", "hearty", "greens"]
  },
  {
    "name": "Chicken & Rice Soup",
    "category": "soup",
    "moods": ["cozy", "quick"],
    "ingredients": {
      "core": ["Chicken", "Rice", "Carrots", "Celery", "Onions"],
      "pantry": ["Chicken stock", "Dill or parsley"]
    },
    "searchTerms": ["soup", "chicken", "rice", "comfort", "classic", "quick"]
  },
  {
    "name": "Tuna Melt on Rye",
    "category": "sandwich",
    "moods": ["quick", "hearty"],
    "ingredients": {
      "core": ["Canned tuna", "Rye bread", "Provolone or gouda"],
      "pantry": ["Mayo", "Dill", "Lemon zest"]
    },
    "searchTerms": ["tuna", "melt", "sandwich", "rye", "cheese", "deli", "lunch", "toast", "bread", "grilled"]
  },
  {
    "name": "Turkey Avocado Club",
    "category": "sandwich",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["Turkey", "Avocado", "Lettuce", "Tomato", "Bread (rye or sourdough)"],
      "pantry": ["Mayo"]
    },
    "searchTerms": ["club", "sandwich", "turkey", "avocado", "fresh", "lunch", "deli"]
  },
  {
    "name": "Cheesesteak-Style Skillet",
    "category": "sandwich",
    "moods": ["hearty", "quick"],
    "ingredients": {
      "core": ["Lean ground beef", "Onions", "Bell peppers", "Provolone", "Roll or rice"],
      "pantry": ["Oil", "Salt", "Pepper"]
    },
    "searchTerms": ["cheesesteak", "philly", "beef", "peppers", "melty", "sandwich", "skillet"]
  },
  {
    "name": "Chicken Parm Sandwich (Baked)",
    "category": "sandwich",
    "moods": ["hearty", "italian"],
    "ingredients": {
      "core": ["Breaded chicken", "Mozzarella", "Sub roll"],
      "pantry": ["Passata", "Parmesan", "Olive oil", "Garlic"]
    },
    "searchTerms": ["chicken parm", "sub", "melty", "italian american", "classic"]
  },
  {
    "name": "Turkey & Provolone Panini",
    "category": "sandwich",
    "moods": ["quick", "fresh"],
    "ingredients": {
      "core": ["Turkey", "Provolone", "Sourdough or rye"],
      "pantry": ["Mayonnaise", "Mustard", "Butter"]
    },
    "searchTerms": ["turkey sandwich", "panini", "deli", "classic", "mayo", "mustard"]
  },
  {
    "name": "Salmon Salad on Rye",
    "category": "sandwich",
    "moods": ["fresh", "quick", "seafood"],
    "ingredients": {
      "core": ["Canned salmon", "Rye bread", "Dill"],
      "pantry": ["Mayonnaise", "Capers (rinsed)", "Lemon zest", "Black pepper"]
    },
    "searchTerms": ["salmon salad", "rye", "deli", "lunch", "classic"]
  },
  {
    "name": "Seared Zucchini with Butter-Soy",
    "category": "side",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["Zucchini"],
      "pantry": ["Butter", "Soy sauce", "Salt"]
    },
    "searchTerms": ["zucchini", "side", "vegetable", "quick", "seared", "butter"]
  },
  {
    "name": "Garlicky Green Beans",
    "category": "side",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["Green beans", "Parmesan"],
      "pantry": ["Garlic", "Butter", "Olive oil"]
    },
    "searchTerms": ["green beans", "side", "vegetable", "garlic", "quick", "parmesan"]
  },
  {
    "name": "Roasted Carrots & Onions",
    "category": "side",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Carrots", "Onions"],
      "pantry": ["Olive oil", "Salt", "Pepper"]
    },
    "searchTerms": ["carrots", "onions", "roasted", "side", "sweet", "caramelized"]
  },
  {
    "name": "Burst Cherry Tomatoes",
    "category": "side",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["Cherry tomatoes"],
      "pantry": ["Olive oil", "Garlic", "Salt"]
    },
    "searchTerms": ["tomatoes", "cherry", "burst", "side", "sauce", "quick", "garlic"]
  },
  {
    "name": "Corn on the Cob with Butter & Salt",
    "category": "side",
    "moods": ["fresh", "cozy"],
    "ingredients": {
      "core": ["Corn on the cob"],
      "pantry": ["Butter", "Salt"]
    },
    "searchTerms": ["corn", "side", "summer", "classic", "butter"]
  },
  {
    "name": "Olive Oil–Stock Mashed Potatoes",
    "category": "side",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Potatoes"],
      "pantry": ["Olive oil", "Chicken stock", "Salt", "Pepper"]
    },
    "searchTerms": ["mashed potatoes", "no cream", "olive oil", "comfort", "classic"]
  }
];




    // ===== NUTRITION DATA =====
    


const nutritionEstimates = {
            // Breakfast meals with real data from meals.json
            "Greek Yogurt Parfait with Berries & Muesli": { protein: 25, carbs: 68, fat: 10, calories: 462 },
            "Oatmeal with Banana & PB": { protein: 10, carbs: 58, fat: 11, calories: 371 },
            "Scrambled Eggs on Buttered Rye": { protein: 24, carbs: 30, fat: 28, calories: 472 },
            "Spinach & Mozzarella Omelet": { protein: 25, carbs: 1, fat: 32, calories: 392 },
            "Bagel with Lox & Cream Cheese": { protein: 29, carbs: 56, fat: 20, calories: 520 },
            "Breakfast Burrito": { protein: 29, carbs: 66, fat: 21, calories: 577 },
            "Avocado Toast with Egg": { protein: 14, carbs: 36, fat: 33, calories: 497 },
            "Savory Oats with Egg": { protein: 13, carbs: 27, fat: 9, calories: 241 },
            "Rye Toast with Burrata & Warm Tomatoes": { protein: 14, carbs: 37, fat: 25, calories: 429 },
            "Fruit & Nuts Plate": { protein: 7, carbs: 54, fat: 15, calories: 379 },
            "Egg & Cheese Bagel": { protein: 29, carbs: 55, fat: 29, calories: 601 },
            "Turkey Sausage, Egg & Cheese on Rye": { protein: 33, carbs: 33, fat: 34, calories: 578 },
            "Lox, Eggs & Onions Scramble": { protein: 35, carbs: 0, fat: 34, calories: 450 },

            // Italian meals (estimated based on category)
            "Spaghetti with Turkey Bolognese": { protein: 28, carbs: 72, fat: 14, calories: 526 },
            "Turkey Meatballs in Marinara": { protein: 32, carbs: 45, fat: 18, calories: 470 },
            "Shrimp Garlic-Butter Pasta": { protein: 28, carbs: 65, fat: 22, calories: 578 },
            "Tuna, Olive & Capers Rigatoni": { protein: 30, carbs: 68, fat: 16, calories: 536 },
            "Sausage & Peppers with Orzo": { protein: 26, carbs: 58, fat: 24, calories: 552 },
            "Pea & Parmesan Orzotto": { protein: 18, carbs: 62, fat: 18, calories: 482 },
            "Chicken Parmesan (Baked)": { protein: 42, carbs: 55, fat: 22, calories: 590 },
            "Cacio e Pepe (Parmesan)": { protein: 20, carbs: 70, fat: 20, calories: 540 },
            "Pasta e Piselli (Pasta with Peas)": { protein: 15, carbs: 58, fat: 12, calories: 400 },

            // Japanese meals (estimated)
            "Chicken Teriyaki": { protein: 35, carbs: 65, fat: 12, calories: 508 },
            "Salmon Teriyaki": { protein: 38, carbs: 55, fat: 18, calories: 534 },
            "Chicken Katsu Curry": { protein: 32, carbs: 68, fat: 20, calories: 580 },
            "Oyakodon (Chicken & Egg Rice Bowl)": { protein: 30, carbs: 60, fat: 14, calories: 486 },
            "Yaki Udon": { protein: 28, carbs: 55, fat: 16, calories: 476 },
            "Gyudon (Beef & Onion Bowl)": { protein: 32, carbs: 58, fat: 18, calories: 522 },
            "Miso-Glazed Salmon": { protein: 36, carbs: 50, fat: 16, calories: 488 },
            "Yakitori-Style Chicken (Broiler)": { protein: 30, carbs: 52, fat: 12, calories: 436 },
            "Nikujaga (Soy-Potato Beef Stew)": { protein: 28, carbs: 45, fat: 20, calories: 472 },

            // Chinese meals (estimated)
            "Chicken & Broccoli Stir-Fry": { protein: 32, carbs: 58, fat: 14, calories: 486 },
            "Shrimp Fried Rice": { protein: 28, carbs: 62, fat: 18, calories: 522 },
            "Chicken Lo Mein": { protein: 30, carbs: 65, fat: 16, calories: 524 },
            "Egg Drop Soup": { protein: 12, carbs: 18, fat: 8, calories: 192 },
            "Beef & Broccoli": { protein: 35, carbs: 55, fat: 20, calories: 540 },
            "Mongolian Beef": { protein: 32, carbs: 60, fat: 22, calories: 574 },
            "Sesame Chicken (Mild, No Vinegar)": { protein: 30, carbs: 68, fat: 24, calories: 608 },
            "Chicken & Snow Peas Stir-Fry": { protein: 30, carbs: 56, fat: 12, calories: 456 },

            // Tex-Mex meals (estimated)
            "Turkey Taco Rice Bowl": { protein: 32, carbs: 52, fat: 18, calories: 502 },
            "Chicken Quesadillas": { protein: 32, carbs: 42, fat: 26, calories: 534 },
            "Chicken Fajitas": { protein: 30, carbs: 38, fat: 20, calories: 452 },
            "Turkey Chili with Beans": { protein: 28, carbs: 45, fat: 12, calories: 408 },
            "Chicken Soft Tacos (Skillet, Mild)": { protein: 28, carbs: 40, fat: 22, calories: 478 },
            "Refried Bean & Cheese Quesadillas": { protein: 20, carbs: 48, fat: 24, calories: 488 },
            "Turkey Enchilada Skillet": { protein: 30, carbs: 50, fat: 20, calories: 500 },

            // Seafood meals (estimated)
            "Pan-Seared Whitefish with Asparagus": { protein: 35, carbs: 45, fat: 12, calories: 428 },
            "Salmon with Smashed Potatoes": { protein: 38, carbs: 42, fat: 20, calories: 500 },
            "Linguine with Clams": { protein: 25, carbs: 68, fat: 14, calories: 498 },
            "Mussels in Tomato-Garlic Broth": { protein: 28, carbs: 35, fat: 12, calories: 368 },
            "Crab Cakes": { protein: 22, carbs: 20, fat: 18, calories: 338 },
            "Baked Cod Oreganata": { protein: 32, carbs: 25, fat: 10, calories: 318 },
            "Salmon with Dill Mayo": { protein: 36, carbs: 8, fat: 24, calories: 400 },
            "Crab Linguine (Zest, Not Juicy)": { protein: 24, carbs: 65, fat: 16, calories: 500 },

            // Soups (estimated)
            "Chicken Noodle Soup": { protein: 20, carbs: 32, fat: 8, calories: 280 },
            "Chicken Tortilla Soup": { protein: 22, carbs: 35, fat: 12, calories: 336 },
            "Split Pea Soup with Turkey": { protein: 24, carbs: 42, fat: 6, calories: 322 },
            "Bean & Kale Minestrone": { protein: 12, carbs: 48, fat: 8, calories: 312 },
            "Chicken Congee": { protein: 18, carbs: 45, fat: 6, calories: 306 },
            "Italian Wedding Soup": { protein: 20, carbs: 30, fat: 10, calories: 290 },
            "White Bean & Turkey Sausage Soup": { protein: 22, carbs: 35, fat: 12, calories: 336 },
            "Chicken & Rice Soup": { protein: 18, carbs: 38, fat: 8, calories: 296 },

            // Sandwiches (estimated)
            "Tuna Melt on Rye": { protein: 28, carbs: 42, fat: 22, calories: 482 },
            "Turkey Avocado Club": { protein: 24, carbs: 38, fat: 20, calories: 432 },
            "Cheesesteak-Style Skillet": { protein: 30, carbs: 45, fat: 24, calories: 516 },
            "Chicken Parm Sandwich (Baked)": { protein: 35, carbs: 48, fat: 20, calories: 512 },
            "Turkey & Provolone Panini": { protein: 22, carbs: 40, fat: 18, calories: 414 },
            "Salmon Salad on Rye": { protein: 20, carbs: 35, fat: 16, calories: 368 },

            // Sides (estimated)
            "Seared Zucchini with Butter-Soy": { protein: 2, carbs: 8, fat: 6, calories: 94 },
            "Garlicky Green Beans": { protein: 4, carbs: 12, fat: 8, calories: 136 },
            "Roasted Carrots & Onions": { protein: 2, carbs: 20, fat: 7, calories: 151 },
            "Burst Cherry Tomatoes": { protein: 2, carbs: 10, fat: 7, calories: 111 },
            "Corn on the Cob with Butter & Salt": { protein: 3, carbs: 27, fat: 8, calories: 192 },
            "Olive Oil–Stock Mashed Potatoes": { protein: 4, carbs: 35, fat: 10, calories: 246 },
            "Edamame with Sea Salt": { protein: 12, carbs: 14, fat: 5, calories: 149 },
            "Garlic Bread (Rye or Sourdough)": { protein: 6, carbs: 32, fat: 12, calories: 260 }
        };





    // ===== MAIN APPLICATION =====
    




let meals = [];
let fuse;
let currentMood = null;


function loadMeals() {
    console.log('Loading meals...');

    if (typeof embeddedMeals !== 'undefined' && embeddedMeals) {
        meals = embeddedMeals;
    }

    window.meals = meals;
    console.log('Loaded', meals.length, 'meals');

    initFuzzySearch();
    setupEventListeners();
}


function initFuzzySearch() {
    if (typeof Fuse !== 'undefined' && meals.length > 0) {
        fuse = new Fuse(meals, {
            keys: ['name', 'searchTerms', 'moods', 'ingredients.core'],
            threshold: 0.4
        });
    }
}


function setupEventListeners() {
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('btn-primary'));
            btn.classList.add('btn-primary');

            currentMood = btn.dataset.mood;
            showMealSuggestions(currentMood);
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query) {
                searchMeals(query);
            } else if (currentMood) {
                showMealSuggestions(currentMood);
            }
        });
    }
}


function showMealSuggestions(mood) {
    const moodMeals = meals.filter(m => m.moods.includes(mood));
    displayMeals(moodMeals);
    document.getElementById('suggestionsArea').classList.remove('hidden');
}


function searchMeals(query) {
    const results = fuse.search(query).map(r => r.item);
    displayMeals(results);
}


function displayMeals(mealList) {
    const container = document.getElementById('mealSuggestions');
    container.innerHTML = '';

    if (mealList.length === 0) {
        container.innerHTML = '<p class="text-base-content/60">No meals found.</p>';
        return;
    }

    mealList.forEach(meal => {
        const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
        const mealCard = document.createElement('div');
        mealCard.className = 'card bg-base-100 p-4 hover:bg-base-200 transition-colors';

        // Build ingredients list
        const coreIngredients = meal.ingredients.core.join(', ');

        mealCard.innerHTML = `
            <h4 class="font-semibold text-lg">${meal.name}</h4>
            <p class="text-xs text-base-content/60 mt-1">
                ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat • ${nutrition.calories} cal
            </p>
            <p class="text-sm text-base-content/80 mt-2">
                <span class="font-medium">Main ingredients:</span> ${coreIngredients}
            </p>
            <div class="mt-2">
                ${meal.moods.map(mood => {
                    const moodEmoji = {
                        'cozy': '🔥',
                        'fresh': '🥗',
                        'hearty': '💪',
                        'quick': '⚡',
                        'asian': '🥢',
                        'italian': '🍝',
                        'seafood': '🐟',
                        'breakfast': '🌅'
                    };
                    return `<span class="badge badge-sm mr-1">${moodEmoji[mood] || ''} ${mood}</span>`;
                }).join('')}
            </div>
        `;

        container.appendChild(mealCard);
    });
}


function initializeApp() {
    loadMeals();
}


window.initializeApp = initializeApp;
window.loadMeals = loadMeals;




    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing MoodEats Browse...');
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
        });
    } else {
        console.log('Initializing MoodEats Browse (DOM ready)...');
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
})();
