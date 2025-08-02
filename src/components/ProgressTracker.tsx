import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { useCourse } from '../context/CourseContext';
import { useTheme, getThemeColors } from '../context/ThemeContext';

interface ProgressTrackerProps {
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ className = '' }) => {
  const { state, setCurrentStep, canNavigateToStep, getOverallProgress } = useCourse();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { currentStep, totalSteps, stepProgress } = state;

  const stepTitles = [
    'Video Lesson',
    'Basic Quiz',
    'Content Reading',
    'Final Quiz'
  ];

  const stepIcons = ['📹', '📝', '📚', '🎯'];

  const getStepStatus = (stepIndex: number) => {
    if (stepProgress[stepIndex]) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (canNavigateToStep(stepIndex)) return 'available';
    return 'locked';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return `${colors.success} border-green-500`;
      case 'current': return 'bg-blue-500 border-blue-500';
      case 'available': return `${colors.background} ${colors.borderSecondary}`;
      case 'locked': return `${colors.backgroundTertiary} ${colors.border}`;
      default: return `${colors.backgroundTertiary} ${colors.border}`;
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-white';
      case 'current': return 'text-white';
      case 'available': return colors.text;
      case 'locked': return colors.textMuted;
      default: return colors.textMuted;
    }
  };

  const handleStepPress = (stepIndex: number) => {
    if (canNavigateToStep(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const overallProgress = getOverallProgress();

  return (
    <VStack space="lg" className={`h-full ${className}`}>
        <Card className={`${colors.cardSecondary} p-4`}>
          <VStack space="sm">
            <HStack space="md" className="justify-between items-center">
              <Text size="md" className={`font-bold ${colors.text}`}>
                Overall Progress
              </Text>
              <Text size="sm" className="text-blue-600 font-bold">
                {overallProgress}% Complete
              </Text>
            </HStack>
            <Progress value={overallProgress} className="w-full">
              <ProgressFilledTrack style={{ width: `${overallProgress}%` }} />
            </Progress>
          </VStack>
        </Card>

        <VStack space="md">
          {Array.from({ length: totalSteps }, (_, index) => {
            const status = getStepStatus(index);
            const isClickable = status === 'available' || status === 'current' || status === 'completed';

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleStepPress(index)}
                disabled={!isClickable}
                activeOpacity={isClickable ? 0.7 : 1}
              >
                <Card className={`border-2 p-1 ${
                  status === 'current' ? `border-blue-500 ${isDark ? 'bg-blue-900' : 'bg-blue-50'}` : 
                  status === 'completed' ? `${colors.successBorder} ${colors.successBg}` :
                  `${colors.border} ${colors.card}`
                }`}>
                  <HStack space="md" className="items-center p-5">
                    <Box
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getStepColor(status)}`}
                    >
                      {status === 'completed' ? (
                        <Text className="text-white text-lg">✓</Text>
                      ) : status === 'locked' ? (
                        <Text className={`${colors.textMuted} text-lg`}>🔒</Text>
                      ) : (
                        <Text className={`text-xl ${getTextColor(status)}`}>
                          {stepIcons[index]}
                        </Text>
                      )}
                    </Box>

                    <VStack className="flex-1" space="sm">
                      <HStack space="md" className="justify-between items-center">
                        <Text
                          size="md"
                          className={`font-semibold ${
                            status === 'completed' ? colors.successText :
                            status === 'current' ? isDark ? 'text-white' : 'text-blue-700' :
                            status === 'available' ? colors.text :
                            colors.textMuted
                          }`}
                        >
                          {stepTitles[index]}
                        </Text>

                        <Text size="xs" className={colors.textMuted}>
                          Step {index + 1}
                        </Text>
                      </HStack>

                      <Text
                        size="sm"
                        className={`${
                          status === 'completed' ? colors.successText  :
                          status === 'current' ? isDark ? 'text-white' : 'text-blue-700 opacity-80' :
                          status === 'available' ? colors.textSecondary :
                          colors.textMuted
                        }`}
                      >
                        {status === 'completed' ? 'Completed' :
                         status === 'current' ? 'In Progress' :
                         status === 'available' ? 'Available' :
                         'Locked'}
                      </Text>
                    </VStack>

                    {status === 'current' && (
                      <Box className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </HStack>
                </Card>
              </TouchableOpacity>
            );
          })}
        </VStack>

        <Card className={colors.cardSecondary}>
          <VStack space="sm" className="p-4">
            <Text size="sm" className={`font-semibold ${colors.text}`}>
              Quick Stats
            </Text>
            <HStack space="md" className="justify-between">
              <Text size="sm" className={colors.textSecondary}>
                Completed Steps:
              </Text>
              <Text size="sm" className="font-medium text-green-600">
                {Object.values(stepProgress).filter(Boolean).length}/{totalSteps}
              </Text>
            </HStack>
            <HStack space="md" className="justify-between">
              <Text size="sm" className={colors.textSecondary}>
                Current Step:
              </Text>
              <Text size="sm" className="font-medium text-blue-600">
                {stepTitles[currentStep]}
              </Text>
            </HStack>
            {Object.keys(state.quizScores).length > 0 && (
              <HStack space="md" className="justify-between">
                <Text size="sm" className={colors.textSecondary}>
                  Quiz Scores:
                </Text>
                <Text size="sm" className={`font-medium ${colors.text}`}>
                  {Object.values(state.quizScores).map(score => `${score}%`).join(', ')}
                </Text>
              </HStack>
            )}
          </VStack>
        </Card>
      </VStack>
  );
};