/**
 * NutriScan Rule-Based Recommendation Engine
 * 
 * Deterministic, explainable expert system for personalized dietary feedback.
 * Analyzes:
 *  1. Calorie intake vs target
 *  2. Protein intake vs target
 *  3. Carbohydrate intake vs target
 *  4. Fat intake vs target
 *  5. Recent food patterns (fried snacks, sugary drinks, meal timing, vegetable balance)
 *  6. User's weight goal (weight loss, maintenance, muscle gain)
 * 
 * Academic Note:
 * This engine uses deterministic clinical heuristics and threshold-based decision trees.
 * It produces fully reproducible and explainable recommendations without reliance on external AI APIs.
 */

// =============================================================================
// THRESHOLDS & CONFIGURATION
// =============================================================================

export const NUTRITION_THRESHOLDS = {
  // Calorie tolerance bands
  CALORIE_UPPER_SURPLUS_RATIO: 1.10, // >10% over target is high
  CALORIE_LOWER_DEFICIT_RATIO: 0.85,  // <85% of target is low
  CALORIE_ON_TARGET_MIN: 0.90,       // 90% - 110% is considered on target
  CALORIE_ON_TARGET_MAX: 1.10,

  // Macronutrient tolerance ratios (actual / target)
  PROTEIN_DEFICIT_RATIO: 0.80,       // <80% is low protein
  PROTEIN_SURPLUS_RATIO: 1.25,       // >125% is high protein
  CARB_DEFICIT_RATIO: 0.70,          // <70% is low carb
  CARB_SURPLUS_RATIO: 1.25,          // >125% is high carb
  FAT_DEFICIT_RATIO: 0.70,           // <70% is low fat
  FAT_SURPLUS_RATIO: 1.25,           // >125% is high fat

  // Macro calorie share limits
  FAT_MAX_ENERGY_PERCENT: 35,        // >35% of total kcal from fat is excessive
  CARB_MAX_ENERGY_PERCENT: 65,       // >65% of total kcal from carbs indicates refined carb crowding
};

// Common Bangladeshi & staple food pattern keywords
const FRIED_SNACK_KEYWORDS = [
  'singara', 'shingara', 'somosa', 'samosa', 'piaju', 'peaju',
  'beguni', 'paratha', 'porota', 'luchi', 'puri', 'chips', 'chanachur', 'fried'
];

const SUGARY_DRINK_KEYWORDS = [
  'soda', 'coke', 'pepsi', 'fanta', 'dudh cha', 'milk tea', 'sweet tea',
  'rooh afza', 'lassi', 'misti doi', 'energy drink', 'sugar', 'syrup', 'sweetened', 'juice'
];

const VEGETABLE_KEYWORDS = [
  'shak', 'saag', 'bhorta', 'vorta', 'sobji', 'vegetable', 'salad',
  'palong', 'lal shak', 'dherosh', 'potol', 'lau', 'gajor'
];

const LEAN_PROTEIN_KEYWORDS = [
  'egg', 'dim', 'chicken', 'murgi', 'fish', 'mach', 'dal', 'daal',
  'tofu', 'chana', 'chhola', 'lentil', 'tok doi', 'curd', 'paneer'
];

// =============================================================================
// INDIVIDUAL RULE EVALUATORS
// =============================================================================

/**
 * 1. Evaluates Calorie Intake vs Target
 */
