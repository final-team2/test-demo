import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { isAuthed, isResumeComplete } from "../auth";
import {
  Code2, Server, Layout, Globe, Terminal, User, Briefcase,
  Brain, MessageCircle, Upload, ChevronRight, CheckCircle2,
  FileText, X, Shield, Smile, Zap, AlertTriangle, Building2,
  Factory, Rocket, Network, Globe2, CreditCard, Lock, Video, Mic
} from "lucide-react";

const STEPS = ["이용 동의", "이력서·질문 수", "면접 환경", "설정 요약", "장비 점검"];

const JOBS = [
  { id: "frontend", icon: Layout, label: "프론트엔드", desc: "React, Vue, CSS" },
  { id: "backend", icon: Server, label: "백엔드", desc: "Node, Spring, DB" },
  { id: "fullstack", icon: Globe, label: "풀스택", desc: "Frontend + Backend" },
  { id: "devops", icon: Terminal, label: "DevOps", desc: "Docker, K8s, CI/CD" },
  { id: "web-general", icon: Code2, label: "웹 개발 전반", desc: "ICT 공통" },
];

const LEVELS = [
  { id: "newcomer", label: "신입 (0년)", desc: "졸업 예정 / 인턴 경험" },
  { id: "junior", label: "주니어 (1~3년)", desc: "실무 경험 1~3년" },
  { id: "mid", label: "미들 (3년+)", desc: "프로젝트 리드 경험" },
];

const TYPES = [
  { id: "tech", icon: Brain, label: "기술 면접", desc: "CS·언어·프레임워크 지식 검증" },
  { id: "personality", icon: User, label: "인성 면접", desc: "가치관·협업·문제해결 성향" },
  { id: "job", icon: Briefcase, label: "직무 면접", desc: "실무 경험·프로젝트 기반 질문" },
  { id: "comprehensive", icon: MessageCircle, label: "종합 면접", desc: "기술+인성+직무 통합" },
];

const COMPANY_TYPES = [
  { id: "large", icon: Building2, label: "대기업", desc: "삼성, LG, 현대 등 대규모 기업" },
  { id: "public", icon: Factory, label: "공기업", desc: "공공기관, 공사, 공단" },
  { id: "startup", icon: Rocket, label: "스타트업", desc: "초기 성장 단계 기업" },
  { id: "si", icon: Network, label: "SI/IT서비스", desc: "시스템 통합, IT 서비스 기업" },
  { id: "foreign", icon: Globe2, label: "외국계", desc: "글로벌 기업 한국 법인" },
];

const INTERVIEWER_TYPES = [
  { id: "normal", icon: Smile, label: "일반형", desc: "표준적인 면접 방식, 균형 잡힌 질문", color: "#6366F1" },
  { id: "pressure", icon: AlertTriangle, label: "압박형", desc: "날카로운 질문, 모순 지적형", color: "#EF4444" },
  { id: "followup", icon: MessageCircle, label: "꼬리질문형", desc: "답변마다 심화 꼬리질문 연속", color: "#F59E0B" },
  { id: "friendly", icon: Smile, label: "친화형", desc: "편안한 분위기, 대화형 진행", color: "#10B981" },
];

const CONSENT_ITEMS = [
  { id: "ai_data", label: "AI 학습 목적 답변 데이터 활용", required: true, detail: "답변 내용은 서비스 품질 개선에 익명으로 사용됩니다." },
  { id: "video_record", label: "면접 영상 분석 (선택)", required: false, detail: "동의하면 카메라로 표정·시선을 분석하는 '영상 면접'으로, 미동의 시 카메라 없이 '음성 면접'으로 진행됩니다." },
  { id: "voice_analyze", label: "음성 STT 및 분석 데이터 활용", required: true, detail: "Web Speech API로 음성을 텍스트로 변환하고 분석합니다." },
  { id: "marketing", label: "서비스 개선을 위한 익명 통계 활용", required: false, detail: "익명 처리된 통계 데이터를 서비스 개선에 활용합니다." },
];

const RESUMES = [
  { id: "r1", title: "프론트엔드 신입 이력서", date: "2026-06-10", desc: "React · TypeScript 중심" },
  { id: "r2", title: "React 개발자 이력서", date: "2026-05-22", desc: "실무 프로젝트 2건 포함" },
  { id: "r3", title: "포트폴리오 통합본", date: "2026-04-30", desc: "전체 경력·프로젝트 요약" },
];

// Mock subscription check
const IS_PREMIUM = true;

