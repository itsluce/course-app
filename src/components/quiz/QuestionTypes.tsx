import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Card } from '@/components/ui/card';
import { Question } from '../../data/mockData';
import { useTheme, getThemeColors } from '../../context/ThemeContext';

interface QuestionProps {
  question: Question;
  userAnswer: any;
  onAnswerChange: (answer: any) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export const MultipleChoiceQuestion: React.FC<QuestionProps> = ({ 
  question, 
  userAnswer, 
  onAnswerChange, 
  showResult, 
  isCorrect 
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  return (
    <VStack space="md">
      <Text size="lg" className={`${colors.text} font-medium`}>
        {question.question}
      </Text>
      
      <VStack space="sm">
        {question.options?.map((option, index) => {
          const isSelected = userAnswer === option;
          const isCorrectOption = showResult && option === question.answer;
          const isSelectedWrong = showResult && isSelected && !isCorrect;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => !showResult && onAnswerChange(option)}
              disabled={showResult}
            >
              <Card className={`p-4 border-2 ${
                isCorrectOption 
                  ? `border-green-500 ${isDark ? 'bg-green-900' : 'bg-green-50'}` 
                  : isSelectedWrong 
                    ? `border-red-500 ${isDark ? 'bg-red-900' : 'bg-red-50'}`
                    : isSelected 
                      ? `border-blue-500 ${isDark ? 'bg-blue-900' : 'bg-blue-50'}` 
                      : `${colors.border} ${colors.card}`
              }`}>
                <HStack space="sm" className="items-center">
                  <Box
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isCorrectOption
                        ? 'border-green-500 bg-green-500'
                        : isSelectedWrong
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400'
                    }`}
                  >
                    {(isSelected || isCorrectOption) && (
                      <Box className="w-3 h-3 rounded-full bg-white"></Box>
                    )}
                  </Box>
                  <Text className={`flex-1 ${
                    isCorrectOption ? (isDark ? 'text-white' : 'text-green-700') : 
                    isSelectedWrong ? (isDark ? 'text-red-300' : 'text-red-700') : 
                    isSelected ? (isDark ? 'text-white' : 'text-blue-800') : colors.text
                  }`}>
                    {option}
                  </Text>
                </HStack>
              </Card>
            </TouchableOpacity>
          );
        })}
      </VStack>
    </VStack>
  );
};

export const TrueFalseQuestion: React.FC<QuestionProps> = ({ 
  question, 
  userAnswer, 
  onAnswerChange, 
  showResult, 
  isCorrect 
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const options = ['true', 'false'];
  const [animatingOption, setAnimatingOption] = useState<string | null>(null);

  const handleOptionPress = (option: string) => {
    if (showResult) return;
    
    setAnimatingOption(option);
    onAnswerChange(option);
    
    setTimeout(() => {
      setAnimatingOption(null);
    }, 600);
  };

  return (
    <VStack space="md">
      <Text size="lg" className={`${colors.text} font-medium`}>
        {question.question}
      </Text>
      
      <HStack space="md" className="justify-center">
        {options.map((option) => {
          const isSelected = userAnswer === option;
          const isCorrectOption = showResult && option === question.answer;
          const isSelectedWrong = showResult && isSelected && !isCorrect;
          const isAnimating = animatingOption === option && !showResult;
          
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleOptionPress(option)}
              disabled={showResult}
              className="flex-1"
            >
              <Box className="relative">
                <Card className={`p-6 border-2 items-center transition-all duration-200 ${
                  isCorrectOption 
                    ? `border-green-500 ${isDark ? 'bg-green-900' : 'bg-green-50'}` 
                    : isSelectedWrong 
                      ? `border-red-500 ${isDark ? 'bg-red-900' : 'bg-red-50'}`
                      : isSelected 
                        ? `border-blue-500 ${isDark ? 'bg-blue-900' : 'bg-blue-50'}` 
                        : `${colors.border} ${colors.card}`
                }`}>
                  <Text className={`text-lg font-semibold capitalize ${
                    isCorrectOption ? (isDark ? 'text-white' : 'text-green-700') : 
                    isSelectedWrong ? (isDark ? 'text-red-300' : 'text-red-700') : 
                    isSelected ? (isDark ? 'text-white' : 'text-blue-800') : colors.text
                  }`}>
                    {option}
                  </Text>
                </Card>
                
                {isAnimating && (
                  <Box className="absolute inset-0 pointer-events-none rounded-lg"/>
                )}
              </Box>
            </TouchableOpacity>
          );
        })}
      </HStack>
    </VStack>
  );
};

export const FillInBlankQuestion: React.FC<QuestionProps> = ({ 
  question, 
  userAnswer, 
  onAnswerChange, 
  showResult, 
  isCorrect 
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  return (
    <VStack space="md">
      <Text size="lg" className={`${colors.text} font-medium`}>
        {question.question}
      </Text>
      
      <Input
        variant="outline"
        size="lg"
        className={`${
          showResult 
            ? isCorrect 
              ? 'border-green-500' 
              : 'border-red-500' 
            : colors.border
        } ${colors.background}`}
        isReadOnly={showResult}
      >
        <InputField
          placeholder="Type your answer here..."
          value={userAnswer || ''}
          onChangeText={onAnswerChange}
          className={colors.text}
        />
      </Input>
      
      {showResult && (
        <Card className={`p-3 ${isCorrect ? 
          (isDark ? 'bg-green-900' : 'bg-green-50') : 
          (isDark ? 'bg-red-900' : 'bg-red-50')}`}>
          <Text className={`text-sm ${isCorrect ? 
            (isDark ? 'text-white' : 'text-green-700') : 
            (isDark ? 'text-red-300' : 'text-red-700')}`}>
            Correct answer: {String(question.answer)}
          </Text>
        </Card>
      )}
    </VStack>
  );
};

export const MatchingQuestion: React.FC<QuestionProps> = ({ 
  question, 
  userAnswer, 
  onAnswerChange, 
  showResult, 
  isCorrect 
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  
  const correctAnswers = (question.answer as { [key: string]: string }) || {};
  const leftItems = Object.keys(correctAnswers);
  const rightItems = Object.values(correctAnswers);
  
  const currentMatches = (typeof userAnswer === 'object' && userAnswer !== null) ? userAnswer as { [key: string]: string } : {};

  const handleLeftItemPress = (item: string) => {
    if (showResult) return;
    
    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
    }
  };

  const handleRightItemPress = (item: string) => {
    if (showResult) return;
    
    if (!selectedLeft) return;
    
    const newMatches = { ...currentMatches };
    
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === item) {
        delete newMatches[key];
      }
    });
    
    newMatches[selectedLeft] = item;
    onAnswerChange(newMatches);
    setSelectedLeft(null);
  };

  const removeMatch = (leftItem: string) => {
    if (showResult) return;
    
    const newMatches = { ...currentMatches };
    delete newMatches[leftItem];
    onAnswerChange(newMatches);
  };

  const getLeftItemStyle = (item: string) => {
    if (showResult) {
      const isCorrectMatch = correctAnswers[item] === currentMatches[item];
      const hasMatch = currentMatches[item];
      
      if (isCorrectMatch) return `border-green-500 ${isDark ? 'bg-green-900' : 'bg-green-50'}`;
      if (hasMatch) return `border-red-500 ${isDark ? 'bg-red-900' : 'bg-red-50'}`;
      return `${colors.border} ${colors.card}`;
    }
    
    if (selectedLeft === item) return `border-blue-500 ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`;
    if (currentMatches[item]) return `${colors.borderSecondary} ${colors.cardSecondary}`;
    return `${colors.border} ${colors.card}`;
  };

  const getRightItemStyle = (item: string) => {
    if (showResult) {
      const matchedKey = Object.keys(currentMatches).find(key => currentMatches[key] === item);
      const isCorrectMatch = matchedKey && correctAnswers[matchedKey] === item;
      const hasMatch = Object.values(currentMatches).includes(item);
      
      if (isCorrectMatch) return `border-green-500 ${isDark ? 'bg-green-900' : 'bg-green-50'}`;
      if (hasMatch) return `border-red-500 ${isDark ? 'bg-red-900' : 'bg-red-50'}`;
      return `${colors.border} ${colors.card}`;
    }
    
    const isMatched = Object.values(currentMatches).includes(item);
    if (isMatched) return `${colors.borderSecondary} ${colors.cardSecondary}`;
    if (selectedLeft) return `border-blue-200 ${colors.card}`;
    return `${colors.border} ${colors.card}`;
  };

  const getTextColor = (item: string, isLeft: boolean) => {
    if (showResult) {
      if (isLeft) {
        const isCorrectMatch = correctAnswers[item] === currentMatches[item];
        const hasMatch = currentMatches[item];
        if (isCorrectMatch) return isDark ? 'text-white' : 'text-green-700';
        if (hasMatch) return isDark ? 'text-red-300' : 'text-red-700';
      } else {
        const matchedKey = Object.keys(currentMatches).find(key => currentMatches[key] === item);
        const isCorrectMatch = matchedKey && correctAnswers[matchedKey] === item;
        const hasMatch = Object.values(currentMatches).includes(item);
        if (isCorrectMatch) return isDark ? 'text-white' : 'text-green-700';
        if (hasMatch) return isDark ? 'text-red-300' : 'text-red-700';
      }
    } else if (isLeft && selectedLeft === item) {
      return isDark ? 'text-white' : 'text-blue-800';
    }
    return colors.text;
  };

  return (
    <VStack space="lg">
      <VStack space="md">
        <Text size="lg" className={`${colors.text} font-bold`}>
          {question.question}
        </Text>

        <Card className={`${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} p-3`}>
          <Text size="sm" className={`${isDark ? colors.text : 'text-blue-700'} text-center font-medium`}>
            💡 Select an item from the left, then choose its match from the right
          </Text>
        </Card>
      </VStack>

      <VStack space="md">
        <HStack space="md" className="justify-between">
          <Card className={`${colors.cardSecondary} p-2 flex-1`}>
            <Text size="md" className={`font-bold ${colors.text} text-center`}>
              📝 Items to Match
            </Text>
          </Card>
          <Box className="w-8 items-center justify-center">
            <Text className={`text-2xl ${colors.text}`}>⇄</Text>
          </Box>
          <Card className={`${colors.cardSecondary} p-2 flex-1`}>
            <Text size="md" className={`font-bold ${colors.text} text-center`}>
              🎯 Matching Options
            </Text>
          </Card>
        </HStack>

        <VStack space="sm">
          {leftItems.map((leftItem, index) => {
            const rightItem = rightItems[index];
            return (
              <HStack key={leftItem} space="md" className="items-start">
                {/* Left Item */}
                <TouchableOpacity
                  className="flex-1"
                  onPress={() => handleLeftItemPress(leftItem)}
                  disabled={showResult}
                  style={{ opacity: showResult ? 0.8 : 1 }}
                >
                  <Card className={`p-4 border-2 rounded-lg shadow-sm ${getLeftItemStyle(leftItem)}`}>
                    <VStack space="sm">
                      <HStack space="sm" className="items-center justify-between">
                        <Text className={`flex-1 font-medium ${getTextColor(leftItem, true)}`}>
                          {leftItem}
                        </Text>
                        {selectedLeft === leftItem && !showResult && (
                          <Text className="text-blue-500 text-lg">👆</Text>
                        )}
                        {currentMatches[leftItem] && !showResult && (
                          <TouchableOpacity 
                            onPress={() => removeMatch(leftItem)}
                            className="rounded-full"
                          >
                            <Text className="text-red-600 font-bold text-xs">✕</Text>
                          </TouchableOpacity>
                        )}
                      </HStack>
                      {currentMatches[leftItem] && (
                        <Card className={`${colors.cardSecondary} p-2 rounded`}>
                          <Text className={`text-xs ${colors.textSecondary} text-center font-medium`}>
                            🔗 Matched with: {currentMatches[leftItem]}
                          </Text>
                        </Card>
                      )}
                    </VStack>
                  </Card>
                </TouchableOpacity>

                {/* Connector */}
                <Box className="w-8 items-center justify-center mt-4">
                  {currentMatches[leftItem] && currentMatches[leftItem] === rightItem ? (
                    <Text className="text-green-500 text-xl">→</Text>
                  ) : (
                    <Text className={`${colors.textMuted} text-xl`}>—</Text>
                  )}
                </Box>

                {/* Right Item */}
                <TouchableOpacity
                  className="flex-1"
                  onPress={() => handleRightItemPress(rightItem)}
                  disabled={showResult || !selectedLeft}
                  style={{ 
                    opacity: showResult ? 0.8 : (!selectedLeft ? 0.6 : 1)
                  }}
                >
                  <Card className={`p-4 border-2 rounded-lg shadow-sm ${getRightItemStyle(rightItem)}`}>
                    <HStack space="sm" className="items-center justify-center">
                      {Object.values(currentMatches).includes(rightItem) && (
                        <Text className="text-green-500 text-sm">✓</Text>
                      )}
                      <Text className={`font-medium ${getTextColor(rightItem, false)}`}>
                        {rightItem}
                      </Text>
                    </HStack>
                  </Card>
                </TouchableOpacity>
              </HStack>
            );
          })}
        </VStack>
      </VStack>

      {selectedLeft && !showResult && (
        <Card className={`${isDark ? 'bg-blue-900' : 'bg-blue-50 border-blue-300 border-2'}  p-3 shadow-sm`}>
          <HStack space="sm" className="items-center justify-center">
            <Text className="text-2xl">🎯</Text>
            <Text className={`${isDark ? colors.text : 'text-blue-800'} text-center font-semibold`}>
              Selected: "{selectedLeft}" - Choose its match!
            </Text>
          </HStack>
        </Card>
      )}

      {showResult && (
        <Card className={`${colors.cardSecondary} p-3`}>
          <Text size="sm" className={`${colors.textSecondary} text-center font-medium`}>
            {isCorrect ? '🎉 Perfect matching!' : '🤔 Review the correct matches above'}
          </Text>
        </Card>
      )}
    </VStack>
  );
};

export const OrderingQuestion: React.FC<QuestionProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  showResult,
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const correctOrder = question.answer as string[];
  const items = question.options || correctOrder;
  
  useEffect(() => {
    if (!userAnswer) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      onAnswerChange(shuffled);
    }
  }, [userAnswer, items, onAnswerChange]);
  
  const currentOrder = userAnswer || items;

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (showResult) return;
    
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    onAnswerChange(newOrder);
  };

  return (
    <VStack space="md">
      <Text size="lg" className={`${colors.text} font-medium`}>
        {question.question}
      </Text>

      <Text size="sm" className={colors.textSecondary}>
        Drag to reorder (or use arrow buttons):
      </Text>

      <VStack space="sm">
        {currentOrder.map((item: string, index: number) => {
          const correctIndex = correctOrder.indexOf(item);
          const isInCorrectPosition = showResult && correctIndex === index;
          const isInWrongPosition = showResult && correctIndex !== index;

          return (
            <Card
              key={`${item}-${index}`}
              className={`p-3 border-2 ${
                isInCorrectPosition 
                  ? `border-green-500 ${isDark ? 'bg-green-900' : 'bg-green-50'}` 
                  : isInWrongPosition 
                    ? `border-red-500 ${isDark ? 'bg-red-900' : 'bg-red-50'}`
                    : `${colors.border} ${colors.card}`
              }`}
            >
              <HStack space="sm" className="items-center">
                <Text className={`w-8 text-center font-bold ${colors.textMuted}`}>
                  {index + 1}.
                </Text>
                <Text className={`flex-1 ${
                  isInCorrectPosition ? (isDark ? 'text-white' : 'text-green-700') :
                  isInWrongPosition ? (isDark ? 'text-red-300' : 'text-red-700') : colors.text
                }`}>
                  {item}
                </Text>
                {!showResult && (
                  <HStack space="xs">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${index === 0 ? 'opacity-50' : ''} ${colors.border}`}
                      onPress={() => moveItem(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                    >
                      <ButtonText className={`${index === 0 ? colors.textMuted : colors.text} text-sm text-center`} numberOfLines={1}>↑</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${index === currentOrder.length - 1 ? 'opacity-50' : ''} ${colors.border}`}
                      onPress={() => moveItem(index, Math.min(currentOrder.length - 1, index + 1))}
                      disabled={index === currentOrder.length - 1}
                    >
                      <ButtonText className={`${index === currentOrder.length - 1 ? colors.textMuted : colors.text} text-sm text-center`} numberOfLines={1}>↓</ButtonText>
                    </Button>
                  </HStack>
                )}
              </HStack>
            </Card>
          );
        })}
      </VStack>
    </VStack>
  );
};