import { useNavigate } from "react-router";
import {
  BrainCircuit, CheckCircle2, Star, Play, Clock, Users,
  Mic, Video, FileText, BarChart3, Shield, Zap, ChevronRight,
  Award, TrendingUp, MessageSquare
} from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI 실시간 분석",
    desc: "답변 내용, 말하는 속도, 키워드 분포를 실시간으로 분석합니다.",
  },
  {
    icon: FileText,
    title: "이력서 기반 맞춤 질문",
    desc: "내 이력서와 지원 공고를 바탕으로 맞춤형 면접 질문을 생성합니다.",
  },
  {
    icon: Video,
    title: "화상·음성 모의 면접",
    desc: "실제 면접처럼 카메라·마이크를 활용해 현장감 있는 연습이 가능합니다.",
  },
  {
    icon: BarChart3,
    title: "상세 피드백 리포트",
    desc: "면접 종료 후 강점·약점·개선 포인트를 담은 리포트를 제공합니다.",
  },
  {
    icon: MessageSquare,
    title: "꼬리 질문 대응 훈련",
    desc: "AI 면접관이 답변에 맞게 즉석 꼬리 질문을 던져 실전 감각을 높입니다.",
  },
  {
    icon: TrendingUp,
    title: "성장 추이 트래킹",
    desc: "회차별 점수 변화를 비교해 실력 향상 추이를 한눈에 확인합니다.",
  },
];

const PLANS = [
  {
    id: "basic",
    name: "1회 이용권",
    price: "9,900",
    originalPrice: null,
    per: "1회",
    desc: "단건 면접 연습에 적합",
    features: ["AI 모의면접 1회", "기본 피드백 리포트", "30일 이내 사용"],
    badge: null,
    highlight: false,
  },
  {
    id: "standard",
    name: "월정액 스탠다드",
    price: "29,900",
    originalPrice: "39,900",
    per: "월",
    desc: "꾸준히 연습하는 취준생 추천",
    features: ["AI 모의면접 무제한", "상세 피드백 리포트", "이력서 기반 맞춤 질문", "성장 추이 리포트", "커뮤니티 프리미엄 배지"],
    badge: "가장 인기",
    highlight: true,
  },
  {
    id: "premium",
    name: "월정액 프리미엄",
    price: "59,900",
    originalPrice: "79,900",
    per: "월",
    desc: "전문 피드백까지 원하는 분께",
    features: ["스탠다드 모든 혜택", "전문 면접관 1:1 피드백 (월 1회)", "공고 맞춤 자기소개서 첨삭", "우선 고객지원"],
    badge: "프리미엄",
    highlight: false,
  },
];

const REVIEWS = [
  { name: "이*현", company: "카카오 합격", rating: 5, text: "꼬리 질문이 진짜 면접이랑 거의 똑같아서 실전에서 당황하지 않았어요. 피드백 리포트도 구체적이고 정말 도움됐습니다." },
  { name: "박*준", company: "네이버 합격", rating: 5, text: "이력서 기반 맞춤 질문이 신기했어요. 내 프로젝트 경험 기반으로 질문해줘서 어색함 없이 연습할 수 있었습니다." },
  { name: "김*영", company: "토스 최종합격", rating: 5, text: "말하는 속도와 키워드 분석이 특히 좋았어요. 제가 말이 빠르다는 걸 처음 깨달았습니다. 덕분에 고쳤어요!" },
];

export function InterviewLanding() {
  const navigate = useNavigate();

  function handleSelectPlan(planId: string) {
    navigate("/interview/payment", { state: { planId } });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-24 px-4">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, #6C63FF22 0%, transparent 50%), radial-gradient(circle at 80% 70%, #8B5CF622 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI 기반 모의 면접 서비스
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            실전처럼 연습하고<br />
            <span style={{ color: "#6C63FF" }}>합격을 앞당기세요</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI 면접관이 내 이력서와 지원 공고를 분석해 맞춤 질문을 제시합니다.
            실시간 피드백과 상세 리포트로 빠르게 성장하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleSelectPlan("standard")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-primary/25"
              style={{ backgroundColor: "#6C63FF" }}
            >
              <Play className="w-4 h-4" />
              지금 시작하기
            </button>
            <button
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              요금제 보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "12,400+", label: "누적 면접 세션" },
              { value: "94%", label: "사용자 만족도" },
              { value: "3.2배", label: "합격률 향상" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">어떻게 진행되나요?</h2>
            <p className="text-gray-500">간단한 3단계로 실전 면접을 경험하세요</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: FileText, title: "이력서 & 공고 선택", desc: "내 이력서와 지원할 공고를 선택하면 AI가 맞춤 질문을 생성합니다." },
              { step: "02", icon: Mic, title: "AI 면접 진행", desc: "실제 면접처럼 답변하면 AI 면접관이 꼬리 질문을 이어갑니다." },
              { step: "03", icon: BarChart3, title: "리포트 확인", desc: "면접 후 강점·약점·키워드 분석이 담긴 상세 리포트를 받습니다." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" style={{ color: "#6C63FF" }} />
                </div>
                <div className="text-xs font-bold text-primary mb-2" style={{ color: "#6C63FF" }}>STEP {step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">주요 기능</h2>
            <p className="text-gray-500">DevReady만의 차별화된 기능을 경험하세요</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" style={{ color: "#6C63FF" }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">요금제 선택</h2>
            <p className="text-gray-500">나에게 맞는 플랜으로 시작하세요</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-shadow ${
                  plan.highlight
                    ? "border-primary shadow-xl shadow-primary/10"
                    : "border-gray-200 hover:shadow-md"
                }`}
                style={plan.highlight ? { borderColor: "#6C63FF" } : {}}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap"
                    style={{ backgroundColor: "#6C63FF" }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <div className="font-bold text-gray-900 mb-1">{plan.name}</div>
                  <div className="text-sm text-gray-500">{plan.desc}</div>
                </div>
                <div className="mb-6">
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-400 line-through mb-0.5">₩{plan.originalPrice}</div>
                  )}
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900">₩{plan.price}</span>
                    <span className="text-sm text-gray-500 mb-1">/ {plan.per}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#6C63FF" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "text-white hover:bg-indigo-600"
                      : "border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                  }`}
                  style={plan.highlight ? { backgroundColor: "#6C63FF" } : {}}
                >
                  선택하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">합격자들의 후기</h2>
            <p className="text-gray-500">DevReady와 함께 꿈의 기업에 합격했습니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold" style={{ color: "#6C63FF" }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-primary" style={{ color: "#6C63FF" }}>{r.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center text-white"
          style={{ background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)" }}
        >
          <Award className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-white/80 mb-8 text-base">
            합격을 향한 첫 번째 모의 면접, 오늘부터 시작해보세요.
          </p>
          <button
            onClick={() => handleSelectPlan("standard")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white font-semibold hover:bg-gray-50 transition-colors"
            style={{ color: "#6C63FF" }}
          >
            <Play className="w-4 h-4" />
            모의 면접 시작하기
          </button>
        </div>
      </section>
    </div>
  );
}
