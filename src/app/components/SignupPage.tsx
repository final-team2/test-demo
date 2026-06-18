import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, CheckCircle2,
  ChevronRight, ChevronDown, Mail, RefreshCw, Check, X
} from "lucide-react";

type Step = "info" | "terms" | "verify" | "done";

const TERMS_LIST = [
  { id: "service", label: "서비스 이용약관", required: true, content: "제1조(목적) 이 약관은 DevReady가 제공하는 서비스의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조(정의) '서비스'란 회사가 제공하는 AI 면접 시뮬레이션, 채용 정보, 교육 콘텐츠 등 일체의 서비스를 의미합니다.\n\n제3조(약관의 효력) 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다." },
  { id: "privacy", label: "개인정보 처리방침", required: true, content: "DevReady는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호합니다.\n\n1. 수집 항목: 이름, 이메일, 비밀번호, 휴대폰 번호\n2. 수집 목적: 회원 관리, 서비스 제공, 고객 지원\n3. 보유 기간: 회원 탈퇴 시까지" },
  { id: "age", label: "만 14세 이상 확인", required: true, content: "본 서비스는 만 14세 이상 이용 가능합니다. 만 14세 미만인 경우 법정대리인의 동의가 필요합니다." },
  { id: "marketing", label: "마케팅 정보 수신 동의 (이메일)", required: false, content: "DevReady의 새로운 서비스, 이벤트, 프로모션 등의 마케팅 정보를 이메일로 수신합니다. 마이페이지에서 언제든지 변경하실 수 있습니다." },
  { id: "sms", label: "마케팅 정보 수신 동의 (문자/앱푸시)", required: false, content: "DevReady의 마케팅 정보를 문자 및 앱 푸시로 수신합니다. 마이페이지에서 언제든지 변경하실 수 있습니다." },
];

