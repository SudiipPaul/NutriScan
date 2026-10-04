/**
 * Meal Configuration Module
 * Provides presets, icons, and helper utilities for customizable daily meals.
 */

export const DEFAULT_MEAL_COUNT = 4;

export const MEAL_PRESETS = {
  1: [
    { id: 'meal_1', name: 'Meal 1 (Main Meal)', icon: 'restaurant-outline' },
  ],
  2: [
    { id: 'meal_1', name: 'Meal 1 (Brunch/Lunch)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Dinner)', icon: 'moon-outline' },
  ],
  3: [
    { id: 'meal_1', name: 'Meal 1 (Breakfast)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Lunch)', icon: 'restaurant-outline' },
    { id: 'meal_3', name: 'Meal 3 (Dinner)', icon: 'moon-outline' },
  ],
  4: [
    { id: 'meal_1', name: 'Meal 1 (Breakfast)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Lunch)', icon: 'restaurant-outline' },
    { id: 'meal_3', name: 'Meal 3 (Snack)', icon: 'cafe-outline' },
    { id: 'meal_4', name: 'Meal 4 (Dinner)', icon: 'moon-outline' },
  ],
  5: [
    { id: 'meal_1', name: 'Meal 1 (Breakfast)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Mid-Morning)', icon: 'nutrition-outline' },
    { id: 'meal_3', name: 'Meal 3 (Lunch)', icon: 'restaurant-outline' },
    { id: 'meal_4', name: 'Meal 4 (Evening Snack)', icon: 'cafe-outline' },
    { id: 'meal_5', name: 'Meal 5 (Dinner)', icon: 'moon-outline' },
  ],
  6: [
    { id: 'meal_1', name: 'Meal 1 (Breakfast)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Morning Snack)', icon: 'nutrition-outline' },
    { id: 'meal_3', name: 'Meal 3 (Lunch)', icon: 'restaurant-outline' },
    { id: 'meal_4', name: 'Meal 4 (Afternoon Snack)', icon: 'cafe-outline' },
    { id: 'meal_5', name: 'Meal 5 (Dinner)', icon: 'moon-outline' },
    { id: 'meal_6', name: 'Meal 6 (Late Snack)', icon: 'bed-outline' },
  ],
};

const DEFAULT_ICONS = [
  'sunny-outline',
  'restaurant-outline',
  'cafe-outline',
  'moon-outline',
  'nutrition-outline',
  'bed-outline',
  'fast-food-outline',
  'leaf-outline',
];

/**
 * Builds a meals configuration array for a given count
 * @param {number} count 
 * @returns {Array<{ id: string, name: string, icon: string }>}
 */
export function buildMealsConfig(count = DEFAULT_MEAL_COUNT) {
  const c = Math.max(1, Math.min(8, parseInt(count, 10) || DEFAULT_MEAL_COUNT));
  if (MEAL_PRESETS[c]) {
    return JSON.parse(JSON.stringify(MEAL_PRESETS[c]));
  }

  const list = [];
  for (let i = 1; i <= c; i++) {
    list.push({
      id: `meal_${i}`,
      name: `Meal ${i}`,
      icon: DEFAULT_ICONS[(i - 1) % DEFAULT_ICONS.length],
    });
  }
  return list;
}

/**
 * Resolves user's active meals configuration with fallback to default 4 meals
 * @param {Object} profile 
 * @returns {Array<{ id: string, name: string, icon: string }>}
 */
export function getUserMeals(profile) {
  if (profile?.mealsConfig && Array.isArray(profile.mealsConfig) && profile.mealsConfig.length > 0) {
    return profile.mealsConfig;
  }
  if (profile?.mealCount) {
    return buildMealsConfig(profile.mealCount);
  }
  return buildMealsConfig(DEFAULT_MEAL_COUNT);
}

/**
 * Safely extracts items for a meal, supporting both custom meal IDs and legacy keys
 * @param {Object} dayLog 
 * @param {string} mealId 
 * @param {number} [index=0] 
 * @returns {Array}
 */
export function getMealItemsFromLog(dayLog, mealId, index = 0) {
  if (!dayLog?.meals) return [];
  
  // 1. Direct match with mealId
  if (Array.isArray(dayLog.meals[mealId]) && dayLog.meals[mealId].length > 0) {
    return dayLog.meals[mealId];
  }

  // 2. Legacy key backward-compatibility mapping
  const legacyMap = {
    0: 'breakfast',
    1: 'lunch',
    2: 'snacks',
    3: 'dinner',
  };
  const legacyKey = legacyMap[index] || (mealId.includes('1') ? 'breakfast' : mealId.includes('2') ? 'lunch' : null);
  if (legacyKey && Array.isArray(dayLog.meals[legacyKey]) && dayLog.meals[legacyKey].length > 0) {
    return dayLog.meals[legacyKey];
  }

  return dayLog.meals[mealId] || [];
}
