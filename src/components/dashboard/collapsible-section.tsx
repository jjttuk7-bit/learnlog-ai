"use client";

import { useState, useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

const STORAGE_KEY = "dashboard-sections";

function getSavedState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

function saveState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function CollapsibleSection({ id, title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getSavedState();
    if (id in saved) {
      setIsOpen(saved[id]);
    }
    setMounted(true);
  }, [id]);

  function toggle() {
    const next = !isOpen;
    setIsOpen(next);
    const saved = getSavedState();
    saved[id] = next;
    saveState(saved);
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        {mounted && (
          isOpen
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
