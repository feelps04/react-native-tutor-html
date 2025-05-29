import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from './_layout';
import { generateQuestions } from '../api/geminiApi';
import { getTopicById } from '../constants/LearningTopics';

// Hardcoded colors to avoid import issues
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
  },
  categoryColors: {
    light: {
      frontend: '#4a90e2'
    },
    dark: {
      frontend: '#6a8eff'
    }
  }
};

/**
 * HTML Introduction Screen
 * Shows introductory content about HTML and Gemini-generated questions
 */
export default function HtmlIntro() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  
  // Get topic from params or default to HTML
  const topicId = params.topicId || 'html';
  const topicData = getTopicById(topicId);
  
  // Responsive layout detection
  const isTablet = width > 768;
  const isLargePhone = width > 480 && width <= 768;
  const isSmallPhone = width <= 480;
  const isLandscape = width > height;
  
  // Make sure theme is a valid value before using it
  const safeTheme = theme || 'light';
  
  const themeColors = hardcodedColors[safeTheme] || hardcodedColors.light;
  
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load questions from Gemini API
  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Define available categories
      const categories = ["basics", "intermediate", "advanced", "practical", "theory"];
      
      // Randomly select a category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      console.log(`Generating questions for category: ${randomCategory}`);
      
      const generatedQuestions = await generateQuestions(
        topicData.name, 
        'medium', 
        isTablet ? 5 : 3,
        randomCategory
      );
      setQuestions(generatedQuestions);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, [topicId]);
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    setSelectedAnswers({});
    setShowResults(false);
    loadQuestions();
  };

  const handleSelectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
  };

  const isAnswerCorrect = (questionId, answerIndex) => {
    const question = questions.find(q => q.id === questionId);
    return question.correctAnswer === answerIndex;
  };
  
  // Get score
  const getScore = () => {
    if (!showResults) return null;
    
    let correctCount = 0;
    Object.keys(selectedAnswers).forEach(qId => {
      const question = questions.find(q => q.id === parseInt(qId));
      if (question && question.correctAnswer === selectedAnswers[qId]) {
        correctCount++;
      }
    });
    
    return {
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    };
  };
  
  const score = getScore();

  // Dynamic font sizes based on device
  const fontSizes = {
    title: isTablet ? 32 : (isLargePhone ? 28 : 24),
    sectionTitle: isTablet ? 24 : (isLargePhone ? 20 : 18),
    paragraph: isTablet ? 18 : 16,
    question: isTablet ? 18 : 16,
    option: isTablet ? 16 : 15,
  };

  return (
    <SafeAreaView style={[
      styles.container,
      {backgroundColor: themeColors.background}
    ]}>
      <StatusBar 
        barStyle={safeTheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={themeColors.background} 
      />
      
      {/* Header with platform-specific styling */}
      <View style={[
        styles.header, 
        {borderBottomColor: themeColors.cardBorder},
        Platform.OS === 'ios' && {paddingTop: 8}
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          {color: themeColors.text, fontSize: fontSizes.sectionTitle}
        ]}>
          {topicData.name}
        </Text>
        
        {/* Refresh button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading}
        >
          <Ionicons 
            name="refresh" 
            size={22} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer,
          isTablet && styles.tabletContainer,
          isLandscape && styles.landscapeContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
      >
        <View style={styles.section}>
          <View style={[styles.categoryBadge, {
            backgroundColor: topicData.color
          }]}>
            <Text style={styles.categoryText}>{topicData.name}</Text>
          </View>
          
          <Text style={[
            styles.title,
            {color: themeColors.text, fontSize: fontSizes.title}
          ]}>
            Introdução ao {topicData.name}
          </Text>
          
          <Text style={[
            styles.paragraph,
            {color: themeColors.textSecondary, fontSize: fontSizes.paragraph}
          ]}>
            {topicData.description} Aprenda os conceitos básicos e teste seus conhecimentos com perguntas geradas por IA.
          </Text>
          
          <View style={[
            styles.infoCard,
            {backgroundColor: themeColors.card, borderColor: themeColors.cardBorder}
          ]}>
            <Ionicons name="information-circle-outline" size={24} color={themeColors.primary} />
            <Text style={[
              styles.infoText, 
              {color: themeColors.textSecondary, fontSize: fontSizes.paragraph - 1}
            ]}>
              {topicId === 'html' 
                ? 'HTML foi criado por Tim Berners-Lee em 1991 e é mantido pelo W3C (World Wide Web Consortium).'
                : `As perguntas abaixo são geradas automaticamente para testar seu conhecimento em ${topicData.name}.`
              }
            </Text>
          </View>
          
          {topicId === 'html' && (
            <>
              <Text style={[
                styles.sectionTitle,
                {color: themeColors.text, fontSize: fontSizes.sectionTitle}
              ]}>
                Elementos Básicos do HTML
              </Text>
              
              <Text style={[
                styles.paragraph,
                {color: themeColors.textSecondary, fontSize: fontSizes.paragraph}
              ]}>
                O HTML utiliza elementos para estruturar o conteúdo. Cada elemento é representado por uma tag de abertura e uma tag de fechamento. Por exemplo:
              </Text>
              
              <View style={[
                styles.codeBlock,
                {backgroundColor: safeTheme === 'dark' ? '#1E1E2E' : '#F5F5F5'}
              ]}>
                <Text style={[
                  styles.code,
                  {color: safeTheme === 'dark' ? '#E4E4E4' : '#333333'}
                ]}>
                  {'<h1>Este é um título</h1>\n<p>Este é um parágrafo.</p>'}
                </Text>
              </View>
            </>
          )}
        </View>
        
        <View style={[styles.divider, {backgroundColor: themeColors.cardBorder}]} />
        
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            {color: themeColors.text, fontSize: fontSizes.sectionTitle}
          ]}>
            Teste seus conhecimentos
          </Text>
          
          <Text style={[
            styles.paragraph,
            {color: themeColors.textSecondary, fontSize: fontSizes.paragraph, marginBottom: 20}
          ]}>
            Responda às perguntas abaixo para testar o que você aprendeu sobre {topicData.name}:
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[styles.loadingText, {color: themeColors.textSecondary}]}>
                Gerando perguntas com IA...
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, {borderColor: themeColors.error}]}>
              <Ionicons name="alert-circle" size={24} color={themeColors.error} />
              <Text style={[styles.errorText, {color: themeColors.error}]}>{error}</Text>
              <TouchableOpacity 
                style={[styles.retryButton, {backgroundColor: themeColors.primary}]}
                onPress={loadQuestions}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Score display when results are shown */}
              {showResults && score && (
                <View style={[
                  styles.scoreCard, 
                  {
                    backgroundColor: themeColors.card, 
                    borderColor: score.percentage > 70 ? themeColors.success : (
                      score.percentage > 40 ? themeColors.warning : themeColors.error
                    )
                  }
                ]}>
                  <Text style={[styles.scoreTitle, {color: themeColors.text}]}>
                    Sua pontuação:
                  </Text>
                  <Text style={[
                    styles.scoreValue, 
                    {
                      color: score.percentage > 70 ? themeColors.success : (
                        score.percentage > 40 ? themeColors.warning : themeColors.error
                      )
                    }
                  ]}>
                    {score.correct} de {score.total} ({score.percentage}%)
                  </Text>
                </View>
              )}
            
              {questions.map((question) => (
                <View key={question.id} style={[
                  styles.questionCard,
                  {backgroundColor: themeColors.card, borderColor: themeColors.cardBorder}
                ]}>
                  <Text style={[
                    styles.questionText, 
                    {color: themeColors.text, fontSize: fontSizes.question}
                  ]}>
                    {question.question}
                  </Text>
                  
                  <View style={styles.optionsContainer}>
                    {question.options.map((option, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[
                          styles.optionButton,
                          {borderColor: themeColors.inputBorder},
                          selectedAnswers[question.id] === index && {
                            backgroundColor: themeColors.primary + '33', // Add transparency
                            borderColor: themeColors.primary,
                          },
                          showResults && selectedAnswers[question.id] === index && {
                            backgroundColor: isAnswerCorrect(question.id, index) 
                              ? themeColors.success + '33'
                              : themeColors.error + '33',
                            borderColor: isAnswerCorrect(question.id, index)
                              ? themeColors.success
                              : themeColors.error,
                          },
                          showResults && question.correctAnswer === index && {
                            borderColor: themeColors.success,
                            borderWidth: 2,
                          }
                        ]}
                        onPress={() => handleSelectAnswer(question.id, index)}
                        disabled={showResults}
                      >
                        <Text style={[
                          styles.optionText,
                          {color: themeColors.text, fontSize: fontSizes.option},
                          selectedAnswers[question.id] === index && {color: themeColors.primary},
                          showResults && selectedAnswers[question.id] === index && {
                            color: isAnswerCorrect(question.id, index)
                              ? themeColors.success
                              : themeColors.error
                          }
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {showResults && selectedAnswers[question.id] !== undefined && (
                    <View style={[styles.feedbackContainer, {borderTopColor: themeColors.cardBorder}]}>
                      <Ionicons 
                        name={isAnswerCorrect(question.id, selectedAnswers[question.id]) 
                          ? "checkmark-circle" 
                          : "close-circle"} 
                        size={20} 
                        color={isAnswerCorrect(question.id, selectedAnswers[question.id])
                          ? themeColors.success
                          : themeColors.error} 
                      />
                      <Text style={[
                        styles.feedbackText,
                        {
                          color: isAnswerCorrect(question.id, selectedAnswers[question.id])
                            ? themeColors.success
                            : themeColors.error
                        }
                      ]}>
                        {isAnswerCorrect(question.id, selectedAnswers[question.id])
                          ? "Resposta correta!"
                          : `Resposta incorreta. A resposta correta é: ${question.options[question.correctAnswer]}`
                        }
                      </Text>
                    </View>
                  )}
                  
                  {/* Show explanation when results are displayed */}
                  {showResults && question.explanation && (
                    <View style={[styles.explanationContainer, {backgroundColor: themeColors.backgroundSecondary}]}>
                      <Text style={[styles.explanationText, {color: themeColors.textSecondary}]}>
                        <Text style={{fontWeight: 'bold'}}>Explicação: </Text>
                        {question.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              
              {!showResults ? (
                <TouchableOpacity
                  style={[
                    styles.checkButton, 
                    {backgroundColor: themeColors.primary},
                    Object.keys(selectedAnswers).length !== questions.length && {
                      opacity: 0.6
                    }
                  ]}
                  onPress={handleCheckAnswers}
                  disabled={Object.keys(selectedAnswers).length !== questions.length}
                >
                  <Text style={styles.checkButtonText}>Verificar Respostas</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.nextButton, {backgroundColor: themeColors.secondary}]}
                    onPress={() => router.push('/learning-path')}
                  >
                    <Text style={styles.nextButtonText}>Continuar Aprendendo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.tryAgainButton, {borderColor: themeColors.primary}]}
                    onPress={onRefresh}
                  >
                    <Text style={[styles.tryAgainText, {color: themeColors.primary}]}>
                      Tentar Novas Perguntas
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
  landscapeContainer: {
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 24,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  codeBlock: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  code: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  questionCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tryAgainButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  tryAgainText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

