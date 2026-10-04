/**
 * BMI (Body Mass Index) Calculator Module
 * Clinical body composition & ideal weight range calculator according to WHO standards.
 */

import { COLORS } from '../constants/colors.js';

/**
 * Calculates BMI given weight in kg and height in cm
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @returns {number|null}
 */
export function calculateBMI(weightKg, heightCm) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  if (!w || !h || w <= 0 || h <= 0) return null;

  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Returns WHO BMI classification, color, risk level, and health advice
 * @param {number} bmi 
 * @param {number} [age=22] 
 * @returns {Object}
 */
export function getBMICategory(bmi, age = 22) {
  const val = parseFloat(bmi);
  if (!val || isNaN(val) || val <= 0) {
    return {
      label: 'Unknown',
      labelBn: 'অজানা',
      color: COLORS.textMuted,
      bgColor: COLORS.surfaceSecondary,
      risk: 'No data',
      advice: 'Please enter valid height and weight.',
    };
  }

  if (val < 18.5) {
    return {
      category: 'underweight',
      label: 'Underweight',
      labelBn: 'কম ওজন (Underweight)',
      color: COLORS.warning,
      bgColor: '#FEF3C7',
      risk: 'Increased risk for nutritional deficiency and weak immunity',
      advice: 'Focus on nutrient-dense foods, adequate protein, and healthy caloric surplus.',
    };
  }

  if (val < 25.0) {
    return {
      category: 'normal',
      label: 'Normal Weight',
      labelBn: 'স্বাভাবিক ওজন (Normal)',
      color: COLORS.primaryDark,
      bgColor: COLORS.primaryLight,
      risk: 'Lowest health risk, optimal metabolic balance',
      advice: 'Great job! Maintain your balanced diet and regular physical activity.',
    };
  }

  if (val < 30.0) {
    return {
      category: 'overweight',
      label: 'Overweight',
      labelBn: 'অতিরিক্ত ওজন (Overweight)',
      color: COLORS.warning,
      bgColor: '#FEF3C7',
      risk: 'Moderate risk for hypertension and cardiovascular issues',
      advice: 'Aim for a mild calorie deficit (250-500 kcal) and increase daily activity.',
    };
  }

  if (val < 35.0) {
    return {
      category: 'obese_1',
      label: 'Obese (Class I)',
      labelBn: 'স্থূলতা (Obese Class 1)',
      color: COLORS.error,
      bgColor: '#FEE2E2',
      risk: 'High risk for type 2 diabetes and metabolic syndrome',
      advice: 'Structured calorie management and progressive cardiovascular exercise recommended.',
    };
  }

  return {
    category: 'obese_2',
    label: 'Obese (Class II+)',
    labelBn: 'উচ্চ স্থূলতা (Obese Class 2+)',
    color: COLORS.error,
    bgColor: '#FEE2E2',
    risk: 'Very high risk for chronic metabolic complications',
    advice: 'Consult a physician or certified dietitian for a personalized intervention plan.',
  };
}

/**
 * Calculates healthy/ideal body weight range for a given height in cm (BMI 18.5 - 24.9)
 * @param {number} heightCm 
 * @returns {{ minKg: number, maxKg: number } | null}
 */
export function getIdealWeightRange(heightCm) {
  const h = parseFloat(heightCm);
  if (!h || h <= 0) return null;

  const heightM = h / 100;
  const hSq = heightM * heightM;

  const minKg = Math.round(18.5 * hSq * 10) / 10;
  const maxKg = Math.round(24.9 * hSq * 10) / 10;

  return {
    minKg,
    maxKg,
  };
}

/**
 * Converts feet and inches into centimeters
 * @param {number} feet 
 * @param {number} inches 
 * @returns {number}
 */
export function feetInchesToCm(feet, inches = 0) {
  const f = parseFloat(feet) || 0;
  const i = parseFloat(inches) || 0;
  const totalInches = f * 12 + i;
  return Math.round(totalInches * 2.54);
}

/**
 * Converts centimeters into feet and inches
 * @param {number} cm 
 * @returns {{ feet: number, inches: number }}
 */
