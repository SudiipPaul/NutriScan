/**
 * QuickMetricCard Component
 * Compact rounded health metric cards (Water, Burned Energy, Diet Quality Score)
 * with large readable numbers and minimal icons.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function QuickMetricCard({
  title,
  value,
  unit,
  subtitle,
  iconName,
  iconColor = COLORS.primary,
  iconBgColor = COLORS.primaryLight,
  onPress,
  actionText,
  onActionPress,
  secondaryActionText,
  onSecondaryActionPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={15} color={iconColor} />
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.mainValue}>
          {value}
          {unit ? <Text style={styles.unitText}> {unit}</Text> : null}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.actionsRow}>
          {secondaryActionText ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryActionBtn]}
              onPress={onSecondaryActionPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.secondaryActionText}>{secondaryActionText}</Text>
            </TouchableOpacity>
          ) : null}
          {actionText ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onActionPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionBtnText}>{actionText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    marginVertical: 2,
  },
  mainValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  secondaryActionBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  secondaryActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