export function evaluateCalorieRule(actualCalories, targetCalories, goalId = 'maintain', daysCount = 1) {
  if (!targetCalories || targetCalories <= 0) return null;
  if (actualCalories <= 0) return null;

  const ratio = actualCalories / targetCalories;
  const delta = Math.round(actualCalories - targetCalories);
  const percentDelta = Math.round(Math.abs(ratio - 1) * 100);
  const isMultiDay = daysCount > 1;
  const timePrefix = isMultiDay ? 'average ' : '';

  // Case A: Consistently High Calories
  if (ratio > NUTRITION_THRESHOLDS.CALORIE_UPPER_SURPLUS_RATIO) {
    let goalContext = 'Consider reducing portion sizes of high-calorie foods.';
    let priority = 1;

    if (goalId.includes('loss')) {
      goalContext = 'To stay in your fat-loss deficit, prioritize high-fiber vegetables and reduce portion sizes of calorie-dense items (rice, fried snacks, and cooking oils).';
      priority = 1;
    } else if (goalId.includes('gain')) {
      goalContext = 'While you are targeting a surplus for weight gain, an excessive surplus will promote body fat accumulation rather than lean muscle.';
      priority = 2;
    }

    return {
      id: 'rule_cal_high',
      category: 'calories',
      type: 'warning',
      priority,
      title: 'Calorie Intake Above Target',
      message: isMultiDay
        ? 'Your average calorie intake is above your target. Consider reducing portion sizes of high-calorie foods.'
        : 'Your calorie intake is above your target. Consider reducing portion sizes of high-calorie foods.',
      explanation: `Actual intake of ${actualCalories} kcal exceeds target of ${targetCalories} kcal by ${delta} kcal (+${percentDelta}%). ${goalContext}`,
      metrics: { actual: actualCalories, target: targetCalories, ratio, delta },
    };
  }

  // Case B: Significantly Below Calorie Target
  if (ratio < NUTRITION_THRESHOLDS.CALORIE_LOWER_DEFICIT_RATIO) {
    let goalContext = 'Try adding nutrient-dense foods to hit your energy target.';
    let priority = 2;

    if (goalId.includes('gain')) {
      goalContext = 'Your body needs a consistent caloric surplus to synthesize new muscle tissue. Add healthy calorie-dense items like nuts, milk, or extra dal.';
      priority = 1;
    } else if (goalId.includes('loss')) {
      goalContext = 'A severe calorie deficit can slow your metabolism and lead to muscle loss. Ensure you are meeting minimum safe intake levels.';
      priority = 2;
    }

    return {
      id: 'rule_cal_low',
      category: 'calories',
      type: 'warning',
      priority,
      title: 'Calorie Intake Below Target',
      message: `Your ${timePrefix}calorie intake is significantly below your target. ${goalContext}`,
      explanation: `Actual intake of ${actualCalories} kcal is ${Math.abs(delta)} kcal below the target of ${targetCalories} kcal (-${percentDelta}%).`,
      metrics: { actual: actualCalories, target: targetCalories, ratio, delta },
    };
  }

  // Case C: Calorie Intake is Appropriate / On Target
  return {
    id: 'rule_cal_optimal',
    category: 'calories',
    type: 'success',
    priority: 3,
    title: 'Optimal Calorie Balance',
    message: 'Your calorie intake is currently close to your target.',
    explanation: `Actual intake of ${actualCalories} kcal is within ±${NUTRITION_THRESHOLDS.CALORIE_ON_TARGET_MAX * 10 - 10}% of target (${targetCalories} kcal).`,
    metrics: { actual: actualCalories, target: targetCalories, ratio, delta },
  };
}

/**
 * 2. Evaluates Protein Intake vs Target
 */
