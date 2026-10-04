/**
 * Profile Screen (app/profile/index.js)
 * NutriScan user profile & metabolic blueprint:
 * - Biometrics & calculated BMI card
 * - Transparent Mifflin-St Jeor BMR & TDEE calculation breakdown
 * - Goal-based calorie & macronutrient targets
 * - Interactive profile editor with instant target recalculation
 * - Demo Data Seeder for university testing & evaluation
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../../components/SectionHeader.js';
import BottomNav from '../../components/BottomNav.js';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { ACTIVITY_LEVELS } from '../../constants/activityLevels.js';
import { GOALS, GOALS_LIST } from '../../constants/goals.js';
import { getUserProfile, saveUserProfile, clearAllStorage, logoutUser } from '../../storage/userStorage.js';
import { saveDailyLog } from '../../storage/mealStorage.js';
import { logWeight } from '../../storage/progressStorage.js';
import { formatISODate, shiftDate } from '../../utils/dateUtils.js';
import { buildMealsConfig } from '../../constants/mealConfig.js';
import { calculateBMI, getBMICategory, getIdealWeightRange } from '../../utils/bmiCalculator.js';
import BMICalculatorModal from '../../components/BMICalculatorModal.js';

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBmiModal, setShowBmiModal] = useState(false);

  // Edit form fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('22');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [weightGoal, setWeightGoal] = useState('maintain');
  const [mealCount, setMealCount] = useState(4);

  const [isSeeding, setIsSeeding] = useState(false);

  const loadUser = useCallback(async () => {
    const user = await getUserProfile();
    setProfile(user);
    setName(user?.name || 'Sajib Rahman');
    setGender(user?.gender || 'male');
    setAge(String(user?.age || 22));
    setHeight(String(user?.height || 175));
    setWeight(String(user?.weight || 70));
    setActivityLevel(user?.activityLevel || 'moderate');
    setWeightGoal(user?.weightGoal || 'mild_weight_loss');
    setMealCount(user?.mealCount || user?.mealsConfig?.length || 4);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleSave = async () => {
    try {
      const mCount = parseInt(mealCount, 10) || 4;
      const updated = await saveUserProfile({
        ...profile,
        name: name.trim() || 'NutriScan User',
        gender,
        age: parseInt(age, 10) || 22,
        height: parseFloat(height) || 175,
        weight: parseFloat(weight) || 70,
        activityLevel,
        weightGoal,
        mealCount: mCount,
        mealsConfig: (profile?.mealCount === mCount && profile?.mealsConfig) ? profile.mealsConfig : buildMealsConfig(mCount),
      });
      setProfile(updated);
      setIsEditing(false);
      Alert.alert('Profile Saved', 'Your biometrics and daily meal schedule have been updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  // Seed 7 days of realistic meal data for testing
  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      const today = formatISODate(new Date());

      for (let i = 6; i >= 0; i--) {
        const date = shiftDate(today, -i);
        const dayMeals = {
          breakfast: [
            {
              logId: `seed_b1_${date}`,
              name: 'Rolled Oats with Milk',
              servingSize: '1 bowl (180g)',
              calories: 280,
              protein: 11.5,
              carbs: 45.0,
              fat: 5.2,
            },
            {
              logId: `seed_b2_${date}`,
              name: 'Boiled Egg (Dim)',
              servingSize: '1 large (50g)',
              calories: 74,
              protein: 6.3,
              carbs: 0.4,
              fat: 5.0,
            },
          ],
          lunch: [
            {
              logId: `seed_l1_${date}`,
              name: 'Sada Bhat (Plain White Rice)',
              servingSize: '1 medium plate (150g)',
              calories: 195,
              protein: 4.1,
              carbs: 43.0,
              fat: 0.4,
            },
            {
              logId: `seed_l2_${date}`,
              name: 'Rui Macher Jhol',
              servingSize: '1 serving (150g)',
              calories: 210,
              protein: 18.5,
              carbs: 4.2,
              fat: 12.0,
            },
            {
              logId: `seed_l3_${date}`,
              name: 'Palong Shak Bhaji',
              servingSize: '1 cup (100g)',
              calories: 68,
              protein: 2.8,
              carbs: 4.0,
              fat: 4.2,
            },
            {
              logId: `seed_l4_${date}`,
              name: 'Masoor Dal (Patla)',
              servingSize: '1 cup (150g)',
              calories: 110,
              protein: 7.2,
              carbs: 16.5,
              fat: 1.8,
            },
          ],
          dinner: [
            {
              logId: `seed_d1_${date}`,
              name: 'Atta Ruti',
              servingSize: '2 medium pieces (70g)',
              calories: 190,
              protein: 6.0,
              carbs: 38.0,
              fat: 0.8,
            },
            {
              logId: `seed_d2_${date}`,
              name: 'Broiler Chicken Curry',
              servingSize: '1 piece with jhol (150g)',
              calories: 240,
              protein: 20.5,
              carbs: 3.5,
              fat: 14.5,
            },
          ],
          snacks: [
            {
              logId: `seed_s1_${date}`,
              name: 'Banana (Kola)',
              servingSize: '1 medium (120g)',
              calories: 105,
              protein: 1.3,
              carbs: 27.0,
              fat: 0.3,
            },
          ],
        };

        const totals = {
          calories: 1472,
          protein: 75.4,
          carbs: 181.6,
          fat: 44.2,
          fiber: 16.0,
        };

        await saveDailyLog({
          date,
          meals: dayMeals,
          waterMl: 2000,
          totals,
        });

        // Seed weight variations
        await logWeight(date, 70.5 - (6 - i) * 0.1, 'Demo entry');
      }

      setIsSeeding(false);
      Alert.alert('Demo Data Populated', '7 days of realistic meals and weight logs have been populated. Check Home and Progress screens!');
    } catch (e) {
      setIsSeeding(false);
      Alert.alert('Error', 'Failed to seed demo data.');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Reset All Data?',
      'This will erase all recorded meals, weight history, and reset your profile to default.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllStorage();
            await loadUser();
            Alert.alert('Reset Complete', 'App storage has been restored to default state.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      `Are you sure you want to log out from ${profile?.name || 'NutriScan'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            router.replace('/login');
          },
        },
      ]
    );
  };

  // Calculate BMI using clinical calculator
  const heightM = (profile?.height || 175) / 100;
  const bmi = heightM > 0 ? (profile?.weight / (heightM * heightM)).toFixed(1) : '22.8';
  const bmiCat = getBMICategory(bmi, profile?.age || 22);

  // Live BMI calculated while editing profile biometrics
  const liveBmi = calculateBMI(parseFloat(weight), parseFloat(height));
  const liveBmiCat = getBMICategory(liveBmi, parseInt(age, 10) || 22);
  const liveIdealRange = getIdealWeightRange(parseFloat(height));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>User Profile</Text>
          <Text style={styles.headerSub}>Metabolic Targets & Personal Settings</Text>
        </View>

        <View style={styles.headerActionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(!isEditing)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEditing ? 'close' : 'create-outline'}
              size={15}
              color={COLORS.primaryDeep}
            />
            <Text style={styles.editBtnText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutHeaderBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={17} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* User Biometrics Card */}
        <View style={styles.userCard}>
          <View style={styles.userHeroRow}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person" size={28} color={COLORS.primaryDeep} />
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.profileName}>{profile?.name || 'Sajib Rahman'}</Text>
              {Boolean(profile?.email) && (
                <Text style={styles.profileEmail}>{profile.email}</Text>
              )}
              <Text style={styles.profileSubtitle}>
                {profile?.gender?.toUpperCase()} • {profile?.age || 22} yrs • {profile?.mealCount || 4} meals/day
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.bmiBadge, { backgroundColor: COLORS.primaryLight }]}
              onPress={() => setShowBmiModal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.bmiText, { color: bmiCat.color }]}>BMI {bmi}</Text>
              <Text style={styles.bmiSubText}>{bmiCat.label}</Text>
              <Text style={styles.bmiTapHint}>Check BMI ❯</Text>
            </TouchableOpacity>
          </View>

          {/* Biometrics 3-col Grid */}
          <View style={styles.bioGrid}>
            <View style={styles.bioItem}>
              <Text style={styles.bioLabel}>HEIGHT</Text>
              <Text style={styles.bioValue}>
                {profile?.height || 175}
                <Text style={styles.bioUnit}> cm</Text>
              </Text>
            </View>
            <View style={styles.bioDivider} />
            <View style={styles.bioItem}>
              <Text style={styles.bioLabel}>WEIGHT</Text>
              <Text style={styles.bioValue}>
                {profile?.weight || 70}
                <Text style={styles.bioUnit}> kg</Text>
              </Text>
            </View>
            <View style={styles.bioDivider} />
            <View style={styles.bioItem}>
              <Text style={styles.bioLabel}>ACTIVITY</Text>
              <Text style={styles.bioValueSmall} numberOfLines={1}>
                {profile?.activityLevel?.toUpperCase() || 'MODERATE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Form (Shown when isEditing = true) */}
        {isEditing && (
          <View style={styles.editCard}>
            <Text style={styles.editSectionTitle}>Update Biometrics & Goal</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderBtn,
                      gender === 'male' && styles.genderBtnActive,
                    ]}
                    onPress={() => setGender('male')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'male' && styles.genderTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderBtn,
                      gender === 'female' && styles.genderBtnActive,
                    ]}
                    onPress={() => setGender('female')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'female' && styles.genderTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            {/* Live BMI & Ideal Weight Preview while editing */}
            <View style={styles.liveBmiBox}>
              <View style={styles.liveBmiHeader}>
                <View>
                  <Text style={styles.liveBmiTitle}>Live BMI Calculation</Text>
                  <Text style={styles.liveBmiSub}>Calculated for Age {age || 22}, Height {height || 175} cm</Text>
                </View>
                <View style={[styles.liveBmiBadge, { backgroundColor: liveBmiCat.bgColor }]}>
                  <Text style={[styles.liveBmiBadgeText, { color: liveBmiCat.color }]}>
                    {liveBmi ? `BMI ${liveBmi} • ${liveBmiCat.label}` : 'Enter Height & Weight'}
                  </Text>
                </View>
              </View>
              {liveIdealRange && (
                <Text style={styles.liveIdealText}>
                  Healthy Weight Range for {height} cm:{' '}
                  <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>
                    {liveIdealRange.minKg} – {liveIdealRange.maxKg} kg
                  </Text>
                </Text>
              )}
            </View>

            {/* Weight Goal Selector */}
            <Text style={styles.inputLabel}>Weight Goal</Text>
            <View style={styles.goalChipsWrap}>
              {GOALS_LIST.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.goalChip,
                    weightGoal === g.id && styles.goalChipActive,
                  ]}
                  onPress={() => setWeightGoal(g.id)}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      weightGoal === g.id && styles.goalChipTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Daily Meal Schedule Count */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Daily Meal Frequency (প্রতিদিন কত বেলা খাবার চান?)
            </Text>
            <View style={styles.goalChipsWrap}>
              {[2, 3, 4, 5, 6].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.goalChip,
                    mealCount === count && styles.goalChipActive,
                  ]}
                  onPress={() => setMealCount(count)}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      mealCount === count && styles.goalChipTextActive,
                    ]}
                  >
                    {count} Meals
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save & Recalculate Blueprint</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Metabolic Blueprint Calculations Card */}
        <SectionHeader
          title="Metabolic Blueprint"
          subtitle="Formulas & personalized targets"
        />

        <View style={styles.blueprintCard}>
          <View style={styles.blueprintItem}>
            <View style={styles.blueprintTopRow}>
              <Text style={styles.blueprintTitle}>Basal Metabolic Rate (BMR)</Text>
              <Text style={styles.blueprintValue}>
                {profile?.targets?.bmr || 1680} kcal
              </Text>
            </View>
            <Text style={styles.blueprintFormula}>
              Mifflin-St Jeor Equation: 10 × weight(kg) + 6.25 × height(cm) - 5 × age + s
            </Text>
          </View>

          <View style={styles.blueprintItem}>
            <View style={styles.blueprintTopRow}>
              <Text style={styles.blueprintTitle}>Total Daily Energy Expenditure (TDEE)</Text>
              <Text style={styles.blueprintValue}>
                {profile?.targets?.tdee || 2604} kcal
              </Text>
            </View>
            <Text style={styles.blueprintFormula}>
              BMR × Physical Activity Level ({profile?.activityLevel || 'moderate'})
            </Text>
          </View>

          <View style={[styles.blueprintItem, styles.highlightBlueprintItem]}>
            <View style={styles.blueprintTopRow}>
              <Text style={[styles.blueprintTitle, { color: COLORS.primaryDeep }]}>
                Daily Calorie Target
              </Text>
              <Text style={[styles.blueprintValue, { color: COLORS.primaryDeep, fontSize: 18 }]}>
                {profile?.targets?.targetCalories || 2354} kcal
              </Text>
            </View>
            <Text style={styles.blueprintFormula}>
              Target adjusted for {profile?.weightGoal?.replace('_', ' ') || 'maintenance'}
            </Text>
          </View>

          {/* Macro Split Summary */}
          <View style={styles.macroSplitRow}>
            <View style={styles.macroSplitCol}>
              <Text style={[styles.macroSplitLabel, { color: COLORS.protein }]}>Protein</Text>
              <Text style={styles.macroSplitVal}>
                {profile?.targets?.macros?.protein?.grams || 126}g
              </Text>
              <Text style={styles.macroSplitCals}>
                {profile?.targets?.macros?.protein?.calories || 504} kcal
              </Text>
            </View>

            <View style={styles.macroSplitCol}>
              <Text style={[styles.macroSplitLabel, { color: COLORS.carbs }]}>Carbohydrates</Text>
              <Text style={styles.macroSplitVal}>
                {profile?.targets?.macros?.carbs?.grams || 298}g
              </Text>
              <Text style={styles.macroSplitCals}>
                {profile?.targets?.macros?.carbs?.calories || 1192} kcal
              </Text>
            </View>

            <View style={styles.macroSplitCol}>
              <Text style={[styles.macroSplitLabel, { color: COLORS.fat }]}>Fat</Text>
              <Text style={styles.macroSplitVal}>
                {profile?.targets?.macros?.fat?.grams || 73}g
              </Text>
              <Text style={styles.macroSplitCals}>
                {profile?.targets?.macros?.fat?.calories || 659} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Tools & Demo Seeder */}
        <SectionHeader
          title="Evaluation & Developer Tools"
          subtitle="Instant demo data generator for testing"
        />

        <View style={styles.toolsCard}>
          <TouchableOpacity
            style={styles.switchProfileBtn}
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={16} color={COLORS.primaryDeep} />
            <Text style={styles.switchProfileBtnText}>Switch Profile / Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.seedBtn}
            onPress={handleSeedDemoData}
            disabled={isSeeding}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.primaryDeep} />
            <Text style={styles.seedBtnText}>
              {isSeeding ? 'Seeding Demo Logs...' : 'Populate 7-Day Demo Meals & Weight'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Log Out of Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleClearAll}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.resetBtnText}>Clear All Logged Data</Text>
          </TouchableOpacity>
        </View>

        {/* Academic Project Credits */}
        <View style={styles.creditsCard}>
          <Text style={styles.creditsTitle}>NutriScan v1.0.0</Text>
          <Text style={styles.creditsText}>
            Individual University Project: Mobile Nutrition and Calorie Tracker.
            Food dataset curated from FCTB (Institute of Nutrition and Food Science, University of Dhaka) and USDA FoodData Central.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Global Bottom Tab Navigation */}
      <BottomNav activeRoute="profile" />

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
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  switchProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  switchProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.error,
  },
  container: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  userHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: 1,
  },
  profileSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  bmiText: {
    fontSize: 13,
    fontWeight: '900',
  },
  bmiSubText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bmiTapHint: {
    fontSize: 8,
    color: COLORS.primaryDark,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  liveBmiBox: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  liveBmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBmiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  liveBmiSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  liveBmiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveBmiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  liveIdealText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  bioGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bioItem: {
    flex: 1,
    alignItems: 'center',
  },
  bioLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  bioValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bioValueSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  bioUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bioDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  editCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDeep,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: COLORS.primary,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.textInverted,
  },
  goalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  goalChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
  },
  goalChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  goalChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  goalChipTextActive: {
    color: COLORS.primaryDeep,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
    ...SHADOWS.soft,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
  blueprintCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  blueprintItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  highlightBlueprintItem: {
    backgroundColor: COLORS.primaryLighter,
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    borderBottomWidth: 0,
  },
  blueprintTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blueprintTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  blueprintValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  blueprintFormula: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  macroSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  macroSplitCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroSplitLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  macroSplitVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  macroSplitCals: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  toolsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 10,
    ...SHADOWS.soft,
  },
  seedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  seedBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.error,
  },
  creditsCard: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  creditsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
