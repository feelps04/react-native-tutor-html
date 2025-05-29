import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from './_layout';

// Mock learning topics (same as in learning-path.js)
const mockLearningTopics = {
  html_intro: {
    id: 'html_intro',
    name: 'Introdução ao HTML',
    description: 'Fundamentos básicos do HTML, tags e estrutura.',
    level: 1,
    category: 'frontend',
    prerequisite: null,
    icon: 'code-slash-outline'
  },
  html_semantic: {
    id: 'html_semantic',
    name: 'HTML Semântico',
    description: 'Uso correto de tags semânticas para melhor estrutura.',
    level: 2,
    category: 'frontend',
    prerequisite: 'html_intro',
    icon: 'document-text-outline'
  },
  css_basics: {
    id: 'css_basics',
    name: 'Fundamentos de CSS',
    description: 'Estilização básica com CSS, seletores e propriedades.',
    level: 1,
    category: 'frontend',
    prerequisite: 'html_intro',
    icon: 'color-palette-outline'
  },
  css_layout: {
    id: 'css_layout',
    name: 'Layouts em CSS',
    description: 'Técnicas de layout como Flexbox e Grid.',
    level: 2,
    category: 'frontend',
    prerequisite: 'css_basics',
    icon: 'grid-outline'
  },
  js_intro: {
    id: 'js_intro',
    name: 'Introdução ao JavaScript',
    description: 'Fundamentos da linguagem JavaScript.',
    level: 1,
    category: 'programming',
    prerequisite: 'html_intro',
    icon: 'logo-javascript'
  },
  js_dom: {
    id: 'js_dom',
    name: 'JavaScript e DOM',
    description: 'Manipulação do DOM com JavaScript.',
    level: 2,
    category: 'programming',
    prerequisite: 'js_intro',
    icon: 'construct-outline'
  },
  responsive: {
    id: 'responsive',
    name: 'Design Responsivo',
    description: 'Criação de sites que funcionam em diferentes dispositivos.',
    level: 3,
    category: 'frontend',
    prerequisite: 'css_layout',
    icon: 'phone-portrait-outline'
  },
};

