"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Loader2, RotateCcw } from "lucide-react";

interface QuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Props {
  sessionId: string;
  topic: string;
  onClose: () => void;
}

export function QuizModal({ sessionId, topic, onClose }: Props) {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Generate quiz on mount
  useState(() => {
    async function generate() {
      try {
        const res = await fetch("/api/tutor/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.quiz?.length) {
          setQuiz(data.quiz);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    generate();
  });

  function handleSelect(optionIndex: number) {
    if (selected !== null) return; // already answered
    setSelected(optionIndex);
    setAnswered((a) => a + 1);
    if (optionIndex === quiz[currentIndex].answer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  }

  function handleRetry() {
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered(0);
  }

  const current = quiz[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-white">복습 퀴즈</h3>
            <p className="text-xs text-slate-500">{topic}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="text-sm text-slate-400">퀴즈 생성 중...</p>
            </div>
          ) : quiz.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              퀴즈를 생성하지 못했습니다. 대화 내용이 충분하지 않을 수 있습니다.
            </div>
          ) : showResult ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-emerald-400">
                  {Math.round((score / quiz.length) * 100)}%
                </span>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">
                  {quiz.length}문제 중 {score}문제 정답!
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {score === quiz.length
                    ? "완벽합니다! 개념을 잘 이해하고 계세요."
                    : score >= quiz.length * 0.6
                    ? "잘하고 계세요! 틀린 부분만 다시 확인해보세요."
                    : "다시 한번 대화 내용을 복습해보세요!"}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  다시 풀기
                </button>
                <button
                  onClick={onClose}
                  className="text-sm px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{currentIndex + 1} / {quiz.length}</span>
                <span>정답: {score}/{answered}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <p className="text-white font-medium">{current.question}</p>

              {/* Options */}
              <div className="space-y-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === current.answer;
                  const showFeedback = selected !== null;

                  let optClass = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500";
                  if (showFeedback) {
                    if (isCorrect) {
                      optClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                    } else if (isSelected && !isCorrect) {
                      optClass = "bg-red-500/10 border-red-500/30 text-red-400";
                    } else {
                      optClass = "bg-slate-800/50 border-slate-700/50 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors ${optClass}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showFeedback && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {selected !== null && (
                <div className={`p-3 rounded-lg text-sm ${
                  selected === current.answer
                    ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/5 border border-red-500/20 text-red-300"
                }`}>
                  <p className="font-medium mb-1">
                    {selected === current.answer ? "정답입니다!" : "틀렸습니다."}
                  </p>
                  <p className="text-slate-400">{current.explanation}</p>
                </div>
              )}

              {/* Next button */}
              {selected !== null && (
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {currentIndex < quiz.length - 1 ? "다음 문제" : "결과 보기"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
