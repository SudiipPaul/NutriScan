/**
 * BottomNav Component
 * Seamless bottom tab navigation bar connecting all 6 primary screens:
 * 1. Home
 * 2. Analysis
 * 3. Add Food (Center elevated action button)
 * 4. Improve
 * 5. Progress
 * 6. Profile
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors.js';

export default function BottomNav({ activeRoute = 'home' }) {
  const router = useRouter();

  const tabs = [
    {
      route: 'home',
      path: '/home',
      label: 'Home',
      icon: 'grid',
      outlineIcon: 'grid-outline',
    },
    {
      route: 'analysis',
      path: '/analysis',
      label: 'Analysis',
      icon: 'pie-chart',
      outlineIcon: 'pie-chart-outline',
    },
    {
      route: 'add-food',
      path: '/add-food',
      label: 'Add',
      isCenterAction: true,
      icon: 'add',
      outlineIcon: 'add',
    },
    {
      route: 'improve-diet',
      path: '/improve-diet',
      label: 'Improve',
      icon: 'sparkles',
      outlineIcon: 'sparkles-outline',
    },
    {
      route: 'progress',
      path: '/progress',
      label: 'Progress',
      icon: 'bar-chart',
      outlineIcon: 'bar-chart-outline',
    },
    {
      route: 'profile',
      path: '/profile',
      label: 'Profile',
      icon: 'person',
      outlineIcon: 'person-outline',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.route;

        // Elevated Center Action Button for Add Food
        if (tab.isCenterAction) {
          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.centerTabContainer}
              onPress={() => router.push(tab.path)}
              activeOpacity={0.85}
            >
              <View style={[styles.centerActionButton, isActive && styles.centerActionActive]}>
                <Ionicons name="add" size={26} color={COLORS.textInverted} />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => router.replace(tab.path)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : tab.outlineIcon}
              size={21}
              color={isActive ? COLORS.primaryDark : COLORS.textMuted}
            />
            <Text
              style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: 6,
    paddingBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    ...SHADOWS.card,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  centerTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -14,
  },
  centerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  centerActionActive: {
    backgroundColor: COLORS.primaryDark,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 3,
  },
  activeTabLabel: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
});
