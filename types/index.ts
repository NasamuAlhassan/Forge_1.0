// ============================================================
// Forge App - Core Type Definitions
// ============================================================

/** Categories for timetable events with associated colors */
export type EventCategory =
  | "class"
  | "study"
  | "meal"
  | "sleep"
  | "travel"
  | "exercise"
  | "break"
  | "work"
  | "personal";

/** Days of the week */
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/** A single timetable event */
export interface TimetableEvent {
  id: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM" 24-hour format
  endTime: string; // "HH:MM" 24-hour format
  category: EventCategory;
  color?: string;
  description?: string;
  isRecurring?: boolean;
  location?: string;
  priority?: number; // 1-10
  isAllDay?: boolean;
}

/** Priority entry for a subject/topic */
export interface PriorityItem {
  id: string;
  subject: string;
  priority: number; // 1-10
  reason?: string;
  examDate?: string; // ISO date string
  hoursPerWeek?: number;
  color?: string;
}

/** User preferences for scheduling */
export interface UserPreferences {
  wakeTime: string; // "HH:MM"
  sleepTime: string; // "HH:MM"
  studySessionLength: number; // minutes (Pomodoro)
  breakLength: number; // minutes
  mealTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  travelBuffer: number; // minutes
  theme: "dark" | "light" | "system";
  reminderTiming: 10 | 20 | 30; // minutes before event
  enableNotifications: boolean;
  enableFocusMode: boolean;
  name: string;
}

/** An AI-generated timetable version */
export interface AITimetableVersion {
  id: string;
  name: string;
  description: string;
  events: TimetableEvent[];
  rationale: string;
  totalStudyHours: number;
  totalSleepHours: number;
  totalBreakHours: number;
  createdAt: string; // ISO date string
  type: "balanced" | "intense";
}

/** Input source for events */
export type InputSource = "voice" | "file" | "manual" | "ai";

/** Notification / toast message */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

/** App state shape for Zustand */
export interface ForgeAppState {
  // Timetable events (baseline)
  events: TimetableEvent[];
  // AI-generated versions
  aiVersions: AITimetableVersion[];
  // Currently active version id (null = baseline)
  activeVersionId: string | null;
  // User priorities
  priorities: PriorityItem[];
  // User preferences
  preferences: UserPreferences;
  // Notifications
  notifications: AppNotification[];
  // UI state
  isGenerating: boolean;
  currentDay: DayOfWeek;
  focusModeActive: boolean;
  onboardingComplete: boolean;
  // Last generated timestamp
  lastGenerated: string | null;
}

/** Color mapping for event categories */
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  class: "bg-blue-500",
  study: "bg-purple-500",
  meal: "bg-orange-400",
  sleep: "bg-indigo-800",
  travel: "bg-slate-400",
  exercise: "bg-green-500",
  break: "bg-teal-400",
  work: "bg-amber-500",
  personal: "bg-pink-400",
};

export const CATEGORY_COLORS_HEX: Record<EventCategory, string> = {
  class: "#3b82f6",
  study: "#a855f7",
  meal: "#fb923c",
  sleep: "#3730a3",
  travel: "#94a3b8",
  exercise: "#22c55e",
  break: "#2dd4bf",
  work: "#f59e0b",
  personal: "#f472b6",
};

export const CATEGORY_TEXT_COLORS: Record<EventCategory, string> = {
  class: "text-blue-400",
  study: "text-purple-400",
  meal: "text-orange-400",
  sleep: "text-indigo-400",
  travel: "text-slate-400",
  exercise: "text-green-400",
  break: "text-teal-400",
  work: "text-amber-400",
  personal: "text-pink-400",
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};