export function evaluateProteinRule(actualProtein, targetProtein, goalId = 'maintain') {
  if (!targetProtein || targetProtein <= 0) return null;

  const ratio = actualProtein / targetProtein;
  const delta = Math.round(actualProtein - targetProtein);
  const percentAchieved = Math.round(ratio * 100);

  // Case A: Low Protein
  if (ratio < NUTRITION_THRESHOLDS.PROTEIN_DEFICIT_RATIO) {
    let goalNote = '';
    if (goalId.includes('gain')) {
      goalNote = 'Adequate protein is essential for muscle hypertrophy and workout recovery.';
    } else if (goalId.includes('loss')) {
      goalNote = 'Sufficient protein preserves lean muscle tissue and keeps you full during a calorie deficit.';
    }

    return {
      id: 'rule_prot_low',
      category: 'protein',
      type: 'warning',
      priority: 1,
      title: 'Protein Intake Below Target',
      message: 'Your protein intake is below your target. Consider adding eggs, fish, chicken, milk or lentils.',
      explanation: `You have consumed ${actualProtein}g of your ${targetProtein}g protein goal (${percentAchieved}% achieved, deficit of ${Math.abs(delta)}g). ${goalNote}`.trim(),
      suggestedFoods: [
        'Boiled Whole Egg (Dim) - 6.3g protein',
        'Broiler or Deshi Chicken - 22g protein / 100g',
        'Rui or Ilish Fish - 17-20g protein / 100g',
        'Masoor or Moong Dal - 7-9g protein / cup',
        'Plain Sour Yogurt (Tok Doi) - 5g protein / cup',
        'Boiled Chickpeas (Chhola) - 7g protein / 100g'
      ],
      metrics: { actual: actualProtein, target: targetProtein, ratio, delta },
    };
  }

  // Case B: High / Surpassed Protein
  if (ratio > NUTRITION_THRESHOLDS.PROTEIN_SURPLUS_RATIO) {
    return {
      id: 'rule_prot_high',
      category: 'protein',
      type: 'info',
      priority: 3,
      title: 'High Protein Intake',
      message: `Your protein intake (${actualProtein}g) is well above your target (${targetProtein}g). Excellent for muscle recovery, but ensure you drink plenty of water.`,
      explanation: `Protein achieved at ${percentAchieved}% of target. Excess amino acids are oxidized for energy.`,
      metrics: { actual: actualProtein, target: targetProtein, ratio, delta },
    };
  }

  // Case C: Protein is Optimal
  return {
    id: 'rule_prot_optimal',
    category: 'protein',
    type: 'success',
    priority: 3,
    title: 'Protein Target Achieved',
    message: `Great job! Your protein intake (${actualProtein}g) meets your daily nutritional needs.`,
    explanation: `Reached ${percentAchieved}% of the ${targetProtein}g target, supporting muscle protein synthesis and satiety.`,
    metrics: { actual: actualProtein, target: targetProtein, ratio, delta },
  };
}

/**
 * 3. Evaluates Carbohydrate Intake vs Target
 */
