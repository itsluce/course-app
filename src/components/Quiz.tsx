import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { ScaleInView } from './animations/ScaleInView';
import { Quiz as QuizType, Question } from '../data/mockData';
import { useCourse } from '../context/CourseContext';
import { useTheme, getThemeColors } from '../context/ThemeContext';
import {
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  MatchingQuestion,
  OrderingQuestion,
} from './quiz/QuestionTypes';

interface QuizProps {
  data: QuizType;
  stepIndex: number;
}

export const Quiz: React.FC<QuizProps> = ({ data, stepIndex }) => {
  const { markStepComplete, setCurrentStep, setQuizScore, state } = useCourse();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = data.questions[currentQuestionIndex];
  const totalQuestions = data.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!quizCompleted && !showResults) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted, showResults]);

  const handleAnswerChange = (answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    const needsSubmission = currentQuestion.type === 'fill-in-blank' ||
                           currentQuestion.type === 'matching' || 
                           currentQuestion.type === 'ordering';
    
    if (answer && hasValidAnswer(currentQuestion, answer) && !needsSubmission) {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  };

  const checkAnswer = (question: Question, userAnswer: any): boolean => {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
      case 'fill-in-blank':
        return String(userAnswer).toLowerCase().trim() === String(question.answer).toLowerCase().trim();
      
      case 'matching':
        const correctMatches = question.answer as { [key: string]: string };
        const userMatches = userAnswer as { [key: string]: string };
        return Object.keys(correctMatches).every(key => 
          userMatches[key] === correctMatches[key]
        );
      
      case 'ordering':
        const correctOrder = question.answer as string[];
        const userOrder = userAnswer as string[];
        return JSON.stringify(correctOrder) === JSON.stringify(userOrder);
      
      default:
        return false;
    }
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    data.questions.forEach(question => {
      if (checkAnswer(question, userAnswers[question.id])) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const hasValidAnswer = (question: Question, answer: any): boolean => {
    if (!answer) return false;
    
    switch (question.type) {
      case 'matching':
        return typeof answer === 'object' && Object.keys(answer).length > 0;
      case 'ordering':
        return Array.isArray(answer) && answer.length > 0;
      default:
        return true;
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const finalScore = calculateScore();
      setScore(finalScore);
      setQuizScore(data.id, finalScore);
      setShowResults(true);
      setQuizCompleted(true);
      
      if (finalScore >= data.passingScore) {
        markStepComplete(stepIndex);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeSpent(0);
    setAnsweredQuestions(new Set());
    setSubmittedQuestions(new Set());
  };

  const handleNextStep = () => {
    if (stepIndex + 1 < state.totalSteps) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleSubmitAnswer = () => {
    const needsSubmission = currentQuestion.type === 'fill-in-blank' || 
                           currentQuestion.type === 'matching' || 
                           currentQuestion.type === 'ordering';
    
    if (needsSubmission && userAnswers[currentQuestion.id] && hasValidAnswer(currentQuestion, userAnswers[currentQuestion.id])) {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      setSubmittedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  };

  const renderQuestion = () => {
    const userAnswer = userAnswers[currentQuestion.id];
    const questionAnswered = answeredQuestions.has(currentQuestion.id);
    const questionSubmitted = submittedQuestions.has(currentQuestion.id);
    const isCorrect = (showResults || questionAnswered) ? checkAnswer(currentQuestion, userAnswer) : undefined;

    const needsSubmission = currentQuestion.type === 'fill-in-blank' || 
                           currentQuestion.type === 'matching' || 
                           currentQuestion.type === 'ordering';
    
    const questionProps = {
      question: currentQuestion,
      userAnswer,
      onAnswerChange: handleAnswerChange,
      showResult: showResults || (questionAnswered && (!needsSubmission || questionSubmitted)),
      isCorrect,
    };

    switch (currentQuestion.type) {
      case 'multiple-choice':
    return <MultipleChoiceQuestion {...questionProps} />;
      case 'true-false':
        return <TrueFalseQuestion {...questionProps} />;
      case 'fill-in-blank':
        return <FillInBlankQuestion {...questionProps} />;
      case 'matching':
        return <MatchingQuestion {...questionProps} />;
      case 'ordering':
        return <OrderingQuestion {...questionProps} />;
      default:
        return <Text className="text-red-500">Unknown question type: {currentQuestion.type}</Text>;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const passed = score >= data.passingScore;
    
    return (
      <ScrollView className={`flex-1 ${colors.background}`}>
          <VStack space="lg" className="p-6">
          <Card className={`p-6 ${passed ? 
            (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') : 
            (isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200')}`}>
            <VStack space="md" className="items-center">
              <Text className={`text-6xl ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {passed ? '🎉' : '❌'}
              </Text>
              <Heading size="xl" className={`text-center ${passed ? 
                (isDark ? 'text-white' : 'text-green-700') : 
                (isDark ? 'text-white' : 'text-red-700')}`}>
                {passed ? 'Congratulations!' : 'Try Again'}
              </Heading>
              <Text size="lg" className={`text-center ${passed ? 
                (isDark ? 'text-white' : 'text-green-600') : 
                (isDark ? 'text-white' : 'text-red-600')}`}>
                You scored {score}% ({score >= data.passingScore ? 'Passed' : 'Failed'})
              </Text>
              <Text size="sm" className={`${colors.textSecondary} text-center`}>
                Passing score: {data.passingScore}% • Time: {formatTime(timeSpent)}
              </Text>
            </VStack>
          </Card>

          <Card className={colors.cardSecondary}>
            <VStack space="md" className="p-4">
              <Heading size="md" className={colors.text}>
                Quiz Summary
              </Heading>
              <HStack space="md" className="justify-between">
                <Text className={colors.textSecondary}>Questions:</Text>
                <Text className={`font-semibold ${colors.text}`}>{totalQuestions}</Text>
              </HStack>
              <HStack space="md" className="justify-between">
                <Text className={colors.textSecondary}>Correct:</Text>
                <Text className="font-semibold text-green-600">
                  {Math.round((score / 100) * totalQuestions)}
                </Text>
              </HStack>
              <HStack space="md" className="justify-between">
                <Text className={colors.textSecondary}>Incorrect:</Text>
                <Text className="font-semibold text-red-600">
                  {totalQuestions - Math.round((score / 100) * totalQuestions)}
                </Text>
              </HStack>
            </VStack>
          </Card>

          <VStack space="md">
            <Button
              size="lg"
              variant="outline"
              className={`w-full ${colors.border}`}
              onPress={handleRetakeQuiz}
            >
              <ButtonText className={`${colors.text} text-sm text-center`} numberOfLines={1}>Retake Quiz</ButtonText>
            </Button>

            {passed && (
              <Button
                size="lg"
                className={`w-full ${stepIndex + 1 >= state.totalSteps ? `${colors.backgroundTertiary} opacity-60` : 'bg-blue-600'}`}
                onPress={handleNextStep}
                disabled={stepIndex + 1 >= state.totalSteps}
              >
                <ButtonText className={`${stepIndex + 1 >= state.totalSteps ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={2}>
                  {stepIndex + 1 >= state.totalSteps ? 'Course Complete!' : 'Next Step'}
                </ButtonText>
              </Button>
            )}
          </VStack>
          </VStack>
        </ScrollView>
    );
  }

  return (
    <VStack space="lg" className={`p-6 flex-1 ${colors.background}`}>
        <VStack space="sm">
          <HStack space="md" className="justify-between items-center">
            <Heading size="lg" className={`${colors.text} flex-1`}>
              {data.title}
            </Heading>
            <Text size="sm" className={colors.textMuted}>
              {formatTime(timeSpent)}
            </Text>
          </HStack>
          
          <Text size="md" className={colors.textSecondary}>
            {data.description}
          </Text>

          <VStack space="sm">
            <HStack space="md" className="justify-between">
              <Text size="sm" className={colors.textMuted}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
              <Text size="sm" className={colors.textMuted}>
                Step {stepIndex + 1} of {state.totalSteps}
              </Text>
            </HStack>
            
            <Animated.View className="w-full">
              <Progress value={progress} className="w-full">
                <ProgressFilledTrack style={{ width: `${progress}%` }} />
              </Progress>
            </Animated.View>
          </VStack>
        </VStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ScaleInView duration={400} delay={100}>
            <Card className={`${colors.card} p-6`}>
              {renderQuestion()}
              
              {(currentQuestion.type === 'fill-in-blank' || 
                currentQuestion.type === 'matching' || 
                currentQuestion.type === 'ordering') && 
               userAnswers[currentQuestion.id] && 
               hasValidAnswer(currentQuestion, userAnswers[currentQuestion.id]) &&
               !submittedQuestions.has(currentQuestion.id) && 
               !showResults && (
                <Button
                  size="md"
                  className="bg-blue-600 mt-4"
                  onPress={handleSubmitAnswer}
                >
                  <ButtonText className="text-white text-sm text-center" numberOfLines={2}>Submit Answer</ButtonText>
                </Button>
              )}
            </Card>
          </ScaleInView>

          {(showResults || answeredQuestions.has(currentQuestion.id)) && currentQuestion.explanation && (
            <ScaleInView duration={400} delay={200}>
              <Card className={`${isDark ? 'bg-blue-900 border-white' : 'bg-blue-50 border-blue-200'} mt-4`}>
                <VStack space="sm" className="p-4">
                  <Text className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>💡 Explanation:</Text>
                  <Text className={`${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{currentQuestion.explanation}</Text>
                </VStack>
              </Card>
            </ScaleInView>
          )}
        </ScrollView>

        <HStack space="md" className="justify-between">
          <Button
            size="lg"
            variant="outline"
            className={`flex-1 ${currentQuestionIndex === 0 ? 'opacity-50' : ''} ${colors.border}`}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ButtonText className={`${currentQuestionIndex === 0 ? colors.textMuted : colors.text} text-sm text-center`} numberOfLines={1}>Previous</ButtonText>
          </Button>

          <Button
            size="lg"
            className={`flex-1 ${!hasValidAnswer(currentQuestion, userAnswers[currentQuestion.id]) 
              ? `${colors.backgroundTertiary} opacity-60` 
              : 'bg-blue-600'}`}
            onPress={handleNextQuestion}
            disabled={!hasValidAnswer(currentQuestion, userAnswers[currentQuestion.id])}
          >
            <ButtonText className={`${!hasValidAnswer(currentQuestion, userAnswers[currentQuestion.id]) ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={2}>
              {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next'}
            </ButtonText>
          </Button>
        </HStack>
      </VStack>
  );
};