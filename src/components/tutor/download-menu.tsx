"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, File } from "lucide-react";
import { toast } from "sonner";

interface Session {
  topic: string;
  module: string | null;
  messages: { role: string; content: string }[];
  summary: string | null;
  tags: string[] | null;
  created_at: string;
}

interface Props {
  session: Session;
  size?: "sm" | "md";
}

function buildMarkdown(session: Session): string {
  const date = new Date(session.created_at).toLocaleDateString("ko-KR");
  let md = `# ${session.topic}\n\n`;
  md += `> ${date}${session.module ? ` · ${session.module}` : ""}\n\n`;
  if (session.tags?.length) {
    md += `**키워드:** ${session.tags.join(", ")}\n\n`;
  }
  if (session.summary) {
    md += `## 학습 노트\n\n${session.summary}\n\n`;
  }
  md += `## 대화 내용\n\n`;
  for (const msg of session.messages) {
    md += msg.role === "user"
      ? `### 🙋 질문\n${msg.content}\n\n`
      : `### 🎓 답변\n${msg.content}\n\n`;
  }
  return md;
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "-");
}

export function DownloadMenu({ session, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const date = new Date(session.created_at).toLocaleDateString("ko-KR");
  const baseName = `${sanitizeFilename(session.topic)}_${date}`;

  function handleDownloadMd() {
    const md = buildMarkdown(session);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    downloadFile(blob, `${baseName}.md`);
    toast.success("마크다운 파일 다운로드 완료");
    setOpen(false);
  }

  async function handleDownloadDocx() {
    setGenerating(true);
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

      const children: Paragraph[] = [];

      // Title
      children.push(new Paragraph({
        text: session.topic,
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      }));

      // Date & module
      children.push(new Paragraph({
        children: [
          new TextRun({ text: date, color: "888888", size: 20 }),
          ...(session.module ? [new TextRun({ text: ` · ${session.module}`, color: "888888", size: 20 })] : []),
        ],
        spacing: { after: 300 },
      }));

      // Tags
      if (session.tags?.length) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: "키워드: ", bold: true, size: 22 }),
            new TextRun({ text: session.tags.join(", "), size: 22, color: "3b82f6" }),
          ],
          spacing: { after: 300 },
        }));
      }

      // Summary
      if (session.summary) {
        children.push(new Paragraph({
          text: "학습 노트",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }));
        for (const line of session.summary.split("\n")) {
          if (line.trim()) {
            children.push(new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 100 },
            }));
          }
        }
      }

      // Messages
      children.push(new Paragraph({
        text: "대화 내용",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));

      for (const msg of session.messages) {
        const isUser = msg.role === "user";
        children.push(new Paragraph({
          children: [
            new TextRun({
              text: isUser ? "🙋 질문" : "🎓 답변",
              bold: true,
              size: 24,
              color: isUser ? "3b82f6" : "10b981",
            }),
          ],
          spacing: { before: 300, after: 100 },
        }));

        for (const line of msg.content.split("\n")) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { after: 60 },
          }));
        }
      }

      // Footer
      children.push(new Paragraph({
        children: [new TextRun({ text: "LearnLog AI 튜터로 생성된 학습 노트", color: "999999", size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
      }));

      const doc = new Document({
        sections: [{ children }],
      });

      const buffer = await Packer.toBlob(doc);
      downloadFile(buffer, `${baseName}.docx`);
      toast.success("Word 파일 다운로드 완료");
    } catch {
      toast.error("DOCX 생성 실패");
    }
    setGenerating(false);
    setOpen(false);
  }

  const btnClass = size === "sm"
    ? "flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
    : "flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors";

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className={btnClass}>
        <Download className="w-3.5 h-3.5" />
        다운로드
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 w-44 py-1 animate-in fade-in">
          <button
            onClick={handleDownloadMd}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Markdown (.md)
          </button>
          <button
            onClick={handleDownloadDocx}
            disabled={generating}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:text-slate-600"
          >
            <File className="w-4 h-4 text-blue-500" />
            {generating ? "생성 중..." : "Word (.docx)"}
          </button>
        </div>
      )}
    </div>
  );
}
