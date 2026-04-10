// ============================================================
// Forge App - App Header
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, Focus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForgeStore } from "@/lib/store";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/calendar": "Calendar",
  "/inputs": "Add Inputs",
  "/priorities": "Priorities",
  "/ai-generate": "AI Generate",
  "/day": "Today",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { notifications, focusModeActive, setFocusMode } = useForgeStore();
  const unread = notifications.filter((n) => !n.read).length;
  const title = PAGE_TITLES[pathname] ?? "Forge";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/95 backdrop-blur-md sm:pl-72">
      {/* Mobile logo + title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 sm:hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Flame className="h-4 w-4 text-white" />
          </div>
        </Link>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Focus Mode Toggle */}
        <Button
          variant={focusModeActive ? "success" : "ghost"}
          size="icon-sm"
          onClick={() => setFocusMode(!focusModeActive)}
          title={focusModeActive ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          <Focus className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative" asChild>
          <Link href="/settings">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
