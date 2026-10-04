/**
 * Meal Storage Module
 * Handles storing daily food logs, water tracking, and custom foods in AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDailyTotals } from '../utils/macroCalculator.js';

const PREFIX = '@nutriscan_log_';
const CUSTOM_FOODS_KEY = '@nutriscan_custom_foods';

const EMPTY_MEAL_LOG = {
  meals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  },
  waterMl: 0,
  totals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  },
};

export async function getDailyLog(dateString) {
  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}${dateString}`);
    if (raw != null) {
      const parsed = JSON.parse(raw);
      const totals = calculateDailyTotals(parsed.meals || {});
      return {
        date: dateString,
        meals: parsed.meals || EMPTY_MEAL_LOG.meals,
        waterMl: parsed.waterMl || 0,
        totals,
      };
    }
    return { date: dateString, ...EMPTY_MEAL_LOG };
  } catch (e) {
    console.error(`Error loading log for ${dateString}`, e);
    return { date: dateString, ...EMPTY_MEAL_LOG };
  }
}

export async function saveDailyLog(dateString, logData) {
  try {
    const totals = calculateDailyTotals(logData.meals || {});
    const record = {
      date: dateString,
      meals: logData.meals || EMPTY_MEAL_LOG.meals,
      waterMl: logData.waterMl || 0,
      totals,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(`${PREFIX}${dateString}`, JSON.stringify(record));
    return record;
  } catch (e) {
    console.error(`Error saving log for ${dateString}`, e);
    throw e;
  }
}

export async function addFoodToMeal(dateString, mealKey, foodItem) {
  const current = await getDailyLog(dateString);
  const updatedMeals = { ...current.meals };
  if (!updatedMeals[mealKey]) updatedMeals[mealKey] = [];

  const entry = {
    ...foodItem,
    logId: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    addedAt: new Date().toISOString(),
  };

  updatedMeals[mealKey] = [...updatedMeals[mealKey], entry];
  return await saveDailyLog(dateString, { ...current, meals: updatedMeals });
}

export async function removeFoodFromMeal(dateString, mealKey, logId) {
  const current = await getDailyLog(dateString);
  const updatedMeals = { ...current.meals };
  if (mealKey && updatedMeals[mealKey]) {
    updatedMeals[mealKey] = updatedMeals[mealKey].filter((i) => i.logId !== logId);
  }
  // Also check all other meal keys to ensure legacy or renamed items are safely removed
  Object.keys(updatedMeals).forEach((k) => {
    if (Array.isArray(updatedMeals[k])) {
      updatedMeals[k] = updatedMeals[k].filter((i) => i.logId !== logId);
    }
  });
  return await saveDailyLog(dateString, { ...current, meals: updatedMeals });
}

export async function updateWater(dateString, totalMl) {
  const current = await getDailyLog(dateString);
  return await saveDailyLog(dateString, {
    ...current,
    waterMl: Math.max(0, totalMl),
  });
}

export async function getMultiDayLogs(dateStrings = []) {
  try {
    const promises = dateStrings.map((d) => getDailyLog(d));
    return await Promise.all(promises);
  } catch (e) {
    console.error('Error fetching multi-day logs', e);
    return [];
  }
}

export async function getCustomFoods() {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_FOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveCustomFood(foodItem) {
  try {
    const existing = await getCustomFoods();
    const item = {
      ...foodItem,
      id: `custom_${Date.now()}`,
      isCustom: true,
    };
    const updated = [item, ...existing];
    await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
    return item;
  } catch (e) {
    console.error('Error saving custom food', e);
    throw e;
  }
}