export function evaluateCarbRule(actualCarbs, targetCarbs, actualCalories = 0) {
  if (!targetCarbs || targetCarbs <= 0) return null;

  const ratio = actualCarbs / targetCarbs;
  const delta = Math.round(actualCarbs - targetCarbs);
  const carbCalories = actualCarbs * 4;
  const carbEnergyPercent = actualCalories > 0 ? Math.round((carbCalories / actualCalories) * 100) : 0;

  // Case A: Excessive Carbs / Carb-Heavy Meals
  if (ratio > NUTRITION_THRESHOLDS.CARB_SURPLUS_RATIO || carbEnergyPercent > NUTRITION_THRESHOLDS.CARB_MAX_ENERGY_PERCENT) {
    return {
      id: 'rule_carb_high',
      category: 'carbs',
      type: 'warning',
      priority: 2,
      title: 'High Carbohydrate Intake',
      message: 'Your carbohydrate intake is high relative to your target. Consider replacing extra portions of white rice or refined snacks with vegetables and lentils.',
      explanation: `Carbohydrates contribute ${actualCarbs}g (${carbEnergyPercent}% of total calories, target is ${targetCarbs}g). High refined carbs can cause rapid blood sugar fluctuations.`,
      suggestedFoods: [
        'Replace second cup of Sada Bhat with Palong/Lal Shak or Sobji',
        'Switch to Lal Bhat (Brown Rice) for higher dietary fiber',
        'Choose Atta Ruti instead of Paratha or White Rice'
      ],
      metrics: { actual: actualCarbs, target: targetCarbs, ratio, energyPercent: carbEnergyPercent },
    };
  }

  // Case B: Very Low Carbs
  if (ratio < NUTRITION_THRESHOLDS.CARB_DEFICIT_RATIO && actualCarbs > 0) {
    return {
      id: 'rule_carb_low',
      category: 'carbs',
      type: 'info',
      priority: 3,
      title: 'Low Carbohydrate Intake',
      message: 'Your carbohydrate intake is noticeably below your target. Carbohydrates provide primary brain and muscle glycogen energy.',
      explanation: `Consumed ${actualCarbs}g out of ${targetCarbs}g target (${Math.round(ratio * 100)}%). If experiencing afternoon fatigue, consider adding whole grains or fruit.`,
      suggestedFoods: [
        'Oats or Atta Ruti',
        'Ripe Banana (Kola) or Papaya',
        'Lal Bhat (Red Rice) or Sweet Potato'
      ],
      metrics: { actual: actualCarbs, target: targetCarbs, ratio, energyPercent: carbEnergyPercent },
    };
  }

  // Case C: Balanced Carbs
  return {
    id: 'rule_carb_optimal',
    category: 'carbs',
    type: 'success',
    priority: 3,
    title: 'Balanced Carbohydrate Intake',
    message: 'Your carbohydrate intake is well aligned with your daily energy requirements.',
    explanation: `Carbohydrate intake of ${actualCarbs}g provides balanced glycogen support without exceeding caloric limits.`,
    metrics: { actual: actualCarbs, target: targetCarbs, ratio, energyPercent: carbEnergyPercent },
  };
}

/**
 * 4. Evaluates Fat Intake vs Target
 */
export function evaluateFatRule(actualFat, targetFat, actualCalories = 0) {
  if (!targetFat || targetFat <= 0) return null;

  const ratio = actualFat / targetFat;
  const delta = Math.round(actualFat - targetFat);
  const fatCalories = actualFat * 9;
  const fatEnergyPercent = actualCalories > 0 ? Math.round((fatCalories / actualCalories) * 100) : 0;

  // Case A: High Fat Intake
  if (ratio > NUTRITION_THRESHOLDS.FAT_SURPLUS_RATIO || fatEnergyPercent > NUTRITION_THRESHOLDS.FAT_MAX_ENERGY_PERCENT) {
    return {
      id: 'rule_fat_high',
      category: 'fat',
      type: 'warning',
      priority: 2,
      title: 'High Dietary Fat Detected',
      message: 'Your fat intake exceeds the recommended range. In traditional cooking, hidden cooking oil, ghee, and deep-fried snacks quickly elevate fat calories.',
      explanation: `Fat accounts for ${actualFat}g (${fatEnergyPercent}% of your total daily calories, recommended upper bound is ${NUTRITION_THRESHOLDS.FAT_MAX_ENERGY_PERCENT}%). Each gram of fat contains 9 kcal.`,
      suggestedFoods: [
        'Limit added cooking oil / mustard oil to 1-2 teaspoons per curry',
        'Avoid deep-fried snacks (Singara, Piaju, Beguni, Mughlai)',
        'Opt for steamed, boiled, or grilled fish/chicken over heavy bhuna gravy'
      ],
      metrics: { actual: actualFat, target: targetFat, ratio, energyPercent: fatEnergyPercent },
    };
  }

  // Case B: Very Low Fat Intake
  if (ratio < NUTRITION_THRESHOLDS.FAT_DEFICIT_RATIO && actualFat > 0) {
    return {
      id: 'rule_fat_low',
      category: 'fat',
      type: 'info',
      priority: 3,
      title: 'Low Dietary Fat Intake',
      message: 'Your dietary fat is lower than recommended. Essential fats are required for hormone production and absorbing vitamins A, D, E, and K.',
      explanation: `Logged ${actualFat}g fat vs ${targetFat}g target (${Math.round(ratio * 100)}%). Incorporate small amounts of healthy fats.`,
      suggestedFoods: [
        'Mixed nuts (peanuts, almonds)',
        'Whole egg yolk',
        'Fatty fish (Ilish, Rui)'
      ],
      metrics: { actual: actualFat, target: targetFat, ratio, energyPercent: fatEnergyPercent },
    };
  }

  // Case C: Optimal Fat Intake
  return {
    id: 'rule_fat_optimal',
    category: 'fat',
    type: 'success',
    priority: 3,
    title: 'Healthy Fat Balance',
    message: 'Your dietary fat intake is in a healthy, balanced range.',
    explanation: `Fat intake of ${actualFat}g supplies essential fatty acids while respecting caloric boundaries.`,
    metrics: { actual: actualFat, target: targetFat, ratio, energyPercent: fatEnergyPercent },
  };
}

