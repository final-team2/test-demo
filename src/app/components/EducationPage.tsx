import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen, Code2, Server, Brain, Database,
  Network, ChevronRight, Sparkles, Trophy, Clock,
  CheckCircle2, Lock, Play, BarChart3, Terminal, X, RefreshCw
} from "lucide-react";
import { AIRecommendCard } from "./AIRecommendCard";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "algorithm", label: "알고리즘" },
  { id: "cs", label: "CS 기초" },
  { id: "frontend", label: "프론트엔드" },
  { id: "backend", label: "백엔드" },
];

const COURSES = [
  {
    id: 1, category: "algorithm", icon: Code2, color: "#6366F1",
    title: "알고리즘 기초 완성", desc: "정렬·탐색·DP·그래프를 코딩테스트 관점에서 체계적으로",
    progress: 68, total: 42, done: 28, level: "중급", time: "8시간",
  },
  {
    id: 2, category: "cs", icon: Network, color: "#3B82F6",
    title: "네트워크 & HTTP", desc: "OSI 7계층, TCP/IP, HTTP/HTTPS, REST, WebSocket",
    progress: 45, total: 24, done: 11, level: "기초", time: "4시간",
  },
  {
    id: 3, category: "cs", icon: Database, color: "#10B981",
    title: "데이터베이스 핵심", desc: "정규화, 인덱스, 트랜잭션, SQL 최적화",
    progress: 30, total: 20, done: 6, level: "중급", time: "5시간",
  },
  {
    id: 4, category: "frontend", icon: Brain, color: "#F59E0B",
    title: "React & TypeScript 심화", desc: "훅, 상태관리, 성능 최적화, 타입 시스템",
    progress: 80, total: 36, done: 29, level: "심화", time: "10시간",
  },
  {
    id: 5, category: "backend", icon: Server, color: "#EC4899",
    title: "Spring Boot & JPA", desc: "의존성 주입, JPA 연관관계, JWT 인증, API 설계",
    progress: 15, total: 30, done: 5, level: "중급", time: "9시간",
  },
  {
    id: 6, category: "cs", icon: Brain, color: "#8B5CF6",
    title: "운영체제 핵심 개념", desc: "프로세스·스레드, 메모리 관리, 동기화, 데드락",
    progress: 0, total: 18, done: 0, level: "기초", time: "4시간",
  },
];

const WEAK_CONCEPTS = [
  { title: "Virtual DOM & Reconciliation", category: "프론트엔드", wrongRate: 72 },
  { title: "TCP 3-way Handshake", category: "네트워크", wrongRate: 65 },
  { title: "트랜잭션 격리 수준", category: "DB", wrongRate: 58 },
];

const QUIZ_TOPICS = [
  { label: "React Hook 동작 원리", category: "프론트엔드" },
  { label: "정렬 알고리즘 시간복잡도", category: "알고리즘" },
  { label: "HTTP 메서드 차이", category: "네트워크" },
  { label: "자바스크립트 이벤트 루프", category: "프론트엔드" },
  { label: "DB 트랜잭션 격리수준", category: "DB" },
  { label: "프로세스 vs 스레드", category: "OS" },
];

type QuizType = "multiple" | "ox" | "descriptive";
interface Quiz {
  type: QuizType;
  q: string;
  opts?: string[];
  answer: number | string;
  explanation: string;
}

