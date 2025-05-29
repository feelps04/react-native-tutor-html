import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from './_layout';
import { generateQuestions } from '../api/geminiApi';

// API key storage constant
const GEMINI_API_KEY_STORAGE = '@gemini_api_key';

// Hardcoded colors to maintain consistency with other screens
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
    success: '#5cdb95',
    error: '#ff6b6b',
    warning: '#ffbe76',
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
    success: '#3daa74',
    error: '#e06464',
    warning: '#e0a964',
  }
};

export default function Settings() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  
  // Make sure theme is a valid value
  const safeTheme = theme || 'light';
  const themeColors = hardcodedColors[safeTheme] || hardcodedColors.light;
  
  // Responsive design settings
  const isTablet = width > 768;
  const isLargePhone = width > 480 && width <= 768;

  // State variables
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [savedKey, setSavedKey] = useState(false);

  // Load saved API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
        if (storedKey) {
          setApiKey(storedKey);
          setSavedKey(true);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  // Save API key to AsyncStorage
  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma chave de API válida.');
      return;
    }

    setIsLoading(true);
    try {
      await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey.trim());
      setSavedKey(true);
      setIsLoading(false);
      Alert.alert('Sucesso', 'Chave de API salva com sucesso!');
    } catch (error) {
      console.error('Error saving API key:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível salvar a chave de API. Tente novamente.');
    }
  };

  // Clear API key from AsyncStorage
  const clearApiKey = async () => {
    Alert.alert(
      'Remover chave de API',
      'Tem certeza que deseja remover sua chave de API do Google Gemini?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AsyncStorage.removeItem(GEMINI_API_KEY_STORAGE);
              setApiKey('');
              setSavedKey(false);
              setTestStatus(null);
              setIsLoading(false);
              Alert.alert('Sucesso', 'Chave de API removida com sucesso.');
            } catch (error) {
              console.error('Error removing API key:', error);
              setIsLoading(false);
              Alert.alert('Erro', 'Não foi possível remover a chave de API. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // Test the API key by attempting to generate questions
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma chave de API para testar.');
      return;
    }

    setTestStatus('loading');
    try {
      // Store the key temporarily so the generateQuestions function can use it
      await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey.trim());
      setSavedKey(true);
      
      // Try to generate a test question
      const testQuestions = await generateQuestions('HTML', 'beginner', 1);
      
      // If we got a response without error, the key is valid
      if (testQuestions && testQuestions.length > 0) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestStatus('error');
    }
  };

  // Dynamic font sizes based on device
  const fontSizes = {
    title: isTablet ? 32 : (isLargePhone ? 28 : 24),
    sectionTitle: isTablet ? 24 : (isLargePhone ? 20 : 18),
    paragraph: isTablet ? 18 : 16,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={safeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      
      {/* Header */}
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
          Configurações
        </Text>
        
        <View style={styles.placeholderRight} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            isTablet && styles.tabletContainer,
          ]}
        >
          {/* Main content */}
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: themeColors.text, fontSize: fontSizes.sectionTitle }
            ]}>
              Configuração da API Google Gemini
            </Text>
            
            <Text style={[
              styles.paragraph,
              { color: themeColors.textSecondary, fontSize: fontSizes.paragraph }
            ]}>
              Para gerar perguntas personalizadas, você precisará de uma chave de API do Google Gemini.
              Esta chave será armazenada apenas no seu dispositivo.
            </Text>

            <View style={[
              styles.infoCard,
              { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.cardBorder }
            ]}>
              <Ionicons name="information-circle-outline" size={24} color={themeColors.primary} />
              <Text style={[
                styles.infoText,
                { color: themeColors.textSecondary }
              ]}>
                Você pode obter uma chave de API gratuita do Google Gemini em 3 passos simples:{'\n\n'}
                1. Visite{' '}
                <Text style={{ color: themeColors.primary }}>
                  https://ai.google.dev/
                </Text>{'\n\n'}
                2. Clique em "Get API key" e faça login com sua conta Google{'\n\n'}
                3. Crie um novo projeto ou use um existente e copie a chave gerada
              </Text>
            </View>

            {/* API Key Input */}
            <Text style={[
              styles.inputLabel,
              { color: themeColors.text }
            ]}>
              Chave de API do Google Gemini
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: themeColors.text,
                    borderColor: themeColors.inputBorder,
                    backgroundColor: themeColors.backgroundSecondary,
                  }
                ]}
                placeholder="Cole sua chave de API aqui"
                placeholderTextColor={themeColors.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
              />
              
              {savedKey && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setApiKey('')}
                >
                  <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Test Status */}
            {testStatus && (
              <View style={[
                styles.statusCard,
                { 
                  backgroundColor: testStatus === 'success' 
                    ? themeColors.success + '20'
                    : testStatus === 'error'
                      ? themeColors.error + '20'
                      : themeColors.backgroundSecondary,
                  borderColor: testStatus === 'success'
                    ? themeColors.success
                    : testStatus === 'error'
                      ? themeColors.error
                      : themeColors.cardBorder
                }
              ]}>
                {testStatus === 'loading' ? (
                  <ActivityIndicator size="small" color={themeColors.primary} />
                ) : (
                  <Ionicons
                    name={testStatus === 'success' ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={testStatus === 'success' ? themeColors.success : themeColors.error}
                  />
                )}
                <Text style={[
                  styles.statusText,
                  { 
                    color: testStatus === 'success'
                      ? themeColors.success
                      : testStatus === 'error'
                        ? themeColors.error
                        : themeColors.textSecondary
                  }
                ]}>
                  {testStatus === 'loading'
                    ? 'Testando a chave de API...'
                    : testStatus === 'success'
                      ? 'Chave de API válida!'
                      : 'Chave de API inválida ou ocorreu um erro. Verifique a chave e sua conexão com a internet.'
                  }
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: themeColors.primary },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={saveApiKey}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {savedKey ? 'Atualizar Chave' : 'Salvar Chave'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: themeColors.primary },
                  testStatus === 'loading' && { opacity: 0.7 }
                ]}
                onPress={testApiKey}
                disabled={testStatus === 'loading' || isLoading}
              >
                <Text style={[styles.secondaryButtonText, { color: themeColors.primary }]}>
                  Testar Chave
                </Text>
              </TouchableOpacity>
            </View>
            
            {savedKey && (
              <TouchableOpacity
                style={[
                  styles.dangerButton,
                  { borderColor: themeColors.error },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={clearApiKey}
                disabled={isLoading}
              >
                <Text style={[styles.dangerButtonText, { color: themeColors.error }]}>
                  Remover Chave de API
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={[styles.divider, { backgroundColor: themeColors.cardBorder }]} />
            
            <Text style={[
              styles.helpText,
              { color: themeColors.textSecondary }
            ]}>
              Após salvar sua chave de API, você poderá gerar perguntas personalizadas usando
              a tecnologia de IA do Google Gemini. Se você não inserir uma chave válida, o aplicativo
              usará perguntas pré-definidas.{'\n\n'}
              Se você já salvou sua chave e ainda vê perguntas pré-definidas, verifique:{'\n'}
              • Se a chave foi digitada corretamente (sem espaços extras){'\n'}
              • Se a chave está realmente ativa na plataforma Google AI{'\n'}
              • Se seu dispositivo tem conexão à internet{'\n'}
              • Tente testar a chave novamente usando o botão "Testar Chave"
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
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
    textAlign: 'center',
  },
  placeholderRight: {
    width: 40,
  },
  scrollContainer: {
    padding: 16,
  },
  tabletContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    marginRight: 8,
  },
  secondaryButton: {
    marginLeft: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});