/**
 * 5. Evaluates Recent Food Patterns
 * Detects frequent fried foods, sugary drinks, low vegetable intake, etc.
 */
export function evaluateFoodPatterns(recentFoodNames = [], loggedMeals = {}) {
  const patternRecommendations = [];
  const foodList = (recentFoodNames || []).map((name) => String(name).toLowerCase());

  // Helper matcher
  const countMatches = (keywords) => {
    return foodList.filter((food) => keywords.some((kw) => food.includes(kw))).length;
  };

  const friedCount = countMatches(FRIED_SNACK_KEYWORDS);
  const sugarDrinkCount = countMatches(SUGARY_DRINK_KEYWORDS);
  const vegCount = countMatches(VEGETABLE_KEYWORDS);
  const leanProteinCount = countMatches(LEAN_PROTEIN_KEYWORDS);

  // Pattern A: Frequent Fried Snacks
  if (friedCount >= 2) {
    patternRecommendations.push({
      id: 'pattern_fried_snacks',
      category: 'pattern',
      type: 'warning',
      priority: 2,
      title: 'Frequent Fried Snacks Detected',
      message: 'Multiple deep-fried snacks (such as singara, samosa, or piaju) were logged recently. These are high in trans fats and dense calories.',
      explanation: `Detected ${friedCount} fried snack entries. Street-fried items absorb significant reused oil.`,
      suggestedFoods: [
        'Swap afternoon singara for Muri + Boiled Chana',
        'Choose a boiled egg and seasonal fruit (Peyara / Banana)',
        'Try Roasted Chholar Boot instead of Chanachur'
      ],
    });
  }

  // Pattern B: Liquid Sugar / Sugary Drinks
  if (sugarDrinkCount >= 2) {
    patternRecommendations.push({
      id: 'pattern_sugary_drinks',
      category: 'pattern',
      type: 'warning',
      priority: 2,
      title: 'Frequent Sugary Drinks Logged',
      message: 'Sweetened beverages (like dudh cha with sugar or soda) add fast-absorbing liquid calories with low satiety.',
      explanation: `Detected ${sugarDrinkCount} sweet beverage entries. Liquid calories do not trigger satiety signals effectively.`,
      suggestedFoods: [
        'Switch to Rong Cha (Black Tea) or Lemon Ginger Tea with zero added sugar',
        'Daab-er Pani (Fresh Green Coconut Water) for natural electrolytes',
        'Plain water infused with cucumber or mint'
      ],
    });
  }

  // Pattern C: Low Vegetable & Fiber Presence
  if (foodList.length >= 4 && vegCount === 0) {
    patternRecommendations.push({
      id: 'pattern_low_vegetables',
      category: 'pattern',
      type: 'tip',
      priority: 3,
      title: 'Add More Fiber & Leafy Greens',
      message: 'No vegetables or leafy greens (shak) were identified in your recent entries. Fiber is crucial for digestive health and cholesterol regulation.',
      explanation: 'Zero vegetable entries detected across logged meals.',
      suggestedFoods: [
        'Add Palong Shak or Lal Shak to lunch',
        'Enjoy Begun or Dim Bhorta with minimal raw mustard oil',
        'Include fresh cucumber and tomato salad with main meals'
      ],
    });
  }

  // Pattern D: Meal Timing & Skipping (if meals structure provided)
  if (loggedMeals) {
    const breakfastItems = loggedMeals.breakfast || [];
    const lunchItems = loggedMeals.lunch || [];
    const dinnerItems = loggedMeals.dinner || [];

    if (breakfastItems.length === 0 && (lunchItems.length > 0 || dinnerItems.length > 0)) {
      patternRecommendations.push({
        id: 'pattern_skipped_breakfast',
        category: 'pattern',
        type: 'tip',
        priority: 3,
        title: 'Morning Breakfast Skipping',
        message: 'You logged meals later in the day without breakfast. Skipping breakfast can lead to mid-day cravings and evening overeating.',
        explanation: 'No breakfast foods logged while later meals were recorded.',
        suggestedFoods: [
          'Quick 5-minute breakfast: 1 Boiled Egg + 1 Banana (Kola)',
          '1 Atta Ruti with a cup of Patla Masoor Dal',
          'A bowl of oats with milk and nuts'
        ],
      });
    }
  }

  return patternRecommendations;
}

