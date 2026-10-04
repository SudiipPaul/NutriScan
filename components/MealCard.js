/**
 * MealCard Component
 * Displays a meal section (Breakfast, Lunch, Dinner, Snacks) with logged items and subtotal macros.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function MealCard({
  mealKey,
  title,
  iconName = 'restaurant-outline',
  items = [],
  onAddPress,
  onDeleteItem,
}) {
  let subCals = 0;
  let subProt = 0;
  let subCarb = 0;
  let subFat = 0;

  items.forEach((item) => {
    subCals += item.calories || 0;
    subProt += item.protein || 0;
    subCarb += item.carbs || 0;
    subFat += item.fat || 0;
  });

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={18} color={COLORS.primaryDark} />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtext}>
              {Math.round(subCals)} kcal • P: {Math.round(subProt)}g C: {Math.round(subCarb)}g F: {Math.round(subFat)}g
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddPress && onAddPress(mealKey)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={COLORS.primaryDark} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No food recorded yet</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {items.map((food) => (
            <View key={food.logId} style={styles.foodRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodServing}>
                  {food.loggedQuantity || food.servingSize} {food.servingUnit || 'g'} • P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                </Text>
              </View>

              <View style={styles.foodRight}>
                <Text style={styles.foodCals}>{food.calories} kcal</Text>
                {onDeleteItem && (
                  <TouchableOpacity
                    onPress={() => onDeleteItem(mealKey, food.logId)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLighter,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 2,
  },
  emptyContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  itemsList: {
    marginTop: 6,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  foodServing: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  foodRight: {
    alignItems: 'flex-end',
  },
  foodCals: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    marginTop: 2,
    padding: 2,
  },
});
