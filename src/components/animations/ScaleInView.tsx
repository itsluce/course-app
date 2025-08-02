import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

interface ScaleInViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({ 
  children, 
  duration = 400, 
  delay = 0,
  initialScale = 0.8,
  style,
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};