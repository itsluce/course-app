import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {Box} from '@/components/ui/box';
import {Text} from '@/components/ui/text';
import {Button, ButtonText} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Heading} from '@/components/ui/heading';
import {HStack} from '@/components/ui/hstack';
import {VStack} from '@/components/ui/vstack';
import {Image} from '@/components/ui/image';
import {Progress, ProgressFilledTrack} from '@/components/ui/progress';
import {Spinner} from '@/components/ui/spinner';
import {useToast, Toast, ToastTitle} from '@/components/ui/toast';
import {ContentSection as ContentSectionType} from '../data/mockData';
import {useCourse} from '../context/CourseContext';
import {useTheme, getThemeColors} from '../context/ThemeContext';

interface ContentSectionProps {
    data: ContentSectionType;
    stepIndex: number;
}

export const ContentSection: React.FC<ContentSectionProps> = ({data, stepIndex}) => {
    const {markStepComplete, setCurrentStep, state} = useCourse();
    const {isDark} = useTheme();
    const colors = getThemeColors(isDark);
    const [currentContentIndex, setCurrentContentIndex] = useState(0);
    const [readProgress, setReadProgress] = useState<{ [key: number]: boolean }>({});
    const [timeSpent, setTimeSpent] = useState(0);
    const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
    const toast = useToast();

    const totalContent = data.content.length;
    const currentContent = data.content[currentContentIndex];
    const progress = ((currentContentIndex + 1) / totalContent) * 100;
    const overallReadProgress = Object.keys(readProgress).length;

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setReadProgress(prev => ({
                ...prev,
                [currentContentIndex]: true
            }));
        }, 3000);

        return () => clearTimeout(timer);
    }, [currentContentIndex]);

    const handleNext = () => {
        if (currentContentIndex < totalContent - 1) {
            const wasLastSection = currentContentIndex === totalContent - 2;
            setCurrentContentIndex(prev => prev + 1);

            if (wasLastSection) {
                setTimeout(() => {
                    toast.show({
                        placement: 'top',
                        render: ({id}) => (
                            <Toast nativeID={id} action="success" variant="solid" className="mt-12">
                                <ToastTitle>✓ Section completed! Continue to the next section.</ToastTitle>
                            </Toast>
                        ),
                    });
                }, 500);
            }
        }
    };

    const handlePrevious = () => {
        if (currentContentIndex > 0) {
            setCurrentContentIndex(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        markStepComplete(stepIndex);
    };

    const handleNextStep = () => {
        if (stepIndex + 1 < state.totalSteps) {
            setCurrentStep(stepIndex + 1);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isLastContent = currentContentIndex === totalContent - 1;
    const isContentRead = readProgress[currentContentIndex];
    const allContentRead = Object.keys(readProgress).length === totalContent;

    return (
        <Box className={`flex-1 ${colors.background}`}>
            <VStack className="flex-1">

                <VStack space="sm" className="p-6 pb-0">
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
                                Section {currentContentIndex + 1} of {totalContent}
                            </Text>
                            <Text size="sm" className={colors.textMuted}>
                                Step {stepIndex + 1} of {state.totalSteps}
                            </Text>
                        </HStack>

                        <Progress value={progress} className="w-full">
                            <ProgressFilledTrack style={{width: `${progress}%`}}/>
                        </Progress>

                        <HStack space="md" className="justify-between">
                            <Text size="xs" className={colors.textMuted}>
                                Read: {overallReadProgress}/{totalContent}
                            </Text>
                            <Text size="xs" className={`${isContentRead ? 'text-green-600' : colors.textMuted}`}>
                                {isContentRead ? '✓ Section read' : 'Reading...'}
                            </Text>
                        </HStack>
                    </VStack>
                </VStack>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <Card className={`${colors.card} p-6 mt-4`}>
                        <VStack space="lg">
                            <Text size="lg" className={`${colors.text} leading-7 text-justify`}>
                                {currentContent.text}
                            </Text>

                            {currentContent.images && currentContent.images.length > 0 && (
                                <VStack space="md">
                                    {currentContent.images.map((imageUrl, index) => {
                                        const imageKey = `${currentContentIndex}-${index}`;
                                        const isLoading = imageLoadingStates[imageKey];

                                        return (
                                            <Card key={index} className="overflow-hidden relative">
                                                {isLoading && (
                                                    <Box
                                                        className="absolute inset-0 z-10 bg-gray-100 flex items-center justify-center">
                                                        <Spinner size="large"/>
                                                    </Box>
                                                )}
                                                <Image
                                                    source={{uri: imageUrl}}
                                                    alt={`Content image ${index + 1}`}
                                                    className="w-full h-48 rounded-lg"
                                                    resizeMode="cover"
                                                    onLoadStart={() => {
                                                        setImageLoadingStates(prev => ({...prev, [imageKey]: true}));
                                                    }}
                                                    onLoad={() => {
                                                        setImageLoadingStates(prev => ({...prev, [imageKey]: false}));
                                                    }}
                                                    onError={() => {
                                                        setImageLoadingStates(prev => ({...prev, [imageKey]: false}));
                                                    }}
                                                />
                                            </Card>
                                        );
                                    })}
                                </VStack>
                            )}


                            {allContentRead && !state.stepProgress[stepIndex] && (
                                <Card
                                    className={`${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                                    <VStack space="sm" className="p-4">
                                        <HStack space="sm" className="items-center">
                                            <Text className="text-blue-600 text-lg">🎉</Text>
                                            <Text className={`${isDark ? 'text-white' : 'text-blue-700'} font-medium`}>
                                                All sections completed!
                                            </Text>
                                        </HStack>
                                        <Text
                                            className={`${isDark ? 'text-white opacity-70' : 'text-blue-600'} text-sm`}>
                                            You've read through all the content. Mark this step as complete to continue.
                                        </Text>
                                    </VStack>
                                </Card>
                            )}
                        </VStack>
                    </Card>
                </ScrollView>

                <VStack space="md" className="p-6 pt-4">
                    <HStack space="md" className="justify-between">
                        <Button
                            size="lg"
                            variant="outline"
                            className={`flex-1 ${currentContentIndex === 0 ? 'opacity-50' : ''} ${colors.border}`}
                            onPress={handlePrevious}
                            disabled={currentContentIndex === 0}
                        >
                            <ButtonText className={`${currentContentIndex === 0 ? colors.textMuted : colors.text} text-sm text-center`} numberOfLines={1}>
                                Previous
                            </ButtonText>
                        </Button>

                        {!isLastContent ? (
                            <Button
                                size="lg"
                                className={`flex-1 ${!isContentRead ? `${colors.backgroundTertiary} opacity-60` : 'bg-blue-600'}`}
                                onPress={handleNext}
                                disabled={!isContentRead}
                            >
                                <ButtonText className={`${!isContentRead ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={2}>
                                    Next Section
                                </ButtonText>
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className={`flex-1 ${!allContentRead ? `${colors.backgroundTertiary} opacity-60` : 'bg-green-600'}`}
                                onPress={handleComplete}
                                disabled={!allContentRead}
                            >
                                <ButtonText className={`${!allContentRead ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={2}>
                                    Complete Reading
                                </ButtonText>
                            </Button>
                        )}
                    </HStack>

                    {state.stepProgress[stepIndex] && (
                        <Button
                            size="lg"
                            className={`${stepIndex + 1 >= state.totalSteps ? `${colors.backgroundTertiary} opacity-60` : 'bg-blue-600'}`}
                            onPress={handleNextStep}
                            disabled={stepIndex + 1 >= state.totalSteps}
                        >
                            <ButtonText className={`${stepIndex + 1 >= state.totalSteps ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={2}>
                                {stepIndex + 1 >= state.totalSteps ? 'Course Complete!' : 'Next Step'}
                            </ButtonText>
                        </Button>
                    )}
                </VStack>

                <Card className={colors.cardSecondary}>
                    <VStack space="sm" className="p-4">
                        <Text size="sm" className={`font-semibold ${colors.text}`}>
                            Reading Progress
                        </Text>
                        <HStack space="md" className="justify-between">
                            <Text size="sm" className={colors.textSecondary}>
                                Sections read:
                            </Text>
                            <Text size="sm" className={`font-medium ${colors.text}`}>
                                {overallReadProgress}/{totalContent}
                            </Text>
                        </HStack>
                        <HStack space="md" className="justify-between">
                            <Text size="sm" className={colors.textSecondary}>
                                Time spent:
                            </Text>
                            <Text size="sm" className={`font-medium ${colors.text}`}>
                                {formatTime(timeSpent)}
                            </Text>
                        </HStack>
                        <HStack space="md" className="justify-between">
                            <Text size="sm" className={colors.textSecondary}>
                                Completion:
                            </Text>
                            <Text size="sm"
                                  className={`font-medium ${allContentRead ? 'text-green-600' : colors.textSecondary}`}>
                                {Math.round((overallReadProgress / totalContent) * 100)}%
                            </Text>
                        </HStack>
                    </VStack>
                    </Card>
                </VStack>
        </Box>
    );
};