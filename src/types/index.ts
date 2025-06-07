export interface User {
  id: string;
  name: string;
  age: number;
  profession: string;
  yearsToPredict: number;
  createdAt: Date;
}

export interface SessionData {
  level: number;
  transcript: string;
  emotions: EmotionData;
  aiResponse: string;
  feedback: string;
  timestamp: Date;
}

export interface EmotionData {
  happiness: number;
  confidence: number;
  stress: number;
  engagement: number;
  authenticity: number;
}

export interface Prediction {
  careerStage: string;
  personalityDevelopment: string[];
  emotionalIntelligence: string;
  growthRoadmap: string[];
  confidenceScore: number;
}

export type AppState = 'welcome' | 'registration' | 'level-select' | 'interaction' | 'feedback' | 'prediction';