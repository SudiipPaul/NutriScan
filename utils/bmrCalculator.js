/**
 * BMR Calculator Module
 * 
 * Basal Metabolic Rate (BMR) represents the minimum number of calories
 * the human body needs to perform basic life-sustaining functions
 * (breathing, cellular repair, circulation, protein synthesis) at rest in a
 * thermoneutral environment.
 * 
 * FORMULA: Mifflin-St Jeor Equation (1990)
 * -------------------------------------------------------------
 * Men:   BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 * -------------------------------------------------------------
 * 
 * CLINICAL ASSUMPTIONS & RATIONALE:
 * 1. The Mifflin-St Jeor equation is recommended by the Academy of Nutrition and Dietetics
 *    as the most accurate predictive resting energy expenditure equation for healthy adults.
 * 2. Biological sex differences account for differences in average lean muscle mass vs adipose tissue.
 * 3. BMR declines by approximately 2-3% per decade after age 20 due to sarcopenia (gradual muscle loss).
 * 4. A physiological minimum floor of 800 kcal/day is enforced as a defensive boundary.
 */

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula.
 *
 * @param {number} weightKg - Body weight in kilograms (e.g. 70)
 * @param {number} heightCm - Height in centimeters (e.g. 175)
 * @param {number} ageYears - Age in whole years (e.g. 22)
 * @param {'male'|'female'} [gender='male'] - Biological sex for lean mass calibration
 * @returns {number} BMR in kcal/day rounded to nearest integer
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender = 'male') {
  // Input validation and sanitization
  const weight = parseFloat(weightKg);
  const height = parseFloat(heightCm);
  const age = parseFloat(ageYears);
  const normalizedGender = String(gender).toLowerCase().trim();

  if (isNaN(weight) || weight <= 0) {
    throw new Error(`Invalid weight: ${weightKg}. Weight must be a positive number in kilograms.`);
  }
  if (isNaN(height) || height <= 0) {
    throw new Error(`Invalid height: ${heightCm}. Height must be a positive number in centimeters.`);
  }
  if (isNaN(age) || age <= 0) {
    throw new Error(`Invalid age: ${ageYears}. Age must be a positive number in years.`);
  }

  // Base equation: (10 × weight) + (6.25 × height) - (5 × age)
  let bmr = 10 * weight + 6.25 * height - 5 * age;

  // Gender calibration offset
  if (normalizedGender === 'female') {
    bmr -= 161;
  } else {
    // Default to male calculation (+5)
    bmr += 5;
  }

  // Biological safety minimum of 800 kcal for baseline human viability
  return Math.max(800, Math.round(bmr));
}
