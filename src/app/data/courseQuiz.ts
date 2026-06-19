export type QuizType = "객관식" | "서술형" | "코딩";
export type Quiz = {
  type: QuizType;
  question: string;
  options?: string[];      // 객관식
  answerIndex?: number;    // 객관식 정답
  keywords?: string[];     // 서술형·코딩 채점용
  starterCode?: string;    // 코딩 초기 코드
};
export type QuizResponse = { selected?: number; text?: string; code?: string };

// 키: "courseId-chapterId" (챕터 id가 강의마다 겹치므로 강의별로 구분)
export const COURSE_QUIZZES: Record<string, Quiz> = {
  // ── 강의 1: 알고리즘 기초 완성 ──
  "1-1": { type: "객관식", question: "버블 정렬의 평균 시간 복잡도는?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answerIndex: 2 },
  "1-2": { type: "서술형", question: "삽입 정렬이 '거의 정렬된 데이터'에서 빠른 이유를 설명하세요.", keywords: ["거의 정렬", "비교", "이동", "적게", "최선", "O(n)"] },
  "1-3": { type: "코딩", question: "병합 정렬(merge sort)을 구현하세요.", keywords: ["def", "merge", "mid", "left", "right"], starterCode: "def merge_sort(arr):\n    # 코드를 작성하세요\n    pass" },
  "1-4": { type: "객관식", question: "정렬된 배열에서 이진 탐색의 시간 복잡도는?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answerIndex: 1 },
  "1-5": { type: "객관식", question: "가중치 없는 그래프에서 최단 경로 탐색에 적합한 알고리즘은?", options: ["DFS", "BFS", "퀵 정렬", "이진 탐색"], answerIndex: 1 },
  "1-6": { type: "서술형", question: "동적 프로그래밍(DP)의 적용 조건 두 가지를 설명하세요.", keywords: ["최적 부분 구조", "중복", "부분 문제", "메모이제이션"] },
  // ── 강의 2: 네트워크 & HTTP ──
  "2-1": { type: "객관식", question: "OSI 7계층 중 TCP/UDP가 속한 계층은?", options: ["응용 계층", "전송 계층", "네트워크 계층", "데이터링크 계층"], answerIndex: 1 },
  "2-2": { type: "서술형", question: "TCP 3-way handshake 과정을 순서대로 설명하세요.", keywords: ["syn", "ack", "syn-ack", "연결"] },
  "2-3": { type: "객관식", question: "요청한 리소스가 존재하지 않을 때 반환하는 HTTP 상태 코드는?", options: ["200", "301", "404", "500"], answerIndex: 2 },
  "2-4": { type: "서술형", question: "RESTful API에서 'Stateless(무상태)'가 의미하는 바를 설명하세요.", keywords: ["상태", "저장", "무상태", "요청", "독립"] },
};

// 채점: 정답 여부(boolean). 객관식=정확, 서술형·코딩=키워드 매칭(절반 이상 포함 시 정답).
export function grade(quiz: Quiz, res: QuizResponse): boolean {
  if (quiz.type === "객관식") return res.selected === quiz.answerIndex;
  const text = (quiz.type === "코딩" ? res.code : res.text)?.toLowerCase() || "";
  const kws = quiz.keywords || [];
  if (kws.length === 0) return text.trim().length > 0;
  const hit = kws.filter(k => text.includes(k.toLowerCase())).length;
  return hit >= Math.ceil(kws.length / 2);
}

// 챕터에 전용 퀴즈가 없으면 generic 객관식 fallback
export function getQuiz(courseId: string, chapterId: number, chapterTitle: string): Quiz {
  return COURSE_QUIZZES[`${courseId}-${chapterId}`] ?? {
    type: "객관식",
    question: `"${chapterTitle}" 단계의 핵심 내용을 올바르게 이해했는지 확인하세요. 학습한 내용으로 가장 적절한 설명은?`,
    options: ["방금 학습한 개념의 핵심을 정확히 적용한 설명", "관련 없는 다른 개념", "정반대로 설명", "근거 없는 추측"],
    answerIndex: 0,
  };
}
// TODO(AI연동): 서술형·코딩 채점은 실서비스에서 EXAONE 서버(POST /education/quiz 또는 /interview/evaluate)로
//   정확도·피드백을 받음. 프로토타입이라 위 키워드 매칭 mock 사용. fetch 추가 금지.
