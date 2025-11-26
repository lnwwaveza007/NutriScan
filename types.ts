export interface NutritionalInfo {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionEstimate: string;
  reasoning: string;
}

export interface FoodLogEntry {
  id: string;
  timestamp: number;
  image: string | null; // Base64
  info: NutritionalInfo;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  entries: FoodLogEntry[];
  totalCalories: number;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
}

export type Gender = 'male' | 'female';

export enum ActivityLevel {
  SEDENTARY = 1.2,
  LIGHTLY_ACTIVE = 1.375,
  MODERATELY_ACTIVE = 1.55,
  VERY_ACTIVE = 1.725,
}

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: ActivityLevel;
  dailyCalorieGoal: number;
}
