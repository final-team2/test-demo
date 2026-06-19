export type NoticeRow = { id: number; title: string; content: string; type: "공지"|"점검"|"이벤트"; date: string; published: boolean };

export const INIT_NOTICES: NoticeRow[] = [
  { id: 1, title: "2026년 6월 정기 점검 안내", content: "6월 15일 새벽 2시~4시 시스템 점검이 진행됩니다.", type: "점검", date: "2026-06-10", published: true },
  { id: 2, title: "면접 이용권 여름 할인 이벤트", content: "7월 한 달간 프로 플랜 20% 할인 이벤트를 진행합니다.", type: "이벤트", date: "2026-06-08", published: true },
  { id: 3, title: "서비스 이용약관 개정 안내", content: "2026년 7월 1일부터 개정된 이용약관이 적용됩니다.", type: "공지", date: "2026-06-05", published: false },
];

// 유저 노출용: 공개된 공지만, 최신순
export const publishedNotices = () => INIT_NOTICES.filter(n => n.published).sort((a, b) => b.date.localeCompare(a.date));

// 유형별 배지 색상 (관리자/유저 공통)
export const NOTICE_TYPE_CLS: Record<NoticeRow["type"], string> = {
  공지: "bg-blue-100 text-blue-700",
  점검: "bg-amber-100 text-amber-700",
  이벤트: "bg-green-100 text-green-700",
};
