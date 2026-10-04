/**
 * Onboarding Screen (app/onboarding/index.js)
 * Collects user metrics, activity level, and weight goal with live BMR/TDEE calculation.
 */

import React, { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { ACTIVITY_LEVELS } from '../../constants/activityLevels.js';
import { GOALS } from '../../constants/goals.js';
import { generateNutritionProfile } from '../../utils/macroCalculator.js';
import { saveUserProfile } from '../../storage/userStorage.js';
import { buildMealsConfig } from '../../constants/mealConfig.js';
import { calculateBMI, getBMICategory, getIdealWeightRange } from '../../utils/bmiCalculator.js';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('22');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [weightGoal, setWeightGoal] = useState('lose_mild');
  const [isSaving, setIsSaving] = useState(false);

  // Live computed blueprint
  const computedNutrition = useMemo(() => {
    return generateNutritionProfile({
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 175,
      age: parseInt(age, 10) || 22,
      gender,
      activityLevel,
      weightGoal,
    });
  }, [weight, height, age, gender, activityLevel, weightGoal]);

  const liveBmi = useMemo(() => {
    return calculateBMI(parseFloat(weight), parseFloat(height));
  }, [weight, height]);

  const liveBmiCat = useMemo(() => {
    return getBMICategory(liveBmi, parseInt(age, 10) || 22);
  }, [liveBmi, age]);

  const liveIdeal = useMemo(() => {
    return getIdealWeightRange(parseFloat(height));
  }, [height]);

  const handleNext = () => {
    const a = parseInt(age, 10);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!a || a < 12 || a > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age (12-100).');
      return;
    }
    if (!h || h < 100 || h > 250) {
      Alert.alert('Invalid Height', 'Please enter a height in cm (100-250).');
      return;
    }
    if (!w || w < 30 || w > 300) {
      Alert.alert('Invalid Weight', 'Please enter a weight in kg (30-300).');
      return;
    }

    setStep(2);
  };

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      await saveUserProfile({
        name: name.trim() || 'Student User',
        gender,
        age: parseInt(age, 10) || 22,
        height: parseFloat(height) || 175,
        weight: parseFloat(weight) || 70,
        activityLevel,
        weightGoal,
        mealCount: 4,
        mealsConfig: buildMealsConfig(4),
      });

      router.replace('/home');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="nutrition" size={24} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.headerTitle}>NutriScan</Text>
          <Text style={styles.stepBadge}>Step {step} of 2</Text>
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.heading}>Personal Health Profile</Text>
            <Text style={styles.subheading}>
              NutriScan uses the clinical Mifflin-St Jeor formula to compute your true basal energy rate.
            </Text>

            {/* Name Input */}
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Gender Selection */}
            <Text style={styles.label}>Biological Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderCard, gender === 'male' && styles.activeGenderCard]}
                onPress={() => setGender('male')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={gender === 'male' ? COLORS.primaryDark : COLORS.textSecondary}
                />
                <Text style={[styles.genderText, gender === 'male' && styles.activeGenderText]}>
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderCard, gender === 'female' && styles.activeGenderCard]}
                onPress={() => setGender('female')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={gender === 'female' ? COLORS.primaryDark : COLORS.textSecondary}
                />
                <Text style={[styles.genderText, gender === 'female' && styles.activeGenderText]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            {/* Metrics Row: Age, Height, Weight */}
            <View style={styles.metricsGrid}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Age (yrs)</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              <View style={styles.gridCol}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              <View style={styles.gridCol}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Live BMI & Ideal Weight Banner */}
            {liveBmi ? (
              <View style={styles.liveBmiBanner}>
                <View style={styles.liveBmiTop}>
                  <Text style={styles.liveBmiLabel}>BODY MASS INDEX (BMI)</Text>
                  <View style={[styles.liveBmiTag, { backgroundColor: liveBmiCat.bgColor }]}>
                    <Text style={[styles.liveBmiTagText, { color: liveBmiCat.color }]}>
                      {liveBmi} • {liveBmiCat.label}
                    </Text>
                  </View>
                </View>
                {liveIdeal ? (
                  <Text style={styles.liveIdealSub}>
                    Healthy weight for {height} cm: <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>{liveIdeal.minKg} – {liveIdeal.maxKg} kg</Text>
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* Physical Activity Level */}
            <Text style={styles.label}>Physical Activity Level</Text>
            <View style={styles.activityList}>
              {Object.entries(ACTIVITY_LEVELS).map(([k, item]) => {
                const isSelected = activityLevel === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.activityCard, isSelected && styles.activeActivityCard]}
                    onPress={() => setActivityLevel(k)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTitle, isSelected && styles.activeActivityTitle]}>
                        {item.label} ({item.multiplier}x)
                      </Text>
                      <Text style={styles.activityDesc}>{item.description}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.primaryDark : COLORS.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Continue to Weight Goal</Text>
              <Ionicons name="arrow-forward" size={18} color="#0F172A" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Step 2: Goal & Computed Blueprint */}
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={16} color={COLORS.primaryDark} />
              <Text style={styles.backBtnText}>Edit Body Metrics</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Select Weight Goal</Text>
            <Text style={styles.subheading}>
              Caloric intake will be adjusted based on your target rate of progress.
            </Text>

            {/* Goals List */}
            <View style={styles.goalsList}>
              {Object.entries(GOALS).map(([k, goal]) => {
                const isSelected = weightGoal === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.goalCard, isSelected && styles.activeGoalCard]}
                    onPress={() => setWeightGoal(k)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.goalTitle, isSelected && styles.activeGoalTitle]}>
                        {goal.label}
                      </Text>
                      <Text style={styles.goalDesc}>{goal.description}</Text>
                    </View>
                    <View style={styles.deltaBadge}>
                      <Text style={[styles.deltaText, isSelected && styles.activeDeltaText]}>
                        {goal.deltaCalories > 0
                          ? `+${goal.deltaCalories} kcal`
                          : goal.deltaCalories < 0
                          ? `${goal.deltaCalories} kcal`
                          : 'Maintenance'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Calculated Metabolic Blueprint */}
            <Text style={styles.sectionLabel}>Your Calculated Blueprint</Text>
            <View style={styles.blueprintCard}>
              <View style={styles.blueprintStats}>
                <View style={styles.statCol}>
                  <Text style={styles.statLbl}>BMR (Basal Rate)</Text>
                  <Text style={styles.statVal}>{computedNutrition.bmr} kcal</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLbl}>TDEE (Daily Burn)</Text>
                  <Text style={styles.statVal}>{computedNutrition.tdee} kcal</Text>
                </View>
              </View>

              <View style={styles.targetBanner}>
                <Text style={styles.targetLbl}>TARGET DAILY CALORIES</Text>
                <Text style={styles.targetVal}>{computedNutrition.targetCalories} kcal / day</Text>
              </View>

              <View style={styles.macroRow}>
                <View style={[styles.macroPill, { backgroundColor: COLORS.proteinLight }]}>
                  <Text style={[styles.macroPillLbl, { color: COLORS.protein }]}>Protein</Text>
                  <Text style={styles.macroPillVal}>{computedNutrition.macros.protein.grams}g</Text>
                </View>
                <View style={[styles.macroPill, { backgroundColor: COLORS.carbsLight }]}>
                  <Text style={[styles.macroPillLbl, { color: COLORS.carbs }]}>Carbs</Text>
                  <Text style={styles.macroPillVal}>{computedNutrition.macros.carbs.grams}g</Text>
                </View>
                <View style={[styles.macroPill, { backgroundColor: COLORS.fatLight }]}>
                  <Text style={[styles.macroPillLbl, { color: COLORS.fat }]}>Fat</Text>
                  <Text style={styles.macroPillVal}>{computedNutrition.macros.fat.grams}g</Text>
                </View>
              </View>

              <View style={styles.waterNote}>
                <Ionicons name="water" size={16} color={COLORS.water} />
                <Text style={styles.waterText}>
                  Hydration Target: <Text style={{ fontWeight: '700' }}>{computedNutrition.targetWaterMl} ml</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleFinish}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {isSaving ? 'Calculating...' : 'Launch NutriScan'}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color="#0F172A" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    flex: 1,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  activeGenderCard: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  activeGenderText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCol: {
    flex: 1,
  },
  liveBmiBanner: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  liveBmiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBmiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  liveBmiTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveBmiTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  liveIdealSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  activityList: {
    gap: 8,
    marginBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  activeActivityCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeActivityTitle: {
    color: COLORS.primaryDark,
  },
  activityDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
    ...SHADOWS.soft,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
  goalsList: {
    gap: 8,
    marginBottom: 16,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  activeGoalCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeGoalTitle: {
    color: COLORS.primaryDark,
  },
  goalDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeDeltaText: {
    color: COLORS.primaryDark,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  blueprintCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
    marginBottom: 16,
  },
  blueprintStats: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  targetBanner: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  targetLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  targetVal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDeep,
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  macroPillLbl: {
    fontSize: 10,
    fontWeight: '700',
  },
  macroPillVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  waterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  waterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});
