// ============================================================
// Forge App - Focus Mode Overlay
// ============================================================

"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForgeStore } from "@/lib/store";
import { formatTime12h } from "@/lib/utils";
import { getEventsForDay } from "@/lib/utils";

export function FocusMode() {
  const { focusModeActive, setFocusMode, getActiveEvents, currentDay } = useForgeStore();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const events = getActiveEvents();
  const todayEvents = getEventsForDay(events, currentDay);

  // Find current and next event
  const now = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;

  const currentEvent = todayEvents.find(
    (e) => e.startTime <= now && e.endTime > now
  );

  const nextEvent = todayEvents.find((e) => e.startTime > now);

  return (
    <AnimatePresence>
      {focusModeActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 p-8"
        >
          {/* Close button */}
          <button
            onClick={() => setFocusMode(false)}
            className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Focus Mode badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Focus Mode Active
          </div>

          {/* Clock */}
          <div className="text-center">
            <p className="text-8xl font-bold text-white tracking-tight font-mono">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).split(" ")[0]}
            </p>
            <p className="text-xl text-white/40 mt-1">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Current event */}
          {currentEvent ? (
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Now</p>
              <p className="text-2xl font-bold text-white mb-1">{currentEvent.title}</p>
              <p className="text-white/50">
                {formatTime12h(currentEvent.startTime)} – {formatTime12h(currentEvent.endTime)}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md rounded-2xl border border-white/5 bg-white/5 p-6 text-center">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white/60">Free time — use it wisely ✨</p>
            </div>
          )}

          {/* Next event */}
          {nextEvent && (
            <div className="w-full max-w-md">
              <p className="text-xs text-white/30 mb-2 uppercase tracking-wider text-center">Up Next</p>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-white">{nextEvent.title}</p>
                  <p className="text-xs text-white/40">{formatTime12h(nextEvent.startTime)}</p>
                </div>
              </div>
            </div>
          )}

          {/* DND indicator */}
          <div className="flex items-center gap-3 text-sm text-white/30">
            <WifiOff className="h-4 w-4" />
            <span>Distractions blocked · Social media paused</span>
          </div>

          {/* Exit button */}
          <Button
            variant="outline"
            onClick={() => setFocusMode(false)}
            className="mt-4"
          >
            <X className="h-4 w-4" />
            Exit Focus Mode
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
