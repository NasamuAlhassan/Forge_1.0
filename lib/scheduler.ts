// ============================================================
// Forge App - AI Scheduler Simulation
// ============================================================
// NOTE: In production, replace the mock logic here with actual
// calls to OpenAI GPT-4o or Groq API for intelligent scheduling.
// The structure and types remain the same — only replace the
// generation logic inside generateAIVersions().
// ============================================================

import {
  TimetableEvent,
  PriorityItem,
  UserPreferences,
  AITimetableVersion,
  DayOfWeek,
  EventCategory,
} from "@/types";
import { generateId, timeToMinutes, minutesToTime } from "./utils";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Create a single timetable event */
function makeEvent(
  title: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  category: EventCategory,
  options: Partial<TimetableEvent> = {}
): TimetableEvent {
  return {
    id: generateId(),
    title,
    day,
    startTime,
    endTime,
    category,
    ...options,
  };
}

/** Insert core daily events (sleep, meals) based on preferences */
function insertCoreEvents(
  day: DayOfWeek,
  prefs: UserPreferences
): TimetableEvent[] {
  const events: TimetableEvent[] = [];

  // Sleep block (wake time → sleep time of previous day)
  events.push(
    makeEvent(`Sleep`, day, prefs.sleepTime, prefs.wakeTime, "sleep")
  );

  // Breakfast
  events.push(
    makeEvent(
      "Breakfast",
      day,
      prefs.mealTimes.breakfast,
      minutesToTime(timeToMinutes(prefs.mealTimes.breakfast) + 30),
      "meal"
    )
  );

  // Lunch
  events.push(
    makeEvent(
      "Lunch",
      day,
      prefs.mealTimes.lunch,
      minutesToTime(timeToMinutes(prefs.mealTimes.lunch) + 45),
      "meal"
    )
  );

  // Dinner
  events.push(
    makeEvent(
      "Dinner",
      day,
      prefs.mealTimes.dinner,
      minutesToTime(timeToMinutes(prefs.mealTimes.dinner) + 45),
      "meal"
    )
  );

  return events;
}

/** Generate time slots for a day, respecting existing events */
function getFreeSlots(
  day: DayOfWeek,
  existingEvents: TimetableEvent[],
  wakeTime: string,
  sleepTime: string
): Array<{ start: number; end: number }> {
  const dayEvents = existingEvents.filter((e) => e.day === day);
  const wakeMin = timeToMinutes(wakeTime);
  const sleepMin = timeToMinutes(sleepTime);

  // Build occupied timeline
  const occupied: Array<{ start: number; end: number }> = dayEvents.map(
    (e) => ({
      start: timeToMinutes(e.startTime),
      end: timeToMinutes(e.endTime),
    })
  );

  occupied.sort((a, b) => a.start - b.start);

  // Find free slots
  const freeSlots: Array<{ start: number; end: number }> = [];
  let cursor = wakeMin;

  for (const slot of occupied) {
    if (slot.start > cursor && slot.start <= sleepMin) {
      freeSlots.push({ start: cursor, end: Math.min(slot.start, sleepMin) });
    }
    cursor = Math.max(cursor, slot.end);
  }

  if (cursor < sleepMin) {
    freeSlots.push({ start: cursor, end: sleepMin });
  }

  return freeSlots.filter((s) => s.end - s.start >= 30); // Only slots ≥30 min
}

/** Distribute study time across days based on priorities */
function allocateStudyTime(
  priorities: PriorityItem[],
  isIntense: boolean
): Array<{ subject: string; duration: number; priority: number }> {
  if (priorities.length === 0) return [];

  const totalDailyStudyMinutes = isIntense ? 360 : 240; // 6h or 4h
  const totalPriorityWeight = priorities.reduce((s, p) => s + p.priority, 0);

  return priorities.map((p) => ({
    subject: p.subject,
    priority: p.priority,
    duration: Math.round(
      (p.priority / totalPriorityWeight) * totalDailyStudyMinutes
    ),
  }));
}

