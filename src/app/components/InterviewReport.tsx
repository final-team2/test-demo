import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import {
  TrendingUp, ChevronDown, ChevronUp,
  RotateCcw, Download, CheckCircle2, AlertCircle, Lightbulb,
  Mic, Eye, MessageSquare, Star, X
} from "lucide-react";
import jsPDF from "jspdf";

interface ScoreBreakdown {
  technical: number;
  logic: number;
  specificity: number;
  depth: number;
  communication: number;
}

interface StarBreakdown {
  S: number;
  T: number;
  A: number;
  R: number;
}

interface QEntry {
  question: string;
  answer: string;
  followupQ?: string;
  followupA?: string;
  scores: ScoreBreakdown;
  star: StarBreakdown;
  wpm: number;
  silenceCount: number;
  isPersonality?: boolean;
}

interface ReportConfig {
  job: string;
  level: string;
  type: string;
  interviewer: string;
  companyType: string;
}

// weighted total from 5 scores
function weightedScore(s: ScoreBreakdown) {
  return Math.round(s.technical * 0.3 + s.logic * 0.2 + s.specificity * 0.2 + s.depth * 0.2 + s.communication * 0.1);
}

function gradeLabel(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "C+";
  return "C";
}

// Mock entries used as fallback
const MOCK_ENTRIES: QEntry[] = [
  {
    question: "React에서 Virtual DOM이 무엇인지, 실제 DOM과의 차이점을 설명해주세요.",
    answer: "Virtual DOM은 실제 DOM의 가벼운 복사본으로, React가 상태 변경 시 먼저 Virtual DOM에 반영하여 이전 상태와 비교(diffing)한 뒤 변경된 부분만 실제 DOM에 적용합니다.",
    followupQ: "Virtual DOM이 항상 성능상 이점을 가져다준다고 할 수 있을까요?",
    followupA: "항상 그렇지는 않습니다. 변경이 거의 없는 단순한 DOM에서는 Virtual DOM 비교 비용이 오히려 오버헤드가 될 수 있습니다.",
    scores: { technical: 78, logic: 80, specificity: 75, depth: 72, communication: 85 },
    star: { S: 80, T: 70, A: 75, R: 65 },
    wpm: 145,
    silenceCount: 1,
  },
  {
    question: "클로저(Closure)란 무엇인지 예시와 함께 설명해주세요.",
    answer: "클로저는 함수가 자신이 선언된 환경의 변수에 접근할 수 있는 함수입니다. counter 함수 내부의 increment 함수는 외부 count 변수에 접근해 값을 유지합니다.",
    followupQ: "클로저를 사용할 때 메모리 누수가 발생할 수 있는 상황은?",
    followupA: "이벤트 리스너에서 클로저로 외부 변수를 참조하면, 이벤트 리스너를 제거하지 않는 경우 GC가 해당 변수를 회수하지 못해 누수가 발생합니다.",
    scores: { technical: 72, logic: 78, specificity: 68, depth: 70, communication: 82 },
    star: { S: 60, T: 65, A: 72, R: 58 },
    wpm: 152,
    silenceCount: 2,
  },
];

const MOCK_CONFIG: ReportConfig = {
  job: "frontend",
  level: "junior",
  type: "technical",
  interviewer: "friendly",
  companyType: "스타트업",
};

const JOB_LABELS: Record<string, string> = {
  frontend: "프론트엔드",
  backend: "백엔드",
  fullstack: "풀스택",
  mobile: "모바일",
  devops: "DevOps",
};

const LEVEL_LABELS: Record<string, string> = {
  junior: "신입",
  mid: "3년 이하",
  senior: "5년 이상",
};

const TYPE_LABELS: Record<string, string> = {
  technical: "기술 면접",
  personality: "인성 면접",
  mixed: "종합 면접",
};

