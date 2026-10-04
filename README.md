# NutriScan 🥗
> **Smart Nutrition & Diet Tracking Mobile Application**  
> Developed by **Sudiip Paul** for Mobile Application Development (MAD).

[![Expo SDK 57](https://img.shields.io/badge/Expo-v57.0.0-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61dafb.svg)](https://reactnative.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-100%25%20Passed-brightgreen.svg)](#unit-testing)

---

## 📱 Project Overview

**NutriScan** is an offline-first, mobile nutrition and diet tracking application designed to help individuals monitor their caloric intake, analyze dietary quality, and receive actionable nutritional guidance. 

The application incorporates a rich food composition database (including localized Bangladeshi staples and snacks), deterministic dietary evaluation engines, customizable multi-meal logging routines, and personalized goal calculations based on clinically recognized metabolic formulas.

---

## ✨ Key Features

- **📊 Comprehensive Daily Dashboard**: Real-time visual tracking of total daily calories, target progress ring, and macronutrient split (Protein, Carbohydrates, Fats).
- **🍽️ Flexible & Customizable Meals**: Support for configurable daily meal structures ranging from 2 meals (intermittent fasting/brunch routines) up to 6+ meals with automated distribution.
- **🥗 Rich Food Database**: Extensive list of foods with pre-calculated calories, macronutrients, and portion sizing, tailored with localized Bangladeshi meals alongside international options.
- **🧠 Rule-Based Deterministic Recommendations**: Evidence-based recommendation engine evaluating calorie surplus/deficit, low protein intake, saturated fat warnings, and healthier food substitutions without non-deterministic AI latency.
- **⚖️ Scientific Nutrition Calculations**:
  - **Mifflin-St Jeor BMR** (Basal Metabolic Rate)
  - **TDEE** (Total Daily Energy Expenditure) based on physical activity multipliers
  - **Goal Adjustments**: Caloric deficits for weight loss, maintenance budgets, and caloric surpluses for muscle gain.
  - **Clinical Safety Guardrails**: Built-in safety floors (minimum 1,200 kcal/day for females, 1,500 kcal/day for males).
- **📈 Progress Tracking**: Historical calorie intake metrics and streak tracking.
- **🔐 User Profile & BMI Classification**: Automatic BMI calculation, category assignment, and goal-oriented dietary recommendations during onboarding.
- **💾 Offline-First Architecture**: Fast local persistence using AsyncStorage, ensuring uninterrupted functionality without requiring continuous internet access.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Native](https://reactnative.dev) (v0.86.3) with [Expo](https://expo.dev) (SDK 57) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **State & Storage** | `@react-native-async-storage/async-storage` |
| **Icons & UI** | `@expo/vector-icons`, `react-native-svg`, `react-native-screens`, `react-native-safe-area-context` |
| **Web Runtime** | `react-native-web`, `@expo/metro-runtime` |
| **Language & Environment** | JavaScript (ES6+), Node.js |

---

## 📂 Project Structure

```plaintext
MAD/
├── app/                      # Expo Router screens & file-based routing
│   ├── _layout.js            # Root navigation stack layout & header configuration
│   ├── index.js              # Entry redirect logic (Auth state verification)
│   ├── login/                # Authentication & session initiation
│   ├── onboarding/           # User onboarding, physical metrics & goal setting
│   ├── home/                 # Main daily tracking dashboard
│   ├── add-food/             # Food logging, custom food entries & meal selection
│   ├── analysis/             # In-depth dietary and macro distribution analysis
│   ├── improve-diet/         # Rule-based dietary recommendations & healthy swaps
│   ├── progress/             # Intake history and progress monitoring
│   └── profile/              # User settings, profile overview & targets
├── components/               # Reusable UI components (Macro cards, buttons, dialogs)
├── constants/                # Design tokens, color schemes & typography
├── data/                     # Food composition databases & reference values
├── storage/                  # AsyncStorage persistent storage helpers
├── utils/                    # Calculation formulas, recommendation engines & unit tests
├── assets/                   # App icons, splash screens, and visuals
├── app.json                  # Expo application configuration & metadata
└── package.json              # Project dependencies and operational scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/go) installed on your Android or iOS device (optional for mobile testing)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SudiipPaul/NutriScan.git
   cd NutriScan
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Launch on devices**:
   - **Web Browser**: Press `w` in the terminal or visit `http://localhost:8081`.
   - **Android Emulator**: Press `a` in the terminal.
   - **Expo Go (Physical Device)**: Scan the QR code displayed in the terminal with the Expo Go app.

---

## 🧪 Unit Testing

The project includes unit test suites verifying the core calculation algorithms, recommendation logic, customizable meal presets, and authentication constraints:

```bash
# Run all test suites
npm test

# Run individual test suites
npm run test:nutrition         # BMR, TDEE, and safety floor calculations
npm run test:recommendations   # Rule-based recommendation engine
npm run test:meals             # Customizable meal routine logic
npm run test:auth              # Email, password & BMI validation
```

**Test Coverage Highlights:**
- ✅ 26/26 Nutrition calculation test cases (Mifflin-St Jeor, TDEE, macros, clinical floors)
- ✅ 16/16 Recommendation engine test cases (Caloric deviation, protein deficit, fried food alternatives)
- ✅ Dynamic multi-meal slot generation and aggregation
- ✅ Authentication & input sanitation checks

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Sudiip Paul**  
- GitHub: [@SudiipPaul](https://github.com/SudiipPaul)
- Project: Individual Mobile Application Development (MAD) Project
