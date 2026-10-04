/**
 * Fallback 404 screen for unmatched routes
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { COLORS } from '../constants/colors.js';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go to Home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
