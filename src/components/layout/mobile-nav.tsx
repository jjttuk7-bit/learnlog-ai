"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Brain, BarChart3, Swords, User, Network, BookOpen, Users, NotebookPen, Trash2 } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/capture", label: "캡처", icon: PenLine },
  { href: "/diary", label: "일기", icon: NotebookPen },
  { href: "/coach", label: "코치", icon: Brain },
  { href: "/progress", label: "진도", icon: BarChart3 },
  { href: "/quest", label: "퀘스트", icon: Swords },
  { href: "/graph", label: "그래프", icon: Network },
  { href: "/portfolio", label: "포트폴리오", icon: BookOpen },
  { href: "/team", label: "팀", icon: Users },
  { href: "/community", label: "커뮤니티", icon: Users },
  { href: "/my", label: "마이", icon: User },
  { href: "/trash", label: "휴지통", icon: Trash2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-blue-400" : "text-slate-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
