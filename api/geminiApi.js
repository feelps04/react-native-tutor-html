// api/geminiApi.js
// This file contains functions to interact with the Google Gemini API for generating quiz questions

// Note: In a real app, you would store this in .env file and use react-native-dotenv
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
import AsyncStorage from '@react-native-async-storage/async-storage';

// API key storage constant
const GEMINI_API_KEY_STORAGE = '@gemini_api_key';

// Function to generate quiz questions using Google Gemini API
export const generateQuestions = async (topic, difficulty = 'medium', count = 3, category = 'basics') => {
  try {
    // Get API key from AsyncStorage
    const apiKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
    
    console.log(`Generating ${count} questions about ${topic} at ${difficulty} difficulty with category: ${category}`);
    
    // If we have a valid API key, make an actual API call to Google Gemini
    if (apiKey) {
      try {
        console.log('🚀 USING GEMINI API: Generating real AI questions with your API key');
        
        // Build the prompt for the Gemini API
        const prompt = `Generate ${count} multiple-choice quiz questions about ${topic} at ${difficulty} difficulty level. 
The questions should be focused on the "${category}" category, where:
- "basics" means fundamental concepts
- "intermediate" means intermediate level knowledge
- "advanced" means advanced topics
- "practical" means practical applications
- "theory" means theoretical knowledge

Each question should have 4 options and one correct answer. 
Format the response as a valid JSON array with the following structure:
[
  {
    "id": number,
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": number (index of correct option, 0-3),
    "explanation": "string explaining why the answer is correct",
    "category": "string (the category of this question: basics, intermediate, advanced, practical, or theory)"
  }
]`;
        
        // Call the Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract and parse the JSON response
        if (data.candidates && 
            data.candidates[0] && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text) {
          
          const textResponse = data.candidates[0].content.parts[0].text;
          
          // Find JSON in the response (in case there's additional text)
          const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedQuestions = JSON.parse(jsonMatch[0]);
            
            // Validate the response format
            if (Array.isArray(parsedQuestions) && 
                parsedQuestions.length > 0 && 
                parsedQuestions[0].question && 
                parsedQuestions[0].options) {
              return parsedQuestions;
            }
          }
        }
        
        console.log('❌ API RESPONSE ERROR: Failed to parse Gemini response, falling back to mock data');
      } catch (apiError) {
        console.error('❌ GEMINI API ERROR:', apiError);
        console.log('❌ USING MOCK DATA: Falling back to predefined questions due to API error');
      }
    }
    
    // If API call fails or no API key, fall back to mock data
    console.log('📚 USING MOCK DATA: No valid API key found, using predefined questions');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock questions based on the topic
    if (topic.toLowerCase() === 'html') {
      return [
        {
          id: 1,
          question: 'O que significa a sigla HTML?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Hyperlink Text Management Language',
            'Home Tool Markup Language'
          ],
          correctAnswer: 0,
          explanation: 'HTML stands for Hyper Text Markup Language, which is the standard markup language for creating Web pages.',
          category: category
        },
        {
          id: 2,
          question: 'Qual tag é usada para criar um parágrafo em HTML?',
          options: ['<paragraph>', '<p>', '<para>', '<text>'],
          correctAnswer: 1,
          explanation: 'The <p> tag defines a paragraph in HTML documents.',
          category: category
        },
        {
          id: 3,
          question: 'Qual elemento HTML define o título da página que aparece na aba do navegador?',
          options: ['<header>', '<heading>', '<title>', '<h1>'],
          correctAnswer: 2,
          explanation: 'The <title> tag defines the document\'s title that is shown in a browser\'s title bar or a page\'s tab.',
          category: category
        },
      ];
    } else if (topic.toLowerCase() === 'css') {
      return [
        {
          id: 1,
          question: 'Qual propriedade CSS é usada para mudar a cor do texto?',
          options: [
            'text-color',
            'font-color',
            'color',
            'text-style'
          ],
          correctAnswer: 2,
          explanation: 'The color property is used to set the color of the text.',
          category: category
        },
        {
          id: 2,
          question: 'Qual propriedade CSS é usada para definir a fonte do texto?',
          options: ['text-font', 'font-family', 'font-style', 'text-family'],
          correctAnswer: 1,
          explanation: 'The font-family property specifies the font for text.',
          category: category
        },
        {
          id: 3,
          question: 'Como você pode adicionar uma sombra a um elemento em CSS?',
          options: ['shadow-effect', 'text-shadow', 'box-shadow', 'element-shadow'],
          correctAnswer: 2,
          explanation: 'The box-shadow property attaches one or more shadows to an element.',
          category: category
        },
      ];
    } else if (topic.toLowerCase() === 'javascript') {
      return [
        {
          id: 1,
          question: 'Qual função é usada para imprimir algo no console em JavaScript?',
          options: [
            'console.print()',
            'console.log()',
            'print()',
            'log()'
          ],
          correctAnswer: 1,
          explanation: 'console.log() is used to output a message to the web console.',
          category: category
        },
        {
          id: 2,
          question: 'Como você declara uma variável em JavaScript moderno?',
          options: ['var', 'let', 'const', 'both let and const'],
          correctAnswer: 3,
          explanation: 'Both let and const are used to declare variables in modern JavaScript. let is used for variables that can be reassigned, while const is for constants.',
          category: category
        },
        {
          id: 3,
          question: 'O que faz o método Array.map()?',
          options: [
            'Modifica o array original',
            'Cria um novo array com os resultados da função aplicada a cada elemento',
            'Filtra o array',
            'Combina todos os elementos do array'
          ],
          correctAnswer: 1,
          explanation: 'The map() method creates a new array with the results of calling a function for every array element.',
          category: category
        },
      ];
    } else {
      // Default questions if topic doesn't match
      return [
        {
          id: 1,
          question: `O que é ${topic}?`,
          options: [
            `Uma linguagem de programação`,
            `Uma ferramenta de desenvolvimento`,
            `Um framework de desenvolvimento`,
            `Uma plataforma web`
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `Esta é uma pergunta de exemplo sobre ${topic}.`,
          category: category
        },
        {
          id: 2,
          question: `Qual é a principal característica de ${topic}?`,
          options: [
            'Facilidade de uso',
            'Performance',
            'Escalabilidade',
            'Compatibilidade'
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `Esta é outra pergunta de exemplo sobre ${topic}.`,
          category: category
        },
        {
          id: 3,
          question: `Quando ${topic} foi criado?`,
          options: [
            'Anos 1990',
            'Anos 2000',
            'Anos 2010',
            'Anos 2020'
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `Esta é mais uma pergunta de exemplo sobre ${topic}.`,
          category: category
        },
      ];
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Return fallback questions if API fails
    return [
      {
        id: 1,
        question: 'Questão de exemplo 1',
        options: [
          'Opção A',
          'Opção B',
          'Opção C',
          'Opção D'
        ],
        correctAnswer: 0,
        explanation: 'Esta é uma questão de exemplo.',
        category: category
      },
      {
        id: 2,
        question: 'Questão de exemplo 2',
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctAnswer: 1,
        explanation: 'Esta é outra questão de exemplo.',
        category: category
      },
      {
        id: 3,
        question: 'Questão de exemplo 3',
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctAnswer: 2,
        explanation: 'Esta é mais uma questão de exemplo.',
        category: category
      },
    ];
  }
};

// Function to initialize the API key from the provided key
export const initializeApiKey = async (apiKey) => {
  try {
    // Store the provided API key to AsyncStorage
    await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey);
    return true;
  } catch (error) {
    console.error('Error storing API key:', error);
    return false;
  }
};
