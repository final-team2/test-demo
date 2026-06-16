import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Code2, Server, Layout, Globe, Terminal, User, Briefcase,
  Brain, MessageCircle, Upload, ChevronRight, CheckCircle2,
  FileText, X, Shield, Smile, Zap, AlertTriangle, Building2,
  Factory, Rocket, Network, Globe2, CreditCard, Lock
} from "lucide-react";

const STEPS = ["이용 동의", "직군·경력", "면접 유형", "회사·면접관", "자료 업로드"];

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
  { id: "video_record", label: "면접 영상 분석 (표정·시선 분석용)", required: true, detail: "Face-api.js를 통한 실시간 표정·시선 분석에 동의합니다." },
  { id: "voice_analyze", label: "음성 STT 및 분석 데이터 활용", required: true, detail: "Web Speech API로 음성을 텍스트로 변환하고 분석합니다." },
  { id: "company_share", label: "업체 측 이력서·답변 결과 공유", required: false, detail: "찜한 기업 채용담당자에게 면접 결과 공유를 허용합니다." },
  { id: "marketing", label: "서비스 개선을 위한 익명 통계 활용", required: false, detail: "익명 처리된 통계 데이터를 서비스 개선에 활용합니다." },
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

  const requiredIds = CONSENT_ITEMS.filter(c => c.required).map(c => c.id);
  const consentOk = requiredIds.every(id => consents[id]);
  const allChecked = CONSENT_ITEMS.every(c => consents[c.id]);

  const canNext = [
    consentOk,
    !!job && !!level,
    !!type,
    !!companyType,
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
        state: { job, level, type, companyType, interviewer, count, coverText, jobContext },
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
                AI 모의 면접 결과 데이터의 업체 측 공개 여부를 포함하여<br />
                아래 항목에 동의해주세요. <span className="text-primary font-medium">필수 항목 동의 후 면접 시작이 가능합니다.</span>
              </p>

              {/* All agree */}
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/30 transition-colors" onClick={toggleAll}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${allChecked ? "bg-primary border-primary" : "border-border"}`}>
                  {allChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium text-foreground">전체 동의 (필수 + 선택)</span>
              </div>

              <div className="flex flex-col gap-2">
                {CONSENT_ITEMS.map(item => (
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
            </div>
          )}

          {/* Step 1: Job + Level */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">직군과 경력을 선택하세요</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
                {JOBS.map(({ id, icon: Icon, label, desc }) => (
                  <button key={id} onClick={() => setJob(id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col ${job === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                    <Icon className={`w-5 h-5 mb-1.5 ${job === id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-medium text-xs text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">{desc}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="font-medium text-foreground text-sm mb-3">경력 수준</h3>
                <div className="flex flex-col gap-2">
                  {LEVELS.map(({ id, label, desc }) => (
                    <button key={id} onClick={() => setLevel(id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${level === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                      <div>
                        <div className="font-medium text-sm text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                      </div>
                      {level === id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5 mt-5">
                <label className="text-sm text-muted-foreground block mb-2">질문 수</label>
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

          {/* Step 2: Interview type */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">면접 유형을 선택하세요</h2>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map(({ id, icon: Icon, label, desc }) => (
                  <button key={id} onClick={() => setType(id)}
                    className={`p-4 rounded-xl border text-left transition-all ${type === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                    <Icon className={`w-5 h-5 mb-2 ${type === id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-medium text-sm text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Company type + Interviewer */}
          {step === 3 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">회사 유형과 면접관 스타일을 선택하세요</h2>

              <h3 className="text-sm font-medium text-foreground mb-3">회사 유형</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
                {COMPANY_TYPES.map(({ id, icon: Icon, label, desc }) => (
                  <button key={id} onClick={() => setCompanyType(id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col ${companyType === id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}>
                    <Icon className={`w-5 h-5 mb-1.5 ${companyType === id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-medium text-xs text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">{desc.split(' ')[0]}</div>
                  </button>
                ))}
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

          {/* Step 4: Upload */}
          {step === 4 && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">자소서 입력 (선택)</h2>
              <p className="text-sm text-muted-foreground mb-5">
                자기소개서를 붙여넣으면 Claude AI가 개인화된 인성 질문을 추출합니다.
              </p>
              <textarea
                value={coverText}
                onChange={e => setCoverText(e.target.value)}
                placeholder="자기소개서 내용을 여기에 붙여넣으세요..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground mb-3"
              />
              {coverText.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  자소서 {coverText.length}자 — Claude AI가 맞춤 인성 질문을 생성합니다
                </div>
              )}
              {!coverText && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  자소서 없이도 면접을 시작할 수 있습니다.
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 pt-5 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">면접 설정 요약</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["직군", JOBS.find(j => j.id === job)?.label ?? "-"],
                    ["경력", LEVELS.find(l => l.id === level)?.label ?? "-"],
                    ["면접 유형", TYPES.find(t => t.id === type)?.label ?? "-"],
                    ["회사 유형", COMPANY_TYPES.find(c => c.id === companyType)?.label ?? "-"],
                    ["면접관", INTERVIEWER_TYPES.find(i => i.id === interviewer)?.label ?? "-"],
                    ["질문 수", `${count}문항`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary border border-border">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
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
