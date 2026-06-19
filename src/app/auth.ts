import { useNavigate } from "react-router";

/**
 * UI 프로토타입용 간단 로그인 상태 (백엔드/세션 없음).
 * - 페이지 "열람"은 비로그인도 자유롭게 가능.
 * - 로그인이 필요한 "실행" 동작(AI 퀴즈 시작·모의면접·지원 등)만 가드한다.
 * - 상태는 localStorage 플래그 하나로만 관리 (상태관리 라이브러리 미도입).
 */
const KEY = "devready_authed";
const RESUME_COMPLETE_KEY = "devready_resume_complete";

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

// ── 이력서 필수 작성 완료 여부 ──
// 키가 없으면(=이력서 미수정 상태) 기본 이력서가 필수를 충족하므로 통과(true).
// 사용자가 이력서를 수정하면 ResumePage가 실제 충족 여부로 "1"/"0"을 기록.
export function isResumeComplete(): boolean {
  try {
    const v = localStorage.getItem(RESUME_COMPLETE_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export function setResumeComplete(v: boolean): void {
  try {
    localStorage.setItem(RESUME_COMPLETE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/**
 * 실행 동작 가드 (2단계).
 * 1) 비로그인 → 로그인 창(/auth)
 * 2) 로그인했지만 이력서 필수 미작성 → 이력서(/resume)
 * 3) 둘 다 충족 → action 실행
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  return (action: () => void) => {
    if (!isAuthed()) { navigate("/auth"); return; }
    if (!isResumeComplete()) { navigate("/resume"); return; }
    action();
  };
}
