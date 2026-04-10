// ============================================================
// Forge App - Inputs Page
// ============================================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VoiceInput } from "@/components/inputs/VoiceInput";
import { FileUpload } from "@/components/inputs/FileUpload";
import { ManualEntry } from "@/components/inputs/ManualEntry";

const INPUT_METHODS = [
  {
    id: "voice",
    icon: Mic,
    title: "Voice Input",
    description: "Speak your schedule naturally",
    color: "text-red-400",
    bgColor: "from-red-600/20 to-red-600/10",
    borderColor: "border-red-500/30",
    badge: "🎤",
  },
  {
    id: "file",
    icon: Upload,
    title: "File Upload",
    description: "Scan images, PDFs, Excel, Word",
    color: "text-blue-400",
    bgColor: "from-blue-600/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
    badge: "📄",
  },
  {
    id: "manual",
    icon: PenLine,
    title: "Manual Entry",
    description: "Add events with a form",
    color: "text-purple-400",
    bgColor: "from-purple-600/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
    badge: "✏️",
  },
];

export default function InputsPage() {
  const [activeMethod, setActiveMethod] = useState<string>("voice");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Page description */}
      <div>
        <p className="text-white/60 text-sm">
          Choose how you want to add your schedule. All methods automatically populate your calendar.
        </p>
      </div>

      {/* Method selector cards */}
      <div className="grid grid-cols-3 gap-3">
        {INPUT_METHODS.map(({ id, title, color, bgColor, borderColor, badge }) => (
          <button
            key={id}
            onClick={() => setActiveMethod(id)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 text-center",
              activeMethod === id
                ? `bg-gradient-to-br ${bgColor} ${borderColor}`
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <span className="text-2xl">{badge}</span>
            <span className={cn("text-xs font-semibold", activeMethod === id ? color : "text-white/60")}>
              {title.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Active method content */}
      <AnimatePresence mode="wait">
        {INPUT_METHODS.map(({ id, icon: Icon, title, description, bgColor, borderColor }) => (
          activeMethod === id && (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`bg-gradient-to-br ${bgColor} ${borderColor}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-white/60" />
                    <CardTitle>{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {id === "voice" && <VoiceInput />}
                  {id === "file" && <FileUpload />}
                  {id === "manual" && <ManualEntry />}
                </CardContent>
              </Card>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Tips */}
      <Card className="border-white/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">💡 Pro Tips</p>
          <ul className="text-xs text-white/40 space-y-1.5">
            <li>• <strong className="text-white/60">Voice:</strong> &quot;Physics lecture on Monday at 9am until 11am&quot;</li>
            <li>• <strong className="text-white/60">File:</strong> Upload your timetable screenshot or PDF syllabus</li>
            <li>• <strong className="text-white/60">Manual:</strong> Use &quot;Copy to Weekdays&quot; for recurring events</li>
            <li>• All events are saved automatically and persist across sessions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
