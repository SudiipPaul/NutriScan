/**
 * FoodCard Component
 * Displays an individual food item in the catalog with:
 * - Food name & category
 * - Serving size
 * - Macronutrients (Protein, Carbs, Fat)
 * - Calorie count
 * - Interactive tap selection & explicit '+' Add button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

export default function FoodCard({
  food,
  isSelected,
  onPress,
  onSelect,
  actionIcon = 'add',
}) {
  const handlePress = () => {
    if (onPress) {
      onPress(food);
    } else if (onSelect) {
      onSelect(food);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {food.name}
          </Text>
        </View>

        <Text style={styles.serving}>
          {food.servingSize || `${food.servingWeightGrams || 100}g`}
          {food.category ? ` • ${food.category}` : ''}
        </Text>

        <View style={styles.macrosRow}>
          <View style={[styles.macroPill, { backgroundColor: COLORS.proteinLight }]}>
            <Text style={[styles.macroText, { color: COLORS.protein }]}>
              P: {food.protein}g
            </Text>
          </View>
          <View style={[styles.macroPill, { backgroundColor: COLORS.carbsLight }]}>
            <Text style={[styles.macroText, { color: COLORS.carbs }]}>
              C: {food.carbs}g
            </Text>
          </View>
          <View style={[styles.macroPill, { backgroundColor: COLORS.fatLight }]}>
            <Text style={[styles.macroText, { color: COLORS.fat }]}>
              F: {food.fat}g
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.caloriesBox}>
          <Text style={styles.caloriesValue}>{food.calories}</Text>
          <Text style={styles.kcalLabel}>kcal</Text>
        </View>

        <TouchableOpacity
          style={styles.addCircleBtn}
          onPress={handlePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={actionIcon} size={18} color={COLORS.primaryDeep} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  selectedCard: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  serving: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  macroPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  macroText: {
    fontSize: 10,
    fontWeight: '800',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caloriesBox: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  kcalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
