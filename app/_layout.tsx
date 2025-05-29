import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { createContext, useState, useContext, useEffect } from 'react';

import { useColorScheme as useDeviceColorScheme } from '@/hooks/useColorScheme';

// Create a context for theme management
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: (_: 'light' | 'dark') => {},
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(deviceColorScheme || 'light');
  
  // Update theme when device color scheme changes
  useEffect(() => {
    if (deviceColorScheme) {
      setTheme(deviceColorScheme);
    }
  }, [deviceColorScheme]);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="learning-path" options={{ headerShown: false }} />
          <Stack.Screen name="html-intro" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
