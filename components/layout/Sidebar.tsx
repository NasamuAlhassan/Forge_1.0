// ============================================================
// Forge App - Sidebar Navigation (Desktop)
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Upload,
  Sliders,
  Sparkles,
  Settings,
  Clock,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForgeStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/inputs", icon: Upload, label: "Add Inputs" },
  { href: "/priorities", icon: Sliders, label: "Priorities" },
  { href: "/ai-generate", icon: Sparkles, label: "AI Generate" },
  { href: "/day", icon: Clock, label: "Day View" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const preferences = useForgeStore((s) => s.preferences);

  return (
    <aside className="hidden sm:flex flex-col w-64 min-h-screen border-r border-white/10 bg-slate-900/80 backdrop-blur-md fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Forge</h1>
          <p className="text-xs text-white/40">Smart Timetable</p>
        </div>
      </div>

      {/* User greeting */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-white/40">Welcome back,</p>
        <p className="text-sm font-semibold text-white">{preferences.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 transition-all duration-200",
                  isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/70"
                )}
              />
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          Forge v1.0 · Speak. Scan. Forge.
        </p>
      </div>
    </aside>
  );
}
