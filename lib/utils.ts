// ============================================================
// Forge App - Utility Functions
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayOfWeek, TimetableEvent } from "@/types";

/** Merge Tailwind CSS classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Convert "HH:MM" to minutes from midnight */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Convert minutes from midnight to "HH:MM" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Calculate duration between two "HH:MM" strings in minutes */
export function getDurationMinutes(start: string, end: string): number {
  const startMin = timeToMinutes(start);
  let endMin = timeToMinutes(end);
  if (endMin <= startMin) endMin += 24 * 60; // Handle overnight
  return endMin - startMin;
}

/** Format duration in minutes to human readable string */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format "HH:MM" to "H:MM AM/PM" */
export function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Get the current day of week */
export function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
}

/** Check if two time ranges overlap */
export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

/** Sort events by start time */
export function sortEventsByTime(events: TimetableEvent[]): TimetableEvent[] {
  return [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
}

/** Get events for a specific day */
export function getEventsForDay(
  events: TimetableEvent[],
  day: DayOfWeek
): TimetableEvent[] {
  return sortEventsByTime(events.filter((e) => e.day === day));
}

/** Calculate total hours from events */
export function calculateTotalHours(events: TimetableEvent[]): number {
  const totalMinutes = events.reduce(
    (acc, event) => acc + getDurationMinutes(event.startTime, event.endTime),
    0
  );
  return Math.round((totalMinutes / 60) * 10) / 10;
}

/** Parse time string from natural language (e.g., "8am", "2:30pm", "14:00") */
export function parseNaturalTime(input: string): string | null {
  input = input.toLowerCase().trim();

  // "HH:MM" format
  const match24 = input.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1]);
    const m = parseInt(match24[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }

  // "H:MM am/pm" format
  const match12 = input.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = parseInt(match12[2]);
    const period = match12[3];
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // "Ham/pm" format (e.g., "8am", "3pm")
  const matchSimple = input.match(/^(\d{1,2})\s*(am|pm)$/);
  if (matchSimple) {
    let h = parseInt(matchSimple[1]);
    const period = matchSimple[2];
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:00`;
  }

  return null;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Get position percentage for a time in a day view */
export function getTimePosition(time: string, dayStart = "06:00", dayEnd = "23:00"): number {
  const startMin = timeToMinutes(dayStart);
  const endMin = timeToMinutes(dayEnd);
  const timeMin = timeToMinutes(time);
  return ((timeMin - startMin) / (endMin - startMin)) * 100;
}

/** Get height percentage for an event duration in day view */
export function getEventHeight(startTime: string, endTime: string, dayStart = "06:00", dayEnd = "23:00"): number {
  const startMin = timeToMinutes(dayStart);
  const endMin = timeToMinutes(dayEnd);
  const duration = getDurationMinutes(startTime, endTime);
  return (duration / (endMin - startMin)) * 100;
}