/**
 * 6. Evaluates User Weight Goal Alignment
 */
export function evaluateGoalAlignment(intakeTotals, targets, userGoal = 'maintain') {
  const goalId = typeof userGoal === 'object' ? userGoal.id || 'maintain' : String(userGoal);
  const calories = intakeTotals.calories || 0;
  const targetCalories = targets.calories || targets.targetCalories || 2000;
  const ratio = targetCalories > 0 ? calories / targetCalories : 1;

  if (calories === 0) {
    return {
      goalId,
      status: 'pending',
      summary: 'Log your first meal today to see personalized goal progress.',
    };
  }

  if (goalId.includes('loss')) {
    if (ratio <= 1.05) {
      return {
        goalId,
        status: 'on_track',
        summary: 'You are maintaining the necessary energy deficit for steady, healthy fat loss.',
      };
    }
    return {
      goalId,
      status: 'off_track',
      summary: 'Calorie intake currently exceeds your fat-loss deficit. Focus on high-volume greens and lean protein to feel full on fewer calories.',
    };
  }

  if (goalId.includes('gain')) {
    if (ratio >= 0.95) {
      return {
        goalId,
        status: 'on_track',
        summary: 'You are consistently hitting your caloric surplus to support muscular hypertrophy and weight gain.',
      };
    }
    return {
      goalId,
      status: 'off_track',
      summary: 'You are under your caloric surplus target. Add healthy fats and carbohydrate sources to ensure adequate energy for growth.',
    };
  }

  // Maintenance
  if (ratio >= 0.90 && ratio <= 1.10) {
    return {
      goalId,
      status: 'on_track',
      summary: 'Your energy intake is perfectly balanced with your daily metabolic expenditure for weight maintenance.',
    };
  }

  return {
    goalId,
    status: 'needs_adjustment',
    summary: 'Slight adjustments to portion size will help keep your body weight stable.',
  };
}

// =============================================================================
// MAIN RECOMMENDATION GENERATOR
// =============================================================================

/**
 * Generates comprehensive, deterministic, rule-based recommendations
 * 
 * @param {Object} params
 * @param {Object} params.intake - Current intake totals { calories, protein, carbs, fat }
 * @param {Object} params.targets - User targets { calories/targetCalories, protein, carbs, fat } or nested { macros }
 * @param {string|Object} [params.goal='maintain'] - User weight goal ('weight_loss', 'maintain', 'muscle_gain', etc.)
 * @param {Array} [params.recentFoodNames=[]] - List of food names logged recently
 * @param {Object} [params.loggedMeals={}] - Meals object { breakfast: [], lunch: [], dinner: [], snacks: [] }
 * @param {number} [params.daysCount=1] - Number of days analyzed (1 for daily, >1 for multi-day average)
 * @returns {Object} Structured recommendation report
 */
