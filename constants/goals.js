/**
 * Weight Goals and Target Calorie Adjustments
 */

export const GOALS = {
  lose_fast: {
    id: 'lose_fast',
    label: 'Weight Loss (Fast)',
    deltaCalories: -500, // ~0.5 kg loss per week
    description: 'Moderate calorie deficit for consistent fat reduction',
    proteinMultiplier: 2.0, // Higher protein to preserve lean muscle in deficit
  },
  lose_mild: {
    id: 'lose_mild',
    label: 'Mild Weight Loss',
    deltaCalories: -250, // ~0.25 kg loss per week
    description: 'Gentle, sustainable deficit with high daytime energy',
    proteinMultiplier: 1.8,
  },
  maintain: {
    id: 'maintain',
    label: 'Maintain Weight',
    deltaCalories: 0,
    description: 'Balance energy intake for weight and metabolic stability',
    proteinMultiplier: 1.6,
  },
  gain_mild: {
    id: 'gain_mild',
    label: 'Mild Muscle Gain',
    deltaCalories: 250, // ~0.25 kg gain per week
    description: 'Lean mass accumulation with minimal fat storage',
    proteinMultiplier: 1.8,
  },
  gain_fast: {
    id: 'gain_fast',
    label: 'Weight Gain',
    deltaCalories: 500, // ~0.5 kg gain per week
    description: 'Caloric surplus for athletic bulking or underweight recovery',
    proteinMultiplier: 2.0,
  },
};

export const GOALS_LIST = Object.values(GOALS);