const ALL_QUIZZES: Quiz[] = [
  {
    type: "multiple",
    q: "React에서 useEffect의 두 번째 인자(deps 배열)를 빈 배열로 넣으면 어떻게 동작하나요?",
    opts: ["매 렌더마다 실행", "컴포넌트 마운트 시 1회 실행", "언마운트 시에만 실행", "실행되지 않음"],
    answer: 1,
    explanation: "빈 배열 []을 전달하면 컴포넌트가 마운트될 때 단 한 번만 실행됩니다. componentDidMount와 같은 동작입니다.",
  },
  {
    type: "ox",
    q: "HTTP는 Stateless(무상태) 프로토콜이다.",
    answer: "O",
    explanation: "HTTP는 각 요청이 독립적이며 이전 요청 상태를 저장하지 않는 무상태 프로토콜입니다. 상태 유지를 위해 쿠키·세션·JWT를 사용합니다.",
  },
  {
    type: "multiple",
    q: "자바스크립트 이벤트 루프에서 마이크로태스크 큐가 매크로태스크보다 먼저 처리되는 이유는?",
    opts: ["V8 엔진 설계상 우선순위", "Promise가 더 최신 기술이라서", "콜 스택이 비면 마이크로태스크 큐를 먼저 소진하도록 명세 정의", "브라우저 제조사 임의 결정"],
    answer: 2,
    explanation: "ECMAScript 명세에서 콜 스택이 비면 마이크로태스크 큐를 완전히 소진한 후 렌더링 → 매크로태스크 순서로 진행합니다.",
  },
  {
    type: "ox",
    q: "TCP는 연결을 맺을 때 2-way handshake를 사용한다.",
    answer: "X",
    explanation: "TCP는 3-way handshake(SYN → SYN-ACK → ACK)를 사용합니다. 2-way는 연결의 신뢰성을 보장하지 못합니다.",
  },
  {
    type: "descriptive",
    q: "가상 DOM(Virtual DOM)이 실제 DOM보다 성능상 유리한 이유를 설명하세요.",
    answer: "메모리상의 가상 DOM에서 변경을 먼저 계산(diffing)하고, 실제 변경된 부분만 실제 DOM에 적용(reconciliation)하여 불필요한 리렌더링을 최소화합니다.",
    explanation: "React의 재조정(Reconciliation) 알고리즘은 이전 Virtual DOM 트리와 새 트리를 비교해 최소한의 실제 DOM 조작만 수행합니다.",
  },
  {
    type: "multiple",
    q: "DB에서 REPEATABLE READ 격리 수준이 방지하는 문제는?",
    opts: ["Dirty Read", "Non-Repeatable Read", "Phantom Read", "Lost Update"],
    answer: 1,
    explanation: "REPEATABLE READ는 같은 트랜잭션 내에서 같은 행을 두 번 읽어도 결과가 같도록 보장합니다. Non-Repeatable Read를 방지합니다.",
  },
  {
    type: "ox",
    q: "프로세스는 스레드보다 컨텍스트 스위칭 비용이 더 크다.",
    answer: "O",
    explanation: "프로세스는 독립적인 메모리 공간을 가지므로 컨텍스트 스위칭 시 TLB 플러시, 메모리 매핑 교체 등 비용이 큽니다. 스레드는 같은 주소 공간을 공유해 비용이 작습니다.",
  },
  {
    type: "descriptive",
    q: "REST API에서 PUT과 PATCH의 차이를 설명하세요.",
    answer: "PUT은 리소스 전체를 교체하는 완전 대체(idempotent)이며, PATCH는 리소스의 일부만 수정하는 부분 업데이트입니다.",
    explanation: "PUT 요청 시 전송하지 않은 필드는 null/기본값으로 초기화될 수 있으므로, 부분 수정 시에는 PATCH를 사용하는 것이 적합합니다.",
  },
];

