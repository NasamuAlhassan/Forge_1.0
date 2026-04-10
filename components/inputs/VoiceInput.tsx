// ============================================================
// Forge App - Voice Input Component
// ============================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForgeStore } from "@/lib/store";
import { parseVoiceTranscript } from "@/lib/scheduler";
import { useToast } from "@/components/ui/toast";

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    isFinal: boolean;
    0: { transcript: string };
    length: number;
  }[];
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

// Extend window for SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

export function VoiceInput() {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const { addEvents, addNotification } = useForgeStore();
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setState("recording");
      setLiveText("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveText(interim);
      if (final) setTranscript((prev) => prev + " " + final);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setState("error");
      toast({
        type: "error",
        title: "Voice Recognition Error",
        description: `Error: ${event.error}. Try again.`,
      });
    };

    recognition.onend = () => {
      if (state === "recording") {
        setState("processing");
        processTranscript();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState("processing");
    setTimeout(() => processTranscript(), 100);
  };

  const processTranscript = () => {
    const fullText = transcript + " " + liveText;
    if (!fullText.trim() || fullText.trim().length < 5) {
      setState("idle");
      toast({ type: "warning", title: "No speech detected", description: "Please try again." });
      return;
    }

    setState("processing");

    // Parse the transcript
    setTimeout(() => {
      const events = parseVoiceTranscript(fullText.trim());
      if (events.length > 0) {
        addEvents(events);
        addNotification({
          title: "Voice Events Added",
          message: `${events.length} event(s) extracted and added to your calendar`,
          type: "success",
        });
        toast({
          type: "success",
          title: `${events.length} event(s) added!`,
          description: "Your voice input has been parsed and added to the calendar.",
        });
        setState("done");
        setTimeout(() => {
          setState("idle");
          setTranscript("");
          setLiveText("");
        }, 2500);
      } else {
        setState("error");
        toast({ type: "warning", title: "Could not parse events", description: "Try being more specific (e.g., 'Calculus class on Monday at 9am')" });
      }
    }, 800);
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setLiveText("");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <p className="text-white font-medium">Voice not supported</p>
          <p className="text-white/50 text-sm mt-1">
            Your browser does not support speech recognition. Please use Chrome or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Microphone button */}
      <div className="relative">
        {/* Pulse rings when recording */}
        {state === "recording" && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150" />
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-125" style={{ animationDelay: "0.2s" }} />
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "processing" || state === "done"}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
            state === "recording"
              ? "bg-red-500 shadow-red-500/30"
              : state === "done"
              ? "bg-green-500 shadow-green-500/30"
              : state === "error"
              ? "bg-amber-500 shadow-amber-500/30"
              : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30"
          )}
        >
          {state === "processing" ? (
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          ) : state === "done" ? (
            <CheckCircle className="h-10 w-10 text-white" />
          ) : state === "recording" ? (
            <MicOff className="h-10 w-10 text-white" />
          ) : (
            <Mic className="h-10 w-10 text-white" />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          {state === "idle" && (
            <>
              <p className="text-white font-semibold">Tap to Record</p>
              <p className="text-white/50 text-sm mt-1">
                Say your schedule naturally:<br />
                <em>&quot;Physics lecture on Monday at 9am, Calculus study Tuesday at 2pm&quot;</em>
              </p>
            </>
          )}
          {state === "recording" && (
            <>
              <p className="text-red-400 font-semibold animate-pulse">🔴 Listening…</p>
              <p className="text-white/70 text-sm mt-1">Tap the mic again to stop</p>
            </>
          )}
          {state === "processing" && (
            <p className="text-blue-400 font-semibold">⚙️ Processing your schedule…</p>
          )}
          {state === "done" && (
            <p className="text-green-400 font-semibold">✅ Events added to your calendar!</p>
          )}
          {state === "error" && (
            <>
              <p className="text-amber-400 font-semibold">⚠️ Couldn&apos;t parse events</p>
              <Button variant="outline" size="sm" onClick={reset} className="mt-2">
                Try Again
              </Button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Live transcript */}
      {(state === "recording" || transcript) && (
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 min-h-[80px]">
          <p className="text-xs text-white/40 mb-1">Transcript</p>
          <p className="text-sm text-white leading-relaxed">
            {transcript}
            {liveText && (
              <span className="text-white/50 italic"> {liveText}</span>
            )}
          </p>
        </div>
      )}

      {/* Tips */}
      {state === "idle" && (
        <div className="w-full rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/60 mb-2">💡 Tips for best results:</p>
          <ul className="text-xs text-white/40 space-y-1 list-disc list-inside">
            <li>Include day and time: &quot;Monday at 3pm&quot;</li>
            <li>Add event type: &quot;Calculus class&quot; or &quot;study session&quot;</li>
            <li>Speak clearly in a quiet environment</li>
            <li>You can mention multiple events in one recording</li>
          </ul>
        </div>
      )}
    </div>
  );
}
