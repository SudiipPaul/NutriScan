/**
 * Login & Profile Creation Screen (app/login/index.js)
 * Clean, modern, English-only user experience:
 * 1. Log In with Name directly (or 1-Tap Demo Account).
 * 2. Create Profile with Name, Gender, Age, Height, Weight.
 * 3. Live calculated BMI with WHO classification & ideal weight range.
 * 4. Scientifically calculated recommendation (safe customized calorie deficit/surplus & timeframe).
 * 5. Customizable meal frequency with direct numeric keyboard input & quick presets.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors.js';
import { ACTIVITY_LEVELS_LIST } from '../../constants/activityLevels.js';
import { GOALS_LIST } from '../../constants/goals.js';
import { buildMealsConfig } from '../../constants/mealConfig.js';
import {
  calculateBMI,
  getBMICategory,
  getIdealWeightRange,
  getBmiRecommendation,
  feetInchesToCm,
} from '../../utils/bmiCalculator.js';
import {
  getAllUsers,
  loginByName,
  createUser,
  loginDemoUser,
} from '../../storage/userStorage.js';

export default function LoginScreen() {
  const router = useRouter();

  // Mode: 'login' | 'create'
  const [activeTab, setActiveTab] = useState('login');
  const [savedUsers, setSavedUsers] = useState([]);

  // Login Form State
  const [loginName, setLoginName] = useState('');

  // Profile Creation Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('22');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('moderate');
  const [selectedGoal, setSelectedGoal] = useState('mild_weight_loss');
  const [mealCount, setMealCount] = useState('4');
  const [userOverrodeGoal, setUserOverrodeGoal] = useState(false);

  // Quick Feet/Inches helper state
  const [showFtInHelper, setShowFtInHelper] = useState(false);
  const [feetInput, setFeetInput] = useState('5');
  const [inchesInput, setInchesInput] = useState('9');

  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
      const list = await getAllUsers();
      setSavedUsers(list || []);
      if (!list || list.length === 0) {
        setActiveTab('create');
      }
    } catch (e) {
      setSavedUsers([]);
    }
  };

  // --- Dynamic BMI & Scientific Recommendation Calculation ---
  const currentBmi = calculateBMI(parseFloat(weight), parseFloat(height));
  const bmiInfo = getBMICategory(currentBmi, parseInt(age, 10) || 22);
  const idealRange = getIdealWeightRange(parseFloat(height));
  const bmiRec = getBmiRecommendation(currentBmi, parseFloat(weight) || 70, parseFloat(height) || 175);

  // Automatically sync recommendation into selectedGoal unless manually overridden
  useEffect(() => {
    if (!userOverrodeGoal && bmiRec && bmiRec.goalId) {
      setSelectedGoal(bmiRec.goalId);
    }
  }, [currentBmi, userOverrodeGoal]);

  // Handle Height conversion from feet/inches
  const applyFeetInches = () => {
    const cm = feetInchesToCm(feetInput, inchesInput);
    if (cm > 0) {
      setHeight(String(cm));
      setShowFtInHelper(false);
    }
  };

  // --- LOGIN WITH NAME HANDLER ---
  const handleLogin = async () => {
    const cleanName = loginName.trim();
    if (!cleanName) {
      Alert.alert('Name Required', 'Please enter your name to log in.');
      return;
    }

    const user = await loginByName(cleanName);
    if (user) {
      router.replace('/home');
    } else {
      Alert.alert(
        'Profile Not Found',
        `No profile found for "${cleanName}". Would you like to create a new profile with this name?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Profile',
            onPress: () => {
              setName(cleanName);
              setActiveTab('create');
            },
          },
        ]
      );
    }
  };

  // --- 1-TAP DEMO LOGIN ---
  const handleQuickDemo = async () => {
    await loginDemoUser();
    router.replace('/home');
  };

  // --- CREATE PROFILE HANDLER ---
  const handleCreateProfile = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 12 || ageNum > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 12 and 100.');
      return;
    }

    const heightNum = parseFloat(height);
    if (!heightNum || heightNum < 100 || heightNum > 250) {
      Alert.alert('Invalid Height', 'Please enter a valid height in cm (100 - 250).');
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum < 30 || weightNum > 250) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (30 - 250).');
      return;
    }

    const mCount = parseInt(mealCount, 10) || 4;
    if (mCount < 1 || mCount > 12) {
      Alert.alert('Invalid Meals', 'Daily meal count should be between 1 and 12 meals.');
      return;
    }

    try {
      await createUser({
        name: cleanName,
        age: ageNum,
        gender,
        height: heightNum,
        weight: weightNum,
        activityLevel: activity,
        weightGoal: selectedGoal,
        mealCount: mCount,
        mealsConfig: buildMealsConfig(mCount),
      });

      Alert.alert(
        'Profile Created 🎉',
        `Welcome ${cleanName}! Your BMI is ${currentBmi || 22.9} and your custom metabolic calorie target has been calculated.`,
        [{ text: 'Continue to Diary', onPress: () => router.replace('/home') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding */}
          <View style={styles.headerBox}>
            <View style={styles.logoCircle}>
              <Ionicons name="nutrition" size={38} color={COLORS.primaryDeep} />
            </View>
            <Text style={styles.appTitle}>NutriScan</Text>
            <Text style={styles.appSubtitle}>Smart Nutrition & Metabolic Health Tracker</Text>
          </View>

          {/* Segmented Mode Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
              onPress={() => setActiveTab('login')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color={activeTab === 'login' ? COLORS.primaryDeep : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'login' && styles.tabBtnTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]}
              onPress={() => setActiveTab('create')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-add-outline"
                size={18}
                color={activeTab === 'create' ? COLORS.primaryDeep : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'create' && styles.tabBtnTextActive,
                ]}
              >
                Create Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* ======================================================== */}
          {/* TAB 1: LOG IN WITH NAME */}
          {/* ======================================================== */}
          {activeTab === 'login' && (
            <View style={styles.formCard}>
              <Text style={styles.cardHeaderTitle}>Log In with Name</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Enter your registered name to access your food diary, macros, and progress
              </Text>

              <Text style={styles.fieldLabel}>Your Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Sajib Rahman"
                  placeholderTextColor={COLORS.textMuted}
                  value={loginName}
                  onChangeText={setLoginName}
                  autoCapitalize="words"
                />
                {loginName.length > 0 && (
                  <TouchableOpacity onPress={() => setLoginName('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Continue to Diary</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textInverted} />
              </TouchableOpacity>

              {/* Quick Demo Access */}
              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR FOR QUICK TESTING</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.demoBtn}
                onPress={handleQuickDemo}
                activeOpacity={0.8}
              >
                <View style={styles.demoIconWrap}>
                  <Ionicons name="flash" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.demoBtnTitle}>⚡ 1-Tap Quick Demo Account</Text>
                  <Text style={styles.demoBtnSub}>
                    Instant login as Sajib Rahman (2,459 kcal • 4 Meals/day preset)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} />
              </TouchableOpacity>

              {/* Saved Profiles Quick List */}
              {savedUsers.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                    Saved Profiles on this Device:
                  </Text>
                  {savedUsers.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={styles.savedUserRow}
                      onPress={() => {
                        setLoginName(u.name);
                        loginByName(u.name).then((res) => {
                          if (res) router.replace('/home');
                        });
                      }}
                    >
                      <View style={styles.savedUserAvatar}>
                        <Ionicons name="person" size={16} color={COLORS.primaryDeep} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.savedUserName}>{u.name}</Text>
                        <Text style={styles.savedUserMeta}>
                          {u.gender ? u.gender.toUpperCase() : 'MALE'} • {u.age} yrs • {u.weight} kg
                        </Text>
                      </View>
                      <View style={styles.logInBadge}>
                        <Text style={styles.logInBadgeText}>Log In ❯</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.switchPrompt}
                onPress={() => setActiveTab('create')}
              >
                <Text style={styles.switchPromptText}>
                  First time here? <Text style={styles.boldLink}>Create a new profile</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CREATE PROFILE WITH LIVE BMI & RECOMMENDATION */}
          {/* ======================================================== */}
          {activeTab === 'create' && (
            <View style={styles.formCard}>
              <Text style={styles.cardHeaderTitle}>New Metabolic Profile</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Enter your biometrics to receive a personalized BMI analysis and caloric recommendation
              </Text>

              {/* Name Input */}
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Sajibur Rahman"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Gender Selection */}
              <Text style={styles.fieldLabel}>Biological Gender (Mifflin-St Jeor Equation)</Text>
              <View style={styles.genderToggleRow}>
                <TouchableOpacity
                  style={[styles.genderPill, gender === 'male' && styles.genderPillActive]}
                  onPress={() => setGender('male')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="male"
                    size={16}
                    color={gender === 'male' ? COLORS.textInverted : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderPillText,
                      gender === 'male' && styles.genderPillTextActive,
                    ]}
                  >
                    Male (+5 kcal)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderPill, gender === 'female' && styles.genderPillActive]}
                  onPress={() => setGender('female')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="female"
                    size={16}
                    color={gender === 'female' ? COLORS.textInverted : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderPillText,
                      gender === 'female' && styles.genderPillTextActive,
                    ]}
                  >
                    Female (-161 kcal)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Age, Height, Weight 3-Col Inputs */}
              <View style={styles.threeColRow}>
                <View style={styles.colItem}>
                  <Text style={styles.colLabel}>Age (yrs)</Text>
                  <TextInput
                    style={styles.colInput}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>

                <View style={styles.colItem}>
                  <Text style={styles.colLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.colInput}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                  <TouchableOpacity
                    style={styles.ftInToggle}
                    onPress={() => setShowFtInHelper(!showFtInHelper)}
                  >
                    <Text style={styles.ftInToggleText}>
                      {showFtInHelper ? 'Close' : 'Ft / In?'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.colItem}>
                  <Text style={styles.colLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.colInput}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>

              {/* Feet & Inches Quick Converter */}
              {showFtInHelper && (
                <View style={styles.converterCard}>
                  <Text style={styles.converterTitle}>Convert Feet & Inches to Centimeters:</Text>
                  <View style={styles.converterRow}>
                    <View style={styles.convCol}>
                      <Text style={styles.convLabel}>Feet (ft)</Text>
                      <TextInput
                        style={styles.convInput}
                        keyboardType="numeric"
                        value={feetInput}
                        onChangeText={setFeetInput}
                      />
                    </View>
                    <View style={styles.convCol}>
                      <Text style={styles.convLabel}>Inches (in)</Text>
                      <TextInput
                        style={styles.convInput}
                        keyboardType="numeric"
                        value={inchesInput}
                        onChangeText={setInchesInput}
                      />
                    </View>
                    <TouchableOpacity style={styles.convBtn} onPress={applyFeetInches}>
                      <Text style={styles.convBtnText}>Set Height</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ======================================================== */}
              {/* ⭐ LIVE BMI & SCIENTIFIC RECOMMENDATION CARD ⭐ */}
              {/* ======================================================== */}
              {currentBmi ? (
                <View style={[styles.recommendationCard, { borderColor: bmiRec.badgeColor, backgroundColor: bmiRec.badgeBg }]}>
                  {/* Top: BMI Calculation Result */}
                  <View style={styles.recHeaderRow}>
                    <View style={styles.recScoreWrap}>
                      <Text style={styles.recScoreLabel}>YOUR CALCULATED BMI</Text>
                      <Text style={[styles.recScoreValue, { color: bmiRec.badgeColor }]}>
                        {currentBmi}
                      </Text>
                      <Text style={[styles.recCategoryLabel, { color: bmiRec.badgeColor }]}>
                        {bmiInfo.label} (WHO Standard)
                      </Text>
                    </View>

                    {idealRange && (
                      <View style={styles.idealWeightBox}>
                        <Text style={styles.idealWeightTitle}>Ideal Weight Range</Text>
                        <Text style={styles.idealWeightValue}>
                          {idealRange.minKg} - {idealRange.maxKg} kg
                        </Text>
                        <Text style={styles.idealWeightSub}>
                          (for {height} cm)
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Divider */}
                  <View style={styles.recDivider} />

                  {/* System Suggestion: Personalized Rate & Calculation */}
                  <View style={styles.systemSuggestionBox}>
                    <View style={styles.suggestionTitleRow}>
                      <Ionicons name={bmiRec.icon} size={20} color={bmiRec.badgeColor} />
                      <Text style={[styles.suggestionTitleText, { color: bmiRec.badgeColor }]}>
                        {bmiRec.title}
                      </Text>
                    </View>

                    <Text style={styles.suggestionDescText}>
                      {bmiRec.recommendation}
                    </Text>

                    {Boolean(bmiRec.explanation) && (
                      <Text style={styles.suggestionMetaText}>
                        {bmiRec.explanation}
                      </Text>
                    )}

                    <View style={styles.autoSetBadge}>
                      <Ionicons name="checkmark-done" size={14} color={COLORS.primaryDeep} />
                      <Text style={styles.autoSetText}>
                        Auto-assigned goal: {bmiRec.suggestedCalorieDelta > 0 ? `+${bmiRec.suggestedCalorieDelta} kcal surplus` : bmiRec.suggestedCalorieDelta < 0 ? `${bmiRec.suggestedCalorieDelta} kcal deficit` : 'Maintenance (0 kcal)'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Weight Goal Selector */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                Primary Goal (Auto-selected based on BMI analysis)
              </Text>
              <View style={styles.chipsWrap}>
                {GOALS_LIST.map((g) => {
                  const isSelected = selectedGoal === g.id;
                  const isRecommended = bmiRec && bmiRec.goalId === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                        isRecommended && styles.chipRecommended,
                      ]}
                      onPress={() => {
                        setSelectedGoal(g.id);
                        setUserOverrodeGoal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chipHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.chipTitle, isSelected && styles.chipTitleActive]}>
                            {g.label}
                          </Text>
                          {isRecommended && (
                            <View style={styles.recPill}>
                              <Text style={styles.recPillText}>RECOMMENDED</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.chipMultiplier, isSelected && styles.chipMultiplierActive]}>
                          {g.deltaCalories > 0
                            ? `+${g.deltaCalories} kcal surplus`
                            : g.deltaCalories < 0
                            ? `${g.deltaCalories} kcal deficit`
                            : 'Maintenance (0 kcal)'}
                        </Text>
                      </View>
                      <Text style={[styles.chipDesc, isSelected && styles.chipDescActive]}>
                        {g.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Physical Activity Level */}
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Physical Activity Level</Text>
              <View style={styles.chipsWrap}>
                {ACTIVITY_LEVELS_LIST.map((act) => {
                  const isSelected = activity === act.id;
                  return (
                    <TouchableOpacity
                      key={act.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setActivity(act.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chipHeader}>
                        <Text style={[styles.chipTitle, isSelected && styles.chipTitleActive]}>
                          {act.label}
                        </Text>
                        <Text style={[styles.chipMultiplier, isSelected && styles.chipMultiplierActive]}>
                          PAL {act.multiplier}x
                        </Text>
                      </View>
                      <Text style={[styles.chipDesc, isSelected && styles.chipDescActive]}>
                        {act.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ======================================================== */}
              {/* ⭐ DIRECT NUMERIC KEYBOARD INPUT FOR MEAL FREQUENCY ⭐ */}
              {/* ======================================================== */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                Daily Meal Frequency (Type number of meals per day)
              </Text>
              
              <View style={styles.mealInputCard}>
                <View style={styles.mealDirectRow}>
                  <Ionicons name="restaurant-outline" size={22} color={COLORS.primaryDeep} style={{ marginRight: 10 }} />
                  <Text style={styles.mealPromptText}>How many meals per day?</Text>
                  
                  {/* Direct Keyboard Number Input */}
                  <TextInput
                    style={styles.mealKeyboardInput}
                    keyboardType="number-pad"
                    value={String(mealCount)}
                    onChangeText={(val) => {
                      const clean = val.replace(/[^0-9]/g, '');
                      setMealCount(clean);
                    }}
                    placeholder="4"
                    maxLength={2}
                    selectTextOnFocus
                  />
                  <Text style={styles.mealUnitSuffix}>meals</Text>
                </View>

                {/* Quick Presets row */}
                <View style={styles.mealQuickPills}>
                  <Text style={styles.quickPresetsLabel}>Quick Select:</Text>
                  {[2, 3, 4, 5, 6].map((count) => {
                    const isSelected = parseInt(mealCount, 10) === count;
                    return (
                      <TouchableOpacity
                        key={count}
                        style={[styles.quickMealPill, isSelected && styles.quickMealPillActive]}
                        onPress={() => setMealCount(String(count))}
                      >
                        <Text style={[styles.quickMealPillText, isSelected && styles.quickMealPillTextActive]}>
                          {count}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleCreateProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Create Profile & Calculate Targets</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.textInverted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchPrompt}
                onPress={() => setActiveTab('login')}
              >
                <Text style={styles.switchPromptText}>
                  Already registered? <Text style={styles.boldLink}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: 12,
  },
  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 16,
    padding: 4,
    marginVertical: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: COLORS.primaryDeep,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 17,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 5,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    paddingVertical: 0,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    gap: 8,
    ...SHADOWS.soft,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginHorizontal: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
  },
  demoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  demoBtnSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
  },
  savedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 14,
    padding: 10,
    marginVertical: 3,
  },
  savedUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedUserName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  savedUserMeta: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  logInBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logInBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  switchPrompt: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  switchPromptText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  boldLink: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  genderToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  genderPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  genderPillTextActive: {
    color: COLORS.textInverted,
  },
  threeColRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  colItem: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  colInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ftInToggle: {
    alignItems: 'center',
    marginTop: 3,
  },
  ftInToggleText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  converterCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  converterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  converterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  convCol: {
    flex: 1,
  },
  convLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  convInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  convBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  convBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
  // Recommendation Box
  recommendationCard: {
    borderRadius: 18,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1.5,
    ...SHADOWS.soft,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recScoreWrap: {
    alignItems: 'flex-start',
  },
  recScoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  recScoreValue: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  recCategoryLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  idealWeightBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  idealWeightTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  idealWeightValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  idealWeightSub: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  recDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 10,
  },
  systemSuggestionBox: {
    gap: 4,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionTitleText: {
    fontSize: 13,
    fontWeight: '900',
  },
  suggestionDescText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 17,
    fontWeight: '600',
  },
  suggestionMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  autoSetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  autoSetText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  chipsWrap: {
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipRecommended: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryDark,
  },
  chipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chipTitleActive: {
    color: COLORS.primaryDeep,
  },
  recPill: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
  chipMultiplier: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  chipMultiplierActive: {
    color: COLORS.primaryDeep,
  },
  chipDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chipDescActive: {
    color: COLORS.primaryDark,
  },
  // Meal Direct Keyboard Input Card
  mealInputCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 4,
    marginBottom: 8,
  },
  mealDirectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealPromptText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mealKeyboardInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    width: 50,
    height: 38,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDeep,
    textAlign: 'center',
    paddingVertical: 0,
    marginRight: 6,
  },
  mealUnitSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  mealQuickPills: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 6,
  },
  quickPresetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 2,
  },
  quickMealPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickMealPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickMealPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  quickMealPillTextActive: {
    color: COLORS.primaryDeep,
  },
});
