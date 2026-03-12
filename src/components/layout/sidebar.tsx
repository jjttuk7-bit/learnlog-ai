"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Brain, BarChart3, Swords, User, Network, BookOpen, Users, NotebookPen, Trash2 } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/capture", label: "캡처", icon: PenLine },
  { href: "/diary", label: "학습 일기", icon: NotebookPen },
  { href: "/coach", label: "AI 코치", icon: Brain },
  { href: "/progress", label: "진도", icon: BarChart3 },
  { href: "/quest", label: "퀘스트", icon: Swords },
  { href: "/graph", label: "지식 그래프", icon: Network },
  { href: "/portfolio", label: "포트폴리오", icon: BookOpen },
  { href: "/team", label: "팀", icon: Users },
  { href: "/community", label: "커뮤니티", icon: Users },
  { href: "/my", label: "마이", icon: User },
  { href: "/trash", label: "휴지통", icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-950 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">LearnLog AI</h1>
        <p className="text-xs text-slate-400 mt-1">AI 메타인지 학습 코칭</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
