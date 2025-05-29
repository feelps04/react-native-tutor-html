import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from './_layout';

/**
 * Entry point that redirects to the home screen
 * This serves as a loading screen before redirecting
 */
export default function Index() {
  const { theme } = useAppTheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? '#121212' : '#FFFFFF' }
    ]}>
      <ActivityIndicator size="large" color={theme === 'dark' ? '#5ca0e2' : '#4a90e2'} />
      <Redirect href="/home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

