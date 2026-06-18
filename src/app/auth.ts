import { useNavigate } from "react-router";

/**
 * UI 프로토타입용 간단 로그인 상태 (백엔드/세션 없음).
 * - 페이지 "열람"은 비로그인도 자유롭게 가능.
 * - 로그인이 필요한 "실행" 동작(AI 퀴즈 시작·모의면접·지원 등)만 가드한다.
 * - 상태는 localStorage 플래그 하나로만 관리 (상태관리 라이브러리 미도입).
 */
const KEY = "devready_authed";
const CAREER_KEY = "devready_career_set";

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

/** 맞춤 진로 변경(기본 베이스 정보) 설정 여부 */
export function isCareerSet(): boolean {
  try {
    return localStorage.getItem(CAREER_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCareerSet(v: boolean): void {
  try {
    if (v) localStorage.setItem(CAREER_KEY, "1");
    else localStorage.removeItem(CAREER_KEY);
  } catch {
    /* ignore */
  }
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
