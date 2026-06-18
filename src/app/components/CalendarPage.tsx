import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Bell, BellOff, MapPin, Clock, ChevronRight as Arrow, AlertTriangle, Info, GraduationCap } from "lucide-react";

// saved: true = 찜 목록(1순위), false = AI 추천(2순위)
const JOB_EVENTS = [
  {
    id: "1", company: "카카오", title: "프론트엔드 개발자", location: "판교",
    start: "2026-06-01", end: "2026-06-20",
    color: "#6C63FF", bg: "#EDE9FF", textColor: "#6C63FF", saved: true,
  },
  {
    id: "2", company: "네이버", title: "풀스택 개발자", location: "분당",
    start: "2026-06-05", end: "2026-06-25",
    color: "#10B981", bg: "#D1FAE5", textColor: "#059669", saved: true,
  },
  {
    id: "3", company: "토스", title: "백엔드 개발자 (Java)", location: "강남",
    start: "2026-06-10", end: "2026-07-01",
    color: "#3B82F6", bg: "#DBEAFE", textColor: "#2563EB", saved: true,
  },
  {
    id: "4", company: "라인", title: "프론트엔드 신입", location: "신촌",
    start: "2026-06-15", end: "2026-06-28",
    color: "#F59E0B", bg: "#FEF3C7", textColor: "#D97706", saved: false,
  },
  {
    id: "5", company: "쿠팡", title: "데이터 엔지니어", location: "잠실",
    start: "2026-06-18", end: "2026-07-10",
    color: "#EF4444", bg: "#FEE2E2", textColor: "#DC2626", saved: false,
  },
  {
    id: "6", company: "당근", title: "Android 개발자", location: "서초",
    start: "2026-06-14", end: "2026-06-30",
    color: "#F97316", bg: "#FFEDD5", textColor: "#EA580C", saved: true,
  },
  {
    id: "7", company: "배달의민족", title: "백엔드 개발자", location: "송파",
    start: "2026-06-20", end: "2026-07-05",
    color: "#14B8A6", bg: "#CCFBF1", textColor: "#0D9488", saved: false,
  },
];

// 교육 캘린더 mock (수강 강의 일정) · saved: true = 찜(수강), false = AI 추천 강의
const EDU_EVENTS = [
  { id: "e1", company: "알고리즘", title: "알고리즘 기초 완성", location: "온라인", start: "2026-06-02", end: "2026-06-22", color: "#6366F1", bg: "#EDE9FF", textColor: "#6366F1", saved: true },
  { id: "e2", company: "CS 기초", title: "네트워크 & HTTP", location: "온라인", start: "2026-06-08", end: "2026-06-26", color: "#10B981", bg: "#D1FAE5", textColor: "#059669", saved: true },
  { id: "e3", company: "프론트엔드", title: "React & TypeScript 심화", location: "온라인", start: "2026-06-12", end: "2026-07-02", color: "#F59E0B", bg: "#FEF3C7", textColor: "#D97706", saved: true },
  { id: "e4", company: "백엔드", title: "Spring Boot & JPA", location: "온라인", start: "2026-06-16", end: "2026-07-08", color: "#EC4899", bg: "#FCE7F3", textColor: "#DB2777", saved: false },
  { id: "e5", company: "데이터", title: "SQL & 데이터베이스", location: "온라인", start: "2026-06-10", end: "2026-06-28", color: "#3B82F6", bg: "#DBEAFE", textColor: "#2563EB", saved: false },
  { id: "e6", company: "DevOps", title: "Docker & 쿠버네티스", location: "온라인", start: "2026-06-18", end: "2026-07-10", color: "#8B5CF6", bg: "#EDE9FE", textColor: "#7C3AED", saved: false },
];

