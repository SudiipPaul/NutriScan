/**
 * Comprehensive Test & Verification Suite for NutriScan Nutrition Engine
 * 
 * Run this directly via Node.js to manually verify all 6 required calculations:
 * Command: node utils/testCalculations.js
 */

import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateProteinTarget,
  calculateFatTarget,
  calculateCarbTarget,
  calculateAllMacros,
} from './index.js';

console.log('================================================================');
console.log('🔬 NUTRISCAN NUTRITION CALCULATION ENGINE: VERIFICATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assertEqual(actual, expected, testName, tolerance = 0) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  const passed = diff <= tolerance;

  if (passed) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
    console.log(`     Output: ${actual} | Expected: ${expected}${tolerance ? ` (tolerance ±${tolerance})` : ''}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Got: ${actual} | Expected: ${expected}`);
  }
}

// ================================================================
// TEST CASE 1: Standard Male University Student
// Profile: 22 years old, 74 kg, 178 cm, Male
// Activity: Moderate (PAL = 1.55)
// Goal: Mild Weight Loss (-250 kcal/day, 1.8 g protein/kg)
// ================================================================
console.log('----------------------------------------------------------------');
console.log('📋 TEST CASE 1: Male Student (74kg, 178cm, 22yo, Moderate, Mild Loss)');
console.log('----------------------------------------------------------------');

// 1. BMR Manual Check:
// Formula: (10 × 74) + (6.25 × 178) - (5 × 22) + 5
//        = 740 + 1112.5 - 110 + 5 = 1747.5 -> 1748 kcal
const case1_bmr = calculateBMR(74, 178, 22, 'male');
assertEqual(case1_bmr, 1748, 'Case 1 - BMR (Mifflin-St Jeor)');

// 2. TDEE Manual Check:
// Formula: 1748 × 1.55 = 2709.4 -> 2709 kcal
const case1_tdee = calculateTDEE(case1_bmr, 'moderate');
assertEqual(case1_tdee, 2709, 'Case 1 - TDEE (PAL 1.55x)');

// 3. Goal Calorie Target:
// Formula: 2709 - 250 = 2459 kcal
const case1_targetCals = calculateTargetCalories(case1_tdee, 'lose_mild', 'male');
assertEqual(case1_targetCals, 2459, 'Case 1 - Target Daily Calories (-250 kcal deficit)');

// 4. Protein Target:
// Formula: 74 kg × 1.8 g/kg = 133.2 -> 133 g (133 × 4 = 532 kcal)
const case1_protein = calculateProteinTarget(74, 'lose_mild');
assertEqual(case1_protein.grams, 133, 'Case 1 - Protein Target (1.8 g/kg)');
assertEqual(case1_protein.calories, 532, 'Case 1 - Protein Caloric Value (4 kcal/g)');

// 5. Fat Target:
// Formula: 2459 × 28% = 688.52 kcal -> 689 kcal
// Grams: 689 ÷ 9 = 76.55 -> 77 g
const case1_fat = calculateFatTarget(case1_targetCals, 0.28);
assertEqual(case1_fat.grams, 77, 'Case 1 - Fat Target (28% of total calories, 9 kcal/g)');
assertEqual(case1_fat.calories, 689, 'Case 1 - Fat Caloric Value');

// 6. Carbohydrate Target:
// Formula: 2459 - 532 (protein) - 689 (fat) = 1238 kcal
// Grams: 1238 ÷ 4 = 309.5 -> 310 g
const case1_carbs = calculateCarbTarget(case1_targetCals, case1_protein.calories, case1_fat.calories);
assertEqual(case1_carbs.grams, 310, 'Case 1 - Carbohydrate Target (Remainder at 4 kcal/g)');
assertEqual(case1_carbs.calories, 1238, 'Case 1 - Carbohydrate Caloric Value');

// Calorie Sum Integrity Check: 532 + 689 + 1238 = 2459
const case1_macroSum = case1_protein.calories + case1_fat.calories + case1_carbs.calories;
assertEqual(case1_macroSum, case1_targetCals, 'Case 1 - Macro Energy Budget Sum matches Target exactly');


// ================================================================
// TEST CASE 2: Female University Student
// Profile: 20 years old, 58 kg, 162 cm, Female
// Activity: Sedentary (PAL = 1.20)
// Goal: Maintain Weight (0 kcal delta, 1.6 g protein/kg)
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 2: Female Student (58kg, 162cm, 20yo, Sedentary, Maintain)');
console.log('----------------------------------------------------------------');

// 1. BMR Manual Check:
// Formula: (10 × 58) + (6.25 × 162) - (5 × 20) - 161
//        = 580 + 1012.5 - 100 - 161 = 1331.5 -> 1332 kcal
const case2_bmr = calculateBMR(58, 162, 20, 'female');
assertEqual(case2_bmr, 1332, 'Case 2 - BMR (Female Mifflin-St Jeor with -161 offset)');

// 2. TDEE Manual Check:
// Formula: 1332 × 1.20 = 1598.4 -> 1598 kcal
const case2_tdee = calculateTDEE(case2_bmr, 'sedentary');
assertEqual(case2_tdee, 1598, 'Case 2 - TDEE (Sedentary 1.2x)');

// 3. Goal Target:
// Maintenance = TDEE = 1598 kcal
const case2_targetCals = calculateTargetCalories(case2_tdee, 'maintain', 'female');
assertEqual(case2_targetCals, 1598, 'Case 2 - Target Daily Calories (Maintenance)');

