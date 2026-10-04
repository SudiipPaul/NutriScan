/**
 * Macronutrient Calculator Module
 * 
 * Computes personalized targets for Protein, Dietary Fat, and Carbohydrates
 * based on physiological body weight demands, metabolic goals, and standard
 * clinical macronutrient distribution ranges (AMDR).
 * 
 * ATWATER ENERGY VALUES (Caloric Equivalents):
 * - Protein:       4.0 kcal per gram
 * - Carbohydrates: 4.0 kcal per gram
 * - Dietary Fats:  9.0 kcal per gram
 * 
 * CLINICAL ASSUMPTIONS & RATIONALE:
 * 
 * 1. PROTEIN TARGET:
 *    - Preserves lean muscle tissue, elevates Thermic Effect of Food (TEF ~20-30%),
 *      and stimulates satiety via peptide YY and GLP-1 secretion.
 *    - In a caloric deficit (weight loss), protein is increased to 1.8 - 2.0 g/kg of body weight
 *      to counteract muscle catabolism.
 *    - For maintenance/general health, 1.6 g/kg exceeds the baseline sedentary RDA (0.8 g/kg)
 *      to optimize muscle protein synthesis (MPS) for active university individuals.
 * 
 * 2. DIETARY FAT TARGET:
 *    - Essential for steroid hormone synthesis (testosterone, estrogen), cellular membrane
 *      integrity, and absorption of fat-soluble vitamins (A, D, E, K).
 *    - Set to 25% - 30% of total daily calories (default: 28%).
 *    - Grams = (Target Calories × 0.28) ÷ 9.
 * 
 * 3. CARBOHYDRATE TARGET:
 *    - The human body's primary high-efficiency substrate for cognitive cerebral function
 *      and anaerobic glycolysis (strength/sports performance).
 *    - Fills the remaining calorie budget after protein and fat quotas are satisfied.
 *    - Grams = Remaining Calories ÷ 4.
 */

import { GOALS } from '../constants/goals.js';

/**
 * Calculates Protein Target in grams and calories.
 *
 * @param {number} weightKg - Body weight in kg
 * @param {string} [goalKey='maintain'] - Goal identifier ('lose_fast', 'lose_mild', 'maintain', etc.)
 * @returns {{ grams: number, calories: number }}
 */
export function calculateProteinTarget(weightKg, goalKey = 'maintain') {
  const weight = parseFloat(weightKg);
  if (isNaN(weight) || weight <= 0) {
    throw new Error(`Invalid weight: ${weightKg}. Weight must be a positive number.`);
  }

  const goal = GOALS[goalKey] || GOALS.maintain;
  const multiplier = goal.proteinMultiplier || 1.6;

  const grams = Math.round(weight * multiplier);
  const calories = grams * 4;

  return {
    grams,
    calories,
    multiplier,
  };
}

/**
 * Calculates Dietary Fat Target in grams and calories.
 *
 * @param {number} targetCalories - Total daily target calories in kcal
 * @param {number} [fatRatio=0.28] - Fraction of total calories (0.20 - 0.35, default 0.28)
 * @returns {{ grams: number, calories: number, percent: number }}
 */
export function calculateFatTarget(targetCalories, fatRatio = 0.28) {
  const calories = parseFloat(targetCalories);
  if (isNaN(calories) || calories <= 0) {
    throw new Error(`Invalid calories: ${targetCalories}. Must be a positive number.`);
  }

  const fatCalories = Math.round(calories * fatRatio);
  const fatGrams = Math.round(fatCalories / 9);

  return {
    grams: fatGrams,
    calories: fatCalories,
    percent: Math.round(fatRatio * 100),
  };
}

/**
 * Calculates Carbohydrate Target in grams and calories from the remaining calorie budget.
 *
 * @param {number} targetCalories - Total daily target calories
 * @param {number} proteinCalories - Calories allocated to protein
 * @param {number} fatCalories - Calories allocated to fat
 * @returns {{ grams: number, calories: number, percent: number }}
 */
