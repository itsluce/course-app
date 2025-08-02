import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { useTheme, getThemeColors } from '../context/ThemeContext';

interface LoadingScreenProps {
  stepIndex?: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  stepIndex, 
  message = 'Loading content...' 
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  const stepMessages = [
    'Loading video lesson...',
    'Preparing quiz questions...',
    'Loading course content...',
    'Setting up final assessment...'
  ];

  const displayMessage = stepIndex !== undefined ? stepMessages[stepIndex] : message;

  return (
    <Box className={`flex-1 ${colors.background}`}>
      <Box className="flex-1 flex items-center justify-center p-6">
        <Card className={`${colors.card} shadow-lg p-8 w-full max-w-sm`}>
          <VStack space="lg" className="items-center">
            <Box className="relative">
              <Spinner size="large" className="text-blue-500" />
              <Box className="absolute inset-0 flex items-center justify-center">
                <Text className="text-blue-500 text-2xl animate-pulse">
                  {stepIndex !== undefined ? ['📹', '📝', '📚', '🎯'][stepIndex] : '📚'}
                </Text>
              </Box>
            </Box>

            <VStack space="sm" className="items-center">
              <Text size="lg" className={`font-semibold ${colors.text} text-center`}>
                {displayMessage}
              </Text>
              <Text size="sm" className={`${colors.textSecondary} text-center`}>
                Please wait while we prepare your learning experience
              </Text>
            </VStack>

            <Box className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
              <Box className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: '70%' }} />
            </Box>
          </VStack>
        </Card>
      </Box>
    </Box>
  );
};