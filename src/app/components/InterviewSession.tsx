import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Mic, MicOff, Send, X, Video, VideoOff, Clock,
  ChevronRight, AlertCircle, Square, Sparkles, Activity,
  Eye, Smile, Zap
} from "lucide-react";

// ─── Question banks ───────────────────────────────────────
const Q_BANK: Record<string, Record<string, string[]>> = {
  frontend: {
    newcomer: [
      "HTML5에서 시맨틱 태그가 무엇이고 왜 사용하나요?",
      "CSS Flexbox와 Grid의 차이를 설명해주세요.",
      "JavaScript에서 var, let, const의 차이점은?",
      "이벤트 버블링과 캡처링에 대해 설명해주세요.",
      "REST API와 HTTP 메서드를 설명해주세요.",
    ],
    junior: [
      "React에서 Virtual DOM이 무엇이고, 실제 DOM과의 차이는?",
      "클로저(Closure)란 무엇인지 예시와 함께 설명해주세요.",
      "useState와 useEffect의 동작 원리를 설명해주세요.",
      "웹 성능 최적화 방법을 알고 있는 것 위주로 설명해주세요.",
      "TypeScript를 사용하는 이유와 장점은?",
    ],
    mid: [
      "React 렌더링 최적화 전략(useMemo, useCallback, React.memo)을 설명해주세요.",
      "마이크로 프론트엔드 아키텍처에 대해 설명해주세요.",
      "CSR, SSR, SSG의 차이점과 각 사용 사례를 설명해주세요.",
      "웹 접근성(WCAG) 기준과 적용 경험을 공유해주세요.",
      "대규모 컴포넌트 상태 관리 전략을 설명해주세요.",
    ],
  },
  backend: {
    newcomer: [
      "HTTP와 HTTPS의 차이를 설명해주세요.",
      "데이터베이스에서 트랜잭션이란 무엇인가요?",
      "GET과 POST 요청의 차이점은?",
      "SQL에서 JOIN의 종류와 차이를 설명해주세요.",
      "RESTful API 설계 원칙을 설명해주세요.",
    ],
    junior: [
      "Spring Boot에서 의존성 주입(DI)의 원리를 설명해주세요.",
      "JPA N+1 문제가 무엇이고 해결 방법은?",
      "JWT 인증 방식을 설명하고 장단점을 말씀해주세요.",
      "데이터베이스 인덱스의 원리와 주의사항을 설명해주세요.",
      "캐싱 전략(Redis)을 사용한 경험이 있으신가요?",
    ],
    mid: [
      "마이크로서비스 아키텍처(MSA)의 장단점과 적용 경험을 공유해주세요.",
      "분산 트랜잭션 처리 방법을 설명해주세요.",
      "대용량 트래픽 처리를 위한 아키텍처 설계 경험을 말씀해주세요.",
      "CQRS 패턴에 대해 설명하고 적용 사례를 말씀해주세요.",
      "데이터베이스 샤딩 전략을 설명해주세요.",
    ],
  },
  devops: {
    newcomer: [
      "CI/CD가 무엇인지 설명해주세요.",
      "Docker와 가상 머신(VM)의 차이를 설명해주세요.",
      "Linux 기본 명령어를 설명해주세요.",
      "Git과 GitHub의 차이점은?",
      "로드 밸런서가 무엇인지 설명해주세요.",
    ],
    junior: [
      "Docker Compose를 사용해보셨나요? 경험을 공유해주세요.",
      "Kubernetes의 주요 구성요소(Pod, Service, Deployment)를 설명해주세요.",
      "Jenkins 또는 GitHub Actions를 이용한 CI/CD 파이프라인 구축 경험을 말씀해주세요.",
      "Blue-Green 배포와 Rolling 배포의 차이를 설명해주세요.",
      "모니터링 및 알림 시스템을 구축해본 경험이 있으신가요?",
    ],
    mid: [
      "Kubernetes 클러스터를 운영하면서 겪은 어려움과 해결 방법을 공유해주세요.",
      "Infrastructure as Code(IaC) 경험을 설명해주세요.",
      "서비스 장애 대응 경험과 사후 처리 방법을 말씀해주세요.",
      "멀티 클라우드 또는 하이브리드 클라우드 경험을 공유해주세요.",
      "비용 최적화를 위한 클라우드 아키텍처 개선 경험을 말씀해주세요.",
    ],
  },
  fullstack: {
    newcomer: [
      "프론트엔드와 백엔드의 역할 차이를 설명해주세요.",
      "MVC 패턴이 무엇인지 설명해주세요.",
      "CORS가 무엇이고 어떻게 해결하나요?",
      "세션과 JWT의 차이를 설명해주세요.",
      "기본적인 CRUD API를 설계해본 경험이 있으신가요?",
    ],
    junior: [
      "풀스택 프로젝트에서 가장 어려웠던 부분과 해결 방법을 공유해주세요.",
      "API 설계 시 고려해야 할 사항들을 설명해주세요.",
      "상태 관리를 어떤 방식으로 접근하시나요?",
      "데이터베이스 설계 시 고려하는 사항들을 설명해주세요.",
      "배포 경험과 사용한 인프라에 대해 설명해주세요.",
    ],
    mid: [
      "대규모 서비스에서 프론트엔드와 백엔드 사이의 인터페이스를 어떻게 설계하셨나요?",
      "모노레포(Monorepo) 전략의 장단점을 설명해주세요.",
      "실시간 기능(WebSocket 등) 구현 경험을 공유해주세요.",
      "팀 내 기술 표준화 경험을 말씀해주세요.",
      "기술 부채를 관리한 경험이 있으신가요?",
    ],
  },
  "web-general": {
    newcomer: [
      "웹 브라우저에서 URL을 입력하면 어떤 과정이 일어나나요?",
      "HTTP 상태 코드 200, 404, 500의 의미를 설명해주세요.",
      "쿠키와 세션의 차이를 설명해주세요.",
      "웹 보안의 기본 원칙을 설명해주세요.",
      "반응형 웹 디자인이란 무엇인가요?",
    ],
    junior: [
      "SPA와 MPA의 차이와 각 장단점을 설명해주세요.",
      "웹 성능 지표(Core Web Vitals)에 대해 설명해주세요.",
      "OWASP Top 10 보안 취약점을 알고 계신 것 설명해주세요.",
      "API 버전 관리 전략을 설명해주세요.",
      "웹 접근성(Accessibility)을 위해 고려해야 할 사항들은?",
    ],
    mid: [
      "대규모 웹 서비스 아키텍처를 설계할 때 고려사항을 설명해주세요.",
      "기술 스택 선정 기준을 어떻게 결정하시나요?",
      "레거시 시스템 마이그레이션 경험을 공유해주세요.",
      "팀 기술 표준화 및 코드 품질 관리 방법을 말씀해주세요.",
      "서비스 모니터링 및 장애 대응 경험을 공유해주세요.",
    ],
  },
};

