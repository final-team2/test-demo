import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, BrainCircuit, BookOpen, Briefcase, Calendar,
  FileText, Users, ChevronRight, ChevronLeft, Star, TrendingUp,
  MapPin, Clock, Heart, Bookmark, Bell, ArrowRight,
  Zap, BarChart3, Building2, GraduationCap, Code2,
  Layers, Globe, Database, Cpu, PenTool
} from "lucide-react";

// 미니 캘린더용 인라인 mock (면접·코딩테스트·공고 마감 일정)
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const CALENDAR_EVENTS = [
  { date: "2026-06-16", type: "면접",     company: "카카오", color: "#6C63FF" },
  { date: "2026-06-19", type: "코딩테스트", company: "네이버", color: "#10B981" },
  { date: "2026-06-20", type: "마감",     company: "토스",   color: "#EF4444" },
  { date: "2026-06-24", type: "면접",     company: "당근",   color: "#F59E0B" },
  { date: "2026-06-28", type: "마감",     company: "라인",   color: "#3B82F6" },
];

// 교육센터 학습 진행도 mock (EducationPage의 COURSES와 동일 값)
const LEARNING_COURSES = [
  { title: "알고리즘 기초 완성", done: 28, total: 42, color: "#6366F1" },
  { title: "React & TypeScript 심화", done: 29, total: 36, color: "#F59E0B" },
  { title: "네트워크 & HTTP", done: 11, total: 24, color: "#3B82F6" },
];
const LEARNING_OVERALL = Math.round(
  (LEARNING_COURSES.reduce((s, c) => s + c.done, 0) /
    LEARNING_COURSES.reduce((s, c) => s + c.total, 0)) * 100
);

const JOB_CATEGORIES = [
  { icon: Code2, label: "프론트엔드" },
  { icon: Database, label: "백엔드" },
  { icon: Layers, label: "풀스택" },
  { icon: Cpu, label: "AI/ML" },
  { icon: Globe, label: "DevOps" },
  { icon: PenTool, label: "UI/UX" },
  { icon: BarChart3, label: "데이터" },
  { icon: Building2, label: "기획/PM" },
];

const RECOMMENDED_JOBS = [
  {
    id: 1,
    company: "카카오",
    companyInitial: "K",
    companyColor: "#FEE500",
    textColor: "#3C1E1E",
    title: "프론트엔드 개발자 (신입/경력)",
    location: "경기 성남시",
    experience: "신입·경력",
    tags: ["React", "TypeScript"],
    deadline: "D-5",
    isNew: true,
    isSaved: false,
  },
  {
    id: 2,
    company: "네이버",
    companyInitial: "N",
    companyColor: "#03C75A",
    textColor: "#fff",
    title: "백엔드 개발자 (Java/Spring)",
    location: "경기 성남시",
    experience: "3년 이상",
    tags: ["Java", "Spring Boot"],
    deadline: "D-12",
    isNew: false,
    isSaved: true,
  },
  {
    id: 3,
    company: "토스",
    companyInitial: "T",
    companyColor: "#1B6AF6",
    textColor: "#fff",
    title: "iOS 개발자 (Swift)",
    location: "서울 강남구",
    experience: "신입·경력",
    tags: ["Swift", "SwiftUI"],
    deadline: "D-3",
    isNew: true,
    isSaved: false,
  },
  {
    id: 4,
    company: "당근",
    companyInitial: "D",
    companyColor: "#FF7E36",
    textColor: "#fff",
    title: "풀스택 개발자",
    location: "서울 서초구",
    experience: "경력 2년↑",
    tags: ["React", "Go"],
    deadline: "D-8",
    isNew: false,
    isSaved: false,
  },
  {
    id: 5,
    company: "쿠팡",
    companyInitial: "C",
    companyColor: "#EE1C25",
    textColor: "#fff",
    title: "데이터 엔지니어",
    location: "서울 송파구",
    experience: "3년 이상",
    tags: ["Python", "Spark"],
    deadline: "D-15",
    isNew: false,
    isSaved: false,
  },
  {
    id: 6,
    company: "라인",
    companyInitial: "L",
    companyColor: "#00B900",
    textColor: "#fff",
    title: "Android 개발자",
    location: "경기 성남시",
    experience: "신입·경력",
    tags: ["Kotlin", "Jetpack"],
    deadline: "D-20",
    isNew: true,
    isSaved: false,
  },
];

// 미니 캘린더 기준일 (보고서 화면이 항상 일정과 맞물려 보이도록 고정)
const CAL_TODAY = new Date(2026, 5, 16);

function calDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function calFirstWeekday(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function calDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function calDaysUntil(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return Math.ceil((d.getTime() - CAL_TODAY.getTime()) / 86400000);
}

const QUICK_LINKS = [
  { icon: BrainCircuit, label: "AI 모의면접", href: "/interview", highlight: true },
  { icon: BookOpen, label: "교육 강의", href: "/education" },
  { icon: Briefcase, label: "공고 검색", href: "/jobs" },
  { icon: FileText, label: "이력서 작성", href: "/resume" },
  { icon: Calendar, label: "일정 관리", href: "/calendar" },
  { icon: Users, label: "커뮤니티", href: "/community" },
];

const PARTNER_COMPANIES = [
  { name: "카카오", color: "#FEE500", text: "#3C1E1E", initial: "K" },
  { name: "네이버", color: "#03C75A", text: "#fff", initial: "N" },
  { name: "토스", color: "#1B6AF6", text: "#fff", initial: "T" },
  { name: "당근마켓", color: "#FF7E36", text: "#fff", initial: "D" },
  { name: "쿠팡", color: "#EE1C25", text: "#fff", initial: "C" },
  { name: "라인", color: "#00B900", text: "#fff", initial: "L" },
  { name: "넥슨", color: "#2D2D2D", text: "#fff", initial: "NX" },
  { name: "크래프톤", color: "#1A2847", text: "#fff", initial: "KR" },
];

const COMMUNITY_POSTS = [
  { id: 1, tag: "면접후기", title: "카카오 프론트엔드 최종합격 후기 공유합니다", likes: 148, time: "30분 전" },
  { id: 2, tag: "스터디", title: "React/TypeScript 스터디 3기 모집 (주 2회)", likes: 67, time: "1시간 전" },
  { id: 3, tag: "질문", title: "CS 질문 - OS 스케줄링 알고리즘 이해가 잘 안되는데요", likes: 34, time: "2시간 전" },
  { id: 4, tag: "자유", title: "취준 6개월 만에 토스 최종합격했습니다 ㅠㅠ", likes: 312, time: "3시간 전" },
];

const TAG_COLORS: Record<string, string> = {
  "면접후기": "#6C63FF",
  "스터디": "#10B981",
  "질문": "#F59E0B",
  "자유": "#6B7280",
};

export function LandingPage() {
  const navigate = useNavigate();
  const [calView, setCalView] = useState({ year: CAL_TODAY.getFullYear(), month: CAL_TODAY.getMonth() });

  function shiftMonth(delta: number) {
    setCalView(prev => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set([2]));

  function toggleSave(id: number) {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Hero Search ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            AI가 함께하는 <span style={{ color: "#6C63FF" }}>취업 준비</span>, 지금 시작하세요
          </h1>
          <p className="text-sm text-gray-500 mb-5">공고 검색부터 AI 모의면접까지, 합격의 모든 과정을 지원합니다</p>

          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border-2 rounded-xl px-4 py-3 focus-within:border-primary transition-colors" style={{ "--tw-border-opacity": 1 } as React.CSSProperties}>
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="직무, 회사, 기술 스택으로 검색하세요"
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                onKeyDown={e => e.key === "Enter" && navigate(`/jobs?q=${searchQuery}`)}
              />
            </div>
            <button
              onClick={() => navigate(`/jobs?q=${searchQuery}`)}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#6C63FF" }}
            >
              검색
            </button>
          </div>

          {/* Job category quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {JOB_CATEGORIES.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => navigate(`/jobs?category=${label}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs text-gray-600 transition-colors"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-5 items-start">

          {/* ── LEFT: Recommended Jobs ───────────────────── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">오늘의 맞춤 공고</span>
                <button
                  onClick={() => navigate("/jobs")}
                  className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
                >
                  더보기 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {RECOMMENDED_JOBS.map(job => (
                  <div
                    key={job.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: job.companyColor, color: job.textColor }}
                      >
                        {job.companyInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs text-gray-500 truncate">{job.company}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {job.isNew && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EEF2FF", color: "#6C63FF" }}>NEW</span>
                            )}
                            <span className={`text-xs font-medium ${parseInt(job.deadline.replace("D-", "")) <= 5 ? "text-red-500" : "text-gray-400"}`}>
                              {job.deadline}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 mt-0.5 leading-snug line-clamp-2">{job.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{job.location}
                          </span>
                          <span className="text-xs text-gray-400">{job.experience}</span>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {job.tags.map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                        className="p-1 rounded hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${savedJobs.has(job.id) ? "fill-red-400 text-red-400" : "text-gray-300"}`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-900">바로가기</span>
              </div>
              <div className="p-3 grid grid-cols-3 gap-2">
                {QUICK_LINKS.map(({ icon: Icon, label, href, highlight }) => (
                  <button
                    key={label}
                    onClick={() => navigate(href)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors text-center ${
                      highlight ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        highlight ? "bg-indigo-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${highlight ? "text-indigo-600" : "text-gray-500"}`} />
                    </div>
                    <span className={`text-xs leading-tight ${highlight ? "text-indigo-600 font-medium" : "text-gray-600"}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── CENTER: Main feed ─────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* AI Interview promo banner */}
            <div
              className="rounded-xl p-5 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)" }}
            >
              <div className="absolute right-4 top-0 bottom-0 flex items-center opacity-10">
                <BrainCircuit className="w-32 h-32" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full mb-2">
                  <Zap className="w-3 h-3" />
                  AI 기반 모의면접
                </div>
                <h2 className="text-lg font-bold mb-1">실전처럼 연습하고, 합격을 앞당기세요</h2>
                <p className="text-sm text-white/80 mb-3">이력서 기반 맞춤 질문 · 실시간 AI 피드백 · 상세 리포트 제공</p>
                <button
                  onClick={() => navigate("/interview")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  style={{ color: "#6C63FF" }}
                >
                  모의면접 시작 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini calendar (캘린더 자리) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* 헤더: 연·월 + 이전/다음 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: "#6C63FF" }} />
                  <span className="font-semibold text-sm text-gray-900">{calView.year}년 {calView.month + 1}월 일정</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => shiftMonth(-1)} aria-label="이전 달" className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => shiftMonth(1)} aria-label="다음 달" className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 월 달력 그리드 */}
              <div className="px-4 pt-3 pb-2">
                <div className="grid grid-cols-7 mb-1">
                  {WEEK_DAYS.map((d, i) => (
                    <div key={d} className={`text-center text-[11px] py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {(() => {
                    const cells: React.ReactNode[] = [];
                    const firstWd = calFirstWeekday(calView.year, calView.month);
                    const total = calDaysInMonth(calView.year, calView.month);
                    const todayStr = calDateStr(CAL_TODAY.getFullYear(), CAL_TODAY.getMonth(), CAL_TODAY.getDate());
                    for (let i = 0; i < firstWd; i++) cells.push(<div key={`blank-${i}`} />);
                    for (let day = 1; day <= total; day++) {
                      const ds = calDateStr(calView.year, calView.month, day);
                      const evs = CALENDAR_EVENTS.filter(e => e.date === ds);
                      const isToday = ds === todayStr;
                      cells.push(
                        <button key={ds} onClick={() => navigate("/calendar")} className="flex flex-col items-center py-0.5 group">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors ${
                            isToday ? "bg-indigo-600 text-white font-semibold" : "text-gray-700 group-hover:bg-gray-100"
                          }`}>{day}</span>
                          <span className="flex gap-0.5 h-1.5 mt-0.5">
                            {evs.slice(0, 3).map((e, idx) => (
                              <span key={idx} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color }} />
                            ))}
                          </span>
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* 다가오는 일정 */}
              <div className="border-t border-gray-100 px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">다가오는 일정</p>
                {CALENDAR_EVENTS
                  .filter(e => calDaysUntil(e.date) >= 0)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 3)
                  .map(e => {
                    const dday = calDaysUntil(e.date);
                    const [, mm, dd] = e.date.split("-");
                    return (
                      <button
                        key={e.date + e.company}
                        onClick={() => navigate("/calendar")}
                        className="w-full flex items-center gap-2.5 text-left hover:bg-gray-50 rounded-lg px-1.5 py-1.5 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                        <span className="text-xs text-gray-400 w-9 shrink-0">{Number(mm)}/{Number(dd)}</span>
                        <span className="text-sm text-gray-800 flex-1 truncate">{e.company} · {e.type}</span>
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                          dday === 0 ? "bg-red-500 text-white" : dday <= 3 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                        }`}>{dday === 0 ? "D-DAY" : `D-${dday}`}</span>
                      </button>
                    );
                  })}
              </div>

              {/* 학습 진행도 (교육센터 연동) */}
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" style={{ color: "#6C63FF" }} />
                    <p className="text-xs font-semibold text-gray-500">학습 진행도</p>
                  </div>
                  <button onClick={() => navigate("/education")} className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">
                    교육센터 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 전체 진행률 */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs text-gray-400 w-8 shrink-0">전체</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${LEARNING_OVERALL}%`, background: "linear-gradient(90deg,#6C63FF,#8B5CF6)" }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-9 text-right">{LEARNING_OVERALL}%</span>
                </div>

                {/* 강의별 진행률 */}
                <div className="space-y-2">
                  {LEARNING_COURSES.slice(0, 2).map(c => {
                    const pct = Math.round((c.done / c.total) * 100);
                    return (
                      <button key={c.title} onClick={() => navigate("/education")} className="w-full flex items-center gap-2 text-left group">
                        <span className="text-xs text-gray-600 flex-1 truncate group-hover:text-indigo-600 transition-colors">{c.title}</span>
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                        </div>
                        <span className="text-[11px] text-gray-400 w-8 text-right shrink-0">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 p-3 text-center">
                <button
                  onClick={() => navigate("/calendar")}
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 mx-auto"
                >
                  캘린더 전체보기 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Community posts */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">커뮤니티 인기글</span>
                <button
                  onClick={() => navigate("/community")}
                  className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
                >
                  더보기 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {COMMUNITY_POSTS.map(post => (
                  <div
                    key={post.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => navigate("/community")}
                  >
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: TAG_COLORS[post.tag] + "15", color: TAG_COLORS[post.tag] }}
                    >
                      {post.tag}
                    </span>
                    <p className="text-sm text-gray-700 flex-1 truncate">{post.title}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Heart className="w-3 h-3" />{post.likes}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{post.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education quick CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-4 cursor-pointer hover:opacity-95 transition-opacity"
                style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)" }}
                onClick={() => navigate("/education")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-semibold text-sm text-gray-800">무료 강의</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">CS 기초부터 React 심화까지<br />무료로 학습하세요</p>
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-0.5">
                  강의 보러가기 <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div
                className="rounded-xl p-4 cursor-pointer hover:opacity-95 transition-opacity"
                style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" }}
                onClick={() => navigate("/resume")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-sm text-gray-800">AI 이력서 작성</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">AI가 내 경험을 분석해<br />매력적인 이력서를 완성해드려요</p>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  이력서 작성하기 <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ───────────────────── */}
          <aside className="hidden xl:block w-56 shrink-0 space-y-4">
            {/* CTA card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">지금 무료로 시작</p>
              <p className="text-xs text-gray-500 mb-3">가입하고 AI 면접<br />무료 체험 1회 제공</p>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#6C63FF" }}
              >
                회원가입
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-2 rounded-lg text-gray-600 text-sm mt-2 hover:bg-gray-50 transition-colors"
              >
                로그인
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">플랫폼 현황</p>
              {[
                { label: "누적 면접 세션", value: "12,400+" },
                { label: "등록 기업", value: "1,240+" },
                { label: "채용 공고", value: "3,890" },
                { label: "합격 후기", value: "2,100+" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <span className="text-xs font-bold text-gray-800">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Trending keywords */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-indigo-500" />
                급상승 키워드
              </p>
              {["React 18", "TypeScript", "Next.js", "Spring Boot", "Kubernetes", "LLM 파인튜닝"].map((kw, i) => (
                <button
                  key={kw}
                  onClick={() => navigate(`/jobs?q=${kw}`)}
                  className="w-full flex items-center gap-2 py-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors text-left"
                >
                  <span className="w-4 text-center font-bold" style={{ color: i < 3 ? "#6C63FF" : "#9CA3AF" }}>{i + 1}</span>
                  {kw}
                </button>
              ))}
            </div>

            {/* SNS login hint */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-xs text-yellow-800 font-medium mb-1">SNS 간편 로그인 지원</p>
              <p className="text-xs text-yellow-600">카카오 · 네이버 · 구글</p>
            </div>
          </aside>
        </div>

        {/* ── Partner companies strip ─────────────────────── */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">채용 중인 기업</span>
            <button
              onClick={() => navigate("/jobs")}
              className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
            >
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="px-4 py-4 flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {PARTNER_COMPANIES.map(co => (
              <button
                key={co.name}
                onClick={() => navigate("/jobs")}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: co.color, color: co.text }}
                >
                  {co.initial}
                </div>
                <span className="text-xs text-gray-600">{co.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Full-width banner ─────────────────────── */}
        <div
          className="mt-4 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
          onClick={() => navigate("/education")}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">취업 역량 강화 무료 특강</p>
              <p className="text-white/70 text-sm mt-0.5">코딩테스트 · CS · 면접 · 포트폴리오 완성 과정</p>
            </div>
          </div>
          <button className="sm:ml-auto shrink-0 px-5 py-2.5 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors" style={{ color: "#312E81" }}>
            강의 보러가기
          </button>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6C63FF" }}>
                <span className="text-white font-black tracking-tighter leading-none text-[13px]">DR</span>
              </div>
              <span className="font-bold text-gray-900">DevReady</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              {["이용약관", "개인정보처리방침", "고객센터", "공지사항", "회사소개", "광고문의"].map(link => (
                <button key={link} className="hover:text-gray-800 transition-colors">{link}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>(주)DevReady | 대표: 홍길동 | 사업자등록번호: 000-00-00000 | 통신판매업신고: 제0000-서울강남-0000호</p>
            <p>서울특별시 강남구 테헤란로 000, 00층 | 고객센터: 02-0000-0000 | 이메일: help@interviewai.kr</p>
            <p className="mt-2">© 2026 DevReady Corp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
