// ============================================================
// Forge App - Manual Entry Form
// ============================================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  TimetableEvent,
  DayOfWeek,
  DAYS_OF_WEEK,
  DAY_ABBREVIATIONS,
  EventCategory,
  CATEGORY_COLORS_HEX,
} from "@/types";
import { generateId } from "@/lib/utils";
import { useForgeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

const CATEGORIES: EventCategory[] = [
  "class",
  "study",
  "meal",
  "sleep",
  "travel",
  "exercise",
  "break",
  "work",
  "personal",
];

const CATEGORY_LABELS: Record<EventCategory, string> = {
  class: "📚 Class",
  study: "📖 Study",
  meal: "🍽️ Meal",
  sleep: "😴 Sleep",
  travel: "🚗 Travel",
  exercise: "🏃 Exercise",
  break: "☕ Break",
  work: "💼 Work",
  personal: "🏠 Personal",
};

const defaultForm = {
  title: "",
  startTime: "09:00",
  endTime: "10:00",
  category: "class" as EventCategory,
  days: ["Monday"] as DayOfWeek[],
  location: "",
  description: "",
  priority: 5,
  isAllDay: false,
};

export function ManualEntry() {
  const [form, setForm] = useState({ ...defaultForm });
  const [isAllDay, setIsAllDay] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addEvents, addNotification } = useForgeStore();
  const { toast } = useToast();

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast({ type: "error", title: "Title required", description: "Please enter an event title." });
      return;
    }
    if (form.days.length === 0) {
      toast({ type: "error", title: "Day required", description: "Please select at least one day." });
      return;
    }

    const events: TimetableEvent[] = form.days.map((day) => ({
      id: generateId(),
      title: form.title.trim(),
      day,
      startTime: isAllDay ? "00:00" : form.startTime,
      endTime: isAllDay ? "23:59" : form.endTime,
      category: form.category,
      location: form.location || undefined,
      description: form.description || undefined,
      priority: form.priority,
      isAllDay,
    }));

    addEvents(events);
    addNotification({
      title: "Events Added",
      message: `"${form.title}" added for ${form.days.join(", ")}`,
      type: "success",
    });

    toast({
      type: "success",
      title: `${events.length} event(s) added!`,
      description: `"${form.title}" on ${form.days.join(", ")}`,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setForm({ ...defaultForm });
      setIsAllDay(false);
    }, 2000);
  };

  // Copy Monday's events to other days
  const copyMondayToWeekdays = () => {
    setForm((prev) => ({
      ...prev,
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    }));
    toast({ type: "info", title: "All weekdays selected" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="event-title">Event Title *</Label>
        <Input
          id="event-title"
          placeholder="e.g., Calculus Lecture, Study Session"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="bg-white/5"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat }))}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left border",
                form.category === cat
                  ? "border-transparent text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              )}
              style={
                form.category === cat
                  ? {
                      backgroundColor: `${CATEGORY_COLORS_HEX[cat]}30`,
                      borderColor: `${CATEGORY_COLORS_HEX[cat]}50`,
                      color: CATEGORY_COLORS_HEX[cat],
                    }
                  : undefined
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">All Day</p>
          <p className="text-xs text-white/40">Event spans the entire day</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAllDay(!isAllDay)}
          className={cn(
            "relative w-12 h-6 rounded-full transition-all duration-300",
            isAllDay ? "bg-blue-500" : "bg-white/20"
          )}
        >
          <div
            className={cn(
              "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300",
              isAllDay ? "left-7" : "left-1"
            )}
          />
        </button>
      </div>

      {/* Time pickers */}
      {!isAllDay && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start-time">Start Time</Label>
            <input
              id="start-time"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="w-full h-10 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-time">End Time</Label>
            <input
              id="end-time"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="w-full h-10 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Day selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Days *</Label>
          <button
            type="button"
            onClick={copyMondayToWeekdays}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Copy className="h-3 w-3" /> Copy to Weekdays
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200",
                form.days.includes(day)
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
              )}
            >
              {DAY_ABBREVIATIONS[day]}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          placeholder="e.g., Room 201, Library"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className="bg-white/5"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Priority</Label>
          <span className="text-sm font-bold text-blue-400">{form.priority}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant={success ? "success" : "gradient"}
        className="w-full h-12 text-base font-semibold"
        disabled={success}
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.span
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5" /> Events Added!
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add to Calendar ({form.days.length} day{form.days.length !== 1 ? "s" : ""})
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}