const PERSONALITY_QUESTIONS = [
  "본인의 강점과 약점을 구체적인 사례와 함께 말씀해주세요.",
  "팀 프로젝트에서 의견 충돌이 발생했을 때 어떻게 해결하셨나요?",
  "가장 도전적이었던 프로젝트 경험을 STAR 형식으로 말씀해주세요.",
  "실패한 경험과 그로부터 배운 점을 공유해주세요.",
  "지원 동기와 5년 후 모습을 말씀해주세요.",
];

// Mock followup generation based on answer
function generateFollowup(question: string, answer: string): string {
  if (answer.length < 30) return "답변을 좀 더 구체적으로 설명해주실 수 있나요?";
  if (question.includes("Virtual DOM")) return "그렇다면 Virtual DOM이 항상 성능상 이점을 가져다 준다고 할 수 있을까요?";
  if (question.includes("클로저")) return "클로저를 사용할 때 메모리 누수가 발생할 수 있는 상황을 설명해주실 수 있나요?";
  if (question.includes("인덱스")) return "복합 인덱스 설계 시 컬럼 순서가 왜 중요한가요?";
  if (question.includes("Docker")) return "Docker 컨테이너와 이미지의 차이를 설명해주세요.";
  if (question.includes("강점")) return "그 강점을 실제로 발휘한 구체적인 사례를 들어주실 수 있나요?";
  if (question.includes("충돌") || question.includes("갈등")) return "그 경험에서 배운 점을 현재 협업 방식에 어떻게 적용하고 계신가요?";
  const followups = [
    "방금 말씀하신 내용에서, 구체적인 수치나 성과가 있다면 공유해주실 수 있나요?",
    "그 방법을 선택하신 이유가 무엇인가요?",
    "반대 의견이나 다른 접근 방식도 고려해보셨나요?",
    "그 경험에서 아쉬웠던 점이나 개선하고 싶은 부분이 있으신가요?",
    "만약 지금 다시 한다면 어떻게 다르게 접근하시겠어요?",
  ];
  return followups[Math.floor(Math.random() * followups.length)];
}

