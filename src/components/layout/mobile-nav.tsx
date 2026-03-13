"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, PenLine, Brain, GraduationCap, Menu,
  NotebookPen, BookA, Swords, BarChart3, Network,
  BookOpen, Briefcase, Languages, Heart, Users, User, Trash2, X,
} from "lucide-react";

const mainTabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/capture", label: "캡처", icon: PenLine },
  { href: "/tutor", label: "AI 튜터", icon: GraduationCap },
  { href: "/coach", label: "AI 코치", icon: Brain },
];

const moreGroups = [
  {
    label: "학습 기록",
    items: [
      { href: "/diary", label: "학습 일기", icon: NotebookPen },
      { href: "/glossary", label: "용어 사전", icon: BookA },
      { href: "/quest", label: "퀘스트", icon: Swords },
    ],
  },
  {
    label: "분석",
    items: [
      { href: "/progress", label: "진도", icon: BarChart3 },
      { href: "/graph", label: "지식 그래프", icon: Network },
      { href: "/portfolio", label: "포트폴리오", icon: BookOpen },
    ],
  },
  {
    label: "확장",
    items: [
      { href: "/business", label: "비즈니스", icon: Briefcase },
      { href: "/english", label: "English Prep", icon: Languages },
      { href: "/mindcare", label: "멘탈 케어", icon: Heart },
    ],
  },
  {
    label: "소셜",
    items: [
      { href: "/team", label: "팀", icon: Users },
      { href: "/community", label: "커뮤니티", icon: Users },
    ],
  },
  {
    label: "기타",
    items: [
      { href: "/my", label: "마이페이지", icon: User },
      { href: "/trash", label: "휴지통", icon: Trash2 },
    ],
  },
];

const allMoreHrefs = moreGroups.flatMap((g) => g.items.map((i) => i.href));

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const isMoreActive = allMoreHrefs.some((href) => isActive(href));

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#060b14]/90 backdrop-blur-xl border-t border-white/[0.06] z-50">
        <div className="flex justify-around items-center h-16 px-1">
          {mainTabs.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 ${
                  active ? "text-blue-400" : "text-slate-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
                {/* Active dot indicator */}
                {active && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setOpen(true)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 ${
              isMoreActive ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">더보기</span>
            {isMoreActive && (
              <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0f1a] border-t border-white/[0.08] rounded-t-2xl max-h-[75vh] overflow-y-auto animate-slide-up">
            {/* Handle + Header */}
            <div className="sticky top-0 bg-[#0a0f1a] pt-3 pb-2 px-5 border-b border-white/[0.06] z-10">
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">더보기</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Menu Groups */}
            <div className="px-5 py-4 space-y-5 pb-8">
              {moreGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
                          isActive(item.href)
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 glow-sm-blue"
                            : "bg-white/[0.02] text-slate-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
