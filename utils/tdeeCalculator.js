/**
 * TDEE Calculator Module
 * 
 * Total Daily Energy Expenditure (TDEE) represents the total number of calories
 * burned in a 24-hour day across all components of human metabolism:
 * 1. Basal Metabolic Rate (BMR) ~60-70%
 * 2. Non-Exercise Activity Thermogenesis (NEAT) ~15%
 * 3. Exercise Activity Thermogenesis (EAT) ~5-10%
 * 4. Thermic Effect of Food (TEF) ~10%
 * 
 * FORMULA:
 * -------------------------------------------------------------
 * TDEE = BMR × PAL (Physical Activity Level multiplier)
 * -------------------------------------------------------------
 * 
 * PAL MULTIPLIER STANDARDS (WHO / FAO Guidelines):
 * - 'sedentary':    1.200 (Desk job, minimal purposeful movement)
 * - 'light':        1.375 (Light daily activity / 1-3 workout sessions per week)
 * - 'moderate':     1.550 (Moderate exercise / 3-5 workout sessions per week)
 * - 'very_active':  1.725 (Heavy training / 6-7 workout sessions per week or physical job)
 * - 'extra_active': 1.900 (Athletic endurance training 2x/day or intensive manual labor)
 */

import { ACTIVITY_LEVELS } from '../constants/activityLevels.js';

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 *
 * @param {number} bmr - Basal Metabolic Rate in kcal/day
 * @param {string} [activityLevelKey='moderate'] - PAL activity identifier
 * @returns {number} TDEE in kcal/day rounded to nearest integer
 */
export function calculateTDEE(bmr, activityLevelKey = 'moderate') {
  const numericBmr = parseFloat(bmr);
  if (isNaN(numericBmr) || numericBmr <= 0) {
    throw new Error(`Invalid BMR: ${bmr}. BMR must be a positive number.`);
  }

  const key = String(activityLevelKey).toLowerCase().trim();
  const activity = ACTIVITY_LEVELS[key] || ACTIVITY_LEVELS.moderate;
  const multiplier = activity.multiplier;

  return Math.round(numericBmr * multiplier);
}
