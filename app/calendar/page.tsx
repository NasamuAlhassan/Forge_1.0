// ============================================================
// Forge App - Calendar Page
// ============================================================

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { useForgeStore } from "@/lib/store";

export default function CalendarPage() {
  const { activeVersionId, aiVersions, selectAIVersion } = useForgeStore();
  const [showComparison, setShowComparison] = useState(false);

  const activeVersion = aiVersions.find((v) => v.id === activeVersionId);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap">
        <div className="flex-1 flex items-center gap-2">
          {activeVersionId ? (
            <>
              <Badge variant="purple">AI: {activeVersion?.name ?? "Custom"}</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => selectAIVersion(null)}
                className="text-xs text-white/40"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Back to Baseline
              </Button>
            </>
          ) : (
            <Badge variant="secondary">Baseline Schedule</Badge>
          )}
        </div>

        {aiVersions.length > 0 && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={!showComparison ? "secondary" : "ghost"}
              onClick={() => setShowComparison(false)}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            {aiVersions.length > 1 && (
              <Button
                size="sm"
                variant={showComparison ? "secondary" : "ghost"}
                onClick={() => setShowComparison(true)}
              >
                <Layers className="h-3.5 w-3.5" /> Compare
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Version switcher */}
      {aiVersions.length > 0 && (
        <div className="px-4 py-2 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => selectAIVersion(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !activeVersionId
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Baseline
          </button>
          {aiVersions.map((v) => (
            <button
              key={v.id}
              onClick={() => selectAIVersion(v.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeVersionId === v.id
                  ? "bg-purple-600/40 text-purple-300 border border-purple-500/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              ✨ {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="flex-1 overflow-hidden">
        {showComparison && aiVersions.length >= 2 ? (
          <div className="grid grid-cols-2 gap-0 h-full divide-x divide-white/10">
            {aiVersions.slice(0, 2).map((version) => (
              <div key={version.id} className="flex flex-col overflow-hidden">
                <div className="px-3 py-2 bg-purple-900/20 border-b border-white/5">
                  <p className="text-xs font-semibold text-purple-300">✨ {version.name}</p>
                  <p className="text-[10px] text-white/40">{version.totalStudyHours}h study</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {/* Simple event list for comparison */}
                  <div className="p-2 space-y-1 overflow-y-auto h-full">
                    {version.events.slice(0, 20).map((e) => (
                      <div
                        key={e.id}
                        className="text-[10px] rounded px-2 py-1 text-white/80"
                        style={{ backgroundColor: `${e.category === "study" ? "#a855f7" : e.category === "class" ? "#3b82f6" : "#ffffff"}15` }}
                      >
                        <span className="font-medium">{e.day.slice(0, 3)}</span> {e.startTime} {e.title.slice(0, 25)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <WeeklyCalendar />
        )}
      </div>
    </div>
  );
}
