"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForgeStore } from "@/lib/store";
import { getEventsForDay, formatTime12h, sortEventsByTime } from "@/lib/utils";
import { CATEGORY_COLORS_HEX } from "@/types";

export default function DayPage() {
  const { currentDay, getActiveEvents } = useForgeStore();
  const events = getActiveEvents();

  const dayEvents = useMemo(
    () => sortEventsByTime(getEventsForDay(events, currentDay)),
    [events, currentDay]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentDay} Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {dayEvents.length === 0 ? (
            <p className="text-white/50">No events scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div key={event.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS_HEX[event.category] }} />
                  <div>
                    <p className="text-white font-medium">{event.title}</p>
                    <p className="text-sm text-white/60">
                      {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)} · {event.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
