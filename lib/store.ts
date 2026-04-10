// ============================================================
// Forge App - Zustand Store with localStorage Persistence
// ============================================================

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ForgeAppState,
  TimetableEvent,
  PriorityItem,
  UserPreferences,
  AITimetableVersion,
  AppNotification,
  DayOfWeek,
} from "@/types";
import { generateId, getCurrentDay } from "./utils";
import { SAMPLE_EVENTS, SAMPLE_PRIORITIES, DEFAULT_PREFERENCES } from "./sample-data";

interface ForgeActions {
  // Events
  addEvent: (event: TimetableEvent) => void;
  addEvents: (events: TimetableEvent[]) => void;
  updateEvent: (id: string, updates: Partial<TimetableEvent>) => void;
  deleteEvent: (id: string) => void;
  clearEvents: () => void;

  // AI versions
  setAIVersions: (versions: AITimetableVersion[]) => void;
  selectAIVersion: (versionId: string | null) => void;
  clearAIVersions: () => void;

  // Priorities
  addPriority: (priority: PriorityItem) => void;
  updatePriority: (id: string, updates: Partial<PriorityItem>) => void;
  deletePriority: (id: string) => void;
  reorderPriorities: (priorities: PriorityItem[]) => void;

  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // Notifications
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // UI State
  setGenerating: (isGenerating: boolean) => void;
  setCurrentDay: (day: DayOfWeek) => void;
  setFocusMode: (active: boolean) => void;
  completeOnboarding: () => void;
  setLastGenerated: (timestamp: string) => void;

  // Computed getters
  getActiveEvents: () => TimetableEvent[];
}

type ForgeStore = ForgeAppState & ForgeActions;

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: SAMPLE_EVENTS,
      aiVersions: [],
      activeVersionId: null,
      priorities: SAMPLE_PRIORITIES,
      preferences: DEFAULT_PREFERENCES,
      notifications: [],
      isGenerating: false,
      currentDay: getCurrentDay(),
      focusModeActive: false,
      onboardingComplete: false,
      lastGenerated: null,

      // Event actions
      addEvent: (event) =>
        set((state) => ({ events: [...state.events, event] })),

      addEvents: (events) =>
        set((state) => ({ events: [...state.events, ...events] })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      clearEvents: () => set({ events: [] }),

      // AI version actions
      setAIVersions: (versions) => set({ aiVersions: versions }),

      selectAIVersion: (versionId) =>
        set({ activeVersionId: versionId }),

      clearAIVersions: () =>
        set({ aiVersions: [], activeVersionId: null }),

      // Priority actions
      addPriority: (priority) =>
        set((state) => ({ priorities: [...state.priorities, priority] })),

      updatePriority: (id, updates) =>
        set((state) => ({
          priorities: state.priorities.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePriority: (id) =>
        set((state) => ({
          priorities: state.priorities.filter((p) => p.id !== id),
        })),

      reorderPriorities: (priorities) => set({ priorities }),

      // Preference actions
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      // Notification actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications.slice(0, 49), // Keep last 50
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // UI state actions
      setGenerating: (isGenerating) => set({ isGenerating }),
      setCurrentDay: (day) => set({ currentDay: day }),
      setFocusMode: (active) => set({ focusModeActive: active }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setLastGenerated: (timestamp) => set({ lastGenerated: timestamp }),

      // Computed getters
      getActiveEvents: () => {
        const { events, aiVersions, activeVersionId } = get();
        if (activeVersionId) {
          const version = aiVersions.find((v) => v.id === activeVersionId);
          return version?.events ?? events;
        }
        return events;
      },
    }),
    {
      name: "forge-app-storage",
      storage: createJSONStorage(() => {
        // Safe localStorage access (handles SSR)
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        events: state.events,
        aiVersions: state.aiVersions,
        activeVersionId: state.activeVersionId,
        priorities: state.priorities,
        preferences: state.preferences,
        notifications: state.notifications,
        onboardingComplete: state.onboardingComplete,
        lastGenerated: state.lastGenerated,
      }),
    }
  )
);
