/**
 * Improve My Diet Screen (app/improve-diet/index.js)
 * NutriScan Rule-Based Intelligent Coaching Hub:
 * - Deterministic rule engine evaluation (no AI API)
 * - Hero Coaching Banner with primary recommendation
 * - Rule-based diagnostic cards (Calories, Protein, Carbs, Fat, Food Patterns)
 * - Smart Food Swaps (Bangladeshi everyday meals & snacks)
 * - Actionable habit guidelines
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
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../../components/SectionHeader.js';
import BottomNav from '../../components/BottomNav.js';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { getUserProfile } from '../../storage/userStorage.js';
import { getMultiDayLogs } from '../../storage/mealStorage.js';
import { generateRecommendations } from '../../utils/recommendationEngine.js';
import { getLastNDays } from '../../utils/dateUtils.js';

export default function ImproveDietScreen() {
  const [profile, setProfile] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUserProfile();
      const dates = getLastNDays(7);
      const logs = await getMultiDayLogs(dates);
      setProfile(user);
      setRecentLogs(logs);
    } catch (e) {
      console.error('Error loading improve-diet data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Aggregate multi-day intake totals for 7-day pattern evaluation
  let totalCals = 0;
  let totalProt = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let loggedDaysCount = 0;
  const loggedFoodNames = [];
  const combinedMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

  recentLogs.forEach((dayLog) => {
    const c = dayLog.totals?.calories || 0;
    if (c > 0) {
      totalCals += c;
      totalProt += dayLog.totals?.protein || 0;
      totalCarbs += dayLog.totals?.carbs || 0;
      totalFat += dayLog.totals?.fat || 0;
      loggedDaysCount++;
    }

    Object.entries(dayLog.meals || {}).forEach(([mealKey, items]) => {
      (items || []).forEach((f) => {
        if (f.name) loggedFoodNames.push(f.name);
        if (combinedMeals[mealKey]) combinedMeals[mealKey].push(f);
      });
    });
  });

  const avgIntake = {
    calories: loggedDaysCount > 0 ? Math.round(totalCals / loggedDaysCount) : 0,
    protein: loggedDaysCount > 0 ? Math.round(totalProt / loggedDaysCount) : 0,
    carbs: loggedDaysCount > 0 ? Math.round(totalCarbs / loggedDaysCount) : 0,
    fat: loggedDaysCount > 0 ? Math.round(totalFat / loggedDaysCount) : 0,
  };

  const targets = {
    calories: profile?.targets?.targetCalories || 2000,
    protein: profile?.targets?.macros?.protein?.grams || 120,
    carbs: profile?.targets?.macros?.carbs?.grams || 240,
    fat: profile?.targets?.macros?.fat?.grams || 60,
  };

  // Run NutriScan Deterministic Recommendation Engine
  const coachingReport = generateRecommendations({
    intake: avgIntake,
    targets,
    goal: profile?.weightGoal || 'maintain',
    recentFoodNames: loggedFoodNames,
    loggedMeals: combinedMeals,
    daysCount: loggedDaysCount,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Improve My Diet</Text>
          <Text style={styles.headerSub}>Rule-Based Personalized Nutrition Coaching</Text>
        </View>

        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={16} color={COLORS.primaryDeep} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {/* Hero Coaching Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroPill}>
              <Ionicons name="bulb-outline" size={13} color={COLORS.primaryDeep} />
              <Text style={styles.heroPillText}>PRIMARY COACHING INSIGHT</Text>
            </View>
            <Text style={styles.heroDaysCount}>
              {loggedDaysCount > 0 ? `Based on ${loggedDaysCount} tracked days` : 'Today'}
            </Text>
          </View>

          <Text style={styles.heroOverview}>{coachingReport.overview}</Text>

          {coachingReport.goalAlignment?.summary ? (
            <View style={styles.goalRow}>
              <Ionicons name="flag-outline" size={14} color={COLORS.primaryDark} />
              <Text style={styles.goalSummaryText}>
                {coachingReport.goalAlignment.summary}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Detailed Recommendation Cards */}
        <SectionHeader
          title="Diagnostic Recommendations"
          subtitle="Specific adjustments to reach your targets"
        />

        {coachingReport.recommendations.map((rec) => {
          const isWarning = rec.type === 'warning';
          return (
            <View key={rec.id} style={styles.recCard}>
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
                    name={
                      rec.category === 'protein'
                        ? 'fitness-outline'
                        : rec.category === 'calories'
                        ? 'flame-outline'
                        : rec.category === 'fat'
                        ? 'water-outline'
                        : 'nutrition-outline'
                    }
                    size={16}
                    color={isWarning ? COLORS.warning : COLORS.primaryDark}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recCategory}>
                    Category: {rec.category.toUpperCase()}
                  </Text>
                </View>

                {rec.metrics?.ratio ? (
                  <View style={styles.ratioBadge}>
                    <Text style={styles.ratioText}>
                      {Math.round(rec.metrics.ratio * 100)}%
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.recMessageText}>{rec.message}</Text>

              {rec.explanation ? (
                <Text style={styles.recExplanationText}>{rec.explanation}</Text>
              ) : null}

              {/* Suggested Bangladeshi Foods */}
              {rec.suggestedFoods && rec.suggestedFoods.length > 0 && (
                <View style={styles.suggestedFoodsBox}>
                  <Text style={styles.suggestedFoodsTitle}>
                    Recommended Bangladeshi Foods:
                  </Text>
                  {rec.suggestedFoods.map((food, idx) => (
                    <View key={idx} style={styles.foodBulletRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={COLORS.primaryDark}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.foodBulletText}>{food}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Smart Food Swaps Section */}
        <SectionHeader
          title="Smart Food Swaps"
          subtitle="Better nutritional alternatives for common foods"
        />

        {coachingReport.suggestedSwaps.map((swap, idx) => (
          <View key={idx} style={styles.swapCard}>
            <View style={styles.swapHeader}>
              <View style={styles.swapBadge}>
                <Ionicons name="swap-horizontal" size={13} color={COLORS.primaryDeep} />
                <Text style={styles.swapBadgeText}>HEALTHIER SWAP</Text>
              </View>
              {swap.macroDelta ? (
                <View style={styles.deltaBadge}>
                  <Text style={styles.deltaText}>{swap.macroDelta}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.swapComparisonRow}>
              {/* Original */}
              <View style={styles.swapFoodCol}>
                <Text style={styles.swapLabel}>INSTEAD OF</Text>
                <Text style={styles.originalFoodText}>{swap.originalName}</Text>
              </View>

              <Ionicons
                name="arrow-forward-circle"
                size={22}
                color={COLORS.primary}
                style={{ marginHorizontal: 8 }}
              />

              {/* Better Alternative */}
              <View style={styles.swapFoodCol}>
                <Text style={[styles.swapLabel, { color: COLORS.primaryDark }]}>CHOOSE</Text>
                <Text style={styles.suggestedFoodText}>{swap.suggestedName}</Text>
              </View>
            </View>

            <Text style={styles.swapBenefitText}>{swap.benefit}</Text>
          </View>
        ))}

        {/* Actionable Daily Habits */}
        <SectionHeader
          title="Daily Nutrition Habits"
          subtitle="Evidence-based dietary guidelines"
        />

        {coachingReport.actionableHabits.map((habit, idx) => (
          <View key={idx} style={styles.habitCard}>
            <View style={styles.habitIconCircle}>
              <Ionicons name="leaf-outline" size={16} color={COLORS.primaryDeep} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.habitTitle}>{habit.title}</Text>
              <Text style={styles.habitDesc}>{habit.description}</Text>
            </View>
          </View>
        ))}

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Global Bottom Tab Navigation */}
      <BottomNav activeRoute="improve-diet" />
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
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  container: {
    paddingBottom: 16,
  },
  heroBanner: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.card,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    letterSpacing: 0.4,
  },
  heroDaysCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroOverview: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 204, 22, 0.2)',
    gap: 6,
  },
  goalSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDeep,
    flex: 1,
    lineHeight: 16,
  },
  recCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  recIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  recCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  ratioBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratioText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  recMessageText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  recExplanationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 17,
  },
  suggestedFoodsBox: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  suggestedFoodsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    marginBottom: 6,
  },
  foodBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  foodBulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  swapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  swapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  swapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  swapBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    letterSpacing: 0.3,
  },
  deltaBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  swapComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  swapFoodCol: {
    flex: 1,
  },
  swapLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  originalFoodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  suggestedFoodText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  swapBenefitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  habitIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  habitDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
