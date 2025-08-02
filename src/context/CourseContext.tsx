import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CourseStep } from '../data/mockData';

interface CourseState {
  currentStep: number;
  totalSteps: number;
  steps: (CourseStep | null)[];
  stepProgress: { [key: number]: boolean };
  quizScores: { [key: string]: number };
  isLoading: boolean;
  loadingStep: number | null;
}

type CourseAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_STEP_DATA'; payload: { stepIndex: number; data: CourseStep } }
  | { type: 'MARK_STEP_COMPLETE'; payload: number }
  | { type: 'SET_QUIZ_SCORE'; payload: { stepId: string; score: number } }
  | { type: 'SET_LOADING'; payload: { loading: boolean; stepIndex?: number } }
  | { type: 'RESET_COURSE' };

const initialState: CourseState = {
  currentStep: 0,
  totalSteps: 4,
  steps: [null, null, null, null],
  stepProgress: {},
  quizScores: {},
  isLoading: false,
  loadingStep: null,
};

const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_STEP_DATA':
      const newSteps = [...state.steps];
      newSteps[action.payload.stepIndex] = action.payload.data;
      return { ...state, steps: newSteps };
    
    case 'MARK_STEP_COMPLETE':
      return {
        ...state,
        stepProgress: {
          ...state.stepProgress,
          [action.payload]: true
        }
      };
    
    case 'SET_QUIZ_SCORE':
      return {
        ...state,
        quizScores: {
          ...state.quizScores,
          [action.payload.stepId]: action.payload.score
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.loading,
        loadingStep: action.payload.loading ? action.payload.stepIndex ?? null : null
      };
    
    case 'RESET_COURSE':
      return initialState;
    
    default:
      return state;
  }
};

interface CourseContextType {
  state: CourseState;
  setCurrentStep: (step: number) => void;
  setStepData: (stepIndex: number, data: CourseStep) => void;
  markStepComplete: (stepIndex: number) => void;
  setQuizScore: (stepId: string, score: number) => void;
  setLoading: (loading: boolean, stepIndex?: number) => void;
  canNavigateToStep: (stepIndex: number) => boolean;
  getOverallProgress: () => number;
  resetCourse: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const setCurrentStep = (step: number) => {
    if (step >= 0 && step < state.totalSteps && canNavigateToStep(step)) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  const setStepData = (stepIndex: number, data: CourseStep) => {
    dispatch({ type: 'SET_STEP_DATA', payload: { stepIndex, data } });
  };

  const markStepComplete = (stepIndex: number) => {
    dispatch({ type: 'MARK_STEP_COMPLETE', payload: stepIndex });
  };

  const setQuizScore = (stepId: string, score: number) => {
    dispatch({ type: 'SET_QUIZ_SCORE', payload: { stepId, score } });
  };

  const setLoading = (loading: boolean, stepIndex?: number) => {
    dispatch({ type: 'SET_LOADING', payload: { loading, stepIndex } });
  };

  const canNavigateToStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true;
    
    for (let i = 0; i < stepIndex; i++) {
      if (!state.stepProgress[i]) {
        return false;
      }
    }
    return true;
  };

  const getOverallProgress = (): number => {
    const completedSteps = Object.values(state.stepProgress).filter(Boolean).length;
    return Math.round((completedSteps / state.totalSteps) * 100);
  };

  const resetCourse = () => {
    dispatch({ type: 'RESET_COURSE' });
  };

  return (
    <CourseContext.Provider
      value={{
        state,
        setCurrentStep,
        setStepData,
        markStepComplete,
        setQuizScore,
        setLoading,
        canNavigateToStep,
        getOverallProgress,
        resetCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};