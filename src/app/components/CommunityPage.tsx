import { useState } from "react";
import {
  HelpCircle, FileText, Flag, ThumbsUp, MessageSquare, ChevronRight,
  Plus, Search, Bookmark, BookmarkCheck, X, Edit2, Trash2, Check, ArrowLeft
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface QnaItem {
  id: number;
  title: string;
  category: string;
  tags: string[];
  answers: number;
  views: number;
  bookmarked: boolean;
}

interface FreePost {
  id: number;
  title: string;
  content: string;
  author: string;
  likes: number;
  likedByMe: boolean;
  comments: FreeComment[];
  time: string;
  mine: boolean;
  reported: boolean;
}

interface FreeComment {
  id: number;
  user: string;
  text: string;
  time: string;
  mine: boolean;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "qna", label: "질문 아카이브", icon: HelpCircle },
  { id: "free", label: "자유 게시판", icon: FileText },
];

const QNA_CATEGORIES = ["전체", "프론트엔드", "백엔드", "CS 기초", "알고리즘", "DevOps", "인성"];

const INIT_QNAS: QnaItem[] = [
  { id: 1, title: "React의 useCallback과 useMemo의 차이가 뭔가요?", category: "프론트엔드", tags: ["React", "성능"], answers: 8, views: 124, bookmarked: false },
  { id: 2, title: "JWT 토큰과 세션 기반 인증의 장단점을 설명해주세요", category: "백엔드", tags: ["보안", "백엔드"], answers: 12, views: 231, bookmarked: true },
  { id: 3, title: "인덱스를 과도하게 사용하면 왜 성능이 저하되나요?", category: "CS 기초", tags: ["DB", "최적화"], answers: 6, views: 89, bookmarked: false },
  { id: 4, title: "프로세스와 스레드의 차이점은 무엇인가요?", category: "CS 기초", tags: ["OS", "CS 기초"], answers: 14, views: 310, bookmarked: false },
  { id: 5, title: "Docker와 VM의 차이점을 설명해주세요", category: "DevOps", tags: ["Docker", "DevOps"], answers: 9, views: 178, bookmarked: false },
  { id: 6, title: "자신의 강점과 약점을 말씀해주세요", category: "인성", tags: ["인성", "자기소개"], answers: 5, views: 67, bookmarked: false },
  { id: 7, title: "RESTful API 설계 원칙에 대해 설명해주세요", category: "백엔드", tags: ["REST", "API"], answers: 11, views: 195, bookmarked: false },
  { id: 8, title: "BFS와 DFS의 차이점과 적합한 사용 사례는?", category: "알고리즘", tags: ["BFS", "DFS", "그래프"], answers: 7, views: 143, bookmarked: true },
];

const INIT_FREE_POSTS: FreePost[] = [
  {
    id: 1, title: "3개월 만에 토스 합격한 후기 공유합니다",
    content: "안녕하세요! 취준 3개월 만에 토스 합격했습니다. 제가 했던 공부 방법 공유할게요.\n\n1. 알고리즘: 백준 골드 50문제 집중 풀이\n2. CS: 면접 스터디 참여로 매일 1개 주제 정리\n3. 프로젝트: 실서비스 수준 프로젝트 2개 완성\n\n포기하지 마시고 모두 화이팅!",
    author: "김개발", likes: 87, likedByMe: false, time: "2시간 전", mine: false, reported: false,
    comments: [
      { id: 1, user: "이취준", text: "정말 대단하시네요! 알고리즘 어떤 유형 위주로 하셨나요?", time: "1시간 전", mine: false },
      { id: 2, user: "나", text: "축하드려요! 저도 열심히 해야겠어요", time: "30분 전", mine: true },
    ]
  },
  {
    id: 2, title: "이력서 포트폴리오 피드백 주실 분 계신가요?",
    content: "안녕하세요. 신입 프론트엔드 개발자 지망생입니다.\nReact + TypeScript 프로젝트 3개를 진행했는데 포트폴리오 피드백 받고 싶어요.\n깃허브 링크 남겨도 될까요?",
    author: "이취준", likes: 12, likedByMe: false, time: "4시간 전", mine: false, reported: false,
    comments: []
  },
  {
    id: 3, title: "신입 연봉 협상 어떻게 하셨나요?",
    content: "연봉 협상 시도해보신 분들 경험 공유 부탁드려요. 첫 직장이라 어떻게 해야 할지 모르겠습니다.",
    author: "박신입", likes: 45, likedByMe: false, time: "어제", mine: false, reported: false,
    comments: [
      { id: 1, user: "선배개발자", text: "시장 평균 연봉을 먼저 파악하고, 최소 요구 금액을 미리 정해두는 게 좋아요", time: "어제", mine: false },
    ]
  },
];

