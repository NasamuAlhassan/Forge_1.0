// ============================================================
// Forge App - Priorities Page
// ============================================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sliders, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PriorityList } from "@/components/priorities/PriorityList";
import { useForgeStore } from "@/lib/store";

export default function PrioritiesPage() {
  const { priorities } = useForgeStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <p className="text-white/60 text-sm">
          Set which subjects matter most. The AI scheduler allocates more study time to higher-priority items.
        </p>
      </div>

      {/* Priority list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-400" />
            <CardTitle>Subject Priorities</CardTitle>
          </div>
          <CardDescription>
            Drag to reorder. Adjust sliders to set importance (1–10).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PriorityList />
        </CardContent>
      </Card>

      {/* Generate CTA */}
      {priorities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-blue-600/10">
            <CardContent className="p-5 flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-purple-400 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-white">Ready to generate?</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {priorities.length} subject{priorities.length !== 1 ? "s" : ""} set. Let AI create your optimized timetable.
                </p>
              </div>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/ai-generate">
                  Generate <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* How it works */}
      <Card className="border-white/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-white/60 mb-3">How Priority Scheduling Works</p>
          <div className="space-y-2 text-xs text-white/40">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold w-5">1.</span>
              <p>Rate each subject 1–10. A 10 means critical — exam coming up, weak area, or high stakes.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold w-5">2.</span>
              <p>The AI allocates study blocks proportionally. Subject with priority 10 gets 2× more time than priority 5.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold w-5">3.</span>
              <p>High-priority subjects are scheduled during your peak energy hours (morning/early afternoon).</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 font-bold w-5">4.</span>
              <p>Drag to reorder — top subjects get first pick of available time slots.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