// STAR analysis mock
function analyzeSTAR(answer: string): { S: number; T: number; A: number; R: number } {
  const sitKeywords = ["상황", "당시", "그때", "환경", "배경", "context"];
  const taskKeywords = ["목표", "과제", "요구", "필요", "문제", "task"];
  const actionKeywords = ["했습니다", "구현", "진행", "적용", "방법", "방식", "접근"];
  const resultKeywords = ["결과", "성과", "개선", "향상", "달성", "완료", "효과"];
  const score = (kws: string[]) => Math.min(100, kws.filter(k => answer.includes(k)).length * 30 + (answer.length > 100 ? 30 : 0));
  return { S: score(sitKeywords), T: score(taskKeywords), A: score(actionKeywords), R: score(resultKeywords) };
}

// 5-category scoring mock
function scoreAnswer(answer: string, question: string) {
  const len = answer.trim().length;
  const base = Math.min(85, 40 + len * 0.3);
  const techKeywords = ["구현", "설계", "코드", "알고리즘", "API", "DB", "스택", "최적화"];
  const techBonus = techKeywords.filter(k => answer.includes(k)).length * 4;
  return {
    technical: Math.min(100, Math.round(base * 0.85 + techBonus)),
    logic: Math.min(100, Math.round(base * 0.9 + (answer.includes("왜냐하면") || answer.includes("이유") ? 10 : 0))),
    specificity: Math.min(100, Math.round(base * 0.8 + (len > 150 ? 15 : 0))),
    depth: Math.min(100, Math.round(base * 0.75 + techBonus * 0.5)),
    communication: Math.min(100, Math.round(base * 0.95)),
  };
}

type Phase = "question" | "answering" | "followup" | "followup-answering";

interface QEntry {
  id: number;
  main: string;
  followup: string;
  answer: string;
  followupAnswer: string;
  scores: ReturnType<typeof scoreAnswer>;
  star: ReturnType<typeof analyzeSTAR>;
  wpm: number;
  silenceCount: number;
  answerTime: number;
}

const WARMUP_SECONDS = 5;
const VOICE_DB_THRESHOLD = 60; // 일반 성인 대화 수준(약 60dB) 이상이면 워밍업 즉시 종료

