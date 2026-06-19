import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import {
  BrainCircuit, LayoutDashboard, BookOpen, Briefcase,
  Calendar, FileText, Users, Menu, X, ChevronDown,
  Bell, Heart, History, LogOut, Settings, Shield,
  User, ChevronRight, Sparkles
} from "lucide-react";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ChatbotWidget } from "./ChatbotWidget";
import { isAuthed, setAuthed } from "../auth";
import { publishedNotices, NoticeRow, NOTICE_TYPE_CLS } from "../data/notices";

const NAV_MAIN = [
  {
    label: "교육",
    href: "/education",
    icon: BookOpen,
    dropdown: [
      { label: "전체 강좌", href: "/education" },
      { label: "알고리즘", href: "/education?category=algorithm" },
      { label: "CS 기초", href: "/education?category=cs" },
      { label: "프론트엔드", href: "/education?category=frontend" },
      { label: "백엔드", href: "/education?category=backend" },
      { separator: true },
      { label: "AI 퀴즈 시작", href: "/education", highlight: true },
    ]
  },
  {
    label: "공고",
    href: "/jobs",
    icon: Briefcase,
    dropdown: [
      { label: "공고 리스트", href: "/jobs" },
      { label: "찜한 공고", href: "/jobs?saved=true" },
    ]
  },
  {
    label: "캘린더",
    href: "/calendar",
    icon: Calendar,
    dropdown: [
      { label: "교육 캘린더", href: "/calendar?type=edu" },
      { label: "공고 캘린더", href: "/calendar?type=job" },
    ]
  },
  {
    label: "이력서",
    href: "/resume",
    icon: FileText,
    dropdown: [
      { label: "이력서 작성", href: "/resume" },
      { label: "히스토리", href: "/resume?tab=history" },
      { label: "공개 설정", href: "/resume?tab=settings" },
    ]
  },
  {
    label: "모의 면접",
    href: "/interview",
    icon: BrainCircuit,
    badge: "유료",
  },
  {
    label: "커뮤니티",
    href: "/community",
    icon: Users,
    dropdown: [
      { label: "질문 아카이브", href: "/community?tab=qna" },
      { label: "자유 게시판", href: "/community?tab=free" },
    ]
  },
];

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [noticeDetail, setNoticeDetail] = useState<NoticeRow | null>(null);
  const [noticeListOpen, setNoticeListOpen] = useState(false);
  const [noticePopup, setNoticePopup] = useState<NoticeRow | null>(null);

  const isInterview = location.pathname.startsWith("/interview/session");
  const isLanding = location.pathname === "/";
  const isAuth = location.pathname === "/auth";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isLoggedIn = isAuthed(); // 실제 로그인 여부(localStorage 플래그)로 판정
  const showNav = !isAuth; // nav는 auth 페이지 외 모두 표시

  // Simulate admin role - in production, this would come from auth context
  const isAdmin = true; // Set to true to show admin features

  const notices = publishedNotices();
  const unreadCount = notices.length;

  // 랜딩 첫 진입 시 최신 공지 팝업 (오늘 하루 보지 않기 적용)
  useEffect(() => {
    if (location.pathname !== "/") return;
    const latest = publishedNotices()[0];
    if (!latest) return;
    let hiddenUntil = "";
    try { hiddenUntil = localStorage.getItem("devready_notice_hidden_until") ?? ""; } catch { /* ignore */ }
    const today = new Date().toISOString().slice(0, 10);
    if (hiddenUntil === today) return;
    setNoticePopup(latest);
  }, [location.pathname]);

  const hideNoticeToday = () => {
    try { localStorage.setItem("devready_notice_hidden_until", new Date().toISOString().slice(0, 10)); } catch { /* ignore */ }
    setNoticePopup(null);
  };

  if (isInterview || isAdminPage) return (<><Outlet /><ChatbotWidget /></>);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AnnouncementBanner />

      <header
        className="sticky top-0 z-50 border-b border-border"
        style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 select-none mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-black tracking-tighter leading-none text-[13px]">DR</span>
            </div>
            <span className="font-bold tracking-tight text-foreground text-lg">DevReady</span>
          </Link>

          {/* Main nav */}
          {showNav && (
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_MAIN.map(({ label, href, icon: Icon, badge, dropdown }) => {
                const active = location.pathname === href || location.pathname.startsWith(href + "/");
                const isDropdownOpen = activeDropdown === label;

                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => dropdown && setActiveDropdown(label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      to={href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                        active
                          ? "font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      style={{
                        color: active ? "#6C63FF" : undefined
                      }}
                    >
                      {label}
                      {badge && (
                        <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">
                          {badge}
                        </span>
                      )}
                    </Link>

                    {/* Dropdown Menu */}
                    {dropdown && isDropdownOpen && (
                      <div
                        className="absolute top-full left-0 w-48 rounded-lg border border-border bg-white overflow-hidden z-50 py-1"
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", marginTop: "-2px", paddingTop: "6px" }}
                      >
                        {dropdown.map((item, idx) => {
                          if (item.separator) {
                            return <div key={idx} className="h-px bg-border my-1" />;
                          }
                          return (
                            <Link
                              key={idx}
                              to={item.href}
                              className={`block px-4 py-2.5 transition-colors ${
                                item.highlight
                                  ? "text-primary font-medium"
                                  : "text-foreground"
                              }`}
                              style={{
                                fontSize: "14px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#EEF2FF";
                                e.currentTarget.style.color = "#6C63FF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                if (!item.highlight) {
                                  e.currentTarget.style.color = "";
                                } else {
                                  e.currentTarget.style.color = "#6C63FF";
                                }
                              }}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {isLoggedIn ? (
              <>
                {/* 알림 */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="알림"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">공지사항</span>
                        <span className="text-xs text-muted-foreground">{notices.length}건</span>
                      </div>
                      {notices.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">등록된 공지가 없습니다.</div>
                      )}
                      {notices.map(n => (
                        <button key={n.id}
                          onClick={() => { setNoticeDetail(n); setNotifOpen(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary cursor-pointer transition-colors text-left">
                          <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${NOTICE_TYPE_CLS[n.type]}`}>{n.type}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                          </div>
                        </button>
                      ))}
                      <button onClick={() => { setNoticeListOpen(true); setNotifOpen(false); }}
                        className="w-full px-4 py-3 border-t border-border text-sm text-primary hover:bg-secondary transition-colors flex items-center justify-center gap-1">
                        전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 찜 */}
                <button
                  onClick={() => navigate("/jobs?saved=true")}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="찜한 공고"
                >
                  <Heart className="w-5 h-5" />
                </button>

                {/* 이력서 히스토리 */}
                <button
                  onClick={() => navigate("/mypage?tab=resume")}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="이력서 히스토리"
                >
                  <History className="w-5 h-5" />
                </button>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs text-primary font-semibold">
                      김
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50 py-1">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="font-semibold text-sm text-foreground">김지수</div>
                        <div className="text-xs text-muted-foreground">jisu@example.com</div>
                      </div>
                      {[
                        { icon: User, label: "마이페이지", href: "/mypage", show: true },
                        { icon: FileText, label: "이력서 관리", href: "/resume", show: true },
                        { icon: History, label: "면접 기록", href: "/history", show: true },
                        { icon: Shield, label: "관리자 패널", href: "/admin", show: isAdmin },
                      ].filter(item => item.show).map(({ icon: Icon, label, href }) => (
                        <button
                          key={label}
                          onClick={() => { navigate(href); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          {label}
                        </button>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={() => { setAuthed(false); setProfileOpen(false); navigate("/"); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu */}
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/auth")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  로그인
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-indigo-600 transition-colors"
                >
                  무료 시작
                </button>
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && showNav && (
          <div className="lg:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
            {NAV_MAIN.map(({ label, href, icon: Icon, badge }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{badge}</span>}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
              <Link to="/mypage" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors text-foreground">
                <User className="w-4 h-4" /> 마이페이지
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors text-foreground">
                  <Shield className="w-4 h-4" /> 관리자 패널
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Click-outside to close dropdowns */}
      {(notifOpen || profileOpen || activeDropdown) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false); setActiveDropdown(null); }} />
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* 공지 상세 모달 */}
      {noticeDetail && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4" onClick={() => setNoticeDetail(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${NOTICE_TYPE_CLS[noticeDetail.type]}`}>{noticeDetail.type}</span>
              <button onClick={() => setNoticeDetail(null)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="px-6 py-5">
              <h3 className="font-semibold text-foreground mb-1">{noticeDetail.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{noticeDetail.date}</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{noticeDetail.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* 공지 전체 목록 모달 */}
      {noticeListOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4" onClick={() => setNoticeListOpen(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="font-semibold text-foreground">공지사항 전체</span>
              <button onClick={() => setNoticeListOpen(false)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
              {notices.map(n => (
                <button key={n.id} onClick={() => { setNoticeDetail(n); setNoticeListOpen(false); }}
                  className="w-full flex items-start gap-3 px-6 py-3.5 hover:bg-secondary text-left transition-colors">
                  <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${NOTICE_TYPE_CLS[n.type]}`}>{n.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 랜딩 공지 팝업 */}
      {isLanding && noticePopup && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${NOTICE_TYPE_CLS[noticePopup.type]}`}>{noticePopup.type}</span>
              <h3 className="font-semibold text-foreground mb-1">{noticePopup.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{noticePopup.date}</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{noticePopup.content}</p>
            </div>
            <div className="flex border-t border-border">
              <button onClick={hideNoticeToday} className="flex-1 py-3 text-sm text-muted-foreground hover:bg-secondary transition-colors">오늘 하루 보지 않기</button>
              <button onClick={() => setNoticePopup(null)} className="flex-1 py-3 text-sm font-medium text-primary border-l border-border hover:bg-secondary transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}

      <ChatbotWidget />
    </div>
  );
}
