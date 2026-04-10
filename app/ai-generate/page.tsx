"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForgeStore } from "@/lib/store";
import { generateAIVersions } from "@/lib/scheduler";
import { useToast } from "@/components/ui/toast";

export default function AIGeneratePage() {
  const {
    events,
    priorities,
    preferences,
    aiVersions,
    activeVersionId,
    setAIVersions,
    selectAIVersion,
    setLastGenerated,
    setGenerating,
    isGenerating,
  } = useForgeStore();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setError(null);
    try {
      setGenerating(true);
      const versions = await generateAIVersions(events, priorities, preferences);
      setAIVersions(versions);
      setLastGenerated(new Date().toISOString());
      toast({ type: "success", title: "Generated 2 smart timetable versions" });
    } catch {
      setError("Failed to generate schedule. Please try again.");
      toast({ type: "error", title: "Generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-400" /> Smart Scheduler Agent</CardTitle>
          <CardDescription>Generate exactly two versions: Balanced Energy and Intense Focus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onGenerate} disabled={isGenerating} variant="gradient" className="w-full">
            {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Smart Timetable</>}
          </Button>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {aiVersions.map((v) => (
        <Card key={v.id} className={activeVersionId === v.id ? "border-green-500/40" : "border-white/10"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{v.name}</span>
              {activeVersionId === v.id && <span className="text-xs text-green-400">Active</span>}
            </CardTitle>
            <CardDescription>{v.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-white/70">{v.rationale}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 p-2">Study: <strong>{v.totalStudyHours}h</strong></div>
              <div className="rounded-lg bg-white/5 p-2">Sleep: <strong>{v.totalSleepHours}h</strong></div>
              <div className="rounded-lg bg-white/5 p-2">Breaks: <strong>{v.totalBreakHours}h</strong></div>
            </div>
            <Button
              variant={activeVersionId === v.id ? "success" : "secondary"}
              onClick={() => {
                selectAIVersion(v.id);
                toast({ type: "success", title: `${v.name} activated` });
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              {activeVersionId === v.id ? "Selected" : "Select This Version"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
