import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from './_layout';
import { LEARNING_TOPICS, getDifficultyLabel } from '../constants/LearningTopics';

// Hardcoded colors for theme consistency
const hardcodedColors = {
  light: {
    primary: '#4a90e2',
    secondary: '#5cdb95',
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    card: '#FFFFFF',
    cardBorder: '#EEEEEE',
    inputBorder: '#DDDDDD',
  },
  dark: {
    primary: '#5ca0e2',
    secondary: '#3daa74',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    card: '#2A2A2A',
    cardBorder: '#333333',
    inputBorder: '#555555',
  }
};

export default function LearningPath() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  
  // Make sure theme is a valid value
  const safeTheme = theme || 'light';
  const themeColors = hardcodedColors[safeTheme] || hardcodedColors.light;
  
  // Responsive grid sizing
  const isTablet = width > 768;
  const numColumns = isTablet ? 3 : (width > 480 ? 2 : 1);
  
  const navigateToTopic = (topicId) => {
    // Navigate to the topic screen with the selected topic ID
    router.push({
      pathname: '/html-intro',
      params: { topicId }
    });
  };
  
  const renderTopicItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.topicCard,
        { 
          backgroundColor: themeColors.card,
          borderColor: themeColors.cardBorder,
          width: isTablet ? '30%' : (width > 480 ? '45%' : '90%')
        }
      ]}
      onPress={() => navigateToTopic(item.id)}
    >
      <View style={[styles.topicIconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={32} color="#FFFFFF" />
      </View>
      
      <Text style={[styles.topicName, { color: themeColors.text }]}>
        {item.name}
      </Text>
      
      <Text style={[styles.topicDescription, { color: themeColors.textSecondary }]}>
        {item.description}
      </Text>
      
      <View style={styles.difficultyContainer}>
        <Text style={[styles.difficultyLabel, { color: item.color }]}>
          {getDifficultyLabel(item.difficulty)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={safeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      
      <View style={[styles.header, { borderBottomColor: themeColors.cardBorder }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
            size={24}
            color={themeColors.text}
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Trilha de Aprendizado
        </Text>
        
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={() => router.push('/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={themeColors.text}
          />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.banner, { backgroundColor: themeColors.primary }]}>
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>
            Comece sua jornada
          </Text>
          <Text style={[styles.bannerSubtitle, { color: '#FFFFFF' }]}>
            Escolha um tópico para começar a aprender
          </Text>
        </View>
      </View>
      
      <FlatList
        data={LEARNING_TOPICS}
        renderItem={renderTopicItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.topicsList}
        numColumns={numColumns}
        key={numColumns.toString()} // Force re-render when columns change
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  banner: {
    height: 150,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bannerContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  topicsList: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topicCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  topicIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  topicDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  difficultyContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