const REPORT_REASONS = ["허위 정보", "욕설/비방", "광고/스팸", "개인정보 침해", "기타"];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="rounded-2xl border border-border bg-card w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ReportModal({ target, onClose }: { target: string; onClose: () => void }) {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <Modal title="신고 완료" onClose={onClose}>
      <div className="flex flex-col items-center gap-3 py-4">
        <Check className="w-10 h-10 text-green-400" />
        <p className="text-foreground text-sm text-center">신고가 접수되었습니다.<br />검토 후 조치하겠습니다.</p>
        <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm">확인</button>
      </div>
    </Modal>
  );
  return (
    <Modal title={`${target} 신고`} onClose={onClose}>
      <p className="text-sm text-muted-foreground mb-4">신고 사유를 선택해주세요.</p>
      <div className="flex flex-col gap-2 mb-5">
        {REPORT_REASONS.map(r => (
          <button key={r} onClick={() => setSelected(r)}
            className={`p-3 rounded-xl border text-sm text-left transition-all ${selected === r ? "border-primary bg-primary/5 text-foreground" : "border-border bg-secondary text-foreground hover:border-primary/40"}`}>
            {r}
          </button>
        ))}
      </div>
      <button disabled={!selected} onClick={() => setSubmitted(true)}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors disabled:opacity-40">
        신고 접수
      </button>
    </Modal>
  );
}

// ─── QnA Tab ─────────────────────────────────────────────────────────────────

