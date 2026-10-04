/**
 * Goal-Based Calorie Calculator Module
 * 
 * Determines personalized daily calorie intake targets based on TDEE,
 * desired rate of body weight change, and clinical nutritional safety floors.
 * 
 * THERMODYNAMIC ASSUMPTIONS:
 * 1. 1 kg of adipose tissue stores approximately 7,700 kcal of chemical energy (~3,500 kcal per lb).
 * 2. A 500 kcal/day deficit yields approximately 3,500 kcal deficit/week = ~0.45 - 0.50 kg loss per week.
 * 3. A 250 kcal/day deficit yields approximately ~0.25 kg loss per week (gentle & sustainable).
 * 4. A 250 kcal/day surplus supports lean muscle tissue synthesis with minimal fat storage.
 * 5. A 500 kcal/day surplus supports rapid mass gain or athletic bulking.
 * 
 * CLINICAL SAFETY FLOORS (American College of Sports Medicine / Dietary Guidelines):
 * - Females: Minimum 1,200 kcal/day.
 * - Males:   Minimum 1,500 kcal/day.
 * Intakes below these thresholds compromise micronutrient adequacy, provoke hormonal dysregulation
 * (thyroid, cortisol, leptin), and accelerate lean muscle catabolism.
 */

import { GOALS } from '../constants/goals.js';
import { calculateBMR } from './bmrCalculator.js';
import { calculateTDEE } from './tdeeCalculator.js';

// Re-export BMR and TDEE for unified access
export { calculateBMR, calculateTDEE };

/**
 * Calculates Goal-Based Target Daily Calories.
 *
 * @param {number} tdee - Total Daily Energy Expenditure in kcal/day
 * @param {string} [goalKey='maintain'] - Goal identifier ('lose_fast' | 'lose_mild' | 'maintain' | 'gain_mild' | 'gain_fast')
 * @param {'male'|'female'} [gender='male'] - Biological sex for safety floor calibration
 * @returns {number} Calorie target in kcal/day rounded to nearest integer
 */
export function calculateTargetCalories(tdee, goalKey = 'maintain', gender = 'male') {
  const numericTdee = parseFloat(tdee);
  if (isNaN(numericTdee) || numericTdee <= 0) {
    throw new Error(`Invalid TDEE: ${tdee}. TDEE must be a positive number.`);
  }

  const goal = GOALS[goalKey] || GOALS.maintain;
  const rawTarget = numericTdee + goal.deltaCalories;

  // Enforce biological minimum floor
  const isFemale = String(gender).toLowerCase().trim() === 'female';
  const safetyFloor = isFemale ? 1200 : 1500;

  return Math.max(safetyFloor, Math.round(rawTarget));
}
