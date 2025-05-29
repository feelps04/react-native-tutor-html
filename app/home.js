import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from './_layout';
import Colors from '../constants/Colors';

/**
 * Home screen for user registration
 * Based on the Home.jsx component from vite-project
 */
export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Validation for name to allow only letters and spaces
  const isValidName = (name) => {
    // Regex for letters and spaces only
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name);
  };

  const handleSubmit = async () => {
    // Reset errors
    setNameError('');
    setEmailError('');
    
    // 1. Validate empty fields
    if (userName.trim() === '') {
      setNameError('O nome é obrigatório.');
      return;
    }
    
    if (userEmail.trim() === '') {
      setEmailError('O email é obrigatório.');
      return;
    }
    
    // 2. Validate name format
    if (!isValidName(userName)) {
      setNameError('O nome deve conter apenas letras e espaços.');
      return;
    }
    
    // 3. Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setEmailError('Formato de email inválido.');
      return;
    }
    
    try {
      // Store user info in AsyncStorage (simulating a session)
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        name: userName,
        email: userEmail,
        sessionId: 'session-' + Date.now(),
      }));
      
      // Navigate to the learning path screen
      router.push('/learning-path');
    } catch (error) {
      console.error('Error saving user info:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar suas informações. Tente novamente.'
      );
    }
  };

  // Filter name input to remove numbers and special characters in real-time
  const handleNameChange = (text) => {
    const filteredText = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    setUserName(filteredText);
    setNameError('');
  };

  return (
    <SafeAreaView style={[
      styles.container,
      theme === 'dark' ? styles.darkContainer : styles.lightContainer
    ]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={[
              styles.themeToggle,
              theme === 'dark' ? styles.darkThemeToggle : styles.lightThemeToggle
            ]} 
            onPress={toggleTheme}
          >
            <Ionicons 
              name={theme === 'dark' ? 'sunny' : 'moon'} 
              size={24} 
              color={theme === 'dark' ? '#FFF' : '#333'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person-circle-outline"
            size={120}
            color={theme === 'dark' ? '#FFFFFF' : '#4a90e2'}
            style={styles.avatar}
          />
        </View>
        
        <Text style={[
          styles.title,
          theme === 'dark' ? styles.darkText : styles.lightText
        ]}>
          Bem-vindo ao Tutor Web!
        </Text>
        
        <Text style={[
          styles.subtitle,
          theme === 'dark' ? styles.darkSubText : styles.lightSubText
        ]}>
          Antes de começarmos sua jornada de aprendizado em HTML e CSS, por favor, nos diga um pouco sobre você.
        </Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              theme === 'dark' ? styles.darkText : styles.lightText
            ]}>
              Seu Nome:
            </Text>
            <TextInput
              style={[
                styles.input,
                theme === 'dark' ? styles.darkInput : styles.lightInput,
                nameError ? styles.inputError : null
              ]}
              placeholder="Digite seu nome"
              placeholderTextColor={theme === 'dark' ? '#999' : '#999'}
              value={userName}
              onChangeText={handleNameChange}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              theme === 'dark' ? styles.darkText : styles.lightText
            ]}>
              Seu Email:
            </Text>
            <TextInput
              style={[
                styles.input,
                theme === 'dark' ? styles.darkInput : styles.lightInput,
                emailError ? styles.inputError : null
              ]}
              placeholder="Digite seu email"
              placeholderTextColor={theme === 'dark' ? '#999' : '#999'}
              value={userEmail}
              onChangeText={(text) => {
                setUserEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Começar a Aprender!</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.socialLinks}>
          <Text style={[
            styles.socialText,
            theme === 'dark' ? styles.darkSubText : styles.lightSubText
          ]}>
            Conecte-se Conosco!
          </Text>
          
          <TouchableOpacity 
            style={styles.discordButton}
            onPress={() => {
              Alert.alert("Discord", "Você seria redirecionado para o Discord em um app real.");
            }}
          >
            <Ionicons name="logo-discord" size={24} color="#7289DA" />
            <Text style={styles.discordText}>Junte-se ao nosso Discord</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
  lightThemeToggle: {
    backgroundColor: '#f0f0f0',
  },
  darkThemeToggle: {
    backgroundColor: '#333',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#f0f0f0',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  lightSubText: {
    color: '#666',
  },
  darkSubText: {
    color: '#aaa',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  lightInput: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4a90e2',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialLinks: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  socialText: {
    fontSize: 16,
    marginBottom: 15,
  },
  discordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  discordText: {
    color: '#7289DA',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

