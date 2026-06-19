import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Eye, EyeOff, CheckCircle2, CreditCard, History, FileText, User,
  ChevronDown, ChevronUp, Briefcase, Clock, ChevronRight,
  Camera, TrendingUp, AlertCircle, RotateCcw, X,
  Plus, GraduationCap, Award, Target
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { getCareer, saveCareer } from "../auth";
import { EDUCATION_GOALS, CHECKLIST, getDoneMap, toggleDone, completionRate, goalProgress, achievementHistory } from "../data/checklist";

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS = [
  { id: "free", label: "무료", price: "0원", features: ["월 3회 면접", "기본 피드백", "커뮤니티 이용"] },
  { id: "basic", label: "베이직", price: "9,900원/월", features: ["월 20회 면접", "항목별 상세 피드백", "음성 분석", "PDF 리포트"] },
  { id: "pro", label: "프로", price: "19,900원/월", features: ["무제한 면접", "영상 분석(표정·시선)", "AI 이력서 자동완성", "1:1 멘토링 연결"] },
];

const RESUME_HISTORY = [
  {
    id: "v3", label: "v3 — 카카오 지원용", date: "2026.06.05",
    summary: "카카오 FE 포지션 맞춤 수정. 프로젝트 항목 2건 추가, 기술 스택 업데이트",
    skills: ["React", "TypeScript", "Next.js", "GraphQL"],
    careers: 2, projects: 4,
  },
  {
    id: "v2", label: "v2 — 네이버 지원용", date: "2026.05.20",
    summary: "네이버 서버 포지션 지원용. 백엔드 프로젝트 강조, 자기소개 문구 수정",
    skills: ["Java", "Spring Boot", "MySQL", "Redis"],
    careers: 2, projects: 3,
  },
  {
    id: "v1", label: "v1 — 최초 작성", date: "2026.04.12",
    summary: "첫 작성본. 기본 정보 및 대학교 프로젝트 위주",
    skills: ["JavaScript", "React", "Node.js"],
    careers: 0, projects: 2,
  },
];

const INTERVIEW_HISTORY = [
  {
    id: "1", date: "2026.06.05", type: "기술 면접", score: 80, grade: "B+",
    scores: { technical: 78, logic: 82, specificity: 76, depth: 74, communication: 88 },
    wpm: 148, silenceCount: 2, gazeStability: 78,
  },
  {
    id: "2", date: "2026.06.01", type: "인성 면접", score: 76, grade: "B",
    scores: { technical: 72, logic: 78, specificity: 70, depth: 68, communication: 82 },
    wpm: 142, silenceCount: 3, gazeStability: 72,
  },
  {
    id: "3", date: "2026.05.25", type: "직무 면접", score: 72, grade: "C+",
    scores: { technical: 68, logic: 70, specificity: 65, depth: 62, communication: 78 },
    wpm: 135, silenceCount: 4, gazeStability: 65,
  },
  {
    id: "4", date: "2026.05.18", type: "기술 면접", score: 68, grade: "C+",
    scores: { technical: 60, logic: 65, specificity: 62, depth: 58, communication: 74 },
    wpm: 130, silenceCount: 5, gazeStability: 60,
  },
];

const APPLICATION_HISTORY = [
  {
    id: "a1", jobId: "1", company: "카카오", title: "프론트엔드 개발자", location: "판교",
    appliedAt: "2026.06.05", status: "서류 검토 중",
    statusCls: "text-blue-600 bg-blue-50 border-blue-200",
    resume: "v3 — 카카오 지원용",
  },
  {
    id: "a2", jobId: "3", company: "토스", title: "백엔드 개발자 (Java)", location: "강남",
    appliedAt: "2026.05.28", status: "서류 합격",
    statusCls: "text-green-600 bg-green-50 border-green-200",
    resume: "v2 — 네이버 지원용",
  },
  {
    id: "a3", jobId: "2", company: "네이버", title: "풀스택 개발자", location: "분당",
    appliedAt: "2026.05.15", status: "불합격",
    statusCls: "text-red-600 bg-red-50 border-red-200",
    resume: "v2 — 네이버 지원용",
  },
];

