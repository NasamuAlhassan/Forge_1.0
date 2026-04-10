// ============================================================
// Forge App - Priority List Component
// ============================================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { GripVertical, Plus, Trash2, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PriorityItem } from "@/types";
import { generateId } from "@/lib/utils";
import { useForgeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

const SUBJECT_COLORS = [
  "#3b82f6", "#a855f7", "#22c55e", "#f59e0b",
  "#f472b6", "#2dd4bf", "#fb923c", "#94a3b8",
];

interface EditingState {
  id: string;
  subject: string;
  reason: string;
}

export function PriorityList() {
  const { priorities, addPriority, updatePriority, deletePriority, reorderPriorities } =
    useForgeStore();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newReason, setNewReason] = useState("");
  const [editing, setEditing] = useState<EditingState | null>(null);

  const handleAdd = () => {
    if (!newSubject.trim()) {
      toast({ type: "error", title: "Subject name required" });
      return;
    }
    const color = SUBJECT_COLORS[priorities.length % SUBJECT_COLORS.length];
    addPriority({
      id: generateId(),
      subject: newSubject.trim(),
      priority: 5,
      reason: newReason || undefined,
      color,
    });
    toast({ type: "success", title: `"${newSubject}" added!` });
    setNewSubject("");
    setNewReason("");
    setShowAdd(false);
  };

  const handleDelete = (id: string, subject: string) => {
    deletePriority(id);
    toast({ type: "info", title: `"${subject}" removed` });
  };

  const handleEditSave = () => {
    if (!editing) return;
    updatePriority(editing.id, {
      subject: editing.subject,
      reason: editing.reason || undefined,
    });
    setEditing(null);
    toast({ type: "success", title: "Subject updated" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">
            Drag to reorder · Higher priority = more study time
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Add new subject form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-blue-300">Add New Subject</h4>
              <Input
                placeholder="Subject name (e.g., Calculus, Physics)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              <Input
                placeholder="Reason (optional — e.g., exam in 2 weeks)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="flex-1">
                  <Check className="h-4 w-4" /> Add Subject
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priority list */}
      {priorities.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-4xl mb-2">📚</p>
          <p className="font-medium">No subjects yet</p>
          <p className="text-sm mt-1">Add subjects to enable smart scheduling</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={priorities}
          onReorder={reorderPriorities}
          className="space-y-2"
        >
          {priorities.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="cursor-grab active:cursor-grabbing"
            >
              <PriorityCard
                item={item}
                index={index}
                editing={editing}
                onEdit={(id) =>
                  setEditing({ id, subject: item.subject, reason: item.reason ?? "" })
                }
                onEditChange={setEditing}
                onEditSave={handleEditSave}
                onEditCancel={() => setEditing(null)}
                onPriorityChange={(id, val) => updatePriority(id, { priority: val })}
                onDelete={() => handleDelete(item.id, item.subject)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Total allocation info */}
      {priorities.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50 mb-2">Weekly study time allocation (estimated)</p>
          <div className="space-y-1.5">
            {priorities.map((p) => {
              const total = priorities.reduce((s, x) => s + x.priority, 0);
              const pct = Math.round((p.priority / total) * 100);
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-20 text-xs text-white/60 truncate">{p.subject}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: p.color ?? "#3b82f6" }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface PriorityCardProps {
  item: PriorityItem;
  index: number;
  editing: EditingState | null;
  onEdit: (id: string) => void;
  onEditChange: (state: EditingState) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onPriorityChange: (id: string, val: number) => void;
  onDelete: () => void;
}

function PriorityCard({
  item,
  index,
  editing,
  onEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
  onPriorityChange,
  onDelete,
}: PriorityCardProps) {
  const isEditing = editing?.id === item.id;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/5 p-4 transition-all duration-200",
        isEditing ? "border-blue-500/40" : "border-white/10 hover:border-white/20"
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editing.subject}
            onChange={(e) => onEditChange({ ...editing, subject: e.target.value })}
            placeholder="Subject name"
            autoFocus
          />
          <Input
            value={editing.reason}
            onChange={(e) => onEditChange({ ...editing, reason: e.target.value })}
            placeholder="Reason (optional)"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave} className="flex-1">
              <Check className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={onEditCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div className="mt-1 text-white/20 hover:text-white/50 transition-colors">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Rank badge */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: item.color ?? "#3b82f6" }}
          >
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{item.subject}</p>
                {item.reason && (
                  <p className="text-xs text-white/40 mt-0.5">{item.reason}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(item.id)}
                  className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Priority slider */}
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={item.priority}
                onChange={(e) => onPriorityChange(item.id, Number(e.target.value))}
                className="flex-1 accent-blue-500"
                style={{ accentColor: item.color }}
              />
              <span
                className="text-sm font-bold min-w-[2ch]"
                style={{ color: item.color ?? "#3b82f6" }}
              >
                {item.priority}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
