"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, PenLine, Brain, GraduationCap,
  NotebookPen, BookA, Swords, BarChart3, Network,
  BookOpen, Briefcase, Languages, Heart, Users, User, Trash2,
} from "lucide-react";

const navGroups = [
  {
    items: [
      { href: "/", label: "홈", icon: Home },
      { href: "/capture", label: "캡처", icon: PenLine },
      { href: "/tutor", label: "AI 튜터", icon: GraduationCap },
      { href: "/coach", label: "AI 코치", icon: Brain },
    ],
  },
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

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#060b14] border-r border-white/[0.06]">
      {/* Logo with gradient accent */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-sm">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LearnLog AI</h1>
            <p className="text-[10px] text-slate-500 -mt-0.5">AI 메타인지 학습 코칭</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pb-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-3 mb-1.5">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-blue-500/10 text-blue-400 glow-sm-blue"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500" />
                    )}
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </aside>
  );
}
