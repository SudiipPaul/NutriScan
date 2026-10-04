/**
 * Nutrition Diet Quality Score Calculator (0 - 100)
 */

export function calculateNutritionScore(dailyTotals, userTargets, waterIntakeMl = 0) {
  const { calories = 0, protein = 0, fat = 0 } = dailyTotals;
  const targetCalories = userTargets?.targetCalories || 2000;
  const targetProtein = userTargets?.macros?.protein?.grams || 120;
  const targetWater = userTargets?.targetWaterMl || 2500;

  if (calories === 0) return 0;

  const calorieRatio = calories / targetCalories;
  const proteinRatio = protein / targetProtein;
  const fatPercent = (fat * 9) / Math.max(1, calories);
  const waterRatio = waterIntakeMl / targetWater;

  let score = 100;

  // Caloric adherence evaluation
  if (calorieRatio > 1.25 || calorieRatio < 0.6) score -= 25;
  else if (calorieRatio > 1.1 || calorieRatio < 0.75) score -= 12;

  // Protein adequacy
  if (proteinRatio < 0.6) score -= 20;
  else if (proteinRatio < 0.8) score -= 10;

  // Fat proportion (<35% is ideal)
  if (fatPercent > 0.42) score -= 15;
  else if (fatPercent > 0.36) score -= 8;

  // Hydration compliance
  if (waterRatio < 0.4) score -= 10;

  return Math.max(20, Math.min(100, Math.round(score)));
}