// Component: Chat Header
const ChatHeader = ({ 
  currentTopic, 
  learningTopics, 
  currentMode, 
  handleModeChange, 
  theme, 
  toggleTheme, 
  onBackToPath, 
  isLoading 
}) => {
  const topicName = learningTopics[currentTopic]?.name || 'Carregando...';
  
  return (
    <View style={[
      styles.header,
      theme === 'dark' ? styles.darkHeader : styles.lightHeader
    ]}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToPath}
          disabled={isLoading}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === 'dark' ? '#ECEDEE' : '#11181C'}
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[
            styles.headerTitle,
            theme === 'dark' ? styles.darkText : styles.lightText
          ]} numberOfLines={1} ellipsizeMode="tail">
            {topicName}
          </Text>
          {currentTopic && learningTopics[currentTopic] && (
            <View style={styles.topicCategoryBadge}>
              <Text style={styles.topicCategoryText}>
                {learningTopics[currentTopic].category === 'frontend' ? 'Frontend' : 
                 learningTopics[currentTopic].category === 'programming' ? 'Programação' : 
                 'Outro'}
              </Text>
            </View>
          )}
        </View>
        
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
            color={theme === 'dark' ? '#FFFFFF' : '#333333'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'iniciante' && styles.activeModeButton,
            theme === 'dark' && styles.darkModeButton
          ]}
          onPress={() => handleModeChange('iniciante')}
        >
          <Text style={[
            styles.modeButtonText,
            currentMode === 'iniciante' && styles.activeModeText,
            theme === 'dark' && styles.darkModeText
          ]}>
            Iniciante
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'intermediario' && styles.activeModeButton,
            theme === 'dark' && styles.darkModeButton
          ]}
          onPress={() => handleModeChange('intermediario')}
        >
          <Text style={[
            styles.modeButtonText,
            currentMode === 'intermediario' && styles.activeModeText,
            theme === 'dark' && styles.darkModeText
          ]}>
            Intermediário
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'avancado' && styles.activeModeButton,
            theme === 'dark' && styles.darkModeButton
          ]}
          onPress={() => handleModeChange('avancado')}
        >
          <Text style={[
            styles.modeButtonText,
            currentMode === 'avancado' && styles.activeModeText,
            theme === 'dark' && styles.darkModeText
          ]}>
            Avançado
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component: Message Bubble
const MessageBubble = ({ message, theme, handleFeedback, lastMessageIsExercise, hasEvaluatedLastExercise, handleExerciseEvaluation, isLastMessage }) => {
  const isUserMessage = message.sender === 'user';
  
  return (
    <View style={[
      styles.messageBubbleContainer,
      isUserMessage ? styles.userMessageContainer : styles.tutorMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isUserMessage 
          ? (theme === 'dark' ? styles.darkUserBubble : styles.lightUserBubble)
          : (theme === 'dark' ? styles.darkTutorBubble : styles.lightTutorBubble)
      ]}>
        <Text style={[
          styles.messageText,
          isUserMessage 
            ? (theme === 'dark' ? styles.darkUserText : styles.lightUserText)
            : (theme === 'dark' ? styles.darkTutorText : styles.lightTutorText)
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTimestamp,
          isUserMessage 
            ? (theme === 'dark' ? styles.darkUserTimestamp : styles.lightUserTimestamp)
            : (theme === 'dark' ? styles.darkTutorTimestamp : styles.lightTutorTimestamp)
        ]}>
          {message.timestamp}
        </Text>
      </View>
      
      {!isUserMessage && !message.feedbackShown && (
        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback(message.id, 'thumbs_up', message.text)}
          >
            <Ionicons name="thumbs-up-outline" size={20} color={theme === 'dark' ? '#ECEDEE' : '#11181C'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback(message.id, 'thumbs_down', message.text)}
          >
            <Ionicons name="thumbs-down-outline" size={20} color={theme === 'dark' ? '#ECEDEE' : '#11181C'} />
          </TouchableOpacity>
        </View>
      )}
      
      {!isUserMessage && lastMessageIsExercise && isLastMessage && !hasEvaluatedLastExercise && (
        <View style={styles.exerciseEvaluationContainer}>
          <Text style={[
            styles.exerciseQuestion,
            theme === 'dark' ? styles.darkText : styles.lightText
          ]}>
            Conseguiu resolver este exercício?
          </Text>
          <View style={styles.exerciseButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.exerciseButton,
                styles.correctButton,
                theme === 'dark' ? styles.darkCorrectButton : styles.lightCorrectButton
              ]}
              onPress={() => handleExerciseEvaluation(true)}
            >
              <Text style={styles.exerciseButtonText}>Sim, resolvi corretamente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.exerciseButton,
                styles.incorrectButton,
                theme === 'dark' ? styles.darkIncorrectButton : styles.lightIncorrectButton
              ]}
              onPress={() => handleExerciseEvaluation(false)}
            >
              <Text style={styles.exerciseButtonText}>Não, tive dificuldades</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Component: Messages Display
