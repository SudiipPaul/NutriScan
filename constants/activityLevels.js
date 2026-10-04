/**
 * Physical Activity Levels (PAL) with clinical expenditure multipliers
 */

export const ACTIVITY_LEVELS = {
  sedentary: {
    id: 'sedentary',
    label: 'Sedentary',
    multiplier: 1.2,
    description: 'Little to no exercise, desk job or sedentary routine',
  },
  light: {
    id: 'light',
    label: 'Lightly Active',
    multiplier: 1.375,
    description: 'Light exercise / sports 1-3 days per week',
  },
  moderate: {
    id: 'moderate',
    label: 'Moderately Active',
    multiplier: 1.55,
    description: 'Moderate exercise / sports 3-5 days per week',
  },
  very_active: {
    id: 'very_active',
    label: 'Very Active',
    multiplier: 1.725,
    description: 'Hard training / sports 6-7 days per week or physical job',
  },
  extra_active: {
    id: 'extra_active',
    label: 'Extremely Active',
    multiplier: 1.9,
    description: 'Very heavy physical work or intensive athlete training',
  },
};

export const ACTIVITY_LEVELS_LIST = Object.values(ACTIVITY_LEVELS);
