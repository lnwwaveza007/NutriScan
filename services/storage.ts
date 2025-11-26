import { FoodLogEntry, DayLog, UserProfile } from "../types";

const STORAGE_KEY = 'nutriscan_logs_v1';
const PROFILE_KEY = 'nutriscan_profile_v1';

export const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLogs = (): Record<string, DayLog> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse logs", e);
    return {};
  }
};

export const saveLogEntry = (entry: FoodLogEntry): DayLog => {
  const logs = getLogs();
  const dateKey = getTodayDateKey();
  
  const dayLog = logs[dateKey] || { date: dateKey, entries: [], totalCalories: 0 };
  
  dayLog.entries.push(entry);
  dayLog.totalCalories += entry.info.calories;
  
  logs[dateKey] = dayLog;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return dayLog;
};

export const getTodayLog = (): DayLog => {
  const logs = getLogs();
  const dateKey = getTodayDateKey();
  return logs[dateKey] || { date: dateKey, entries: [], totalCalories: 0 };
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROFILE_KEY);
};