const MessagesDisplay = ({
  messages,
  isLoading,
  handleFeedback,
  lastMessageIsExercise,
  hasEvaluatedLastExercise,
  handleExerciseEvaluation,
  theme
}) => {
  const flatListRef = useRef(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
  const renderMessage = ({ item, index }) => (
    <MessageBubble
      message={item}
      theme={theme}
      handleFeedback={handleFeedback}
      lastMessageIsExercise={lastMessageIsExercise}
      hasEvaluatedLastExercise={hasEvaluatedLastExercise}
      handleExerciseEvaluation={handleExerciseEvaluation}
      isLastMessage={index === messages.length - 1}
    />
  );
  
  return (
    <View style={styles.messagesContainer}>
      {messages.length === 0 && !isLoading ? (
        <View style={styles.emptyMessagesContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={64}
            color={theme === 'dark' ? '#777777' : '#999999'}
          />
          <Text style={[
            styles.emptyMessagesText,
            theme === 'dark' ? styles.darkSubText : styles.lightSubText
          ]}>
            Envie uma mensagem para começar a conversa com o tutor.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme === 'dark' ? '#5ca0e2' : '#4a90e2'} />
          <Text style={[
            styles.loadingText,
            theme === 'dark' ? styles.darkSubText : styles.lightSubText
          ]}>
            Tutor está digitando...
          </Text>
        </View>
      )}
    </View>
  );
};

// Component: Message Input
const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
  suggestedQuestions,
  onSuggestedQuestionClick,
  theme
}) => {
  return (
    <View style={[
      styles.inputContainer,
      theme === 'dark' ? styles.darkInputContainer : styles.lightInputContainer
    ]}>
      {suggestedQuestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestedQuestionsContainer}
          contentContainerStyle={styles.suggestedQuestionsContent}
        >
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestedQuestion,
                theme === 'dark' ? styles.darkSuggestedQuestion : styles.lightSuggestedQuestion
              ]}
              onPress={() => onSuggestedQuestionClick(question)}
              disabled={isLoading}
            >
              <Text style={[
                styles.suggestedQuestionText,
                theme === 'dark' ? styles.darkSuggestedQuestionText : styles.lightSuggestedQuestionText
              ]} numberOfLines={1} ellipsizeMode="tail">
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.textInput,
            theme === 'dark' ? styles.darkTextInput : styles.lightTextInput
          ]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={theme === 'dark' ? '#777777' : '#999999'}
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            isLoading || !inputMessage.trim() ? styles.disabledSendButton : null,
            theme === 'dark' ? styles.darkSendButton : styles.lightSendButton
          ]}
          onPress={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={isLoading || !inputMessage.trim() 
              ? (theme === 'dark' ? '#777777' : '#999999')
              : (theme === 'dark' ? '#FFFFFF' : '#FFFFFF')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component: Score Display
const ScoreDisplay = ({ correctExercisesCount, totalExercisesAttempted, theme }) => {
  if (totalExercisesAttempted === 0) {
    return null;
  }
  
  const scorePercentage = Math.round((correctExercisesCount / totalExercisesAttempted) * 100);
  
  return (
    <View style={[
      styles.scoreContainer,
      theme === 'dark' ? styles.darkScoreContainer : styles.lightScoreContainer
    ]}>
      <View style={styles.scoreRow}>
        <Ionicons
          name="trophy-outline"
          size={20}
          color={theme === 'dark' ? '#3daa74' : '#5cdb95'}
        />
        <Text style={[
          styles.scoreText,
          theme === 'dark' ? styles.darkText : styles.lightText
        ]}>
          Desempenho: {correctExercisesCount}/{totalExercisesAttempted} exercícios ({scorePercentage}%)
        </Text>
      </View>
    </View>
  );
};

// Main Chat Screen Component
export default function Chat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, toggleTheme } = useAppTheme();
  
  // State variables
  const [sessionId, setSessionId] = useState(null);
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(params?.topic || 'html_intro');
  const [currentMode, setCurrentMode] = useState(params?.mode || 'iniciante');
  const [learningTopics, setLearningTopics] = useState({});
  const [correctExercisesCount, setCorrectExercisesCount] = useState(0);
  const [totalExercisesAttempted, setTotalExercisesAttempted] = useState(0);
  const [lastMessageIsExercise, setLastMessageIsExercise] = useState(false);
  const [hasEvaluatedLastExercise, setHasEvaluatedLastExercise] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // Function to generate suggested questions based on topic and mode
  const generateSuggestedQuestions = useCallback((topicKey, mode) => {
    const questions = [];
    const topicName = learningTopics[topicKey]?.name || 'este tópico';

    if (mode === 'iniciante') {
      questions.push(`O que é ${topicName}?`);
      questions.push(`Quais os conceitos básicos de ${topicName}?`);
      questions.push(`Poderia dar um exemplo simples de ${topicName}?`);
    } else if (mode === 'intermediario') {
      questions.push(`Como posso aplicar ${topicName} em um projeto real?`);
      questions.push(`Quais são as melhores práticas para ${topicName}?`);
      questions.push(`Existe algum problema comum ao usar ${topicName} e como resolvê-lo?`);
    } else if (mode === 'avancado') {
      questions.push(`Explique as nuances avançadas de ${topicName}.`);
      questions.push(`Quais são os casos de uso complexos para ${topicName}?`);
      questions.push(`Compare ${topicName} com tecnologias alternativas.`);
    }

    // Add general questions regardless of mode/topic
    questions.push("Poderia me dar um exercício sobre o tema atual?");
    questions.push("Quais os próximos passos na trilha de aprendizado?");

    return questions;
  }, [learningTopics]);

  // Load user info, session, and learning topics on mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setUserName(userInfo.name);
          setSessionId(userInfo.sessionId);
        } else {
          // If no user info is found, redirect to home
          router.replace('/home');
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar suas informações. Por favor, faça login novamente.'
        );
        router.replace('/home');
      }
    };

    const loadChatHistory = async () => {
      try {
        // Check if we have previous messages for this topic
        const chatHistoryString = await AsyncStorage.getItem(`chat_history_${currentTopic}`);
        if (chatHistoryString) {
          const chatHistory = JSON.parse(chatHistoryString);
          setMessages(chatHistory.messages || []);
          setCorrectExercisesCount(chatHistory.correctExercisesCount || 0);
          setTotalExercisesAttempted(chatHistory.totalExercisesAttempted || 0);
          setLastMessageIsExercise(chatHistory.lastMessageIsExercise || false);
          setHasEvaluatedLastExercise(chatHistory.hasEvaluatedLastExercise || false);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    const loadLearningTopics = async () => {
      // In a real app, this would be an API call
      // For now, we'll use the mock data
      setLearningTopics(mockLearningTopics);
    };

    loadUserInfo();
    loadChatHistory();
    loadLearningTopics();
  }, [router, currentTopic]);

  // Update suggested questions when topic or mode changes
  useEffect(() => {
    if (Object.keys(learningTopics).length > 0) {
      setSuggestedQuestions(generateSuggestedQuestions(currentTopic, currentMode));
    }
  }, [currentTopic, currentMode, generateSuggestedQuestions, learningTopics]);

  // Save chat history when messages change
  useEffect(() => {
    const saveChatHistory = async () => {
      if (messages.length > 0) {
        try {
          await AsyncStorage.setItem(`chat_history_${currentTopic}`, JSON.stringify({
            messages,
            correctExercisesCount,
            totalExercisesAttempted,
            lastMessageIsExercise,
            hasEvaluatedLastExercise
          }));
        } catch (error) {
          console.error('Error saving chat history:', error);
        }
      }
    };

    saveChatHistory();
  }, [messages, currentTopic, correctExercisesCount, totalExercisesAttempted, lastMessageIsExercise, hasEvaluatedLastExercise]);

  // Function to send user message to tutor
  const sendUserMessageToTutor = async (messageText) => {
    if (!messageText.trim() || !sessionId || isLoading) return;

    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLastMessageIsExercise(false);
    setHasEvaluatedLastExercise(false);

    try {
      // Simulate API call to tutor with a setTimeout
      setTimeout(() => {
        // Generate a mock response
        let tutorResponse;
        const lowercaseMessage = messageText.toLowerCase();
        
        // Check if this is a request for an exercise
        const isExerciseRequest = lowercaseMessage.includes('exercício') || 
                                lowercaseMessage.includes('exercicio') || 
                                lowercaseMessage.includes('praticar');
        
        if (isExerciseRequest) {
          // Generate an exercise based on the current topic
          tutorResponse = {
            id: messages.length + 2,
            text: generateExerciseForTopic(currentTopic),
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString(),
          };
          setLastMessageIsExercise(true);
        } else {
          // Generate a regular response
          tutorResponse = {
            id: messages.length + 2,
            text: generateTutorResponse(messageText, currentTopic, currentMode),
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString(),
          };
        }
        
        setMessages((prevMessages) => [...prevMessages, tutorResponse]);
        setIsLoading(false);
      }, 1500); // Simulate network delay
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: messages.length + 2,
          text: "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.",
          sender: 'tutor',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setIsLoading(false);
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    sendUserMessageToTutor(inputMessage);
  };

  // Handle mode change
  const handleModeChange = async (newMode) => {
    if (newMode !== currentMode) {
      setCurrentMode(newMode);
      await AsyncStorage.setItem('currentMode', newMode);
      
      // Send a message about the mode change
      const initialMessage = `Mudei para o modo ${newMode}.`;
      sendUserMessageToTutor(initialMessage);
    }
  };

  // Handle feedback
  const handleFeedback = async (messageId, feedbackType, messageText) => {
    try {
      // In a real app, this would send the feedback to an API
      // For now, just update the UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, feedback: feedbackType, feedbackShown: true } : msg
        )
      );
      
      // Show a thank you message
      Alert.alert(
        "Obrigado!",
        "Seu feedback ajuda a melhorar o tutor."
      );
    } catch (error) {
      console.error("Error sending feedback:", error);
      Alert.alert(
        "Erro",
        "Falha ao enviar feedback. Por favor, tente novamente."
      );
    }
  };

  // Handle back to path
  const handleBackToPath = () => {
    router.replace('/learning-path');
  };

  // Handle exercise evaluation
  const handleExerciseEvaluation = async (isCorrect) => {
    setHasEvaluatedLastExercise(true);

    try {
      // Update scores
      setTotalExercisesAttempted((prev) => prev + 1);
      if (isCorrect) {
        setCorrectExercisesCount((prev) => prev + 1);
      }
      
      // Simulate API response
      setTimeout(() => {
        const responseText = isCorrect
          ? "Parabéns! Você está no caminho certo. Vamos continuar aprendendo."
          : "Não tem problema! Aprender envolve cometer erros. Vamos revisar o conceito.";
        
        const tutorResponse = {
          id: messages.length + 1,
          text: responseText,
          sender: 'tutor',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages((prevMessages) => [...prevMessages, tutorResponse]);
      }, 500);
    } catch (error) {
      console.error("Error evaluating exercise:", error);
      Alert.alert(
        "Erro",
        "Falha ao avaliar exercício. Por favor, tente novamente."
      );
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestionClick = (question) => {
    sendUserMessageToTutor(question);
  };

  // Helper function to generate a tutor response (mock)
  const generateTutorResponse = (message, topic, mode) => {
    const responses = {
      html_intro: {
        iniciante: [
          "HTML (HyperText Markup Language) é a linguagem padrão para criar páginas web. Ela descreve a estrutura de uma página usando elementos (tags) que o navegador interpreta.",
          "As tags HTML são como blocos de construção para páginas web. Cada tag tem uma função específica, como <h1> para títulos principais, <p> para parágrafos e <img> para imagens.",
          "Um documento HTML básico tem uma estrutura como: <!DOCTYPE html><html><head><title>Título da página</title></head><body><h1>Olá mundo!</h1><p>Este é um parágrafo.</p></body></html>"
        ],
        intermediario: [
          "Para projetos reais, é importante estruturar bem o HTML com tags semânticas. Isso ajuda na acessibilidade e no SEO da página.",
          "Algumas boas práticas de HTML incluem: usar tags semânticas, manter a indentação correta, usar atributos alt em imagens e validar seu código regularmente.",
          "Um problema comum é a compatibilidade entre navegadores. Você pode usar ferramentas como caniuse.com para verificar quais recursos são suportados em diferentes navegadores."
        ],
        avancado: [
          "HTML5 trouxe muitos recursos avançados, como as APIs de Geolocalização, Canvas para desenhos, e Web Storage para armazenamento local. Essas APIs permitem criar aplicações web mais complexas e interativas.",
          "Para SEO avançado, considere usar microdata ou JSON-LD para implementar Schema.org, melhorando como os motores de busca interpretam seu conteúdo.",
          "Comparando com outras tecnologias, HTML é apenas para estrutura. Para estilos, você precisa de CSS, e para interatividade, JavaScript. Frameworks como React e Vue usam componentes que combinam esses três."
        ]
      },
      css_basics: {
        iniciante: [
          "CSS (Cascading Style Sheets) é usado para estilizar elementos HTML. Com CSS, você controla o layout, cores, fontes e aparência geral da página.",
          "Os seletores CSS são padrões que selecionam elementos HTML para aplicar estilos. Você pode selecionar por tag, classe (.classe), ID (#id) ou atributos.",
          "Um exemplo simples de CSS: 'body { background-color: #f0f0f0; } h1 { color: blue; font-size: 24px; } p { margin: 10px; }'."
        ]
      }
    };

    // Fallback for topics/modes not explicitly covered
    if (!responses[topic] || !responses[topic][mode]) {
      return `Estou aqui para ajudar com qualquer dúvida sobre ${learningTopics[topic]?.name || topic}. O que gostaria de saber?`;
    }

    // Get a random response from the appropriate category
    const topicResponses = responses[topic][mode];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  // Helper function to generate an exercise for a topic (mock)
  const generateExerciseForTopic = (topic) => {
    const exercises = {
      html_intro: "Crie uma página HTML simples com um título (h1), um subtítulo (h2), um parágrafo e uma lista não ordenada com 3 itens.",
      html_semantic: "Converta o seguinte HTML para usar tags semânticas: <div class='header'>...</div> <div class='nav'>...</div> <div class='main'>...</div> <div class='footer'>...</div>",
      css_basics: "Crie um CSS que faça todos os parágrafos terem texto verde, fonte de 16px e um padding de 10px.",
      css_layout: "Usando Flexbox, crie um layout com 3 colunas de mesma largura em telas grandes, e que empilhe em telas pequenas.",
      js_intro: "Escreva uma função JavaScript que receba um número e retorne true se for par e false se for ímpar.",
      js_dom: "Escreva código JavaScript que adicione uma classe 'highlight' a todos os elementos <li> quando clicados."
    };

    return exercises[topic] || "Vamos praticar! Crie um pequeno exemplo usando o que aprendemos neste tópico.";
  };

  return (
    <SafeAreaView style={[
      styles.container,
      theme === 'dark' ? styles.darkContainer : styles.lightContainer
    ]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#121212' : '#FFFFFF'}
      />
      
      <ChatHeader
        currentTopic={currentTopic}
        learningTopics={learningTopics}
        currentMode={currentMode}
        handleModeChange={handleModeChange}
        theme={theme}
        toggleTheme={toggleTheme}
        onBackToPath={handleBackToPath}
        isLoading={isLoading}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <MessagesDisplay
          messages={messages}
          isLoading={isLoading}
          handleFeedback={handleFeedback}
          lastMessageIsExercise={lastMessageIsExercise}
          hasEvaluatedLastExercise={hasEvaluatedLastExercise}
          handleExerciseEvaluation={handleExerciseEvaluation}
          theme={theme}
        />
        
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
          suggestedQuestions={suggestedQuestions}
          onSuggestedQuestionClick={handleSuggestedQuestionClick}
          theme={theme}
        />
        
        <ScoreDisplay
          correctExercisesCount={correctExercisesCount}
          totalExercisesAttempted={totalExercisesAttempted}
          theme={theme}
        />
      </KeyboardAvoidingView>
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  
  // Header styles
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  lightHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
  },
  darkHeader: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  topicCategoryBadge: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Theme toggle styles
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
  lightThemeToggle: {
    backgroundColor: '#F0F0F0',
  },
  darkThemeToggle: {
    backgroundColor: '#333333',
  },
  
  // Mode selector styles
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    marginHorizontal: 3,
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Use hardcoded value instead of Colors.light
  },
  darkModeButton: {
    backgroundColor: '#333333', // Use hardcoded value instead of Colors.dark
  },
  activeModeButton: {
    backgroundColor: '#4a90e2', // Use hardcoded value instead of Colors.light
  },
  modeButtonText: {
    fontSize: 12,
    color: '#333333', // Use hardcoded value instead of Colors.light
  },
  darkModeText: {
    color: '#ECEDEE', // Use hardcoded value instead of Colors.dark
  },
  activeModeText: {
    color: '#FFFFFF', // Use hardcoded value instead of Colors.light
    fontWeight: 'bold',
  },
  
  // Messages container styles
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesList: {
    paddingBottom: 10,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMessagesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  
  // Message bubble styles
  messageBubbleContainer: {
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  tutorMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '100%',
  },
  lightUserBubble: {
    backgroundColor: '#E1F0FF',
  },
  darkUserBubble: {
    backgroundColor: '#2D5272',
  },
  lightTutorBubble: {
    backgroundColor: '#4a90e2',
  },
  darkTutorBubble: {
    backgroundColor: '#3a6ca3',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  lightUserText: {
    color: '#11181C',
  },
  darkUserText: {
    color: '#ECEDEE',
  },
  lightTutorText: {
    color: '#FFFFFF',
  },
  darkTutorText: {
    color: '#FFFFFF',
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  lightUserTimestamp: {
    color: '#11181C99',
  },
  darkUserTimestamp: {
    color: '#ECEDEE99',
  },
  lightTutorTimestamp: {
    color: '#FFFFFF99',
  },
  darkTutorTimestamp: {
    color: '#FFFFFF99',
  },
  
  // Feedback styles
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  feedbackButton: {
    padding: 5,
    marginLeft: 10,
  },
  
  // Exercise evaluation styles
  exerciseEvaluationContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  exerciseQuestion: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  exerciseButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#5cdb95',
  },
  darkCorrectButton: {
    backgroundColor: '#3daa74',
  },
  lightCorrectButton: {
    backgroundColor: '#5cdb95',
  },
  incorrectButton: {
    backgroundColor: '#ff6b6b',
  },
  darkIncorrectButton: {
    backgroundColor: '#e06464',
  },
  lightIncorrectButton: {
    backgroundColor: '#ff6b6b',
  },
  exerciseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Input styles
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
  },
  lightInputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EEEEEE',
  },
  darkInputContainer: {
    backgroundColor: '#121212',
    borderTopColor: '#333333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  lightTextInput: {
    backgroundColor: '#F9F9F9',
    borderColor: '#DDDDDD',
    color: '#11181C',
  },
  darkTextInput: {
    backgroundColor: '#333333',
    borderColor: '#555555',
    color: '#ECEDEE',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  lightSendButton: {
    backgroundColor: '#4a90e2',
  },
  darkSendButton: {
    backgroundColor: '#5ca0e2',
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  
  // Suggested questions styles
  suggestedQuestionsContainer: {
    maxHeight: 50,
    marginBottom: 10,
  },
  suggestedQuestionsContent: {
    paddingVertical: 5,
  },
  suggestedQuestion: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  lightSuggestedQuestion: {
    backgroundColor: '#F0F0F0',
    borderColor: '#EEEEEE',
  },
  darkSuggestedQuestion: {
    backgroundColor: '#2A2A2A',
    borderColor: '#333333',
  },
  suggestedQuestionText: {
    fontSize: 14,
    maxWidth: 200,
  },
  lightSuggestedQuestionText: {
    color: '#11181C',
  },
  darkSuggestedQuestionText: {
    color: '#ECEDEE',
  },
  
  // Score container styles
  scoreContainer: {
    padding: 10,
    borderTopWidth: 1,
  },
  lightScoreContainer: {
    backgroundColor: '#F9F9F9',
    borderTopColor: '#EEEEEE',
  },
  darkScoreContainer: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  
  // Text color styles
  lightText: {
    color: '#11181C',
  },
  darkText: {
    color: '#ECEDEE',
  },
  lightSubText: {
    color: '#687076',
  },
  darkSubText: {
    color: '#9BA1A6',
  },
});