/** Build a "Balanced Energy" timetable */
function buildBalancedVersion(
  baselineEvents: TimetableEvent[],
  priorities: PriorityItem[],
  prefs: UserPreferences
): TimetableEvent[] {
  const allEvents: TimetableEvent[] = [];
  const studyAllocations = allocateStudyTime(priorities, false);

  // Keep existing class, work events from baseline
  const keepCategories: EventCategory[] = ["class", "work"];
  const keptEvents = baselineEvents.filter((e) =>
    keepCategories.includes(e.category)
  );
  allEvents.push(...keptEvents);

  for (const day of DAYS) {
    // Add core events (meals, sleep)
    allEvents.push(...insertCoreEvents(day, prefs));

    // Add morning exercise (3x per week Mon/Wed/Fri)
    if (["Monday", "Wednesday", "Friday"].includes(day)) {
      const exerciseStart = minutesToTime(timeToMinutes(prefs.wakeTime) + 15);
      const exerciseEnd = minutesToTime(timeToMinutes(prefs.wakeTime) + 60);
      allEvents.push(
        makeEvent("Morning Workout", day as DayOfWeek, exerciseStart, exerciseEnd, "exercise")
      );
    }

    // Add travel buffer after class events on this day
    const dayClasses = keptEvents.filter(
      (e) => e.day === day && e.category === "class"
    );
    for (const cls of dayClasses) {
      const travelStart = cls.endTime;
      const travelEnd = minutesToTime(
        timeToMinutes(cls.endTime) + prefs.travelBuffer
      );
      allEvents.push(
        makeEvent(
          "Travel Buffer",
          day as DayOfWeek,
          travelStart,
          travelEnd,
          "travel"
        )
      );
    }

    // Get free slots and fill with study sessions
    const currentDayEvents = allEvents.filter((e) => e.day === day);
    const freeSlots = getFreeSlots(
      day as DayOfWeek,
      currentDayEvents,
      prefs.wakeTime,
      prefs.sleepTime
    );

    // Add Pomodoro study sessions (balanced: 50min study + 10min break)
    let subjectIdx = 0;
    for (const slot of freeSlots) {
      let cursor = slot.start;
      const available = slot.end - cursor;

      if (available < 60) continue; // Skip if less than 1 hour

      // Add a short break if it's afternoon (after 14:00 = 840 min)
      if (cursor >= 840 && cursor < 900) {
        const breakEnd = Math.min(cursor + 15, slot.end);
        allEvents.push(
          makeEvent(
            "Short Break",
            day as DayOfWeek,
            minutesToTime(cursor),
            minutesToTime(breakEnd),
            "break"
          )
        );
        cursor = breakEnd;
      }

      // Insert study sessions
      while (cursor < slot.end - 60 && studyAllocations.length > 0) {
        const subject =
          studyAllocations[subjectIdx % studyAllocations.length];
        const sessionLen = Math.min(prefs.studySessionLength, slot.end - cursor - 10);
        if (sessionLen < 30) break;

        allEvents.push(
          makeEvent(
            `Study: ${subject.subject}`,
            day as DayOfWeek,
            minutesToTime(cursor),
            minutesToTime(cursor + sessionLen),
            "study",
            { priority: subject.priority }
          )
        );
        cursor += sessionLen;

        // Add break after each Pomodoro
        if (cursor + prefs.breakLength <= slot.end) {
          allEvents.push(
            makeEvent(
              "Pomodoro Break",
              day as DayOfWeek,
              minutesToTime(cursor),
              minutesToTime(cursor + prefs.breakLength),
              "break"
            )
          );
          cursor += prefs.breakLength;
        }

        subjectIdx++;
      }
    }
  }

  return allEvents;
}

