/**
 * Verification test for NutriScan revised structure
 */

import { calculateBMR, calculateTDEE, calculateTargetCalories } from '../calorieCalculator.js';
import { calculateMacroTargets, generateNutritionProfile, calculateDailyTotals } from '../macroCalculator.js';
import { calculateNutritionScore } from '../nutritionScore.js';
import { analyzeDailyNutrition, analyzePatterns } from '../nutritionAnalyzer.js';
import { getRecommendedSwaps } from '../recommendationEngine.js';
import { FOODS } from '../../data/foods.js';

console.log('🧪 Verifying NutriScan Modular Utilities & Data...');

let failed = 0;
function check(cond, msg) {
  if (cond) console.log(`  ✅ PASS: ${msg}`);
  else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Food Dataset
check(FOODS.length >= 35, `Local food database loaded with ${FOODS.length} items`);

// 2. BMR (Mifflin-St Jeor)
const maleBmr = calculateBMR(70, 175, 25, 'male');
check(maleBmr === 1674, `Male BMR Mifflin-St Jeor formula (1674 kcal)`);

const femaleBmr = calculateBMR(60, 165, 25, 'female');
check(femaleBmr === 1345, `Female BMR Mifflin-St Jeor formula (1345 kcal)`);

// 3. TDEE & Target Calories with Safety Floor
const tdee = calculateTDEE(maleBmr, 'moderate');
check(tdee === 2595, `TDEE with Moderate PAL (${tdee} kcal)`);

const safeDeficit = calculateTargetCalories(1300, 'lose_fast', 'female');
check(safeDeficit === 1200, `Female safety floor enforced at 1200 kcal (${safeDeficit})`);

// 4. Macro Targets
const macros = calculateMacroTargets(2000, 70, 'maintain');
check(macros.protein.grams === 112, `Protein calculated correctly (${macros.protein.grams}g)`);
check(macros.fat.grams === 62, `Fat calculated correctly (${macros.fat.grams}g)`);

// 5. Daily Nutrition Analyzer & Imbalance Detection
const testTotals = { calories: 2400, protein: 50, carbs: 240, fat: 120, fiber: 8 };
const testTargets = {
  targetCalories: 2000,
  macros: { protein: { grams: 120 }, carbs: { grams: 220 }, fat: { grams: 65 } },
  targetWaterMl: 2500,
};

const diagnostics = analyzeDailyNutrition(testTotals, testTargets, 500);
check(diagnostics.problems.some((p) => p.id === 'prob_cal_excess'), 'Detects calorie budget excess');
check(diagnostics.problems.some((p) => p.id === 'prob_low_protein'), 'Detects protein deficiency');
check(diagnostics.problems.some((p) => p.id === 'prob_high_fat'), 'Detects high dietary fat percentage');
check(diagnostics.problems.some((p) => p.id === 'prob_low_water'), 'Detects hydration deficit');

// 6. Recommendation Swaps
const swaps = getRecommendedSwaps(['white bread', 'potato chips']);
check(swaps.some((s) => s.originalName === 'White Bread' && s.isUserLogged), 'Detects user logged white bread and provides swap');
check(swaps.some((s) => s.originalName === 'Potato Chips' && s.isUserLogged), 'Detects user logged chips and provides swap');

if (failed === 0) {
  console.log('\n🎉 ALL RESTRUCTURED MODULES AND DATA VERIFIED SUCCESSFULLY!\n');
} else {
  console.error(`\n⚠️ ${failed} test(s) failed.\n`);
}

process.exit(failed === 0 ? 0 : 1);
