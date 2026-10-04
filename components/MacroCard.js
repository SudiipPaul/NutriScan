/**
 * MacroCard Component
 * Displays Protein, Carbs, and Fat progress bars and percentage adherence.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar.js';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function MacroCard({
  actualTotals = { protein: 0, carbs: 0, fat: 0 },
  targets = {},
}) {
  const proteinTarget = targets?.macros?.protein?.grams || 120;
  const carbsTarget = targets?.macros?.carbs?.grams || 220;
  const fatTarget = targets?.macros?.fat?.grams || 65;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Macronutrient Breakdown</Text>
        <Text style={styles.subtitle}>Daily Targets</Text>
      </View>

      <ProgressBar
        label="Protein"
        current={actualTotals.protein}
        target={proteinTarget}
        unit="g"
        color={COLORS.protein}
      />

      <ProgressBar
        label="Carbohydrates"
        current={actualTotals.carbs}
        target={carbsTarget}
        unit="g"
        color={COLORS.carbs}
      />

      <ProgressBar
        label="Fats"
        current={actualTotals.fat}
        target={fatTarget}
        unit="g"
        color={COLORS.fat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
