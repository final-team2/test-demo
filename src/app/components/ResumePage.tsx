import { useState, useRef } from "react";
import {
  Sparkles, Plus, Trash2, History, Shield, CheckCircle2,
  Eye, Download, X, Save, RotateCcw, ChevronRight,
  FileText, User, GraduationCap, Briefcase, Code2, AlignLeft,
  Clock, AlertCircle, Copy, Check
} from "lucide-react";
import jsPDF from "jspdf";

// ─── Types ────────────────────────────────────────────────
interface Education {
  school: string; major: string; grade: string; period: string;
}
interface Career {
  company: string; role: string; period: string; desc: string;
}
interface ResumeData {
  id: string;
  name: string;
  basic: { name: string; email: string; phone: string; address: string; github: string; portfolio: string };
  educations: Education[];
  careers: Career[];
  skills: string[];
  coverText: string;
}
interface ResumeVersion {
  id: string;
  label: string;
  date: string;
  desc: string;
  data: ResumeData;
}

// ─── Initial data ─────────────────────────────────────────
const INITIAL_RESUME: ResumeData = {
  id: "r1",
  name: "카카오 지원용",
  basic: { name: "김지수", email: "jisu@example.com", phone: "010-1234-5678", address: "서울 강남구", github: "github.com/jisu-kim", portfolio: "" },
  educations: [{ school: "한국대학교", major: "컴퓨터공학과", grade: "3.8/4.5", period: "2020.03 ~ 2026.02" }],
  careers: [{ company: "(주)스타트업A", role: "프론트엔드 인턴", period: "2025.07 ~ 2025.12", desc: "React 기반 대시보드 개발 및 유지보수" }],
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
  coverText: "React와 TypeScript를 주력으로 사용하며, 사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다.",
};

const CONSENT_ITEMS = [
  { id: "name", label: "이름", type: "필수" },
  { id: "contact", label: "연락처", type: "필수" },
  { id: "edu", label: "학력", type: "필수" },
  { id: "career", label: "경력", type: "필수" },
  { id: "photo", label: "사진", type: "선택" },
  { id: "portfolio", label: "포트폴리오", type: "선택" },
  { id: "github", label: "깃허브 링크", type: "선택" },
];

// ─── Mock AI responses ────────────────────────────────────
const AI_SUGGESTIONS: Record<string, (data: ResumeData) => Partial<ResumeData>> = {
  basic: (d) => ({
    basic: {
      ...d.basic,
      portfolio: d.basic.portfolio || "jisu-dev.vercel.app",
    },
  }),
  coverText: (d) => ({
    coverText: `저는 사용자 중심의 웹 경험을 만드는 것에 열정을 가진 프론트엔드 개발자입니다. React와 TypeScript를 활용한 ${d.careers.length > 0 ? d.careers.length + "개 회사의 실무 경험으로" : "프로젝트 경험으로"} 컴포넌트 설계, 성능 최적화, 팀 협업 역량을 키워왔습니다. 특히 Next.js 기반 SSR 최적화로 LCP를 40% 개선한 경험이 있으며, 코드 리뷰 문화 정착을 통해 팀 생산성을 높였습니다. 귀사에서 더 큰 서비스와 사용자를 만나며 성장하고 싶습니다.`,
  }),
  careers: (d) => ({
    careers: d.careers.map(c => ({
      ...c,
      desc: c.desc || "React/TypeScript 기반 웹 애플리케이션 개발, 성능 최적화 및 코드 리뷰 참여, 애자일 스프린트 방식으로 팀 협업",
    })),
  }),
  skills: () => ({
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "Git", "Figma", "REST API", "Jest"],
  }),
};

type Section = "basic" | "edu" | "career" | "skills" | "cover";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "기본 정보", icon: User },
  { id: "edu", label: "학력", icon: GraduationCap },
  { id: "career", label: "경력", icon: Briefcase },
  { id: "skills", label: "스킬", icon: Code2 },
  { id: "cover", label: "자기소개서", icon: AlignLeft },
];

