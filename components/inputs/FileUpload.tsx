// ============================================================
// Forge App - File Upload Component
// ============================================================

"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Table,
  File,
  CheckCircle,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForgeStore } from "@/lib/store";
import { simulateDocumentExtraction } from "@/lib/scheduler";
import { useToast } from "@/components/ui/toast";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const FILE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-6 w-6 text-blue-400" />,
  pdf: <FileText className="h-6 w-6 text-red-400" />,
  excel: <Table className="h-6 w-6 text-green-400" />,
  word: <FileText className="h-6 w-6 text-blue-500" />,
  unknown: <File className="h-6 w-6 text-white/40" />,
};

function getFileType(file: File): string {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("excel") || file.type.includes("spreadsheet")) return "excel";
  if (file.type.includes("word") || file.type.includes("wordprocessing")) return "word";
  return "unknown";
}

interface UploadedFile {
  file: File;
  type: string;
  preview?: string;
  status: "pending" | "processing" | "done" | "error";
  eventsFound?: number;
}

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addEvents, addNotification } = useForgeStore();
  const { toast } = useToast();

  const processFile = useCallback(
    async (uploadedFile: UploadedFile) => {
      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === uploadedFile.file.name
            ? { ...f, status: "processing" as const }
            : f
        )
      );

      // Simulate AI vision/document extraction delay
      // NOTE: Replace with actual OpenAI Vision or document parsing API call
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      const events = simulateDocumentExtraction(uploadedFile.file.name);

      addEvents(events);
      addNotification({
        title: "Document Processed",
        message: `Extracted ${events.length} events from ${uploadedFile.file.name}`,
        type: "success",
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === uploadedFile.file.name
            ? { ...f, status: "done" as const, eventsFound: events.length }
            : f
        )
      );

      toast({
        type: "success",
        title: `${events.length} events extracted!`,
        description: `From ${uploadedFile.file.name}`,
      });
    },
    [addEvents, addNotification, toast]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const validFiles = Array.from(newFiles).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );

      if (validFiles.length === 0) {
        toast({
          type: "error",
          title: "Unsupported file type",
          description: "Please upload images, PDFs, Excel, or Word files.",
        });
        return;
      }

      const uploadedFiles: UploadedFile[] = validFiles.map((file) => {
        const type = getFileType(file);
        const preview =
          type === "image" ? URL.createObjectURL(file) : undefined;
        return { file, type, preview, status: "pending" };
      });

      setFiles((prev) => [...prev, ...uploadedFiles]);

      // Process each file
      uploadedFiles.forEach((f) => processFile(f));
    },
    [processFile, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
              isDragging ? "bg-blue-500/30" : "bg-white/10"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-all",
                isDragging ? "text-blue-400 scale-110" : "text-white/40"
              )}
            />
          </div>
          <div>
            <p className="text-white font-semibold">
              {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-white/50 text-sm mt-1">
              Supports: Images, PDFs, Excel (.xlsx), Word (.docx)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {["📸 Image", "📄 PDF", "📊 Excel", "📝 Word"].map((label) => (
              <span
                key={label}
                className="text-xs text-white/40 border border-white/10 rounded-full px-3 py-1"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Vision note */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
        <p className="text-xs text-blue-300">
          🤖 <strong>AI Vision</strong>: Forge automatically extracts schedule events from uploaded files.{" "}
          <span className="text-blue-300/70">
            (In production: uses OpenAI GPT-4o Vision API for real extraction)
          </span>
        </p>
      </div>

      {/* Uploaded files list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Uploaded Files
            </p>
            {files.map((f, i) => (
              <motion.div
                key={`${f.file.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                {/* File icon / preview */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 shrink-0">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                  ) : (
                    FILE_ICONS[f.type] || FILE_ICONS.unknown
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{f.file.name}</p>
                  <p className="text-xs text-white/40">
                    {(f.file.size / 1024).toFixed(1)} KB · {f.type.toUpperCase()}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {f.status === "processing" && (
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  )}
                  {f.status === "done" && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      {f.eventsFound && (
                        <span className="text-xs text-green-400">+{f.eventsFound}</span>
                      )}
                    </div>
                  )}
                  {f.status === "pending" && (
                    <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                  )}
                </div>

                <button
                  onClick={() => removeFile(f.file.name)}
                  className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
