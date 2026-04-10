// ============================================================
// Forge App - Weekly Calendar Component
// ============================================================

"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TimetableEvent,
  DayOfWeek,
  DAYS_OF_WEEK,
  DAY_ABBREVIATIONS,
  CATEGORY_COLORS,
  CATEGORY_COLORS_HEX,
  EventCategory,
} from "@/types";
import {
  formatTime12h,
  getEventsForDay,
  getDurationMinutes,
  timeToMinutes,
} from "@/lib/utils";
import { useForgeStore } from "@/lib/store";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am - 11pm
const DAY_START_MIN = 6 * 60; // 6:00 AM
const DAY_END_MIN = 23 * 60; // 11:00 PM
const TOTAL_MINUTES = DAY_END_MIN - DAY_START_MIN;

interface EventDialogState {
  event: TimetableEvent | null;
  mode: "view" | "edit";
}

export function WeeklyCalendar() {
  const { getActiveEvents, updateEvent, deleteEvent, setCurrentDay, currentDay, activeVersionId } =
    useForgeStore();

  const events = getActiveEvents();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDay);
  const [dialog, setDialog] = useState<EventDialogState>({ event: null, mode: "view" });
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [editForm, setEditForm] = useState<Partial<TimetableEvent>>({});

  const handleDaySelect = (day: DayOfWeek) => {
    setSelectedDay(day);
    setCurrentDay(day);
  };

  const handleEventClick = (event: TimetableEvent) => {
    setDialog({ event, mode: "view" });
    setEditForm({ ...event });
  };

  const handleEditSave = () => {
    if (dialog.event && editForm) {
      updateEvent(dialog.event.id, editForm);
      setDialog({ event: null, mode: "view" });
    }
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDialog({ event: null, mode: "view" });
  };

  // Calculate event position and height
  const getEventStyle = (event: TimetableEvent) => {
    const startMin = timeToMinutes(event.startTime);
    const duration = getDurationMinutes(event.startTime, event.endTime);
    const top = ((startMin - DAY_START_MIN) / TOTAL_MINUTES) * 100;
    const height = (duration / TOTAL_MINUTES) * 100;
    return { top: `${Math.max(0, top)}%`, height: `${Math.max(1, height)}%` };
  };

  const dayEvents = getEventsForDay(events, selectedDay);

  return (
    <div className="flex flex-col h-full">
      {/* Header with version indicator */}
      {activeVersionId && (
        <div className="px-4 py-2 bg-purple-600/20 border-b border-purple-500/20 text-xs text-purple-300 text-center">
          ✨ Viewing AI-Generated Version
        </div>
      )}

      {/* Day selector tabs */}
      <div className="flex items-center gap-1 px-2 py-3 border-b border-white/10 overflow-x-auto scrollbar-hide">
        {DAYS_OF_WEEK.map((day) => {
          const dayEvs = getEventsForDay(events, day);
          const isSelected = day === selectedDay;
          const isToday = day === currentDay;

          return (
            <button
              key={day}
              onClick={() => handleDaySelect(day)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {DAY_ABBREVIATIONS[day]}
              </span>
              <span className={cn("text-lg font-bold leading-none", isToday && !isSelected && "text-blue-400")}>
                {isToday ? "·" : dayEvs.length}
              </span>
              {/* Event dots */}
              <div className="flex gap-0.5">
                {dayEvs.slice(0, 3).map((e, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full opacity-80"
                    style={{ backgroundColor: CATEGORY_COLORS_HEX[e.category] }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day label */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{selectedDay}</h3>
          <p className="text-xs text-white/40">{dayEvents.length} events</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const idx = DAYS_OF_WEEK.indexOf(selectedDay);
              handleDaySelect(DAYS_OF_WEEK[(idx - 1 + 7) % 7]);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const idx = DAYS_OF_WEEK.indexOf(selectedDay);
              handleDaySelect(DAYS_OF_WEEK[(idx + 1) % 7]);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time grid */}
      <div
        ref={calendarRef}
        className="flex-1 overflow-y-auto relative px-4 pb-4"
        style={{ minHeight: "400px" }}
      >
        <div className="relative" style={{ height: `${HOURS.length * 60}px` }}>
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: `${((hour - 6) * 60 / TOTAL_MINUTES) * HOURS.length * 60}px` }}
            >
              <span className="absolute left-0 -top-2.5 text-[10px] text-white/30 w-10 text-right pr-2">
                {formatTime12h(`${String(hour).padStart(2, "0")}:00`)}
              </span>
            </div>
          ))}

          {/* Events container */}
          <div className="absolute inset-0 ml-12">
            <AnimatePresence>
              {dayEvents.map((event) => {
                const style = getEventStyle(event);
                const duration = getDurationMinutes(event.startTime, event.endTime);
                const isShort = duration < 30;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      ...style,
                      left: 0,
                      right: 0,
                      backgroundColor: `${CATEGORY_COLORS_HEX[event.category]}20`,
                      borderLeft: `3px solid ${CATEGORY_COLORS_HEX[event.category]}`,
                    }}
                    className={cn(
                      "rounded-r-lg px-2 overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-110 hover:z-10 group",
                      draggedEvent === event.id && "opacity-50"
                    )}
                    onClick={() => handleEventClick(event)}
                    draggable
                    onDragStart={() => setDraggedEvent(event.id)}
                    onDragEnd={() => setDraggedEvent(null)}
                  >
                    <div className="h-full flex flex-col justify-start py-1">
                      <p
                        className={cn(
                          "font-semibold text-white leading-tight",
                          isShort ? "text-[10px]" : "text-xs"
                        )}
                      >
                        {event.title}
                      </p>
                      {!isShort && (
                        <p className="text-[10px] text-white/60 mt-0.5">
                          {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                        </p>
                      )}
                    </div>
                    {/* Hover actions */}
                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDialog({ event, mode: "edit" }); setEditForm({ ...event }); }}
                        className="p-0.5 rounded bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                        className="p-0.5 rounded bg-red-500/30 hover:bg-red-500/50 text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Event Detail/Edit Dialog */}
      <AnimatePresence>
        {dialog.event && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDialog({ event: null, mode: "view" })}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {dialog.mode === "view" ? (
                <>
                  <div
                    className="h-1.5 w-16 rounded-full mb-4 mx-auto sm:hidden"
                    style={{ backgroundColor: CATEGORY_COLORS_HEX[dialog.event.category] }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS_HEX[dialog.event.category]}20`,
                          color: CATEGORY_COLORS_HEX[dialog.event.category],
                        }}
                      >
                        {dialog.event.category}
                      </div>
                      <h3 className="text-lg font-bold text-white">{dialog.event.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-white/60 mb-6">
                    <p>📅 {dialog.event.day}</p>
                    <p>🕐 {formatTime12h(dialog.event.startTime)} – {formatTime12h(dialog.event.endTime)}</p>
                    {dialog.event.location && <p>📍 {dialog.event.location}</p>}
                    {dialog.event.description && <p>📝 {dialog.event.description}</p>}
                    {dialog.event.priority && <p>⭐ Priority: {dialog.event.priority}/10</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setDialog({ event: dialog.event, mode: "edit" })}
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => dialog.event && handleDelete(dialog.event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">Edit Event</h3>
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.title ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">Start</label>
                        <input
                          type="time"
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.startTime ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1 block">End</label>
                        <input
                          type="time"
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.endTime ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <select
                      className="w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.category ?? "class"}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as EventCategory }))}
                    >
                      {["class", "study", "meal", "sleep", "travel", "exercise", "break", "work", "personal"].map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setDialog({ event: dialog.event, mode: "view" })}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleEditSave}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
