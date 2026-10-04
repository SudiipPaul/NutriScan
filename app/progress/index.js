/**
 * Progress Screen (app/progress/index.js)
 * NutriScan 7-day adherence & statistical progress dashboard:
 * - Weekly Calorie Bar Chart (Mon-Sun) with target percentage badges
 * - 7-Day Macro Averages (Protein, Carbs, Fat)
 * - Weight Tracking & History Logger
 * - Large readable numbers & soft lime green accents
 * - Bottom Tab Navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../../components/SectionHeader.js';
import BottomNav from '../../components/BottomNav.js';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { getUserProfile, saveUserProfile } from '../../storage/userStorage.js';
import { getMultiDayLogs } from '../../storage/mealStorage.js';
import { getWeightHistory, logWeight } from '../../storage/progressStorage.js';
import { getLastNDays, getFriendlyDateLabel, formatISODate } from '../../utils/dateUtils.js';

export default function ProgressScreen() {
  const [profile, setProfile] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Quick weight logger modal state
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('70');
  const [notesInput, setNotesInput] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUserProfile();
      const dates = getLastNDays(7);
      const logs = await getMultiDayLogs(dates);
      const weights = await getWeightHistory();

      setProfile(user);
      setRecentLogs(logs);
      setWeightHistory(weights);
      if (user?.weight) setWeightInput(String(user.weight));
    } catch (e) {
      console.error('Error loading progress data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!val || val < 30 || val > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (30-300).');
      return;
    }

    const today = formatISODate(new Date());
    await logWeight(today, val, notesInput.trim());
    if (profile) {
      await saveUserProfile({ ...profile, weight: val });
    }
    setShowLogWeight(false);
    setNotesInput('');
    loadData();
    Alert.alert('Weight Logged', `${val} kg recorded. Targets automatically updated!`);
  };

  const targetCalories = profile?.targets?.targetCalories || 2000;

  // Compute 7-day macro averages and totals
  let totalCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let activeDays = 0;

  recentLogs.forEach((day) => {
    const c = day.totals?.calories || 0;
    if (c > 0) {
      totalCals += c;
      totalProt += day.totals?.protein || 0;
      totalCarb += day.totals?.carbs || 0;
      totalFat += day.totals?.fat || 0;
      activeDays++;
    }
  });

  const avgCalories = activeDays > 0 ? Math.round(totalCals / activeDays) : 0;
  const avgProtein = activeDays > 0 ? Math.round(totalProt / activeDays) : 0;
  const avgCarbs = activeDays > 0 ? Math.round(totalCarb / activeDays) : 0;
  const avgFat = activeDays > 0 ? Math.round(totalFat / activeDays) : 0;

  // Chart height and scaling
  const chartHeight = 120;
  const maxDayCals = Math.max(
    targetCalories * 1.25,
    ...recentLogs.map((l) => l.totals?.calories || 0),
    2000
  );

  const dayLetters = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Progress & Analytics</Text>
          <Text style={styles.headerSub}>7-Day Intake Patterns & Weight History</Text>
        </View>

        <TouchableOpacity
          style={styles.logWeightBtn}
          onPress={() => setShowLogWeight(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="scale-outline" size={15} color={COLORS.primaryDeep} />
          <Text style={styles.logWeightBtnText}>Log Weight</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {/* Weekly Calorie Adherence Bar Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Average Calories</Text>
              <Text style={styles.chartLargeNum}>
                {avgCalories.toLocaleString()}
                <Text style={styles.chartUnit}> Kcal / day</Text>
              </Text>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>
                Target: {targetCalories.toLocaleString()} Kcal
              </Text>
            </View>
          </View>

          {/* Bar Chart Area */}
          <View style={styles.barArea}>
            {/* Target Line Indicator */}
            <View
              style={[
                styles.targetLine,
                {
                  bottom: (targetCalories / maxDayCals) * chartHeight,
                },
              ]}
            >
              <View style={styles.targetLineDot} />
              <View style={styles.targetLineDashes} />
            </View>

            {/* Bars Column */}
            <View style={styles.barsContainer}>
              {recentLogs.map((dayLog, index) => {
                const dayCals = dayLog.totals?.calories || 0;
                const barRatio = Math.min(1, dayCals / maxDayCals);
                const barPixelHeight = Math.max(6, Math.round(barRatio * chartHeight));
                const pct = Math.round((dayCals / Math.max(1, targetCalories)) * 100);
                const isOptimal = pct >= 85 && pct <= 115;
                const isDayLogged = dayCals > 0;

                const parts = (dayLog.date || '').split('-');
                let label = 'Day';
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                  label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] || 'Day';
                }

                return (
                  <View key={dayLog.date} style={styles.barColumn}>
                    {/* Top percentage pill */}
                    <Text
                      style={[
                        styles.barPctLabel,
                        isOptimal && { color: COLORS.primaryDark, fontWeight: '800' },
                      ]}
                    >
                      {isDayLogged ? `${pct}%` : '-'}
                    </Text>

                    {/* Bar Pillar */}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: barPixelHeight,
                            backgroundColor: isOptimal
                              ? COLORS.primary
                              : isDayLogged
                              ? COLORS.surfaceSecondary
                              : 'transparent',
                          },
                        ]}
                      />
                    </View>

                    {/* Day Name */}
                    <Text style={styles.barDayLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.chartFooter}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendTxt}>Met Target (85-115%)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.surfaceSecondary }]} />
              <Text style={styles.legendTxt}>Over / Under Budget</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Macro Averages Grid */}
        <SectionHeader
          title="7-Day Nutritional Averages"
          subtitle={`Averaged across ${activeDays} active logged days`}
        />

        <View style={styles.macroAvgGrid}>
          {/* Protein */}
          <View style={styles.avgCard}>
            <View style={styles.avgTop}>
              <Text style={[styles.avgTitle, { color: COLORS.protein }]}>Protein</Text>
              <Ionicons name="fitness-outline" size={14} color={COLORS.protein} />
            </View>
            <Text style={styles.avgLargeNum}>
              {avgProtein}
              <Text style={styles.avgUnit}> g</Text>
            </Text>
            <Text style={styles.avgSub}>
              Target: {profile?.targets?.macros?.protein?.grams || 120} g
            </Text>
          </View>

          {/* Carbs */}
          <View style={styles.avgCard}>
            <View style={styles.avgTop}>
              <Text style={[styles.avgTitle, { color: COLORS.carbs }]}>Carbohydrates</Text>
              <Ionicons name="nutrition-outline" size={14} color={COLORS.carbs} />
            </View>
            <Text style={styles.avgLargeNum}>
              {avgCarbs}
              <Text style={styles.avgUnit}> g</Text>
            </Text>
            <Text style={styles.avgSub}>
              Target: {profile?.targets?.macros?.carbs?.grams || 240} g
            </Text>
          </View>

          {/* Fat */}
          <View style={styles.avgCard}>
            <View style={styles.avgTop}>
              <Text style={[styles.avgTitle, { color: COLORS.fat }]}>Fats</Text>
              <Ionicons name="water-outline" size={14} color={COLORS.fat} />
            </View>
            <Text style={styles.avgLargeNum}>
              {avgFat}
              <Text style={styles.avgUnit}> g</Text>
            </Text>
            <Text style={styles.avgSub}>
              Target: {profile?.targets?.macros?.fat?.grams || 60} g
            </Text>
          </View>

          {/* Adherence */}
          <View style={styles.avgCard}>
            <View style={styles.avgTop}>
              <Text style={[styles.avgTitle, { color: COLORS.primaryDark }]}>Adherence</Text>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.avgLargeNum}>
              {activeDays}
              <Text style={styles.avgUnit}> / 7 days</Text>
            </Text>
            <Text style={styles.avgSub}>
              {activeDays >= 5 ? 'Excellent tracking' : 'Keep logging daily'}
            </Text>
          </View>
        </View>

        {/* Weight Tracking Section */}
        <SectionHeader
          title="Body Weight Log"
          subtitle="Monitor your progress toward your goal"
          actionText="+ Record Weight"
          onActionPress={() => setShowLogWeight(true)}
        />

        <View style={styles.weightCard}>
          <View style={styles.weightHeroRow}>
            <View>
              <Text style={styles.weightLabel}>CURRENT WEIGHT</Text>
              <Text style={styles.weightLargeNum}>
                {profile?.weight || 70}
                <Text style={styles.weightUnit}> kg</Text>
              </Text>
            </View>

            <View style={styles.weightGoalBox}>
              <Text style={styles.weightGoalLabel}>GOAL</Text>
              <Text style={styles.weightGoalText}>
                {profile?.weightGoal?.replace('_', ' ').toUpperCase() || 'MAINTAIN'}
              </Text>
            </View>
          </View>

          {/* Weight Log History Entries */}
          {weightHistory.length === 0 ? (
            <View style={styles.emptyWeight}>
              <Text style={styles.emptyWeightText}>
                No weight logs yet. Tap "+ Record Weight" to record your first entry.
              </Text>
            </View>
          ) : (
            <View style={styles.weightHistoryList}>
              {weightHistory.slice(0, 5).map((w, idx) => (
                <View key={idx} style={styles.weightHistoryItem}>
                  <View style={styles.weightDateRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.weightDateText}>{getFriendlyDateLabel(w.date)}</Text>
                  </View>
                  <Text style={styles.weightLogVal}>{w.weight} kg</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal
        visible={showLogWeight}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogWeight(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.weightSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Log Body Weight</Text>
              <TouchableOpacity
                onPress={() => setShowLogWeight(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Weight (in kilograms)</Text>
            <View style={styles.weightInputWrap}>
              <TextInput
                style={styles.weightLargeInput}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
                autoFocus
              />
              <Text style={styles.weightInputUnit}>kg</Text>
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g., Morning weighed before breakfast"
              placeholderTextColor={COLORS.textMuted}
              value={notesInput}
              onChangeText={setNotesInput}
            />

            <TouchableOpacity
              style={styles.confirmWeightBtn}
              onPress={handleSaveWeight}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmWeightBtnText}>Save Today's Weight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Global Bottom Tab Navigation */}
      <BottomNav activeRoute="progress" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  logWeightBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  container: {
    paddingBottom: 16,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  chartLargeNum: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  chartUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  targetBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  barArea: {
    height: 150,
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 12,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  targetLineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
  },
  targetLineDashes: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barPctLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTxt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  macroAvgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  avgCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  avgTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  avgTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  avgLargeNum: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  avgUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  avgSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  weightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  weightHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  weightLargeNum: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  weightGoalBox: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  weightGoalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    letterSpacing: 0.4,
  },
  weightGoalText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    marginTop: 1,
  },
  emptyWeight: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyWeightText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  weightHistoryList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  weightHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  weightDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightDateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weightLogVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  weightSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    ...SHADOWS.elevated,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  weightInputWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  weightLargeInput: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
  weightInputUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  notesInput: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  confirmWeightBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  confirmWeightBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
});
