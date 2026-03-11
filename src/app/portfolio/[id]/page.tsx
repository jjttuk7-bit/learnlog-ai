import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookOpen, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface PortfolioContent {
  portfolio: PortfolioData;
  modules: ModuleSummary[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("id, title, content, is_public, created_at")
    .eq("id", id)
    .single();

  // 404 if not found, errored, or not public
  if (error || !data || !data.is_public) {
    notFound();
  }

  const content = data.content as PortfolioContent;
  const portfolio = content?.portfolio;
  const modules: ModuleSummary[] = content?.modules ?? [];

  if (!portfolio) notFound();

  // Collect all skills from projects
  const allSkills = Array.from(
    new Set(portfolio.projects?.flatMap((p) => p.skills ?? []) ?? [])
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>LearnLog AI 포트폴리오</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{portfolio.title}</h1>
          {portfolio.tagline && (
            <p className="text-slate-400 text-lg leading-relaxed">{portfolio.tagline}</p>
          )}
        </header>

        {/* Intro */}
        {portfolio.intro && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">소개</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{portfolio.intro}</p>
          </section>
        )}

        {/* Modules */}
        {modules.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">학습 모듈</h2>
            <div className="grid grid-cols-1 gap-4">
              {modules.map((mod) => (
                <div
                  key={mod.module_name}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white">{mod.module_name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{mod.period}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-bold">{mod.growth_score}</span>
                      <span className="text-slate-500 text-sm">/10</span>
                    </div>
                  </div>
                  {mod.summary && (
                    <p className="text-sm text-slate-300 leading-relaxed">{mod.summary}</p>
                  )}
                  {mod.key_concepts && mod.key_concepts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mod.key_concepts.map((concept) => (
                        <span
                          key={concept}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">프로젝트</h2>
            <div className="space-y-3">
              {portfolio.projects.map((project, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >
                  <h3 className="font-medium text-white">{project.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{project.description}</p>
                  {project.skills && project.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.outcome && (
                    <p className="mt-2 text-xs text-green-400">결과: {project.outcome}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Growth Story */}
        {portfolio.growth_story && (
          <section className="bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">성장 스토리</h2>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{portfolio.growth_story}</p>
          </section>
        )}

        {/* Conclusion */}
        {portfolio.conclusion && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">마무리</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{portfolio.conclusion}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center space-y-4 pt-4 border-t border-slate-800">
          {allSkills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {allSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-600">
            LearnLog AI로 생성된 포트폴리오 · {new Date(data.created_at).toLocaleDateString("ko-KR")}
          </p>
        </footer>
      </div>
    </div>
  );
}
