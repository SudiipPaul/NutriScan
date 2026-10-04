/**
 * Daily Analysis Screen (app/analysis/index.js)
 * NutriScan nutritional diagnostics & target comparison:
 * - 7-Day Date Calendar Strip
 * - Diet Quality Score (0-100)
 * - Caloric Energy Distribution (Protein vs Carbs vs Fat % breakdown)
 * - Macro Targets vs Actual Intake comparison cards with large numbers
 * - Deterministic Rule-Based Alert highlights
 * - Bottom Tab Navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NutritionScore from '../../components/NutritionScore.js';
import DateCalendarStrip from '../../components/DateCalendarStrip.js';
import SectionHeader from '../../components/SectionHeader.js';
import BottomNav from '../../components/BottomNav.js';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { getUserProfile } from '../../storage/userStorage.js';
import { getDailyLog } from '../../storage/mealStorage.js';
import { generateRecommendations } from '../../utils/recommendationEngine.js';
import { formatISODate } from '../../utils/dateUtils.js';

export default function AnalysisScreen() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));
  const [profile, setProfile] = useState(null);
  const [dayLog, setDayLog] = useState({
    date: selectedDate,
    meals: {},
    waterMl: 0,
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUserProfile();
      const log = await getDailyLog(selectedDate);
      setProfile(user);
      setDayLog(log);
    } catch (e) {
      console.error('Error loading analysis', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const targets = profile?.targets || {
    targetCalories: 2000,
    macros: { protein: { grams: 120 }, carbs: { grams: 240 }, fat: { grams: 60 } },
  };

  // Collect logged food names for contextual pattern analysis
  const loggedNames = [];
  Object.values(dayLog.meals || {}).forEach((mealList) => {
    (mealList || []).forEach((item) => {
      if (item.name) loggedNames.push(item.name);
    });
  });

  // Run Rule-Based Recommendation Engine
  const analysisReport = generateRecommendations({
    intake: dayLog.totals,
    targets: {
      calories: targets.targetCalories,
      protein: targets.macros?.protein?.grams || 120,
      carbs: targets.macros?.carbs?.grams || 240,
      fat: targets.macros?.fat?.grams || 60,
    },
    goal: profile?.weightGoal || 'maintain',
    recentFoodNames: loggedNames,
    loggedMeals: dayLog.meals,
    daysCount: 1,
  });

  // Calculate Caloric Energy Split
  const totalCals = dayLog.totals.calories || 0;
  const pCals = Math.round((dayLog.totals.protein || 0) * 4);
  const cCals = Math.round((dayLog.totals.carbs || 0) * 4);
  const fCals = Math.round((dayLog.totals.fat || 0) * 9);

  const pPct = totalCals > 0 ? Math.round((pCals / totalCals) * 100) : 0;
  const cPct = totalCals > 0 ? Math.round((cCals / totalCals) * 100) : 0;
  const fPct = totalCals > 0 ? Math.round((fCals / totalCals) * 100) : 0;

  const targetCals = targets.targetCalories || 2000;
  const calRatio = targetCals > 0 ? Math.round((totalCals / targetCals) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Analysis</Text>
          <Text style={styles.headerSub}>Actual Intake vs Nutritional Targets</Text>
        </View>

        <TouchableOpacity
          style={styles.progressToggleBtn}
          onPress={() => router.push('/progress')}
          activeOpacity={0.8}
        >
          <Ionicons name="bar-chart-outline" size={15} color={COLORS.primaryDeep} />
          <Text style={styles.progressToggleText}>Weekly</Text>
        </TouchableOpacity>
      </View>

      {/* Date Selector Strip */}
      <DateCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {/* Diet Score Card */}
        <NutritionScore
          score={
            totalCals === 0
              ? 0
              : Math.min(
                  100,
                  Math.max(
                    20,
                    100 -
                      Math.abs(100 - calRatio) * 0.4 -
                      (analysisReport.recommendations.filter((r) => r.type === 'warning').length * 15)
                  )
                )
          }
        />

        {/* Caloric Energy Distribution Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Caloric Energy Ratio</Text>
            <Text style={styles.cardSub}>% of total calories</Text>
          </View>

          {/* Segmented Bar */}
          <View style={styles.segmentedBar}>
            {pPct > 0 && (
              <View
                style={[
                  styles.segment,
                  { width: `${pPct}%`, backgroundColor: COLORS.protein },
                ]}
              />
            )}
            {cPct > 0 && (
              <View
                style={[
                  styles.segment,
                  { width: `${cPct}%`, backgroundColor: COLORS.carbs },
                ]}
              />
            )}
            {fPct > 0 && (
              <View
                style={[
                  styles.segment,
                  { width: `${fPct}%`, backgroundColor: COLORS.fat },
                ]}
              />
            )}
            {totalCals === 0 && (
              <View
                style={[
                  styles.segment,
                  { width: '100%', backgroundColor: COLORS.surfaceSecondary },
                ]}
              />
            )}
          </View>

          {/* Legend Items with Large Readable Percentages */}
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.protein }]} />
              <View>
                <Text style={styles.legendLabel}>Protein</Text>
                <Text style={styles.legendVal}>
                  {pPct}% <Text style={styles.legendGrams}>({dayLog.totals.protein}g)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.carbs }]} />
              <View>
                <Text style={styles.legendLabel}>Carbohydrates</Text>
                <Text style={styles.legendVal}>
                  {cPct}% <Text style={styles.legendGrams}>({dayLog.totals.carbs}g)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.fat }]} />
              <View>
                <Text style={styles.legendLabel}>Fats</Text>
                <Text style={styles.legendVal}>
                  {fPct}% <Text style={styles.legendGrams}>({dayLog.totals.fat}g)</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metric Target Comparisons Grid */}
        <SectionHeader
          title="Macro Target Comparisons"
          subtitle="Detailed breakdown of today's nutrients"
        />

        <View style={styles.macroCardsGrid}>
          {/* Calories Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricTitle}>Energy</Text>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>
                  {Math.round((totalCals / Math.max(1, targetCals)) * 100)}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricLargeNumber}>
              {totalCals.toLocaleString()}
              <Text style={styles.metricUnit}> kcal</Text>
            </Text>
            <Text style={styles.metricTargetText}>Target: {targetCals.toLocaleString()} kcal</Text>
          </View>

          {/* Protein Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={[styles.metricTitle, { color: COLORS.protein }]}>Protein</Text>
              <View style={[styles.pillBadge, { backgroundColor: COLORS.proteinLight }]}>
                <Text style={[styles.pillBadgeText, { color: COLORS.protein }]}>
                  {Math.round(
                    (dayLog.totals.protein / Math.max(1, targets.macros?.protein?.grams || 120)) * 100
                  )}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricLargeNumber}>
              {dayLog.totals.protein}
              <Text style={styles.metricUnit}> g</Text>
            </Text>
            <Text style={styles.metricTargetText}>
              Target: {targets.macros?.protein?.grams || 120} g
            </Text>
          </View>

          {/* Carbs Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={[styles.metricTitle, { color: COLORS.carbs }]}>Carbs</Text>
              <View style={[styles.pillBadge, { backgroundColor: COLORS.carbsLight }]}>
                <Text style={[styles.pillBadgeText, { color: COLORS.carbs }]}>
                  {Math.round(
                    (dayLog.totals.carbs / Math.max(1, targets.macros?.carbs?.grams || 240)) * 100
                  )}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricLargeNumber}>
              {dayLog.totals.carbs}
              <Text style={styles.metricUnit}> g</Text>
            </Text>
            <Text style={styles.metricTargetText}>
              Target: {targets.macros?.carbs?.grams || 240} g
            </Text>
          </View>

          {/* Fat Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={[styles.metricTitle, { color: COLORS.fat }]}>Fat</Text>
              <View style={[styles.pillBadge, { backgroundColor: COLORS.fatLight }]}>
                <Text style={[styles.pillBadgeText, { color: COLORS.fat }]}>
                  {Math.round(
                    (dayLog.totals.fat / Math.max(1, targets.macros?.fat?.grams || 60)) * 100
                  )}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricLargeNumber}>
              {dayLog.totals.fat}
              <Text style={styles.metricUnit}> g</Text>
            </Text>
            <Text style={styles.metricTargetText}>
              Target: {targets.macros?.fat?.grams || 60} g
            </Text>
          </View>
        </View>

        {/* Rule-Based Recommendations Preview */}
        <SectionHeader
          title="Rule-Based Diagnostics"
          subtitle="Clinical observations for today's intake"
          actionText="View Coaching"
          onActionPress={() => router.push('/improve-diet')}
        />

        {analysisReport.recommendations.map((rec) => {
          const isWarning = rec.type === 'warning';
          return (
            <View key={rec.id} style={styles.recommendationCard}>
              <View style={styles.recHeaderRow}>
                <View
                  style={[
                    styles.recIconBox,
                    {
                      backgroundColor: isWarning ? COLORS.warningLight : COLORS.primaryLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={isWarning ? 'alert-circle' : 'checkmark-circle'}
                    size={16}
                    color={isWarning ? COLORS.warning : COLORS.primaryDark}
                  />
                </View>
                <Text style={styles.recTitle}>{rec.title}</Text>
              </View>

              <Text style={styles.recMessage}>{rec.message}</Text>

              {rec.explanation ? (
                <Text style={styles.recExplanation}>{rec.explanation}</Text>
              ) : null}
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Global Bottom Tab Navigation */}
      <BottomNav activeRoute="analysis" />
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
  progressToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  progressToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  container: {
    paddingBottom: 16,
  },
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  segmentedBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceSecondary,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
  },
  segment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  legendVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  legendGrams: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  macroCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pillBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  metricLargeNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricTargetText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  recommendationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  recMessage: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  recExplanation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
});