export function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobContext = (location.state as any)?.jobId ? {
    jobId: (location.state as any).jobId,
    company: (location.state as any).company,
    title: (location.state as any).title,
  } : null;

  // 진입 가드: 비로그인 → 로그인, 맞춤 진로 미설정 → 맞춤 진로 변경 (직접 진입 포함)
  useEffect(() => {
    if (!isAuthed()) { navigate("/auth"); return; }
    if (!isResumeComplete()) navigate("/resume");
  }, [navigate]);

  const [step, setStep] = useState(0);
  const [job, setJob] = useState(jobContext ? "frontend" : "");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [interviewer, setInterviewer] = useState("normal");
  const [count, setCount] = useState(5);
  const [coverText, setCoverText] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>(
    Object.fromEntries(CONSENT_ITEMS.map(c => [c.id, false]))
  );
  const [resume, setResume] = useState("");

  const requiredIds = CONSENT_ITEMS.filter(c => c.required).map(c => c.id);
  const consentOk = requiredIds.every(id => consents[id]);
  const allChecked = CONSENT_ITEMS.every(c => consents[c.id]);
  const videoEnabled = consents.video_record; // 영상 동의 → 영상 면접 / 미동의 → 음성 면접

  const canNext = [
    consentOk,
    !!resume,
    !!type && !!companyType,
    true,
    true,
  ][step];

  const toggleAll = () => {
    const next = !allChecked;
    setConsents(Object.fromEntries(CONSENT_ITEMS.map(c => [c.id, next])));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/interview/session", {
        state: { job, level, type, companyType, interviewer, count, coverText, resume, jobContext, videoEnabled },
      });
    }
  };

  if (!IS_PREMIUM) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #F8F9FF 0%, #EEF0FF 100%)" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">프리미엄 전용 기능</h2>
          <p className="text-muted-foreground mb-8">AI 모의 면접은 프리미엄 구독자만 이용할 수 있습니다.</p>
          <button
            onClick={() => navigate("/interview")}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />요금제 보러가기
          </button>
          <button onClick={() => navigate(-1)} className="mt-3 text-sm text-muted-foreground hover:text-foreground">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "linear-gradient(135deg, #F8F9FF 0%, #EEF0FF 100%)" }}>
      <div className="w-full max-w-2xl">
        {jobContext && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground text-sm mb-0.5">
                  {jobContext.company} — {jobContext.title} 맞춤 면접
                </div>
                <p className="text-xs text-muted-foreground">해당 공고에 최적화된 면접 질문으로 연습합니다</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs mb-4">
            <Zap className="w-3 h-3" />프리미엄 서비스
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">면접 설정</h1>
          <p className="text-muted-foreground text-sm">맞춤 면접을 위한 정보를 입력해주세요</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8 px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground"}`}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">

          {/* Step 0: Consent */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">면접 전 동의 절차</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                AI 모의 면접 진행을 위해 아래 항목에 동의해주세요.<br />
                <span className="text-primary font-medium">필수 항목 동의 후 면접 시작이 가능합니다.</span>
              </p>

              {/* All agree */}
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/30 transition-colors" onClick={toggleAll}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${allChecked ? "bg-primary border-primary" : "border-border"}`}>
                  {allChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium text-foreground">전체 동의 (필수 + 선택)</span>
              </div>

              <div className="flex flex-col gap-2">
                {[...CONSENT_ITEMS].sort((a, b) => Number(b.required) - Number(a.required)).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => setConsents(c => ({ ...c, [item.id]: !c[item.id] }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${consents[item.id] ? "bg-primary border-primary" : "border-border"}`}>
                          {consents[item.id] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.required ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary border border-border text-muted-foreground"}`}>
                        {item.required ? "필수" : "선택"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 ml-7">{item.detail}</p>
                  </div>
                ))}
              </div>

              {/* 선택된 방식 안내 (실시간) */}
              <div className={`mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border text-sm transition-colors ${videoEnabled ? "bg-primary/5 border-primary/20" : "bg-secondary border-border"}`}>
                {videoEnabled
                  ? <Video className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  : <Mic className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div>
                  <span className="font-medium text-foreground">선택된 방식: {videoEnabled ? "영상 면접" : "음성 면접"}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {videoEnabled
                      ? "카메라로 표정·시선까지 분석합니다."
                      : "카메라 없이 음성으로만 진행합니다."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: 이력서 선택 + 질문 수 */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">이력서를 선택하세요</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">면접에 사용할 이력서를 골라주세요. <span className="text-primary font-medium">(필수)</span></p>
              <div className="flex flex-col gap-2 mb-6">
                {RESUMES.map(r => (
                  <button key={r.id} onClick={() => setResume(r.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${resume === r.id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                    <div className="flex items-center gap-3">
                      <FileText className={`w-4 h-4 shrink-0 ${resume === r.id ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <div className="font-medium text-sm text-foreground">{r.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.desc} · {r.date}</div>
                      </div>
                    </div>
                    {resume === r.id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-5">
                <label className="text-sm font-medium text-foreground block mb-3">질문 수</label>
                <div className="flex gap-2">
                  {[5, 10, 15].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm transition-all ${count === n ? "border-primary bg-primary/5 text-primary font-medium" : "border-border bg-secondary text-muted-foreground hover:border-primary/30"}`}>
                      {n}문항
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 면접 환경 (면접 유형 + 회사 유형 + 면접관 유형) */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">면접 환경을 설정하세요</h2>

              <h3 className="text-sm font-medium text-foreground mb-3">면접 유형</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TYPES.map(({ id, icon: Icon, label, desc }) => (
                  <button key={id} onClick={() => setType(id)}
                    className={`p-4 rounded-xl border text-left transition-all ${type === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                    <Icon className={`w-5 h-5 mb-2 ${type === id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-medium text-sm text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-5 mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">회사 유형</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {COMPANY_TYPES.map(({ id, icon: Icon, label, desc }) => (
                    <button key={id} onClick={() => setCompanyType(id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col ${companyType === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                      <Icon className={`w-5 h-5 mb-1.5 ${companyType === id ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="font-medium text-xs text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">{desc.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-medium text-foreground mb-3">면접관 유형</h3>
                <div className="grid grid-cols-2 gap-2">
                  {INTERVIEWER_TYPES.map(({ id, icon: Icon, label, desc, color }) => (
                    <button key={id} onClick={() => setInterviewer(id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${interviewer === id ? "border-2" : "border-border bg-secondary hover:border-primary/30"}`}
                      style={interviewer === id ? { borderColor: color, backgroundColor: `${color}10` } : {}}>
                      <Icon className="w-4 h-4 mb-1.5" style={{ color: interviewer === id ? color : undefined }} />
                      <div className="text-sm font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 면접 설정 요약 (크게) */}
          {step === 3 && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">면접 설정 요약</h2>
              <p className="text-sm text-muted-foreground mb-6">아래 설정으로 면접을 시작합니다. 확인 후 <span className="text-foreground font-medium">면접 시작</span>을 눌러주세요.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["이력서", RESUMES.find(r => r.id === resume)?.title ?? "-"],
                  ["면접 방식", videoEnabled ? "영상 면접" : "음성 면접"],
                  ["면접 유형", TYPES.find(t => t.id === type)?.label ?? "-"],
                  ["회사 유형", COMPANY_TYPES.find(c => c.id === companyType)?.label ?? "-"],
                  ["면접관", INTERVIEWER_TYPES.find(i => i.id === interviewer)?.label ?? "-"],
                  ["질문 수", `${count}문항`],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 px-4 py-4 rounded-xl bg-secondary border border-border">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <span className="text-lg font-bold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: 장비 점검 (카메라·음성) */}
          {step === 4 && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">{videoEnabled ? "카메라·음성 점검" : "마이크 점검"}</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {videoEnabled
                  ? "면접 전 카메라와 마이크가 정상 동작하는지 확인하세요."
                  : "영상 미동의 — 카메라 없이 음성으로만 진행됩니다. 마이크가 정상 동작하는지 확인하세요."}
              </p>

              <div className={`grid gap-3 mb-4 ${videoEnabled ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {/* 카메라 미리보기 (mock) — 영상 면접일 때만 */}
                {videoEnabled && (
                  <div className="rounded-xl border border-border bg-gray-900 aspect-video flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
                    <Video className="w-8 h-8 mb-2" />
                    <span className="text-xs">카메라 미리보기</span>
                    <span className="absolute top-2 left-2 flex items-center gap-1 text-[11px] text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />정상 인식
                    </span>
                  </div>
                )}
                {/* 음성 입력 레벨 (mock) */}
                <div className="rounded-xl border border-border bg-secondary p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3 text-sm text-foreground"><Mic className="w-4 h-4 text-primary" />마이크 입력</div>
                  <div className="flex items-end gap-1 h-10">
                    {[40, 70, 55, 85, 60, 75, 45, 90, 50, 65].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-primary/60" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />음성이 정상적으로 입력됩니다</span>
                </div>
              </div>

              {/* 환경 안내 — 영상이면 조도(표정) 경고, 음성이면 마이크 안내 */}
              {videoEnabled ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>현재 주변 조도는 적절합니다. 빛이 부족하면 표정 분석 정확도가 떨어질 수 있어요.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary border border-border text-muted-foreground text-xs mb-4">
                  <Mic className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>영상 미동의 — 카메라 없이 음성으로만 진행됩니다. 조용한 환경에서 또렷하게 답변해주세요.</span>
                </div>
              )}

              {/* 경고문 */}
              <div className="rounded-xl bg-secondary border border-border p-4">
                <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />면접 전 꼭 확인하세요
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• 주변 환경이나 장비에 따라 피드백 정확도에 영향을 줄 수 있습니다.</li>
                  <li>• 면접 진행 중에는 <span className="text-foreground font-medium">중단이 불가</span>합니다.</li>
                  <li>• 중단할 경우 분석·피드백 결과에 영향을 줄 수 있습니다.</li>
                  <li>• 조용한 환경에서 정면을 바라보며 진행해주세요.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-5">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card text-sm transition-colors">이전</button>
          ) : <div />}
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors disabled:opacity-40"
          >
            {step < STEPS.length - 1 ? "다음" : "면접 시작"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
