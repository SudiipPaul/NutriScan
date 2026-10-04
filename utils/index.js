/**
 * NutriScan Utilities Central Export
 */

export { calculateBMR } from './bmrCalculator.js';
export { calculateTDEE } from './tdeeCalculator.js';
export { calculateTargetCalories } from './calorieCalculator.js';
export {
  calculateProteinTarget,
  calculateFatTarget,
  calculateCarbTarget,
  calculateAllMacros,
  calculateMacroTargets,
  generateNutritionProfile,
  calculateDailyTotals,
} from './macroCalculator.js';
export { calculateNutritionScore } from './nutritionScore.js';
export { analyzeDailyNutrition, analyzePatterns } from './nutritionAnalyzer.js';
export {
  generateRecommendations,
  evaluateCalorieRule,
  evaluateProteinRule,
  evaluateCarbRule,
  evaluateFatRule,
  evaluateFoodPatterns,
  evaluateGoalAlignment,
  getRecommendedSwaps,
  getActionableHabits,
  FOOD_SWAPS,
  NUTRITION_THRESHOLDS,
} from './recommendationEngine.js';
export { formatISODate, getFriendlyDateLabel, shiftDate, getLastNDays } from './dateUtils.js';