export function InterviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = (location.state as any) ?? {};

  const job = config.job || "frontend";
  const level = config.level || "junior";
  const type = config.type || "tech";
  const interviewer = config.interviewer || "normal";
  const count = config.count || 5;
  const coverText = config.coverText || "";

  // Build question list
  const questionList = (() => {
    let qs: string[] = [];
    if (type === "personality") {
      qs = [...PERSONALITY_QUESTIONS];
    } else {
      const bank = Q_BANK[job]?.[level] ?? Q_BANK["frontend"]["junior"];
      qs = [...bank];
    }
    // Inject cover-letter-based question if provided
    if (coverText.length > 50 && type !== "tech") {
      qs.splice(1, 0, "자기소개서에 작성하신 내용 중 가장 자신 있는 경험을 STAR 형식으로 설명해주세요.");
    }
    return qs.slice(0, count).map((q, i) => ({
      id: i + 1,
      main: q,
      followup: "",
      answer: "",
      followupAnswer: "",
      scores: { technical: 0, logic: 0, specificity: 0, depth: 0, communication: 0 },
      star: { S: 0, T: 0, A: 0, R: 0 },
      wpm: 0,
      silenceCount: 0,
      answerTime: 0,
    }));
  })();

  const TOTAL = questionList.length;
  const TIME_PER_Q = 120;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [mode, setMode] = useState<"voice" | "text">("text");
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [recording, setRecording] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [entries, setEntries] = useState<QEntry[]>(questionList);
  const [currentFollowup, setCurrentFollowup] = useState("");
  const [sttTranscript, setSttTranscript] = useState("");
  const [sttActive, setSttActive] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(0);
  const [warmup, setWarmup] = useState(true);
  const [warmupLeft, setWarmupLeft] = useState(WARMUP_SECONDS);
  const [micDb, setMicDb] = useState(0);

  // Video/camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const warmupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warmupEndedRef = useRef(false);

  // Camera toggle
  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setCameraOn(true);
      } catch {
        alert("카메라 접근 권한이 필요합니다.");
      }
    }
  }, [cameraOn]);

  // Timer
  useEffect(() => {
    if (phase === "answering" || phase === "followup-answering") {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current!); handleSubmit(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  // Waveform animation
  useEffect(() => {
    if (recording) {
      waveRef.current = setInterval(() => setWavePhase(p => p + 1), 100);
    } else {
      if (waveRef.current) clearInterval(waveRef.current);
    }
    return () => { if (waveRef.current) clearInterval(waveRef.current); };
  }, [recording]);

  // Cleanup camera on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
  }, []);

  // ── 준비(워밍업) 5초: 음성·표정 점수 미반영, 음성이 기준 dB 이상이면 즉시 시작 ──
  const endWarmup = useCallback(() => {
    if (warmupEndedRef.current) return;
    warmupEndedRef.current = true;
    if (warmupTimerRef.current) clearInterval(warmupTimerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setWarmup(false);
  }, []);

  useEffect(() => {
    // 5초 카운트다운
    warmupTimerRef.current = setInterval(() => {
      setWarmupLeft(s => { if (s <= 1) { endWarmup(); return 0; } return s - 1; });
    }, 1000);

    // 마이크 음량(데시벨) 감지 — 기준 이상이면 즉시 시작
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        micStreamRef.current = stream;
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx: AudioContext = new Ctx();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
          const rms = Math.sqrt(sum / buf.length);
          const db = Math.round(20 * Math.log10(Math.max(rms, 0.0001)) + 90);
          setMicDb(db);
          if (db >= VOICE_DB_THRESHOLD) { endWarmup(); return; }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // 마이크 권한이 없으면 카운트다운(5초)만으로 진행
      }
    })();

    return () => {
      cancelled = true;
      if (warmupTimerRef.current) clearInterval(warmupTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [endWarmup]);

  const startSTT = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("이 브라우저는 음성 인식을 지원하지 않습니다."); return; }
    const rec = new SR();
    rec.lang = "ko-KR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript).join("");
      setSttTranscript(transcript);
      setAnswer(transcript);
    };
    rec.onerror = () => setSttActive(false);
    rec.onend = () => setSttActive(false);
    rec.start();
    recognitionRef.current = rec;
    setSttActive(true);
  };

  const stopSTT = () => {
    recognitionRef.current?.stop();
    setSttActive(false);
  };

  const startAnswer = () => {
    setPhase("answering");
    setTimeLeft(TIME_PER_Q);
    setAnswerStartTime(Date.now());
    if (mode === "voice") { setRecording(true); startSTT(); }
  };

  const startFollowupAnswer = () => {
    setPhase("followup-answering");
    setTimeLeft(TIME_PER_Q);
    if (mode === "voice") { setRecording(true); startSTT(); }
  };

  const handleSubmit = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRecording(false);
    stopSTT();

    const elapsed = (Date.now() - answerStartTime) / 1000 / 60;
    const words = answer.trim().split(/\s+/).length;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    const scores = scoreAnswer(answer, entries[idx].main);
    const star = analyzeSTAR(answer);

    if (phase === "answering") {
      const followup = generateFollowup(entries[idx].main, answer);
      setCurrentFollowup(followup);
      setEntries(prev => prev.map((e, i) => i === idx ? { ...e, answer, scores, star, wpm, answerTime: Math.round(elapsed * 60) } : e));
      setAnswer("");
      setPhase("followup");
    } else {
      setEntries(prev => prev.map((e, i) => i === idx ? { ...e, followup: currentFollowup, followupAnswer: answer } : e));
      if (idx < TOTAL - 1) {
        setIdx(idx + 1);
        setPhase("question");
        setAnswer("");
        setSttTranscript("");
        setTimeLeft(TIME_PER_Q);
      } else {
        const finalEntries = entries.map((e, i) => i === idx ? { ...e, followup: currentFollowup, followupAnswer: answer } : e);
        navigate("/interview/report/demo", { state: { entries: finalEntries, config: { job, level, type, interviewer, companyType: config.companyType } } });
      }
    }
  };

  const q = entries[idx];
  const isTimeLow = timeLeft < 30;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Mock face analysis metrics (animated)
  const gazeStability = 72 + Math.sin(wavePhase * 0.05) * 8;
  const smileIndex = 60 + Math.cos(wavePhase * 0.07) * 12;
  const confidence = 68 + Math.sin(wavePhase * 0.04) * 10;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 준비(워밍업) 오버레이 — 5초 경과 또는 음성 감지 시 종료 */}
      {warmup && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 text-white" style={{ background: "rgba(15,23,42,0.96)" }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 mb-4">
              <Sparkles className="w-3 h-3" />준비 시간 · 점수 미반영
            </div>
            <h2 className="text-2xl font-bold mb-2">잠시 후 면접이 시작됩니다</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              이 시간 동안의 음성·표정은 <span className="text-white font-medium">점수에 반영되지 않습니다.</span><br />
              지금 말을 시작하면(약 {VOICE_DB_THRESHOLD}dB 이상) 바로 면접이 시작됩니다.
            </p>
          </div>

          <div className="text-7xl font-bold mb-8" style={{ fontFamily: "'DM Mono', monospace" }}>{warmupLeft}</div>

          <div className="w-64">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
              <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5" />입력 음량</span>
              <span className={micDb >= VOICE_DB_THRESHOLD ? "text-green-400 font-medium" : ""}>{micDb} dB</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-100"
                style={{ width: `${Math.min(100, Math.max(0, (micDb / 80) * 100))}%`, backgroundColor: micDb >= VOICE_DB_THRESHOLD ? "#10B981" : "#6C63FF" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/40 mt-1.5">
              <span>기준 {VOICE_DB_THRESHOLD}dB · 일반 대화 수준</span>
              <span>마이크 미허용 시 {WARMUP_SECONDS}초 후 시작</span>
            </div>
          </div>

          <button onClick={endWarmup} className="mt-10 text-sm text-white/60 hover:text-white transition-colors">바로 시작하기</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{idx + 1} / {TOTAL}</span>
          <div className="flex gap-1">
            {entries.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i < idx ? "w-6 bg-primary" : i === idx ? "w-8 bg-primary" : "w-4 bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(phase === "answering" || phase === "followup-answering") && (
            <div className={`flex items-center gap-1.5 text-sm font-mono ${isTimeLow ? "text-red-400" : "text-muted-foreground"}`}>
              <Clock className="w-4 h-4" />{fmt(timeLeft)}
            </div>
          )}

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${cameraOn ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {cameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            {cameraOn ? "카메라 ON" : "카메라 OFF"}
          </button>

          {/* Mode toggle */}
          <div className="flex rounded-lg bg-secondary p-1 gap-1">
            {(["text", "voice"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (sttActive) stopSTT(); }}
                className={`px-3 py-1 rounded-md text-xs transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {m === "text" ? "텍스트" : "음성"}
              </button>
            ))}
          </div>

          <button onClick={() => setShowExit(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-y-auto">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
              style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
          </div>

          <div className="relative w-full max-w-2xl">
            {/* Phase badge */}
            <div className="flex items-center gap-2 mb-5">
              {phase === "followup" || phase === "followup-answering" ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs">
                  <AlertCircle className="w-3 h-3" />꼬리질문 (답변 기반 AI 생성)
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs">
                  <Sparkles className="w-3 h-3" />질문 {idx + 1}
                </div>
              )}
              {interviewer === "pressure" && (
                <div className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs">압박형</div>
              )}
              {interviewer === "followup" && (
                <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">꼬리질문형</div>
              )}
            </div>

            {/* Question card */}
            <div className="rounded-2xl border border-border bg-card p-7 mb-6 shadow-sm">
              <p className="text-lg text-foreground leading-relaxed">
                {phase === "followup" || phase === "followup-answering" ? currentFollowup : q.main}
              </p>
            </div>

            {/* Answering states */}
            {phase === "question" && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-5">준비가 되면 답변을 시작하세요</p>
                <button
                  onClick={startAnswer}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:bg-indigo-600 transition-colors"
                  style={{ boxShadow: "0 0 24px rgba(99,102,241,0.3)" }}
                >
                  {mode === "voice" ? <Mic className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  답변 시작
                </button>
              </div>
            )}

            {phase === "followup" && (
              <div className="text-center">
                <div className="mb-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 text-left">
                  <strong>이전 답변 요약:</strong> {q.answer.slice(0, 80)}{q.answer.length > 80 ? "..." : ""}
                </div>
                <button
                  onClick={startFollowupAnswer}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition-colors"
                >
                  {mode === "voice" ? <Mic className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  꼬리질문 답변
                </button>
              </div>
            )}

            {(phase === "answering" || phase === "followup-answering") && mode === "text" && (
              <div>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="w-full h-36 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/60 transition-colors"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{answer.length}자</span>
                    {answer.trim().split(/\s+/).length > 0 && (
                      <span>{answer.trim().split(/\s+/).length}단어</span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={answer.trim().length < 5}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {phase === "answering" ? "답변 완료" : idx < TOTAL - 1 ? "다음 질문" : "면접 완료"}
                  </button>
                </div>
              </div>
            )}

            {(phase === "answering" || phase === "followup-answering") && mode === "voice" && (
              <div className="flex flex-col items-center gap-5">
                {/* STT transcript preview */}
                {sttTranscript && (
                  <div className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground min-h-16 leading-relaxed">
                    {sttTranscript}
                  </div>
                )}
                {/* Waveform */}
                <div className="flex items-center gap-0.5 h-14">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const h = recording ? 6 + Math.abs(Math.sin((i + wavePhase * 0.3) * 0.8)) * 36 : 6;
                    return (
                      <div key={i} className="w-1.5 rounded-full bg-primary transition-all duration-75"
                        style={{ height: `${h}px`, opacity: recording ? 0.5 + Math.abs(Math.sin((i + wavePhase * 0.3) * 0.8)) * 0.5 : 0.2 }} />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {sttActive ? <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />실시간 변환 중...</> : recording ? "처리 중..." : "대기 중"}
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-secondary hover:bg-muted text-sm text-foreground transition-colors"
                >
                  <Square className="w-4 h-4 text-red-400" />답변 완료
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Camera / Analysis panel */}
        <div className="hidden lg:flex flex-col gap-3 w-56 p-4 border-l border-border shrink-0">
          {/* Camera */}
          <div className="rounded-xl overflow-hidden aspect-video bg-secondary flex items-center justify-center border border-border relative">
            {cameraOn ? (
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <VideoOff className="w-6 h-6" />
                <span className="text-xs">카메라 꺼짐</span>
              </div>
            )}
            {cameraOn && (
              <div className="absolute top-1.5 right-1.5">
                <span className="flex items-center gap-1 text-[10px] text-white bg-red-500 rounded px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />REC
                </span>
              </div>
            )}
          </div>

          {cameraOn && (
            <>
              <div className="text-xs text-muted-foreground text-center">face-api.js 분석 활성화</div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "시선 안정", value: gazeStability, icon: Eye, color: "#6366F1" },
                  { label: "미소 지수", value: smileIndex, icon: Smile, color: "#10B981" },
                  { label: "자신감", value: confidence, icon: Zap, color: "#F59E0B" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>
                      <span style={{ fontFamily: "monospace" }}>{Math.round(value)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* WPM tracker during answering */}
          {(phase === "answering" || phase === "followup-answering") && answer.trim() && (
            <div className="mt-1 rounded-lg bg-secondary border border-border p-2.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Activity className="w-3 h-3" />말하기 속도
              </div>
              <div className="text-base font-bold text-foreground" style={{ fontFamily: "monospace" }}>
                {(() => {
                  const elapsed = (Date.now() - answerStartTime) / 1000 / 60;
                  const words = answer.trim().split(/\s+/).length;
                  return elapsed > 0.01 ? Math.round(words / elapsed) : 0;
                })()}
                <span className="text-xs font-normal text-muted-foreground ml-1">WPM</span>
              </div>
              <div className="text-xs text-muted-foreground">적정: 120~180 WPM</div>
            </div>
          )}

          <div className="mt-auto rounded-lg bg-secondary p-2.5 text-xs text-left">
            <div className="text-foreground font-medium mb-1">면접 팁</div>
            <p className="text-muted-foreground leading-relaxed">
              {interviewer === "pressure" ? "압박형 면접관은 침착함을 유지하는 것이 핵심입니다. 모르면 솔직히 말하세요."
               : interviewer === "followup" ? "꼬리질문은 깊이를 봅니다. 구체적 사례와 수치를 준비하세요."
               : "카메라를 바라보며 자신 있게 말하세요. 평상시보다 10% 느리게."}
            </p>
          </div>
        </div>
      </div>

      {/* Exit modal */}
      {showExit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card p-8 max-w-sm w-full text-center">
            <h3 className="font-semibold text-foreground mb-2">면접을 종료하시겠어요?</h3>
            <p className="text-sm text-muted-foreground mb-6">지금까지의 답변은 저장되지 않습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExit(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">계속하기</button>
              <button
                onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); navigate("/dashboard"); }}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">종료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
