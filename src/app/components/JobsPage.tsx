import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Heart, MapPin, Clock, Building2, ChevronRight, SlidersHorizontal, Briefcase, X } from "lucide-react";

export const JOBS_DATA = [
  {
    id: "1", company: "카카오", logo: "카", logoColor: "#FEE500", logoBg: "#3C1E1E",
    title: "프론트엔드 개발자", location: "판교", type: "신입/경력", deadline: "2026-06-20",
    tags: ["React", "TypeScript", "Next.js"], salary: "협의", hot: true, new: false,
    desc: "카카오의 핵심 서비스 FE 개발에 참여할 역량 있는 개발자를 모집합니다.",
    mainDuties: [
      "카카오톡, 카카오맵 등 핵심 서비스 웹 프론트엔드 개발",
      "React 기반 컴포넌트 설계 및 성능 최적화",
      "UI/UX 팀과 협업하여 사용자 경험 개선",
      "A/B 테스트 및 지표 분석을 통한 서비스 개선",
    ],
    requirements: ["React 숙련자", "TypeScript 경험", "상태관리 라이브러리 사용 경험"],
    preferred: ["Next.js SSR/SSG 경험", "성능 최적화 경험 (Core Web Vitals)", "디자인 시스템 구축 경험", "오픈소스 기여 경험"],
    coverLetterQuestions: [
      { id: "1", question: "성장과정 및 학창시절에 대해 기술해 주세요." },
      { id: "2", question: "카카오에 지원한 동기와 입사 후 포부를 기술해 주세요." },
      { id: "3", question: "프론트엔드 개발자로서의 강점과 약점에 대해 기술해 주세요." },
    ],
    viewCount: 4821, applicants: 247,
    categoryDist: [{ label: "프론트엔드", pct: 68 }, { label: "풀스택", pct: 20 }, { label: "기타", pct: 12 }],
  },
  {
    id: "2", company: "네이버", logo: "N", logoColor: "#03C75A", logoBg: "#fff",
    title: "풀스택 개발자", location: "분당", type: "경력 3년+", deadline: "2026-06-25",
    tags: ["Node.js", "React", "AWS"], salary: "6000~8000만", hot: true, new: true,
    desc: "네이버 쇼핑 플랫폼 개발팀에서 풀스택 개발자를 모집합니다.",
    mainDuties: [
      "네이버 쇼핑 플랫폼 백엔드/프론트엔드 기능 개발",
      "API 설계 및 서비스 아키텍처 개선",
      "AWS 인프라 운영 및 DevOps 자동화",
      "대용량 트래픽 처리를 위한 성능 튜닝",
    ],
    requirements: ["Node.js + React 3년 이상", "AWS 인프라 운영 경험", "대용량 트래픽 처리 경험"],
    preferred: ["쿠버네티스/도커 운영 경험", "검색 엔진(Elasticsearch) 활용 경험", "결제 시스템 개발 경험"],
    coverLetterQuestions: [
      { id: "1", question: "본인의 성장과정을 간략히 기술해 주세요." },
      { id: "2", question: "네이버에 지원하게 된 동기는 무엇인가요?" },
      { id: "3", question: "가장 기억에 남는 프로젝트와 그 이유를 설명해 주세요." },
    ],
    viewCount: 3512, applicants: 183,
    categoryDist: [{ label: "풀스택", pct: 55 }, { label: "백엔드", pct: 30 }, { label: "프론트엔드", pct: 15 }],
  },
  {
    id: "3", company: "토스", logo: "T", logoColor: "#4B82F0", logoBg: "#fff",
    title: "백엔드 개발자 (Java)", location: "강남", type: "경력 2년+", deadline: "2026-07-01",
    tags: ["Java", "Spring Boot", "MySQL"], salary: "7000~9000만", hot: false, new: true,
    desc: "토스 결제 서버를 함께 만들어갈 백엔드 개발자를 모집합니다.",
    mainDuties: [
      "토스 결제/정산 핵심 서버 개발 및 운영",
      "마이크로서비스 아키텍처 설계 및 구현",
      "데이터베이스 스키마 설계 및 쿼리 최적화",
      "서비스 모니터링 및 장애 대응",
    ],
    requirements: ["Java/Spring Boot 2년 이상", "MySQL 최적화 경험", "고가용성 서비스 경험"],
    preferred: ["금융 도메인 서비스 경험", "JPA/Querydsl 경험", "Redis 캐싱 전략 경험", "gRPC 사용 경험"],
    coverLetterQuestions: [
      { id: "1", question: "지원자님의 성장과정에 대해 간략히 작성해주세요." },
      { id: "2", question: "토스에서 이루고 싶은 목표는 무엇인가요?" },
    ],
    viewCount: 5204, applicants: 312,
    categoryDist: [{ label: "백엔드", pct: 75 }, { label: "풀스택", pct: 18 }, { label: "기타", pct: 7 }],
  },
  {
    id: "4", company: "라인", logo: "L", logoColor: "#06C755", logoBg: "#fff",
    title: "프론트엔드 개발자", location: "신촌", type: "신입", deadline: "2026-06-28",
    tags: ["Vue.js", "JavaScript", "CSS"], salary: "협의", hot: false, new: false,
    desc: "LINE 메신저 웹 클라이언트 팀에서 함께 일할 신입 개발자를 찾습니다.",
    mainDuties: [
      "LINE 웹 메신저 UI 컴포넌트 개발",
      "웹 성능 최적화 및 접근성 개선",
      "글로벌 서비스 다국어 지원 대응",
    ],
    requirements: ["Vue.js 또는 React 경험", "HTML/CSS 기초 탄탄", "팀 협업 경험"],
    preferred: ["글로벌 서비스 경험", "웹 접근성(WCAG) 이해", "애니메이션/인터랙션 구현 경험"],
    coverLetterQuestions: [
      { id: "1", question: "성장과정 및 학창시절에 대해 기술해 주세요." },
      { id: "2", question: "지원 동기 및 입사 후 포부를 기술해 주세요." },
      { id: "3", question: "자신의 강점과 약점에 대해 기술해 주세요." },
    ],
    viewCount: 2108, applicants: 98,
    categoryDist: [{ label: "프론트엔드", pct: 80 }, { label: "풀스택", pct: 12 }, { label: "기타", pct: 8 }],
  },
  {
    id: "5", company: "쿠팡", logo: "쿠", logoColor: "#EE2222", logoBg: "#fff",
    title: "데이터 엔지니어", location: "잠실", type: "경력 1년+", deadline: "2026-07-10",
    tags: ["Python", "Spark", "Kafka"], salary: "5500~7500만", hot: true, new: false,
    desc: "쿠팡 데이터 파이프라인을 설계하고 운영할 엔지니어를 모집합니다.",
    mainDuties: [
      "대용량 데이터 수집·변환·적재(ETL) 파이프라인 설계",
      "Kafka 기반 실시간 스트리밍 파이프라인 운영",
      "Spark를 활용한 배치 데이터 처리",
      "데이터 품질 모니터링 시스템 구축",
    ],
    requirements: ["Python 데이터 처리 경험", "Spark/Kafka 운영 경험", "SQL 고급 쿼리 작성"],
    preferred: ["Airflow 워크플로우 관리 경험", "Flink 실시간 처리 경험", "데이터 레이크 하우스 아키텍처 이해"],
    coverLetterQuestions: [
      { id: "1", question: "지원 동기를 구체적으로 작성해주세요." },
      { id: "2", question: "데이터 엔지니어로서의 커리어 비전을 공유해주세요." },
      { id: "3", question: "문제 해결 능력을 보여주는 경험을 설명해주세요." },
    ],
    viewCount: 1987, applicants: 76,
    categoryDist: [{ label: "데이터", pct: 70 }, { label: "백엔드", pct: 20 }, { label: "기타", pct: 10 }],
  },
  {
    id: "6", company: "우아한형제들", logo: "배", logoColor: "#2AC1BC", logoBg: "#fff",
    title: "iOS 개발자", location: "송파", type: "경력 2년+", deadline: "2026-07-05",
    tags: ["Swift", "UIKit", "Combine"], salary: "6000~8500만", hot: false, new: true,
    desc: "배달의민족 앱을 만드는 iOS 개발자를 모집합니다.",
    mainDuties: [
      "배달의민족 iOS 앱 신규 기능 개발",
      "SwiftUI를 활용한 모던 UI 구현",
      "앱 성능 최적화 및 메모리 관리",
      "QA팀과 협업하여 버그 수정 및 안정성 향상",
    ],
    requirements: ["Swift 2년 이상", "UIKit/SwiftUI 경험", "앱 출시 경험"],
    preferred: ["Combine/RxSwift 경험", "CI/CD (Fastlane) 경험", "Core Data 또는 Realm 사용 경험", "코드 리뷰 문화 경험"],
    coverLetterQuestions: [
      { id: "1", question: "본인의 성장과정을 작성해주세요." },
      { id: "2", question: "우아한형제들에 지원한 이유는 무엇인가요?" },
    ],
    viewCount: 2745, applicants: 134,
    categoryDist: [{ label: "iOS", pct: 82 }, { label: "모바일", pct: 10 }, { label: "기타", pct: 8 }],
  },
];

