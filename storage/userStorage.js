/**
 * User Storage Module
 * Multi-user, name-based authentication & profile management:
 * - Simple local login by Name (no OTP, no email required)
 * - New profile creation with biometric BMR/TDEE calculation
 * - Switch between multiple saved profiles
 * - Clean logout back to Login screen
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNutritionProfile } from '../utils/macroCalculator.js';

const STORAGE_KEYS = {
  USERS_LIST: '@nutriscan_users_list',
  ACTIVE_USER_ID: '@nutriscan_active_user_id',
  LEGACY_PROFILE: '@nutriscan_user_profile',
};

const DEFAULT_PROFILE = {
  id: 'user_default',
  name: 'Sajib Rahman',
  email: 'sajib@nutriscan.com',
  password: 'password123',
  age: 22,
  gender: 'male',
  height: 175,
  weight: 70,
  activityLevel: 'moderate',
  weightGoal: 'mild_weight_loss',
  mealCount: 4,
  mealsConfig: [
    { id: 'meal_1', name: 'Meal 1 (Breakfast)', icon: 'sunny-outline' },
    { id: 'meal_2', name: 'Meal 2 (Lunch)', icon: 'restaurant-outline' },
    { id: 'meal_3', name: 'Meal 3 (Snack)', icon: 'cafe-outline' },
    { id: 'meal_4', name: 'Meal 4 (Dinner)', icon: 'moon-outline' },
  ],
};

/**
 * Retrieves all registered users stored on this device
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (raw != null) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }

    // Check if legacy profile exists to migrate
    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (legacyRaw != null) {
      const legacy = JSON.parse(legacyRaw);
      const migrated = {
        ...DEFAULT_PROFILE,
        ...legacy,
        id: legacy.id || 'user_1',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify([migrated]));
      return [migrated];
    }

    return [];
  } catch (e) {
    console.error('Error getting all users', e);
    return [];
  }
}

/**
 * Gets currently active user ID
 * @returns {Promise<string|null>}
 */
export async function getActiveUserId() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  } catch (e) {
    return null;
  }
}

/**
 * Checks if a user is currently logged in
 * @returns {Promise<boolean>}
 */
export async function isUserLoggedIn() {
  try {
    const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    return Boolean(activeId);
  } catch (e) {
    return false;
  }
}

/**
 * Retrieves the currently active user profile with calculated targets
 * @returns {Promise<Object>}
 */
export async function getUserProfile() {
  try {
    const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    const users = await getAllUsers();

    if (activeId && users.length > 0) {
      const found = users.find((u) => u.id === activeId);
      if (found) {
        const targets = generateNutritionProfile(found);
        return { ...found, targets };
      }
    }

    if (users.length > 0) {
      const first = users[0];
      const targets = generateNutritionProfile(first);
      return { ...first, targets };
    }

    const defaultTargets = generateNutritionProfile(DEFAULT_PROFILE);
    return {
      ...DEFAULT_PROFILE,
      targets: defaultTargets,
    };
  } catch (e) {
    console.error('Error loading user profile', e);
    const defaultTargets = generateNutritionProfile(DEFAULT_PROFILE);
    return {
      ...DEFAULT_PROFILE,
      targets: defaultTargets,
    };
  }
}

/**
 * Authenticates user using Email or Username with Password
 * @param {string} emailOrName 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function loginUser(emailOrName, password) {
  try {
    const cleanId = String(emailOrName || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanId) {
      return { success: false, error: 'Email or Username is required.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Password is required.' };
    }

    let users = await getAllUsers();

    // If no users exist yet and credentials match demo account
    if (users.length === 0 && (cleanId === DEFAULT_PROFILE.email.toLowerCase() || cleanId === DEFAULT_PROFILE.name.toLowerCase())) {
      if (cleanPass === DEFAULT_PROFILE.password) {
        const demo = await loginDemoUser();
        return { success: true, user: demo };
      }
    }

    const match = users.find(
      (u) =>
        (u.email && u.email.trim().toLowerCase() === cleanId) ||
        (u.name && u.name.trim().toLowerCase() === cleanId)
    );

    if (!match) {
      return {
        success: false,
        error: `No registered account found for "${emailOrName}". Please check spelling or create an account.`,
      };
    }

    // Password verification
    if (match.password && match.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Backfill password if account was created in legacy mode without password
    if (!match.password) {
      match.password = cleanPass;
      const updatedList = users.map((u) => (u.id === match.id ? match : u));
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updatedList));
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, match.id);
    const targets = generateNutritionProfile(match);
    return { success: true, user: { ...match, targets } };
  } catch (e) {
    console.error('Error logging in user', e);
    return { success: false, error: 'Authentication failed due to an internal error.' };
  }
}

/**
 * Registers a new user with email, password, and metabolic biometrics
 * @param {Object} profileData 
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function registerUser(profileData) {
  try {
    const cleanEmail = String(profileData.email || '').trim().toLowerCase();
    const cleanName = String(profileData.name || '').trim();
    const cleanPass = String(profileData.password || '').trim();

    if (!cleanName) {
      return { success: false, error: 'Full Name is required.' };
    }

    const users = await getAllUsers();
    if (cleanEmail) {
      const duplicate = users.find(
        (u) => u.email && u.email.trim().toLowerCase() === cleanEmail
      );
      if (duplicate && duplicate.name.toLowerCase() !== cleanName.toLowerCase()) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please log in.',
        };
      }
    }

    const newId = `user_${Date.now()}`;
    const newUser = {
      ...profileData,
      id: newId,
      name: cleanName,
      email: cleanEmail || `${cleanName.toLowerCase().replace(/\s+/g, '')}@nutriscan.local`,
      password: cleanPass || '',
      age: parseInt(profileData.age, 10) || 22,
      gender: profileData.gender || 'male',
      height: parseFloat(profileData.height) || 175,
      weight: parseFloat(profileData.weight) || 70,
      activityLevel: profileData.activityLevel || 'moderate',
      weightGoal: profileData.weightGoal || 'mild_weight_loss',
      mealCount: parseInt(profileData.mealCount, 10) || 4,
      mealsConfig: profileData.mealsConfig || DEFAULT_PROFILE.mealsConfig,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updatedUsers));
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, newId);

    const targets = generateNutritionProfile(newUser);
    return { success: true, user: { ...newUser, targets } };
  } catch (e) {
    console.error('Error registering new user', e);
    return { success: false, error: 'Failed to create user account. Please try again.' };
  }
}

/**
 * 1-Tap Quick Demo Login (ideal for examiners, testing, or instant demo)
 * @returns {Promise<Object>}
 */
