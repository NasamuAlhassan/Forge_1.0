// ============================================================
// Forge App - Home Dashboard
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Sparkles,
  Upload,
  Sliders,
  Clock,
  ArrowRight,
  Brain,
  BookOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForgeStore } from "@/lib/store";
import {
  formatTime12h,
  getEventsForDay,
  calculateTotalHours,
} from "@/lib/utils";
import { CATEGORY_COLORS_HEX } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const {
    getActiveEvents,
    currentDay,
    priorities,
    aiVersions,
    activeVersionId,
    onboardingComplete,
    completeOnboarding,
    lastGenerated,
  } = useForgeStore();

  const events = getActiveEvents();
  const todayEvents = getEventsForDay(events, currentDay);
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const currentEvent = todayEvents.find(
    (e) => e.startTime <= currentTime && e.endTime > currentTime
  );
  const nextEvent = todayEvents.find((e) => e.startTime > currentTime);

  const studyEvents = events.filter((e) => e.category === "study");
  const totalStudyHours = calculateTotalHours(studyEvents) / 7;

  const stats = [
    { label: "Events Today", value: todayEvents.length, icon: Calendar, color: "text-blue-400" },
    { label: "Study Hrs/Day", value: `${totalStudyHours.toFixed(1)}h`, icon: BookOpen, color: "text-purple-400" },
    { label: "Priorities Set", value: priorities.length, icon: Sliders, color: "text-orange-400" },
    { label: "AI Versions", value: aiVersions.length, icon: Brain, color: "text-green-400" },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Onboarding banner */}
      {!onboardingComplete && (
        <motion.div variants={item}>
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🔥</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">Welcome to Forge!</h2>
                  <p className="text-sm text-white/60 mt-1">
                    Your intelligent timetable is ready with sample data. Add your own schedule, set priorities, then let AI optimize your week.
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button size="sm" variant="gradient" asChild>
                      <Link href="/inputs">
                        <Upload className="h-4 w-4" /> Add Inputs
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={completeOnboarding}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current/Next event banner */}
      <motion.div variants={item}>
        {currentEvent ? (
          <Card className="border-green-500/30 bg-green-900/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-green-400 font-medium">HAPPENING NOW</p>
                <p className="text-white font-semibold">{currentEvent.title}</p>
                <p className="text-xs text-white/50">Until {formatTime12h(currentEvent.endTime)}</p>
              </div>
              <div
                className="w-1.5 h-10 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS_HEX[currentEvent.category] }}
              />
            </CardContent>
          </Card>
        ) : nextEvent ? (
          <Card className="border-blue-500/20 bg-blue-900/10">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-blue-400 font-medium">UP NEXT</p>
                <p className="text-white font-semibold">{nextEvent.title}</p>
                <p className="text-xs text-white/50">At {formatTime12h(nextEvent.startTime)}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-400" />
              <p className="text-white/60 text-sm">No more events today — great work!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-8 w-8 ${color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* AI Generate CTA */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-purple-500/20">
          <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 p-1">
            <div className="bg-slate-900/80 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white">AI Smart Timetable</h3>
                {activeVersionId && <Badge variant="purple">Active</Badge>}
              </div>
              <p className="text-sm text-white/60 mb-4">
                Let AI analyze your schedule and generate optimized versions with smart study blocks, balanced energy, and respects your priorities.
              </p>
              {lastGenerated && (
                <p className="text-xs text-white/30 mb-3">
                  Last generated: {new Date(lastGenerated).toLocaleString()}
                </p>
              )}
              <Button variant="gradient" className="w-full" asChild>
                <Link href="/ai-generate">
                  <Sparkles className="h-4 w-4" />
                  {aiVersions.length > 0 ? "Regenerate Timetable" : "Generate Smart Timetable"}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's Schedule */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">{currentDay}&apos;s Schedule</h3>
          <Link href="/calendar" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {todayEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-4xl mb-2">📅</p>
                <p className="text-white/60">No events for {currentDay}</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/inputs">Add Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            todayEvents.slice(0, 5).map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS_HEX[event.category] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-white/40">
                    {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS_HEX[event.category]}20`,
                    color: CATEGORY_COLORS_HEX[event.category],
                  }}
                >
                  {event.category}
                </span>
              </motion.div>
            ))
          )}
          {todayEvents.length > 5 && (
            <p className="text-xs text-white/30 text-center pt-1">
              +{todayEvents.length - 5} more events
            </p>
          )}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/calendar", icon: Calendar, label: "View Calendar", color: "from-blue-600/20 to-blue-600/10" },
            { href: "/inputs", icon: Upload, label: "Add Inputs", color: "from-purple-600/20 to-purple-600/10" },
            { href: "/priorities", icon: Sliders, label: "Set Priorities", color: "from-orange-600/20 to-orange-600/10" },
            { href: "/day", icon: Clock, label: "Today Timeline", color: "from-green-600/20 to-green-600/10" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <Card className={`bg-gradient-to-br ${color} cursor-pointer hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-white/60" />
                  <span className="text-sm text-white/80 font-medium">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
