import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
  PieChart, Pie, Cell
} from "recharts";
import {
  Users, Shield, Briefcase, AlertTriangle, Bell, BookOpen, Star, Bot,
  Plus, Trash2, Edit2, Search, Send, ArrowLeft, Save, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, LayoutDashboard, Eye, UserX, Download
} from "lucide-react";
import { useNavigate } from "react-router";

// ─── Constants ────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "domain-header", label: "DOMAIN", isHeader: true },
  { id: "users", label: "회원 관리", icon: Users },
  { id: "jobs", label: "공고 관리", icon: Briefcase },
  { id: "reports", label: "자유게시판 관리", icon: AlertTriangle },
  { id: "content-header", label: "CONTENT", isHeader: true },
  { id: "algorithms", label: "알고리즘 관리", icon: BookOpen },
  { id: "chatbot", label: "챗봇 관리", icon: Bot },
  { id: "notices", label: "공지사항·FAQ", icon: Bell },
  { id: "system-header", label: "SYSTEM", isHeader: true },
  { id: "notifications", label: "알림 관리", icon: Send },
  { id: "satisfaction", label: "만족도 관리", icon: Star },
  { id: "admin-auth", label: "관리자 권한", icon: Shield },
];

const INIT_ADMINS = [
  { id: 1, name: "관리자1", email: "admin1@interviewai.com", role: "슈퍼관리자", permissions: ["전체"], lastLogin: "2026-06-09", active: true },
  { id: 2, name: "관리자2", email: "admin2@interviewai.com", role: "컨텐츠관리", permissions: ["알고리즘", "챗봇"], lastLogin: "2026-06-08", active: true },
  { id: 3, name: "관리자3", email: "admin3@interviewai.com", role: "고객지원", permissions: ["신고", "커뮤니티"], lastLogin: "2026-06-07", active: false },
];

const ALL_PERMISSIONS = ["회원관리", "기업관리", "공고관리", "신고관리", "알림관리", "커뮤니티", "알고리즘", "만족도", "챗봇", "약관관리", "전체"];

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminAccount = {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  active: boolean;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed top-6 right-6 z-[100] bg-white border border-green-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
      <CheckCircle2 className="w-4 h-4" />{msg}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    활성: "bg-green-100 text-green-700",
    정지: "bg-amber-100 text-amber-700",
    탈퇴: "bg-gray-100 text-gray-500",
    승인: "bg-green-100 text-green-700",
    대기: "bg-yellow-100 text-yellow-700",
    반려: "bg-red-100 text-red-600",
    비활성: "bg-gray-100 text-gray-500",
    삭제: "bg-red-100 text-red-600",
    접수: "bg-blue-100 text-blue-700",
    경고처리: "bg-amber-100 text-amber-700",
    삭제처리: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">{title}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><XCircle className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function inputCls(extra = "") {
  return `w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${extra}`;
}