// ─── PDF generation ───────────────────────────────────────
function generatePDF(resume: ResumeData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const lm = 20, rm = 190, tw = rm - lm;
  let y = 20;

  const line = (text: string, size = 10, bold = false, color = "#111") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color);
    doc.text(text, lm, y);
    y += size * 0.5 + 2;
  };
  const rule = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(lm, y, rm, y);
    y += 4;
  };
  const section = (title: string) => {
    y += 2;
    line(title, 12, true, "#6C63FF");
    rule();
  };

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#111");
  doc.text(resume.basic.name || "이름 없음", lm, y); y += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#555");
  const contact = [resume.basic.email, resume.basic.phone, resume.basic.address].filter(Boolean).join("  |  ");
  doc.text(contact, lm, y); y += 5;
  if (resume.basic.github) { doc.text(`GitHub: ${resume.basic.github}`, lm, y); y += 5; }
  if (resume.basic.portfolio) { doc.text(`Portfolio: ${resume.basic.portfolio}`, lm, y); y += 5; }
  y += 3;
  doc.setDrawColor(108, 99, 255);
  doc.setLineWidth(0.5);
  doc.line(lm, y, rm, y); y += 6;

  // Education
  if (resume.educations.length > 0) {
    section("학력");
    resume.educations.forEach(e => {
      line(`${e.school} · ${e.major}`, 10, true);
      y -= 1;
      line(`${e.period}  학점: ${e.grade}`, 9, false, "#555");
      y += 1;
    });
  }

  // Career
  if (resume.careers.length > 0) {
    section("경력");
    resume.careers.forEach(c => {
      line(`${c.company} — ${c.role}`, 10, true);
      y -= 1;
      line(c.period, 9, false, "#555");
      if (c.desc) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#333");
        const wrapped = doc.splitTextToSize(c.desc, tw);
        doc.text(wrapped, lm, y);
        y += wrapped.length * 4.5 + 2;
      }
      y += 1;
    });
  }

  // Skills
  if (resume.skills.length > 0) {
    section("기술 스택");
    line(resume.skills.join("  /  "), 9, false, "#333");
    y += 2;
  }

  // Cover letter
  if (resume.coverText) {
    section("자기소개서");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#333");
    const wrapped = doc.splitTextToSize(resume.coverText, tw);
    doc.text(wrapped, lm, y);
  }

  doc.save(`이력서_${resume.basic.name || "resume"}_${new Date().toLocaleDateString("ko-KR").replace(/\. /g, "-").replace(".", "")}.pdf`);
}