export function cmToFeetInches(cm) {
  const c = parseFloat(cm) || 0;
  const totalInches = c / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Generates an automated, scientifically calculated recommendation based on BMI, weight, and height
 * Calculates exact target weight differences, safe weekly rates, and personalized caloric adjustments.
 * @param {number} bmi 
 * @param {number} [currentWeight=70] 
 * @param {number} [heightCm=175] 
 * @returns {Object}
 */
export function getBmiRecommendation(bmi, currentWeight = 70, heightCm = 175) {
  const val = parseFloat(bmi);
  const curW = parseFloat(currentWeight) || 70;
  const hCm = parseFloat(heightCm) || 175;
  const ideal = getIdealWeightRange(hCm);

  if (!val || isNaN(val) || val <= 0) {
    return {
      action: 'maintain',
      goalId: 'maintain',
      title: 'Maintain Weight',
      summary: 'Enter height & weight',
      recommendation: 'Enter your height and weight to calculate your BMI and personalized caloric strategy.',
      explanation: '',
      suggestedCalorieDelta: 0,
      badgeColor: COLORS.primaryDark,
      badgeBg: COLORS.primaryLight,
      icon: 'information-circle-outline',
      targetDiffKg: 0,
      estimatedWeeks: 0,
    };
  }

  // 1. UNDERWEIGHT (BMI < 18.5)
  if (val < 18.5) {
    const minTarget = ideal ? ideal.minKg : Math.round(18.5 * Math.pow(hCm / 100, 2) * 10) / 10;
    const kgToGain = Math.max(0.5, Math.round((minTarget - curW) * 10) / 10);

    // Calculate safe surplus based on required weight gain
    let surplus = 300;
    let rateKgPerWeek = 0.28;
    if (kgToGain <= 3) {
      surplus = 250;
      rateKgPerWeek = 0.23;
    } else if (kgToGain <= 6) {
      surplus = 350;
      rateKgPerWeek = 0.32;
    } else {
      surplus = 450;
      rateKgPerWeek = 0.41;
    }
    const estimatedWeeks = Math.ceil(kgToGain / rateKgPerWeek);

    return {
      action: 'weight_gain',
      goalId: 'mild_weight_gain',
      title: 'Weight Gain Recommended',
      summary: `BMI ${val} (Underweight)`,
      recommendation: `Recommended strategy: Clean caloric surplus of +${surplus} kcal/day to gain ~${rateKgPerWeek} kg/week safely.`,
      explanation: `Target: Gain ${kgToGain} kg to reach the safe healthy weight threshold (${minTarget} kg). Estimated timeframe: ~${estimatedWeeks} weeks.`,
      suggestedCalorieDelta: surplus,
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
      icon: 'trending-up-outline',
      targetDiffKg: kgToGain,
      estimatedWeeks,
      weeklyRate: rateKgPerWeek,
    };
  }

  // 2. NORMAL / OPTIMAL (BMI 18.5 - 24.9)
  if (val < 25.0) {
    return {
      action: 'maintain',
      goalId: 'maintain',
      title: 'Maintain Weight (Optimal)',
      summary: `BMI ${val} (Healthy Normal)`,
      recommendation: `Recommended strategy: Energy balance (0 kcal deficit/surplus) to maintain lean mass and metabolic health.`,
      explanation: ideal
        ? `Your weight is in the ideal clinical range (${ideal.minKg} - ${ideal.maxKg} kg). Continue balanced nutrition and regular physical activity.`
        : 'Your weight is currently optimal.',
      suggestedCalorieDelta: 0,
      badgeColor: COLORS.primaryDark,
      badgeBg: COLORS.primaryLight,
      icon: 'checkmark-circle-outline',
      targetDiffKg: 0,
      estimatedWeeks: 0,
      weeklyRate: 0,
    };
  }

  // 3. OVERWEIGHT (BMI 25.0 - 29.9)
  if (val < 30.0) {
    const maxTarget = ideal ? ideal.maxKg : Math.round(24.9 * Math.pow(hCm / 100, 2) * 10) / 10;
    const kgToLose = Math.max(0.5, Math.round((curW - maxTarget) * 10) / 10);

    // Calculate personalized deficit based on excess weight
    let deficit = 300;
    let rateKgPerWeek = 0.28;
    if (kgToLose <= 3) {
      deficit = 250;
      rateKgPerWeek = 0.23;
    } else if (kgToLose <= 7) {
      deficit = 350;
      rateKgPerWeek = 0.32;
    } else {
      deficit = 450;
      rateKgPerWeek = 0.41;
    }
    const estimatedWeeks = Math.ceil(kgToLose / rateKgPerWeek);

    return {
      action: 'weight_loss',
      goalId: 'mild_weight_loss',
      title: 'Mild Weight Loss Recommended',
      summary: `BMI ${val} (Overweight)`,
      recommendation: `Recommended strategy: Moderate caloric deficit of -${deficit} kcal/day to lose ~${rateKgPerWeek} kg/week sustainably without fatigue.`,
      explanation: `Target: Shed ${kgToLose} kg to reach your optimal upper threshold (${maxTarget} kg). Estimated timeframe: ~${estimatedWeeks} weeks.`,
      suggestedCalorieDelta: -deficit,
      badgeColor: '#EA580C',
      badgeBg: '#FFEDD5',
      icon: 'trending-down-outline',
      targetDiffKg: kgToLose,
      estimatedWeeks,
      weeklyRate: rateKgPerWeek,
    };
  }

  // 4. OBESE (BMI >= 30.0)
  const maxTarget = ideal ? ideal.maxKg : Math.round(24.9 * Math.pow(hCm / 100, 2) * 10) / 10;
  const kgToLose = Math.max(1, Math.round((curW - maxTarget) * 10) / 10);

  // Progressive clinical deficit capped safely at 500-650 kcal to protect lean mass & basal metabolism
  let deficit = 500;
  let rateKgPerWeek = 0.45;
  if (kgToLose > 15) {
    deficit = 650;
    rateKgPerWeek = 0.59;
  }
  const estimatedWeeks = Math.ceil(kgToLose / rateKgPerWeek);
  const estimatedMonths = Math.ceil(estimatedWeeks / 4.3);

  return {
    action: 'weight_loss',
    goalId: 'moderate_weight_loss',
    title: 'Structured Weight Loss Recommended',
    summary: `BMI ${val} (Obese Classification)`,
    recommendation: `Recommended strategy: Structured clinical deficit of -${deficit} kcal/day for a steady, safe rate of ~${rateKgPerWeek} kg/week.`,
    explanation: `Target: Gradually shed ${kgToLose} kg toward the healthy range (${maxTarget} kg max). Estimated roadmap: ~${estimatedMonths} months.`,
    suggestedCalorieDelta: -deficit,
    badgeColor: COLORS.error,
    badgeBg: '#FEE2E2',
    icon: 'alert-circle-outline',
    targetDiffKg: kgToLose,
    estimatedWeeks,
    weeklyRate: rateKgPerWeek,
  };
}
