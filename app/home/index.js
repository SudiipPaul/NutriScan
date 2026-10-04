/**
 * Home Screen (app/home/index.js)
 * NutriScan main dashboard:
 * - Clean white background with soft lime green accent
 * - Horizontal 7-day date selector strip
 * - Hero Calorie Progress Card with large readable numbers & ring
 * - Quick metric cards (Water Hydration + Diet Quality Score)
 * - Macronutrient Breakdown (Protein, Carbs, Fat)
 * - Customizable Daily Meal Diary (User configurable meal count e.g. 2, 3, 4, 5, 6 meals)
 * - Bottom Tab Navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CalorieCard from '../../components/CalorieCard.js';
import MacroCard from '../../components/MacroCard.js';
import MealCard from '../../components/MealCard.js';
import SectionHeader from '../../components/SectionHeader.js';
import DateCalendarStrip from '../../components/DateCalendarStrip.js';
import QuickMetricCard from '../../components/QuickMetricCard.js';
import BottomNav from '../../components/BottomNav.js';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { getUserProfile, updateUserMealsConfig } from '../../storage/userStorage.js';
import { getDailyLog, removeFoodFromMeal, updateWater } from '../../storage/mealStorage.js';
import { calculateNutritionScore } from '../../utils/nutritionScore.js';
import { formatISODate } from '../../utils/dateUtils.js';
import { getUserMeals, buildMealsConfig, getMealItemsFromLog } from '../../constants/mealConfig.js';
import BMICalculatorModal from '../../components/BMICalculatorModal.js';

export default function HomeScreen() {
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

  // Meal Customization Modal State
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealCount, setMealCount] = useState(4);
  const [editableMeals, setEditableMeals] = useState([]);

  // BMI Checker Modal State
  const [showBmiModal, setShowBmiModal] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUserProfile();
      const log = await getDailyLog(selectedDate);
      setProfile(user);
      setDayLog(log);
    } catch (e) {
      console.error('Error loading home data', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Reload data automatically whenever user focuses or returns to this screen
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddFood = (mealKey) => {
    router.push({
      pathname: '/add-food',
      params: { meal: mealKey, date: selectedDate },
    });
  };

  const handleDeleteItem = async (mealKey, logId) => {
    const updated = await removeFoodFromMeal(selectedDate, mealKey, logId);
    setDayLog(updated);
  };

  const handleAddWater = async (amount = 250) => {
    const newTotal = (dayLog.waterMl || 0) + amount;
    const updated = await updateWater(selectedDate, newTotal);
    setDayLog(updated);
  };

  // Open the Meal Configuration Modal
  const handleOpenMealModal = () => {
    const currentMeals = getUserMeals(profile);
    setMealCount(currentMeals.length);
    setEditableMeals(JSON.parse(JSON.stringify(currentMeals)));
    setShowMealModal(true);
  };

  // Change meal count and regenerate preset names
  const handleSelectCount = (count) => {
    const c = Math.max(1, Math.min(8, parseInt(count, 10) || 4));
    setMealCount(c);
    const newPreset = buildMealsConfig(c);
    setEditableMeals(newPreset);
  };

  const handleUpdateMealName = (index, text) => {
    const updated = [...editableMeals];
    if (updated[index]) {
      updated[index] = { ...updated[index], name: text };
      setEditableMeals(updated);
    }
  };

  const handleSaveMealConfig = async () => {
    try {
      const updatedUser = await updateUserMealsConfig(editableMeals, mealCount);
      setProfile(updatedUser);
      setShowMealModal(false);
      Alert.alert(
        'Schedule Updated',
        `Daily meal schedule successfully set to ${mealCount} meals!`
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal schedule.');
    }
  };

  const targetCalories = profile?.targets?.targetCalories || 2000;
  const targetWater = profile?.targets?.targetWaterMl || 2500;
  const waterGlasses = Math.round(dayLog.waterMl / 250);
  const waterTargetGlasses = Math.round(targetWater / 250);

  // Compute real-time daily diet quality score
  const dietScore = calculateNutritionScore(dayLog.totals, profile?.targets, dayLog.waterMl);

  // Active meals configured for this user
  const configuredMeals = getUserMeals(profile);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.userGreetingRow}>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={18} color={COLORS.primaryDeep} />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.greetingSub}>Good day!</Text>
            <Text style={styles.userName}>{profile?.name || 'NutriScan User'}</Text>
          </View>
        </View>

        <View style={styles.headerActionRow}>
          <TouchableOpacity
            style={styles.bmiHeaderBtn}
            onPress={() => setShowBmiModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="fitness-outline" size={14} color={COLORS.primaryDark} />
            <Text style={styles.bmiHeaderBtnText}>BMI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/analysis')}
            activeOpacity={0.7}
          >
            <Ionicons name="pie-chart-outline" size={19} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={19} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 7-Day Date Selector Strip */}
      <DateCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {/* Hero Calorie Card */}
        <CalorieCard
          targetCalories={targetCalories}
          consumedCalories={dayLog.totals.calories}
        />

        {/* Side-by-Side Quick Health Metrics (Water + Diet Score) */}
        <View style={styles.metricsRow}>
          <QuickMetricCard
            title="Drink Water"
            value={waterGlasses}
            unit={`/ ${waterTargetGlasses} glass`}
            subtitle={`${dayLog.waterMl} ml logged`}
            iconName="water"
            iconColor={COLORS.water}
            iconBgColor={COLORS.waterLight}
            actionText="+250ml"
            onActionPress={() => handleAddWater(250)}
            secondaryActionText={dayLog.waterMl > 0 ? '-250ml' : null}
            onSecondaryActionPress={() => handleAddWater(-250)}
          />

          <QuickMetricCard
            title="Diet Quality"
            value={dayLog.totals.calories > 0 ? dietScore : '--'}
            unit={dayLog.totals.calories > 0 ? '/ 100' : ''}
            subtitle={
              dayLog.totals.calories > 0
                ? dietScore >= 80
                  ? 'Optimal balance'
                  : 'Needs attention'
                : 'No meals logged'
            }
            iconName="shield-checkmark"
            iconColor={dayLog.totals.calories > 0 ? COLORS.primaryDark : COLORS.textMuted}
            iconBgColor={dayLog.totals.calories > 0 ? COLORS.primaryLight : COLORS.surfaceSecondary}
            actionText="Analyze"
            onActionPress={() => router.push('/analysis')}
          />
        </View>

        {/* Macronutrient Breakdown Card */}
        <MacroCard
          actualTotals={dayLog.totals}
          targets={profile?.targets}
        />

        {/* Daily Meal Diary Section Header */}
        <SectionHeader
          title="Daily Meals"
          subtitle={`Schedule: ${configuredMeals.length} meals per day`}
          actionText="Search Foods"
          onActionPress={() => router.push('/add-food')}
        />

        {/* Quick Meal Schedule Customizer Banner */}
        <View style={styles.scheduleBannerCard}>
          <View style={styles.scheduleBannerLeft}>
            <View style={styles.scheduleIconWrap}>
              <Ionicons name="restaurant-outline" size={16} color={COLORS.primaryDeep} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.scheduleBannerTitle}>
                {configuredMeals.length} Meals Daily Plan
              </Text>
              <Text style={styles.scheduleBannerSub}>
                Customize your meal frequency anytime
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scheduleChangeBtn}
            onPress={handleOpenMealModal}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={13} color={COLORS.primaryDark} />
            <Text style={styles.scheduleChangeBtnText}>Customize</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Meal Cards based on User's Configured Meal Count */}
        {configuredMeals.map((meal, index) => {
          const items = getMealItemsFromLog(dayLog, meal.id, index);
          return (
            <MealCard
              key={meal.id}
              mealKey={meal.id}
              title={meal.name}
              iconName={meal.icon || 'restaurant-outline'}
              items={items}
              onAddPress={handleAddFood}
              onDeleteItem={handleDeleteItem}
            />
          );
        })}

        {/* Bottom Spacing */}
        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Global Bottom Tab Navigation */}
      <BottomNav activeRoute="home" />

      {/* Customizable Meal Schedule Modal */}
      <Modal
        visible={showMealModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Daily Meal Schedule</Text>
                <Text style={styles.modalSub}>
                  How many meals do you eat per day? (প্রতিদিন কত বেলা?)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowMealModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Quick Preset Selector Chips */}
              <Text style={styles.modalSectionLabel}>Select Number of Meals</Text>
              <View style={styles.countChipsRow}>
                {[2, 3, 4, 5, 6].map((count) => {
                  const isSelected = mealCount === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[styles.countChip, isSelected && styles.selectedCountChip]}
                      onPress={() => handleSelectCount(count)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.countChipText,
                          isSelected && styles.selectedCountChipText,
                        ]}
                      >
                        {count} Meals
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Counter Buttons / Stepper */}
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepBtn, mealCount <= 1 && styles.stepBtnDisabled]}
                  onPress={() => handleSelectCount(mealCount - 1)}
                  disabled={mealCount <= 1}
                >
                  <Ionicons name="remove" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.stepperDisplay}>
                  <Text style={styles.stepperValue}>{mealCount}</Text>
                  <Text style={styles.stepperUnit}>meals / day</Text>
                </View>

                <TouchableOpacity
                  style={[styles.stepBtn, mealCount >= 8 && styles.stepBtnDisabled]}
                  onPress={() => handleSelectCount(mealCount + 1)}
                  disabled={mealCount >= 8}
                >
                  <Ionicons name="add" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Editable Meal Names */}
              <Text style={[styles.modalSectionLabel, { marginTop: 18 }]}>
                Meal Names & Labels (Optional)
              </Text>
              <View style={styles.editableMealsList}>
                {editableMeals.map((item, idx) => (
                  <View key={item.id || idx} style={styles.editableMealRow}>
                    <View style={styles.editableMealIcon}>
                      <Ionicons
                        name={item.icon || 'restaurant-outline'}
                        size={16}
                        color={COLORS.primaryDark}
                      />
                    </View>
                    <TextInput
                      style={styles.editableMealInput}
                      value={item.name}
                      onChangeText={(txt) => handleUpdateMealName(idx, txt)}
                      placeholder={`Meal ${idx + 1}`}
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                ))}
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowMealModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveMealConfig}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.textInverted} />
                <Text style={styles.modalSaveBtnText}>Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Interactive BMI Calculator Modal */}
      <BMICalculatorModal
        visible={showBmiModal}
        onClose={() => setShowBmiModal(false)}
        initialHeight={profile?.height || 175}
        initialWeight={profile?.weight || 70}
        initialAge={profile?.age || 22}
        initialGender={profile?.gender || 'male'}
        currentProfile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
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
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  bmiHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    gap: 12,
  },
  scheduleBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.soft,
  },
  scheduleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scheduleBannerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  scheduleChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  scheduleChangeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    marginTop: 14,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  countChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  countChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  selectedCountChip: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  countChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  selectedCountChipText: {
    color: COLORS.textInverted,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.soft,
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepperDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  stepperUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  editableMealsList: {
    gap: 8,
  },
  editableMealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  editableMealIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editableMealInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: 6,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalSaveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    ...SHADOWS.soft,
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
});