const COMPANIES = ["전체", "카카오", "네이버", "토스", "라인", "쿠팡", "우아한형제들"];

const FILTERS = {
  job: ["전체", "프론트엔드", "백엔드", "풀스택", "데이터", "iOS/Android"],
  region: ["전체", "판교", "강남", "분당", "송파", "신촌", "잠실"],
  level: ["전체", "신입", "경력 1년+", "경력 2년+", "경력 3년+"],
};

function dDay(deadline: string) {
  const d = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return "마감";
  if (days === 0) return "D-Day";
  return `D-${days}`;
}

export function JobsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [wishes, setWishes] = useState<string[]>(["1", "3"]);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ job: "전체", region: "전체", level: "전체", company: "전체" });

  const filtered = JOBS_DATA.filter(j => {
    const matchSearch = j.title.includes(search) || j.company.includes(search) || j.tags.some(t => t.includes(search));
    const matchJob = filters.job === "전체" || j.title.includes(filters.job) || j.tags.some(t => t.includes(filters.job));
    const matchRegion = filters.region === "전체" || j.location === filters.region;
    const matchLevel = filters.level === "전체" || j.type.includes(filters.level.replace("전체", ""));
    const matchCompany = filters.company === "전체" || j.company === filters.company;
    return matchSearch && matchJob && matchRegion && matchLevel && matchCompany;
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== "전체").length;

  const toggleWish = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishes(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">채용 공고</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {filtered.length}개 공고 · 찜 {wishes.length}개</p>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="직무·회사·기술스택 검색" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm" />
        </div>
        <button onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${showFilter || activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}>
          <SlidersHorizontal className="w-4 h-4" />
          필터
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilter && (
        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Job filter */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">직군</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.job.map(o => (
                  <button key={o} onClick={() => setFilters(f => ({ ...f, job: o }))}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filters.job === o ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            {/* Region filter */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">지역</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.region.map(o => (
                  <button key={o} onClick={() => setFilters(f => ({ ...f, region: o }))}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filters.region === o ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            {/* Level filter */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">경력</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.level.map(o => (
                  <button key={o} onClick={() => setFilters(f => ({ ...f, level: o }))}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filters.level === o ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            {/* Company filter */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">기업</div>
              <div className="flex flex-wrap gap-1.5">
                {COMPANIES.map(o => (
                  <button key={o} onClick={() => setFilters(f => ({ ...f, company: o }))}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filters.company === o ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setFilters({ job: "전체", region: "전체", level: "전체", company: "전체" })}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([key, val]) => val !== "전체" && (
            <span key={key} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              {key === "job" ? "직군" : key === "region" ? "지역" : key === "level" ? "경력" : "기업"}: {val}
              <button onClick={() => setFilters(f => ({ ...f, [key]: "전체" }))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Job list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(j => {
          const dd = dDay(j.deadline);
          const isWished = wishes.includes(j.id);
          const isClose = dd !== "마감" && dd !== "D-Day" && parseInt(dd.replace("D-", "")) <= 7;
          return (
            <div
              key={j.id}
              onClick={() => navigate(`/jobs/${j.id}`)}
              className="rounded-2xl border border-border bg-card p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: j.logoBg, color: j.logoColor, border: "1px solid rgba(0,0,0,0.08)" }}>
                    {j.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{j.company}</span>
                      {j.hot && <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full">🔥 인기</span>}
                      {j.new && <span className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-1.5 py-0.5 rounded-full">NEW</span>}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{j.location} · <Briefcase className="w-3 h-3 ml-0.5" />{j.type}
                    </div>
                  </div>
                </div>
                <button onClick={e => toggleWish(j.id, e)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Heart className={`w-5 h-5 transition-colors ${isWished ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
                </button>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{j.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {j.tags.map(t => (
                  <span key={t} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.deadline}</span>
                  {j.salary !== "협의" && <span>{j.salary}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{j.applicants}명 지원</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full ${isClose || dd === "D-Day" ? "bg-red-50 text-red-500" : "bg-secondary text-muted-foreground"}`}>
                    {dd}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-20 text-center text-muted-foreground">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
