import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, ArrowLeft, Scan, CheckCircle2,
  Mail, RefreshCw, Check, X, KeyRound, ShieldCheck, User
} from "lucide-react";
import { setAuthed } from "../auth";

type Mode = "login" | "findId" | "resetPw" | "face";

// 아이디 찾기 단계
type FindIdStep = "verify" | "result";
// 비밀번호 재설정 단계
type ResetPwStep = "input" | "sns" | "method" | "newpw" | "done";

const SNS_BUTTONS = [
  { id: "naver", label: "네이버로 시작하기", bg: "#03C75A", text: "#ffffff",
    logo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.26 9.27 7.56 5.25H5.25v7.5h2.49V8.73l2.7 4.02h2.31V5.25H10.26v4.02Z" fill="white"/></svg> },
  { id: "kakao", label: "카카오로 시작하기", bg: "#FEE500", text: "#191919",
    logo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.35c0 2.034 1.356 3.822 3.402 4.854l-.87 3.234a.225.225 0 0 0 .342.243L8.1 13.374a8.4 8.4 0 0 0 .9.048c4.142 0 7.5-2.634 7.5-5.85C16.5 4.134 13.142 1.5 9 1.5Z" fill="#191919"/></svg> },
];

// ── Mock 계정 데이터 + 본인확인 헬퍼 ──
type Provider = "email" | "naver" | "kakao";
type Account = { name: string; birth: string; carrier: string; phone: string; email: string; provider: Provider; joinedAt: string };
const MOCK_ACCOUNTS: Account[] = [
  { name: "김지수", birth: "000315", carrier: "SKT", phone: "01012345678", email: "jisu@example.com", provider: "email", joinedAt: "2026.03.15" },
  { name: "이영희", birth: "990820", carrier: "KT",  phone: "01088887777", email: "younghee@naver.com", provider: "naver", joinedAt: "2026.02.10" },
];
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const providerLabel = (p: Provider) => p === "naver" ? "네이버" : p === "kakao" ? "카카오" : "이메일";
function maskEmail(email: string) {
  const [id, domain] = email.split("@"); if (!domain) return email;
  const mid = id.length <= 2 ? id[0] + "*" : id.slice(0, 2) + "*".repeat(Math.max(1, id.length - 2));
  const [host, ...rest] = domain.split(".");
  const mhost = host.length <= 1 ? host : host[0] + "*".repeat(Math.max(1, host.length - 1));
  return `${mid}@${mhost}.${rest.join(".")}`;
}
// 본인확인(이름+휴대폰) 조회. 데모 편의상 매칭 없으면 첫 계정 반환.
function findAccountByIdentity(name: string, phone: string): Account {
  return MOCK_ACCOUNTS.find(a => a.name === name.trim() && a.phone === onlyDigits(phone)) ?? MOCK_ACCOUNTS[0];
}
// 이메일로 가입경로 확인. 없으면 email 가입으로 간주(재설정 진행).
function findAccountByEmail(email: string): Account {
  const e = email.trim().toLowerCase();
  return MOCK_ACCOUNTS.find(a => a.email === e) ?? { ...MOCK_ACCOUNTS[0], email: email.trim(), provider: "email" };
}
// TODO(실연동): 실제 PASS는 본인확인기관(NICE/KCB) 연동 필요. 프로토타입은 위 mock으로 화면만.

function FaceIDPanel({ onSuccess }: { onSuccess: () => void }) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const start = () => {
    setPhase("scanning");
    setTimeout(() => { setPhase("done"); setTimeout(onSuccess, 800); }, 2200);
  };
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative w-40 h-40 rounded-2xl overflow-hidden cursor-pointer"
        onClick={phase === "idle" ? start : undefined}
        style={{ background: phase === "done" ? "#dcfce7" : "#EEF0FF", border: "2px solid", borderColor: phase === "done" ? "#16a34a" : "#6366F1" }}>
        {phase === "idle" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"><Scan className="w-10 h-10 text-primary" /><span className="text-xs text-muted-foreground">탭하여 스캔</span></div>}
        {phase === "scanning" && (
          <>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full border-2 border-primary opacity-50 animate-ping" /></div>
            <div className="absolute left-0 right-0 h-0.5 bg-primary/70" style={{ top: "50%", animation: "faceScan 2s linear infinite" }} />
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 rounded-full border-2 border-primary" /></div>
          </>
        )}
        {phase === "done" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"><CheckCircle2 className="w-10 h-10 text-green-500" /><span className="text-xs text-green-600">인식 완료</span></div>}
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {phase === "idle" && "카메라에 얼굴을 위치시키고 탭하세요"}
        {phase === "scanning" && "얼굴을 인식하는 중..."}
        {phase === "done" && "인증 성공! 로그인 중..."}
      </p>
      <style>{`@keyframes faceScan { 0%{top:10%} 50%{top:85%} 100%{top:10%} }`}</style>
    </div>
  );
}

function useCodeVerify(email: string) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  function sendCode() {
    const mock = String(Math.floor(100000 + Math.random() * 900000));
    setCode(mock);
    setCodeSent(true);
    setVerifyError("");
    setCooldown(60);
    const t = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    alert("[개발 테스트] 인증코드: " + mock);
  }

  function verify() {
    if (codeInput === code) { setVerified(true); setVerifyError(""); }
    else setVerifyError("인증 코드가 올바르지 않습니다.");
  }

  return { codeSent, code, codeInput, setCodeInput, verifyError, cooldown, verified, sendCode, verify };
}

// PASS mock 본인인증 (이름·생년월일·통신사·휴대폰 → 인증번호). useCodeVerify 재사용.
function PassVerifyPanel({ inputCls, onSuccess, onBack }: { inputCls: string; onSuccess: (acct: Account) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [carrier, setCarrier] = useState("SKT");
  const [phone, setPhone] = useState("");
  const sms = useCodeVerify(phone);
  const canReq = name.trim() && birth.length >= 6 && phone.length >= 10;
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-center gap-2 text-sm" style={{ color: "#6C63FF" }}>
        <ShieldCheck className="w-4 h-4" /> 통신사 PASS 본인확인
      </div>
      <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
      <input placeholder="생년월일 6자리 (YYMMDD)" maxLength={6} value={birth} onChange={e => setBirth(onlyDigits(e.target.value))} className={inputCls} />
      <select value={carrier} onChange={e => setCarrier(e.target.value)} className={inputCls}>
        {["SKT", "KT", "LG U+", "알뜰폰"].map(c => <option key={c}>{c}</option>)}
      </select>
      <div className="flex gap-2">
        <input placeholder="휴대폰 번호" value={phone} onChange={e => setPhone(onlyDigits(e.target.value))} className={inputCls + " flex-1"} />
        <button disabled={!canReq || sms.cooldown > 0} onClick={() => sms.sendCode()}
          className="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#6C63FF" }}>
          {sms.cooldown > 0 ? `${sms.cooldown}s` : sms.codeSent ? "재요청" : "인증요청"}
        </button>
      </div>
      {sms.codeSent && (
        <div className="flex gap-2">
          <input placeholder="인증번호 6자리" maxLength={6} value={sms.codeInput} onChange={e => sms.setCodeInput(onlyDigits(e.target.value))} className={inputCls + " flex-1"} />
          <button onClick={() => { sms.verify(); if (sms.codeInput === sms.code) onSuccess(findAccountByIdentity(name, phone)); }}
            className="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium border-2" style={{ borderColor: "#6C63FF", color: "#6C63FF" }}>확인</button>
        </div>
      )}
      {sms.verifyError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{sms.verifyError}</p>}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground justify-center"><ArrowLeft className="w-4 h-4" /> 이전</button>
    </div>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [showPw, setShowPw] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // 아이디(이메일) 찾기 state
  const [findIdStep, setFindIdStep] = useState<FindIdStep>("verify");
  const [foundAccount, setFoundAccount] = useState<Account | null>(null);

  // 비밀번호 찾기 state
  const [resetStep, setResetStep] = useState<ResetPwStep>("input");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMethod, setResetMethod] = useState<null | "pass" | "email">(null);
  const [resetAccount, setResetAccount] = useState<Account | null>(null);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const resetVerify = useCodeVerify(resetEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    navigate("/");
  };

  function handleQuickLogin(role: "user" | "admin") {
    setAuthed(true);
    navigate(role === "admin" ? "/admin" : "/");
  }

  function goBack() {
    setMode("login");
    setFindIdStep("verify");
    setFoundAccount(null);
    setResetStep("input");
    setResetEmail("");
    setResetMethod(null);
    setResetAccount(null);
    setNewPw(""); setNewPwConfirm(""); setPwError("");
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm";

  // ── 아이디(이메일) 찾기 — PASS 본인확인 ──────────────────
  function renderFindId() {
    if (findIdStep === "verify") {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">본인 명의 휴대폰으로 PASS 인증 후<br />가입하신 이메일을 확인할 수 있어요.</p>
          <PassVerifyPanel inputCls={inputCls} onBack={goBack} onSuccess={(acct) => { setFoundAccount(acct); setFindIdStep("result"); }} />
        </div>
      );
    }
    if (findIdStep === "result" && foundAccount) {
      const sns = SNS_BUTTONS.find(b => b.id === foundAccount.provider);
      return (
        <div className="flex flex-col gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" style={{ color: "#6C63FF" }} />
          </div>
          <p className="text-sm text-muted-foreground">본인확인이 완료되었습니다.<br />가입하신 이메일은 다음과 같습니다.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-6">
            <p className="font-bold text-lg text-gray-900">{maskEmail(foundAccount.email)}</p>
            <p className="text-xs text-gray-400 mt-1">가입경로: {providerLabel(foundAccount.provider)} · 가입일: {foundAccount.joinedAt}</p>
          </div>
          {foundAccount.provider !== "email" && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              {providerLabel(foundAccount.provider)}(으)로 가입된 계정입니다. 소셜 로그인을 이용하세요.
            </div>
          )}
          {foundAccount.provider !== "email" && sns && (
            <button onClick={() => { setAuthed(true); navigate("/"); }}
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium" style={{ background: sns.bg, color: sns.text }}>
              {sns.logo}{sns.label}
            </button>
          )}
          <button onClick={goBack} className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90" style={{ backgroundColor: "#6C63FF" }}>로그인하기</button>
          {foundAccount.provider === "email" && (
            <button onClick={() => { setMode("resetPw"); setResetStep("input"); setResetMethod(null); }} className="text-sm text-gray-500 hover:text-gray-800">비밀번호 찾기</button>
          )}
        </div>
      );
    }
    return null;
  }

  // ── 비밀번호 찾기 (이메일 → SNS분기 → PASS/이메일 → 재설정) ──
  function renderResetPw() {
    if (resetStep === "input") {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">가입한 이메일(아이디)을 입력하세요.</p>
          <input type="email" placeholder="가입한 이메일" value={resetEmail}
            onChange={e => setResetEmail(e.target.value)} className={inputCls} />
          <button onClick={() => {
            if (!resetEmail.trim()) return;
            const acct = findAccountByEmail(resetEmail);
            setResetAccount(acct);
            if (acct.provider !== "email") setResetStep("sns");
            else { setResetStep("method"); setResetMethod(null); }
          }} disabled={!resetEmail.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: "#6C63FF" }}>
            다음
          </button>
          <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground justify-center">
            <ArrowLeft className="w-4 h-4" /> 로그인으로
          </button>
        </div>
      );
    }
    if (resetStep === "sns" && resetAccount) {
      const sns = SNS_BUTTONS.find(b => b.id === resetAccount.provider);
      return (
        <div className="flex flex-col gap-4 text-center">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
            이 계정은 {providerLabel(resetAccount.provider)}(으)로 가입되어 있어 비밀번호가 없습니다.<br />{providerLabel(resetAccount.provider)} 로그인을 이용하세요.
          </div>
          {sns && (
            <button onClick={() => { setAuthed(true); navigate("/"); }}
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium" style={{ background: sns.bg, color: sns.text }}>
              {sns.logo}{sns.label}
            </button>
          )}
          <button onClick={() => setResetStep("input")} className="text-sm text-gray-500 hover:text-gray-800">다른 이메일로 다시 찾기</button>
        </div>
      );
    }
    if (resetStep === "method") {
      return (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-600">{resetEmail}</div>
          {resetMethod === null && (
            <>
              <p className="text-sm text-muted-foreground text-center">본인확인 방법을 선택하세요.</p>
              <button onClick={() => setResetMethod("pass")}
                className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: "#6C63FF" }}>
                <ShieldCheck className="w-4 h-4" />PASS 본인인증
              </button>
              <button onClick={() => setResetMethod("email")}
                className="w-full py-3 rounded-xl border-2 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2" style={{ borderColor: "#6C63FF", color: "#6C63FF" }}>
                <Mail className="w-4 h-4" />이메일로 인증
              </button>
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground justify-center">
                <ArrowLeft className="w-4 h-4" /> 로그인으로
              </button>
            </>
          )}
          {resetMethod === "pass" && (
            <PassVerifyPanel inputCls={inputCls} onBack={() => setResetMethod(null)} onSuccess={() => setResetStep("newpw")} />
          )}
          {resetMethod === "email" && (
            <>
              <div className="flex gap-2">
                <input type="email" value={resetEmail} readOnly className={inputCls + " flex-1 opacity-70"} />
                <button onClick={() => resetVerify.sendCode()} disabled={resetVerify.cooldown > 0}
                  className="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 flex items-center gap-1" style={{ backgroundColor: "#6C63FF" }}>
                  {resetVerify.cooldown > 0 ? <><RefreshCw className="w-3.5 h-3.5" />{resetVerify.cooldown}s</> : resetVerify.codeSent ? "재발송" : "발송"}
                </button>
              </div>
              {resetVerify.codeSent && (
                <div className="flex gap-2">
                  <input type="text" placeholder="인증 코드 6자리" maxLength={6} value={resetVerify.codeInput}
                    onChange={e => resetVerify.setCodeInput(e.target.value.replace(/\D/g, ""))}
                    className={`${inputCls} flex-1 ${resetVerify.verifyError ? "border-red-400" : ""}`} />
                  <button onClick={() => { resetVerify.verify(); if (resetVerify.codeInput === resetVerify.code) setResetStep("newpw"); }}
                    className="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium border-2 hover:bg-gray-50" style={{ borderColor: "#6C63FF", color: "#6C63FF" }}>확인</button>
                </div>
              )}
              {resetVerify.verifyError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{resetVerify.verifyError}</p>}
              <button type="button" onClick={() => setResetMethod(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground justify-center">
                <ArrowLeft className="w-4 h-4" /> 이전
              </button>
            </>
          )}
        </div>
      );
    }
    if (resetStep === "newpw") {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />본인확인 완료. 새 비밀번호를 설정해주세요.
          </div>
          <div className="relative">
            <input type={showNewPw ? "text" : "password"} placeholder="새 비밀번호 (8자 이상)" value={newPw}
              onChange={e => setNewPw(e.target.value)} className={inputCls} />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input type="password" placeholder="새 비밀번호 확인" value={newPwConfirm}
            onChange={e => setNewPwConfirm(e.target.value)}
            className={`${inputCls} ${pwError ? "border-red-400" : ""}`} />
          {pwError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{pwError}</p>}
          {/* 비밀번호 강도 표시 */}
          {newPw && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-colors"
                    style={{ backgroundColor: newPw.length >= i * 3 ? (newPw.length >= 10 ? "#10B981" : newPw.length >= 6 ? "#F59E0B" : "#EF4444") : "#E5E7EB" }} />
                ))}
              </div>
              <p className="text-xs text-gray-400">{newPw.length >= 10 ? "강함" : newPw.length >= 6 ? "보통" : "약함"}</p>
            </div>
          )}
          <button onClick={() => {
            if (newPw.length < 8) { setPwError("비밀번호는 8자 이상이어야 합니다."); return; }
            if (newPw !== newPwConfirm) { setPwError("비밀번호가 일치하지 않습니다."); return; }
            setPwError(""); setResetStep("done");
          }} className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90" style={{ backgroundColor: "#6C63FF" }}>
            비밀번호 변경
          </button>
        </div>
      );
    }
    if (resetStep === "done") {
      return (
        <div className="flex flex-col gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900">비밀번호가 변경되었습니다</h3>
          <p className="text-sm text-gray-500">새 비밀번호로 로그인해주세요.</p>
          <button onClick={goBack} className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90" style={{ backgroundColor: "#6C63FF" }}>로그인하기</button>
        </div>
      );
    }
    return null;
  }

  const modeTitle: Record<Mode, string> = {
    login: "로그인",
    findId: "아이디 찾기",
    resetPw: "비밀번호 찾기",
    face: "Face ID 로그인",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg, #F8F9FF 0%, #EEF0FF 100%)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg" style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
            <span className="text-white font-black tracking-tighter leading-none text-xl">DR</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{modeTitle[mode]}</h1>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
          {/* Face ID */}
          {mode === "face" && (
            <>
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" /> 로그인으로
              </button>
              <FaceIDPanel onSuccess={() => { setAuthed(true); navigate("/"); }} />
            </>
          )}

          {/* 아이디 찾기 */}
          {mode === "findId" && renderFindId()}

          {/* 비밀번호 재설정 */}
          {mode === "resetPw" && renderResetPw()}

          {/* 로그인 */}
          {mode === "login" && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-5">
                <input type="email" placeholder="이메일" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm" required />
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="비밀번호" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={saveId} onChange={e => setSaveId(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">로그인 유지</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">아이디 저장</span>
                  </label>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white hover:bg-indigo-600 transition-colors mt-1 font-medium">로그인</button>
              </form>

              <div className="flex items-center justify-center gap-3 text-sm mb-5">
                <button onClick={() => { setMode("findId"); setFindIdStep("verify"); setFoundAccount(null); }} className="text-muted-foreground hover:text-foreground transition-colors">아이디 찾기</button>
                <span className="text-border">|</span>
                <button onClick={() => { setMode("resetPw"); setResetStep("input"); setResetMethod(null); }} className="text-muted-foreground hover:text-foreground transition-colors">비밀번호 찾기</button>
                <span className="text-border">|</span>
                <button onClick={() => navigate("/signup")} className="text-primary hover:text-indigo-600 font-medium transition-colors">회원가입</button>
              </div>

              <p className="text-center text-sm text-muted-foreground mb-4">소셜 계정으로 간편 로그인</p>
              <div className="flex flex-col gap-2.5 mb-5">
                {SNS_BUTTONS.map(s => (
                  <button key={s.id}
                    onClick={() => { setAuthed(true); navigate("/"); }}
                    className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: s.bg, color: s.text, border: (s as any).border ? "1px solid #dde1e7" : "none" }}>
                    {s.logo}{s.label}
                  </button>
                ))}
              </div>

              <button onClick={() => setMode("face")} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-secondary hover:bg-muted text-sm text-foreground transition-colors">
                <Scan className="w-4 h-4 text-primary" />Face ID로 로그인
              </button>
            </>
          )}
        </div>

        {/* 회원 유형별 바로 입장 */}
        {mode === "login" && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">바로 입장하기</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => handleQuickLogin("user")}
                className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border border-border bg-secondary hover:border-primary/50 hover:bg-muted transition-colors">
                <User className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">개인 회원</span>
              </button>
              <button onClick={() => handleQuickLogin("admin")}
                className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border border-border bg-secondary hover:border-primary/50 hover:bg-muted transition-colors">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">관리자</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
