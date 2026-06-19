import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MessageCircle, X, Send, BrainCircuit,
  Minimize2, RotateCcw, ExternalLink, ChevronRight,
  History, ArrowLeft, Clock, Trash2
} from "lucide-react";

type Role = "user" | "bot";
interface Message {
  id: number;
  role: Role;
  text: string;
  time: string;
  actions?: { label: string; href: string }[];
}

interface ChatSession {
  id: string;
  date: string;
  preview: string;
  messages: Message[];
}

function now() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function todayStr() {
  return new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function groupByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  return sessions.reduce((acc, s) => {
    acc[s.date] = acc[s.date] ? [...acc[s.date], s] : [s];
    return acc;
  }, {} as Record<string, ChatSession[]>);
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 0, role: "bot",
    text: "안녕하세요! 👋 DevReady 도우미입니다.\n궁금한 것을 자유롭게 물어보거나 아래 메뉴를 선택해보세요.\n\nDevReady AI가 서비스 관련 질문에 자연어로 답변해드립니다.",
    time: now(),
    actions: [
      { label: "면접 바로 시작", href: "/interview/setup" },
      { label: "공고 보러가기", href: "/jobs" },
    ],
  },
];

const QUICK_CATEGORIES = [
  { label: "서비스 이용", items: ["요금제 안내", "Face ID 사용법", "음성 면접 방법"] },
  { label: "면접 준비", items: ["기술면접 준비 팁", "자주 나오는 질문", "점수 올리는 방법"] },
  { label: "기능 안내", items: ["이력서 AI 자동완성", "음성 분석이 뭔가요?", "결과 리포트 보는 법"] },
];

const SERVICE_CONTEXT = `당신은 DevReady의 친절한 고객지원 챗봇입니다. 한국어로 답변하세요.

DevReady는 웹 개발자 취업을 위한 AI 면접 준비 플랫폼입니다.

주요 기능:
- AI 면접 시뮬레이션 (텍스트/음성 답변, 화상 면접)
- 면접 결과 리포트 (점수, 레이더 차트, 상세 피드백)
- 이력서 작성 및 AI 자동완성
- 교육 센터 (동영상 강의, 퀴즈)
- 취업 공고 목록 및 지원 관리
- 커뮤니티 (채팅룸, 면접 후기, 스터디 모집)
- 코딩 테스트 연습

요금제:
- 무료: 월 3회 면접, 기본 피드백
- 베이직 (9,900원/월): 월 20회, 음성 분석, PDF 리포트
- 프로 (19,900원/월): 무제한, 영상 분석, AI 이력서 자동완성, 멘토링

면접 설정 옵션: 직군, 경력, 회사, 언어, 답변 형태(텍스트/음성), 질문 수
점수 항목: 기술력, 문제해결력, 커뮤니케이션, 직무적합성, 태도/성장마인드셋

간결하고 친절하게 답변하고, 관련 기능으로 안내하세요. 서비스와 무관한 질문에는 DevReady 관련 도움을 제안하세요.`;

