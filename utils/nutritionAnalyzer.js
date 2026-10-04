/**
 * Nutrition Analyzer
 * Compares actual intake vs personalized targets and detects imbalances.
 */

import { calculateNutritionScore } from './nutritionScore.js';

/**
 * Analyzes today's intake against personal targets.
 */
export function analyzeDailyNutrition(dailyTotals, userTargets, waterIntakeMl = 0) {
  const problems = [];
  const achievements = [];
  const tips = [];

  const { calories, protein, fat, fiber } = dailyTotals;
  const targetCalories = userTargets?.targetCalories || 2000;
  const targetProtein = userTargets?.macros?.protein?.grams || 120;
  const targetWater = userTargets?.targetWaterMl || 2500;

  if (calories === 0) {
    return {
      problems: [],
      achievements: [],
      tips: [
        {
          id: 'tip_start',
          type: 'info',
          title: 'Start Logging Today',
          message: 'Log your breakfast or lunch to start tracking your daily metabolic goals.',
        },
      ],
      dietScore: 100,
    };
  }

  // 1. Calorie excess / deficit
  const calorieRatio = calories / targetCalories;
  if (calorieRatio > 1.15) {
    problems.push({
      id: 'prob_cal_excess',
      type: 'warning',
      severity: 'high',
      title: 'Calorie Budget Exceeded',
      message: `You've consumed ${calories} kcal (${Math.round(calories - targetCalories)} kcal over your ${targetCalories} kcal budget).`,
      action: 'Opt for lighter whole-food snacks or a 20-minute walk to balance energy intake.',
      icon: 'alert-circle-outline',
    });
  } else if (calorieRatio >= 0.95 && calorieRatio <= 1.05) {
    achievements.push({
      id: 'achieve_cal_balance',
      type: 'success',
      title: 'Optimal Energy Balance',
      message: `You are within 5% of your target calorie goal (${calories} / ${targetCalories} kcal).`,
      icon: 'checkmark-circle-outline',
    });
  }

  // 2. Protein deficiency
  const proteinRatio = protein / targetProtein;
  if (proteinRatio < 0.65 && calorieRatio > 0.6) {
    problems.push({
      id: 'prob_low_protein',
      type: 'warning',
      severity: 'medium',
      title: 'Low Protein Intake Detected',
      message: `You have logged ${protein}g of your ${targetProtein}g protein target (${Math.round(proteinRatio * 100)}%).`,
      action: 'Include a lean protein source (chicken breast, eggs, Greek yogurt, or tofu) in your next meal.',
      icon: 'fitness-outline',
    });
  } else if (proteinRatio >= 0.9) {
    achievements.push({
      id: 'achieve_protein_hit',
      type: 'success',
      title: 'Protein Goal Met',
      message: `You reached ${protein}g of your ${targetProtein}g goal! Great job supporting muscle recovery.`,
      icon: 'shield-checkmark-outline',
    });
  }

  // 3. High dietary fat ratio
  const fatCalories = fat * 9;
  const fatPercent = (fatCalories / Math.max(1, calories)) * 100;
  if (fatPercent > 38 && calories > 500) {
    problems.push({
      id: 'prob_high_fat',
      type: 'warning',
      severity: 'medium',
      title: 'High Dietary Fat Ratio',
      message: `Fat accounts for ${Math.round(fatPercent)}% of today's calories (recommended upper threshold: 35%).`,
      action: 'Balance your next meal with complex carbs and leafy vegetables instead of dense oils or fried items.',
      icon: 'warning-outline',
    });
  }

  // 4. Fiber deficiency
  if (fiber < 12 && calorieRatio > 0.7) {
    tips.push({
      id: 'tip_low_fiber',
      type: 'info',
      title: 'Increase Dietary Fiber',
      message: `Only ${fiber}g fiber logged today. Aim for at least 25-30g daily for healthy digestion and glycemic stability.`,
      action: 'Snack on an apple, rolled oats, or steamed broccoli.',
      icon: 'leaf-outline',
    });
  }

  // 5. Water hydration
  const waterRatio = waterIntakeMl / targetWater;
  if (waterRatio < 0.5) {
    problems.push({
      id: 'prob_low_water',
      type: 'info',
      severity: 'low',
      title: 'Hydration Deficit',
      message: `You've tracked ${waterIntakeMl} ml of your ${targetWater} ml daily water goal.`,
      action: 'Drink a 250ml glass of water right now to stay hydrated.',
      icon: 'water-outline',
    });
  }

  const dietScore = calculateNutritionScore(dailyTotals, userTargets, waterIntakeMl);

  return {
    dietScore,
    problems,
    achievements,
    tips,
  };
}