// 4. Protein Target:
// Formula: 58 kg × 1.6 g/kg = 92.8 -> 93 g (93 × 4 = 372 kcal)
const case2_protein = calculateProteinTarget(58, 'maintain');
assertEqual(case2_protein.grams, 93, 'Case 2 - Protein Target (1.6 g/kg)');

// 5. Fat Target:
// Formula: 1598 × 0.28 = 447.44 -> 447 kcal; 447 / 9 = 49.66 -> 50 g
const case2_fat = calculateFatTarget(case2_targetCals, 0.28);
assertEqual(case2_fat.grams, 50, 'Case 2 - Fat Target (28% of total calories)');

// 6. Carbohydrate Target:
// Formula: 1598 - 372 - 447 = 779 kcal; 779 / 4 = 194.75 -> 195 g
const case2_carbs = calculateCarbTarget(case2_targetCals, case2_protein.calories, case2_fat.calories);
assertEqual(case2_carbs.grams, 195, 'Case 2 - Carbohydrate Target (Remainder budget)');


// ================================================================
// TEST CASE 3: Athletic Bulking Profile
// Profile: 24 years old, 82 kg, 185 cm, Male
// Activity: Very Active (PAL = 1.725)
// Goal: Weight Gain (+500 kcal/day, 2.0 g protein/kg)
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 3: Athletic Bulking (82kg, 185cm, 24yo, Very Active, +500 kcal)');
console.log('----------------------------------------------------------------');

// BMR: 10(82) + 6.25(185) - 5(24) + 5 = 820 + 1156.25 - 120 + 5 = 1861.25 -> 1861 kcal
const case3_bmr = calculateBMR(82, 185, 24, 'male');
assertEqual(case3_bmr, 1861, 'Case 3 - BMR');

// TDEE: 1861 × 1.725 = 3210.22 -> 3210 kcal
const case3_tdee = calculateTDEE(case3_bmr, 'very_active');
assertEqual(case3_tdee, 3210, 'Case 3 - TDEE');

// Target: 3210 + 500 = 3710 kcal
const case3_targetCals = calculateTargetCalories(case3_tdee, 'gain_fast', 'male');
assertEqual(case3_targetCals, 3710, 'Case 3 - Target Daily Calories (+500 surplus)');

// Orchestrated Macro Targets:
const case3_macros = calculateAllMacros(case3_targetCals, 82, 'gain_fast');
assertEqual(case3_macros.protein.grams, 164, 'Case 3 - Protein (82kg × 2.0 g/kg = 164g)');
assertEqual(case3_macros.fat.grams, 115, 'Case 3 - Fat (3710 × 0.28 / 9 = 115g)');
assertEqual(case3_macros.carbs.grams, 504, 'Case 3 - Carbohydrates (Remainder: 2015 kcal / 4 = 504g)');


// ================================================================
// TEST CASE 4: Biological Safety Floor Trigger (Female)
// Low body weight (46kg, 150cm, 30yo) on aggressive deficit (-500 kcal)
// Unclamped target would be ~880 kcal, but safety floor MUST enforce 1,200 kcal!
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 4: Clinical Safety Floor Trigger (Female Minimum 1,200 kcal)');
console.log('----------------------------------------------------------------');

// BMR: 10(46) + 6.25(150) - 5(30) - 161 = 460 + 937.5 - 150 - 161 = 1086.5 -> 1087 kcal
const case4_bmr = calculateBMR(46, 150, 30, 'female');
assertEqual(case4_bmr, 1087, 'Case 4 - Low baseline female BMR');

// TDEE: 1087 × 1.20 = 1304 kcal
const case4_tdee = calculateTDEE(case4_bmr, 'sedentary');
assertEqual(case4_tdee, 1304, 'Case 4 - Sedentary TDEE (1304 kcal)');

// Raw target with -500 deficit would be 804 kcal (medically dangerous).
// calculateTargetCalories MUST clamp to 1200 kcal.
const case4_safeTarget = calculateTargetCalories(case4_tdee, 'lose_fast', 'female');
assertEqual(case4_safeTarget, 1200, 'Case 4 - Clamped to Female Safety Minimum of 1,200 kcal');


// ================================================================
// TEST CASE 5: Biological Safety Floor Trigger (Male)
// Light male (55kg, 160cm, 35yo, Sedentary) with -500 deficit
// Unclamped would be 1416 - 500 = 916 kcal. Safety floor MUST enforce 1,500 kcal!
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 5: Clinical Safety Floor Trigger (Male Minimum 1,500 kcal)');
console.log('----------------------------------------------------------------');

const case5_bmr = calculateBMR(55, 160, 35, 'male');
const case5_tdee = calculateTDEE(case5_bmr, 'sedentary');
const case5_safeTarget = calculateTargetCalories(case5_tdee, 'lose_fast', 'male');
assertEqual(case5_safeTarget, 1500, 'Case 5 - Clamped to Male Safety Minimum of 1,500 kcal');


// ================================================================
// FINAL VERIFICATION SUMMARY
// ================================================================
console.log('\n================================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL NUTRITION CALCULATION FUNCTIONS PASSED WITH 100% PRECISION!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} TEST(S) FAILED.`);
}
console.log('================================================================\n');

process.exit(passedTests === totalTests ? 0 : 1);