export async function loginDemoUser() {
  try {
    const users = await getAllUsers();
    let demo = users.find(
      (u) => (u.email && u.email.toLowerCase() === DEFAULT_PROFILE.email.toLowerCase()) || u.id === DEFAULT_PROFILE.id
    );

    if (!demo) {
      demo = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
      const updated = [...users.filter((u) => u.id !== demo.id), demo];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, demo.id);
    const targets = generateNutritionProfile(demo);
    return { ...demo, targets };
  } catch (e) {
    console.error('Error logging in demo user', e);
    const targets = generateNutritionProfile(DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE, targets };
  }
}

/**
 * Logs in directly using user's display name (Legacy backward compatibility)
 * @param {string} nameInput 
 * @returns {Promise<Object|null>}
 */
export async function loginByName(nameInput) {
  try {
    const clean = String(nameInput || '').trim().toLowerCase();
    if (!clean) return null;

    const users = await getAllUsers();
    const match = users.find(
      (u) => (u.name && u.name.trim().toLowerCase() === clean) || (u.email && u.email.trim().toLowerCase() === clean)
    );

    if (match) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, match.id);
      const targets = generateNutritionProfile(match);
      return { ...match, targets };
    }

    return null;
  } catch (e) {
    console.error('Error logging in by name', e);
    return null;
  }
}

/**
 * Logs in by selecting an existing user ID directly
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
export async function loginById(userId) {
  try {
    const users = await getAllUsers();
    const match = users.find((u) => u.id === userId);
    if (match) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, match.id);
      const targets = generateNutritionProfile(match);
      return { ...match, targets };
    }
    return null;
  } catch (e) {
    console.error('Error logging in by ID', e);
    return null;
  }
}

/**
 * Creates a new user profile, calculates targets, and sets as active session
 * @param {Object} profileData 
 * @returns {Promise<Object>}
 */
export async function createUser(profileData) {
  const res = await registerUser(profileData);
  if (!res.success) {
    throw new Error(res.error || 'Failed to create user');
  }
  return res.user;
}

/**
 * Saves and updates the currently active user profile
 * @param {Object} profileData 
 * @returns {Promise<Object>}
 */
export async function saveUserProfile(profileData) {
  try {
    const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    const users = await getAllUsers();
    const targets = generateNutritionProfile(profileData);

    const targetId = activeId || profileData.id || `user_${Date.now()}`;
    const updatedUser = {
      ...profileData,
      id: targetId,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = users.map((u) => (u.id === targetId ? updatedUser : u));
    if (!updatedList.some((u) => u.id === targetId)) {
      updatedList.push(updatedUser);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updatedList));
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, targetId);

    return { ...updatedUser, targets };
  } catch (e) {
    console.error('Error updating user profile', e);
    throw e;
  }
}

/**
 * Updates the user's custom daily meals configuration
 * @param {Array} mealsConfig 
 * @param {number} mealCount 
 * @returns {Promise<Object>}
 */
export async function updateUserMealsConfig(mealsConfig, mealCount) {
  try {
    const profile = await getUserProfile();
    const count = mealCount || (Array.isArray(mealsConfig) ? mealsConfig.length : 4);
    const updated = {
      ...profile,
      mealCount: count,
      mealsConfig: mealsConfig,
    };
    return await saveUserProfile(updated);
  } catch (e) {
    console.error('Error updating user meals config', e);
    throw e;
  }
}

/**
 * Logs out the active user session and returns to login
 */
export async function logoutUser() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    return true;
  } catch (e) {
    console.error('Error logging out', e);
    return false;
  }
}

/**
 * Checks legacy onboarding status
 */
export async function checkIsOnboarded() {
  return await isUserLoggedIn();
}

/**
 * Completely clears all storage (users, logs, progress)
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (e) {
    console.error('Error clearing storage', e);
    return false;
  }
}