// 교육센터 학습 진행도 mock (EducationPage / CalendarPage와 동일 값)
const LEARNING_COURSES = [
  { title: "알고리즘 기초 완성", done: 28, total: 42, accuracy: 82, color: "#6366F1" },
  { title: "React & TypeScript 심화", done: 29, total: 36, accuracy: 88, color: "#F59E0B" },
  { title: "네트워크 & HTTP", done: 11, total: 24, accuracy: 75, color: "#3B82F6" },
  { title: "Spring Boot & JPA", done: 5, total: 30, accuracy: 69, color: "#EC4899" },
];

const TABS = [
  { id: "evaluation", label: "학습 종합 평가", icon: Award },
  { id: "goals", label: "교육 목표", icon: Target },
  { id: "career", label: "맞춤 진로 변경", icon: TrendingUp },
  { id: "profile", label: "기본 정보", icon: User },
  { id: "applications", label: "지원 내역", icon: Briefcase },
  { id: "resume", label: "내 이력서", icon: FileText },
  { id: "interview", label: "면접 히스토리", icon: History },
  { id: "payment", label: "결제 정보", icon: CreditCard },
];

const CAREER_ROLES = ["프론트엔드", "백엔드", "풀스택", "AI/ML", "DevOps", "데이터"];
const CAREER_PURPOSES = ["실무 역량 강화", "취업 준비", "이직 준비", "기초 다지기"];
const CAREER_LANGS = ["JavaScript", "TypeScript", "React", "Java", "Spring", "Python", "Go", "Kotlin"];

