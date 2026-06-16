import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Filter, Search, TrendingUp, TrendingDown } from "lucide-react";

const ALL_SESSIONS = [
  { id: "1", date: "2026.06.05", type: "기술 면접", job: "프론트엔드", level: "신입", score: 80, grade: "B+", duration: "24분", questions: 5 },
  { id: "2", date: "2026.06.01", type: "인성 면접", job: "프론트엔드", level: "신입", score: 76, grade: "B", duration: "18분", questions: 5 },
  { id: "3", date: "2026.05.25", type: "직무 면접", job: "풀스택", level: "신입", score: 72, grade: "C+", duration: "26분", questions: 10 },
  { id: "4", date: "2026.05.20", type: "기술 면접", job: "백엔드", level: "신입", score: 70, grade: "C+", duration: "22분", questions: 5 },
  { id: "5", date: "2026.05.15", type: "종합 면접", job: "프론트엔드", level: "신입", score: 67, grade: "C", duration: "31분", questions: 10 },
  { id: "6", date: "2026.05.10", type: "기술 면접", job: "프론트엔드", level: "신입", score: 61, grade: "C", duration: "20분", questions: 5 },
];

const TYPE_OPTIONS = ["전체", "기술 면접", "인성 면접", "직무 면접", "종합 면접"];

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return "text-green-400";
  if (grade.startsWith("B")) return "text-primary";
  return "text-yellow-400";
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");

  const filtered = ALL_SESSIONS.filter(s => {
    const matchType = typeFilter === "전체" || s.type === typeFilter;
    const matchSearch = s.job.includes(search) || s.type.includes(search) || s.date.includes(search);
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">면접 기록</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {ALL_SESSIONS.length}회 면접 시뮬레이션을 진행했습니다</p>
        </div>
        <button
          onClick={() => navigate("/interview/setup")}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-accent transition-colors"
        >
          새 면접 시작
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "총 세션", value: "12회" },
          { label: "평균 점수", value: "74점" },
          { label: "최고 점수", value: "80점" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="날짜, 직무, 유형으로 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1 flex-wrap">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  typeFilter === t ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_80px_80px_40px] gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground">
          <span>날짜 / 유형</span>
          <span>직무</span>
          <span>경력</span>
          <span>시간</span>
          <span>점수</span>
          <span />
        </div>
        <div className="divide-y divide-border">
          {filtered.map((s, i) => {
            const prev = filtered[i + 1];
            const trend = prev ? s.score - prev.score : null;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/history/${s.id}`)}
                className="w-full flex sm:grid sm:grid-cols-[1.5fr_1fr_1fr_80px_80px_40px] gap-4 items-center px-5 py-4 hover:bg-secondary transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{s.type}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.date}</div>
                </div>
                <div className="text-sm text-foreground hidden sm:block">{s.job}</div>
                <div className="text-sm text-muted-foreground hidden sm:block">{s.level}</div>
                <div className="text-sm text-muted-foreground hidden sm:block">{s.duration}</div>
                <div className="ml-auto sm:ml-0 flex items-center gap-2">
                  <div>
                    <span className="text-lg font-bold" style={{ fontFamily: "'DM Mono', monospace", color: "var(--foreground)" }}>{s.score}</span>
                    <span className={`text-xs ml-1 ${gradeColor(s.grade)}`}>{s.grade}</span>
                  </div>
                  {trend !== null && (
                    <div className={`text-xs flex items-center gap-0.5 ${trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                      {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {trend > 0 ? "+" : ""}{trend !== 0 ? trend : ""}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
