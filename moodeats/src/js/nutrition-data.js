// Nutrition estimates for all meals
// Contains protein, carbs, fat, and calories for each meal

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


export { nutritionEstimates };