const FALLBACK_RESPONSES: Record<string, { text: string; actions?: { label: string; href: string }[] }> = {
  "요금제 안내": {
    text: "💳 요금제 안내\n\n• 무료 — 월 3회 면접, 기본 피드백\n• 베이직 9,900원/월 — 월 20회, 음성 분석, PDF 리포트\n• 프로 19,900원/월 — 무제한, 영상 분석, AI 이력서 자동완성, 멘토링 연결\n\n첫 가입 시 베이직 7일 무료 체험이 제공됩니다.",
    actions: [{ label: "요금제 변경하기", href: "/mypage" }],
  },
  "Face ID 사용법": {
    text: "👤 Face ID 로그인 방법\n\n1. 로그인 페이지에서 'Face ID로 로그인' 버튼 클릭\n2. 카메라가 자동 실행됩니다\n3. 얼굴을 화면 중앙에 위치시키고 잠시 기다리세요\n4. 인식 완료 후 자동 로그인!\n\n최초 1회 일반 로그인 후 Face ID를 등록할 수 있습니다.",
    actions: [{ label: "로그인 페이지", href: "/auth" }],
  },
  "음성 면접 방법": {
    text: "🎤 음성 면접 사용법\n\n1. 면접 설정 시 '음성 답변' 동의 체크\n2. 면접 진행 화면 상단에서 '음성' 모드 선택\n3. '답변 시작' 버튼 클릭 → 마이크 권한 허용\n4. 답변 후 '답변 완료' 버튼 클릭\n\nSTT가 실시간으로 텍스트로 변환되며, 말하기 속도·필러워드를 자동 분석합니다.",
    actions: [{ label: "면접 시작하기", href: "/interview/setup" }],
  },
  "기술면접 준비 팁": {
    text: "🧠 기술면접 준비 팁\n\n1. CS 기초 탄탄히 — 자료구조, 네트워크, OS, DB\n2. 코드 예시로 설명 — 추상적 설명보다 구체적 코드\n3. STAR 기법 — 상황·과제·행동·결과 구조화\n4. 꼬리질문 대비 — 답변 후 '왜?' 스스로 물어보기\n5. 프로젝트 경험 미리 정리 — 2~3개 스크립트화",
    actions: [{ label: "기술면접 시작", href: "/interview/setup" }, { label: "교육 센터", href: "/education" }],
  },
  "자주 나오는 질문": {
    text: "📋 웹개발 면접 자주 나오는 질문 TOP 5\n\n1. Virtual DOM과 실제 DOM의 차이\n2. 클로저(Closure)란 무엇인가\n3. HTTP와 HTTPS의 차이\n4. RESTful API 설계 원칙\n5. 본인의 강점과 약점\n\n각 주제를 교육 센터에서 깊이 있게 학습할 수 있습니다.",
    actions: [{ label: "교육 센터에서 학습", href: "/education" }, { label: "면접 연습", href: "/interview/setup" }],
  },
  "점수 올리는 방법": {
    text: "📈 점수를 빠르게 올리려면\n\n• 약점 카테고리 집중 연습 (마이페이지에서 확인)\n• 같은 질문을 3번 이상 반복 → 다른 구조로 답변\n• 음성 분석 결과로 필러워드(어, 그니까) 줄이기\n• 꼬리질문까지 완전히 답변하는 습관\n• STAR 기법으로 경험 기반 답변 구조화",
    actions: [{ label: "내 약점 확인", href: "/mypage?tab=interview" }],
  },
  "이력서 AI 자동완성": {
    text: "✨ AI 이력서 자동완성 기능\n\n이력서 페이지에서 자기소개서 탭을 열면 'AI 자동완성' 버튼이 있습니다.\n\n입력한 경력·스킬·학력 정보를 바탕으로 DevReady AI가 맞춤 문장을 제안합니다.\n\n⚠️ 프로 플랜 이상에서 이용 가능합니다.",
    actions: [{ label: "이력서 작성하기", href: "/resume" }],
  },
  "음성 분석이 뭔가요?": {
    text: "🎤 음성 분석 기능 안내\n\n말하기 속도(WPM), 명확도, 필러워드(어, 그니까, 음) 빈도, 침묵 구간을 자동 측정합니다.\n\n결과 리포트에서 '전달력 피드백'으로 제공됩니다.\n\n⚠️ 합격 예측이 아닌 커뮤니케이션 개선 지표입니다.",
    actions: [{ label: "음성으로 면접하기", href: "/interview/setup" }],
  },
  "결과 리포트 보는 법": {
    text: "📊 결과 리포트 구성\n\n• 종합 점수 (100점 만점)\n• 역량 레이더 차트 (5개 영역)\n• 항목별 점수 — 기술, 커뮤니케이션, 문제해결, 태도\n• 질문별 피드백 — 내 답변 + AI 상세 피드백\n• 음성·표정 지표\n• AI 종합 추천\n\n리포트는 PDF로 다운로드할 수 있습니다.",
    actions: [{ label: "최근 리포트 보기", href: "/mypage?tab=interview" }],
  },
};

