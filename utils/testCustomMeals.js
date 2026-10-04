/**
 * Test Custom Meal Configuration and Aggregation
 */

import { buildMealsConfig, getUserMeals } from '../constants/mealConfig.js';
import { calculateDailyTotals } from './macroCalculator.js';

console.log('================================================================');
console.log('🧪 TESTING CUSTOMIZABLE MEAL SYSTEM');
console.log('================================================================\n');

// Test 1: Preset Generation for 2, 3, 4, 5, 6 meals
const counts = [2, 3, 4, 5, 6];
counts.forEach((c) => {
  const preset = buildMealsConfig(c);
  if (preset.length === c) {
    console.log(`  ✅ PASS: Preset for ${c} meals generated ${preset.length} items (${preset.map((m) => m.name).join(', ')})`);
  } else {
    console.error(`  ❌ FAIL: Preset for ${c} meals produced ${preset.length} items`);
    process.exit(1);
  }
});

// Test 2: Arbitrary Count (e.g. 7 meals)
const custom7 = buildMealsConfig(7);
if (custom7.length === 7 && custom7[6].name === 'Meal 7') {
  console.log('  ✅ PASS: Arbitrary meal count (7 meals) generated dynamically.');
} else {
  console.error('  ❌ FAIL: Arbitrary meal count test failed.');
  process.exit(1);
}

// Test 3: Daily Totals Calculation with Dynamic Meals
const testMeals = {
  meal_1: [{ calories: 300, protein: 15, carbs: 40, fat: 8, fiber: 3 }],
  meal_2: [{ calories: 500, protein: 30, carbs: 60, fat: 12, fiber: 5 }],
  meal_3: [{ calories: 200, protein: 10, carbs: 25, fat: 5, fiber: 2 }],
  meal_4: [{ calories: 450, protein: 25, carbs: 55, fat: 10, fiber: 4 }],
};

const totals = calculateDailyTotals(testMeals);
const expectedCals = 300 + 500 + 200 + 450; // 1450
const expectedProt = 15 + 30 + 10 + 25; // 80

if (totals.calories === expectedCals && totals.protein === expectedProt) {
  console.log(`  ✅ PASS: Dynamic multi-meal totals aggregated correctly (Calories: ${totals.calories} kcal, Protein: ${totals.protein}g)`);
} else {
  console.error(`  ❌ FAIL: Expected ${expectedCals} kcal but got ${totals.calories}`);
  process.exit(1);
}

console.log('\n🎉 ALL CUSTOM MEAL TESTS PASSED SUCCESSFULLY!\n');
