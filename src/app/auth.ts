import { useNavigate } from "react-router";

/**
 * UI 프로토타입용 간단 로그인 상태 (백엔드/세션 없음).
 * - 페이지 "열람"은 비로그인도 자유롭게 가능.
 * - 로그인이 필요한 "실행" 동작(AI 퀴즈 시작·모의면접·지원 등)만 가드한다.
 * - 상태는 localStorage 플래그 하나로만 관리 (상태관리 라이브러리 미도입).
 */
const KEY = "devready_authed";

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

/**
 * 로그인 필요한 동작 가드.
 * 로그인 상태면 action 실행, 비로그인이면 로그인 창(/auth)으로 이동.
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  return (action: () => void) => {
    if (isAuthed()) action();
    else navigate("/auth");
  };
}
