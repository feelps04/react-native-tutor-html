/**
 * Color schemes for the app
 * These colors are used throughout the app for consistent theming
 */

// Primary brand colors
const primaryColor = '#4a90e2';
const secondaryColor = '#5cdb95';
const accentColor = '#f76c6c';

// Light theme colors
const lightTheme = {
  // Basic colors
  primary: primaryColor,
  secondary: secondaryColor,
  accent: accentColor,
  
  // Text colors
  text: '#11181C',
  textSecondary: '#687076',
  textMuted: '#999999',
  textInverted: '#FFFFFF',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9F9F9',
  backgroundTertiary: '#F0F0F0',
  
  // UI Element colors
  card: '#FFFFFF',
  cardBorder: '#EEEEEE',
  input: '#F9F9F9',
  inputBorder: '#DDDDDD',
  button: primaryColor,
  buttonText: '#FFFFFF',
  
  // State colors
  success: '#5cdb95',
  error: '#ff6b6b',
  warning: '#ffbe76',
  info: primaryColor,
  
  // Tab navigation
  tabIconDefault: '#687076',
  tabIconSelected: primaryColor,
  tabBackground: '#FFFFFF',
  
  // Chat specific
  userBubble: '#E1F0FF',
  userBubbleText: '#11181C',
  tutorBubble: primaryColor,
  tutorBubbleText: '#FFFFFF',
  
  // Theme toggle
  themeToggleBackground: '#F0F0F0',
  themeToggleIcon: '#333333',
  
  // Mode selector
  modeButtonBackground: '#F0F0F0',
  modeButtonText: '#333333',
  modeButtonActiveBackground: primaryColor,
  modeButtonActiveText: '#FFFFFF',
};

// Dark theme colors
const darkTheme = {
  // Basic colors
  primary: '#5ca0e2', // Slightly lighter for dark theme
  secondary: '#3daa74',
  accent: '#f87c7c',
  
  // Text colors
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  textMuted: '#777777',
  textInverted: '#11181C',
  
  // Background colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2A2A2A',
  
  // UI Element colors
  card: '#2A2A2A',
  cardBorder: '#333333',
  input: '#333333',
  inputBorder: '#555555',
  button: '#5ca0e2',
  buttonText: '#FFFFFF',
  
  // State colors
  success: '#3daa74',
  error: '#e06464',
  warning: '#e0a964',
  info: '#5ca0e2',
  
  // Tab navigation
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#FFFFFF',
  tabBackground: '#1E1E1E',
  
  // Chat specific
  userBubble: '#2D5272',
  userBubbleText: '#ECEDEE',
  tutorBubble: '#3a6ca3',
  tutorBubbleText: '#FFFFFF',
  
  // Theme toggle
  themeToggleBackground: '#333333',
  themeToggleIcon: '#FFFFFF',
  
  // Mode selector
  modeButtonBackground: '#333333',
  modeButtonText: '#ECEDEE',
  modeButtonActiveBackground: '#5ca0e2',
  modeButtonActiveText: '#FFFFFF',
};

// Special colors for specific categories
const categoryColors = {
  light: {
    frontend: '#4a90e2',
    programming: '#e24a90',
    design: '#90e24a',
    default: '#4a90e2',
  },
  dark: {
    frontend: '#6a8eff',
    programming: '#ff6a8e',
    design: '#8eff6a',
    default: '#6a8eff',
  }
};

export default {
  light: lightTheme,
  dark: darkTheme,
  categoryColors,
  
  // Export original Colors format for backward compatibility
  legacyLight: {
    text: lightTheme.text,
    background: lightTheme.background,
    tint: lightTheme.primary,
    icon: lightTheme.textSecondary,
    tabIconDefault: lightTheme.tabIconDefault,
    tabIconSelected: lightTheme.primary,
  },
  legacyDark: {
    text: darkTheme.text,
    background: darkTheme.background,
    tint: darkTheme.primary,
    icon: darkTheme.textSecondary,
    tabIconDefault: darkTheme.tabIconDefault,
    tabIconSelected: darkTheme.primary,
  }
};

