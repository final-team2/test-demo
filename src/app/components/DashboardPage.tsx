import { useNavigate } from "react-router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { BrainCircuit, TrendingUp, Clock, Target, ChevronRight, Zap } from "lucide-react";

const TREND = [
  { date: "5/10", score: 61 },
  { date: "5/15", score: 67 },
  { date: "5/20", score: 70 },
  { date: "5/25", score: 72 },
  { date: "6/01", score: 76 },
  { date: "6/05", score: 80 },
];

const RADAR_DATA = [
  { subject: "기술 지식", score: 78 },
  { subject: "커뮤니케이션", score: 85 },
  { subject: "문제 해결", score: 72 },
  { subject: "태도·열정", score: 88 },
  { subject: "논리적 사고", score: 76 },
];

const RECENT = [
  { id: "1", date: "2026.06.05", type: "기술 면접", job: "프론트엔드", score: 80, grade: "B+" },
  { id: "2", date: "2026.06.01", type: "인성 면접", job: "프론트엔드", score: 76, grade: "B" },
  { id: "3", date: "2026.05.25", type: "직무 면접", job: "풀스택", score: 72, grade: "C+" },
];

const TIPS = [
  "Virtual DOM과 Fiber 아키텍처의 차이를 정리해보세요",
  "STAR 기법으로 프로젝트 경험 2가지를 미리 스크립트화하세요",
  "필러워드를 줄이려면 답변 전 2초 침묵 후 시작하는 연습을 해보세요",
];

export function DashboardPage() {
  const navigate = useNavigate();

  const latest = TREND[TREND.length - 1].score;
  const prev = TREND[TREND.length - 2].score;
  const diff = latest - prev;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm text-muted-foreground mb-1">안녕하세요 👋</p>
          <h1 className="text-3xl font-bold text-foreground">김지수님의 성장 대시보드</h1>
        </div>
        <button
          onClick={() => navigate("/interview/setup")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-accent transition-colors"
          style={{ boxShadow: "0 0 24px rgba(99,102,241,0.25)" }}
        >
          <Zap className="w-4 h-4" />
          면접 시작
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "최근 점수", value: String(latest), sub: `이전 대비 +${diff}점`, icon: Target, color: "text-primary" },
          { label: "총 세션 수", value: "12", sub: "이번 달 3회", icon: BrainCircuit, color: "text-accent" },
          { label: "평균 점수", value: "74", sub: "전체 기간", icon: TrendingUp, color: "text-green-400" },
          { label: "총 학습 시간", value: "6.4h", sub: "누적 면접 시간", icon: Clock, color: "text-yellow-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">점수 변화 추이</h2>
            <div className="flex items-center gap-1.5 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              +{latest - TREND[0].score}점 성장
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "#8B9CB8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#8B9CB8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0F1529", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}
                labelStyle={{ color: "#E8EAED" }}
                itemStyle={{ color: "#818CF8" }}
              />
              <Line
                type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5}
                dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#818CF8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">현재 역량</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#8B9CB8", fontSize: 9 }} />
              <Radar dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">최근 면접 기록</h2>
            <button onClick={() => navigate("/history")} className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1">
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/history/${s.id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary hover:bg-muted border border-border transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{s.type}</span>
                    <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">{s.job}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{s.score}</div>
                    <div className="text-xs text-primary">{s.grade}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">AI 추천 학습</h2>
          <div className="flex flex-col gap-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary border border-border">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary shrink-0 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {i + 1}
                </div>
                <p className="text-xs text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-xs text-primary font-medium mb-1">다음 목표</div>
            <div className="text-sm text-foreground font-semibold">문제 해결 점수 80점 달성</div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: "72%" }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">현재 72 / 목표 80</div>
          </div>
        </div>
      </div>
    </div>
  );
}