/**
 * Analyzes multi-day eating patterns (e.g. 7-day logs)
 */
export function analyzePatterns(recentLogs = [], userTargets = {}) {
  const targetCalories = userTargets?.targetCalories || 2000;
  const targetProtein = userTargets?.macros?.protein?.grams || 120;

  let totalCalories = 0;
  let totalProtein = 0;
  let loggedDaysCount = 0;
  let daysSkippedBreakfast = 0;
  let dinnerCals = 0;
  let breakfastCals = 0;
  const dailyCaloriesList = [];
  const loggedFoodNames = new Set();

  recentLogs.forEach((dayLog) => {
    const meals = dayLog.meals || {};
    let bCals = 0;
    let dCals = 0;

    (meals.breakfast || []).forEach((f) => {
      bCals += f.calories || 0;
      loggedFoodNames.add((f.name || '').toLowerCase());
    });
    if (bCals === 0 && ((meals.lunch || []).length > 0 || (meals.dinner || []).length > 0)) {
      daysSkippedBreakfast++;
    }
    breakfastCals += bCals;

    (meals.dinner || []).forEach((f) => {
      dCals += f.calories || 0;
      loggedFoodNames.add((f.name || '').toLowerCase());
    });
    dinnerCals += dCals;

    (meals.lunch || []).forEach((f) => loggedFoodNames.add((f.name || '').toLowerCase()));
    (meals.snacks || []).forEach((f) => loggedFoodNames.add((f.name || '').toLowerCase()));

    const dayCals = dayLog.totals?.calories || 0;
    if (dayCals > 0) {
      dailyCaloriesList.push(dayCals);
      totalCalories += dayCals;
      totalProtein += dayLog.totals?.protein || 0;
      loggedDaysCount++;
    }
  });

  const avgCalories = loggedDaysCount > 0 ? Math.round(totalCalories / loggedDaysCount) : 0;
  const avgProtein = loggedDaysCount > 0 ? Math.round(totalProtein / loggedDaysCount) : 0;

  let stdDev = 0;
  if (dailyCaloriesList.length > 1) {
    const variance =
      dailyCaloriesList.reduce((acc, val) => acc + Math.pow(val - avgCalories, 2), 0) /
      dailyCaloriesList.length;
    stdDev = Math.round(Math.sqrt(variance));
  }

  const patterns = [];
  if (loggedDaysCount >= 2 && dinnerCals > breakfastCals * 2.2) {
    patterns.push({
      id: 'heavy_dinner',
      title: 'Back-Loaded Evening Calories',
      tag: 'Meal Timing',
      description: 'You consume more than double your calories at dinner compared to breakfast.',
      tip: 'Shift 200-300 kcal from dinner to a protein-rich breakfast for steady daytime energy.',
    });
  }

  if (daysSkippedBreakfast >= 2) {
    patterns.push({
      id: 'skip_breakfast',
      title: 'Frequent Breakfast Skipping',
      tag: 'Consistency',
      description: `Breakfast was skipped on ${daysSkippedBreakfast} of your tracked days.`,
      tip: 'Try having a quick protein shake or boiled egg + fruit in the morning.',
    });
  }

  if (stdDev > 450) {
    patterns.push({
      id: 'volatile_cals',
      title: `High Calorie Volatility (±${stdDev} kcal)`,
      tag: 'Energy Stability',
      description: 'Your day-to-day calorie intake swings noticeably between restriction and surplus.',
      tip: 'Try to keep daily intake within ±200 kcal of your daily goal.',
    });
  }

  return {
    loggedDaysCount,
    avgCalories,
    avgProtein,
    calorieStdDev: stdDev,
    patterns,
    loggedFoodNames: Array.from(loggedFoodNames),
  };
}
