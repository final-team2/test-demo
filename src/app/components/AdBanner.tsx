import { Megaphone, ExternalLink } from "lucide-react";

/**
 * 광고 슬롯 (인피드 네이티브 카드)
 *
 * 현재는 UI 프로토타입용 mock 자리표시자입니다. (백엔드/외부 스크립트 없음)
 *
 * ▶ 추후 Google AdSense 연동 시:
 *   아래 "AdSense 연동 자리" 영역의 mock 콘텐츠를 광고 유닛으로 교체하면 됩니다.
 *
 *   <ins className="adsbygoogle"
 *        style={{ display: "block" }}
 *        data-ad-client="ca-pub-XXXXXXXXXXXX"
 *        data-ad-slot="XXXXXXXXXX"
 *        data-ad-format="auto"
 *        data-full-width-responsive="true" />
 *   // index.html에 AdSense 로더 스크립트 추가 후,
 *   // useEffect 안에서 (window.adsbygoogle = window.adsbygoogle || []).push({}) 호출
 */
export function AdBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* 광고 라벨 (정직 표기) */}
      <span className="absolute top-2 right-2 z-10 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">
        광고 · AD
      </span>

      {/* ── AdSense 연동 자리 (현재는 mock 콘텐츠) ── */}
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div
          className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#EEF0FF,#E7E9FF)" }}
        >
          <Megaphone className="w-6 h-6" style={{ color: "#6C63FF" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">이 자리에 광고가 표시됩니다</div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
            추후 Google AdSense 등 광고 네트워크가 연동될 영역입니다. 파트너 프로모션·강의·채용 배너가 노출됩니다.
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 shrink-0">
          Sponsored <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
