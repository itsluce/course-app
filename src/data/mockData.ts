export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'true-false' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  answer: string | string[] | { [key: string]: string };
  explanation?: string;
}

export interface Quiz {
  id: string;
  type: 'quiz';
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
}

export interface VideoLesson {
  id: string;
  type: 'video';
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  thumbnail: string;
}

export interface ContentSection {
  id: string;
  type: 'content';
  title: string;
  description: string;
  content: {
    text: string;
    images?: string[];
  }[];
}

export type CourseStep = VideoLesson | Quiz | ContentSection;

export const mockCourseData: CourseStep[] = [
  {
    id: 'step-1',
    type: 'video',
    title: 'Introduction to React Native',
    description: 'Learn the fundamentals of React Native development',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 300,
    thumbnail: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'step-2',
    type: 'quiz',
    title: 'React Native Basics Quiz',
    description: 'Test your understanding of React Native fundamentals',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is React Native primarily used for?',
        options: ['Web development', 'Mobile app development', 'Desktop applications', 'Game development'],
        answer: 'Mobile app development',
        explanation: 'React Native is a framework for building mobile applications using React.'
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'React Native uses the same components as React for web.',
        answer: 'false',
        explanation: 'React Native uses platform-specific components like View, Text, etc.'
      },
      {
        id: 'q3',
        type: 'fill-in-blank',
        question: 'React Native apps are written in ________ and compiled to native code.',
        answer: 'JavaScript',
        explanation: 'React Native uses JavaScript (or TypeScript) which gets compiled to native code.'
      },
      {
        id: 'q4',
        type: 'matching',
        question: 'Match the React Native components with their web equivalents:',
        answer: {
          'View': 'div',
          'Text': 'span',
          'ScrollView': 'div with overflow scroll',
          'Image': 'img'
        },
        explanation: 'React Native components map to native UI elements on each platform.'
      },
      {
        id: 'q5',
        type: 'ordering',
        question: 'Order these steps in React Native development process:',
        options: ['Write JavaScript code', 'Install dependencies', 'Create project', 'Run app'],
        answer: ['Create project', 'Install dependencies', 'Write JavaScript code', 'Run app'],
        explanation: 'This is the typical workflow for React Native development.'
      }
    ]
  },
  {
    id: 'step-3',
    type: 'content',
    title: 'React Native Components Deep Dive',
    description: 'Explore the core components and their usage patterns',
    content: [
      {
        text: 'React Native provides a rich set of built-in components that map to native UI elements. Understanding these components is crucial for building effective mobile applications.',
        images: ['https://picsum.photos/400/200?random=2']
      },
      {
        text: 'The View component is the most fundamental building block. It supports layout with flexbox, style, touch handling, and accessibility controls.',
      },
      {
        text: 'Text components handle all text rendering. Unlike web development, all text must be wrapped in Text components in React Native.',
        images: ['https://picsum.photos/400/150?random=3']
      },
      {
        text: 'ScrollView provides a scrolling container that can host multiple components and views. It\'s essential for content that exceeds screen height.',
      },
      {
        text: 'For better performance with large lists, use FlatList or SectionList components instead of ScrollView with many items.',
        images: ['https://picsum.photos/400/250?random=4']
      }
    ]
  },
  {
    id: 'step-4',
    type: 'quiz',
    title: 'Advanced React Native Quiz',
    description: 'Test your advanced knowledge of React Native concepts',
    passingScore: 80,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which component should you use for large lists in React Native?',
        options: ['ScrollView', 'FlatList', 'View', 'ListView'],
        answer: 'FlatList',
        explanation: 'FlatList provides better performance for large datasets by virtualizing items.'
      },
      {
        id: 'q2',
        type: 'fill-in-blank',
        question: 'The ________ component is used for handling user input in React Native.',
        answer: 'TextInput',
        explanation: 'TextInput is the primary component for capturing user text input.'
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'React Native uses CSS for styling components.',
        answer: 'false',
        explanation: 'React Native uses a JavaScript object-based styling system similar to CSS.'
      },
      {
        id: 'q4',
        type: 'ordering',
        question: 'Order these React Native lifecycle methods:',
        options: ['componentDidMount', 'componentWillUnmount', 'constructor', 'render'],
        answer: ['constructor', 'componentDidMount', 'render', 'componentWillUnmount'],
        explanation: 'This represents the typical lifecycle flow of a React Native component.'
      },
      {
        id: 'q5',
        type: 'matching',
        question: 'Match the React Native styling properties:',
        answer: {
          'flex': 'Layout property for flexible sizing',
          'backgroundColor': 'Sets the background color',
          'marginTop': 'Adds space above the element',
          'borderRadius': 'Creates rounded corners'
        },
        explanation: 'These are common styling properties used in React Native applications.'
      }
    ]
  }
];

export const getMockDelay = (min: number = 800, max: number = 2000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const mockFetch = <T>(data: T, delay?: number): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay || getMockDelay());
  });
};