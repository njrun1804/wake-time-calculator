// MoodEats Compact Grid Version
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
      "core": ["Assorted fruits", "Mixed nuts"],
      "pantry": ["Honey (optional)"]
    },
    "searchTerms": ["fruit", "nuts", "healthy", "light", "fresh", "simple", "raw"]
  },
  {
    "name": "Egg & Cheese Bagel",
    "category": "breakfast",
    "moods": ["breakfast", "quick", "hearty"],
    "ingredients": {
      "core": ["Bagel", "Eggs", "American cheese"],
      "pantry": ["Butter", "Salt", "Pepper"]
    },
    "searchTerms": ["bagel", "egg", "cheese", "sandwich", "deli", "classic", "bodega"]
  },
  {
    "name": "Turkey Sausage, Egg & Cheese on Rye",
    "category": "breakfast",
    "moods": ["breakfast", "hearty"],
    "ingredients": {
      "core": ["Turkey sausage", "Eggs", "Cheese", "Rye bread"],
      "pantry": ["Butter"]
    },
    "searchTerms": ["breakfast sandwich", "sausage", "egg", "cheese", "rye", "hearty", "protein"]
  },
  {
    "name": "Lox, Eggs & Onions Scramble",
    "category": "breakfast",
    "moods": ["breakfast", "cozy"],
    "ingredients": {
      "core": ["Eggs", "Lox", "Onions"],
      "pantry": ["Butter", "Black pepper", "Dill (optional)"]
    },
    "searchTerms": ["lox", "eggs", "onions", "scramble", "jewish", "classic", "savory"]
  },
  {
    "name": "Spaghetti with Turkey Bolognese",
    "category": "italian",
    "moods": ["italian", "cozy", "hearty"],
    "ingredients": {
      "core": ["Spaghetti", "Ground turkey", "Passata"],
      "pantry": ["Garlic", "Onions", "Olive oil", "Parmesan", "Salt", "Pepper"]
    },
    "searchTerms": ["spaghetti", "bolognese", "turkey", "meat sauce", "italian", "pasta", "red sauce"]
  },
  {
    "name": "Turkey Meatballs in Marinara",
    "category": "italian",
    "moods": ["italian", "cozy", "hearty"],
    "ingredients": {
      "core": ["Ground turkey", "Breadcrumbs", "Egg", "Passata"],
      "pantry": ["Garlic", "Parmesan", "Olive oil", "Salt", "Pepper"]
    },
    "searchTerms": ["meatballs", "turkey", "marinara", "italian", "comfort", "classic"]
  },
  {
    "name": "Shrimp Garlic-Butter Pasta",
    "category": "italian",
    "moods": ["italian", "seafood", "quick"],
    "ingredients": {
      "core": ["Shrimp", "Pasta", "Butter"],
      "pantry": ["Garlic", "Lemon zest", "Parmesan", "Red pepper flakes (optional)"]
    },
    "searchTerms": ["shrimp", "scampi", "garlic", "butter", "pasta", "seafood", "quick"]
  },
  {
    "name": "Tuna, Olive & Capers Rigatoni",
    "category": "italian",
    "moods": ["italian", "seafood", "quick"],
    "ingredients": {
      "core": ["Canned tuna", "Rigatoni", "Olives", "Capers"],
      "pantry": ["Garlic", "Olive oil", "Lemon zest"]
    },
    "searchTerms": ["tuna", "pasta", "olives", "capers", "mediterranean", "pantry", "quick"]
  },
  {
    "name": "Sausage & Peppers with Orzo",
    "category": "italian",
    "moods": ["italian", "hearty", "cozy"],
    "ingredients": {
      "core": ["Italian sausage", "Bell peppers", "Orzo"],
      "pantry": ["Garlic", "Olive oil", "Chicken stock", "Parmesan"]
    },
    "searchTerms": ["sausage", "peppers", "orzo", "italian american", "classic", "hearty"]
  },
  {
    "name": "Pea & Parmesan Orzotto",
    "category": "italian",
    "moods": ["italian", "fresh"],
    "ingredients": {
      "core": ["Orzo", "Peas", "Parmesan"],
      "pantry": ["Chicken stock", "Butter", "Garlic", "Salt", "Pepper"]
    },
    "searchTerms": ["orzo", "peas", "risotto", "creamy", "vegetarian", "light"]
  },
  {
    "name": "Chicken Parmesan (Baked)",
    "category": "italian",
    "moods": ["italian", "hearty"],
    "ingredients": {
      "core": ["Breaded chicken", "Mozzarella", "Passata"],
      "pantry": ["Parmesan", "Olive oil", "Garlic"]
    },
    "searchTerms": ["chicken parm", "italian american", "melty", "classic", "breaded"]
  },
  {
    "name": "Cacio e Pepe (Parmesan)",
    "category": "italian",
    "moods": ["italian", "quick"],
    "ingredients": {
      "core": ["Pasta", "Parmesan"],
      "pantry": ["Black pepper", "Butter", "Salt"]
    },
    "searchTerms": ["cacio e pepe", "cheese", "pepper", "simple", "roman", "classic"]
  },
  {
    "name": "Pasta e Piselli (Pasta with Peas)",
    "category": "italian",
    "moods": ["italian", "quick", "fresh"],
    "ingredients": {
      "core": ["Small pasta", "Peas"],
      "pantry": ["Garlic", "Olive oil", "Parmesan", "Salt", "Pepper"]
    },
    "searchTerms": ["pasta", "peas", "simple", "quick", "light", "green"]
  },
  {
    "name": "Chicken Teriyaki",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Chicken thighs", "Rice"],
      "pantry": ["Soy sauce", "Sugar", "Mirin or honey", "Garlic", "Ginger"]
    },
    "searchTerms": ["teriyaki", "chicken", "japanese", "sweet", "savory", "rice", "glazed"]
  },
  {
    "name": "Salmon Teriyaki",
    "category": "japanese",
    "moods": ["asian", "seafood", "quick"],
    "ingredients": {
      "core": ["Salmon", "Rice"],
      "pantry": ["Soy sauce", "Sugar", "Mirin or honey", "Garlic", "Ginger"]
    },
    "searchTerms": ["teriyaki", "salmon", "japanese", "glazed", "seafood", "rice"]
  },
  {
    "name": "Chicken Katsu Curry",
    "category": "japanese",
    "moods": ["asian", "hearty", "cozy"],
    "ingredients": {
      "core": ["Breaded chicken", "Rice", "Curry roux or powder"],
      "pantry": ["Onions", "Carrots", "Potatoes", "Oil"]
    },
    "searchTerms": ["katsu", "curry", "japanese", "breaded", "comfort", "rice"]
  },
  {
    "name": "Oyakodon (Chicken & Egg Rice Bowl)",
    "category": "japanese",
    "moods": ["asian", "cozy", "quick"],
    "ingredients": {
      "core": ["Chicken", "Eggs", "Rice", "Onions"],
      "pantry": ["Soy sauce", "Sugar", "Dashi or chicken stock"]
    },
    "searchTerms": ["oyakodon", "rice bowl", "chicken", "egg", "comfort", "donburi"]
  },
  {
    "name": "Yaki Udon",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Udon noodles", "Protein (chicken/shrimp)", "Cabbage"],
      "pantry": ["Soy sauce", "Oyster sauce", "Garlic", "Oil"]
    },
    "searchTerms": ["yaki udon", "stir fry", "noodles", "japanese", "quick", "cabbage"]
  },
  {
    "name": "Gyudon (Beef & Onion Bowl)",
    "category": "japanese",
    "moods": ["asian", "hearty", "quick"],
    "ingredients": {
      "core": ["Sliced beef", "Onions", "Rice"],
      "pantry": ["Soy sauce", "Sugar", "Dashi or beef stock", "Ginger"]
    },
    "searchTerms": ["gyudon", "beef bowl", "rice", "onions", "japanese", "comfort"]
  },
  {
    "name": "Miso-Glazed Salmon",
    "category": "japanese",
    "moods": ["asian", "seafood"],
    "ingredients": {
      "core": ["Salmon", "Miso paste", "Rice"],
      "pantry": ["Sugar", "Sake or mirin", "Sesame oil"]
    },
    "searchTerms": ["miso", "salmon", "glazed", "japanese", "umami", "seafood"]
  },
  {
    "name": "Yakitori-Style Chicken (Broiler)",
    "category": "japanese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Chicken thighs", "Rice"],
      "pantry": ["Soy sauce", "Sugar", "Sake or mirin", "Garlic", "Ginger"]
    },
    "searchTerms": ["yakitori", "grilled", "chicken", "japanese", "skewers", "broiled"]
  },
  {
    "name": "Nikujaga (Soy-Potato Beef Stew)",
    "category": "japanese",
    "moods": ["asian", "cozy", "hearty"],
    "ingredients": {
      "core": ["Beef", "Potatoes", "Onions"],
      "pantry": ["Soy sauce", "Sugar", "Dashi or beef stock", "Sake or mirin"]
    },
    "searchTerms": ["nikujaga", "stew", "beef", "potato", "japanese", "comfort", "home cooking"]
  },
  {
    "name": "Chicken & Broccoli Stir-Fry",
    "category": "chinese",
    "moods": ["asian", "quick", "fresh"],
    "ingredients": {
      "core": ["Chicken", "Broccoli", "Rice"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Oyster sauce", "Oil"]
    },
    "searchTerms": ["stir fry", "chicken", "broccoli", "chinese", "quick", "healthy", "wok"]
  },
  {
    "name": "Shrimp Fried Rice",
    "category": "chinese",
    "moods": ["asian", "seafood", "quick"],
    "ingredients": {
      "core": ["Shrimp", "Rice (day-old)", "Eggs", "Peas"],
      "pantry": ["Soy sauce", "Garlic", "Oil", "Sesame oil"]
    },
    "searchTerms": ["fried rice", "shrimp", "chinese", "leftover rice", "quick", "wok"]
  },
  {
    "name": "Chicken Lo Mein",
    "category": "chinese",
    "moods": ["asian", "quick"],
    "ingredients": {
      "core": ["Lo mein noodles", "Chicken", "Vegetables"],
      "pantry": ["Soy sauce", "Oyster sauce", "Garlic", "Ginger", "Oil"]
    },
    "searchTerms": ["lo mein", "noodles", "chicken", "chinese", "takeout", "stir fry"]
  },
  {
    "name": "Egg Drop Soup",
    "category": "chinese",
    "moods": ["asian", "cozy", "quick"],
    "ingredients": {
      "core": ["Eggs", "Chicken stock"],
      "pantry": ["Cornstarch", "Soy sauce", "White pepper", "Sesame oil"]
    },
    "searchTerms": ["egg drop", "soup", "chinese", "comfort", "quick", "light"]
  },
  {
    "name": "Beef & Broccoli",
    "category": "chinese",
    "moods": ["asian", "hearty"],
    "ingredients": {
      "core": ["Beef", "Broccoli", "Rice"],
      "pantry": ["Soy sauce", "Oyster sauce", "Garlic", "Ginger", "Cornstarch"]
    },
    "searchTerms": ["beef", "broccoli", "chinese", "stir fry", "takeout", "classic"]
  },
  {
    "name": "Mongolian Beef",
    "category": "chinese",
    "moods": ["asian", "hearty"],
    "ingredients": {
      "core": ["Beef", "Green onions", "Rice"],
      "pantry": ["Soy sauce", "Brown sugar", "Garlic", "Ginger", "Oil"]
    },
    "searchTerms": ["mongolian", "beef", "sweet", "savory", "chinese american", "takeout"]
  },
  {
    "name": "Sesame Chicken (Mild, No Vinegar)",
    "category": "chinese",
    "moods": ["asian", "hearty"],
    "ingredients": {
      "core": ["Breaded chicken", "Rice"],
      "pantry": ["Soy sauce", "Honey", "Garlic", "Sesame seeds", "Oil"]
    },
    "searchTerms": ["sesame", "chicken", "sweet", "chinese american", "takeout", "crispy"]
  },
  {
    "name": "Chicken & Snow Peas Stir-Fry",
    "category": "chinese",
    "moods": ["asian", "fresh", "quick"],
    "ingredients": {
      "core": ["Chicken", "Snow peas", "Rice"],
      "pantry": ["Soy sauce", "Garlic", "Ginger", "Oyster sauce", "Oil"]
    },
    "searchTerms": ["stir fry", "chicken", "snow peas", "vegetables", "light", "quick"]
  },
  {
    "name": "Turkey Taco Rice Bowl",
    "category": "tex-mex",
    "moods": ["hearty", "quick"],
    "ingredients": {
      "core": ["Ground turkey", "Rice", "Black beans", "Cheese"],
      "pantry": ["Taco seasoning (no cilantro)", "Salsa (mild)", "Sour cream"]
    },
    "searchTerms": ["taco", "bowl", "turkey", "rice", "mexican", "tex mex", "beans"]
  },
  {
    "name": "Chicken Quesadillas",
    "category": "tex-mex",
    "moods": ["quick", "hearty"],
    "ingredients": {
      "core": ["Chicken", "Cheese", "Tortillas"],
      "pantry": ["Oil", "Salsa (mild)", "Sour cream"]
    },
    "searchTerms": ["quesadilla", "chicken", "cheese", "melty", "mexican", "quick"]
  },
  {
    "name": "Chicken Fajitas",
    "category": "tex-mex",
    "moods": ["fresh", "quick"],
    "ingredients": {
      "core": ["Chicken", "Bell peppers", "Onions", "Tortillas"],
      "pantry": ["Fajita seasoning (no cilantro)", "Oil", "Sour cream"]
    },
    "searchTerms": ["fajitas", "chicken", "peppers", "mexican", "sizzling", "wrap"]
  },
  {
    "name": "Turkey Chili with Beans",
    "category": "tex-mex",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Ground turkey", "Beans", "Tomatoes"],
      "pantry": ["Chili powder", "Cumin", "Garlic", "Onions", "Stock"]
    },
    "searchTerms": ["chili", "turkey", "beans", "stew", "comfort", "hearty", "bowl"]
  },
  {
    "name": "Chicken Soft Tacos (Skillet, Mild)",
    "category": "tex-mex",
    "moods": ["quick", "fresh"],
    "ingredients": {
      "core": ["Chicken", "Soft tortillas", "Lettuce", "Cheese"],
      "pantry": ["Taco seasoning (mild)", "Salsa (mild)", "Sour cream"]
    },
    "searchTerms": ["tacos", "chicken", "soft", "mexican", "quick", "easy"]
  },
  {
    "name": "Refried Bean & Cheese Quesadillas",
    "category": "tex-mex",
    "moods": ["quick", "cozy"],
    "ingredients": {
      "core": ["Refried beans", "Cheese", "Tortillas"],
      "pantry": ["Oil", "Salsa (mild)", "Sour cream"]
    },
    "searchTerms": ["quesadilla", "beans", "vegetarian", "cheese", "quick", "simple"]
  },
  {
    "name": "Turkey Enchilada Skillet",
    "category": "tex-mex",
    "moods": ["hearty", "cozy"],
    "ingredients": {
      "core": ["Ground turkey", "Tortillas", "Cheese", "Enchilada sauce (mild)"],
      "pantry": ["Onions", "Garlic", "Oil"]
    },
    "searchTerms": ["enchilada", "turkey", "skillet", "mexican", "cheesy", "baked"]
  },
  {
    "name": "Pan-Seared Whitefish with Asparagus",
    "category": "seafood",
    "moods": ["seafood", "fresh", "quick"],
    "ingredients": {
      "core": ["White fish", "Asparagus"],
      "pantry": ["Butter", "Lemon", "Garlic", "Salt", "Pepper"]
    },
    "searchTerms": ["fish", "whitefish", "asparagus", "pan seared", "light", "healthy"]
  },
  {
    "name": "Salmon with Smashed Potatoes",
    "category": "seafood",
    "moods": ["seafood", "hearty"],
    "ingredients": {
      "core": ["Salmon", "Small potatoes"],
      "pantry": ["Olive oil", "Garlic", "Dill", "Salt", "Pepper"]
    },
    "searchTerms": ["salmon", "potatoes", "smashed", "crispy", "dill", "hearty"]
  },
  {
    "name": "Linguine with Clams",
    "category": "seafood",
    "moods": ["seafood", "italian"],
    "ingredients": {
      "core": ["Linguine", "Clams"],
      "pantry": ["Garlic", "White wine (optional)", "Olive oil", "Parsley", "Red pepper flakes"]
    },
    "searchTerms": ["linguine", "clams", "pasta", "seafood", "italian", "white sauce"]
  },
  {
    "name": "Mussels in Tomato-Garlic Broth",
    "category": "seafood",
    "moods": ["seafood", "cozy"],
    "ingredients": {
      "core": ["Mussels", "Tomatoes", "Bread for dipping"],
      "pantry": ["Garlic", "White wine (optional)", "Olive oil", "Parsley"]
    },
    "searchTerms": ["mussels", "tomato", "broth", "seafood", "garlic", "bread"]
  },
  {
    "name": "Crab Cakes",
    "category": "seafood",
    "moods": ["seafood", "fresh"],
    "ingredients": {
      "core": ["Crab meat", "Breadcrumbs", "Egg"],
      "pantry": ["Mayo", "Mustard", "Old Bay seasoning", "Lemon"]
    },
    "searchTerms": ["crab", "cakes", "seafood", "appetizer", "maryland", "crispy"]
  },
  {
    "name": "Baked Cod Oreganata",
    "category": "seafood",
    "moods": ["seafood", "quick"],
    "ingredients": {
      "core": ["Cod", "Breadcrumbs"],
      "pantry": ["Olive oil", "Oregano", "Garlic", "Lemon", "Parmesan"]
    },
    "searchTerms": ["cod", "baked", "oreganata", "italian", "breadcrumbs", "light"]
  },
  {
    "name": "Salmon with Dill Mayo",
    "category": "seafood",
    "moods": ["seafood", "quick"],
    "ingredients": {
      "core": ["Salmon", "Dill"],
      "pantry": ["Mayo", "Lemon", "Garlic", "Salt", "Pepper"]
    },
    "searchTerms": ["salmon", "dill", "mayo", "creamy", "quick", "easy"]
  },
  {
    "name": "Crab Linguine (Zest, Not Juicy)",
    "category": "seafood",
    "moods": ["seafood", "italian"],
    "ingredients": {
      "core": ["Linguine", "Crab meat"],
      "pantry": ["Butter", "Garlic", "Lemon zest", "Parsley", "Red pepper flakes"]
    },
    "searchTerms": ["crab", "linguine", "pasta", "seafood", "butter", "lemon"]
  },
  {
    "name": "Chicken Noodle Soup",
    "category": "soup",
    "moods": ["cozy", "quick"],
    "ingredients": {
      "core": ["Chicken", "Egg noodles", "Carrots", "Celery"],
      "pantry": ["Chicken stock", "Onions", "Garlic", "Parsley"]
    },
    "searchTerms": ["soup", "chicken", "noodle", "comfort", "classic", "sick", "warm"]
  },
  {
    "name": "Chicken Tortilla Soup",
    "category": "soup",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Chicken", "Black beans", "Corn", "Tortilla strips"],
      "pantry": ["Chicken stock", "Tomatoes", "Cumin", "Chili powder"]
    },
    "searchTerms": ["tortilla soup", "chicken", "mexican", "beans", "corn", "spicy"]
  },
  {
    "name": "Split Pea Soup with Turkey",
    "category": "soup",
    "moods": ["cozy", "hearty"],
    "ingredients": {
      "core": ["Split peas", "Turkey ham or bacon", "Carrots"],
      "pantry": ["Stock", "Onions", "Garlic", "Bay leaf"]
    },
    "searchTerms": ["split pea", "soup", "ham", "turkey", "hearty", "thick"]
  },
  {
    "name": "Bean & Kale Minestrone",
    "category": "soup",
    "moods": ["cozy", "fresh"],
    "ingredients": {
      "core": ["White beans", "Kale", "Small pasta"],
      "pantry": ["Vegetable stock", "Tomatoes", "Garlic", "Olive oil"]
    },
    "searchTerms": ["minestrone", "beans", "kale", "italian", "vegetable", "healthy"]
  },
  {
    "name": "Chicken Congee",
    "category": "soup",
    "moods": ["asian", "cozy"],
    "ingredients": {
      "core": ["Rice", "Chicken", "Ginger"],
      "pantry": ["Chicken stock", "Soy sauce", "Sesame oil", "Green onions"]
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
let currentMood = 'all';
let selectedMeal = null;


function loadMeals() {
    console.log('Loading meals...');

    if (typeof embeddedMeals !== 'undefined' && embeddedMeals) {
        meals = embeddedMeals;
    }

    window.meals = meals;
    console.log('Loaded', meals.length, 'meals');

    initFuzzySearch();
    setupEventListeners();
    displayAllMeals();
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
        btn.addEventListener('click', function() {
            const mood = this.dataset.mood;

            // Update active state
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            currentMood = mood;

            if (mood === 'all') {
                displayAllMeals();
            } else {
                showMealSuggestions(mood);
            }
        });
    });

    // Search input with debounce
    let searchTimeout;
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length === 0) {
            // If search is cleared, show current mood or all
            if (currentMood === 'all') {
                displayAllMeals();
            } else {
                showMealSuggestions(currentMood);
            }
            return;
        }

        searchTimeout = setTimeout(() => {
            searchMeals(query);
        }, 300);
    });

    // Modal close on backdrop click
    document.getElementById('mealModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}


function displayAllMeals() {
    displayMeals(meals);
}


function showMealSuggestions(mood) {
    const moodMeals = meals.filter(m => m.moods.includes(mood));
    displayMeals(moodMeals);
}


function searchMeals(query) {
    const results = fuse.search(query).map(r => r.item);
    displayMeals(results);
}


function displayMeals(mealList) {
    const container = document.getElementById('mealSuggestions');
    container.innerHTML = '';

    if (mealList.length === 0) {
        container.innerHTML = '<div class="no-results">No meals found. Try a different search or mood.</div>';
        return;
    }

    mealList.forEach(meal => {
        const mealCard = createCompactMealCard(meal);
        container.appendChild(mealCard);
    });
}


function createCompactMealCard(meal) {
    const card = document.createElement('div');
    card.className = 'meal-card';

    // Build ingredients list (max 3 items)
    const coreIngredients = meal.ingredients.core.slice(0, 3).join(', ');
    const hasMore = meal.ingredients.core.length > 3 ? '...' : '';

    // Build mood tags (compact)
    const moodTags = meal.moods.slice(0, 3).map(mood => {
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
        return `<span class="meal-tag">${moodEmoji[mood] || ''} ${mood}</span>`;
    }).join('');

    card.innerHTML = `
        <div class="meal-title">${meal.name}</div>
        <div class="meal-ingredients">${coreIngredients}${hasMore}</div>
        <div class="meal-tags">${moodTags}</div>
    `;

    card.addEventListener('click', () => showMealDetails(meal));

    return card;
}


function showMealDetails(meal) {
    selectedMeal = meal;

    // Update modal content
    document.getElementById('modalTitle').textContent = meal.name;

    // Ingredients
    document.getElementById('modalIngredients').textContent = meal.ingredients.core.join(', ');

    // Pantry items
    document.getElementById('modalPantry').textContent = meal.ingredients.pantry.join(', ');

    // Nutrition
    const nutrition = nutritionEstimates[meal.name] || { protein: 25, carbs: 50, fat: 15, calories: 435 };
    const nutritionHTML = `
        <div class="nutrition-item">
            <span class="nutrition-label">Protein</span>
            <span class="nutrition-value">${nutrition.protein}g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">Carbs</span>
            <span class="nutrition-value">${nutrition.carbs}g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">Fat</span>
            <span class="nutrition-value">${nutrition.fat}g</span>
        </div>
        <div class="nutrition-item">
            <span class="nutrition-label">Calories</span>
            <span class="nutrition-value">${nutrition.calories}</span>
        </div>
    `;
    document.getElementById('modalNutrition').innerHTML = nutritionHTML;

    // Tags
    const allTags = meal.moods.map(mood => {
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
        return `<span class="meal-tag" style="margin-right: 8px;">${moodEmoji[mood] || ''} ${mood}</span>`;
    }).join('');
    document.getElementById('modalTags').innerHTML = allTags;

    // Show modal
    document.getElementById('mealModal').classList.add('open');
}


function closeModal() {
    document.getElementById('mealModal').classList.remove('open');
}

// Make closeModal available globally for onclick handler
window.closeModal = closeModal;


function initializeApp() {
    loadMeals();
}


window.initializeApp = initializeApp;
window.loadMeals = loadMeals;




    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing MoodEats Compact Grid...');
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
        });
    } else {
        console.log('Initializing MoodEats Compact Grid (DOM ready)...');
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
})();