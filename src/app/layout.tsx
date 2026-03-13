import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnLog AI",
  description: "AI 메타인지 학습 코칭 서비스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LearnLog AI",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-[#0a0f1a] text-slate-100 min-h-screen">
        <Sidebar />
        <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
          <div className="sticky top-0 z-40 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/[0.06] lg:hidden">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md gradient-blue flex items-center justify-center text-white font-bold text-[10px]">L</div>
                <span className="text-sm font-bold text-white">LearnLog AI</span>
              </div>
              <NotificationBell />
            </div>
          </div>
          <div className="hidden lg:block fixed top-4 right-4 z-40">
            <NotificationBell />
          </div>
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
        <MobileNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