// Mock DevReady API call — simulates natural language response
// Replace with real @anthropic-ai/sdk call when ANTHROPIC_API_KEY is available
async function callDevReadyAPI(userMessage: string, history: { role: string; content: string }[]): Promise<string> {
  // Real implementation would be:
  // const Anthropic = (await import("@anthropic-ai/sdk")).default;
  // const client = new Anthropic({ apiKey: "YOUR_ANTHROPIC_API_KEY_HERE", dangerouslyAllowBrowser: true });
  // const response = await client.messages.create({
  //   model: "claude-opus-4-7",
  //   max_tokens: 1024,
  //   system: SERVICE_CONTEXT,
  //   messages: [...history, { role: "user", content: userMessage }],
  // });
  // return response.content[0].type === "text" ? response.content[0].text : "";

  // Mock response based on intent analysis
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  const q = userMessage.toLowerCase();
  if (q.includes("요금") || q.includes("가격") || q.includes("구독") || q.includes("플랜"))
    return "💳 DevReady 요금제 안내\n\n• **무료** — 월 3회 면접, 기본 피드백\n• **베이직** 9,900원/월 — 월 20회 면접, 음성 분석, PDF 리포트 다운로드\n• **프로** 19,900원/월 — 무제한 면접, 영상 분석, AI 이력서 자동완성, 멘토링 연결\n\n첫 가입 시 베이직 플랜 7일 무료 체험이 제공됩니다. 마이페이지 → 구독 관리에서 변경하실 수 있어요!";
  if (q.includes("면접") && (q.includes("시작") || q.includes("방법") || q.includes("어떻게")))
    return "🎯 AI 면접 시작 방법\n\n1. 상단 메뉴 '면접 연습' 클릭\n2. 직군·경력·회사명·답변 형태 설정\n3. '면접 시작' 버튼 클릭\n4. 질문에 텍스트 또는 음성으로 답변\n5. 완료 후 상세 리포트 확인\n\n텍스트와 음성 중 선택할 수 있고, 음성의 경우 WPM·필러워드까지 분석해드립니다!";
  if (q.includes("이력서") || q.includes("resume"))
    return "📄 이력서 기능 안내\n\n이력서 페이지에서 다음 기능을 이용할 수 있어요:\n\n• **기본 정보** 입력 및 관리\n• **경력·프로젝트·스킬** 상세 입력\n• **자기소개서 AI 자동완성** (프로 플랜)\n• **버전 관리** — 여러 버전 저장 및 복원\n• **PDF 다운로드**\n\n이력서를 완성하면 AI가 맞춤 면접 질문을 추천해드립니다!";
  if (q.includes("점수") || q.includes("성적") || q.includes("평가"))
    return "📊 면접 점수 구성\n\n5가지 역량을 종합 평가합니다:\n\n1. **기술력** — 기술 지식의 정확도와 깊이\n2. **문제해결력** — 논리적 사고와 접근 방식\n3. **커뮤니케이션** — 표현력과 전달력\n4. **직무적합성** — 지원 분야와의 연관성\n5. **태도/성장마인드셋** — 학습 의지와 긍정성\n\n마이페이지에서 성장 추이와 약점 분석을 확인하세요!";
  if (q.includes("커뮤니티") || q.includes("스터디") || q.includes("후기"))
    return "👥 커뮤니티 기능\n\n• **채팅룸** — 기업별·직군별 실시간 채팅\n• **면접 후기** — 실제 면접 경험 공유 및 별점\n• **스터디 모집** — 함께 준비할 스터디원 모집\n• **Q&A 아카이브** — 자주 묻는 기술 질문 모음\n• **자유게시판** — 취준생 소통 공간\n\n같은 목표를 가진 분들과 함께 준비하면 더 빠르게 성장할 수 있어요!";
  if (q.includes("교육") || q.includes("강의") || q.includes("학습") || q.includes("공부"))
    return "🎓 교육 센터 안내\n\n**학습 과정**:\n• 프론트엔드 / 백엔드 / 풀스택 과정\n• 기술 면접 핵심 이론 강의\n• 실습 문제와 퀴즈\n\n**특징**:\n• 진도율 관리\n• 카테고리별 필터\n• 완료 후 수료증 발급\n\n교육 → 코딩 테스트 → 면접 연습 순서로 진행하시면 효과적입니다!";
  if (q.includes("안녕") || q.includes("hello") || q.includes("hi"))
    return "안녕하세요! 😊 DevReady 도우미입니다.\n\n취업 준비에 궁금한 것이 있으시면 편하게 물어보세요!\n\n• 서비스 이용 방법\n• 면접 준비 팁\n• 요금제 안내\n• 기능 문의\n\n무엇이든 도와드릴게요!";

  // Generic intelligent response for other queries
  return `DevReady에서 "${userMessage}"에 대해 도움을 드릴게요!\n\n현재 베타 서비스 중으로 일부 문의는 준비 중입니다. 아래 방법으로도 도움받으실 수 있어요:\n\n• 빠른 메뉴에서 관련 항목 선택\n• 구체적인 기능명으로 다시 질문\n• 커뮤니티 Q&A 게시판 활용\n\n더 궁금한 점이 있으신가요? 😊`;
}

