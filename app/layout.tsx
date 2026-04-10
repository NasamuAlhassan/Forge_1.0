// ============================================================
// Forge App - Root Layout
// ============================================================

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/toast";
import { FocusMode } from "@/components/FocusMode";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Forge — Speak. Scan. Forge Your Day.",
  description:
    "Forge is an AI-powered smart timetable app. Accept voice, images, PDFs, or manual input — then generate optimized weekly schedules that respect your energy and priorities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Forge",
  },
  icons: {
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-white">
        <ToastProvider>
          <PWARegister />
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="sm:pl-64 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto pb-20 sm:pb-4">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* Focus Mode Overlay */}
          <FocusMode />
        </ToastProvider>
      </body>
    </html>
  );
}
