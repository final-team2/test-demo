import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ChevronRight, SlidersHorizontal, Gauge } from "lucide-react";

type Variant = "education" | "jobs" | "interview";

// 회원가입/온보딩에서 받은 "기본 베이스 정보" 선택지 (mock)
const ROLES = ["프론트엔드", "백엔드", "풀스택", "AI/ML", "DevOps", "데이터"];
const PURPOSES = ["실무 역량 강화", "취업 준비", "이직 준비", "기초 다지기"];
const CAREERS = ["신입 (0~1년)", "주니어 (1~3년)", "미들 (3~5년)", "시니어 (5년+)"];
const LANGUAGES = ["JavaScript", "TypeScript", "React"];

// 레벨 테스트 결과 (mock)
const LEVEL_TEST = { label: "중급", score: 68 };

const RECO: Record<Variant, { title: string; desc: string; items: string[]; cta: string; href: string }> = {
  education: {
    title: "맞춤 학습 경로",
    desc: "레벨 테스트 결과와 기본 정보를 기준으로 추천된 강의예요.",
    items: ["React 성능 최적화 심화", "TypeScript 타입 시스템", "프론트엔드 CS 면접 대비"],
    cta: "추천 강의 보기", href: "/education",
  },
  jobs: {
    title: "맞춤 공고 추천",
    desc: "희망 직군·경력·사용 언어에 맞는 공고를 우선 보여드려요.",
    items: ["카카오 프론트엔드 (신입)", "토스 React 개발자", "당근 웹 프론트엔드"],
    cta: "추천 공고 보기", href: "/jobs",
  },
  interview: {
    title: "맞춤 모의면접",
    desc: "레벨과 직군에 맞춘 난이도로 예상 질문을 구성했어요.",
    items: ["프론트엔드 기술면접 (중급)", "React 심화 질문", "CS 기초 면접"],
    cta: "모의면접 시작", href: "/interview/setup",
  },
};

function Field({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-lg bg-white border border-border text-sm text-foreground focus:outline-none focus:border-primary/60">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function AIRecommendCard({ variant }: { variant: Variant }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [career, setCareer] = useState(CAREERS[0]);
  const r = RECO[variant];

  return (
    <div className="rounded-2xl border border-primary/20 p-5 mb-8"
      style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(139,92,246,0.08))" }}>
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">AI 맞춤 추천</h2>
          <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Gauge className="w-3 h-3" />레벨테스트 {LEVEL_TEST.label} · {LEVEL_TEST.score}점
          </span>
        </div>
        <button onClick={() => navigate("/resume")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5" />이력서 작성하기
        </button>
      </div>

      {/* 기본 베이스 정보 4가지 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        <Field label="희망 직군" value={role} options={ROLES} onChange={setRole} />
        <Field label="교육 목적" value={purpose} options={PURPOSES} onChange={setPurpose} />
        <Field label="경력" value={career} options={CAREERS} onChange={setCareer} />
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block">사용 가능 언어</label>
          <div className="flex flex-wrap gap-1 px-1 py-1.5">
            {LANGUAGES.map(l => (
              <span key={l} className="text-[11px] bg-white border border-primary/20 text-primary px-1.5 py-0.5 rounded-full">{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 추천 결과 */}
      <div className="rounded-xl bg-white border border-primary/10 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">{r.title}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {r.items.map(it => (
            <span key={it} className="text-xs bg-primary/5 border border-primary/15 text-foreground px-2.5 py-1 rounded-lg">{it}</span>
          ))}
        </div>
        <button onClick={() => navigate(r.href)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-indigo-600 transition-colors">
          {r.cta} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