function QnaTab() {
  const [qnas, setQnas] = useState<QnaItem[]>(INIT_QNAS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);

  const toggleBookmark = (id: number) => {
    setQnas(prev => prev.map(q => q.id === id ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  const filtered = qnas.filter(q => {
    const matchCat = category === "전체" || q.category === category;
    const matchSearch = !search || q.title.includes(search) || q.tags.some(t => t.includes(search));
    const matchBookmark = !showBookmarked || q.bookmarked;
    return matchCat && matchSearch && matchBookmark;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="질문 검색"
            className="pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 w-52" />
        </div>
        <button onClick={() => setShowBookmarked(b => !b)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all ${showBookmarked ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className="w-3.5 h-3.5" />북마크만
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {QNA_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${category === c ? "bg-primary text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(q => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow hover:border-primary/30 cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground shrink-0">{q.category}</span>
                </div>
                <h3 className="font-medium text-foreground mb-2 leading-snug">{q.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map(t => <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />답변 {q.answers}</span>
                    <span>조회 {q.views}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={e => { e.stopPropagation(); toggleBookmark(q.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${q.bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                  {q.bookmarked ? <BookmarkCheck className="w-4 h-4 fill-primary" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button onClick={e => { e.stopPropagation(); setReportId(q.id); }} title="신고"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {showBookmarked ? "북마크한 질문이 없습니다" : "검색 결과가 없습니다"}
          </div>
        )}
      </div>

      {reportId !== null && <ReportModal target="질문" onClose={() => setReportId(null)} />}
    </div>
  );
}

// ─── Free Board Tab ───────────────────────────────────────────────────────────

function FreeTab() {
  const [posts, setPosts] = useState<FreePost[]>(INIT_FREE_POSTS);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});

  const openPost = posts.find(p => p.id === openId);

  const submit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editId !== null) {
      setPosts(prev => prev.map(p => p.id === editId ? { ...p, title: form.title, content: form.content } : p));
      setEditId(null);
    } else {
      setPosts(prev => [{
        id: Date.now(), title: form.title, content: form.content, author: "나", likes: 0, likedByMe: false, comments: [], time: `방금 전`, mine: true, reported: false
      }, ...prev]);
    }
    setForm({ title: "", content: "" });
    setShowWrite(false);
  };

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));
  };

  const addComment = (id: number) => {
    const text = commentInput[id]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p.id === id ? {
      ...p, comments: [...p.comments, { id: Date.now(), user: "나", text, time: "방금 전", mine: true }]
    } : p));
    setCommentInput(prev => ({ ...prev, [id]: "" }));
  };

  if (openPost) return (
    <div>
      <button onClick={() => setOpenId(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />목록으로
      </button>
      <div className="rounded-2xl border border-border bg-card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{openPost.title}</h2>
            <div className="text-xs text-muted-foreground">{openPost.author} · {openPost.time}</div>
          </div>
          <div className="flex items-center gap-1">
            {openPost.mine && (
              <>
                <button onClick={() => { setForm({ title: openPost.title, content: openPost.content }); setEditId(openPost.id); setShowWrite(true); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setPosts(prev => prev.filter(p => p.id !== openPost.id)); setOpenId(null); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
            {!openPost.mine && <button onClick={() => setReportId(openPost.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-red-500 transition-colors"><Flag className="w-3.5 h-3.5" /></button>}
          </div>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-5">{openPost.content}</p>
        <div className="flex items-center gap-3 text-xs border-t border-border pt-4">
          <button onClick={() => toggleLike(openPost.id)} className={`flex items-center gap-1 transition-colors ${openPost.likedByMe ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
            <ThumbsUp className={`w-3.5 h-3.5 ${openPost.likedByMe ? "fill-primary" : ""}`} />{openPost.likes}
          </button>
          <span className="flex items-center gap-1 text-muted-foreground"><MessageSquare className="w-3.5 h-3.5" />{openPost.comments.length}</span>
        </div>
      </div>
      {/* Comments */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4">댓글 {openPost.comments.length}개</h3>
        <div className="flex flex-col gap-4 mb-4">
          {openPost.comments.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-medium">{c.user[0]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{c.user}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-sm text-foreground">{c.text}</p>
              </div>
              {c.mine && (
                <button onClick={() => setPosts(prev => prev.map(p => p.id === openPost.id ? { ...p, comments: p.comments.filter(cc => cc.id !== c.id) } : p))}
                  className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
              )}
            </div>
          ))}
          {openPost.comments.length === 0 && <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>}
        </div>
        <div className="flex gap-2">
          <input value={commentInput[openPost.id] ?? ""} onChange={e => setCommentInput(prev => ({ ...prev, [openPost.id]: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") addComment(openPost.id); }}
            placeholder="댓글을 작성해주세요..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60" />
          <button onClick={() => addComment(openPost.id)} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">등록</button>
        </div>
      </div>
      {reportId !== null && <ReportModal target="게시글" onClose={() => setReportId(null)} />}
      {showWrite && (
        <Modal title="게시글 수정" onClose={() => setShowWrite(false)}>
          <div className="flex flex-col gap-3">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="제목"
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} placeholder="내용"
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary/60" />
            <button onClick={submit} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600">수정 완료</button>
          </div>
        </Modal>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button onClick={() => { setShowWrite(true); setEditId(null); setForm({ title: "", content: "" }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">
          <Plus className="w-4 h-4" />글쓰기
        </button>
      </div>
      {posts.filter(p => !p.reported).map(p => (
        <div key={p.id} className="rounded-2xl border border-border bg-card px-5 py-4 hover:shadow-sm transition-shadow hover:border-primary/20">
          <div className="flex items-center justify-between">
            <button onClick={() => setOpenId(p.id)} className="flex-1 text-left">
              <h3 className="font-medium text-foreground">{p.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{p.author}</span>
                <span>{p.time}</span>
                {p.mine && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">내 글</span>}
              </div>
            </button>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1 text-xs transition-colors ${p.likedByMe ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                <ThumbsUp className={`w-3 h-3 ${p.likedByMe ? "fill-primary" : ""}`} />{p.likes}
              </button>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="w-3 h-3" />{p.comments.length}</span>
              {p.mine && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => { setForm({ title: p.title, content: p.content }); setEditId(p.id); setShowWrite(true); }}
                    className="p-1 text-muted-foreground hover:text-foreground"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => setPosts(prev => prev.filter(x => x.id !== p.id))}
                    className="p-1 text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
              {!p.mine && (
                <button onClick={() => setReportId(p.id)} className="p-1 text-muted-foreground hover:text-red-400"><Flag className="w-3 h-3" /></button>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      ))}

      {showWrite && (
        <Modal title={editId !== null ? "게시글 수정" : "게시글 작성"} onClose={() => setShowWrite(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">제목 *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">내용 *</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6}
                placeholder="취업 정보, 질문 등 자유롭게 작성해주세요"
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary/60" />
            </div>
            <button onClick={submit} disabled={!form.title.trim() || !form.content.trim()}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors disabled:opacity-40">
              {editId !== null ? "수정 완료" : "게시글 등록"}
            </button>
          </div>
        </Modal>
      )}
      {reportId !== null && <ReportModal target="게시글" onClose={() => setReportId(null)} />}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function CommunityPage() {
  const [tab, setTab] = useState("qna");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">커뮤니티</h1>
        <p className="text-sm text-muted-foreground mt-1">취준생들과 정보를 나누고 함께 성장해요</p>
      </div>
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === id ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>
      {tab === "qna" && <QnaTab />}
      {tab === "free" && <FreeTab />}
    </div>
  );
}
