import { mockCourseData, mockFetch, CourseStep } from '../data/mockData';

export class CourseService {
  private static instance: CourseService;
  private cache: Map<string, CourseStep> = new Map();

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async loadStep(stepIndex: number): Promise<CourseStep> {
    const stepId = `step-${stepIndex + 1}`;
    
    if (this.cache.has(stepId)) {
      await mockFetch(null, 300);
      return this.cache.get(stepId)!;
    }

    const stepData = mockCourseData[stepIndex];
    if (!stepData) {
      throw new Error(`Step ${stepIndex + 1} not found`);
    }

    const result = await mockFetch(stepData);
    this.cache.set(stepId, result);
    
    return result;
  }

  async preloadNextStep(currentStepIndex: number): Promise<void> {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < mockCourseData.length) {
        await this.loadStep(nextStepIndex);
    }
  }
}

export const courseService = CourseService.getInstance();