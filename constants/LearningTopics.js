// constants/LearningTopics.js
export const LEARNING_TOPICS = [
  {
    id: 'html',
    name: 'HTML',
    description: 'A linguagem de marcação padrão para criar páginas web.',
    icon: 'logo-html5',
    color: '#E44D26',
    difficulty: 'beginner'
  },
  {
    id: 'css',
    name: 'CSS',
    description: 'Linguagem de estilo usada para descrever a apresentação de um documento HTML.',
    icon: 'logo-css3',
    color: '#264DE4',
    difficulty: 'beginner'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'Linguagem de programação que permite implementar funcionalidades complexas em páginas web.',
    icon: 'logo-javascript',
    color: '#F7DF1E',
    difficulty: 'intermediate'
  },
  {
    id: 'react',
    name: 'React',
    description: 'Biblioteca JavaScript para construir interfaces de usuário.',
    icon: 'logo-react',
    color: '#61DAFB',
    difficulty: 'intermediate'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Ambiente de execução JavaScript do lado do servidor.',
    icon: 'server-outline',
    color: '#339933',
    difficulty: 'intermediate'
  }
];

export const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'beginner':
      return 'Iniciante';
    case 'intermediate':
      return 'Intermediário';
    case 'advanced':
      return 'Avançado';
    default:
      return 'Todos os níveis';
  }
};

export const getTopicById = (id) => {
  return LEARNING_TOPICS.find(topic => topic.id === id) || LEARNING_TOPICS[0];
};