// ─── Sub-views ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const [showPw, setShowPw] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [verifyPw, setVerifyPw] = useState("");
  const [verified, setVerified] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "김지수", email: "jisu@example.com", phone: "010-1234-5678", newPw: "", confirmPw: "" });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setEditMode(false);
    setVerified(false);
    setVerifyPw("");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground">회원정보 수정</h2>
        {saved && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />저장되었습니다</span>}
        {!editMode && (
          <button onClick={() => setEditMode(true)} className="text-sm text-primary hover:text-indigo-600 transition-colors">수정</button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border-2 border-primary/25 flex items-center justify-center overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
              : <span className="text-2xl text-primary font-bold">{profile.nickname[0]}</span>
            }
          </div>
          {editMode && (
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <div className="font-semibold text-foreground">{profile.nickname}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
          <div className="text-xs text-primary mt-0.5">프로 플랜 구독 중</div>
        </div>
      </div>

      {!editMode ? (
        <div className="flex flex-col gap-4">
          {[["닉네임", profile.nickname], ["이메일", profile.email], ["연락처", profile.phone]].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className="text-sm text-foreground">{value}</div>
            </div>
          ))}
        </div>
      ) : !verified ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">정보 수정을 위해 현재 비밀번호를 입력해주세요.</p>
          <div className="relative mb-4">
            <input type={showPw ? "text" : "password"} placeholder="현재 비밀번호" value={verifyPw}
              onChange={e => setVerifyPw(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary">취소</button>
            <button onClick={() => verifyPw.length >= 6 && setVerified(true)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">확인</button>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={saveProfile}>
          {([["nickname", "닉네임", "text"], ["email", "이메일", "email"], ["phone", "연락처", "tel"]] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input type={type} value={(profile as any)[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium text-foreground mb-3">비밀번호 변경 <span className="text-muted-foreground text-xs">(선택)</span></div>
            <div className="flex flex-col gap-3">
              <input type="password" placeholder="새 비밀번호 (6자 이상)" value={profile.newPw}
                onChange={e => setProfile(p => ({ ...p, newPw: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
              <input type="password" placeholder="새 비밀번호 확인" value={profile.confirmPw}
                onChange={e => setProfile(p => ({ ...p, confirmPw: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
              {profile.newPw && profile.confirmPw && profile.newPw !== profile.confirmPw && (
                <p className="text-xs text-red-400">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => { setEditMode(false); setVerified(false); }} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button type="submit"
              disabled={!!(profile.newPw && profile.newPw !== profile.confirmPw)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 disabled:opacity-40">저장</button>
          </div>
        </form>
      )}
    </div>
  );
}

function ResumeHistoryTab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState("v3");
  const [restored, setRestored] = useState<string | null>(null);

  const restore = (id: string, label: string) => {
    setCurrentVersion(id);
    setRestored(label);
    setTimeout(() => setRestored(null), 2500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-foreground">이력서 버전 히스토리</h2>
        {restored && (
          <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{restored}(으)로 복원됨</span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {RESUME_HISTORY.map(r => (
          <div key={r.id} className={`rounded-xl border overflow-hidden transition-all ${r.id === currentVersion ? "border-primary/40 bg-primary/3" : "border-border bg-secondary"}`}>
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              onClick={() => setOpenId(openId === r.id ? null : r.id)}>
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 ${r.id === currentVersion ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    {r.label}
                    {r.id === currentVersion && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">현재</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                </div>
              </div>
              {openId === r.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openId === r.id && (
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{r.summary}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.skills.map(s => <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span>경력 <b className="text-foreground">{r.careers}</b>건</span>
                  <span>프로젝트 <b className="text-foreground">{r.projects}</b>건</span>
                </div>
                <div className="flex gap-2">
                  {r.id !== currentVersion && (
                    <button onClick={() => restore(r.id, r.label)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-indigo-600 transition-colors">
                      <RotateCcw className="w-3 h-3" />이 버전으로 복원
                    </button>
                  )}
                  <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground text-xs hover:text-foreground transition-colors">열람</button>
                  <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground text-xs hover:text-foreground transition-colors">PDF 다운로드</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewHistoryTab() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  // Growth chart data
  const growthData = [...INTERVIEW_HISTORY].reverse().map((h, i) => ({
    회차: `${i + 1}회차`,
    날짜: h.date,
    종합: h.score,
    기술: h.scores.technical,
    소통: h.scores.communication,
  }));

  // Avg radar data
  const avgScores = {
    technical: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.technical, 0) / INTERVIEW_HISTORY.length),
    logic: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.logic, 0) / INTERVIEW_HISTORY.length),
    specificity: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.specificity, 0) / INTERVIEW_HISTORY.length),
    depth: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.depth, 0) / INTERVIEW_HISTORY.length),
    communication: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.communication, 0) / INTERVIEW_HISTORY.length),
  };

  const radarData = [
    { subject: "기술정확성", score: avgScores.technical },
    { subject: "논리구조", score: avgScores.logic },
    { subject: "구체성", score: avgScores.specificity },
    { subject: "심화이해", score: avgScores.depth },
    { subject: "커뮤니케이션", score: avgScores.communication },
  ];

  // Weak item analysis
  const weakItems = Object.entries(avgScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([key, val]) => ({
      key,
      val,
      label: key === "technical" ? "기술정확성" : key === "logic" ? "논리구조" : key === "specificity" ? "구체성" : key === "depth" ? "심화이해" : "커뮤니케이션",
      tip: key === "technical" ? "기술 면접 문제 풀이 및 CS 개념 정리를 늘려보세요."
        : key === "logic" ? "답변 시 서론-본론-결론 구조로 논리적으로 정리하는 연습을 하세요."
        : key === "specificity" ? "추상적인 설명 대신 수치·코드 예시를 포함해 구체적으로 말하세요."
        : key === "depth" ? "질문의 배경 원리까지 설명하는 심화 학습을 진행해보세요."
        : "필러워드를 줄이고 명확한 단어 선택 연습을 해보세요.",
    }));

  return (
    <div className="flex flex-col gap-6">
      {/* Growth line chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-1">성장 그래프</h2>
        <p className="text-xs text-muted-foreground mb-4">회차별 면접 점수 변화</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="회차" tick={{ fill: "#8B9CB8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fill: "#8B9CB8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0F1529", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
              labelStyle={{ color: "#E8EAED", fontSize: 12 }}
              itemStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8B9CB8" }} />
            <Line type="monotone" dataKey="종합" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366F1" }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="기술" stroke="#10B981" strokeWidth={1.5} dot={{ r: 3, fill: "#10B981" }} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="소통" stroke="#F59E0B" strokeWidth={1.5} dot={{ r: 3, fill: "#F59E0B" }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Radar + Weak analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-1">역량 레이더</h2>
          <p className="text-xs text-muted-foreground mb-2">누적 평균 5항목</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#8B9CB8", fontSize: 9 }} />
              <Radar name="평균" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-foreground">취약 항목 분석</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">누적 데이터 기반 자동 분석</p>
          <div className="flex flex-col gap-4">
            {weakItems.map(({ label, val, tip }) => (
              <div key={label} className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-sm text-yellow-400" style={{ fontFamily: "'DM Mono', monospace" }}>{val}점</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary mb-2">
                  <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${val}%` }} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                <button onClick={() => navigate("/interview/setup")}
                  className="mt-2 text-xs text-primary hover:underline flex items-center gap-0.5">
                  집중 훈련 시작 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session list */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">회차별 기록</h2>
        <div className="flex flex-col gap-3">
          {INTERVIEW_HISTORY.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-border overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors"
                onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-8 text-right shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>#{INTERVIEW_HISTORY.length - i}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{s.type}</div>
                    <div className="text-xs text-muted-foreground">{s.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{s.score}</div>
                    <div className="text-xs text-primary">{s.grade}</div>
                  </div>
                  {openId === s.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {openId === s.id && (
                <div className="px-4 pb-4 pt-3 border-t border-border bg-secondary/50">
                  {/* 5-item scores */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {([
                      { k: "technical", l: "기술", max: 30, v: Math.round(s.scores.technical * 0.3) },
                      { k: "logic", l: "논리", max: 20, v: Math.round(s.scores.logic * 0.2) },
                      { k: "specificity", l: "구체성", max: 20, v: Math.round(s.scores.specificity * 0.2) },
                      { k: "depth", l: "심화", max: 20, v: Math.round(s.scores.depth * 0.2) },
                      { k: "communication", l: "소통", max: 10, v: Math.round(s.scores.communication * 0.1) },
                    ]).map(({ k, l, max, v }) => (
                      <div key={k} className="rounded-lg bg-card border border-border p-2 text-center">
                        <div className="text-sm font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{v}</div>
                        <div className="text-xs text-muted-foreground">/{max}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Voice & gaze */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    <span>WPM <b className="text-foreground">{s.wpm}</b></span>
                    <span>침묵 <b className="text-foreground">{s.silenceCount}회</b></span>
                    <span>시선 안정성 <b className="text-foreground">{s.gazeStability}%</b></span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/interview/report/${s.id}`)}
                      className="text-xs text-primary hover:text-indigo-600 transition-colors flex items-center gap-0.5">
                      리포트 보기 <ChevronRight className="w-3 h-3" />
                    </button>
                    <button onClick={() => navigate("/interview/setup")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
                      다시 도전 <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">지원 내역</h2>
        <span className="text-xs text-muted-foreground">총 {APPLICATION_HISTORY.length}건</span>
      </div>
      {APPLICATION_HISTORY.map(a => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-foreground">{a.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${a.statusCls}`}>{a.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{a.company}</span>
                <span>{a.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.appliedAt} 지원</span>
              </div>
              <div className="text-xs text-muted-foreground">제출 이력서: <span className="text-foreground">{a.resume}</span></div>
            </div>
            <button onClick={() => navigate(`/jobs/${a.jobId}`)}
              className="flex items-center gap-1 text-xs text-primary hover:text-indigo-600 transition-colors shrink-0">
              공고 보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {a.status === "서류 합격" && (
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => navigate("/interview/setup")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                AI 모의 면접 준비하기 →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PaymentTab() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [changeTo, setChangeTo] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [changed, setChanged] = useState<string | null>(null);

  const confirmChange = () => {
    if (!changeTo) return;
    setCurrentPlan(changeTo);
    setChanged(PLANS.find(p => p.id === changeTo)?.label ?? "");
    setChangeTo(null);
    setTimeout(() => setChanged(null), 2500);
  };

  const confirmCancel = () => {
    setCancelled(true);
    setCurrentPlan("free");
    setShowCancel(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Subscription status */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground">구독 플랜</h2>
          {changed && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{changed} 플랜으로 변경됨</span>}
          {cancelled && <span className="text-xs text-red-400">구독이 해지되었습니다.</span>}
        </div>

        {/* Current plan info */}
        {!cancelled && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">{PLANS.find(p => p.id === currentPlan)?.label} 플랜</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  다음 결제일: <span className="text-foreground">2026.07.01</span> · 잔여 21일
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {PLANS.find(p => p.id === currentPlan)?.price}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map(p => (
            <div key={p.id} className={`rounded-xl p-4 border-2 transition-all ${p.id === currentPlan ? "border-primary bg-primary/5" : "border-border bg-secondary"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-foreground">{p.label}</span>
                {p.id === currentPlan && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">현재</span>}
              </div>
              <div className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>{p.price}</div>
              <ul className="flex flex-col gap-1.5 mb-3">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {p.id !== currentPlan && !cancelled && (
                <button onClick={() => setChangeTo(p.id)}
                  className="w-full py-2 rounded-lg bg-primary text-white text-xs hover:bg-indigo-600 transition-colors">
                  {PLANS.findIndex(x => x.id === p.id) > PLANS.findIndex(x => x.id === currentPlan) ? "업그레이드" : "다운그레이드"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">결제 정보</h2>
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">신한카드 **** 1234</div>
              <div className="text-xs text-muted-foreground">다음 결제: 2026.07.01</div>
            </div>
          </div>
          <button className="text-xs text-primary hover:text-indigo-600">변경</button>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-medium text-foreground mb-3">결제 내역</h3>
          {[
            { date: "2026.06.01", desc: "프로 플랜 월정액", amount: "19,900원" },
            { date: "2026.05.01", desc: "프로 플랜 월정액", amount: "19,900원" },
            { date: "2026.04.01", desc: "베이직 → 프로 업그레이드", amount: "10,000원" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm border-b border-border last:border-0">
              <div>
                <div className="text-foreground">{r.desc}</div>
                <div className="text-xs text-muted-foreground">{r.date}</div>
              </div>
              <span className="text-foreground font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{r.amount}</span>
            </div>
          ))}
        </div>

        {!cancelled && (
          <button onClick={() => setShowCancel(true)} className="mt-4 text-sm text-red-400 hover:text-red-600 transition-colors">구독 해지</button>
        )}
      </div>

      {/* Change plan confirm modal */}
      {changeTo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card p-6 w-full max-w-sm">
            <h3 className="font-semibold text-foreground mb-3">플랜 변경</h3>
            <p className="text-sm text-muted-foreground mb-5">
              <b className="text-foreground">{PLANS.find(p => p.id === currentPlan)?.label}</b> →{" "}
              <b className="text-primary">{PLANS.find(p => p.id === changeTo)?.label}</b> 플랜으로 변경하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setChangeTo(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
              <button onClick={confirmChange} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600">변경 확인</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-border bg-card p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-foreground">구독 해지</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">구독을 해지하면 다음 결제일(2026.07.01) 이후 무료 플랜으로 전환됩니다.</p>
            <p className="text-xs text-red-400 mb-5">무제한 면접, 영상 분석 등 프리미엄 기능이 종료됩니다.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">유지하기</button>
              <button onClick={confirmCancel} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600">해지 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Exp = { tech: string; years: number; months: number };

function CareerTab() {
  const initial = getCareer(); // 저장된 진로 정보(없으면 기본값)
  const [role, setRole] = useState(initial.role);
  const [purpose, setPurpose] = useState(initial.purpose);
  // 직군과 분리된 '기술별 경력' (예: React 1년, Java 3년 6개월, Python 5년)
  const [exps, setExps] = useState<Exp[]>(initial.exps);
  const [langs, setLangs] = useState<string[]>(initial.langs);
  const [saved, setSaved] = useState(false);

  const toggleLang = (l: string) => setLangs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const updateExp = (i: number, field: keyof Exp, value: string | number) =>
    setExps(p => p.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  const addExp = () => setExps(p => [...p, { tech: "", years: 0, months: 0 }]);
  const removeExp = (i: number) => setExps(p => p.filter((_, idx) => idx !== i));

  const selectCls = "w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60";
  const fmtExp = (e: Exp) => `${e.tech} ${e.years}년${e.months ? ` ${e.months}개월` : ""}`;
  const expSummary = exps.filter(e => e.tech.trim()).map(fmtExp).join(", ");

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground mb-1">맞춤 진로 변경</h2>
      <p className="text-sm text-muted-foreground mb-5">기본 베이스 정보를 수정하면 교육·공고·면접의 AI 추천이 이 정보를 기준으로 갱신됩니다.</p>

      {/* 직군 / 교육 목적 (각각 따로 선택) */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">취업/교육 희망 직군</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={selectCls}>
            {CAREER_ROLES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">교육 목적</label>
          <select value={purpose} onChange={e => setPurpose(e.target.value)} className={selectCls}>
            {CAREER_PURPOSES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* 기술별 경력 (다중 입력 · 수정/추가/삭제 가능) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground block">보유 경력 (기술·연차)</label>
          <button onClick={addExp} className="flex items-center gap-0.5 text-xs text-primary hover:underline">
            <Plus className="w-3 h-3" />경력 추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {exps.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text" value={e.tech} placeholder="기술명 (예: React)"
                onChange={ev => updateExp(i, "tech", ev.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number" min={0} max={40} value={e.years}
                  onChange={ev => updateExp(i, "years", Number(ev.target.value))}
                  className="w-14 px-2 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground text-center focus:outline-none focus:border-primary/60"
                />
                <span className="text-sm text-muted-foreground">년</span>
                <select
                  value={e.months}
                  onChange={ev => updateExp(i, "months", Number(ev.target.value))}
                  className="px-1.5 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
                >
                  {Array.from({ length: 12 }, (_, m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-sm text-muted-foreground">개월</span>
              </div>
              <button onClick={() => removeExp(i)} title="삭제"
                className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {exps.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">‘경력 추가’를 눌러 기술별 경력을 입력하세요.</p>
          )}
        </div>
        {expSummary && (
          <p className="text-xs text-muted-foreground mt-2">입력된 경력: <span className="text-foreground">{expSummary}</span></p>
        )}
      </div>

      <div className="mb-6">
        <label className="text-xs text-muted-foreground mb-2 block">사용 가능 언어</label>
        <div className="flex flex-wrap gap-2">
          {CAREER_LANGS.map(l => (
            <button key={l} onClick={() => toggleLang(l)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${langs.includes(l) ? "bg-primary/10 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => { saveCareer({ role, purpose, exps, langs }); setSaved(true); setTimeout(() => setSaved(false), 1500); }}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
          저장하기
        </button>
        {saved && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" />저장되었습니다</span>}
      </div>
    </div>
  );
}

function GoalsTab() {
  const navigate = useNavigate();
  const [doneMap, setDoneMap] = useState(getDoneMap);
  const handleToggle = (id: string) => { toggleDone(id); setDoneMap(getDoneMap()); };

  const overall = completionRate();
  const history = achievementHistory();

  return (
    <div className="flex flex-col gap-6">
      {/* 교육 목표 + 전체 달성률 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">교육 목표</h2>
          <span className="text-xs text-muted-foreground ml-1">목표별 체크리스트 달성 현황</span>
        </div>
        <div className="rounded-xl bg-secondary p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">전체 달성률</span>
            <span className="text-lg font-bold text-primary">{overall}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-card overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${overall}%`, background: "linear-gradient(90deg,#6C63FF,#8B5CF6)" }} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {EDUCATION_GOALS.map(g => {
            const p = goalProgress(g.id);
            return (
              <div key={g.id} className="rounded-xl border border-border p-4">
                <div className="font-medium text-sm text-foreground mb-0.5">{g.title}</div>
                {g.desc && <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{g.desc}</p>}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{p.done}/{p.total}</span>
                  <span className="text-xs font-semibold text-foreground">{p.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">체크리스트</h2>
          <button onClick={() => navigate("/calendar?type=edu")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
            교육 캘린더 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">체크한 항목은 교육 캘린더(교육 일정)의 완료일에 표시됩니다.</p>
        <div className="flex flex-col gap-5">
          {EDUCATION_GOALS.map(g => {
            const items = CHECKLIST.filter(c => c.goalId === g.id);
            return (
              <div key={g.id}>
                <div className="text-xs font-semibold text-muted-foreground mb-2">{g.title}</div>
                <div className="flex flex-col gap-1.5">
                  {items.map(c => {
                    const checked = c.id in doneMap;
                    return (
                      <button key={c.id} onClick={() => handleToggle(c.id)}
                        className="flex items-center gap-2.5 p-2 -mx-2 rounded-lg hover:bg-secondary text-left transition-colors">
                        {checked
                          ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          : <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />}
                        <span className={`text-sm ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.title}</span>
                        {checked && <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{doneMap[c.id]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 수강 강의 목록 (정확도) */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">수강 강의 목록</h2>
          <span className="text-xs text-muted-foreground ml-1">지금까지 수강한 강의·정확도</span>
        </div>
        <div className="flex flex-col gap-4">
          {LEARNING_COURSES.map(c => {
            const pct = Math.round((c.done / c.total) * 100);
            return (
              <div key={c.title} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate">{c.title}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.done}/{c.total} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
                <span className="shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">정확도 {c.accuracy}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 체크리스트 달성 히스토리 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground mb-4">체크리스트 달성 히스토리</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 달성한 항목이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-foreground flex-1">{h.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{h.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationTab() {
  const navigate = useNavigate();

  const learnDone = LEARNING_COURSES.reduce((s, c) => s + c.done, 0);
  const learnTotal = LEARNING_COURSES.reduce((s, c) => s + c.total, 0);
  const learnOverall = Math.round((learnDone / learnTotal) * 100);

  const avgScore = Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.score, 0) / INTERVIEW_HISTORY.length);
  const avgScores = {
    technical: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.technical, 0) / INTERVIEW_HISTORY.length),
    logic: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.logic, 0) / INTERVIEW_HISTORY.length),
    specificity: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.specificity, 0) / INTERVIEW_HISTORY.length),
    depth: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.depth, 0) / INTERVIEW_HISTORY.length),
    communication: Math.round(INTERVIEW_HISTORY.reduce((s, h) => s + h.scores.communication, 0) / INTERVIEW_HISTORY.length),
  };
  const radarData = [
    { subject: "기술정확성", score: avgScores.technical },
    { subject: "논리구조", score: avgScores.logic },
    { subject: "구체성", score: avgScores.specificity },
    { subject: "심화이해", score: avgScores.depth },
    { subject: "커뮤니케이션", score: avgScores.communication },
  ];
  const weakItems = Object.entries(avgScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([key, val]) => ({
      key, val,
      label: key === "technical" ? "기술정확성" : key === "logic" ? "논리구조" : key === "specificity" ? "구체성" : key === "depth" ? "심화이해" : "커뮤니케이션",
      tip: key === "technical" ? "기술 면접 문제 풀이 및 CS 개념 정리를 늘려보세요."
        : key === "logic" ? "답변 시 서론-본론-결론 구조로 정리하는 연습을 하세요."
        : key === "specificity" ? "추상적 설명 대신 수치·코드 예시를 포함해 구체적으로 말하세요."
        : key === "depth" ? "질문의 배경 원리까지 설명하는 심화 학습을 진행해보세요."
        : "필러워드를 줄이고 명확한 단어 선택을 연습해보세요.",
    }));

  const grade = avgScore >= 85 ? "A" : avgScore >= 75 ? "B+" : avgScore >= 70 ? "B" : avgScore >= 60 ? "C+" : "C";

  return (
    <div className="flex flex-col gap-6">
      {/* 종합 평가 헤더 */}
      <div className="rounded-2xl border border-border p-6" style={{ background: "linear-gradient(135deg,#F4F3FF 0%,#EEF0FF 100%)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">학습 종합 평가</h2>
          <span className="text-xs text-muted-foreground ml-1">면접·학습 데이터를 종합한 현재 상태</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/70 border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">면접 종합 점수</div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{avgScore}</span>
              <span className="text-sm text-primary mb-0.5 font-medium">{grade}</span>
            </div>
          </div>
          <div className="rounded-xl bg-white/70 border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">학습 진행률</div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{learnOverall}%</div>
          </div>
          <div className="rounded-xl bg-white/70 border border-border p-4 col-span-2 sm:col-span-1">
            <div className="text-xs text-muted-foreground mb-1">완료 강의</div>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {learnDone}<span className="text-sm text-muted-foreground font-normal">/{learnTotal}강</span>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 진행도 + 역량 레이더 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">학습 진행도</h3>
            </div>
            <button onClick={() => navigate("/education")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              교육센터 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {LEARNING_COURSES.map(c => {
              const pct = Math.round((c.done / c.total) * 100);
              return (
                <div key={c.title}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground truncate">{c.title}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.done}/{c.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">역량 레이더</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">누적 면접 평균 5항목</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#8B9CB8", fontSize: 9 }} />
              <Radar name="평균" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 취약 항목 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold text-foreground">취약 항목 분석</h3>
          <span className="text-xs text-muted-foreground ml-1">누적 데이터 기반 자동 분석</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {weakItems.map(({ label, val, tip }) => (
            <div key={label} className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-sm text-yellow-500" style={{ fontFamily: "'DM Mono', monospace" }}>{val}점</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary mb-2">
                <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${val}%` }} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/interview/setup")} className="mt-4 text-xs text-primary hover:underline flex items-center gap-0.5">
          취약 항목 집중 훈련 시작 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function MyPage() {
  const location = useLocation();
  const [tab, setTab] = useState("evaluation");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t) setTab(t);
  }, [location.search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xl text-primary font-bold">김</div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">김지수</h1>
            <p className="text-sm text-muted-foreground">jisu@example.com · 프로 플랜 구독 중</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition-colors whitespace-nowrap ${tab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {tab === "evaluation" && (
            <div className="flex flex-col gap-6">
              <EvaluationTab />
              <CareerTab />
            </div>
          )}
          {tab === "goals" && <GoalsTab />}
          {tab === "career" && <CareerTab />}
          {tab === "profile" && <ProfileTab />}
          {tab === "applications" && <ApplicationsTab />}
          {tab === "resume" && <ResumeHistoryTab />}
          {tab === "interview" && <InterviewHistoryTab />}
          {tab === "payment" && <PaymentTab />}
        </div>
      </div>
    </div>
  );
}