// 교육센터 학습 진행도 mock (EducationPage의 COURSES와 동일 값)
const LEARNING_COURSES = [
  { title: "알고리즘 기초 완성", done: 28, total: 42, color: "#6366F1" },
  { title: "React & TypeScript 심화", done: 29, total: 36, color: "#F59E0B" },
  { title: "네트워크 & HTTP", done: 11, total: 24, color: "#3B82F6" },
  { title: "Spring Boot & JPA", done: 5, total: 30, color: "#EC4899" },
];
const LEARNING_OVERALL = Math.round(
  (LEARNING_COURSES.reduce((s, c) => s + c.done, 0) /
    LEARNING_COURSES.reduce((s, c) => s + c.total, 0)) * 100
);

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function alertBadge(days: number) {
  if (days === 1) return { label: "D-1", cls: "bg-red-500 text-white", icon: "🚨" };
  if (days === 3) return { label: "D-3", cls: "bg-orange-400 text-white", icon: "⚠️" };
  if (days <= 0) return { label: "마감", cls: "bg-gray-400 text-white", icon: "🔒" };
  if (days <= 7) return { label: `D-${days}`, cls: "bg-yellow-400 text-gray-900", icon: "⏰" };
  return null;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [searchParams] = useSearchParams();
  const calType: "job" | "edu" = searchParams.get("type") === "edu" ? "edu" : "job";
  const events = calType === "edu" ? EDU_EVENTS : JOB_EVENTS;
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selected, setSelected] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries([...JOB_EVENTS, ...EDU_EVENTS].map(e => [e.id, true]))
  );

  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  // Build calendar cells (7-wide rows)
  const dayCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (dayCells.length % 7 !== 0) dayCells.push(null);

  // Split into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < dayCells.length; i += 7) {
    weeks.push(dayCells.slice(i, i + 7));
  }

  const today = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  // Deadline alerts: D-1 and D-3
  const alertEvents = events.filter(e => {
    const d = daysUntil(e.end);
    return d === 1 || d === 3;
  });

  // Upcoming within 7 days (for sidebar)
  const upcomingEvents = events.filter(e => {
    const d = daysUntil(e.end);
    return d >= 0 && d <= 7;
  }).sort((a, b) => a.end.localeCompare(b.end));

  const toggleNotification = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setNotifications(n => ({ ...n, [id]: !n[id] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{calType === "edu" ? "교육 캘린더" : "공고 캘린더"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{calType === "edu" ? "수강 중인 강의 일정을 한눈에 관리하세요" : "찜한 공고의 시작일~마감일을 한눈에 관리하세요"}</p>
      </div>

      {/* D-1 / D-3 Alert banner */}
      {alertEvents.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">마감 임박 알림</span>
            <span className="text-xs text-red-500">D-1·D-3 자동 감지</span>
          </div>
          <div className="flex flex-col gap-2">
            {alertEvents.map(e => {
              const days = daysUntil(e.end);
              const badge = alertBadge(days)!;
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100 cursor-pointer hover:border-red-300 transition-colors"
                  onClick={() => navigate(`/jobs/${e.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{e.company} · {e.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />마감: {e.end}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.icon} {badge.label}
                    </span>
                    <button
                      onClick={ev => toggleNotification(e.id, ev)}
                      className={`p-1.5 rounded-lg transition-colors ${notifications[e.id] ? "text-orange-500 hover:bg-orange-50" : "text-gray-300 hover:bg-gray-50"}`}
                      title={notifications[e.id] ? "알림 켜짐" : "알림 꺼짐"}
                    >
                      {notifications[e.id] ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="font-semibold text-foreground">{year}년 {month + 1}월</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Day of week header */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1.5 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"}`}>{d}</div>
            ))}
          </div>

          {/* Week rows with event dots (메인 미니 캘린더 방식) */}
          <div className="flex flex-col gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((day, di) => {
                  if (!day) return <div key={`e-${di}`} />;
                  const dateStr = toDateStr(year, month, day);
                  const isToday = isCurrentMonth && day === today;
                  const isSelected = selected === dateStr;
                  // 해당 날짜에 진행 중인 일정(시작~마감)을 점으로 표시
                  const dayEvents = events.filter(e => e.start <= dateStr && e.end >= dateStr);
                  const hasDead = events.some(e => e.end === dateStr);
                  const days = hasDead ? daysUntil(dateStr) : null;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelected(isSelected ? null : dateStr)}
                      className={`cursor-pointer rounded-lg border transition-all min-h-[64px] flex flex-col ${
                        isSelected ? "bg-primary/10 border-primary/40"
                        : isToday ? "bg-indigo-50 border-primary/20"
                        : "border-transparent hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between px-1.5 pt-1.5">
                        <span className={`text-xs font-medium ${
                          isToday ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"
                          : di === 0 ? "text-red-400"
                          : di === 6 ? "text-blue-400"
                          : "text-foreground"
                        }`}>{day}</span>
                        {days !== null && days >= 0 && days <= 3 && (
                          <span className={`text-[9px] font-bold px-1 rounded ${
                            days <= 1 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                          }`}>
                            {days === 0 ? "D-Day" : `D-${days}`}
                          </span>
                        )}
                      </div>
                      {/* 일정 점 표시 */}
                      <div className="flex flex-wrap items-center gap-1 px-1.5 pb-1.5 mt-auto">
                        {dayEvents.slice(0, 4).map(e => (
                          <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} title={`${e.company} · ${e.title}`} />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="text-[9px] text-muted-foreground leading-none">+{dayEvents.length - 4}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* 학습 진행도 (교육센터 연동) */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" style={{ color: "#6C63FF" }} />
                <h3 className="font-semibold text-foreground text-sm">학습 진행도</h3>
              </div>
              <button onClick={() => navigate("/education")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                교육센터 <Arrow className="w-3 h-3" />
              </button>
            </div>

            {/* 전체 진행률 */}
            <div className="rounded-xl bg-secondary p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">전체 진행률</span>
                <span className="text-sm font-bold" style={{ color: "#6C63FF" }}>{LEARNING_OVERALL}%</span>
              </div>
              <div className="h-2 rounded-full bg-card overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${LEARNING_OVERALL}%`, background: "linear-gradient(90deg,#6C63FF,#8B5CF6)" }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                수강 중인 {LEARNING_COURSES.length}개 강의 · 총 {LEARNING_COURSES.reduce((s, c) => s + c.done, 0)}/{LEARNING_COURSES.reduce((s, c) => s + c.total, 0)}강 완료
              </p>
            </div>

            {/* 강의별 진행률 */}
            <div className="flex flex-col gap-3">
              {LEARNING_COURSES.map(c => {
                const pct = Math.round((c.done / c.total) * 100);
                return (
                  <button key={c.title} onClick={() => navigate("/education")} className="text-left group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground truncate group-hover:text-primary transition-colors">{c.title}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.done}/{c.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming deadlines */}
          {upcomingEvents.length > 0 && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">7일 내 마감</span>
              </div>
              <div className="flex flex-col gap-2">
                {upcomingEvents.map(e => {
                  const days = daysUntil(e.end);
                  const badge = alertBadge(days)!;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors"
                      onClick={() => navigate(`/jobs/${e.id}`)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">{e.company}</div>
                          <div className="text-xs text-gray-500 truncate">{e.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={ev => toggleNotification(e.id, ev)}
                          className={`p-1 rounded transition-colors ${notifications[e.id] ? "text-orange-500" : "text-gray-300"}`}
                        >
                          {notifications[e.id] ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color legend */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">{calType === "edu" ? "수강 강의 목록" : "찜한 공고 목록"}</h3>
            <div className="flex flex-col gap-2">
              {[...events]
                .sort((a, b) => Number(b.saved) - Number(a.saved)) // 찜(1순위) → AI추천(2순위)
                .slice(0, 5)
                .map(e => {
                  const days = daysUntil(e.end);
                  const badge = alertBadge(days);
                  return (
                    <div
                      key={e.id}
                      onClick={() => navigate(`/jobs/${e.id}`)}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-secondary rounded-lg p-2 -mx-2 transition-colors group"
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate flex items-center gap-1.5">
                          {e.company}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${e.saved ? "bg-primary/10 text-primary" : "bg-secondary border border-border text-muted-foreground"}`}>
                            {e.saved ? "찜" : "AI추천"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">~{e.end}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {badge && days <= 7 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                        <button
                          onClick={ev => toggleNotification(e.id, ev)}
                          className={`p-1 rounded transition-colors ${notifications[e.id] ? "text-primary" : "text-gray-300"}`}
                        >
                          {notifications[e.id] ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 5개 초과 시 더보기 → 교육: /education, 공고: /jobs */}
            {events.length > 5 && (
              <button
                onClick={() => navigate(calType === "edu" ? "/education" : "/jobs")}
                className="mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-border bg-secondary text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {calType === "edu" ? "교육 더보기" : "공고 더보기"} (+{events.length - 5})
                <Arrow className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>D-3·D-1 마감 시 상단에 알림이 자동 표시됩니다. 벨 아이콘으로 개별 알림을 설정하세요.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
