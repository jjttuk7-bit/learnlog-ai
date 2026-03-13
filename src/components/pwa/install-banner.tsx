"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(DISMISS_KEY);
  if (!val) return false;
  const dismissedAt = parseInt(val, 10);
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Already installed or dismissed
    if (isStandalone() || isDismissed()) {
      setDismissed(true);
      return;
    }

    setDismissed(false);

    // iOS: show manual guide
    if (isIOS()) {
      setShowIOSGuide(true);
      return;
    }

    // Android/Chrome: capture beforeinstallprompt
    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSGuide(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  }

  if (dismissed) return null;

  // iOS guide
  if (showIOSGuide) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
          <Share className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-300">앱으로 설치하기</p>
          <p className="text-xs text-slate-400 mt-1">
            Safari 하단의 <span className="inline-flex items-center text-blue-400">
              <Share className="w-3 h-3 mx-0.5" />공유
            </span> 버튼 → <strong>&quot;홈 화면에 추가&quot;</strong>를 눌러주세요
          </p>
        </div>
        <button
          onClick={dismiss}
          className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Android/Chrome install prompt
  if (!deferredPrompt) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
      <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
        <Download className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-300">LearnLog AI 앱 설치</p>
        <p className="text-xs text-slate-400 mt-0.5">홈 화면에 추가하면 더 빠르게 사용할 수 있어요</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
      >
        설치
      </button>
      <button
        onClick={dismiss}
        className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