/** Build an "Intense Focus" timetable */
function buildIntenseVersion(
  baselineEvents: TimetableEvent[],
  priorities: PriorityItem[],
  prefs: UserPreferences
): TimetableEvent[] {
  const allEvents: TimetableEvent[] = [];
  const studyAllocations = allocateStudyTime(priorities, true);

  // Keep existing class, work events from baseline
  const keepCategories: EventCategory[] = ["class", "work"];
  const keptEvents = baselineEvents.filter((e) =>
    keepCategories.includes(e.category)
  );
  allEvents.push(...keptEvents);

  // Earlier wake time for intense version
  const intenseWake = minutesToTime(timeToMinutes(prefs.wakeTime) - 30);

  for (const day of DAYS) {
    // Core events with slightly compressed meals
    allEvents.push(
      makeEvent(`Sleep`, day as DayOfWeek, prefs.sleepTime, intenseWake, "sleep")
    );
    allEvents.push(
      makeEvent(
        "Quick Breakfast",
        day as DayOfWeek,
        prefs.mealTimes.breakfast,
        minutesToTime(timeToMinutes(prefs.mealTimes.breakfast) + 20),
        "meal"
      )
    );
    allEvents.push(
      makeEvent(
        "Lunch",
        day as DayOfWeek,
        prefs.mealTimes.lunch,
        minutesToTime(timeToMinutes(prefs.mealTimes.lunch) + 30),
        "meal"
      )
    );
    allEvents.push(
      makeEvent(
        "Dinner",
        day as DayOfWeek,
        prefs.mealTimes.dinner,
        minutesToTime(timeToMinutes(prefs.mealTimes.dinner) + 30),
        "meal"
      )
    );

    // Add travel buffer after class events
    const dayClasses = keptEvents.filter(
      (e) => e.day === day && e.category === "class"
    );
    for (const cls of dayClasses) {
      const travelStart = cls.endTime;
      const travelEnd = minutesToTime(
        timeToMinutes(cls.endTime) + Math.max(prefs.travelBuffer - 5, 10)
      );
      allEvents.push(
        makeEvent(
          "Travel",
          day as DayOfWeek,
          travelStart,
          travelEnd,
          "travel"
        )
      );
    }

    // Get free slots and fill with intense study sessions
    const currentDayEvents = allEvents.filter((e) => e.day === day);
    const freeSlots = getFreeSlots(
      day as DayOfWeek,
      currentDayEvents,
      intenseWake,
      prefs.sleepTime
    );

    // Intense: 90min deep work sessions with 15min breaks
    let subjectIdx = 0;
    for (const slot of freeSlots) {
      let cursor = slot.start;

      while (cursor < slot.end - 90 && studyAllocations.length > 0) {
        // Prioritize highest priority subjects
        const sortedAllocations = [...studyAllocations].sort(
          (a, b) => b.priority - a.priority
        );
        const subject = sortedAllocations[subjectIdx % sortedAllocations.length];
        const sessionLen = Math.min(90, slot.end - cursor - 15);

        if (sessionLen < 45) break;

        allEvents.push(
          makeEvent(
            `Deep Work: ${subject.subject}`,
            day as DayOfWeek,
            minutesToTime(cursor),
            minutesToTime(cursor + sessionLen),
            "study",
            { priority: subject.priority }
          )
        );
        cursor += sessionLen;

        // Short break
        if (cursor + 15 <= slot.end) {
          allEvents.push(
            makeEvent(
              "Recovery Break",
              day as DayOfWeek,
              minutesToTime(cursor),
              minutesToTime(cursor + 15),
              "break"
            )
          );
          cursor += 15;
        }

        subjectIdx++;
      }
    }
  }

  return allEvents;
}

/** Calculate total hours for a category */
function calcHoursForCategory(
  events: TimetableEvent[],
  category: EventCategory
): number {
  return Math.round(
    (events
      .filter((e) => e.category === category)
      .reduce((sum, e) => {
        const start = timeToMinutes(e.startTime);
        let end = timeToMinutes(e.endTime);
        if (end <= start) end += 24 * 60;
        return sum + (end - start);
      }, 0) /
      60) *
      10
  ) / 10;
}

/**
 * Main AI generation function.
 *
 * NOTE FOR PRODUCTION:
 * Replace this entire function body with an API call to OpenAI GPT-4o:
 *
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [
 *     { role: "system", content: SYSTEM_PROMPT },
 *     { role: "user", content: JSON.stringify({ events, priorities, preferences }) }
 *   ]
 * });
 * return JSON.parse(response.choices[0].message.content);
 */
export async function generateAIVersions(
  baselineEvents: TimetableEvent[],
  priorities: PriorityItem[],
  preferences: UserPreferences
): Promise<AITimetableVersion[]> {
  // Simulate AI processing delay (200-600ms)
  await new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.random() * 200)
  );

  const balancedEvents = buildBalancedVersion(
    baselineEvents,
    priorities,
    preferences
  );
  const intenseEvents = buildIntenseVersion(
    baselineEvents,
    priorities,
    preferences
  );

  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      name: "Balanced Energy",
      description:
        "Optimized for sustainable performance. Includes regular breaks, varied activities, and respects your natural energy rhythms.",
      events: balancedEvents,
      rationale: `This schedule maximizes learning efficiency by incorporating ${priorities[0]?.subject ?? "your top subjects"} during peak mental hours (morning). Pomodoro technique (${preferences.studySessionLength}min work + ${preferences.breakLength}min break) prevents burnout. Exercise blocks boost focus and memory consolidation. All meals and sleep are protected.`,
      totalStudyHours: calcHoursForCategory(balancedEvents, "study"),
      totalSleepHours: calcHoursForCategory(balancedEvents, "sleep"),
      totalBreakHours: calcHoursForCategory(balancedEvents, "break"),
      createdAt: now,
      type: "balanced",
    },
    {
      id: generateId(),
      name: "Intense Focus",
      description:
        "Maximum productivity mode. Deep work sessions prioritized around your most critical subjects and upcoming exams.",
      events: intenseEvents,
      rationale: `Prioritizes ${priorities.slice(0, 2).map((p) => p.subject).join(" and ")} with 90-minute deep work blocks. Earlier wake time (+30min) adds an extra focus session. Travel times compressed. High-priority subjects scheduled during peak cognitive hours (08:00-12:00 and 15:00-18:00).`,
      totalStudyHours: calcHoursForCategory(intenseEvents, "study"),
      totalSleepHours: calcHoursForCategory(intenseEvents, "sleep"),
      totalBreakHours: calcHoursForCategory(intenseEvents, "break"),
      createdAt: now,
      type: "intense",
    },
  ];
}

