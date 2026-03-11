export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LearnLog AI</h1>
        <p className="text-slate-400 mt-1">AI 메타인지 학습 코칭 대시보드</p>
      </div>
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-sm text-slate-400">현재 위치</div>
        <div className="text-3xl font-bold mt-1">Day 1 <span className="text-lg text-slate-400">/ 119</span></div>
        <div className="text-blue-400 mt-2">아이펠 적응</div>
      </div>
    </div>
  );
}
