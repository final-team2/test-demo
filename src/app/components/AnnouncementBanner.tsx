import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Sparkles, ArrowRight } from "lucide-react";

const BANNERS = [
  {
    id: "promo-june",
    label: "6월 한정",
    text: "신규 가입 시 프리미엄 면접 세션 3회 무료 제공",
    cta: "지금 시작하기",
    href: "/auth",
    color: "from-indigo-500 to-violet-500",
  },
  {
    id: "feature-voice",
    label: "새 기능",
    text: "음성 분석 v2 출시 — 한국어 필러워드 감지 정확도 92%",
    cta: "자세히 보기",
    href: "/interview",
    color: "from-violet-500 to-pink-500",
  },
];

export function AnnouncementBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  const visible = BANNERS.filter(b => !dismissed.includes(b.id));
  if (visible.length === 0) return null;

  const banner = visible[current % visible.length];

  return (
    <div
      className={`relative flex items-center justify-center gap-3 px-4 py-2.5 text-white text-sm bg-gradient-to-r ${banner.color}`}
      style={{ minHeight: 40 }}
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
        {banner.label}
      </span>
      <span className="hidden sm:inline opacity-90">{banner.text}</span>
      <span className="sm:hidden opacity-90 truncate">{banner.text}</span>
      <button
        onClick={() => navigate(banner.href)}
        className="shrink-0 flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 rounded-full text-xs font-medium transition-colors"
      >
        {banner.cta}
        <ArrowRight className="w-3 h-3" />
      </button>
      <button
        onClick={() => {
          setDismissed(d => [...d, banner.id]);
          setCurrent(c => c + 1);
        }}
        className="absolute right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="닫기"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
