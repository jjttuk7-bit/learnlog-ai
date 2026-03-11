"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ModuleCard } from "./module-card";
import { GrowthChart } from "./growth-chart";
import { Edit2, Save, Share2, Download, Globe, Lock } from "lucide-react";

interface ModuleSummary {
  module_name: string;
  period: string;
  key_concepts: string[];
  achievements: string[];
  growth_score: number;
  summary: string;
}

interface ProjectItem {
  name: string;
  description: string;
  skills: string[];
  outcome: string;
}

interface PortfolioData {
  title: string;
  intro: string;
  tagline: string;
  projects: ProjectItem[];
  growth_story: string;
  conclusion: string;
  total_growth_score: number;
}

interface BuilderProps {
  portfolio: PortfolioData;
  modules: ModuleSummary[];
  portfolioId: string;
  isPublic: boolean;
  onSave: (updated: PortfolioData) => void;
  onTogglePublic: (isPublic: boolean) => void;
}

export function PortfolioBuilder({ portfolio, modules, portfolioId, isPublic, onSave, onTogglePublic }: BuilderProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<PortfolioData>(portfolio);

  function handleSave() {
    onSave(draft);
    setEditing(null);
    toast.success("포트폴리오가 저장되었습니다.");
  }

  function handleShareUrl() {
    const url = `${window.location.origin}/portfolio/${portfolioId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("공유 링크가 클립보드에 복사되었습니다.");
    });
  }

  function handleDownloadPDF() {
    window.print();
  }

  async function handleTogglePublic() {
    const next = !isPublic;
    onTogglePublic(next);
    if (next) {
      toast.success("포트폴리오가 공개로 설정되었습니다.");
    } else {
      toast.success("포트폴리오가 비공개로 변경되었습니다.");
    }
  }

  const isDemo = portfolioId.startsWith("demo-");

  return (
    <div id="portfolio-print-area" className="space-y-8">
      {/* Action bar — hidden during print */}
      <div className="flex items-center justify-between gap-4 print-hide">
        <div className="flex-1 min-w-0">
          {editing === "title" ? (
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="text-2xl font-bold bg-slate-800 border-slate-600 text-white"
              onBlur={() => setEditing(null)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-2xl font-bold text-white truncate">{draft.title}</h2>
              <button
                onClick={() => setEditing("title")}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
          <p className="text-slate-400 text-sm mt-1">{draft.tagline}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Public / private toggle — only for saved portfolios */}
          {!isDemo && (
            <Button
              size="sm"
              variant="outline"
              className={
                isPublic
                  ? "border-green-600 text-green-400 hover:text-green-300"
                  : "border-slate-600 text-slate-300 hover:text-white"
              }
              onClick={handleTogglePublic}
              title={isPublic ? "공개 중 — 클릭하면 비공개로 전환" : "비공개 — 클릭하면 공개로 전환"}
            >
              {isPublic ? <Globe className="w-4 h-4 mr-1.5" /> : <Lock className="w-4 h-4 mr-1.5" />}
              {isPublic ? "공개" : "비공개"}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white"
            onClick={handleShareUrl}
            disabled={isDemo}
            title={isDemo ? "포트폴리오를 먼저 저장하세요" : "공유 링크 복사"}
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            공유
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>

          <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-1.5" />
            저장
          </Button>
        </div>
      </div>

      {/* Portfolio title shown during print */}
      <div className="hidden print:block space-y-1">
        <h1 className="text-3xl font-bold">{draft.title}</h1>
        <p className="text-slate-500 text-sm">{draft.tagline}</p>
      </div>

      <Section
        label="소개"
        field="intro"
        value={draft.intro}
        editing={editing}
        onEdit={setEditing}
        onChange={(v) => setDraft({ ...draft, intro: v })}
      />

      <div>
        <h3 className="text-base font-semibold text-white mb-4">모듈별 학습 내용</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.module_name} {...mod} />
          ))}
        </div>
      </div>

      <GrowthChart data={modules} />

      {draft.projects && draft.projects.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-4">프로젝트</h3>
          <div className="space-y-3">
            {draft.projects.map((project, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{project.name}</h4>
                    <p className="text-sm text-slate-300 mt-1">{project.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {project.outcome && (
                  <p className="mt-2 text-xs text-green-400">결과: {project.outcome}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Section
        label="성장 스토리"
        field="growth_story"
        value={draft.growth_story}
        editing={editing}
        onEdit={setEditing}
        onChange={(v) => setDraft({ ...draft, growth_story: v })}
      />

      <Section
        label="마무리"
        field="conclusion"
        value={draft.conclusion}
        editing={editing}
        onEdit={setEditing}
        onChange={(v) => setDraft({ ...draft, conclusion: v })}
      />

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-slate-500 pt-8 border-t border-slate-200">
        LearnLog AI로 생성된 포트폴리오
      </div>
    </div>
  );
}

interface SectionProps {
  label: string;
  field: string;
  value: string;
  editing: string | null;
  onEdit: (field: string) => void;
  onChange: (value: string) => void;
}

function Section({ label, field, value, editing, onEdit, onChange }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 group">
        <h3 className="text-base font-semibold text-white">{label}</h3>
        {editing !== field && (
          <button
            onClick={() => onEdit(field)}
            className="opacity-0 group-hover:opacity-100 transition-opacity print-hide"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {editing === field ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-800 border-slate-600 text-white min-h-[100px] resize-none"
          onBlur={() => onEdit("")}
          autoFocus
        />
      ) : (
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}
