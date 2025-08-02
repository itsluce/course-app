import React, {useEffect, useState} from 'react';
import {TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Box} from '@/components/ui/box';
import {Text} from '@/components/ui/text';
import {Button, ButtonText} from '@/components/ui/button';
import {VStack} from '@/components/ui/vstack';
import {HStack} from '@/components/ui/hstack';
import {Drawer, DrawerBackdrop, DrawerContent} from '@/components/ui/drawer';
import {LoadingScreen} from '../components/LoadingScreen';
import {ProgressTracker} from '../components/ProgressTracker';
import {VideoLesson} from '../components/VideoLesson';
import {Quiz} from '../components/Quiz';
import {ContentSection} from '../components/ContentSection';
import {useCourse} from '../context/CourseContext';
import {courseService} from '../services/courseService';
import {useTheme, getThemeColors} from '../context/ThemeContext';

export const CourseScreen: React.FC = () => {
    const {state, setStepData, setLoading} = useCourse();
    const {isDark, toggleTheme} = useTheme();
    const colors = getThemeColors(isDark);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentStepData = state.steps[state.currentStep];
    const isLoading = state.isLoading && state.loadingStep === state.currentStep;

    useEffect(() => {
        loadCurrentStep();
    }, [state.currentStep]);

    const loadCurrentStep = async () => {
        try {
            if (currentStepData) return;

            setError(null);
            setLoading(true, state.currentStep);

            const stepData = await courseService.loadStep(state.currentStep);
            setStepData(state.currentStep, stepData);

            await courseService.preloadNextStep(state.currentStep);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load step');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        loadCurrentStep();
    };

    const renderStepContent = () => {
        if (!currentStepData) return null;

        switch (currentStepData.type) {
            case 'video':
                return <VideoLesson data={currentStepData} stepIndex={state.currentStep}/>;
            case 'quiz':
                return <Quiz data={currentStepData} stepIndex={state.currentStep}/>;
            case 'content':
                return <ContentSection data={currentStepData} stepIndex={state.currentStep}/>;
            default:
                return (
                    <Box className="flex-1 items-center justify-center p-6">
                        <Text className="text-gray-600">Unknown step type</Text>
                    </Box>
                );
        }
    };

    if (error) {
        return (
            <Box className={`flex-1 ${colors.background}`}>
                <Box className="flex-1 items-center justify-center p-6">
                    <VStack space="lg" className="items-center max-w-sm">
                        <Text className="text-6xl">😞</Text>
                        <Text size="lg" className={`font-semibold ${colors.text} text-center`}>
                            Oops! Something went wrong
                        </Text>
                        <Text size="md" className={`${colors.textSecondary} text-center`}>
                            {error}
                        </Text>
                        <Button size="lg" className={colors.buttonPrimary} onPress={handleRetry}>
                            <ButtonText className={`${colors.buttonText} text-sm text-center`} numberOfLines={1}>Try Again</ButtonText>
                        </Button>
                    </VStack>
                </Box>
            </Box>
        );
    }

    if (isLoading) {
        return <LoadingScreen stepIndex={state.currentStep}/>;
    }

    return (
        <SafeAreaView className={`flex-1 ${colors.backgroundSecondary}`}>
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                anchor="left"
                size="full"
            >
                <DrawerBackdrop onPress={() => setIsDrawerOpen(false)}/>
                <DrawerContent className={`h-full ${colors.background} w-4/5 p-0`}>
                    <SafeAreaView>
                        <VStack className="h-full">

                            {/* Header */}
                            <Box className="bg-blue-600 px-6 py-4">
                                <HStack className="items-center justify-between">
                                    <Text size="lg" className="font-bold text-white">
                                        Course Progress
                                    </Text>
                                    <HStack space="sm" className="items-center">
                                        <TouchableOpacity onPress={toggleTheme}>
                                            <Text className="text-white text-xl">
                                                {isDark ? '☀️' : '🌙'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => setIsDrawerOpen(false)}
                                            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                                        >
                                            <Text className="text-white text-lg font-medium">✕</Text>
                                        </TouchableOpacity>
                                    </HStack>
                                </HStack>
                            </Box>

                            {/* Content */}
                            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                                <Box className="p-5">
                                    <ProgressTracker/>
                                </Box>
                            </ScrollView>
                        </VStack>
                    </SafeAreaView>
                </DrawerContent>
            </Drawer>

            <VStack className="flex-1">
                <HStack space="md" className={`items-center justify-between px-6 py-4 ${colors.background} ${colors.border} border-b`}>
                    <HStack space="md" className="items-center">
                        <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
                            <Text className="text-blue-600 text-xl">☰</Text>
                        </TouchableOpacity>
                        <Text size="xl" className={`font-bold ${colors.text}`}>
                            React Native Course
                        </Text>
                    </HStack>
                    <Text size="sm" className={colors.textSecondary}>
                        Step {state.currentStep + 1} of {state.totalSteps}
                    </Text>
                </HStack>

                <Box className="flex-1">
                    {renderStepContent()}
                </Box>
            </VStack>
        </SafeAreaView>
    );
};