export function generateRecommendations({
  intake = {},
  targets = {},
  goal = 'maintain',
  recentFoodNames = [],
  loggedMeals = {},
  daysCount = 1,
} = {}) {
  // Normalize intake values
  const actualCalories = Math.round(Number(intake.calories || intake.avgCalories) || 0);
  const actualProtein = Math.round(Number(intake.protein || intake.avgProtein) || 0);
  const actualCarbs = Math.round(Number(intake.carbs || intake.avgCarbs) || 0);
  const actualFat = Math.round(Number(intake.fat || intake.avgFat) || 0);

  // Normalize target values
  const targetCalories = Math.round(Number(targets.calories || targets.targetCalories) || 2000);
  const targetProtein = Math.round(Number(targets.protein || targets.macros?.protein?.grams) || 120);
  const targetCarbs = Math.round(Number(targets.carbs || targets.macros?.carbohydrates?.grams) || 250);
  const targetFat = Math.round(Number(targets.fat || targets.macros?.fat?.grams) || 60);

  const goalId = typeof goal === 'object' ? goal.id || 'maintain' : String(goal);

  // If nothing logged yet, return a clean starter prompt
  if (actualCalories === 0) {
    return {
      overview: 'No foods recorded yet today.',
      status: 'idle',
      goalAlignment: { goalId, status: 'pending', summary: 'Start logging meals to receive personalized recommendations.' },
      recommendations: [
        {
          id: 'rule_start_logging',
          category: 'general',
          type: 'info',
          priority: 1,
          title: 'Start Logging Meals',
          message: 'Log your breakfast or first meal to see real-time calorie balance and macro recommendations.',
          explanation: 'Recommendations activate as soon as meal entries are recorded.',
        },
      ],
      suggestedSwaps: getRecommendedSwaps([]),
      actionableHabits: getActionableHabits(),
    };
  }

  const recommendations = [];

  // 1. Calorie Rule
  const calRec = evaluateCalorieRule(actualCalories, targetCalories, goalId, daysCount);
  if (calRec) recommendations.push(calRec);

  // 2. Protein Rule
  const protRec = evaluateProteinRule(actualProtein, targetProtein, goalId);
  if (protRec) recommendations.push(protRec);

  // 3. Carbohydrate Rule
  const carbRec = evaluateCarbRule(actualCarbs, targetCarbs, actualCalories);
  if (carbRec) recommendations.push(carbRec);

  // 4. Fat Rule
  const fatRec = evaluateFatRule(actualFat, targetFat, actualCalories);
  if (fatRec) recommendations.push(fatRec);

  // 5. Recent Food Patterns
  const patternRecs = evaluateFoodPatterns(recentFoodNames, loggedMeals);
  patternRecs.forEach((r) => recommendations.push(r));

  // 6. User's Weight Goal Alignment
  const goalAlignment = evaluateGoalAlignment(
    { calories: actualCalories, protein: actualProtein, carbs: actualCarbs, fat: actualFat },
    { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat },
    goalId
  );

  // Sort by priority (1 = Highest, 3 = Lowest)
  recommendations.sort((a, b) => (a.priority || 3) - (b.priority || 3));

  // Primary highlight message (the single most important takeaway for the user)
  const primaryRecommendation = recommendations[0] || null;

  // Curate contextual swaps based on logged foods
  const suggestedSwaps = getRecommendedSwaps(recentFoodNames);

  return {
    overview: primaryRecommendation ? primaryRecommendation.message : 'Your nutrition is on track.',
    status: primaryRecommendation ? primaryRecommendation.type : 'success',
    primaryRecommendation,
    recommendations,
    goalAlignment,
    suggestedSwaps,
    actionableHabits: getActionableHabits(),
    analyzedTotals: {
      calories: actualCalories,
      protein: actualProtein,
      carbs: actualCarbs,
      fat: actualFat,
    },
    targets: {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
    },
  };
}

