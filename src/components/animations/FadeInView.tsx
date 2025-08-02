import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({ 
  children, 
  duration = 500, 
  delay = 0,
  style,
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};