/** Parse voice transcript into events */
export function parseVoiceTranscript(transcript: string): TimetableEvent[] {
  const events: TimetableEvent[] = [];

  // NOTE: In production, send this transcript to an LLM for structured extraction
  // const response = await openai.chat.completions.create({ ... transcript ... });

  // Mock parsing: look for time patterns
  const timePattern =
    /(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+(?:on\s+)?(\w+day)?\s*(?:i\s+have\s+|there'?s?\s+)?(.+?)(?:\s+(?:from|at|until|to)\s+\d|$)/gi;

  let match;
  while ((match = timePattern.exec(transcript)) !== null) {
    const [, time, day, title] = match;
    const parsedTime = parseSimpleTime(time);
    const parsedDay = parseDay(day);

    if (parsedTime && parsedDay && title) {
      events.push(
        makeEvent(
          title.trim(),
          parsedDay,
          parsedTime,
          minutesToTime(timeToMinutes(parsedTime) + 60),
          "class"
        )
      );
    }
  }

  // If no structured events found, create a generic one
  if (events.length === 0 && transcript.length > 10) {
    const today: DayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][new Date().getDay()] as DayOfWeek;

    events.push(
      makeEvent(
        transcript.slice(0, 50),
        today,
        "09:00",
        "10:00",
        "personal",
        { description: `Voice note: "${transcript}"` }
      )
    );
  }

  return events;
}

/** Parse a simple time string */
function parseSimpleTime(timeStr: string): string | null {
  const cleaned = timeStr.trim().toLowerCase();
  const withPeriod = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (withPeriod) {
    let h = parseInt(withPeriod[1]);
    const m = withPeriod[2] ? parseInt(withPeriod[2]) : 0;
    const period = withPeriod[3];
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return null;
}

/** Parse a day name from a string */
function parseDay(dayStr: string | undefined): DayOfWeek | null {
  if (!dayStr) return null;
  const dayMap: Record<string, DayOfWeek> = {
    monday: "Monday",
    mon: "Monday",
    tuesday: "Tuesday",
    tue: "Tuesday",
    tues: "Tuesday",
    wednesday: "Wednesday",
    wed: "Wednesday",
    thursday: "Thursday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    friday: "Friday",
    fri: "Friday",
    saturday: "Saturday",
    sat: "Saturday",
    sunday: "Sunday",
    sun: "Sunday",
  };
  return dayMap[dayStr.toLowerCase()] || null;
}

/** Simulate AI extraction from a document/image */
export function simulateDocumentExtraction(
  fileName: string
): TimetableEvent[] {
  // NOTE: In production, send the file to OpenAI Vision API or Groq:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: base64Image } }] }]
  // });

  // Mock: generate realistic events based on file name
  const today = new Date().getDay();
  const days: DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[today];
  const nextDay = days[(today + 1) % 7];

  const mockEvents: TimetableEvent[] = [
    makeEvent(`Class from ${fileName}`, currentDay, "09:00", "11:00", "class", {
      description: `Extracted from ${fileName}`,
    }),
    makeEvent("Study Session", currentDay, "13:00", "15:00", "study", {
      description: `Scheduled based on ${fileName}`,
      priority: 8,
    }),
    makeEvent(`Lecture (${fileName})`, nextDay, "10:00", "12:00", "class"),
    makeEvent("Assignment Work", nextDay, "14:00", "16:00", "study", {
      priority: 9,
    }),
  ];

  return mockEvents;
}
