import { useNavigate } from "react-router";

/**
 * UI 프로토타입용 간단 로그인 상태 (백엔드/세션 없음).
 * - 페이지 "열람"은 비로그인도 자유롭게 가능.
 * - 로그인이 필요한 "실행" 동작(AI 퀴즈 시작·모의면접·지원 등)만 가드한다.
 * - 상태는 localStorage 플래그 하나로만 관리 (상태관리 라이브러리 미도입).
 */
const KEY = "devready_authed";
const CAREER_DATA_KEY = "devready_career";

export function isAuthed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setAuthed(v: boolean): void {
  try {
    if (v) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// ── 맞춤 진로 변경(기본 베이스 정보) ──
export type CareerData = {
  role: string;
  purpose: string;
  exps: { tech: string; years: number; months: number }[];
  langs: string[];
};

/** 기본값 — 처음부터 내용이 채워져 있음 */
export const DEFAULT_CAREER: CareerData = {
  role: "프론트엔드",
  purpose: "실무 역량 강화",
  exps: [
    { tech: "React", years: 1, months: 0 },
    { tech: "Java", years: 3, months: 6 },
    { tech: "Python", years: 5, months: 0 },
  ],
  langs: ["JavaScript", "TypeScript", "React"],
};

export function getCareer(): CareerData {
  try {
    const raw = localStorage.getItem(CAREER_DATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_CAREER;
}

export function saveCareer(data: CareerData): void {
  try {
    localStorage.setItem(CAREER_DATA_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * 맞춤 진로 변경 '설정' 여부 = 내용이 있는지로 판정.
 * (저장을 다시 하지 않아도 내용만 있으면 통과. 기본값도 내용으로 인정)
 */
export function isCareerSet(): boolean {
  const c = getCareer();
  const hasRole = !!c.role?.trim();
  const hasExp = (c.exps ?? []).some(e => e.tech?.trim());
  const hasLang = (c.langs ?? []).length > 0;
  return hasRole && (hasExp || hasLang);
}

/**
 * 실행 동작 가드 (2단계).
 * 1) 비로그인 → 로그인 창(/auth)
 * 2) 로그인했지만 맞춤 진로 변경 미설정 → 맞춤 진로 변경 창(/mypage?tab=career)
 * 3) 둘 다 충족 → action 실행
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  return (action: () => void) => {
    if (!isAuthed()) { navigate("/auth"); return; }
    if (!isCareerSet()) { navigate("/mypage?tab=career"); return; }
    action();
  };
}
