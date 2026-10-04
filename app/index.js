/**
 * Entry Route (app/index.js)
 * Checks authentication status:
 * - If user session exists -> redirects to /home
 * - If no user logged in -> redirects to /login
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isUserLoggedIn } from '../storage/userStorage.js';
import { COLORS } from '../constants/colors.js';

export default function AppEntry() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function determineRoute() {
      try {
        const loggedIn = await isUserLoggedIn();
        if (loggedIn) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    }

    determineRoute();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="nutrition" size={44} color={COLORS.primaryDeep} />
      </View>
      <Text style={styles.appName}>NutriScan</Text>
      <Text style={styles.tagline}>Personalized Nutrition & Calorie Tracking</Text>
      <ActivityIndicator size="small" color={COLORS.primaryDark} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
});
