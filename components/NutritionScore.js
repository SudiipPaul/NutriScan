/**
 * NutritionScore Component
 * Visualizes the 0 - 100 Diet Quality Score with clinical feedback.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function NutritionScore({ score = 100 }) {
  let label = 'Excellent Balance';
  let color = COLORS.primary;
  let description =
    'Your daily macronutrient distribution and calorie adherence match clinical dietary recommendations.';

  if (score <= 0) {
    label = 'No Meals Logged';
    color = COLORS.textMuted;
    description = 'Start logging your meals to see your real-time diet quality and balance score.';
  } else if (score < 50) {
    label = 'Needs Immediate Attention';
    color = COLORS.error;
    description =
      'Multiple nutritional imbalances detected. Review the diagnostics below to align your diet with your metabolic goals.';
  } else if (score < 75) {
    label = 'Moderate Balance';
    color = COLORS.warning;
    description =
      'Good progress, but some nutrient ratios (protein or fat) deviate from your target goals.';
  }

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Ring */}
        <View style={styles.ringWrapper}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.surfaceSecondary}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>

        {/* Text */}
        <View style={styles.textCol}>
          <Text style={styles.kicker}>DIET QUALITY SCORE</Text>
          <Text style={[styles.ratingLabel, { color }]}>{label}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  textCol: {
    flex: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
