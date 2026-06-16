import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  CheckCircle2, CreditCard, Shield, ChevronLeft,
  Lock, Smartphone, Building2, AlertCircle, Loader2
} from "lucide-react";

const PLANS: Record<string, { name: string; price: string; priceNum: number; per: string; features: string[] }> = {
  basic: {
    name: "1회 이용권",
    price: "9,900",
    priceNum: 9900,
    per: "1회",
    features: ["AI 모의면접 1회", "기본 피드백 리포트", "30일 이내 사용"],
  },
  standard: {
    name: "월정액 스탠다드",
    price: "29,900",
    priceNum: 29900,
    per: "월",
    features: ["AI 모의면접 무제한", "상세 피드백 리포트", "이력서 기반 맞춤 질문", "성장 추이 리포트", "커뮤니티 프리미엄 배지"],
  },
  premium: {
    name: "월정액 프리미엄",
    price: "59,900",
    priceNum: 59900,
    per: "월",
    features: ["스탠다드 모든 혜택", "전문 면접관 1:1 피드백 (월 1회)", "공고 맞춤 자기소개서 첨삭", "우선 고객지원"],
  },
};

const PAYMENT_METHODS = [
  { id: "card", icon: CreditCard, label: "신용·체크카드" },
  { id: "kakao", icon: Smartphone, label: "카카오페이" },
  { id: "naver", icon: Smartphone, label: "네이버페이" },
  { id: "bank", icon: Building2, label: "무통장 입금" },
];

export function InterviewPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const planId = (location.state as { planId?: string })?.planId ?? "standard";
  const plan = PLANS[planId] ?? PLANS.standard;

  const [method, setMethod] = useState("card");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [error, setError] = useState("");

  function formatCardNum(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  }

  async function handlePay() {
    setError("");
    if (method === "card") {
      if (cardNum.replace(/\s/g, "").length < 16) {
        setError("카드 번호를 올바르게 입력해주세요.");
        return;
      }
      if (cardExpiry.replace(/\D/g, "").length < 4) {
        setError("유효기간을 올바르게 입력해주세요.");
        return;
      }
      if (cardCvc.length < 3) {
        setError("CVC를 올바르게 입력해주세요.");
        return;
      }
      if (!cardName.trim()) {
        setError("카드 소유자 이름을 입력해주세요.");
        return;
      }
    }
    if (!agreed) {
      setError("이용약관 및 결제 동의가 필요합니다.");
      return;
    }

    setLoading(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    navigate("/interview/setup", { state: { paid: true, planId } });
  }

  const vat = Math.round(plan.priceNum * 0.1 / 11);
  const supply = plan.priceNum - vat;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/interview")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          모의면접 소개로 돌아가기
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">결제하기</h1>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left: Payment form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">결제 수단 선택</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm transition-colors ${
                      method === id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    style={method === id ? { borderColor: "#6C63FF", color: "#6C63FF", backgroundColor: "#6C63FF0D" } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card form */}
            {method === "card" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">카드 정보 입력</h2>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">카드 번호</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNum}
                    onChange={(e) => setCardNum(formatCardNum(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    style={{ "--tw-ring-color": "#6C63FF33" } as React.CSSProperties}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">유효기간</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">CVC</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">카드 소유자 이름</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Kakao/Naver Pay */}
            {(method === "kakao" || method === "naver") && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-500">
                <Smartphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                결제 버튼을 누르면 {method === "kakao" ? "카카오페이" : "네이버페이"} 앱으로 이동합니다.
              </div>
            )}

            {/* Bank transfer */}
            {method === "bank" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <h2 className="font-semibold text-gray-900 mb-2">입금 계좌 정보</h2>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">은행</span><span className="font-medium text-gray-900">신한은행</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">계좌번호</span><span className="font-medium text-gray-900">110-123-456789</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">예금주</span><span className="font-medium text-gray-900">(주)DevReady</span></div>
                </div>
                <p className="text-xs text-gray-400">입금 확인 후 서비스가 자동 활성화됩니다. (영업일 기준 1시간 이내)</p>
              </div>
            )}

            {/* Agreement */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">이용약관 동의</h2>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <p>· 서비스 이용약관, 개인정보 처리방침에 동의합니다.</p>
                <p>· 구독 상품의 경우 매월 자동으로 결제됩니다.</p>
                <p>· 환불은 이용 시작 전 100%, 이용 후 잔여 기간에 비례하여 환불됩니다.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors cursor-pointer ${
                    agreed ? "border-primary" : "border-gray-300"
                  }`}
                  style={agreed ? { borderColor: "#6C63FF", backgroundColor: "#6C63FF" } : {}}
                >
                  {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">위 내용을 모두 확인하고 동의합니다 (필수)</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">주문 요약</h2>
              <div className="pb-4 mb-4 border-b border-gray-100">
                <div className="font-medium text-gray-900">{plan.name}</div>
                <div className="text-sm text-gray-500 mt-1">{plan.per === "월" ? "월 구독" : "단건 이용권"}</div>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#6C63FF" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>공급가액</span>
                  <span>₩{supply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>부가세 (10%)</span>
                  <span>₩{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>최종 결제금액</span>
                  <span style={{ color: "#6C63FF" }}>₩{plan.price}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-lg shadow-primary/20"
              style={{ backgroundColor: "#6C63FF" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  ₩{plan.price} 결제하기
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              SSL 암호화 안전 결제
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
