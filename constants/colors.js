/**
 * NutriScan Color Palette & Theme Tokens
 * Clean, modern, minimal aesthetic with lime / soft green primary accent.
 */

export const COLORS = {
  // Primary brand accents (Lime & Soft Green)
  primary: '#84CC16',        // Vibrant lime green
  primaryLight: '#ECFCCB',   // Soft lime background tint
  primaryLighter: '#F7FEE7', // Subtle card highlight
  primaryDark: '#4D7C0F',    // Accessible dark lime for text
  primaryDeep: '#365314',    // Deep forest/lime for high contrast

  // Backgrounds & Surfaces
  background: '#F8FAFC',     // Clean off-white app background
  surface: '#FFFFFF',        // Pure white card surfaces
  surfaceSecondary: '#F1F5F9', // Light gray surface for chips / inputs
  surfaceHighlight: '#FAFAF9',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#0F172A',    // Very dark slate for crisp readability
  textSecondary: '#64748B',  // Slate gray for captions, subtitles
  textMuted: '#94A3B8',      // Muted gray for placeholders, hints
  textInverted: '#FFFFFF',   // White text on dark/lime backgrounds

  // Macronutrient Palettes
  protein: '#0EA5E9',        // Sky Blue
  proteinLight: '#E0F2FE',
  carbs: '#F59E0B',          // Warm Amber
  carbsLight: '#FEF3C7',
  fat: '#F43F5E',            // Coral / Soft Red
  fatLight: '#FFE4E6',
  fiber: '#10B981',          // Emerald
  fiberLight: '#D1FAE5',

  // Water Hydration
  water: '#06B6D4',          // Cyan
  waterLight: '#CFFAFE',

  // Status & Alerts
  success: '#22C55E',        // Green
  successLight: '#DCFCE7',
  warning: '#F59E0B',        // Amber
  warningLight: '#FEF3C7',
  error: '#EF4444',          // Crimson red
  errorLight: '#FEE2E2',
  info: '#3B82F6',           // Royal Blue
  infoLight: '#DBEAFE',

  shadow: '#0F172A',
};

export const SHADOWS = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
};