const MOCK_HISTORY: ChatSession[] = [
  {
    id: "s1",
    date: "2026년 6월 8일",
    preview: "요금제 안내",
    messages: [
      { id: 1, role: "user", text: "요금제 안내", time: "14:23" },
      { id: 2, role: "bot", text: "💳 요금제 안내\n\n• 무료 — 월 3회 면접, 기본 피드백\n• 베이직 9,900원/월\n• 프로 19,900원/월\n\n첫 가입 시 베이직 7일 무료 체험!", time: "14:23", actions: [{ label: "요금제 변경하기", href: "/mypage" }] },
    ],
  },
  {
    id: "s2",
    date: "2026년 6월 7일",
    preview: "기술면접 준비 팁",
    messages: [
      { id: 3, role: "user", text: "기술면접 어떻게 준비해야 하나요?", time: "10:15" },
      { id: 4, role: "bot", text: "🧠 기술면접 준비 팁\n\n1. CS 기초 탄탄히\n2. 코드 예시로 설명\n3. STAR 기법 활용\n4. 꼬리질문 대비\n5. 프로젝트 경험 스크립트화", time: "10:15" },
    ],
  },
  {
    id: "s3",
    date: "2026년 6월 5일",
    preview: "음성 분석이 뭔가요?",
    messages: [
      { id: 5, role: "user", text: "음성 분석이 뭔가요?", time: "09:42" },
      { id: 6, role: "bot", text: "🎤 음성 분석 기능 안내\n\n말하기 속도(WPM), 필러워드, 침묵 구간을 자동 측정합니다.", time: "09:42" },
    ],
  },
];

let uid = 100;

type View = "chat" | "history" | "historyDetail";

