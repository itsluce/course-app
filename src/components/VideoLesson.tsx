import React, { useState, useEffect } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@/components/ui/spinner';
import { VideoView, useVideoPlayer } from 'expo-video';
import { VideoLesson as VideoLessonType } from '../data/mockData';
import { useCourse } from '../context/CourseContext';
import { useTheme, getThemeColors } from '../context/ThemeContext';

interface VideoLessonProps {
  data: VideoLessonType;
  stepIndex: number;
}

export const VideoLesson: React.FC<VideoLessonProps> = ({ data, stepIndex }) => {
  const { markStepComplete, setCurrentStep, state } = useCourse();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [duration, setDuration] = useState(data.duration);
  const [hasWatched, setHasWatched] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const player = useVideoPlayer(data.videoUrl, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setVideoLoading(false);
        setVideoError(false);
        if (player.duration && player.duration > 0) {
          setDuration(player.duration);
        }
      } else if (status.status === 'loading') {
        setVideoLoading(true);
        setVideoError(false);
      } else if (status.status === 'error') {
        setVideoLoading(false);
        setVideoError(true);
      }
    });

    return () => {
      statusSubscription?.remove();
    };
  }, [player]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPress = () => {
    setShowVideo(true);
    setVideoLoading(true);
    setVideoError(false);
    setHasWatched(true);

    const timeoutId = setTimeout(() => {
      setVideoLoading(false);
      setVideoError(true);
    }, 10000);

    try {
      const playResult:any = player.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {
          setVideoLoading(false);
          setVideoError(true);
          clearTimeout(timeoutId);
        });
      }
    } catch (error) {
      setVideoLoading(false);
      setVideoError(true);
      clearTimeout(timeoutId);
    }
  };

  const handleVideoComplete = () => {
    markStepComplete(stepIndex);
  };

  const handleNextStep = () => {
    if (stepIndex + 1 < state.totalSteps) {
      setCurrentStep(stepIndex + 1);
    }
  };


  return (
    <Box className={`flex-1 ${colors.background}`}>
      <VStack space="lg" className="p-6">
        <VStack space="sm">
          <Heading size="xl" className={`${colors.text} font-bold`}>
            {data.title}
          </Heading>
          <Text size="md" className={colors.textSecondary}>
            {data.description}
          </Text>
        </VStack>

        <Card className="bg-gray-900 rounded-xl overflow-hidden">
          <Box className="relative aspect-video">
            {!showVideo ? (
              <>
                <Image
                  source={{ uri: data.thumbnail }}
                  alt="Video thumbnail"
                  className="w-full h-full"
                  resizeMode="cover"
                />
                
                <Box className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="xl"
                    className="bg-white/90 rounded-full w-20 h-20 flex items-center justify-center"
                    onPress={handlePlayPress}
                  >
                    <Text className="text-black text-2xl">▶️</Text>
                  </Button>
                </Box>
              </>
            ) : (
              <Box className="w-full h-full">
                {videoLoading && !videoError && (
                  <Box className="absolute inset-0 z-20 bg-gray-800 flex items-center justify-center">
                    <VStack space="sm" className="items-center">
                      <Spinner size="large" />
                      <Text className="text-white">Loading video...</Text>
                    </VStack>
                  </Box>
                )}
                
                {videoError && (
                  <Box className="absolute inset-0 z-20 bg-gray-800 flex items-center justify-center">
                    <VStack space="md" className="items-center p-6">
                      <Text className="text-white text-xl">⚠️</Text>
                      <Text className="text-white text-center">Failed to load video</Text>
                      <Button
                        size="md"
                        className="bg-blue-600"
                        onPress={() => {
                          setVideoError(false);
                          setVideoLoading(true);
                          try {
                            const replayResult:any = player.replay();
                            if (replayResult && typeof replayResult.catch === 'function') {
                              replayResult.catch(() => {
                                setVideoLoading(false);
                                setVideoError(true);
                              });
                            }
                          } catch (error) {
                            setVideoLoading(false);
                            setVideoError(true);
                          }
                        }}
                      >
                        <ButtonText className="text-white">Try Again</ButtonText>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={colors.border}
                        onPress={() => {
                          setShowVideo(false);
                          setVideoError(false);
                          setVideoLoading(false);
                        }}
                      >
                        <ButtonText className={'text-white'}>Back to Thumbnail</ButtonText>
                      </Button>
                    </VStack>
                  </Box>
                )}
                
                <VideoView
                  player={player}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    aspectRatio: 16/9
                  }}
                  allowsFullscreen
                  allowsPictureInPicture
                />
              </Box>
            )}
          </Box>
        </Card>

        {showVideo && player.playing && (
          <Card className={`${isDark ? 'bg-blue-900 border-white' : 'bg-blue-50 border-blue-200'}`}>
            <VStack space="sm" className="p-4">
              <HStack space="sm" className="items-center">
                <Box className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <Text size="sm" className={`${isDark ? 'text-white' : 'text-blue-700'} font-medium`}>
                  Video is playing...
                </Text>
              </HStack>
              <Text size="sm" className={`${isDark ? 'text-white opacity-80' : 'text-blue-600'}`}>
                Watch the complete video to unlock the next step
              </Text>
            </VStack>
          </Card>
        )}

        <VStack space="md">
          <HStack space="md" className="justify-between items-center">
            <Text size="sm" className={colors.textMuted}>
              Duration: {formatTime(duration)}
            </Text>
            <Text size="sm" className={colors.textMuted}>
              Step {stepIndex + 1} of {state.totalSteps}
            </Text>
          </HStack>

          <HStack space="md" className="justify-between">
            <Button
              variant="outline"
              size="lg"
              className={`flex-1 ${!hasWatched ? 'opacity-50' : ''} ${colors.border}`}
              onPress={handleVideoComplete}
              disabled={!hasWatched}
            >
              <ButtonText className={`${!hasWatched ? colors.textMuted : colors.text} text-sm text-center`} numberOfLines={2}>
                Mark as Complete
              </ButtonText>
            </Button>

            <Button
              size="lg"
              className={`flex-1 ${!state.stepProgress[stepIndex] ? `${colors.backgroundTertiary} opacity-60` : 'bg-blue-600'}`}
              onPress={handleNextStep}
              disabled={!state.stepProgress[stepIndex]}
            >
              <ButtonText className={`${!state.stepProgress[stepIndex] ? colors.textMuted : 'text-white'} text-sm text-center`} numberOfLines={1}>
                Next Step
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};