export function EducationPage() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("all");
  const [quizActive, setQuizActive] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | string | null>(null);
  const [descriptiveInput, setDescriptiveInput] = useState("");
  const [weakConcepts, setWeakConcepts] = useState(WEAK_CONCEPTS);

  const QUIZ = ALL_QUIZZES;

  const filtered = cat === "all" ? COURSES : COURSES.filter(c => c.category === cat);

  const goNextQuiz = () => {
    if (quizIdx < QUIZ.length - 1) {
      setQuizIdx(quizIdx + 1);
      setQuizAnswer(null);
      setDescriptiveInput("");
    } else {
      setQuizActive(false);
      setQuizAnswer(null);
      setQuizIdx(0);
      setDescriptiveInput("");
    }
  };

  const handleWrongAnswer = (q: Quiz) => {
    // Add to weak concepts if not already present
    const title = q.q.slice(0, 30) + "...";
    setWeakConcepts(prev => {
      if (prev.some(w => w.title === title)) return prev;
      return [...prev, { title, category: "AI 퀴즈", wrongRate: 80 }];
    });
  };

  if (quizActive) {
    const q = QUIZ[quizIdx];
    const isAnswered = quizAnswer !== null;
    const isCorrect = quizAnswer === q.answer;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">AI 퀴즈</div>
              <div className="flex gap-1">
                {QUIZ.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < quizIdx ? "bg-green-400" : i === quizIdx ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">{quizIdx + 1} / {QUIZ.length}</div>
            </div>
            <button
              onClick={() => { setQuizActive(false); setQuizAnswer(null); setQuizIdx(0); setDescriptiveInput(""); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />종료
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">Claude AI 생성 문제</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                q.type === "ox" ? "bg-blue-50 text-blue-600 border border-blue-200"
                : q.type === "descriptive" ? "bg-purple-50 text-purple-600 border border-purple-200"
                : "bg-indigo-50 text-indigo-600 border border-indigo-200"
              }`}>
                {q.type === "ox" ? "O/X" : q.type === "descriptive" ? "서술형" : "객관식"}
              </span>
            </div>

            <p className="text-foreground mb-6 leading-relaxed">{q.q}</p>

            {/* Multiple choice */}
            {q.type === "multiple" && q.opts && (
              <div className="flex flex-col gap-2.5">
                {q.opts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuizAnswer(i);
                      if (i !== q.answer) handleWrongAnswer(q);
                    }}
                    disabled={isAnswered}
                    className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                      !isAnswered ? "border-border bg-secondary hover:border-primary/40 hover:bg-primary/5 text-foreground"
                      : i === q.answer ? "border-green-400 bg-green-50 text-green-700"
                      : i === quizAnswer ? "border-red-300 bg-red-50 text-red-600"
                      : "border-border bg-secondary text-muted-foreground opacity-60"
                    }`}
                  >
                    <span className="font-medium mr-2">{["①", "②", "③", "④"][i]}</span>{opt}
                  </button>
                ))}
              </div>
            )}

            {/* O/X */}
            {q.type === "ox" && (
              <div className="flex gap-4">
                {["O", "X"].map((ox) => (
                  <button
                    key={ox}
                    onClick={() => {
                      setQuizAnswer(ox);
                      if (ox !== q.answer) handleWrongAnswer(q);
                    }}
                    disabled={isAnswered}
                    className={`flex-1 py-6 rounded-2xl border-2 text-4xl font-bold transition-all ${
                      !isAnswered ? "border-border bg-secondary hover:border-primary/40 text-muted-foreground"
                      : ox === q.answer ? "border-green-400 bg-green-50 text-green-600"
                      : ox === quizAnswer ? "border-red-300 bg-red-50 text-red-500"
                      : "border-border bg-secondary text-muted-foreground opacity-40"
                    }`}
                  >
                    {ox}
                  </button>
                ))}
              </div>
            )}

            {/* Descriptive */}
            {q.type === "descriptive" && (
              <div>
                <textarea
                  value={descriptiveInput}
                  onChange={(e) => setDescriptiveInput(e.target.value)}
                  disabled={isAnswered}
                  placeholder="여기에 답을 작성하세요..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-secondary p-4 text-sm text-foreground resize-none focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground"
                />
                {!isAnswered && (
                  <button
                    onClick={() => setQuizAnswer(descriptiveInput || "(빈 답변)")}
                    className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors"
                  >
                    답변 제출
                  </button>
                )}
              </div>
            )}

            {/* Result */}
            {isAnswered && (
              <div className={`mt-5 p-4 rounded-xl ${
                q.type === "descriptive" ? "bg-blue-50 border border-blue-200"
                : isCorrect ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
              }`}>
                <div className={`font-medium text-sm mb-2 ${
                  q.type === "descriptive" ? "text-blue-700"
                  : isCorrect ? "text-green-700"
                  : "text-red-600"
                }`}>
                  {q.type === "descriptive" ? "📝 모범 답안" : isCorrect ? "✓ 정답!" : "✗ 오답"}
                </div>
                {q.type === "descriptive" && (
                  <p className="text-sm text-blue-800 mb-2 font-medium">{q.answer as string}</p>
                )}
                <p className="text-sm text-foreground">{q.explanation}</p>
              </div>
            )}

            {isAnswered && (
              <button
                onClick={goNextQuiz}
                className="w-full mt-4 py-3 rounded-xl bg-primary text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
              >
                {quizIdx < QUIZ.length - 1 ? "다음 문제 →" : "퀴즈 완료"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">교육 센터</h1>
          <p className="text-sm text-muted-foreground mt-1">취약 개념부터 심화까지, AI가 맞춤 학습 경로를 추천합니다</p>
        </div>
        <button onClick={() => setQuizActive(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-indigo-600 transition-colors text-sm shadow-sm"
          style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}>
          <Sparkles className="w-4 h-4" />AI 퀴즈 시작
        </button>
      </div>

      {/* 기본 베이스 정보 → 레벨테스트 기준 AI 추천 */}
      <AIRecommendCard variant="education" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "학습 완료", value: "79문항", icon: CheckCircle2, color: "text-green-500" },
          { label: "진행 중", value: "3개 강좌", icon: Play, color: "text-primary" },
          { label: "총 학습 시간", value: "12.4h", icon: Clock, color: "text-yellow-500" },
          { label: "퀴즈 정답률", value: "76%", icon: Trophy, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ══════════ 퀴즈칸 ══════════ */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI 퀴즈</h2>
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">오답 분석 기반 약점 공략 · 추천 주제</span>
      </div>

      {/* Weak concepts */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-foreground text-sm">취약 개념 반복 추천</span>
          <span className="text-xs text-muted-foreground">오답 기반 자동 선정</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weakConcepts.map(w => (
            <button key={w.title} onClick={() => setQuizActive(true)} className="text-left p-3 rounded-xl bg-white border border-orange-100 hover:border-orange-300 transition-colors group">
              <div className="text-sm font-medium text-foreground mb-1 line-clamp-1">{w.title}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{w.category}</span>
                <span className="text-xs text-red-500 font-medium">{w.wrongRate}% 오답</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-orange-100">
                <div className="h-1 rounded-full bg-orange-400" style={{ width: `${w.wrongRate}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Quiz topic suggestions */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">오늘의 AI 추천 퀴즈 주제</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUIZ_TOPICS.map(t => (
            <button key={t.label} onClick={() => setQuizActive(true)}
              className="px-3 py-1.5 rounded-full bg-white border border-primary/20 text-sm text-primary hover:bg-primary hover:text-white transition-colors">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ 교육칸 ══════════ */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">교육 · 강의</h2>
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">맞춤 강의와 코딩 테스트로 실력 향상</span>
      </div>

      {/* Coding test entry (부수 기능으로 축소) */}
      <button
        onClick={() => navigate("/education/coding-test")}
        className="inline-flex items-center gap-2 mb-6 px-3.5 py-2 rounded-lg border border-border bg-secondary text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors group"
      >
        <Terminal className="w-4 h-4" />
        코딩 테스트 연습
        <span className="text-xs text-gray-400">부가 기능 · 6문제</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-colors ${cat === c.id ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} onClick={() => navigate(`/education/course/${c.id}`)} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">{c.level}</span>
                {c.progress === 0 && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{c.desc}</p>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{c.done}/{c.total} 완료</span>
                <span className="font-medium text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{c.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.progress}%`, backgroundColor: c.color }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />{c.time}
              </div>
              <span className="text-xs text-primary group-hover:text-indigo-600 flex items-center gap-0.5 font-medium">
                학습하기 <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