export function ChatbotWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_HISTORY);
  const [detailSession, setDetailSession] = useState<ChatSession | null>(null);
  const [currentSessionId] = useState(() => `s_${Date.now()}`);
  const endRef = useRef<HTMLDivElement>(null);
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages, view]);

  const saveCurrentSession = (msgs: Message[]) => {
    const userMsgs = msgs.filter(m => m.role === "user");
    if (userMsgs.length === 0) return;
    const session: ChatSession = {
      id: currentSessionId,
      date: todayStr(),
      preview: userMsgs[0].text.slice(0, 30),
      messages: msgs,
    };
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== currentSessionId);
      return [session, ...filtered];
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: uid++, role: "user", text, time: now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setActiveCategory(null);
    setTyping(true);

    conversationHistory.current.push({ role: "user", content: text });

    try {
      // Check for exact quick-menu matches first
      const exactMatch = FALLBACK_RESPONSES[text];
      let responseText: string;
      let actions: { label: string; href: string }[] | undefined;

      if (exactMatch) {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        responseText = exactMatch.text;
        actions = exactMatch.actions;
      } else {
        responseText = await callDevReadyAPI(text, conversationHistory.current.slice(-10));
      }

      conversationHistory.current.push({ role: "assistant", content: responseText });

      const botMsg: Message = { id: uid++, role: "bot", text: responseText, time: now(), actions };
      const finalMsgs = [...newMsgs, botMsg];
      setMessages(finalMsgs);
      saveCurrentSession(finalMsgs);
      if (!open) setUnread(n => n + 1);
    } catch {
      const errMsg: Message = {
        id: uid++, role: "bot",
        text: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 😅",
        time: now(),
      };
      setMessages(m => [...m, errMsg]);
    } finally {
      setTyping(false);
    }
  };

  const reset = () => {
    saveCurrentSession(messages);
    setMessages(INITIAL_MESSAGES);
    setUnread(0);
    setActiveCategory(null);
    conversationHistory.current = [];
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const grouped = groupByDate(sessions);

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-indigo-600 transition-all duration-200 hover:scale-110"
          style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}
        >
          <MessageCircle className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[370px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ height: minimized ? "auto" : 560, maxWidth: "calc(100vw - 24px)", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary shrink-0">
            <div className="flex items-center gap-2.5">
              {(view === "history" || view === "historyDetail") && (
                <button onClick={() => setView(view === "historyDetail" ? "history" : "chat")} className="p-1 rounded hover:bg-white/20 text-white mr-0.5">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {view === "history" ? "대화 이력" : view === "historyDetail" ? detailSession?.preview ?? "대화 보기" : "DevReady 도우미"}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  {view === "chat" && <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />DevReady AI 연동</>}
                  {view === "history" && <><Clock className="w-3 h-3" />{sessions.length}개 대화</>}
                  {view === "historyDetail" && <><Clock className="w-3 h-3" />{detailSession?.date}</>}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {view === "chat" && (
                <>
                  <button onClick={() => setView("history")} title="대화 이력" className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                    <History className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={reset} title="새 대화" className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* History list view */}
              {view === "history" && (
                <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <History className="w-10 h-10 opacity-30" />
                      <p className="text-sm">아직 대화 이력이 없어요</p>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([date, daySessions]) => (
                      <div key={date}>
                        <div className="text-xs text-muted-foreground mb-2 px-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />{date}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {daySessions.map(s => (
                            <div key={s.id} className="flex items-center gap-2 group">
                              <button
                                onClick={() => { setDetailSession(s); setView("historyDetail"); }}
                                className="flex-1 text-left px-3 py-2.5 rounded-xl border border-border bg-secondary hover:border-primary/30 hover:bg-primary/5 transition-colors"
                              >
                                <div className="text-sm text-foreground truncate">{s.preview}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{s.messages.length}개 메시지</div>
                              </button>
                              <button
                                onClick={() => deleteSession(s.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* History detail view */}
              {view === "historyDetail" && detailSession && (
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                  {detailSession.messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm border border-border"
                      }`}>
                        {msg.text}
                      </div>
                      {msg.actions && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.actions.map(a => (
                            <button key={a.label} onClick={() => { navigate(a.href); setOpen(false); }}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                              {a.label}<ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border text-center">
                    <button onClick={() => setView("chat")} className="text-xs text-primary hover:underline">
                      새 대화 시작하기 →
                    </button>
                  </div>
                </div>
              )}

              {/* Chat view */}
              {view === "chat" && (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm border border-border"
                        }`}>
                          {msg.text}
                        </div>
                        {msg.actions && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.actions.map(a => (
                              <button key={a.label} onClick={() => { navigate(a.href); setOpen(false); }}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                                {a.label}<ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground mt-0.5 px-1">{msg.time}</span>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex items-start gap-2">
                        <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                              style={{ animation: `botBounce 1s ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground self-end mb-1">DevReady AI 분석 중...</span>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Quick menu */}
                  <div className="px-3 py-2 border-t border-border">
                    {!activeCategory ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="text-xs text-muted-foreground mb-1">빠른 메뉴</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {QUICK_CATEGORIES.map(cat => (
                            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors">
                              {cat.label}<ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => setActiveCategory(null)} className="text-xs text-muted-foreground hover:text-foreground mb-1.5 flex items-center gap-1">← 뒤로</button>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_CATEGORIES.find(c => c.label === activeCategory)?.items.map(item => (
                            <button key={item} onClick={() => sendMessage(item)}
                              className="text-xs px-2.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-3 pb-3 pt-1 flex gap-2 border-t border-border">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                      placeholder="자유롭게 질문하기... (DevReady AI가 답변)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                    <button onClick={() => sendMessage(input)} disabled={!input.trim() || typing}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-40 shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes botBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
