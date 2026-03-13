"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  action?: string;
}

const typeStyles: Record<string, string> = {
  reminder: "border-l-amber-400",
  suggestion: "border-l-blue-400",
  tip: "border-l-green-400",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      } catch { /* ignore */ }
    }
    load();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const active = notifications.filter((n) => !dismissed.has(n.id));
  const count = active.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">알림</span>
            <span className="text-xs text-slate-500">{count}개</span>
          </div>

          {active.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              새로운 알림이 없습니다
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {active.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-slate-700/50 border-l-2 ${typeStyles[n.type] || "border-l-slate-500"} hover:bg-slate-750 transition-colors`}
                >
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-sm text-slate-300">{n.message}</p>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-slate-600 hover:text-slate-400 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {n.action && (
                    <Link
                      href={n.action}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1.5"
                    >
                      바로가기 <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