// ─── Sub-components ───────────────────────────────────────
function AiSuggestionPanel({
  section,
  current,
  onApply,
  onClose,
}: {
  section: Section;
  current: ResumeData;
  onApply: (patch: Partial<ResumeData>) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Partial<ResumeData> | null>(null);
  const [applied, setApplied] = useState(false);

  const sectionKey = section === "cover" ? "coverText" : section === "career" ? "careers" : section === "skills" ? "skills" : "basic";

  const generate = () => {
    setLoading(true);
    setSuggestion(null);
    setApplied(false);
    setTimeout(() => {
      const fn = AI_SUGGESTIONS[sectionKey === "coverText" ? "coverText" : section];
      if (fn) setSuggestion(fn(current));
      setLoading(false);
    }, 1800);
  };

  const sectionLabel = SECTIONS.find(s => s.id === section)?.label ?? "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl border border-border bg-card w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">AI 자동 완성 — {sectionLabel}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            입력된 경력·스킬 정보를 기반으로 Claude AI가 {sectionLabel} 항목을 자동 완성해드립니다.
          </p>

          {!suggestion && (
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Claude AI 작성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />AI 자동 완성 생성
                </>
              )}
            </button>
          )}

          {suggestion && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-1.5 mb-2 text-xs text-primary font-medium">
                  <Sparkles className="w-3.5 h-3.5" />Claude AI 제안
                </div>
                <div className="text-sm text-foreground leading-relaxed max-h-48 overflow-y-auto">
                  {sectionKey === "coverText" && (suggestion as any).coverText && (
                    <p>{(suggestion as any).coverText}</p>
                  )}
                  {sectionKey === "skills" && (suggestion as any).skills && (
                    <div className="flex flex-wrap gap-1.5">
                      {((suggestion as any).skills as string[]).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  {sectionKey === "careers" && (suggestion as any).careers && (
                    <div className="space-y-2">
                      {((suggestion as any).careers as Career[]).map((c, i) => (
                        <div key={i}>
                          <div className="font-medium text-xs">{c.company} — {c.role}</div>
                          <div className="text-xs text-muted-foreground">{c.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {sectionKey === "basic" && (suggestion as any).basic && (
                    <div className="text-xs space-y-1">
                      {Object.entries((suggestion as any).basic).map(([k, v]) => v && (
                        <div key={k}><span className="text-muted-foreground">{k}:</span> {v as string}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { onApply(suggestion); setApplied(true); }}
                  disabled={applied}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {applied ? <><Check className="w-4 h-4" />반영 완료</> : <>이력서에 반영</>}
                </button>
                <button onClick={generate} className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />재생성
                </button>
              </div>
              {applied && (
                <button onClick={onClose} className="w-full py-2 rounded-xl border border-border text-sm text-foreground hover:bg-secondary">
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────
export function ResumePage() {
  const [resumes, setResumes] = useState<ResumeData[]>([INITIAL_RESUME]);
  const [activeId, setActiveId] = useState("r1");
  const [versions, setVersions] = useState<Record<string, ResumeVersion[]>>({
    r1: [
      { id: "rv1", label: "v1 — 최초 작성", date: "2026.04.12", desc: "최초 작성본", data: { ...INITIAL_RESUME } },
      { id: "rv2", label: "v2 — 네이버 지원용", date: "2026.05.20", desc: "자소서 보강", data: { ...INITIAL_RESUME, name: "네이버 지원용" } },
    ],
  });
  const [activeSection, setActiveSection] = useState<Section>("basic");
  const [showHistory, setShowHistory] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [aiPanel, setAiPanel] = useState<Section | null>(null);
  const [optConsent, setOptConsent] = useState<Record<string, boolean>>({ photo: false, portfolio: true, github: true });
  const [skillInput, setSkillInput] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<ResumeVersion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const resume = resumes.find(r => r.id === activeId)!;

  const updateResume = (patch: Partial<ResumeData>) => {
    setResumes(arr => arr.map(r => r.id === activeId ? { ...r, ...patch } : r));
  };
  const updateBasic = (key: string, val: string) => {
    setResumes(arr => arr.map(r => r.id === activeId ? { ...r, basic: { ...r.basic, [key]: val } } : r));
  };

  const saveVersion = () => {
    const now = new Date();
    const label = `v${(versions[activeId]?.length ?? 0) + 1} — ${resume.name}`;
    const ver: ResumeVersion = {
      id: `rv${Date.now()}`,
      label,
      date: now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, "."),
      desc: "수동 저장",
      data: { ...resume, educations: [...resume.educations], careers: [...resume.careers], skills: [...resume.skills] },
    };
    setVersions(v => ({ ...v, [activeId]: [...(v[activeId] ?? []), ver] }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const createResume = () => {
    const id = `r${Date.now()}`;
    const nr: ResumeData = {
      id, name: "새 이력서",
      basic: { name: "", email: "", phone: "", address: "", github: "", portfolio: "" },
      educations: [], careers: [], skills: [], coverText: "",
    };
    setResumes(r => [...r, nr]);
    setVersions(v => ({ ...v, [id]: [] }));
    setActiveId(id);
    setActiveSection("basic");
    setShowHistory(false);
  };

  const deleteResume = (id: string) => {
    if (resumes.length === 1) return;
    const next = resumes.find(r => r.id !== id);
    setResumes(r => r.filter(x => x.id !== id));
    if (activeId === id && next) setActiveId(next.id);
    setDeleteConfirm(null);
  };

  const restoreVersion = (ver: ResumeVersion) => {
    setResumes(arr => arr.map(r => r.id === activeId ? { ...ver.data, id: activeId, name: resume.name } : r));
    setPreviewVersion(null);
    setShowHistory(false);
  };

  const applyAI = (patch: Partial<ResumeData>) => {
    updateResume(patch);
  };

  const thisVersions = versions[activeId] ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">이력서</h1>
          <p className="text-sm text-muted-foreground mt-1">AI가 자동 완성을 도와드립니다</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-secondary text-sm text-foreground hover:bg-muted transition-colors">
            <History className="w-4 h-4" />히스토리 {thisVersions.length > 0 && <span className="text-xs text-primary font-medium">({thisVersions.length})</span>}
          </button>
          <button onClick={() => setShowConsent(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-secondary text-sm text-foreground hover:bg-muted transition-colors">
            <Shield className="w-4 h-4" />공개 설정
          </button>
          <button
            onClick={() => generatePDF(resume)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm hover:bg-primary/10 transition-colors"
          >
            <Download className="w-4 h-4" />PDF 저장
          </button>
          <button onClick={saveVersion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">
            {savedMsg ? <><Check className="w-4 h-4" />저장됨</> : <><Save className="w-4 h-4" />저장</>}
          </button>
        </div>
      </div>

      {/* Resume tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {resumes.map(r => (
          <div key={r.id} className="relative group shrink-0">
            {renamingId === r.id ? (
              <form onSubmit={e => { e.preventDefault(); setResumes(arr => arr.map(x => x.id === r.id ? { ...x, name: renameVal || x.name } : x)); setRenamingId(null); }}>
                <input
                  autoFocus
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onBlur={() => { setResumes(arr => arr.map(x => x.id === r.id ? { ...x, name: renameVal || x.name } : x)); setRenamingId(null); }}
                  className="px-3 py-1.5 rounded-lg border border-primary text-sm text-foreground bg-card focus:outline-none w-32"
                />
              </form>
            ) : (
              <button
                onClick={() => { setActiveId(r.id); setShowHistory(false); }}
                onDoubleClick={() => { setRenamingId(r.id); setRenameVal(r.name); }}
                className={`px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5 ${activeId === r.id ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}
                title="더블클릭으로 이름 변경"
              >
                <FileText className="w-3.5 h-3.5" />{r.name}
              </button>
            )}
            {resumes.length > 1 && r.id !== activeId && (
              <button
                onClick={() => setDeleteConfirm(r.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-400 text-white hidden group-hover:flex items-center justify-center"
              ><X className="w-2.5 h-2.5" /></button>
            )}
          </div>
        ))}
        <button onClick={createResume}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
          <Plus className="w-3.5 h-3.5" />새 이력서
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><History className="w-4 h-4" />이력서 버전 히스토리</h3>
            <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {thisVersions.length === 0 && (
            <p className="text-sm text-muted-foreground">저장 버튼을 누르면 버전이 생성됩니다.</p>
          )}
          <div className="flex flex-col gap-2">
            {[...thisVersions].reverse().map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{v.label}</span>
                    <span className="text-xs text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewVersion(v)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-indigo-600">
                    <Eye className="w-3 h-3" />열람
                  </button>
                  <button
                    onClick={() => restoreVersion(v)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <RotateCcw className="w-3 h-3" />복원
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section nav */}
        <div className="flex flex-row lg:flex-col gap-1 lg:sticky lg:top-24 h-fit overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition-colors whitespace-nowrap ${activeSection === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"}`}>
              <s.icon className="w-3.5 h-3.5 shrink-0" />{s.label}
            </button>
          ))}

          <div className="hidden lg:block mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setAiPanel(activeSection)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />AI 자동 완성
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
          {/* Mobile AI button */}
          <div className="flex items-center justify-between mb-5 lg:hidden">
            <h2 className="font-semibold text-foreground">{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
            <button onClick={() => setAiPanel(activeSection)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />AI 자동 완성
            </button>
          </div>

          {/* Basic info */}
          {activeSection === "basic" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-foreground hidden lg:block">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "이름", type: "text", span: false },
                  { key: "email", label: "이메일", type: "email", span: false },
                  { key: "phone", label: "연락처", type: "tel", span: false },
                  { key: "address", label: "거주지", type: "text", span: true },
                  { key: "github", label: "깃허브", type: "url", span: false },
                  { key: "portfolio", label: "포트폴리오", type: "url", span: false },
                ].map(f => (
                  <div key={f.key} className={f.span ? "col-span-2" : ""}>
                    <label className="text-sm text-muted-foreground block mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      value={(resume.basic as any)[f.key]}
                      onChange={e => updateBasic(f.key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {activeSection === "edu" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground hidden lg:block">학력</h2>
                <button onClick={() => updateResume({ educations: [...resume.educations, { school: "", major: "", grade: "", period: "" }] })}
                  className="flex items-center gap-1 text-sm text-primary hover:text-indigo-600"><Plus className="w-4 h-4" />추가</button>
              </div>
              {resume.educations.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">학력을 추가해주세요.</p>
              )}
              {resume.educations.map((edu, i) => (
                <div key={i} className="rounded-xl bg-secondary border border-border p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["school", "학교명"], ["major", "전공"], ["grade", "학점"], ["period", "재학기간"]].map(([k, l]) => (
                      <div key={k}>
                        <label className="text-xs text-muted-foreground block mb-1">{l}</label>
                        <input
                          value={(edu as any)[k]}
                          onChange={e => updateResume({ educations: resume.educations.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x) })}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => updateResume({ educations: resume.educations.filter((_, j) => j !== i) })}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 self-start">
                    <Trash2 className="w-3.5 h-3.5" />삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Career */}
          {activeSection === "career" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground hidden lg:block">경력</h2>
                <button onClick={() => updateResume({ careers: [...resume.careers, { company: "", role: "", period: "", desc: "" }] })}
                  className="flex items-center gap-1 text-sm text-primary hover:text-indigo-600"><Plus className="w-4 h-4" />추가</button>
              </div>
              {resume.careers.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">경력을 추가해주세요. 신입이라면 프로젝트 경험을 입력하세요.</p>
              )}
              {resume.careers.map((career, i) => (
                <div key={i} className="rounded-xl bg-secondary border border-border p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["company", "회사명"], ["role", "직책/포지션"], ["period", "근무기간"]].map(([k, l]) => (
                      <div key={k} className={k === "period" ? "col-span-2" : ""}>
                        <label className="text-xs text-muted-foreground block mb-1">{l}</label>
                        <input
                          value={(career as any)[k]}
                          onChange={e => updateResume({ careers: resume.careers.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x) })}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">주요 업무 및 성과</label>
                    <textarea
                      value={career.desc}
                      onChange={e => updateResume({ careers: resume.careers.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })}
                      placeholder="주요 업무, 사용 기술, 성과 등을 작성하세요"
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary/60 resize-none h-20 placeholder:text-muted-foreground"
                    />
                  </div>
                  <button onClick={() => updateResume({ careers: resume.careers.filter((_, j) => j !== i) })}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 self-start">
                    <Trash2 className="w-3.5 h-3.5" />삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {activeSection === "skills" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-foreground hidden lg:block">기술 스택</h2>
              <div className="flex flex-wrap gap-2 min-h-12">
                {resume.skills.map(s => (
                  <div key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
                    {s}
                    <button onClick={() => updateResume({ skills: resume.skills.filter(x => x !== s) })} className="ml-1 hover:text-indigo-800">×</button>
                  </div>
                ))}
                {resume.skills.length === 0 && <p className="text-sm text-muted-foreground self-center">기술 스택을 추가해주세요.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { updateResume({ skills: [...resume.skills, skillInput.trim()] }); setSkillInput(""); } }}
                  placeholder="스킬 입력 후 Enter"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => { if (skillInput.trim()) { updateResume({ skills: [...resume.skills, skillInput.trim()] }); setSkillInput(""); } }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600">추가</button>
              </div>
            </div>
          )}

          {/* Cover letter */}
          {activeSection === "cover" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-foreground hidden lg:block">자기소개서</h2>
              <textarea
                value={resume.coverText}
                onChange={e => updateResume({ coverText: e.target.value })}
                placeholder="자기소개서를 작성하거나 AI 자동 완성을 활용하세요."
                className="w-full h-64 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 resize-none leading-relaxed placeholder:text-muted-foreground"
              />
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {resume.coverText.length}자 작성됨
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
            <button onClick={() => setAiPanel(activeSection)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm hover:bg-primary/10 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />AI 자동 완성
            </button>
            <button onClick={saveVersion}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">
              {savedMsg ? <><Check className="w-4 h-4" />저장됨!</> : <><Save className="w-4 h-4" />저장</>}
            </button>
          </div>
        </div>
      </div>

      {/* AI suggestion panel */}
      {aiPanel && (
        <AiSuggestionPanel
          section={aiPanel}
          current={resume}
          onApply={applyAI}
          onClose={() => setAiPanel(null)}
        />
      )}

      {/* Consent modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">정보 공개 동의 설정</h3>
              </div>
              <button onClick={() => setShowConsent(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">기업 측에 공개할 이력서 항목을 설정합니다. 필수 항목은 동의 없이 공개됩니다.</p>
            <div className="flex flex-col gap-3 mb-6">
              {CONSENT_ITEMS.map(item => {
                const isRequired = item.type === "필수";
                const checked = isRequired || optConsent[item.id];
                return (
                  <div key={item.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isRequired ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary border border-border text-muted-foreground"}`}>
                        {item.type}
                      </span>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    {isRequired ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <button
                        onClick={() => setOptConsent(c => ({ ...c, [item.id]: !c[item.id] }))}
                        className={`w-10 h-6 rounded-full transition-colors relative ${optConsent[item.id] ? "bg-primary" : "bg-border"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${optConsent[item.id] ? "left-5" : "left-1"}`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowConsent(false)} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">
              저장
            </button>
          </div>
        </div>
      )}

      {/* Version preview modal */}
      {previewVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-semibold text-foreground">{previewVersion.label}</h3>
                <p className="text-xs text-muted-foreground">{previewVersion.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => restoreVersion(previewVersion)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600">
                  <RotateCcw className="w-3.5 h-3.5" />이 버전으로 복원
                </button>
                <button onClick={() => setPreviewVersion(null)} className="p-2 rounded-xl hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-1 text-xs uppercase text-muted-foreground tracking-wider">기본 정보</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {Object.entries(previewVersion.data.basic).map(([k, v]) => v && (
                    <div key={k} className="text-muted-foreground">{k}: <span className="text-foreground">{v}</span></div>
                  ))}
                </div>
              </div>
              {previewVersion.data.educations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1 text-xs uppercase text-muted-foreground tracking-wider">학력</h4>
                  {previewVersion.data.educations.map((e, i) => (
                    <div key={i} className="text-foreground">{e.school} · {e.major} ({e.period})</div>
                  ))}
                </div>
              )}
              {previewVersion.data.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1 text-xs uppercase text-muted-foreground tracking-wider">스킬</h4>
                  <p className="text-foreground">{previewVersion.data.skills.join(", ")}</p>
                </div>
              )}
              {previewVersion.data.coverText && (
                <div>
                  <h4 className="font-medium text-foreground mb-1 text-xs uppercase text-muted-foreground tracking-wider">자기소개서</h4>
                  <p className="text-foreground leading-relaxed">{previewVersion.data.coverText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-foreground mb-2">이력서 삭제</h3>
            <p className="text-sm text-muted-foreground mb-5">이 이력서를 삭제하면 복구할 수 없습니다. 계속하시겠습니까?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary">취소</button>
              <button onClick={() => deleteResume(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
