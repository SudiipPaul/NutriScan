/**
 * BMICalculatorModal Component
 * Interactive BMI Checker & Ideal Weight Analyzer:
 * - Accepts Age, Gender, Height (cm or feet/inches), and Weight (kg)
 * - Live real-time calculation of BMI and WHO category
 * - Shows healthy body weight range for the given height
 * - Option to update current user profile biometrics
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors.js';
import {
  calculateBMI,
  getBMICategory,
  getIdealWeightRange,
  feetInchesToCm,
  cmToFeetInches,
} from '../utils/bmiCalculator.js';
import { saveUserProfile } from '../storage/userStorage.js';

export default function BMICalculatorModal({
  visible,
  onClose,
  initialHeight = 175,
  initialWeight = 70,
  initialAge = 22,
  initialGender = 'male',
  currentProfile = null,
  onProfileUpdated,
}) {
  const [unitMode, setUnitMode] = useState('cm'); // 'cm' | 'ft'
  const [heightCm, setHeightCm] = useState(String(initialHeight || 175));
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [weightKg, setWeightKg] = useState(String(initialWeight || 70));
  const [age, setAge] = useState(String(initialAge || 22));
  const [gender, setGender] = useState(initialGender || 'male');

  useEffect(() => {
    if (visible) {
      const h = initialHeight || 175;
      setHeightCm(String(h));
      const fi = cmToFeetInches(h);
      setFeet(String(fi.feet));
      setInches(String(fi.inches));
      setWeightKg(String(initialWeight || 70));
      setAge(String(initialAge || 22));
      setGender(initialGender || 'male');
    }
  }, [visible, initialHeight, initialWeight, initialAge, initialGender]);

  // Compute active height in cm
  const resolvedHeightCm = useMemo(() => {
    if (unitMode === 'cm') {
      return parseFloat(heightCm) || 0;
    } else {
      return feetInchesToCm(feet, inches);
    }
  }, [unitMode, heightCm, feet, inches]);

  const resolvedWeightKg = parseFloat(weightKg) || 0;
  const resolvedAge = parseInt(age, 10) || 22;

  // Live BMI & Ideal Range calculations
  const bmiValue = useMemo(() => {
    return calculateBMI(resolvedWeightKg, resolvedHeightCm);
  }, [resolvedWeightKg, resolvedHeightCm]);

  const bmiCat = useMemo(() => {
    return getBMICategory(bmiValue, resolvedAge);
  }, [bmiValue, resolvedAge]);

  const idealRange = useMemo(() => {
    return getIdealWeightRange(resolvedHeightCm);
  }, [resolvedHeightCm]);

  // Difference to ideal range
  const weightDiffText = useMemo(() => {
    if (!idealRange || !resolvedWeightKg) return null;
    if (resolvedWeightKg < idealRange.minKg) {
      const diff = Math.round((idealRange.minKg - resolvedWeightKg) * 10) / 10;
      return `Gain ~${diff} kg to reach healthy minimum`;
    }
    if (resolvedWeightKg > idealRange.maxKg) {
      const diff = Math.round((resolvedWeightKg - idealRange.maxKg) * 10) / 10;
      return `Lose ~${diff} kg to reach normal range`;
    }
    return 'Your weight is currently in the ideal healthy range!';
  }, [idealRange, resolvedWeightKg]);

  const handleSaveToProfile = async () => {
    if (!currentProfile) {
      onClose();
      return;
    }

    if (!resolvedHeightCm || resolvedHeightCm < 100 || resolvedHeightCm > 250) {
      Alert.alert('Invalid Height', 'Please enter a realistic height between 100 and 250 cm.');
      return;
    }
    if (!resolvedWeightKg || resolvedWeightKg < 30 || resolvedWeightKg > 300) {
      Alert.alert('Invalid Weight', 'Please enter a weight between 30 and 300 kg.');
      return;
    }

    try {
      const updated = await saveUserProfile({
        ...currentProfile,
        height: resolvedHeightCm,
        weight: resolvedWeightKg,
        age: resolvedAge,
        gender,
      });

      if (onProfileUpdated) onProfileUpdated(updated);
      Alert.alert('Profile Updated', 'Your height, weight, and metabolic targets have been updated.');
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>BMI & Ideal Weight Checker</Text>
              <Text style={styles.sheetSub}>
                Check body mass index, health risk & ideal weight
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Live BMI Hero Result Box */}
            <View style={[styles.resultCard, { borderColor: bmiCat.color }]}>
              <View style={styles.resultTopRow}>
                <View>
                  <Text style={styles.resultLabel}>YOUR BODY MASS INDEX</Text>
                  <Text style={[styles.resultValue, { color: bmiCat.color }]}>
                    {bmiValue ? bmiValue : '--'}
                    <Text style={styles.resultUnit}> kg/m²</Text>
                  </Text>
                </View>
                <View style={[styles.catBadge, { backgroundColor: bmiCat.bgColor }]}>
                  <Text style={[styles.catBadgeText, { color: bmiCat.color }]}>
                    {bmiCat.label}
                  </Text>
                  <Text style={[styles.catBadgeSubBn, { color: bmiCat.color }]}>
                    {bmiCat.labelBn}
                  </Text>
                </View>
              </View>

              {/* BMI Spectrum Scale Bar */}
              <View style={styles.scaleTrack}>
                <View style={[styles.scaleSeg, { backgroundColor: COLORS.warning, flex: 18.5 }]} />
                <View style={[styles.scaleSeg, { backgroundColor: COLORS.primary, flex: 6.4 }]} />
                <View style={[styles.scaleSeg, { backgroundColor: '#F59E0B', flex: 5 }]} />
                <View style={[styles.scaleSeg, { backgroundColor: COLORS.error, flex: 10 }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleTxt}>Under (18.5)</Text>
                <Text style={styles.scaleTxt}>Normal (24.9)</Text>
                <Text style={styles.scaleTxt}>Over (29.9)</Text>
                <Text style={styles.scaleTxt}>Obese (30+)</Text>
              </View>

              {/* Ideal Weight Indicator */}
              {idealRange && (
                <View style={styles.idealRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.idealTxt}>
                    Ideal Weight for {Math.round(resolvedHeightCm)} cm:{' '}
                    <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>
                      {idealRange.minKg} – {idealRange.maxKg} kg
                    </Text>
                  </Text>
                </View>
              )}

              {weightDiffText && (
                <Text style={styles.diffTxt}>• {weightDiffText}</Text>
              )}
            </View>

            {/* Inputs: Age, Gender, Height, Weight */}
            <Text style={styles.sectionHeading}>Enter Your Body Measurements</Text>

            {/* Gender Toggle */}
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => setGender('male')}
              >
                <Ionicons
                  name="male"
                  size={16}
                  color={gender === 'male' ? COLORS.textInverted : COLORS.textSecondary}
                />
                <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>
                  Male (পুরুষ)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => setGender('female')}
              >
                <Ionicons
                  name="female"
                  size={16}
                  color={gender === 'female' ? COLORS.textInverted : COLORS.textSecondary}
                />
                <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>
                  Female (মহিলা)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Age & Unit Switch */}
            <View style={styles.inputsGrid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Age (বছর)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  placeholder="22"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.inputLabel}>Height Unit</Text>
                <View style={styles.unitToggleRow}>
                  <TouchableOpacity
                    style={[styles.unitBtn, unitMode === 'cm' && styles.unitBtnActive]}
                    onPress={() => setUnitMode('cm')}
                  >
                    <Text style={[styles.unitBtnText, unitMode === 'cm' && styles.unitBtnTextActive]}>
                      cm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitBtn, unitMode === 'ft' && styles.unitBtnActive]}
                    onPress={() => setUnitMode('ft')}
                  >
                    <Text style={[styles.unitBtnText, unitMode === 'ft' && styles.unitBtnTextActive]}>
                      ft / in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Height Input */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>
                Height ({unitMode === 'cm' ? 'উচ্চতা সেন্টিমিটারে' : 'ফুট ও ইঞ্চি'})
              </Text>
              {unitMode === 'cm' ? (
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={heightCm}
                  onChangeText={(val) => {
                    setHeightCm(val);
                    const fi = cmToFeetInches(val);
                    setFeet(String(fi.feet));
                    setInches(String(fi.inches));
                  }}
                  placeholder="175"
                />
              ) : (
                <View style={styles.ftInRow}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={feet}
                      onChangeText={(val) => {
                        setFeet(val);
                        setHeightCm(String(feetInchesToCm(val, inches)));
                      }}
                      placeholder="5"
                    />
                    <Text style={styles.subUnitLabel}>Feet</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={inches}
                      onChangeText={(val) => {
                        setInches(val);
                        setHeightCm(String(feetInchesToCm(feet, val)));
                      }}
                      placeholder="9"
                    />
                    <Text style={styles.subUnitLabel}>Inches</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Weight Input */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Weight in kg (বর্তমান ওজন কেজিতে)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={weightKg}
                onChangeText={setWeightKg}
                placeholder="70"
              />
            </View>

            {/* Health Advice Snippet */}
            <View style={styles.adviceBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryDeep} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.adviceTitle}>{bmiCat.risk}</Text>
                <Text style={styles.adviceDesc}>{bmiCat.advice}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>

              {currentProfile && (
                <TouchableOpacity
                  style={styles.saveProfileBtn}
                  onPress={handleSaveToProfile}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-done" size={16} color={COLORS.textInverted} />
                  <Text style={styles.saveProfileBtnText}>Update My Profile</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: '90%',
    ...SHADOWS.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  sheetSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingTop: 12,
  },
  resultCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  resultUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  catBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  catBadgeSubBn: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  scaleTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  scaleSeg: {
    height: 8,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleTxt: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  idealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  idealTxt: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  diffTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  genderBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  genderBtnTextActive: {
    color: COLORS.textInverted,
  },
  inputsGrid: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitToggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 3,
  },
  unitBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 11,
  },
  unitBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  unitBtnTextActive: {
    color: COLORS.primaryDeep,
    fontWeight: '800',
  },
  ftInRow: {
    flexDirection: 'row',
  },
  subUnitLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  adviceBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLighter,
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  adviceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDeep,
  },
  adviceDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveProfileBtn: {
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
  saveProfileBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
});