function csvDownload(filename: string, rows: string[][]) {
  const content = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── AdminAuthSection ─────────────────────────────────────────────────────────

function AdminAuthSection() {
  const [admins, setAdmins] = useState<AdminAccount[]>(INIT_ADMINS);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [toast, setToast] = useState("");

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleCreate = (acc: Omit<AdminAccount, "id" | "lastLogin" | "active">) => {
    const newAdmin: AdminAccount = { ...acc, id: Date.now(), lastLogin: "-", active: true };
    setAdmins(prev => [...prev, newAdmin]);
    setShowCreate(false);
    showMsg(`관리자 계정 '${acc.name}'이(가) 생성되었습니다.`);
  };

  const handleEditPerms = (id: number, permissions: string[]) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, permissions } : a));
    setEditTarget(null);
    showMsg("권한이 수정되었습니다.");
  };

  const handleToggleActive = (id: number) => {
    setAdmins(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = !a.active;
      showMsg(`계정이 ${next ? "활성화" : "비활성화"}되었습니다.`);
      return { ...a, active: next };
    }));
  };

  return (
    <div>
      <Toast msg={toast} />
      {showCreate && <AdminCreateModal onConfirm={handleCreate} onClose={() => setShowCreate(false)} />}
      {editTarget && <AdminEditPermsModal admin={editTarget} onConfirm={perms => handleEditPerms(editTarget.id, perms)} onClose={() => setEditTarget(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">관리자 권한 관리</h1>
          <p className="text-sm text-muted-foreground">관리자 계정 생성·권한 부여·비활성화 (총관리자 전용)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
          <Plus className="w-4 h-4" />관리자 추가
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">이름 / 이메일</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">역할</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">기능 권한</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">최근 로그인</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                <tr key={admin.id} className={`hover:bg-secondary/50 transition-colors ${!admin.active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {admin.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{admin.name}</div>
                        <div className="text-xs text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">{admin.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {admin.permissions.map((perm, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{perm}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{admin.lastLogin}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={admin.active ? "활성" : "비활성"} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditTarget(admin)} title="권한 수정"
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(admin.id)} title={admin.active ? "비활성화" : "활성화"}
                        className={`p-1.5 rounded-lg transition-colors ${admin.active ? "hover:bg-amber-50 text-muted-foreground hover:text-amber-600" : "hover:bg-green-50 text-muted-foreground hover:text-green-600"}`}>
                        {admin.active ? <UserX className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCreateModal({ onConfirm, onClose }: {
  onConfirm: (acc: Omit<AdminAccount, "id" | "lastLogin" | "active">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", role: "컨텐츠관리", permissions: [] as string[], password: "", passwordConfirm: "" });
  const [error, setError] = useState("");

  const togglePerm = (p: string) => {
    if (p === "전체") { setForm(f => ({ ...f, permissions: f.permissions.includes("전체") ? [] : ["전체"] })); return; }
    setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions.filter(x => x !== "전체"), p] }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) { setError("모든 필드를 입력해주세요."); return; }
    if (form.password !== form.passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (form.permissions.length === 0) { setError("최소 하나의 권한을 선택해주세요."); return; }
    onConfirm({ name: form.name, email: form.email, role: form.role, permissions: form.permissions });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">관리자 계정 생성</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><XCircle className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">이름 *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동"
                className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">역할</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className={inputCls()}>
                {["컨텐츠관리", "고객지원", "데이터분석", "기업관리"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">이메일 *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@interviewai.com"
              className={inputCls()} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">초기 비밀번호 *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">비밀번호 확인 *</label>
              <input type="password" value={form.passwordConfirm} onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))} className={inputCls()} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">기능별 권한 부여 *</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                  form.permissions.includes(perm) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}>
                  <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePerm(perm)} className="w-3.5 h-3.5 accent-primary" />
                  <span className="text-xs">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-secondary transition-colors">취소</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">계정 생성</button>
        </div>
      </div>
    </div>
  );
}

function AdminEditPermsModal({ admin, onConfirm, onClose }: {
  admin: AdminAccount;
  onConfirm: (perms: string[]) => void;
  onClose: () => void;
}) {
  const [perms, setPerms] = useState<string[]>(admin.permissions);

  const togglePerm = (p: string) => {
    if (p === "전체") { setPerms(prev => prev.includes("전체") ? [] : ["전체"]); return; }
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev.filter(x => x !== "전체"), p]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">권한 수정</span>
            </div>
            <p className="text-xs text-muted-foreground">{admin.name} ({admin.email})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><XCircle className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6">
          <label className="block text-xs font-medium text-muted-foreground mb-3">접근 가능한 기능 선택</label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                perms.includes(perm) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}>
                <input type="checkbox" checked={perms.includes(perm)} onChange={() => togglePerm(perm)} className="w-3.5 h-3.5 accent-primary" />
                <span className="text-xs">{perm}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-secondary transition-colors">취소</button>
          <button onClick={() => onConfirm(perms)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">
            <Save className="w-3.5 h-3.5" />저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const DASH_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DASH_SIGNUP = [85,102,78,134,156,198,167,145,189,210,178,230];
const DASH_ACTIVE = [420,480,510,620,720,850,780,810,920,1050,980,1150];
const DASH_LINE_DATA = DASH_MONTHS.map((m, i) => ({ month: m, 신규가입: DASH_SIGNUP[i], 활성이용자: DASH_ACTIVE[i] }));

const DASH_JOB_DATA = [
  { name: "프론트엔드", 횟수: 2840, 평균점수: 76 },
  { name: "백엔드", 횟수: 2120, 평균점수: 74 },
  { name: "풀스택", 횟수: 1560, 평균점수: 78 },
  { name: "DevOps", 횟수: 680, 평균점수: 72 },
  { name: "AI/ML", 횟수: 420, 평균점수: 80 },
];

const DASH_REVENUE_DATA = [
  { plan: "무료", 건수: 890, 매출: 0 },
  { plan: "베이직", 건수: 284, 매출: 2811600 },
  { plan: "프로", 건수: 108, 매출: 2149200 },
];

const KPI_CARDS = [
  { label: "전체 회원", value: "1,284명", sub: "↑ 이번달 +128", color: "#6C63FF" },
  { label: "면접 횟수", value: "8,420회", sub: "이번달 +340", color: "#10B981" },
  { label: "등록 공고", value: "156건", sub: "진행중 42건", color: "#F59E0B" },
  { label: "이번달 매출", value: "24,180,000원", sub: "↑ 전월대비 +12%", color: "#EF4444" },
];

function DashboardSection() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">대시보드</h1>
        <p className="text-sm text-muted-foreground">DevReady 플랫폼 운영 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map((k, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: k.color }} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-5">월별 신규가입 / 활성이용자</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={DASH_LINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="신규가입" stroke="#6C63FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="활성이용자" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-5">직군별 면접 이용 (면접통계)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DASH_JOB_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8 }} />
              <Bar dataKey="횟수" fill="#6C63FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-5">구독별 매출</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DASH_REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="plan" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8 }}
              formatter={(v: number) => v.toLocaleString() + "원"} />
            <Bar dataKey="매출" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Users (A-003) ────────────────────────────────────────────────────────────

type UserRow = { id: number; name: string; email: string; plan: "무료"|"베이직"|"프로"; sessions: number; joined: string; status: "활성"|"정지"|"탈퇴"; };

const INIT_USERS: UserRow[] = [
  { id: 1, name: "김철수", email: "kim@example.com", plan: "프로", sessions: 42, joined: "2026-01-15", status: "활성" },
  { id: 2, name: "이영희", email: "lee@example.com", plan: "베이직", sessions: 18, joined: "2026-02-20", status: "활성" },
  { id: 3, name: "박민준", email: "park@example.com", plan: "무료", sessions: 5, joined: "2026-03-10", status: "활성" },
  { id: 4, name: "최수연", email: "choi@example.com", plan: "프로", sessions: 31, joined: "2026-01-05", status: "정지" },
  { id: 5, name: "정도현", email: "jung@example.com", plan: "베이직", sessions: 9, joined: "2026-04-22", status: "활성" },
  { id: 6, name: "한지민", email: "han@example.com", plan: "무료", sessions: 2, joined: "2026-05-30", status: "탈퇴" },
];

function UsersSection() {
  const [users, setUsers] = useState<UserRow[]>(INIT_USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [toast, setToast] = useState("");

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const filtered = users.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search);
    const matchFilter = filter === "전체" || u.status === filter;
    return matchSearch && matchFilter;
  });

  const planColor: Record<string, string> = { 무료: "bg-gray-100 text-gray-600", 베이직: "bg-blue-100 text-blue-700", 프로: "bg-purple-100 text-purple-700" };

  return (
    <div className="flex gap-6">
      <Toast msg={toast} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">회원 관리</h1>
            <p className="text-sm text-muted-foreground">회원 목록 조회 및 상태 관리</p>
          </div>
          <button onClick={() => csvDownload("users.csv", [
            ["이름","이메일","플랜","면접횟수","가입일","상태"],
            ...users.map(u => [u.name, u.email, u.plan, String(u.sessions), u.joined, u.status])
          ])} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm border border-border">
            <Download className="w-4 h-4" />문서 다운
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름 또는 이메일 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border text-sm focus:outline-none focus:border-primary/60" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white border border-border text-sm focus:outline-none">
            {["전체","활성","정지","탈퇴"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">이름 / 이메일</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">플랜</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">면접횟수</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">가입일</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-secondary/50 cursor-pointer transition-colors" onClick={() => setSelected(u)}>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${planColor[u.plan]}`}>{u.plan}</span></td>
                    <td className="px-5 py-4 text-sm text-foreground">{u.sessions}회</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{u.joined}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {u.status === "활성" && (
                          <button onClick={() => { setSuspendTarget(u); setSuspendReason(""); }}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs transition-colors">정지</button>
                        )}
                        {u.status === "활성" && (
                          <button onClick={() => { if (confirm(`${u.name} 회원을 탈퇴 처리하시겠습니까?`)) { setUsers(prev => prev.map(x => x.id === u.id ? {...x, status: "탈퇴"} : x)); showMsg("탈퇴 처리되었습니다."); } }}
                            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs transition-colors">탈퇴</button>
                        )}
                        {(u.status === "정지" || u.status === "탈퇴") && (
                          <button onClick={() => { setUsers(prev => prev.map(x => x.id === u.id ? {...x, status: "활성"} : x)); showMsg("활성화 복구되었습니다."); }}
                            className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs transition-colors">복구</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-72 shrink-0 rounded-2xl border border-border bg-card p-5 self-start sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-foreground">회원 상세</span>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-secondary"><XCircle className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
            {selected.name[0]}
          </div>
          <div className="text-center mb-4">
            <div className="font-semibold text-foreground">{selected.name}</div>
            <div className="text-xs text-muted-foreground">{selected.email}</div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">플랜</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColor[selected.plan]}`}>{selected.plan}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">면접횟수</span><span className="text-foreground font-medium">{selected.sessions}회</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">가입일</span><span className="text-foreground">{selected.joined}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">최근면접</span><span className="text-foreground">2026-06-09</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">상태</span><StatusBadge status={selected.status} /></div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendTarget && (
        <Modal title="회원 정지" onClose={() => setSuspendTarget(null)}>
          <p className="text-sm text-foreground"><span className="font-semibold">{suspendTarget.name}</span> 회원을 정지합니다. 사유를 입력해주세요.</p>
          <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={4} placeholder="정지 사유를 입력하세요..."
            className={inputCls()} />
          <div className="flex gap-2">
            <button onClick={() => setSuspendTarget(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button onClick={() => {
              if (!suspendReason.trim()) return;
              setUsers(prev => prev.map(u => u.id === suspendTarget.id ? {...u, status: "정지"} : u));
              if (selected?.id === suspendTarget.id) setSelected(prev => prev ? {...prev, status: "정지"} : null);
              showMsg("정지 처리되었습니다.");
              setSuspendTarget(null);
            }} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">정지 확인</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Companies (A-004) ────────────────────────────────────────────────────────

type CompanyRow = { id: number; name: string; contact: string; email: string; jobs: number; status: "승인"|"대기"|"반려"|"비활성"; };

const INIT_COMPANIES: CompanyRow[] = [
  { id: 1, name: "카카오", contact: "김HR", email: "hr@kakao.com", jobs: 12, status: "승인" },
  { id: 2, name: "네이버", contact: "이채용", email: "recruit@naver.com", jobs: 8, status: "대기" },
  { id: 3, name: "토스", contact: "박팀장", email: "jobs@toss.im", jobs: 15, status: "승인" },
  { id: 4, name: "라인플러스", contact: "최담당", email: "hr@linecorp.com", jobs: 3, status: "반려" },
];

// ─── Jobs (A-005) ─────────────────────────────────────────────────────────────

type JobRow = {
  id: number; company: string; title: string;
  status: "대기"|"승인"|"반려"|"삭제"; applicants: number; deadline: string;
  // ── 신규(공고 작성) ──
  location?: string;     // 위치
  type?: string;         // 경력/신입
  salary?: string;       // 급여
  applyStart?: string;   // 지원 시작일 YYYY-MM-DD
  applyEnd?: string;     // 지원 마감일 YYYY-MM-DD (deadline과 동기화)
  education?: string;    // 자격요건(학력)
  category?: string;     // 업무 기본 카테고리
  languages?: string[];  // 업무 언어/기술스택
  field?: string;        // 업무 분야/도메인
  mainDuties?: string[];                              // [전체/기타사항] 업무 상세
  preferred?: string[];                               // [전체/기타사항] 우대사항
  coverLetterQuestions?: { id: string; question: string }[]; // [전체/기타사항] 추가질문
};

const INIT_JOBS: JobRow[] = [
  { id: 1, company: "카카오", title: "프론트엔드 개발자", status: "승인", applicants: 42, deadline: "2026-06-20" },
  { id: 2, company: "네이버", title: "백엔드 개발자", status: "대기", applicants: 0, deadline: "2026-06-25" },
  { id: 3, company: "토스", title: "풀스택 개발자", status: "승인", applicants: 28, deadline: "2026-07-01" },
  { id: 4, company: "라인플러스", title: "DevOps 엔지니어", status: "대기", applicants: 0, deadline: "2026-07-10" },
  { id: 5, company: "쿠팡", title: "AI/ML 엔지니어", status: "반려", applicants: 0, deadline: "2026-06-30" },
];

const JOB_CATEGORIES = ["프론트엔드","백엔드","풀스택","데이터","모바일","AI·ML","DevOps","기타"];
const JOB_TYPES = ["신입","경력","신입·경력 무관"];
const JOB_EDUCATIONS = ["무관","고졸 이상","초대졸 이상","대졸 이상","석사 이상"];
const JOB_FIELDS = ["웹서비스","핀테크","커머스","플랫폼","AI","게임","기타"];

// TODO(AI연동): 실서비스에선 EXAONE 서버(POST /interview/generate 또는 신규 /job/recommend)에
// category·languages·field·경력·학력을 보내 추천을 받음. 프로토타입이라 아래 mock으로 대체.
function recommendJobContent(input: {
  category: string; languages: string[]; field: string; type: string; education: string;
}): { mainDuties: string[]; preferred: string[]; coverLetterQuestions: { id: string; question: string }[] } {
  const langs = input.languages.map(l => l.toLowerCase());
  const has = (k: string) => langs.some(l => l.includes(k));
  const duties: string[] = [];
  const preferred: string[] = [];
  const questions: string[] = [];

  switch (input.category) {
    case "프론트엔드":
      duties.push("React 기반 컴포넌트 설계 및 UI 구현", "렌더링 성능 최적화 및 번들 사이즈 관리", "웹 접근성(WCAG)·반응형 UI 대응");
      preferred.push("Next.js SSR/SSG 경험", "디자인 시스템 구축 경험", "Core Web Vitals 최적화 경험");
      questions.push("최근 진행한 프론트엔드 성능 최적화 경험을 설명해 주세요.", "컴포넌트 재사용성을 높이기 위한 본인만의 설계 원칙은?");
      break;
    case "백엔드":
      duties.push("RESTful API 설계 및 서버 로직 구현", "데이터베이스 모델링 및 쿼리 최적화", "트래픽 대응을 위한 캐싱·확장 전략 수립");
      preferred.push("대용량 트래픽 처리 경험", "MSA 설계·운영 경험", "Redis 캐싱 전략 경험");
      questions.push("N+1 문제를 경험하고 해결한 사례를 설명해 주세요.", "트랜잭션 격리 수준을 실제로 고려한 경험이 있나요?");
      break;
    case "데이터":
      duties.push("데이터 파이프라인 설계 및 ETL 구축", "데이터 품질 모니터링 및 정합성 관리", "분석용 데이터 마트 설계");
      preferred.push("Airflow 워크플로우 관리 경험", "대규모 배치/스트리밍 처리 경험", "데이터 레이크하우스 이해");
      questions.push("데이터 파이프라인 장애를 대응한 경험을 설명해 주세요.", "데이터 품질을 보장하기 위한 본인의 방법은?");
      break;
    case "모바일":
      duties.push("네이티브/크로스플랫폼 앱 기능 개발", "앱 성능·메모리 최적화", "스토어 배포 및 버전 관리");
      preferred.push("CI/CD(Fastlane) 경험", "오프라인 캐싱 전략 경험", "접근성 대응 경험");
      questions.push("앱 출시 후 크래시를 줄이기 위해 한 노력을 설명해 주세요.", "앱 아키텍처를 선택한 기준은 무엇인가요?");
      break;
    case "AI·ML":
      duties.push("모델 학습·평가 파이프라인 구축", "데이터 전처리 및 피처 엔지니어링", "모델 서빙 및 성능 모니터링");
      preferred.push("LLM 파인튜닝·프롬프트 엔지니어링 경험", "MLOps 파이프라인 구축 경험", "분산 학습 경험");
      questions.push("모델 성능을 개선한 가장 효과적인 시도를 설명해 주세요.", "오프라인 지표와 실서비스 지표가 달랐던 경험이 있나요?");
      break;
    case "DevOps":
      duties.push("CI/CD 파이프라인 구축 및 운영", "쿠버네티스 기반 인프라 관리", "모니터링·알림 체계 구성");
      preferred.push("IaC(Terraform) 경험", "멀티클라우드 운영 경험", "인프라 비용 최적화 경험");
      questions.push("장애 대응 자동화를 구축한 경험을 설명해 주세요.", "인프라 비용을 절감한 구체적 사례가 있나요?");
      break;
    default: // 풀스택·기타
      duties.push("프론트엔드·백엔드 기능 통합 개발", "API 설계 및 서비스 아키텍처 개선", "기능 단위 배포 및 운영");
      preferred.push("클라우드 인프라 운영 경험", "실시간 기능(WebSocket) 구현 경험", "테스트 자동화 경험");
      questions.push("가장 어려웠던 풀스택 프로젝트 경험을 설명해 주세요.", "프론트와 백엔드 사이 인터페이스를 설계한 방식은?");
  }

  // 언어/기술스택 기반 보강
  if (has("java") || has("spring")) { duties.push("Spring Boot 기반 백엔드 서비스 개발"); preferred.push("JPA/QueryDSL 활용 경험"); }
  if (has("react") || has("typescript")) preferred.push("React + TypeScript 대규모 프로젝트 경험");
  if (has("python")) duties.push("Python 기반 데이터 처리·자동화 스크립트 작성");
  if (has("kotlin") || has("swift")) preferred.push("네이티브 모바일 개발 경험");
  if (has("aws") || has("docker") || has("kubernetes")) preferred.push("컨테이너·클라우드 인프라 운영 경험");

  // 분야·경력 기반 질문 보강
  if (input.field && input.field !== "기타") questions.push(`${input.field} 도메인에 관심을 갖게 된 계기를 설명해 주세요.`);
  if (input.type === "신입") questions.push("학습한 내용을 실무에 적용해 본 프로젝트가 있나요?");
  else if (input.type === "경력") questions.push("이전 회사에서 주도적으로 개선한 성과를 수치로 설명해 주세요.");

  const uniq = (arr: string[]) => Array.from(new Set(arr));
  return {
    mainDuties: uniq(duties).slice(0, 4),
    preferred: uniq(preferred).slice(0, 4),
    coverLetterQuestions: uniq(questions).slice(0, 4).map((q, i) => ({ id: `q${Date.now()}_${i}`, question: q })),
  };
}

function JobsSection() {
  const [jobs, setJobs] = useState<JobRow[]>(INIT_JOBS);
  const [tab, setTab] = useState("전체");
  const [view, setView] = useState<"list"|"form">("list");
  const [editing, setEditing] = useState<JobRow|null>(null);
  const [step, setStep] = useState<1|2>(1);
  const [toast, setToast] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [langInput, setLangInput] = useState("");

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const tabs = ["전체","대기","승인","반려"];
  const filtered = tab === "전체" ? jobs : jobs.filter(j => j.status === tab);

  const blankForm = {
    title: "", company: "", location: "", type: JOB_TYPES[0], salary: "",
    applyStart: "", applyEnd: "", education: JOB_EDUCATIONS[0],
    category: JOB_CATEGORIES[0], languages: [] as string[], field: JOB_FIELDS[0],
    mainDuties: [] as string[], preferred: [] as string[],
    coverLetterQuestions: [] as { id: string; question: string }[],
  };
  const [form, setForm] = useState(blankForm);

  const openCreate = () => { setEditing(null); setForm(blankForm); setLangInput(""); setStep(1); setView("form"); };
  const openEdit = (row: JobRow) => {
    setEditing(row);
    setForm({
      title: row.title, company: row.company, location: row.location ?? "", type: row.type ?? JOB_TYPES[0],
      salary: row.salary ?? "", applyStart: row.applyStart ?? "", applyEnd: row.applyEnd ?? row.deadline ?? "",
      education: row.education ?? JOB_EDUCATIONS[0], category: row.category ?? JOB_CATEGORIES[0],
      languages: row.languages ?? [], field: row.field ?? JOB_FIELDS[0],
      mainDuties: row.mainDuties ?? [], preferred: row.preferred ?? [],
      coverLetterQuestions: row.coverLetterQuestions ?? [],
    });
    setLangInput(""); setStep(1); setView("form");
  };

  const addLang = () => {
    const v = langInput.trim();
    if (!v) return;
    if (!form.languages.includes(v)) setForm(f => ({ ...f, languages: [...f.languages, v] }));
    setLangInput("");
  };
  const removeLang = (l: string) => setForm(f => ({ ...f, languages: f.languages.filter(x => x !== l) }));

  const addLine = (key: "mainDuties"|"preferred") => setForm(f => ({ ...f, [key]: [...f[key], ""] }));
  const updateLine = (key: "mainDuties"|"preferred", i: number, v: string) =>
    setForm(f => ({ ...f, [key]: f[key].map((d, idx) => idx === i ? v : d) }));
  const removeLine = (key: "mainDuties"|"preferred", i: number) =>
    setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const addQ = () => setForm(f => ({ ...f, coverLetterQuestions: [...f.coverLetterQuestions, { id: `q${Date.now()}`, question: "" }] }));
  const updateQ = (id: string, v: string) => setForm(f => ({ ...f, coverLetterQuestions: f.coverLetterQuestions.map(q => q.id === id ? { ...q, question: v } : q) }));
  const removeQ = (id: string) => setForm(f => ({ ...f, coverLetterQuestions: f.coverLetterQuestions.filter(q => q.id !== id) }));

  const aiDisabled = !form.category || form.languages.length === 0;
  const runAI = () => {
    if (aiDisabled) return;
    setAiLoading(true);
    setTimeout(() => {
      const rec = recommendJobContent({ category: form.category, languages: form.languages, field: form.field, type: form.type, education: form.education });
      setForm(f => ({ ...f, mainDuties: rec.mainDuties, preferred: rec.preferred, coverLetterQuestions: rec.coverLetterQuestions }));
      setAiLoading(false);
      showMsg("AI 추천이 적용되었습니다");
    }, 1000);
  };

  const handleSave = () => {
    const base = {
      company: form.company, title: form.title, location: form.location, type: form.type,
      salary: form.salary, applyStart: form.applyStart, applyEnd: form.applyEnd, deadline: form.applyEnd,
      education: form.education, category: form.category, languages: form.languages, field: form.field,
      mainDuties: form.mainDuties.map(d => d.trim()).filter(Boolean),
      preferred: form.preferred.map(p => p.trim()).filter(Boolean),
      coverLetterQuestions: form.coverLetterQuestions.filter(q => q.question.trim()),
    };
    if (editing) {
      setJobs(prev => prev.map(x => x.id === editing.id ? { ...x, ...base } : x));
    } else {
      setJobs(prev => [...prev, { id: Date.now(), status: "대기" as const, applicants: 0, ...base }]);
    }
    setView("list");
    showMsg("공고가 저장되었습니다");
  };

  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  // ── 폼 뷰 (등록/수정) ──
  if (view === "form") {
    return (
      <div>
        <Toast msg={toast} />
        <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />목록으로
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-4">{editing ? "공고 수정" : "공고 등록"}</h1>

        {/* 단계 인디케이터 */}
        <div className="flex items-center gap-3 mb-6">
          {([[1,"기본 정보"],[2,"전체·기타사항"]] as const).map(([n, label]) => (
            <div key={n} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${step === n ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === n ? "bg-white/20" : "bg-white"}`}>{n}</span>
              {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>공고제목</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="예: 프론트엔드 개발자" className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>회사명</label>
                <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="예: 카카오" className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>위치</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="예: 판교" className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>경력/신입</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={inputCls()}>
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>급여</label>
                <input value={form.salary} onChange={e => setForm(f => ({...f, salary: e.target.value}))} placeholder="협의 또는 5000~7000만" className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>자격요건(학력)</label>
                <select value={form.education} onChange={e => setForm(f => ({...f, education: e.target.value}))} className={inputCls()}>
                  {JOB_EDUCATIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>공고지원 가능 날짜</label>
              <div className="flex items-center gap-2">
                <input type="date" value={form.applyStart} onChange={e => setForm(f => ({...f, applyStart: e.target.value}))} className={inputCls()} />
                <span className="text-muted-foreground text-sm shrink-0">~</span>
                <input type="date" value={form.applyEnd} onChange={e => setForm(f => ({...f, applyEnd: e.target.value}))} className={inputCls()} />
              </div>
            </div>

            {/* 업무 묶음 */}
            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
              <div className="text-sm font-semibold text-foreground">업무</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>기본 카테고리</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls("bg-background")}>
                    {JOB_CATEGORIES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>분야</label>
                  <select value={form.field} onChange={e => setForm(f => ({...f, field: e.target.value}))} className={inputCls("bg-background")}>
                    {JOB_FIELDS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>언어/기술스택</label>
                <div className="flex items-center gap-2">
                  <input value={langInput} onChange={e => setLangInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLang(); } }}
                    placeholder="예: React 입력 후 Enter 또는 추가" className={inputCls("bg-background")} />
                  <button onClick={addLang} className="shrink-0 px-3 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-indigo-600 transition-colors">추가</button>
                </div>
                {form.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.languages.map(l => (
                      <span key={l} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        {l}
                        <button onClick={() => removeLang(l)} className="hover:text-indigo-800"><XCircle className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">다음 →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            {/* AI 자동 추천 */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Bot className="w-4 h-4 text-primary" />AI 자동 추천</div>
                <p className="text-xs text-muted-foreground mt-0.5">{aiDisabled ? "업무 카테고리·언어를 먼저 입력하세요." : "기본 정보를 바탕으로 업무·우대·추가질문을 추천합니다."}</p>
              </div>
              <button onClick={runAI} disabled={aiDisabled || aiLoading}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-40">
                {aiLoading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />분석 중…</> : <><Bot className="w-4 h-4" />AI 자동 추천</>}
              </button>
            </div>
            {aiLoading && <p className="text-xs text-primary">AI가 공고 정보를 분석 중…</p>}

            {/* 업무 상세 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>업무 상세</label>
                <button onClick={() => addLine("mainDuties")} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Plus className="w-3 h-3" />추가</button>
              </div>
              <div className="space-y-2">
                {form.mainDuties.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={d} onChange={e => updateLine("mainDuties", i, e.target.value)} placeholder="업무 내용" className={inputCls()} />
                    <button onClick={() => removeLine("mainDuties", i)} className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {form.mainDuties.length === 0 && <p className="text-xs text-muted-foreground">‘추가’ 또는 ‘AI 자동 추천’으로 업무를 입력하세요.</p>}
              </div>
            </div>

            {/* 우대사항 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>우대사항</label>
                <button onClick={() => addLine("preferred")} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Plus className="w-3 h-3" />추가</button>
              </div>
              <div className="space-y-2">
                {form.preferred.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={p} onChange={e => updateLine("preferred", i, e.target.value)} placeholder="우대사항" className={inputCls()} />
                    <button onClick={() => removeLine("preferred", i)} className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {form.preferred.length === 0 && <p className="text-xs text-muted-foreground">우대사항을 입력하세요.</p>}
              </div>
            </div>

            {/* 추가질문 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>지원서 추가질문</label>
                <button onClick={addQ} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Plus className="w-3 h-3" />추가</button>
              </div>
              <div className="space-y-2">
                {form.coverLetterQuestions.map(q => (
                  <div key={q.id} className="flex items-center gap-2">
                    <input value={q.question} onChange={e => updateQ(q.id, e.target.value)} placeholder="질문 내용" className={inputCls()} />
                    <button onClick={() => removeQ(q.id)} className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {form.coverLetterQuestions.length === 0 && <p className="text-xs text-muted-foreground">추가질문을 입력하세요.</p>}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-border text-sm">← 이전</button>
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors flex items-center gap-1.5"><Save className="w-4 h-4" />저장</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 목록 뷰 ──
  return (
    <div>
      <Toast msg={toast} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">공고 관리</h1>
          <p className="text-sm text-muted-foreground">채용 공고 승인 및 관리</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
          <Plus className="w-4 h-4" />공고 등록
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">회사명</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">공고제목</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">지원자수</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">마감일</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(j => (
                <tr key={j.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{j.company}</td>
                  <td className="px-5 py-4 text-sm text-foreground">{j.title}</td>
                  <td className="px-5 py-4 text-sm text-foreground">{j.applicants}명</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{j.deadline}</td>
                  <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(j)} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 text-xs transition-colors flex items-center gap-1"><Edit2 className="w-3 h-3" />수정</button>
                      {j.status === "대기" && (
                        <>
                          <button onClick={() => setJobs(prev => prev.map(x => x.id === j.id ? {...x, status: "승인"} : x))}
                            className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs transition-colors">승인</button>
                          <button onClick={() => setJobs(prev => prev.map(x => x.id === j.id ? {...x, status: "반려"} : x))}
                            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs transition-colors">반려</button>
                        </>
                      )}
                      {j.status === "승인" && (
                        <button onClick={() => { if (confirm("이 공고를 강제 삭제하시겠습니까?")) setJobs(prev => prev.map(x => x.id === j.id ? {...x, status: "삭제"} : x)); }}
                          className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs transition-colors">강제삭제</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Reports / 게시판 관리 (A-006) ───────────────────────────────────────────

type ReportRow = { id: number; type: "게시글"|"채팅"; content: string; reporter: string; reportedUser: string; reason: string; status: "접수"|"경고처리"|"삭제처리"; };

const INIT_REPORTS: ReportRow[] = [
  { id: 1, type: "게시글", content: "부적절한 언어 사용이 발견되었습니다...", reporter: "김철수", reportedUser: "이영희", reason: "욕설", status: "접수" },
  { id: 2, type: "채팅", content: "반복적인 홍보 메시지 전송...", reporter: "박민준", reportedUser: "최수연", reason: "스팸", status: "접수" },
  { id: 3, type: "게시글", content: "커뮤니티 가이드라인 위반 게시물...", reporter: "정도현", reportedUser: "한지민", reason: "부적절한 콘텐츠", status: "경고처리" },
  { id: 4, type: "게시글", content: "허위 정보를 담은 게시글 발견...", reporter: "이영희", reportedUser: "박민준", reason: "허위정보", status: "접수" },
  { id: 5, type: "채팅", content: "개인정보 요청 메시지...", reporter: "최수연", reportedUser: "정도현", reason: "개인정보침해", status: "삭제처리" },
];

type BoardPost = { id: number; tag: "면접후기"|"질문"|"자유"; author: string; preview: string; date: string; reports: number };

const BOARD_POSTS: BoardPost[] = [
  { id: 1, tag: "면접후기", author: "김철수", preview: "네이버 프론트엔드 면접 후기 공유합니다. 알고리즘 위주로...", date: "2026-06-08", reports: 0 },
  { id: 2, tag: "면접후기", author: "이영희", preview: "카카오 백엔드 2차 면접 경험담입니다. 시스템 설계 질문이...", date: "2026-06-07", reports: 1 },
  { id: 3, tag: "면접후기", author: "박민준", preview: "토스 풀스택 코딩테스트 후기, 난이도는 중상 정도...", date: "2026-06-06", reports: 0 },
  { id: 4, tag: "질문", author: "최수연", preview: "알고리즘 스터디 모집합니다. 주 2회 온라인 진행...", date: "2026-06-09", reports: 0 },
  { id: 5, tag: "질문", author: "정도현", preview: "CS 기초 같이 공부하실 분 구합니다...", date: "2026-06-08", reports: 0 },
  { id: 6, tag: "자유", author: "한지민", preview: "취준 생활 힘드네요 다들 화이팅입니다...", date: "2026-06-09", reports: 2 },
  { id: 7, tag: "자유", author: "김철수", preview: "DevReady 이용하고 나서 면접 합격했습니다!!", date: "2026-06-07", reports: 0 },
  { id: 8, tag: "자유", author: "이영희", preview: "면접 준비 팁 공유드립니다...", date: "2026-06-06", reports: 0 },
];

const BOARD_TAG_CLS: Record<BoardPost["tag"], string> = {
  면접후기: "bg-blue-100 text-blue-700",
  질문: "bg-amber-100 text-amber-700",
  자유: "bg-gray-100 text-gray-600",
};

function ReportsSection() {
  const [mainTab, setMainTab] = useState<"신고 목록"|"게시글 전체">("신고 목록");
  const [reports, setReports] = useState<ReportRow[]>(INIT_REPORTS);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(BOARD_POSTS);
  const [toast, setToast] = useState("");
  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  return (
    <div>
      <Toast msg={toast} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">자유게시판 관리</h1>
        <p className="text-sm text-muted-foreground">게시글 신고 처리 및 관리</p>
      </div>

      <div className="flex gap-1 mb-6">
        {(["신고 목록","게시글 전체"] as const).map(t => (
          <button key={t} onClick={() => setMainTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mainTab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {mainTab === "신고 목록" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">유형</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">내용 미리보기</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">신고자</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">피신고자</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">사유</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{r.type}</span></td>
                    <td className="px-5 py-4 text-sm text-muted-foreground max-w-xs truncate">{r.content}</td>
                    <td className="px-5 py-4 text-sm text-foreground">{r.reporter}</td>
                    <td className="px-5 py-4 text-sm text-foreground">{r.reportedUser}</td>
                    <td className="px-5 py-4 text-sm text-foreground">{r.reason}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {r.status === "접수" && (
                          <>
                            <button onClick={() => { setReports(prev => prev.map(x => x.id === r.id ? {...x, status: "경고처리"} : x)); showMsg("경고 메시지가 발송되었습니다"); }}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs transition-colors">경고</button>
                            <button onClick={() => { if (confirm("이 콘텐츠를 삭제처리하시겠습니까?")) setReports(prev => prev.map(x => x.id === r.id ? {...x, status: "삭제처리"} : x)); }}
                              className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs transition-colors">삭제</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === "게시글 전체" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">머릿말</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작성자</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">내용 미리보기</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">날짜</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">신고수</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {boardPosts.map(p => (
                <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BOARD_TAG_CLS[p.tag]}`}>[{p.tag}]</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{p.author}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground max-w-sm truncate">{p.preview}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className={p.reports > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}>{p.reports}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => {
                      if (confirm("이 게시글을 삭제하시겠습니까?")) {
                        setBoardPosts(prev => prev.filter(x => x.id !== p.id));
                        showMsg("게시글이 삭제되었습니다.");
                      }
                    }} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Algorithms (A-009) ───────────────────────────────────────────────────────

type AlgoRow = { id: number; title: string; category: "알고리즘"|"CS"|"프론트엔드"|"백엔드"; level: "초급"|"중급"|"고급"; active: boolean; };

const INIT_ALGO: AlgoRow[] = [
  { id: 1, title: "이진 탐색 트리 구현", category: "알고리즘", level: "중급", active: true },
  { id: 2, title: "OSI 7계층 설명", category: "CS", level: "초급", active: true },
  { id: 3, title: "React 렌더링 최적화", category: "프론트엔드", level: "중급", active: true },
  { id: 4, title: "REST API 설계 원칙", category: "백엔드", level: "초급", active: true },
  { id: 5, title: "동적 프로그래밍 응용", category: "알고리즘", level: "고급", active: false },
];

const ALGO_CATS = ["전체","알고리즘","CS","프론트엔드","백엔드"] as const;
const ALGO_LEVELS = ["초급","중급","고급"] as const;

function AlgorithmsSection() {
  const [items, setItems] = useState<AlgoRow[]>(INIT_ALGO);
  const [catFilter, setCatFilter] = useState("전체");
  const [modal, setModal] = useState<{mode:"create"|"edit"; item?: AlgoRow} | null>(null);
  const [form, setForm] = useState({ title: "", category: "알고리즘" as AlgoRow["category"], level: "초급" as AlgoRow["level"], description: "" });

  const filtered = catFilter === "전체" ? items : items.filter(i => i.category === catFilter);

  const openCreate = () => { setForm({ title: "", category: "알고리즘", level: "초급", description: "" }); setModal({ mode: "create" }); };
  const openEdit = (item: AlgoRow) => { setForm({ title: item.title, category: item.category, level: item.level, description: "" }); setModal({ mode: "edit", item }); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (modal?.mode === "create") {
      setItems(prev => [...prev, { id: Date.now(), title: form.title, category: form.category, level: form.level, active: true }]);
    } else if (modal?.item) {
      setItems(prev => prev.map(x => x.id === modal.item!.id ? {...x, title: form.title, category: form.category, level: form.level} : x));
    }
    setModal(null);
  };

  const levelColor: Record<string, string> = { 초급: "bg-green-100 text-green-700", 중급: "bg-blue-100 text-blue-700", 고급: "bg-red-100 text-red-600" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">알고리즘 관리</h1>
          <p className="text-sm text-muted-foreground">면접 준비 콘텐츠 등록·수정·관리</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
          <Plus className="w-4 h-4" />콘텐츠 등록
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {ALGO_CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${catFilter === c ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">제목</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">카테고리</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">난이도</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{item.title}</td>
                <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">{item.category}</span></td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColor[item.level]}`}>{item.level}</span></td>
                <td className="px-5 py-4">
                  <button onClick={() => setItems(prev => prev.map(x => x.id === item.id ? {...x, active: !x.active} : x))}>
                    {item.active ? <ToggleRight className="w-6 h-6" style={{ color: "#6C63FF" }} /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm("삭제하시겠습니까?")) setItems(prev => prev.filter(x => x.id !== item.id)); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === "create" ? "콘텐츠 등록" : "콘텐츠 수정"} onClose={() => setModal(null)}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">제목</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="콘텐츠 제목" className={inputCls()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">카테고리</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as AlgoRow["category"]}))} className={inputCls()}>
                {["알고리즘","CS","프론트엔드","백엔드"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">난이도</label>
              <select value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value as AlgoRow["level"]}))} className={inputCls()}>
                {ALGO_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">설명</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4} placeholder="콘텐츠 설명..." className={inputCls()} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">저장</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Chatbot (A-011) ──────────────────────────────────────────────────────────

type QnaRow = { id: number; question: string; answer: string; category: string; hits: number; };

const INIT_QNA: QnaRow[] = [
  { id: 1, question: "면접 이용권은 어떻게 구매하나요?", answer: "마이페이지 > 이용권 구매 메뉴에서 구매 가능합니다.", category: "결제", hits: 342 },
  { id: 2, question: "면접 영상은 저장되나요?", answer: "네, 면접 기록 메뉴에서 확인 가능합니다.", category: "면접", hits: 289 },
  { id: 3, question: "이력서는 어떻게 작성하나요?", answer: "이력서 메뉴에서 양식에 따라 작성하실 수 있습니다.", category: "이력서", hits: 267 },
  { id: 4, question: "비밀번호를 잊어버렸어요.", answer: "로그인 화면에서 '비밀번호 찾기'를 클릭해 이메일로 재설정하세요.", category: "계정", hits: 198 },
  { id: 5, question: "플랜 업그레이드는 어떻게 하나요?", answer: "마이페이지 > 플랜 관리에서 업그레이드 가능합니다.", category: "결제", hits: 156 },
];

function ChatbotSection() {
  const [qnas, setQnas] = useState<QnaRow[]>(INIT_QNA);
  const [modal, setModal] = useState<{mode:"create"|"edit"; item?: QnaRow} | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "" });

  const openCreate = () => { setForm({ question: "", answer: "", category: "" }); setModal({ mode: "create" }); };
  const openEdit = (item: QnaRow) => { setForm({ question: item.question, answer: item.answer, category: item.category }); setModal({ mode: "edit", item }); };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (modal?.mode === "create") {
      setQnas(prev => [...prev, { id: Date.now(), question: form.question, answer: form.answer, category: form.category, hits: 0 }]);
    } else if (modal?.item) {
      setQnas(prev => prev.map(x => x.id === modal.item!.id ? {...x, question: form.question, answer: form.answer, category: form.category} : x));
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">챗봇 관리</h1>
          <p className="text-sm text-muted-foreground">챗봇 Q&A 등록·수정·삭제</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
          <Plus className="w-4 h-4" />Q&A 등록
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">질문</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">답변</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">카테고리</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">조회수</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {qnas.map(q => (
              <tr key={q.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-5 py-4 text-sm text-foreground max-w-xs">{q.question}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-sm truncate">{q.answer}</td>
                <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{q.category}</span></td>
                <td className="px-5 py-4 text-sm text-foreground">{q.hits}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm("삭제하시겠습니까?")) setQnas(prev => prev.filter(x => x.id !== q.id)); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === "create" ? "Q&A 등록" : "Q&A 수정"} onClose={() => setModal(null)}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">질문</label>
            <input value={form.question} onChange={e => setForm(f => ({...f, question: e.target.value}))} placeholder="자주 묻는 질문..." className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">답변</label>
            <textarea value={form.answer} onChange={e => setForm(f => ({...f, answer: e.target.value}))} rows={4} placeholder="답변 내용..." className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">카테고리</label>
            <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="결제, 면접, 계정..." className={inputCls()} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">저장</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Notices / FAQ (A-007) ────────────────────────────────────────────────────

type NoticeRow = { id: number; title: string; content: string; type: "공지"|"점검"|"이벤트"; date: string; published: boolean; };
type FaqRow = { id: number; question: string; answer: string; category: string; };

const INIT_NOTICES: NoticeRow[] = [
  { id: 1, title: "2026년 6월 정기 점검 안내", content: "6월 15일 새벽 2시~4시 시스템 점검이 진행됩니다.", type: "점검", date: "2026-06-10", published: true },
  { id: 2, title: "면접 이용권 여름 할인 이벤트", content: "7월 한 달간 프로 플랜 20% 할인 이벤트를 진행합니다.", type: "이벤트", date: "2026-06-08", published: true },
  { id: 3, title: "서비스 이용약관 개정 안내", content: "2026년 7월 1일부터 개정된 이용약관이 적용됩니다.", type: "공지", date: "2026-06-05", published: false },
];

const INIT_FAQS: FaqRow[] = [
  { id: 1, question: "회원가입은 어떻게 하나요?", answer: "홈페이지 상단 '회원가입' 버튼을 클릭하여 이메일로 가입하세요.", category: "계정" },
  { id: 2, question: "면접 연습은 몇 번까지 가능한가요?", answer: "무료 플랜은 월 3회, 베이직은 월 20회, 프로는 무제한입니다.", category: "면접" },
  { id: 3, question: "환불 정책이 어떻게 되나요?", answer: "결제 후 7일 이내, 서비스 미이용 시 전액 환불 가능합니다.", category: "결제" },
  { id: 4, question: "기업 회원 가입은 어떻게 하나요?", answer: "홈페이지에서 '기업 회원 가입'을 선택 후 사업자 정보를 입력해주세요.", category: "기업" },
];

function NoticesSection() {
  const [tab, setTab] = useState<"공지사항"|"FAQ">("공지사항");
  const [notices, setNotices] = useState<NoticeRow[]>(INIT_NOTICES);
  const [faqs, setFaqs] = useState<FaqRow[]>(INIT_FAQS);
  const [noticeModal, setNoticeModal] = useState<{mode:"create"|"edit"; item?: NoticeRow} | null>(null);
  const [faqModal, setFaqModal] = useState<{mode:"create"|"edit"; item?: FaqRow} | null>(null);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", type: "공지" as NoticeRow["type"] });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "" });

  const typeColor: Record<string, string> = { 공지: "bg-blue-100 text-blue-700", 점검: "bg-amber-100 text-amber-700", 이벤트: "bg-green-100 text-green-700" };

  const saveNotice = () => {
    if (!noticeForm.title.trim()) return;
    if (noticeModal?.mode === "create") {
      setNotices(prev => [...prev, { id: Date.now(), title: noticeForm.title, content: noticeForm.content, type: noticeForm.type, date: new Date().toISOString().slice(0,10), published: false }]);
    } else if (noticeModal?.item) {
      setNotices(prev => prev.map(x => x.id === noticeModal.item!.id ? {...x, title: noticeForm.title, content: noticeForm.content, type: noticeForm.type} : x));
    }
    setNoticeModal(null);
  };

  const saveFaq = () => {
    if (!faqForm.question.trim()) return;
    if (faqModal?.mode === "create") {
      setFaqs(prev => [...prev, { id: Date.now(), question: faqForm.question, answer: faqForm.answer, category: faqForm.category }]);
    } else if (faqModal?.item) {
      setFaqs(prev => prev.map(x => x.id === faqModal.item!.id ? {...x, ...faqForm} : x));
    }
    setFaqModal(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">공지사항·FAQ</h1>
          <p className="text-sm text-muted-foreground">공지사항 및 자주 묻는 질문 관리</p>
        </div>
        {tab === "공지사항" && (
          <button onClick={() => { setNoticeForm({ title: "", content: "", type: "공지" }); setNoticeModal({ mode: "create" }); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
            <Plus className="w-4 h-4" />공지 등록
          </button>
        )}
        {tab === "FAQ" && (
          <button onClick={() => { setFaqForm({ question: "", answer: "", category: "" }); setFaqModal({ mode: "create" }); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
            <Plus className="w-4 h-4" />FAQ 등록
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {(["공지사항","FAQ"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "공지사항" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">제목</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">유형</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">날짜</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">공개</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notices.map(n => (
                <tr key={n.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{n.title}</td>
                  <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor[n.type]}`}>{n.type}</span></td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{n.date}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setNotices(prev => prev.map(x => x.id === n.id ? {...x, published: !x.published} : x))}>
                      {n.published ? <ToggleRight className="w-6 h-6" style={{ color: "#6C63FF" }} /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setNoticeForm({ title: n.title, content: n.content, type: n.type }); setNoticeModal({ mode: "edit", item: n }); }}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("삭제하시겠습니까?")) setNotices(prev => prev.filter(x => x.id !== n.id)); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "FAQ" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">질문</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">답변</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">카테고리</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faqs.map(f => (
                <tr key={f.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground max-w-xs">{f.question}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground max-w-sm truncate">{f.answer}</td>
                  <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">{f.category}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setFaqForm({ question: f.question, answer: f.answer, category: f.category }); setFaqModal({ mode: "edit", item: f }); }}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("삭제하시겠습니까?")) setFaqs(prev => prev.filter(x => x.id !== f.id)); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {noticeModal && (
        <Modal title={noticeModal.mode === "create" ? "공지 등록" : "공지 수정"} onClose={() => setNoticeModal(null)}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">제목</label>
            <input value={noticeForm.title} onChange={e => setNoticeForm(f => ({...f, title: e.target.value}))} placeholder="공지 제목" className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">유형</label>
            <select value={noticeForm.type} onChange={e => setNoticeForm(f => ({...f, type: e.target.value as NoticeRow["type"]}))} className={inputCls()}>
              {(["공지","점검","이벤트"] as const).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">내용</label>
            <textarea value={noticeForm.content} onChange={e => setNoticeForm(f => ({...f, content: e.target.value}))} rows={5} placeholder="공지 내용..." className={inputCls()} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setNoticeModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button onClick={saveNotice} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">저장</button>
          </div>
        </Modal>
      )}

      {faqModal && (
        <Modal title={faqModal.mode === "create" ? "FAQ 등록" : "FAQ 수정"} onClose={() => setFaqModal(null)}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">질문</label>
            <input value={faqForm.question} onChange={e => setFaqForm(f => ({...f, question: e.target.value}))} placeholder="자주 묻는 질문..." className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">답변</label>
            <textarea value={faqForm.answer} onChange={e => setFaqForm(f => ({...f, answer: e.target.value}))} rows={4} placeholder="답변 내용..." className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">카테고리</label>
            <input value={faqForm.category} onChange={e => setFaqForm(f => ({...f, category: e.target.value}))} placeholder="계정, 결제, 면접..." className={inputCls()} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFaqModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">취소</button>
            <button onClick={saveFaq} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">저장</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Notifications (A-008) ────────────────────────────────────────────────────

type SentNotif = { id: number; type: string; title: string; target: string; sentAt: string; status: string; };

const INIT_SENT: SentNotif[] = [
  { id: 1, type: "공지", title: "시스템 점검 안내", target: "전체", sentAt: "2026-06-10 02:00", status: "발송완료" },
  { id: 2, type: "이벤트", title: "여름 할인 이벤트", target: "일반회원", sentAt: "2026-06-08 09:00", status: "발송완료" },
  { id: 3, type: "시스템", title: "비밀번호 변경 권고", target: "미변경 사용자", sentAt: "2026-06-07 12:00", status: "발송완료" },
  { id: 4, type: "공지", title: "약관 개정 안내", target: "전체", sentAt: "2026-06-05 10:00", status: "발송완료" },
];

function NotificationsSection() {
  const [form, setForm] = useState({ target: "전체", type: "공지", title: "", content: "", schedule: "즉시" });
  const [sent, setSent] = useState<SentNotif[]>(INIT_SENT);
  const [deadlineToggles, setDeadlineToggles] = useState({ d3: true, d1: true, dday: false });
  const [toast, setToast] = useState("");
  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleSend = () => {
    if (!form.title.trim()) return;
    const newItem: SentNotif = { id: Date.now(), type: form.type, title: form.title, target: form.target, sentAt: new Date().toLocaleString("ko-KR"), status: "발송완료" };
    setSent(prev => [newItem, ...prev]);
    setForm(f => ({ ...f, title: "", content: "" }));
    showMsg("알림이 발송되었습니다.");
  };

  return (
    <div>
      <Toast msg={toast} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">알림 관리</h1>
        <p className="text-sm text-muted-foreground">회원 대상 알림 발송 및 발송 이력 관리</p>
      </div>

      {/* 알림 발송 */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary" />알림 발송</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">대상</label>
            <select value={form.target} onChange={e => setForm(f => ({...f, target: e.target.value}))} className={inputCls()}>
              {["전체","일반회원","기업회원"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">유형</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={inputCls()}>
              {["공지","이벤트","시스템"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">발송시간</label>
            <select value={form.schedule} onChange={e => setForm(f => ({...f, schedule: e.target.value}))} className={inputCls()}>
              {["즉시","예약"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1">제목</label>
          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="알림 제목..." className={inputCls()} />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1">내용</label>
          <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={4} placeholder="알림 내용..." className={inputCls()} />
        </div>
        <button onClick={handleSend} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
          <Send className="w-4 h-4" />발송
        </button>
      </div>

      {/* 마감 임박 알림 */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">마감 임박 알림 설정</h3>
        <div className="space-y-3">
          {([
            { key: "d3", label: "D-3 알림", last: "2026-06-09 09:00" },
            { key: "d1", label: "D-1 알림", last: "2026-06-09 09:00" },
            { key: "dday", label: "D-day 알림", last: "미설정" },
          ] as const).map(({ key, label, last }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">마지막 발송: {last}</div>
              </div>
              <button onClick={() => setDeadlineToggles(prev => ({ ...prev, [key]: !prev[key] }))}>
                {deadlineToggles[key] ? <ToggleRight className="w-7 h-7" style={{ color: "#6C63FF" }} /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 발송 이력 */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">발송 이력</h3>
        </div>
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">유형</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">제목</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">대상</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">발송시각</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sent.map(s => (
              <tr key={s.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.type === "공지" ? "bg-blue-100 text-blue-700" : s.type === "이벤트" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{s.type}</span>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">{s.title}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{s.target}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{s.sentAt}</td>
                <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Satisfaction (A-010) ─────────────────────────────────────────────────────

const SURVEY_DATA = [
  { company: "카카오", date: "2026-06-08", avg_score: 4.5, comment: "AI 면접 기능이 매우 유용했습니다." },
  { company: "네이버", date: "2026-06-07", avg_score: 4.2, comment: "공고 등록 과정이 직관적이었습니다." },
  { company: "토스", date: "2026-06-05", avg_score: 4.8, comment: "지원자 관리 기능이 편리했습니다." },
  { company: "라인플러스", date: "2026-06-03", avg_score: 3.9, comment: "이력서 열람 기능 개선을 바랍니다." },
  { company: "쿠팡", date: "2026-05-31", avg_score: 4.1, comment: "전반적으로 만족스럽습니다." },
];

const RADAR_DATA = [
  { subject: "공고등록편의성", score: 4.2 },
  { subject: "이력서열람기능", score: 3.8 },
  { subject: "AI면접활용도", score: 4.5 },
  { subject: "전반적만족도", score: 4.1 },
];

const SAT_TREND = [
  { month: "1월", avg: 3.8 }, { month: "2월", avg: 4.0 }, { month: "3월", avg: 4.1 },
  { month: "4월", avg: 4.0 }, { month: "5월", avg: 4.2 }, { month: "6월", avg: 4.3 },
];

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{score}</span>
    </div>
  );
}

function SatisfactionSection() {
  const [tab, setTab] = useState<"설문 결과"|"분석 리포트">("설문 결과");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">만족도 관리</h1>
        <p className="text-sm text-muted-foreground">기업 회원 서비스 만족도 설문 결과 및 분석</p>
      </div>

      <div className="flex gap-1 mb-6">
        {(["설문 결과","분석 리포트"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "설문 결과" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">기업</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">날짜</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">평균 점수</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">의견</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SURVEY_DATA.map((s, i) => (
                <tr key={i} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{s.company}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{s.date}</td>
                  <td className="px-5 py-4"><StarRating score={s.avg_score} /></td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{s.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "분석 리포트" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-5">항목별 만족도 (레이더 차트)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-5">월별 평균 만족도 추이</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={SAT_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3, 5]} tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8 }} />
                  <Bar dataKey="avg" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-3">주요 인사이트</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>AI 면접 활용도가 4.5점으로 가장 높으며, 기업 회원 만족도의 핵심 강점으로 나타남</li>
              <li>이력서 열람 기능(3.8점)이 상대적으로 낮아 UI/UX 개선이 필요함</li>
              <li>공고 등록 편의성(4.2점)과 전반적 만족도(4.1점)는 양호한 수준 유지</li>
              <li>6월 평균 4.3점으로 지속적 상승 추세를 보이고 있음</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export function AdminPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-white flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 mb-4 w-full hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-[#6C63FF] flex items-center justify-center">
              <span className="text-white font-black tracking-tighter leading-none text-base">DR</span>
            </div>
            <div className="text-left">
              <h1 className="font-bold text-white">관리자</h1>
              <p className="text-xs text-white/60">DevReady</p>
            </div>
          </button>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full">
            <ArrowLeft className="w-4 h-4" />홈으로 돌아가기
          </button>
        </div>

        <nav className="p-4">
          <div className="space-y-0.5">
            {MENU_ITEMS.map(item => {
              if (item.isHeader) {
                return (
                  <div key={item.id} className="pt-5 pb-1.5 px-3">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{item.label}</span>
                  </div>
                );
              }
              const Icon = item.icon!;
              const isActive = activeMenu === item.id;
              return (
                <button key={item.id} onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-[#6C63FF] text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                  <Icon className="w-4 h-4" />{item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeMenu === "dashboard" && <DashboardSection />}
          {activeMenu === "users" && <UsersSection />}
          {activeMenu === "jobs" && <JobsSection />}
          {activeMenu === "reports" && <ReportsSection />}
          {activeMenu === "algorithms" && <AlgorithmsSection />}
          {activeMenu === "chatbot" && <ChatbotSection />}
          {activeMenu === "notices" && <NoticesSection />}
          {activeMenu === "notifications" && <NotificationsSection />}
          {activeMenu === "satisfaction" && <SatisfactionSection />}
          {activeMenu === "admin-auth" && <AdminAuthSection />}
        </div>
      </main>
    </div>
  );
}
