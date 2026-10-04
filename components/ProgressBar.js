/**
 * ProgressBar Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors.js';

export default function ProgressBar({
  label,
  current = 0,
  target = 100,
  unit = 'g',
  color = COLORS.primary,
  height = 8,
  showValues = true,
  style,
}) {
  const safeTarget = Math.max(1, target);
  const percentage = Math.round((current / safeTarget) * 100);
  const clamped = Math.min(100, Math.max(0, percentage));
  const isOverflow = percentage > 100;

  return (
    <View style={[styles.container, style]}>
      {showValues && (
        <View style={styles.headerRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valuesRow}>
            <Text style={[styles.currentValue, { color }]}>
              {current}
              <Text style={styles.unitText}>{unit}</Text>
            </Text>
            <Text style={styles.targetValue}> / {target}{unit}</Text>
            <View style={[styles.pill, isOverflow && styles.pillOverflow]}>
              <Text style={[styles.pillText, isOverflow && styles.pillTextOverflow]}>
                {percentage}%
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: isOverflow ? COLORS.warning : color,
              width: `${clamped}%`,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
  },
  targetValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  pill: {
    marginLeft: 6,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pillOverflow: {
    backgroundColor: COLORS.warningLight,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pillTextOverflow: {
    color: COLORS.warning,
  },
  track: {
    width: '100%',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 6,
  },
});
