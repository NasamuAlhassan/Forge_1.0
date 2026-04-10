"use client";

import { Bell, Moon, Sun, Download, Timer, Focus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { exportAsDocx, exportAsPdf, exportAsXlsx } from "@/lib/exporters";

export default function SettingsPage() {
  const {
    preferences,
    updatePreferences,
    getActiveEvents,
    addNotification,
    setFocusMode,
    focusModeActive,
  } = useForgeStore();
  const { toast } = useToast();

  const events = getActiveEvents();

  const simulateReminder = () => {
    const mins = preferences.reminderTiming;
    setTimeout(() => {
      addNotification({
        title: "Upcoming Event",
        message: `Reminder (${mins} min): time to prepare for your next session`,
        type: "info",
      });
      toast({ type: "info", title: "Reminder triggered", description: `${mins}-minute reminder simulation` });
    }, 1200);
    toast({ type: "success", title: "Reminder scheduled" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm text-white/70">Reminder timing (minutes)</label>
          <div className="flex gap-2">
            {[10, 20, 30].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={preferences.reminderTiming === m ? "secondary" : "outline"}
                onClick={() => updatePreferences({ reminderTiming: m as 10 | 20 | 30 })}
              >
                <Timer className="h-4 w-4" /> {m}
              </Button>
            ))}
          </div>
          <Button onClick={simulateReminder}>Simulate Reminder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Focus className="h-5 w-5" /> Focus Mode</CardTitle></CardHeader>
        <CardContent>
          <Button variant={focusModeActive ? "success" : "secondary"} onClick={() => setFocusMode(!focusModeActive)}>
            {focusModeActive ? "Disable Focus Mode" : "Enable Focus Mode"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" /> Appearance</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant={preferences.theme === "dark" ? "secondary" : "outline"} onClick={() => updatePreferences({ theme: "dark" })}><Moon className="h-4 w-4" /> Dark</Button>
          <Button variant={preferences.theme === "light" ? "secondary" : "outline"} onClick={() => updatePreferences({ theme: "light" })}><Sun className="h-4 w-4" /> Light</Button>
          <Button variant={preferences.theme === "system" ? "secondary" : "outline"} onClick={() => updatePreferences({ theme: "system" })}>System</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Export Timetable</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => exportAsPdf(events)}>PDF</Button>
          <Button onClick={() => exportAsXlsx(events)} variant="secondary">XLSX</Button>
          <Button onClick={() => exportAsDocx(events)} variant="outline">Word</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <Input
            value={preferences.name}
            onChange={(e) => updatePreferences({ name: e.target.value })}
            placeholder="Your name"
          />
        </CardContent>
      </Card>
    </div>
  );
}
