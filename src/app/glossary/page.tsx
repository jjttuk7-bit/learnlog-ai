"use client";

import { useState, useEffect, useCallback } from "react";
import { BookA, Search, Trash2, MessageSquare, ChevronDown, ChevronUp, BookOpen, Share2 } from "lucide-react";
import { MODULES } from "@/data/curriculum";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { toast } from "sonner";

interface GlossaryTerm {
  id: string;
  term: string;
  module: string | null;
  definition: string;
  related_terms: string[];
  created_at: string;
  updated_at: string;
}

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTerms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (moduleFilter) params.set("module", moduleFilter);
      if (search) params.set("q", search);
      const res = await fetch(`/api/glossary?${params.toString()}`);
      const data = await res.json();
      if (data.terms) setTerms(data.terms);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, search]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => fetchTerms(), 300);
    return () => clearTimeout(timer);
  }, [fetchTerms]);

  function shareTerms() {
    if (terms.length === 0) return;
    const text = terms.map((t) => {
      const modulePart = t.module ? ` [${t.module}]` : "";
      const related = t.related_terms.length > 0 ? `\n  연관: ${t.related_terms.join(", ")}` : "";
      // Strip markdown from definition for clean text
      const cleanDef = t.definition.replace(/[#*`_~]/g, "").replace(/\n{2,}/g, "\n").trim();
      const shortDef = cleanDef.length > 150 ? cleanDef.slice(0, 150) + "..." : cleanDef;
      return `${t.term}${modulePart}\n  ${shortDef}${related}`;
    }).join("\n\n");

    const header = `LearnLog AI 용어 사전 (${terms.length}개 용어)\n${"=".repeat(40)}\n\n`;
    navigator.clipboard.writeText(header + text).then(() => {
      toast.success("용어 목록이 클립보드에 복사되었습니다!");
    }).catch(() => {
      toast.error("복사 실패");
    });
  }

  async function deleteTerm(id: string) {
    try {
      await fetch("/api/glossary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTerms((prev) => prev.filter((t) => t.id !== id));
      toast.success("용어가 삭제되었습니다");
    } catch {
      toast.error("삭제 실패");
    }
  }

  const moduleNames = MODULES.map((m) => m.name);

  // Group terms by module
  const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    const key = term.module || "기타";
    if (!acc[key]) acc[key] = [];
    acc[key].push(term);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookA className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">용어 사전</h1>
        </div>
        <p className="text-slate-400 mt-1">AI 튜터에서 학습한 용어를 모아보고 복습하세요</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="용어 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="">전체 모듈</option>
          {moduleNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>총 <span className="text-amber-400 font-medium">{terms.length}</span>개 용어</span>
        {moduleFilter && <span>필터: <span className="text-blue-400">{moduleFilter}</span></span>}
        {terms.length > 0 && (
          <button
            onClick={shareTerms}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg hover:text-white hover:border-slate-500 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            공유하기
          </button>
        )}
      </div>

      {/* Terms */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">불러오는 중...</div>
      ) : terms.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
            <BookA className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">아직 저장된 용어가 없습니다</p>
            <p className="text-sm text-slate-400">
              AI 튜터의 용어 코칭 모드에서 용어를 질문해보세요!
            </p>
          </div>
          <Link
            href="/tutor?mode=glossary"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm hover:bg-amber-500/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            용어 코칭 시작하기
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([moduleName, moduleTerms]) => (
            <div key={moduleName} className="space-y-2">
              {!moduleFilter && (
                <h2 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {moduleName}
                  <span className="text-slate-500 font-normal">({moduleTerms.length})</span>
                </h2>
              )}
              <div className="space-y-2">
                {moduleTerms.map((term) => {
                  const isExpanded = expandedId === term.id;
                  return (
                    <div
                      key={term.id}
                      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : term.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-750 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{term.term}</span>
                            {term.module && !moduleFilter && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">
                                {term.module}
                              </span>
                            )}
                          </div>
                          {!isExpanded && term.related_terms.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {term.related_terms.slice(0, 4).map((rt) => (
                                <span key={rt} className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                                  {rt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-700">
                          <div className="pt-3 prose prose-invert prose-sm max-w-none [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_code]:text-emerald-400 [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5">
                            <ReactMarkdown>{term.definition}</ReactMarkdown>
                          </div>

                          {term.related_terms.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {term.related_terms.map((rt) => (
                                <span key={rt} className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                                  {rt}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-500">
                              {new Date(term.updated_at).toLocaleDateString("ko-KR")} 학습
                            </span>
                            <div className="flex gap-2">
                              <Link
                                href={`/coach/feynman?concept=${encodeURIComponent(term.term)}&module=${encodeURIComponent(term.module || "")}`}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                              >
                                <BookOpen className="w-3 h-3" />
                                파인만으로 설명하기
                              </Link>
                              <Link
                                href={`/tutor?mode=glossary&term=${encodeURIComponent(term.term)}`}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                                다시 대화하기
                              </Link>
                              <button
                                onClick={() => deleteTerm(term.id)}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
