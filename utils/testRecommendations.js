/**
 * NutriScan Recommendation Engine Test Suite
 * 
 * Verifies that the rule-based recommendation engine produces exact, deterministic,
 * and explainable outputs according to clinical thresholds and user guidelines.
 */

import {
  generateRecommendations,
  evaluateCalorieRule,
  evaluateProteinRule,
  evaluateCarbRule,
  evaluateFatRule,
  evaluateFoodPatterns,
  evaluateGoalAlignment,
} from './recommendationEngine.js';

let passedCount = 0;
let totalCount = 0;

function assert(condition, message, detail = '') {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message} - ${detail}`);
  }
}

console.log('================================================================');
console.log('🧠 NUTRISCAN RULE-BASED RECOMMENDATION ENGINE: TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST CASE 1: Consistently High Calories (User Example Verification)
// -----------------------------------------------------------------------------
console.log('----------------------------------------------------------------');
console.log('📋 TEST CASE 1: Consistently High Calories Scenario');
console.log('----------------------------------------------------------------');
{
  const result = generateRecommendations({
    intake: { calories: 2500, protein: 90, carbs: 320, fat: 85 },
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    goal: 'weight_loss',
    daysCount: 7, // multi-day average
  });

  assert(
    result.recommendations.some((r) => r.id === 'rule_cal_high'),
    'High calorie rule triggered',
    JSON.stringify(result.recommendations)
  );

  const calRule = result.recommendations.find((r) => r.id === 'rule_cal_high');
  assert(
    calRule.message.includes('Your average calorie intake is above your target. Consider reducing portion sizes'),
    'Message includes required wording on reducing portion sizes',
    calRule.message
  );
  assert(
    calRule.explanation.includes('2500 kcal') && calRule.explanation.includes('+25%'),
    'Explanation contains deterministic mathematical proof (+25%)',
    calRule.explanation
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 2: Low Protein Intake (User Example Verification)
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 2: Low Protein Intake Scenario');
console.log('----------------------------------------------------------------');
{
  const result = generateRecommendations({
    intake: { calories: 1900, protein: 60, carbs: 270, fat: 55 },
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    goal: 'weight_loss',
  });

  assert(
    result.recommendations.some((r) => r.id === 'rule_prot_low'),
    'Low protein rule triggered',
    JSON.stringify(result.recommendations)
  );

  const protRule = result.recommendations.find((r) => r.id === 'rule_prot_low');
  assert(
    protRule.message === 'Your protein intake is below your target. Consider adding eggs, fish, chicken, milk or lentils.',
    'Matches exact user requested wording for low protein',
    protRule.message
  );
  assert(
    Array.isArray(protRule.suggestedFoods) && protRule.suggestedFoods.length >= 4,
    'Provides concrete protein suggestions with portion macros',
    JSON.stringify(protRule.suggestedFoods)
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 3: Appropriate Calories (User Example Verification)
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 3: Appropriate / On-Target Calories Scenario');
console.log('----------------------------------------------------------------');
{
  const result = generateRecommendations({
    intake: { calories: 1980, protein: 122, carbs: 245, fat: 58 },
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    goal: 'maintain',
  });

  const calRule = result.recommendations.find((r) => r.id === 'rule_cal_optimal');
  assert(
    Boolean(calRule),
    'Optimal calorie rule triggered',
    JSON.stringify(result.recommendations)
  );
  assert(
    calRule.message === 'Your calorie intake is currently close to your target.',
    'Matches exact user requested wording for appropriate calories',
    calRule?.message
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 4: High Fat & Street Food Patterns (Bangladeshi Diet Context)
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 4: High Fat & Fried Food Pattern Detection');
console.log('----------------------------------------------------------------');
{
  const result = generateRecommendations({
    intake: { calories: 2200, protein: 80, carbs: 210, fat: 110 }, // 110g fat = 990 kcal = 45% of calories
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    recentFoodNames: [
      'Singara (Fried potato pastry)',
      'Beguni (Fried eggplant in batter)',
      'Beef Bhuna',
      'Sweet Milk Tea (Dudh Cha)'
    ],
    goal: 'weight_loss',
  });

  const fatRule = result.recommendations.find((r) => r.id === 'rule_fat_high');
  assert(
    Boolean(fatRule),
    'High fat rule detected (>35% energy share)',
    JSON.stringify(fatRule)
  );

  const friedPattern = result.recommendations.find((r) => r.id === 'pattern_fried_snacks');
  assert(
    Boolean(friedPattern),
    'Fried snack pattern recognized (Singara + Beguni)',
    JSON.stringify(friedPattern)
  );
  assert(
    friedPattern.suggestedFoods.some((f) => f.includes('Muri') || f.includes('Chana')),
    'Suggests healthy Bangladeshi alternatives (Muri + Chana)',
    JSON.stringify(friedPattern.suggestedFoods)
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 5: Sugary Drinks & Low Vegetables Pattern
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 5: Sugary Drinks & Fiber Deficiency Pattern');
console.log('----------------------------------------------------------------');
{
  const result = generateRecommendations({
    intake: { calories: 1800, protein: 75, carbs: 260, fat: 50 },
    targets: { calories: 1800, protein: 110, carbs: 220, fat: 50 },
    recentFoodNames: [
      'Sada Bhat',
      'Rong Cha with Sugar',
      'Dudh Cha',
      'Biscuits'
    ],
    goal: 'maintain',
  });

  const drinkPattern = result.recommendations.find((r) => r.id === 'pattern_sugary_drinks');
  assert(
    Boolean(drinkPattern),
    'Sugary drink pattern flagged (multiple sweetened teas)',
    JSON.stringify(drinkPattern)
  );

  const vegPattern = result.recommendations.find((r) => r.id === 'pattern_low_vegetables');
  assert(
    Boolean(vegPattern),
    'Absence of leafy greens / vegetables flagged',
    JSON.stringify(vegPattern)
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 6: Muscle Gain Goal Alignment
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 6: Muscle Gain Caloric Surplus Evaluation');
console.log('----------------------------------------------------------------');
{
  // Under-eating for a muscle-gain goal
  const result = generateRecommendations({
    intake: { calories: 2100, protein: 110, carbs: 280, fat: 60 },
    targets: { calories: 2900, protein: 160, carbs: 370, fat: 85 },
    goal: 'muscle_gain',
  });

  assert(
    result.goalAlignment.status === 'off_track',
    'Flagged as off-track when calories are under for muscle gain',
    result.goalAlignment.summary
  );
  assert(
    result.goalAlignment.summary.includes('caloric surplus'),
    'Goal summary emphasizes caloric surplus requirement',
    result.goalAlignment.summary
  );
}

// -----------------------------------------------------------------------------
// TEST CASE 7: Determinism & Pure Functionality Verification
// -----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('📋 TEST CASE 7: Determinism & Zero AI Dependency Check');
console.log('----------------------------------------------------------------');
{
  const run1 = generateRecommendations({
    intake: { calories: 2400, protein: 70, carbs: 330, fat: 80 },
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    goal: 'weight_loss',
  });

  const run2 = generateRecommendations({
    intake: { calories: 2400, protein: 70, carbs: 330, fat: 80 },
    targets: { calories: 2000, protein: 120, carbs: 250, fat: 60 },
    goal: 'weight_loss',
  });

  assert(
    JSON.stringify(run1) === JSON.stringify(run2),
    '100% Deterministic: Consecutive runs produce identical byte-for-byte JSON outputs',
    'Divergence detected!'
  );
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 RECOMMENDATION ENGINE TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
if (passedCount === totalCount) {
  console.log('🎉 ALL RULE-BASED RECOMMENDATION CHECKS PASSED WITH 100% SUCCESS!');
} else {
  console.log('⚠️ SOME RECOMMENDATION TESTS FAILED');
}
console.log('================================================================\n');

process.exit(passedCount === totalCount ? 0 : 1);