function ScoreCircle({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#6366F1" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function StarBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ScoreRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-sm font-medium" style={{ fontFamily: "'DM Mono', monospace", color }}>
          {value}<span className="text-muted-foreground text-xs">/{max}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className="h-2 rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// 실제 서비스에선 서버에 설문 저장. 프로토타입이라 localStorage 사용. SURVEY_EVERY로 주기 조정.
const SURVEY_EVERY = 10;
type SurveyResponse = { date: string; overall: number; quality: number; usability: number; recommend: number; comment: string };

export function InterviewReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { entries?: QEntry[]; config?: ReportConfig } | null;

  const entries: QEntry[] = (state?.entries && state.entries.length > 0) ? state.entries : MOCK_ENTRIES;
  const config: ReportConfig = state?.config ?? MOCK_CONFIG;

  const [openQA, setOpenQA] = useState<number | null>(null);

  // ── 면접 만족도 설문 (10회마다) ──
  const [interviewCount, setInterviewCount] = useState(0);
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [survey, setSurvey] = useState({ overall: 0, quality: 0, usability: 0, recommend: 0, comment: "" });

  useEffect(() => {
    // 실제 면접 완료로 들어온 경우만(딥링크 재방문 중복 카운트 방지)
    if (!state?.entries || state.entries.length === 0) return;
    let count = 0;
    try { count = parseInt(localStorage.getItem("devready_interview_count") ?? "0", 10) || 0; } catch { count = 0; }
    count += 1;
    try { localStorage.setItem("devready_interview_count", String(count)); } catch { /* ignore */ }
    setInterviewCount(count);
    if (count % SURVEY_EVERY === 0) setShowSurveyPrompt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSurvey = () => {
    const resp: SurveyResponse = {
      date: new Date().toISOString().slice(0, 10),
      overall: survey.overall, quality: survey.quality, usability: survey.usability, recommend: survey.recommend, comment: survey.comment,
    };
    try {
      const raw = localStorage.getItem("devready_surveys");
      const arr: SurveyResponse[] = raw ? JSON.parse(raw) : [];
      arr.push(resp);
      localStorage.setItem("devready_surveys", JSON.stringify(arr));
    } catch { /* ignore */ }
    setShowSurvey(false);
    setSurveyDone(true);
    setTimeout(() => setSurveyDone(false), 3000);
  };
  const surveyReady = survey.overall > 0 && survey.quality > 0 && survey.usability > 0 && survey.recommend > 0;

  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + weightedScore(e.scores), 0) / entries.length)
    : 0;

  const avgTechnical = Math.round(entries.reduce((s, e) => s + e.scores.technical, 0) / entries.length);
  const avgLogic = Math.round(entries.reduce((s, e) => s + e.scores.logic, 0) / entries.length);
  const avgSpecificity = Math.round(entries.reduce((s, e) => s + e.scores.specificity, 0) / entries.length);
  const avgDepth = Math.round(entries.reduce((s, e) => s + e.scores.depth, 0) / entries.length);
  const avgCommunication = Math.round(entries.reduce((s, e) => s + e.scores.communication, 0) / entries.length);

  const avgWpm = Math.round(entries.reduce((s, e) => s + e.wpm, 0) / entries.length);

  const radarData = [
    { subject: "기술정확성", score: avgTechnical },
    { subject: "논리구조", score: avgLogic },
    { subject: "구체성", score: avgSpecificity },
    { subject: "심화이해", score: avgDepth },
    { subject: "커뮤니케이션", score: avgCommunication },
  ];

  const barData = [
    { name: "기술", score: avgTechnical },
    { name: "논리", score: avgLogic },
    { name: "구체성", score: avgSpecificity },
    { name: "심화", score: avgDepth },
    { name: "소통", score: avgCommunication },
  ];

  const topEntry = entries.reduce((best, e) => weightedScore(e.scores) > weightedScore(best.scores) ? e : best, entries[0]);
  const worstEntry = entries.reduce((worst, e) => weightedScore(e.scores) < weightedScore(worst.scores) ? e : worst, entries[0]);

  // STAR averages
  const avgStar = {
    S: Math.round(entries.reduce((s, e) => s + e.star.S, 0) / entries.length),
    T: Math.round(entries.reduce((s, e) => s + e.star.T, 0) / entries.length),
    A: Math.round(entries.reduce((s, e) => s + e.star.A, 0) / entries.length),
    R: Math.round(entries.reduce((s, e) => s + e.star.R, 0) / entries.length),
  };

  const weakStarElement = Object.entries(avgStar).sort((a, b) => a[1] - b[1])[0];
  const starGuide: Record<string, string> = {
    S: "상황(Situation): 답변 초반에 배경·맥락을 1~2문장으로 명확히 설정하세요.",
    T: "과제(Task): 자신이 맡은 역할과 목표를 구체적으로 제시하세요.",
    A: "행동(Action): '나는 ~했다'처럼 본인의 구체적 행동 단계를 나열하세요.",
    R: "결과(Result): 수치나 임팩트로 성과를 정량화해서 마무리하세요.",
  };

  function downloadPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    let y = 40;

    doc.setFontSize(18);
    doc.setTextColor(108, 99, 255);
    doc.text("DevReady — 면접 결과 리포트", pw / 2, y, { align: "center" });
    y += 24;

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 140);
    const dateStr = new Date().toLocaleDateString("ko-KR");
    const configStr = `${dateStr} · ${TYPE_LABELS[config.type] ?? config.type} · ${JOB_LABELS[config.job] ?? config.job} · ${LEVEL_LABELS[config.level] ?? config.level}`;
    doc.text(configStr, pw / 2, y, { align: "center" });
    y += 32;

    doc.setFontSize(13);
    doc.setTextColor(50, 50, 70);
    doc.text(`종합 점수: ${avgScore}점  (${gradeLabel(avgScore)}등급)`, 40, y);
    y += 22;

    doc.setFontSize(11);
    doc.text(`기술정확성: ${avgTechnical}/100   논리구조: ${avgLogic}/100   구체성: ${avgSpecificity}/100`, 40, y);
    y += 16;
    doc.text(`심화이해: ${avgDepth}/100   커뮤니케이션: ${avgCommunication}/100`, 40, y);
    y += 28;

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 100);
    doc.text("STAR 구조 분석", 40, y);
    y += 16;
    doc.setFontSize(10);
    doc.text(`S(상황): ${avgStar.S}   T(과제): ${avgStar.T}   A(행동): ${avgStar.A}   R(결과): ${avgStar.R}`, 40, y);
    y += 28;

    entries.forEach((e, i) => {
      if (y > 700) { doc.addPage(); y = 40; }
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 80);
      doc.text(`Q${i + 1}. ${e.question}`, 40, y, { maxWidth: pw - 80 });
      y += 18;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 120);
      const answerLines = doc.splitTextToSize(e.answer || "(답변 없음)", pw - 80);
      doc.text(answerLines, 40, y);
      y += answerLines.length * 13 + 8;
      doc.setTextColor(108, 99, 255);
      doc.text(`점수: ${weightedScore(e.scores)}점  WPM: ${e.wpm}`, 40, y);
      y += 20;
    });

    doc.save("interview_report.pdf");
  }

  const today = new Date().toLocaleDateString("ko-KR");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 설문 감사 토스트 */}
      {surveyDone && (
        <div className="fixed top-6 right-6 z-[100] bg-white border border-green-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />설문에 참여해 주셔서 감사합니다.
        </div>
      )}

      {/* 설문 참여 프롬프트 */}
      {showSurveyPrompt && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">면접을 {interviewCount}회 이용하셨어요!</h3>
            <p className="text-sm text-muted-foreground mb-6">잠깐 설문에 참여해 주시겠어요? 더 나은 서비스를 만드는 데 큰 도움이 됩니다.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowSurveyPrompt(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors">아니오</button>
              <button onClick={() => { setShowSurveyPrompt(false); setShowSurvey(true); }} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">예, 참여할게요</button>
            </div>
          </div>
        </div>
      )}

      {/* 설문 모달 */}
      {showSurvey && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="font-semibold text-foreground">면접 만족도 설문</span>
              <button onClick={() => setShowSurvey(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {([
                ["overall", "전반 만족도"],
                ["quality", "질문 품질"],
                ["usability", "UI 편의성"],
                ["recommend", "추천 의향"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{label}</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setSurvey(s => ({ ...s, [key]: i }))} className="p-0.5" aria-label={`${label} ${i}점`}>
                        <Star className={`w-6 h-6 transition-colors ${i <= (survey as any)[key] ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200 hover:text-yellow-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">자유 의견 (선택)</label>
                <textarea value={survey.comment} onChange={e => setSurvey(s => ({ ...s, comment: e.target.value }))} rows={3}
                  placeholder="개선했으면 하는 점이나 좋았던 점을 남겨주세요." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowSurvey(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors">취소</button>
                <button onClick={submitSurvey} disabled={!surveyReady}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-40">제출</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            {today} · {TYPE_LABELS[config.type] ?? config.type} · {JOB_LABELS[config.job] ?? config.job} · {LEVEL_LABELS[config.level] ?? config.level}
          </div>
          <h1 className="text-3xl font-bold text-foreground">면접 결과 리포트</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-secondary hover:bg-muted text-sm text-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF 저장
          </button>
          <button
            onClick={() => navigate("/interview/setup")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-accent text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            다시 도전
          </button>
        </div>
      </div>

      {/* Overview row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-center text-center">
          <ScoreCircle score={avgScore} />
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{gradeLabel(avgScore)}</div>
            <div className="text-sm text-muted-foreground mt-1">종합 등급</div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-green-400">
            <TrendingUp className="w-4 h-4" />
            총 {entries.length}문항 완료
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground mb-4">역량 레이더</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#8B9CB8", fontSize: 9 }} />
              <Radar name="점수" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground mb-4">항목별 점수</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#8B9CB8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8B9CB8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0F1529", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}
                labelStyle={{ color: "#E8EAED" }}
                itemStyle={{ color: "#818CF8" }}
              />
              <Bar dataKey="score" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-item scoring breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-6">AI 5항목 채점 상세</h2>
        <div className="flex flex-col gap-4">
          <ScoreRow label="기술정확성" value={avgTechnical} max={100} color={avgTechnical >= 80 ? "#34D399" : avgTechnical >= 65 ? "#6366F1" : "#F59E0B"} />
          <ScoreRow label="논리구조" value={avgLogic} max={100} color={avgLogic >= 80 ? "#34D399" : avgLogic >= 65 ? "#6366F1" : "#F59E0B"} />
          <ScoreRow label="구체성" value={avgSpecificity} max={100} color={avgSpecificity >= 80 ? "#34D399" : avgSpecificity >= 65 ? "#6366F1" : "#F59E0B"} />
          <ScoreRow label="심화이해" value={avgDepth} max={100} color={avgDepth >= 80 ? "#34D399" : avgDepth >= 65 ? "#6366F1" : "#F59E0B"} />
          <ScoreRow label="커뮤니케이션" value={avgCommunication} max={100} color={avgCommunication >= 80 ? "#34D399" : avgCommunication >= 65 ? "#6366F1" : "#F59E0B"} />
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          가중치: 기술정확성 30% · 논리구조 20% · 구체성 20% · 심화이해 20% · 커뮤니케이션 10%
        </div>
      </div>

      {/* STAR Analysis */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-2">STAR 구조 분석</h2>
        <p className="text-xs text-muted-foreground mb-6">답변을 S·T·A·R 4요소로 자동 분류한 결과입니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <StarBar label="S — Situation (상황)" value={avgStar.S} color="#6366F1" />
            <StarBar label="T — Task (과제)" value={avgStar.T} color="#3B82F6" />
            <StarBar label="A — Action (행동)" value={avgStar.A} color="#10B981" />
            <StarBar label="R — Result (결과)" value={avgStar.R} color="#F59E0B" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
              <div className="text-xs text-yellow-400 mb-2">개선이 필요한 STAR 요소</div>
              <div className="font-semibold text-foreground mb-2">{weakStarElement[0]} — {weakStarElement[1]}점</div>
              <p className="text-xs text-foreground leading-relaxed">{starGuide[weakStarElement[0]]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-foreground">가장 잘한 답변</h3>
          </div>
          {topEntry && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{topEntry.question}</p>
              <div className="text-2xl font-bold text-green-400 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                {weightedScore(topEntry.scores)}점
              </div>
              <p className="text-xs text-foreground line-clamp-3 leading-relaxed">{topEntry.answer || "(답변 없음)"}</p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">개선이 필요한 답변</h3>
          </div>
          {worstEntry && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{worstEntry.question}</p>
              <div className="text-2xl font-bold text-yellow-400 mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                {weightedScore(worstEntry.scores)}점
              </div>
              <ul className="text-xs text-foreground space-y-1">
                {worstEntry.scores.specificity < 60 && <li>• 구체적인 예시나 수치를 더 활용해보세요</li>}
                {worstEntry.scores.logic < 60 && <li>• 논리적 흐름을 단계별로 구조화해보세요</li>}
                {worstEntry.scores.technical < 60 && <li>• 핵심 기술 개념을 정확하게 정리해보세요</li>}
                {worstEntry.scores.depth < 60 && <li>• 심층적인 이해를 보여주는 내용을 추가해보세요</li>}
                {worstEntry.scores.communication < 60 && <li>• 더 명확하고 간결하게 전달하세요</li>}
                {weightedScore(worstEntry.scores) >= 60 && <li>• STAR 기법으로 답변을 구조화해보세요</li>}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Per-question accordion */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-6">질문별 상세 피드백</h2>
        <div className="flex flex-col gap-3">
          {entries.map((item, i) => {
            const qScore = weightedScore(item.scores);
            return (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary transition-colors"
                  onClick={() => setOpenQA(openQA === i ? null : i)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>Q{i + 1}</span>
                    {item.isPersonality && (
                      <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">인성</span>
                    )}
                    <span className="text-sm text-foreground truncate">{item.question}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span
                      className="text-sm font-medium"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: qScore >= 80 ? "#34D399" : qScore >= 65 ? "#6366F1" : "#F59E0B"
                      }}
                    >
                      {qScore}
                    </span>
                    {openQA === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {openQA === i && (
                  <div className="px-5 pb-5 border-t border-border bg-secondary/50">
                    <div className="pt-4 space-y-4">
                      {/* Answer */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">내 답변</div>
                        <p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg p-3">
                          {item.answer || "(답변 없음)"}
                        </p>
                      </div>

                      {/* 5-item scores */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">AI 채점 (5항목)</div>
                        <div className="grid grid-cols-5 gap-2">
                          {([
                            { key: "technical", label: "기술", max: 30, val: Math.round(item.scores.technical * 0.3) },
                            { key: "logic", label: "논리", max: 20, val: Math.round(item.scores.logic * 0.2) },
                            { key: "specificity", label: "구체성", max: 20, val: Math.round(item.scores.specificity * 0.2) },
                            { key: "depth", label: "심화", max: 20, val: Math.round(item.scores.depth * 0.2) },
                            { key: "communication", label: "소통", max: 10, val: Math.round(item.scores.communication * 0.1) },
                          ] as const).map(({ key, label, max, val }) => (
                            <div key={key} className="rounded-lg bg-card border border-border p-2 text-center">
                              <div className="text-base font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{val}</div>
                              <div className="text-xs text-muted-foreground">/{max}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* STAR per question */}
                      {item.isPersonality && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">STAR 구조 분석</div>
                          <div className="grid grid-cols-4 gap-2">
                            {([
                              { k: "S", label: "상황", color: "#6366F1" },
                              { k: "T", label: "과제", color: "#3B82F6" },
                              { k: "A", label: "행동", color: "#10B981" },
                              { k: "R", label: "결과", color: "#F59E0B" },
                            ] as const).map(({ k, label, color }) => (
                              <div key={k} className="rounded-lg bg-card border border-border p-2 text-center">
                                <div className="text-base font-bold" style={{ fontFamily: "'DM Mono', monospace", color }}>{item.star[k]}</div>
                                <div className="text-xs text-muted-foreground">{k} · {label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* WPM */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>말하기 속도: <span className="text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{item.wpm} wpm</span></span>
                        <span>침묵 구간: <span className="text-foreground">{item.silenceCount}회</span></span>
                      </div>

                      {/* Followup */}
                      {item.followupQ && (
                        <div className="border-t border-border pt-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <MessageSquare className="w-3 h-3" />
                            꼬리질문
                          </div>
                          <p className="text-sm text-yellow-300 mb-3">{item.followupQ}</p>
                          {item.followupA && (
                            <p className="text-sm text-foreground bg-secondary rounded-lg p-3 leading-relaxed">{item.followupA}</p>
                          )}
                        </div>
                      )}

                      {/* AI Feedback */}
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm text-foreground leading-relaxed">
                          {qScore >= 80
                            ? "전반적으로 훌륭한 답변입니다. 핵심 개념을 정확히 파악하고 논리적으로 전달했습니다."
                            : qScore >= 65
                            ? "기본적인 내용은 잘 전달했습니다. 더 구체적인 예시나 심층적인 설명을 추가해보세요."
                            : "핵심 개념에 대한 보강이 필요합니다. 관련 문서나 예제를 통해 학습을 강화해보세요."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">음성 전달력 분석</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "평균 말하기 속도", value: `${avgWpm} wpm`, status: avgWpm >= 120 && avgWpm <= 180 ? "양호" : "조정 필요", color: avgWpm >= 120 && avgWpm <= 180 ? "#34D399" : "#F59E0B" },
              { label: "총 침묵 구간", value: `${entries.reduce((s, e) => s + e.silenceCount, 0)}회`, status: entries.reduce((s, e) => s + e.silenceCount, 0) <= 5 ? "양호" : "개선 필요", color: entries.reduce((s, e) => s + e.silenceCount, 0) <= 5 ? "#34D399" : "#F59E0B" },
              { label: "답변 완성도", value: `${entries.filter(e => e.answer.length > 50).length}/${entries.length}`, status: "문항", color: "#6366F1" },
              { label: "꼬리질문 응답", value: `${entries.filter(e => e.followupA).length}/${entries.filter(e => e.followupQ).length}`, status: "완료", color: "#6366F1" },
            ].map(({ label, value, status, color }) => (
              <div key={label} className="rounded-xl bg-secondary p-3">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="text-base font-medium text-foreground mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
                <div className="text-xs" style={{ color }}>{status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">표정·태도 분석</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "시선 안정성", value: 78, color: "#34D399" },
              { label: "자신감 표정", value: 72, color: "#6366F1" },
              { label: "고개 움직임", value: 84, color: "#34D399" },
              { label: "집중도", value: 80, color: "#34D399" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color }}>{value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary">
                  <div className="h-1.5 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">* 합격 예측이 아닌 전달력 개선을 위한 참고 지표입니다</p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">AI 종합 추천</h3>
            <p className="text-sm text-foreground leading-relaxed">
              {avgScore >= 80
                ? `전반적으로 우수한 면접 수행 능력을 보여주셨습니다. 특히 `
                : `기초적인 역량은 갖추고 있으나 보강이 필요합니다. 특히 `}
              <span className="text-primary">
                {[
                  { label: "기술정확성", val: avgTechnical },
                  { label: "논리구조", val: avgLogic },
                  { label: "구체성", val: avgSpecificity },
                  { label: "심화이해", val: avgDepth },
                ].sort((a, b) => a.val - b.val)[0].label}
              </span>
              {" "}분야를 집중 보강하세요.
              STAR 기법(Situation, Task, Action, Result)을 활용해 경험 기반 답변을 구조화하고,
              핵심 답변에는 수치나 코드 예시를 포함하면 전달력이 크게 향상됩니다.
              다음 세션에서 취약 영역 문제를 집중적으로 연습해보세요.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate("/interview/setup")}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:bg-accent transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          다시 도전하기
        </button>
        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 px-8 py-3 rounded-xl border border-border hover:bg-secondary text-foreground transition-colors"
        >
          면접 기록 보기
        </button>
      </div>
    </div>
  );
}
