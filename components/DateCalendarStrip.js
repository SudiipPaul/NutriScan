/**
 * DateCalendarStrip Component
 * Modern horizontal 7-day calendar selector strip with month navigation
 * and active day highlighting in soft lime green.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors.js';
import { formatISODate, shiftDate, parseISODate } from '../utils/dateUtils.js';

export default function DateCalendarStrip({
  selectedDate,
  onSelectDate,
}) {
  const currentDate = parseISODate(selectedDate || new Date());

  // Generate 7 days centered around selected date or current week
  const dayOfWeek = currentDate.getDay(); // 0 is Sunday
  // Find start of week (Sunday)
  const sundayOffset = -dayOfWeek;
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() + sundayOffset + i);
    weekDays.push({
      iso: formatISODate(d),
      dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
      dateNumber: String(d.getDate()).padStart(2, '0'),
      isToday: formatISODate(d) === formatISODate(new Date()),
    });
  }

  // Month & Year display label
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <View style={styles.container}>
      {/* Month Header & Prev/Next Arrows */}
      <View style={styles.headerRow}>
        <Text style={styles.monthText}>{monthLabel}</Text>
        <View style={styles.arrowsRow}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => onSelectDate(shiftDate(selectedDate, -7))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={16} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => onSelectDate(shiftDate(selectedDate, 7))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={16} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 7-Day Strip */}
      <View style={styles.daysRow}>
        {weekDays.map((item) => {
          const isSelected = item.iso === selectedDate;
          return (
            <TouchableOpacity
              key={item.iso}
              style={[
                styles.dayItem,
                isSelected && styles.selectedDayItem,
              ]}
              onPress={() => onSelectDate(item.iso)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayLetter, isSelected && styles.selectedDayLetter]}>
                {item.dayName}
              </Text>
              <View style={[styles.numberCircle, isSelected && styles.selectedNumberCircle]}>
                <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>
                  {item.dateNumber}
                </Text>
              </View>
              {item.isToday && !isSelected && (
                <View style={styles.todayDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  arrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  selectedDayItem: {
    backgroundColor: COLORS.primaryLight,
  },
  dayLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  selectedDayLetter: {
    color: COLORS.primaryDeep,
    fontWeight: '800',
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedNumberCircle: {
    backgroundColor: COLORS.primary,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedDayNumber: {
    color: COLORS.textInverted,
    fontWeight: '900',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
});
