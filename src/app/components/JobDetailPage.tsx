import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Heart, MapPin, Clock, Briefcase, CheckCircle2,
  ExternalLink, BrainCircuit, Eye, Users, BarChart3, Star, ChevronRight
} from "lucide-react";
import { JOBS_DATA } from "./JobsPage";
import { ApplicationForm } from "./ApplicationForm";
import { useAuthGuard } from "../auth";

function MiniBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

const BAR_COLORS = ["#6C63FF", "#3B82F6", "#10B981", "#F59E0B"];

export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guard = useAuthGuard(); // 비로그인 시 로그인 창으로
  const [wished, setWished] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "stats">("desc");

  const job = JOBS_DATA.find(j => j.id === id) ?? JOBS_DATA[0];

  const handleApplicationSubmit = (answers: Record<string, string>) => {
    setApplied(true);
    setShowApplicationForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate("/jobs")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />공고 목록으로
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Company header */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: job.logoBg, color: job.logoColor, border: "1px solid rgba(0,0,0,0.08)" }}>
                  {job.logo}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
                    <span>{job.company}</span>
                    <span>·</span>
                    <MapPin className="w-3.5 h-3.5" /><span>{job.location}</span>
                    <span>·</span>
                    <Briefcase className="w-3.5 h-3.5" /><span>{job.type}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setWished(!wished)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                <Heart className={`w-5 h-5 ${wished ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "급여", value: job.salary },
                { label: "마감일", value: job.deadline },
                { label: "경력", value: job.type },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-secondary p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-foreground">{value}</div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{job.viewCount.toLocaleString()}회 조회</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicants}명 지원</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(["desc", "stats"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "desc" ? "공고 상세" : "지원 통계"}
              </button>
            ))}
          </div>

          {activeTab === "desc" && (
            <>
              {/* Description */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-3">공고 개요</h2>
                <p className="text-sm text-foreground leading-relaxed">{job.desc}</p>
              </div>

              {/* Main duties */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-4">주요 업무</h2>
                <ul className="flex flex-col gap-2.5">
                  {job.mainDuties.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">{i + 1}</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-4">자격 요건</h2>
                <ul className="flex flex-col gap-2.5">
                  {job.requirements.map(r => (
                    <li key={r} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preferred */}
              {job.preferred && job.preferred.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-semibold text-foreground mb-4">우대 사항</h2>
                  <ul className="flex flex-col gap-2.5">
                    {job.preferred.map((p, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                        <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cover Letter Questions */}
              {job.coverLetterQuestions && job.coverLetterQuestions.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-semibold text-foreground mb-4">자기소개서 질문</h2>
                  <div className="space-y-3">
                    {job.coverLetterQuestions.map((q, idx) => (
                      <div key={q.id} className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground flex-1">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI interview prep tip */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">이 공고 맞춤 면접 연습</div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {job.company} {job.title} 포지션에 맞는 기술 질문과 인성 질문으로 면접을 연습해보세요.
                    </p>
                    <button onClick={() => navigate("/interview/setup", { state: { jobId: job.id, company: job.company, title: job.title } })}
                      className="text-xs text-primary font-medium hover:text-indigo-600 flex items-center gap-1">
                      맞춤 면접 시작 <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "stats" && (
            <div className="flex flex-col gap-5">
              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{job.viewCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">총 조회수</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{job.applicants}</div>
                  <div className="text-xs text-muted-foreground mt-1">총 지원자 수</div>
                </div>
              </div>

              {/* Conversion rate */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  지원 전환율
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">조회 → 지원</span>
                      <span className="font-medium text-foreground">
                        {((job.applicants / job.viewCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-3 rounded-full"
                        style={{ width: `${(job.applicants / job.viewCount) * 100}%`, backgroundColor: "#6C63FF" }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  이 공고는 유사 직군 평균보다 조회 대비 지원 전환율이 높습니다.
                </p>
              </div>

              {/* Category distribution */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  직군별 지원 분포
                </h3>
                <div className="flex flex-col gap-3">
                  {job.categoryDist.map((c, i) => (
                    <MiniBar key={c.label} label={c.label} pct={c.pct} color={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3">
                  {job.categoryDist.map((c, i) => (
                    <div key={c.label} className="text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                      <div className="text-sm font-semibold text-foreground">{Math.round(job.applicants * c.pct / 100)}명</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly trend (mock) */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4">일별 조회 추이 (최근 7일)</h3>
                <div className="flex items-end gap-2 h-24">
                  {[420, 680, 590, 810, 750, 920, 651].map((v, i) => {
                    const max = 920;
                    const days = ["월", "화", "수", "목", "금", "토", "일"];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{ height: `${(v / max) * 80}px`, backgroundColor: i === 5 ? "#6C63FF" : "#E0DEFF" }}
                        />
                        <span className="text-xs text-muted-foreground">{days[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-24">
            {applied ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">지원 완료!</div>
                <p className="text-xs text-muted-foreground mb-4">서류 검토 후 연락드립니다</p>
                <button
                  onClick={() => navigate("/mypage?tab=applications")}
                  className="w-full py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-border transition-colors mb-2 flex items-center justify-center gap-1"
                >
                  지원 내역 확인
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate("/interview/setup", { state: { jobId: job.id, company: job.company, title: job.title } })}
                  className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <BrainCircuit className="w-4 h-4" />
                  AI 모의 면접 보기
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => guard(() => setShowApplicationForm(true))}
                  className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-indigo-600 transition-colors mb-3"
                  style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}
                >
                  지원하기
                </button>
                <button
                  onClick={() => setWished(!wished)}
                  className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors ${wished ? "border-red-200 bg-red-50 text-red-500" : "border-border bg-secondary text-foreground hover:border-primary/40"}`}
                >
                  {wished ? "❤️ 찜 완료" : "🤍 찜하기"}
                </button>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">마감까지</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                <Clock className="w-4 h-4" />
                D-{Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000))}일
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">조회수</span>
                <span className="font-medium text-foreground">{job.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">지원자</span>
                <span className="font-medium text-foreground">{job.applicants}명</span>
              </div>
            </div>
          </div>

          {/* Stats preview shortcut */}
          <button
            onClick={() => setActiveTab("stats")}
            className="rounded-2xl border border-border bg-card p-4 text-left hover:shadow-sm hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">지원 통계 보기</span>
            </div>
            <p className="text-xs text-muted-foreground">직군별 분포 · 조회 추이 확인</p>
          </button>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && job.coverLetterQuestions && (
        <ApplicationForm
          jobTitle={job.title}
          company={job.company}
          questions={job.coverLetterQuestions}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}