// =============================================================================
// SMART FOOD SWAPS CATALOG & HABITS
// =============================================================================

export const FOOD_SWAPS = [
  {
    keyword: 'white bread',
    originalName: 'White Bread / Shada Paoruti',
    suggestedName: '100% Whole Wheat Atta Ruti',
    benefit: 'Adds 3g fiber and eliminates refined flour sugar spikes.',
    macroDelta: '+3.1g fiber, -40 kcal',
  },
  {
    keyword: 'singara',
    originalName: 'Singara / Somosa (Fried Snack)',
    suggestedName: 'Boiled Chana (Chickpeas) + Puffed Rice (Muri)',
    benefit: 'Replaces reused cooking oil with 7g plant protein and high satiety.',
    macroDelta: '-14g fat, +5g protein',
  },
  {
    keyword: 'white rice',
    originalName: 'Extra Sada Bhat (White Rice)',
    suggestedName: 'Lal Bhat (Red Rice) or Extra Palong Shak',
    benefit: 'Higher fiber and micronutrients; cuts glycemic load.',
    macroDelta: '+2.5g fiber, -30 kcal',
  },
  {
    keyword: 'dudh cha',
    originalName: 'Dudh Cha (Sweetened Milk Tea)',
    suggestedName: 'Rong Cha (Black Tea) with Ginger & Lemon',
    benefit: 'Eliminates 12-15g refined cane sugar and unnecessary calories.',
    macroDelta: '-60 kcal, -14g sugar',
  },
  {
    keyword: 'soda',
    originalName: 'Sugary Carbonated Soda',
    suggestedName: 'Daab-er Pani (Fresh Coconut Water) or Lemon Water',
    benefit: 'Zero artificial syrups; provides natural potassium and hydration.',
    macroDelta: '-140 kcal, -35g refined sugar',
  },
  {
    keyword: 'beef bhuna',
    originalName: 'Beef Bhuna (Oily Gravy)',
    suggestedName: 'Grilled Chicken Breast or Rui Fish Jhol',
    benefit: 'Cuts saturated fats by half while providing high-grade lean protein.',
    macroDelta: '-16g fat, +8g protein',
  },
  {
    keyword: 'paratha',
    originalName: 'Fried Paratha / Porota',
    suggestedName: 'Dry Baked Atta Ruti',
    benefit: 'Eliminates 8-12g of pan-fried oil per piece.',
    macroDelta: '-90 kcal, -10g fat',
  },
];

export function getRecommendedSwaps(loggedFoodNames = []) {
  const matched = [];
  const lowerNames = (loggedFoodNames || []).map((n) => String(n).toLowerCase());

  FOOD_SWAPS.forEach((swap) => {
    const isLogged = lowerNames.some((n) => n.includes(swap.keyword));
    if (isLogged) {
      matched.push({ ...swap, isUserLogged: true });
    }
  });

  // Always supply at least 3 smart swaps
  FOOD_SWAPS.forEach((swap) => {
    if (matched.length < 3 && !matched.some((m) => m.originalName === swap.originalName)) {
      matched.push({ ...swap, isUserLogged: false });
    }
  });

  return matched;
}

export function getActionableHabits() {
  return [
    {
      title: 'Eat Protein with Every Meal',
      description: 'Include eggs, fish, chicken, or lentils in each main meal to maintain muscle tissue and steady satiety.',
    },
    {
      title: 'Hydrate Before Meals',
      description: 'Drinking a 250ml glass of water 15 minutes before meals aids digestion and naturally prevents overeating.',
    },
    {
      title: 'Prioritize Whole Fiber Volume',
      description: 'Include leafy greens (shak), fresh salads, or oats daily to support metabolic stability.',
    },
  ];
}
