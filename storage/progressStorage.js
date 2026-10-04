/**
 * Progress Storage Module
 * Manages weigh-in history and longitudinal body composition tracking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHT_KEY = '@nutriscan_weight_history';

export async function getWeightHistory() {
  try {
    const raw = await AsyncStorage.getItem(WEIGHT_KEY);
    if (raw != null) {
      const parsed = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return [];
  } catch (e) {
    console.error('Failed to load weight history', e);
    return [];
  }
}

export async function logWeight(dateString, weightKg, notes = '') {
  try {
    const history = await getWeightHistory();
    const index = history.findIndex((e) => e.date === dateString);

    const record = {
      date: dateString,
      weight: parseFloat(weightKg),
      notes,
      loggedAt: new Date().toISOString(),
    };

    let updated;
    if (index >= 0) {
      updated = [...history];
      updated[index] = record;
    } else {
      updated = [...history, record];
    }

    updated.sort((a, b) => new Date(a.date) - new Date(b.date));
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save weight record', e);
    throw e;
  }
}
