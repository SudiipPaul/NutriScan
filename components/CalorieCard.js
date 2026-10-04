/**
 * CalorieCard Component
 * Hero calorie tracker card featuring:
 * - Large readable numbers
 * - Soft lime green accent & circular SVG progress ring
 * - Remaining vs Consumed vs Target calorie status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function CalorieCard({
  targetCalories = 2000,
  consumedCalories = 0,
}) {
  const remaining = targetCalories - consumedCalories;
  const isSurplus = remaining < 0;
  const percentage = targetCalories > 0 ? Math.round((consumedCalories / targetCalories) * 100) : 0;

  // SVG Circular Ring parameters
  const size = 104;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.topBadgeRow}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>DAILY INTAKE</Text>
        </View>
        <Text style={styles.targetLabel}>Goal: {targetCalories.toLocaleString()} kcal</Text>
      </View>

      <View style={styles.content}>
        {/* Left Column: Big Digits & Metrics */}
        <View style={styles.infoCol}>
          <Text style={styles.label}>
            {isSurplus ? 'OVER BUDGET' : 'REMAINING'}
          </Text>
          <Text style={[styles.mainValue, isSurplus && styles.surplusValue]}>
            {Math.abs(remaining).toLocaleString()}
            <Text style={styles.unitText}> kcal</Text>
          </Text>

          <View style={styles.subRow}>
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Consumed</Text>
              <Text style={styles.subVal}>{consumedCalories.toLocaleString()} kcal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Target</Text>
              <Text style={styles.subVal}>{targetCalories.toLocaleString()} kcal</Text>
            </View>
          </View>
        </View>

        {/* Right Column: Circular Progress Ring */}
        <View style={styles.ringCol}>
          <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
              {/* Background Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={COLORS.surfaceSecondary}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Active Lime Progress Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isSurplus ? COLORS.warning : COLORS.primary}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <Text style={styles.ringPercent}>{percentage}%</Text>
            <Text style={styles.ringLabel}>of target</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    letterSpacing: 0.5,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  surplusValue: {
    color: COLORS.warning,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  subItem: {
    flex: 1,
  },
  subLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  subVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  ringCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