export function calculateCarbTarget(targetCalories, proteinCalories, fatCalories) {
  const total = parseFloat(targetCalories);
  const pCals = parseFloat(proteinCalories) || 0;
  const fCals = parseFloat(fatCalories) || 0;

  const remainingCals = Math.max(0, Math.round(total - pCals - fCals));
  const carbGrams = Math.round(remainingCals / 4);
  const percent = total > 0 ? Math.round((remainingCals / total) * 100) : 0;

  return {
    grams: carbGrams,
    calories: remainingCals,
    percent,
  };
}

/**
 * Orchestrates complete macronutrient distribution for a given user profile.
 *
 * @param {number} targetCalories - Daily target calories in kcal
 * @param {number} weightKg - User body weight in kg
 * @param {string} [goalKey='maintain'] - User goal identifier
 * @returns {{
 *   protein: { grams: number, calories: number, percent: number },
 *   fat: { grams: number, calories: number, percent: number },
 *   carbs: { grams: number, calories: number, percent: number }
 * }}
 */
export function calculateAllMacros(targetCalories, weightKg, goalKey = 'maintain') {
  const totalCals = parseFloat(targetCalories);

  // 1. Protein
  const protein = calculateProteinTarget(weightKg, goalKey);
  const proteinPercent = totalCals > 0 ? Math.round((protein.calories / totalCals) * 100) : 0;

  // 2. Fat (~28% of total calories)
  const fat = calculateFatTarget(totalCals, 0.28);

  // 3. Carbohydrates (remainder of calorie budget)
  const carbs = calculateCarbTarget(totalCals, protein.calories, fat.calories);

  return {
    protein: {
      grams: protein.grams,
      calories: protein.calories,
      percent: proteinPercent,
    },
    fat: {
      grams: fat.grams,
      calories: fat.calories,
      percent: fat.percent,
    },
    carbs: {
      grams: carbs.grams,
      calories: carbs.calories,
      percent: carbs.percent,
    },
  };
}

/**
 * Backwards-compatible alias for existing modules
 */
export const calculateMacroTargets = calculateAllMacros;

/**
 * Generates full calculated nutrition blueprint for a user profile
 */
export function generateNutritionProfile(profile = {}) {
  const {
    weight = 70,
    height = 170,
    age = 22,
    gender = 'male',
    activityLevel = 'moderate',
    weightGoal = 'maintain',
  } = profile;

  // Mifflin-St Jeor BMR
  const w = parseFloat(weight) || 70;
  const h = parseFloat(height) || 170;
  const a = parseFloat(age) || 22;
  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr = gender === 'female' ? bmr - 161 : bmr + 5;
  const roundedBmr = Math.max(800, Math.round(bmr));

  // TDEE Multipliers
  const palMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const factor = palMultipliers[activityLevel] || 1.55;
  const roundedTdee = Math.round(roundedBmr * factor);

  // Goal Calorie Target
  const goalOffsets = {
    lose_fast: -500,
    lose_mild: -250,
    maintain: 0,
    gain_mild: 250,
    gain_fast: 500,
  };
  const offset = goalOffsets[weightGoal] ?? 0;
  const rawTarget = roundedTdee + offset;
  const floor = gender === 'female' ? 1200 : 1500;
  const targetCalories = Math.max(floor, Math.round(rawTarget));

  // Macronutrient Allocations
  const macros = calculateAllMacros(targetCalories, w, weightGoal);

  // Hydration Target (~35 ml per kg body weight)
  const targetWaterMl = Math.max(2000, Math.round((w * 35) / 100) * 100);

  return {
    bmr: roundedBmr,
    tdee: roundedTdee,
    targetCalories,
    macros,
    targetWaterMl,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Aggregates daily intake totals across meals
 */
export function calculateDailyTotals(meals = {}) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  // Dynamically iterate over all meal arrays (supports custom meal counts e.g. 2, 3, 4, 5, etc.)
  Object.values(meals || {}).forEach((items) => {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        calories += item.calories || 0;
        protein += item.protein || 0;
        carbs += item.carbs || 0;
        fat += item.fat || 0;
        fiber += item.fiber || 0;
      });
    }
  });

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
  };
}