const SNS_BUTTONS = [
  { id: "kakao", label: "카카오로 시작하기", bg: "#FEE500", text: "#191919",
    logo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.35c0 2.034 1.356 3.822 3.402 4.854l-.87 3.234a.225.225 0 0 0 .342.243L8.1 13.374a8.4 8.4 0 0 0 .9.048c4.142 0 7.5-2.634 7.5-5.85C16.5 4.134 13.142 1.5 9 1.5Z" fill="#191919"/></svg> },
  { id: "naver", label: "네이버로 시작하기", bg: "#03C75A", text: "#ffffff",
    logo: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.26 9.27 7.56 5.25H5.25v7.5h2.49V8.73l2.7 4.02h2.31V5.25H10.26v4.02Z" fill="white"/></svg> },
];

const STEPS: { id: Step; label: string }[] = [
  { id: "info", label: "기본 정보" },
  { id: "terms", label: "약관 동의" },
  { id: "verify", label: "이메일 인증" },
  { id: "done", label: "가입 완료" },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={done || active ? { backgroundColor: "#6C63FF", color: "#fff" } : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? "font-medium text-gray-800" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-10 h-0.5 mx-1 mb-4 transition-colors" style={{ backgroundColor: i < idx ? "#6C63FF" : "#E5E7EB" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "", companyName: "", businessNumber: "", department: "" });

  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const allRequired = TERMS_LIST.filter(t => t.required).every(t => agreed[t.id]);
  const allChecked = TERMS_LIST.every(t => agreed[t.id]);
  function toggleAll(val: boolean) {
    const next: Record<string, boolean> = {};
    TERMS_LIST.forEach(t => { next[t.id] = val; });
    setAgreed(next);
  }

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  function sendCode() {
    const mock = String(Math.floor(100000 + Math.random() * 900000));
    setCode(mock);
    setCodeSent(true);
    setVerifyError("");
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
    alert("[개발 테스트] 인증코드: " + mock);
  }

  function verifyCode() {
    if (codeInput === code) { setVerified(true); setVerifyError(""); }
    else setVerifyError("인증 코드가 올바르지 않습니다.");
  }

  function validateInfo() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "올바른 이메일을 입력해주세요.";
    if (form.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) e.confirm = "비밀번호가 일치하지 않습니다.";
    if (!form.phone.trim()) e.phone = "휴대폰 번호를 입력해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors placeholder-gray-400 ${errors[field] ? "border-red-400" : "border-gray-200 focus:border-indigo-400"}`;

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg,#F8F9FF 0%,#EEF0FF 100%)" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#EEF2FF" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#6C63FF" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">가입이 완료됐습니다!</h1>
          <p className="text-gray-500 mb-8">DevReady와 함께 합격의 여정을 시작하세요.</p>
          <button onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: "#6C63FF" }}>
            서비스 시작하기
          </button>
          <button onClick={() => navigate("/auth")} className="w-full mt-3 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg,#F8F9FF 0%,#EEF0FF 100%)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: "#6C63FF", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
            <span className="text-white font-black tracking-tighter leading-none text-xl">DR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-500 mt-1">DevReady에 오신 것을 환영합니다</p>
        </div>

        <StepIndicator current={step} />

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7">

          {/* STEP 1: 기본 정보 */}
          {step === "info" && (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {SNS_BUTTONS.map(s => (
                  <button key={s.id} onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ background: s.bg, color: s.text, border: (s as any).border ? "1px solid #dde1e7" : "none" }}>
                    {s.logo}{s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">또는 이메일로 가입</span><div className="flex-1 h-px bg-gray-200" />
              </div>
              <form onSubmit={e => { e.preventDefault(); if (validateInfo()) setStep("terms"); }} className="flex flex-col gap-3">
                <div>
                  <input type="text" placeholder="이름 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls("name")} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input type="email" placeholder="이메일 *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls("email")} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input type="tel" placeholder="휴대폰 번호 * (010-0000-0000)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls("phone")} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="비밀번호 * (8자 이상)" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls("password")} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div className="relative">
                  <input type={showConfirmPw ? "text" : "password"} placeholder="비밀번호 확인 *" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} className={inputCls("confirm")} />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold mt-1 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5" style={{ backgroundColor: "#6C63FF" }}>
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">이미 계정이 있으신가요?{" "}
                <button onClick={() => navigate("/auth")} className="font-medium hover:opacity-80" style={{ color: "#6C63FF" }}>로그인</button>
              </p>
            </>
          )}

          {/* STEP 2: 약관 동의 */}
          {step === "terms" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 mb-1">서비스 이용을 위해 아래 약관에 동의해주세요.</p>
              <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors"
                style={{ borderColor: allChecked ? "#6C63FF" : "#E5E7EB", backgroundColor: allChecked ? "#EEF2FF" : "#F9FAFB" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 cursor-pointer transition-colors"
                  style={{ borderColor: allChecked ? "#6C63FF" : "#D1D5DB", backgroundColor: allChecked ? "#6C63FF" : "transparent" }}
                  onClick={() => toggleAll(!allChecked)}>
                  {allChecked && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="font-semibold text-gray-800">전체 동의</span>
                <span className="text-xs text-gray-400 ml-auto">필수 및 선택 포함</span>
              </label>
              <div className="h-px bg-gray-100" />
              {TERMS_LIST.map(term => (
                <div key={term.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 cursor-pointer transition-colors"
                      style={{ borderColor: agreed[term.id] ? "#6C63FF" : "#D1D5DB", backgroundColor: agreed[term.id] ? "#6C63FF" : "transparent" }}
                      onClick={() => setAgreed(a => ({ ...a, [term.id]: !a[term.id] }))}>
                      {agreed[term.id] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-800 flex-1">
                      {term.label}
                      <span className={`ml-1.5 text-xs font-medium ${term.required ? "text-red-500" : "text-gray-400"}`}>({term.required ? "필수" : "선택"})</span>
                    </span>
                    <button onClick={() => setExpanded(expanded === term.id ? null : term.id)} className="p-1 text-gray-400 hover:text-gray-600">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded === term.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {expanded === term.id && (
                    <div className="px-4 pb-3 pt-1 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{term.content}</p>
                    </div>
                  )}
                </div>
              ))}
              {!allRequired && <p className="text-xs text-red-500 text-center">필수 약관에 모두 동의해주세요.</p>}
              <button onClick={() => { if (allRequired) setStep("verify"); }} disabled={!allRequired}
                className="w-full py-3 rounded-xl text-white font-semibold mt-1 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ backgroundColor: "#6C63FF" }}>
                다음 <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep("info")} className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">이전으로</button>
            </div>
          )}

          {/* STEP 3: 이메일 인증 */}
          {step === "verify" && (
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7" style={{ color: "#6C63FF" }} />
                </div>
                <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">{form.email}</span>으로<br />인증 코드를 발송합니다.</p>
              </div>
              <div className="flex gap-2">
                <input type="email" value={form.email} readOnly className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500" />
                <button onClick={sendCode} disabled={resendCooldown > 0 || verified}
                  className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5" style={{ backgroundColor: "#6C63FF" }}>
                  {resendCooldown > 0 ? <><RefreshCw className="w-3.5 h-3.5" />{resendCooldown}s</> : codeSent ? "재발송" : "발송"}
                </button>
              </div>
              {codeSent && !verified && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="인증 코드 6자리" maxLength={6} value={codeInput}
                      onChange={e => setCodeInput(e.target.value.replace(/\D/g, ""))}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${verifyError ? "border-red-400" : "border-gray-200 focus:border-indigo-400"}`} />
                    <button onClick={verifyCode} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border-2 hover:bg-gray-50 transition-colors" style={{ borderColor: "#6C63FF", color: "#6C63FF" }}>확인</button>
                  </div>
                  {verifyError && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{verifyError}</p>}
                </div>
              )}
              {verified && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />이메일 인증이 완료되었습니다.
                </div>
              )}
              {!codeSent && <p className="text-xs text-gray-400 text-center">이메일을 받지 못하셨나요? 스팸함을 확인해주세요.</p>}
              <button onClick={() => { if (verified) setStep("done"); }} disabled={!verified}
                className="w-full py-3 rounded-xl text-white font-semibold mt-1 hover:opacity-90 transition-opacity disabled:opacity-40" style={{ backgroundColor: "#6C63FF" }}>
                가입 완료
              </button>
              <button onClick={() => setStep("terms")} className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">이전으로</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
