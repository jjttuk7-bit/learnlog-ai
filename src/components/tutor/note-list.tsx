"use client";

import { useState } from "react";
import { Search, Tag, ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Session {
  id: string;
  topic: string;
  module: string | null;
  messages: { role: string; content: string }[];
  summary: string | null;
  tags: string[] | null;
  created_at: string;
}

interface Props {
  sessions: Session[];
  onViewSession: (session: Session) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterTopic: string;
  onFilterTopicChange: (t: string) => void;
}

export function NoteList({ sessions, onViewSession, searchQuery, onSearchChange, filterTopic, onFilterTopicChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topics = Array.from(new Set(sessions.map((s) => s.topic)));

  const filtered = sessions.filter((s) => {
    if (filterTopic && s.topic !== filterTopic) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTopic = s.topic.toLowerCase().includes(q);
      const inSummary = s.summary?.toLowerCase().includes(q);
      const inTags = s.tags?.some((t) => t.toLowerCase().includes(q));
      return inTopic || inSummary || inTags;
    }
    return true;
  });

  // Group by topic
  const grouped = new Map<string, Session[]>();
  for (const s of filtered) {
    const list = grouped.get(s.topic) ?? [];
    list.push(s);
    grouped.set(s.topic, list);
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="키워드로 검색..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterTopic}
          onChange={(e) => onFilterTopicChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">전체 토픽</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Sessions */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          {searchQuery || filterTopic ? "검색 결과가 없습니다" : "아직 저장된 학습 노트가 없습니다"}
        </div>
      ) : (
        <div className="space-y-2">
          {Array.from(grouped.entries()).map(([topic, topicSessions]) => (
            <div key={topic} className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 px-1">
                {topic} ({topicSessions.length})
              </div>
              {topicSessions.map((session) => {
                const date = new Date(session.created_at).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const msgCount = session.messages?.length ?? 0;
                const isExpanded = expandedId === session.id;
                const hasSummary = !!session.summary;

                return (
                  <div
                    key={session.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className="w-full text-left p-3.5 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{date}</span>
                              <span className="text-xs text-slate-600">
                                <MessageSquare className="w-3 h-3 inline mr-0.5" />
                                {msgCount}
                              </span>
                              {hasSummary && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                  노트 정리됨
                                </span>
                              )}
                            </div>
                            {session.tags && session.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {session.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
                        {session.summary ? (
                          <div className="mt-3 space-y-3">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 [&_strong]:text-white">
                              <ReactMarkdown>{session.summary}</ReactMarkdown>
                            </div>
                            <button
                              onClick={() => onViewSession(session)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              전체 대화 보기 →
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-slate-500">요약 노트가 없습니다. 대화를 열어 노트를 저장하세요.</p>
                            <button
                              onClick={() => onViewSession(session)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              대화 이어가기 →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
