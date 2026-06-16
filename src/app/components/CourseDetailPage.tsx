import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle,
  BookOpen, Clock, BarChart3, Play, Code2, FileText,
  Lock, Trophy, ChevronDown, ChevronUp, Lightbulb
} from "lucide-react";

type ChapterStatus = "done" | "current" | "locked";

interface Chapter {
  id: number;
  title: string;
  duration: string;
  type: "video" | "text" | "quiz" | "code";
  content: string;
  codeExample?: string;
  tip?: string;
}

interface Unit {
  id: number;
  title: string;
  chapters: Chapter[];
}

interface CourseData {
  title: string;
  desc: string;
  color: string;
  level: string;
  totalTime: string;
  units: Unit[];
}

const COURSE_DATA: Record<string, CourseData> = {
  "1": {
    title: "알고리즘 기초 완성",
    desc: "정렬·탐색·DP·그래프를 코딩테스트 관점에서 체계적으로",
    color: "#6366F1",
    level: "중급",
    totalTime: "8시간",
    units: [
      {
        id: 1, title: "정렬 알고리즘",
        chapters: [
          { id: 1, title: "버블 정렬과 선택 정렬", duration: "12분", type: "text",
            content: `## 버블 정렬 (Bubble Sort)\n\n버블 정렬은 인접한 두 원소를 비교하여 정렬하는 알고리즘입니다.\n\n### 동작 원리\n1. 배열을 순회하며 인접한 원소를 비교합니다.\n2. 왼쪽 원소가 오른쪽보다 크면 교환합니다.\n3. 한 번 순회가 끝나면 가장 큰 원소가 맨 끝으로 이동합니다.\n4. n-1번 반복합니다.\n\n### 시간 복잡도\n- 최선: O(n) — 이미 정렬된 경우\n- 평균/최악: **O(n²)**\n\n### 면접 포인트\n> 버블 정렬은 실제 코딩 테스트에서 직접 구현보다는 **시간복잡도 개념 이해** 목적으로 자주 출제됩니다.`,
            codeExample: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\n# 예시\nprint(bubble_sort([64, 34, 25, 12, 22, 11, 90]))\n# [11, 12, 22, 25, 34, 64, 90]`,
            tip: "O(n²) 알고리즘은 n=10,000 이상이면 시간 초과가 날 수 있습니다." },
          { id: 2, title: "삽입 정렬", duration: "10분", type: "text",
            content: `## 삽입 정렬 (Insertion Sort)\n\n삽입 정렬은 손에 들고 있는 카드를 정렬하는 방식과 유사합니다.\n\n### 동작 원리\n1. 두 번째 원소부터 시작합니다.\n2. 현재 원소를 이미 정렬된 부분과 비교합니다.\n3. 적절한 위치에 삽입합니다.\n\n### 시간 복잡도\n- 최선: **O(n)** — 거의 정렬된 경우 매우 빠름\n- 평균/최악: O(n²)\n\n### 언제 유리한가?\n- 데이터가 거의 정렬된 상태\n- 소규모 데이터`,
            codeExample: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > key:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key\n    return arr` },
          { id: 3, title: "병합 정렬 & 퀵 정렬", duration: "20분", type: "text",
            content: `## 병합 정렬 (Merge Sort)\n\n분할 정복(Divide and Conquer) 방식을 사용하는 정렬입니다.\n\n### 동작 원리\n1. **분할**: 배열을 반으로 계속 나눕니다.\n2. **정복**: 각 부분 배열을 재귀적으로 정렬합니다.\n3. **합병**: 정렬된 두 배열을 합칩니다.\n\n### 시간 복잡도\n- 최선/평균/최악 모두 **O(n log n)**\n- 공간 복잡도: O(n) — 추가 배열 필요\n\n## 퀵 정렬 (Quick Sort)\n\n### 시간 복잡도\n- 평균: **O(n log n)**\n- 최악: O(n²) — 피벗이 항상 최소/최대일 때\n\n### 코딩테스트 팁\n> Python에서는 \`sorted()\`나 \`.sort()\`가 **Timsort**를 사용하므로 O(n log n) 보장. 직접 구현보다 내장 함수를 활용하세요.`,
            codeExample: `# 병합 정렬\ndef merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result` },
        ]
      },
      {
        id: 2, title: "탐색 알고리즘",
        chapters: [
          { id: 4, title: "이진 탐색 (Binary Search)", duration: "15분", type: "text",
            content: `## 이진 탐색\n\n**정렬된 배열**에서 탐색 범위를 절반씩 줄여가며 탐색하는 알고리즘입니다.\n\n### 조건\n- 배열이 **반드시 정렬**되어 있어야 합니다.\n\n### 동작 원리\n1. 탐색 범위의 중간값(mid)을 선택합니다.\n2. target == mid → 찾았습니다!\n3. target < mid → 왼쪽 절반으로 범위 축소\n4. target > mid → 오른쪽 절반으로 범위 축소\n\n### 시간 복잡도\n- **O(log n)** — n=1,000,000도 약 20번이면 탐색 완료!`,
            codeExample: `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\n# Python 내장: bisect 모듈\nimport bisect\narr = [1, 3, 5, 7, 9]\nidx = bisect.bisect_left(arr, 5)  # → 2`,
            tip: "이진 탐색은 '최적값 찾기' 문제에서 매우 자주 활용됩니다. 탐색 범위를 잘 설정하는 것이 핵심!" },
          { id: 5, title: "DFS & BFS", duration: "25분", type: "text",
            content: `## DFS (깊이 우선 탐색)\n\n스택(재귀) 기반으로 한 방향으로 끝까지 탐색한 뒤 되돌아옵니다.\n\n### 언제 사용?\n- 경로 탐색, 사이클 감지, 위상 정렬\n\n## BFS (너비 우선 탐색)\n\n큐(Queue) 기반으로 현재 노드의 모든 인접 노드를 먼저 탐색합니다.\n\n### 언제 사용?\n- **최단 경로** 탐색 (가중치 없는 그래프)\n- 레벨별 탐색`,
            codeExample: `from collections import deque\n\n# BFS\ndef bfs(graph, start):\n    visited = set()\n    queue = deque([start])\n    visited.add(start)\n    result = []\n    while queue:\n        node = queue.popleft()\n        result.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return result\n\n# DFS (재귀)\ndef dfs(graph, node, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(node)\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            dfs(graph, neighbor, visited)\n    return visited` },
        ]
      },
      {
        id: 3, title: "동적 프로그래밍",
        chapters: [
          { id: 6, title: "DP 기초 개념", duration: "18분", type: "text",
            content: `## 동적 프로그래밍 (Dynamic Programming)\n\n### 핵심 개념\nDP는 **큰 문제를 작은 부분 문제로 나누어** 해결하고, **결과를 저장(메모이제이션)**하여 중복 계산을 피하는 기법입니다.\n\n### 적용 조건\n1. **최적 부분 구조**: 전체 최적해가 부분 최적해로 구성됨\n2. **중복 부분 문제**: 동일한 부분 문제가 여러 번 반복\n\n### 대표 문제\n- 피보나치 수열, 배낭 문제, 최장 공통 부분 수열(LCS), 동전 교환`,
            codeExample: `# 피보나치 - 메모이제이션\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\n# 피보나치 - 바텀업\ndef fib_dp(n):\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]`,
            tip: "DP 문제를 만나면 'dp[i]의 의미'를 먼저 정의하고, 점화식을 세우세요." },
        ]
      }
    ]
  },
  "2": {
    title: "네트워크 & HTTP", desc: "OSI 7계층, TCP/IP, HTTP/HTTPS, REST, WebSocket",
    color: "#3B82F6", level: "기초", totalTime: "4시간",
    units: [
      { id: 1, title: "OSI 7계층",
        chapters: [
          { id: 1, title: "OSI 모델 개요", duration: "15분", type: "text",
            content: `## OSI 7계층 모델\n\n네트워크 통신을 7개의 계층으로 나누어 표준화한 모델입니다.\n\n| 계층 | 이름 | 주요 프로토콜 |\n|------|------|-------|\n| 7 | 응용 (Application) | HTTP, FTP, DNS |\n| 6 | 표현 (Presentation) | SSL/TLS |\n| 5 | 세션 (Session) | TLS, NetBIOS |\n| 4 | 전송 (Transport) | TCP, UDP |\n| 3 | 네트워크 (Network) | IP, ICMP |\n| 2 | 데이터링크 (Data Link) | Ethernet, Wi-Fi |\n| 1 | 물리 (Physical) | 케이블, 광섬유 |\n\n### 면접 단골 질문\n> "TCP와 UDP의 차이점은?" — TCP는 연결 지향(신뢰성), UDP는 비연결(속도)`,
            tip: "7→1 순으로 외우기: 아파서 누워서 티비(TCP/IP)봄" },
          { id: 2, title: "TCP 3-way Handshake", duration: "12분", type: "text",
            content: `## TCP 연결 과정\n\n### 3-way Handshake (연결 수립)\n1. **SYN**: 클라이언트 → 서버 (연결 요청)\n2. **SYN-ACK**: 서버 → 클라이언트 (수락)\n3. **ACK**: 클라이언트 → 서버 (확인)\n\n### 4-way Handshake (연결 종료)\n1. FIN → ACK → FIN → ACK\n\n### TCP vs UDP\n| 특성 | TCP | UDP |\n|------|-----|-----|\n| 연결 | 연결 지향 | 비연결 |\n| 신뢰성 | 보장 | 미보장 |\n| 속도 | 느림 | 빠름 |\n| 용도 | HTTP, 파일 전송 | 영상 스트리밍, 게임 |` },
        ]
      },
      { id: 2, title: "HTTP & REST",
        chapters: [
          { id: 3, title: "HTTP 메서드와 상태코드", duration: "18분", type: "text",
            content: `## HTTP 메서드\n\n| 메서드 | 용도 | 멱등성 |\n|--------|------|--------|\n| GET | 조회 | O |\n| POST | 생성 | X |\n| PUT | 전체 수정 | O |\n| PATCH | 부분 수정 | X |\n| DELETE | 삭제 | O |\n\n## 주요 상태 코드\n- **2xx 성공**: 200(OK), 201(Created), 204(No Content)\n- **3xx 리다이렉션**: 301(영구), 302(임시)\n- **4xx 클라이언트 오류**: 400, 401(인증 필요), 403(권한 없음), 404(없음)\n- **5xx 서버 오류**: 500, 502, 503\n\n### 면접 포인트\n> 401 vs 403: 401은 로그인 안 됨, 403은 로그인은 됐지만 권한 없음`,
            tip: "PUT은 전체 교체, PATCH는 일부 수정. RESTful API 설계 시 구분 중요!" },
          { id: 4, title: "REST API 설계 원칙", duration: "15분", type: "text",
            content: `## RESTful API 설계\n\n### 6가지 원칙\n1. **Stateless**: 서버가 클라이언트 상태를 저장하지 않음\n2. **Uniform Interface**: 일관된 인터페이스\n3. **Client-Server**: 역할 분리\n4. **Cacheable**: 응답 캐싱 가능\n5. **Layered System**: 계층화 가능\n6. **Code on Demand** (선택)\n\n### 좋은 URL 설계\n\`\`\`\n✅ GET  /users          → 사용자 목록\n✅ GET  /users/1        → 특정 사용자\n✅ POST /users          → 사용자 생성\n✅ PUT  /users/1        → 사용자 수정\n❌ GET  /getUsers       → 동사 사용 금지\n❌ POST /createUser     → 동사 사용 금지\n\`\`\`` },
        ]
      }
    ]
  },
  "4": {
    title: "React & TypeScript 심화", desc: "훅, 상태관리, 성능 최적화, 타입 시스템",
    color: "#F59E0B", level: "심화", totalTime: "10시간",
    units: [
      { id: 1, title: "React 훅 심화",
        chapters: [
          { id: 1, title: "useState & useEffect 동작 원리", duration: "20분", type: "text",
            content: `## useState\n\nReact의 함수형 컴포넌트에서 상태를 관리하는 훅입니다.\n\n### 주의사항\n- 상태 업데이트는 **비동기**적으로 처리됩니다.\n- 이전 상태 기반 업데이트 시 **함수형 업데이트**를 사용하세요.\n\n\`\`\`tsx\n// ❌ 잘못된 방식\nsetCount(count + 1)\nsetCount(count + 1) // 두 번 호출해도 1만 증가\n\n// ✅ 올바른 방식\nsetCount(prev => prev + 1)\nsetCount(prev => prev + 1) // 2 증가\n\`\`\`\n\n## useEffect\n\n### 의존성 배열 패턴\n\`\`\`tsx\nuseEffect(() => { /* 매 렌더마다 */ })\nuseEffect(() => { /* 마운트 시 1회 */ }, [])\nuseEffect(() => { /* a 변경 시 */ }, [a])\nuseEffect(() => { return () => { /* 클린업 */ }; }, [])\n\`\`\``,
            codeExample: `function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = \`Count: \${count}\`;\n    return () => {\n      document.title = 'App'; // cleanup\n    };\n  }, [count]);\n\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}`,
            tip: "useEffect 안에서 사용하는 모든 값은 의존성 배열에 포함해야 합니다." },
          { id: 2, title: "useMemo & useCallback", duration: "18분", type: "text",
            content: `## 성능 최적화 훅\n\n### useMemo — 값 메모이제이션\n계산 비용이 큰 연산 결과를 캐싱합니다.\n\n### useCallback — 함수 메모이제이션\n함수 참조를 캐싱하여 자식 컴포넌트의 불필요한 리렌더를 방지합니다.\n\n### React.memo\n props가 변경되지 않으면 컴포넌트 리렌더를 방지합니다.\n\n### 언제 사용해야 하나?\n> 무조건 최적화하면 안 됩니다! 메모이제이션 자체도 비용입니다.\n- 실제 성능 문제가 측정된 경우\n- 자식에 전달하는 props가 참조형인 경우`,
            codeExample: `// useMemo 예시\nconst expensiveValue = useMemo(() => {\n  return computeHeavy(data); // 비용이 큰 계산\n}, [data]);\n\n// useCallback 예시\nconst handleClick = useCallback(() => {\n  doSomething(id);\n}, [id]);\n\n// React.memo 예시\nconst Child = React.memo(({ value, onClick }) => {\n  return <button onClick={onClick}>{value}</button>;\n});` },
          { id: 3, title: "커스텀 훅 만들기", duration: "22분", type: "text",
            content: `## 커스텀 훅 (Custom Hook)\n\n반복되는 상태 로직을 재사용 가능한 함수로 추출합니다.\n\n### 규칙\n- 이름은 반드시 **use**로 시작\n- 내부에서 다른 훅 호출 가능\n- 렌더링 로직 아님 (JSX 반환 X)`,
            codeExample: `// useFetch 커스텀 훅\nfunction useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    fetch(url)\n      .then(res => res.json())\n      .then(d => { if (!cancelled) setData(d); })\n      .catch(e => { if (!cancelled) setError(e); })\n      .finally(() => { if (!cancelled) setLoading(false); });\n    return () => { cancelled = true; };\n  }, [url]);\n\n  return { data, loading, error };\n}` },
        ]
      },
      { id: 2, title: "상태 관리",
        chapters: [
          { id: 4, title: "Context API vs Zustand", duration: "20분", type: "text",
            content: `## 상태 관리 비교\n\n### Context API\n- 리렌더 최적화 어려움\n- 전역 상태보다 테마·인증 등 변경이 적은 데이터에 적합\n\n### Zustand\n- 간단한 API, 번들 크기 작음\n- 필요한 slice만 구독 → 최적화 쉬움\n\n### Redux Toolkit\n- 대규모 앱, 엄격한 상태 관리가 필요한 경우\n- DevTools 강력함`,
            codeExample: `// Zustand store\nimport { create } from 'zustand'\n\ninterface Store {\n  count: number;\n  increment: () => void;\n  reset: () => void;\n}\n\nconst useStore = create<Store>((set) => ({\n  count: 0,\n  increment: () => set(state => ({ count: state.count + 1 })),\n  reset: () => set({ count: 0 }),\n}));\n\n// 컴포넌트에서 사용\nfunction Counter() {\n  const { count, increment } = useStore();\n  return <button onClick={increment}>{count}</button>;\n}` },
        ]
      }
    ]
  },
  "5": {
    title: "Spring Boot & JPA", desc: "의존성 주입, JPA 연관관계, JWT 인증, API 설계",
    color: "#EC4899", level: "중급", totalTime: "9시간",
    units: [
      { id: 1, title: "Spring Boot 핵심",
        chapters: [
          { id: 1, title: "IoC & DI 개념", duration: "18분", type: "text",
            content: `## IoC (Inversion of Control)\n\n제어의 역전: 객체의 생성과 의존관계 설정을 개발자가 아닌 **스프링 컨테이너**가 담당합니다.\n\n## DI (Dependency Injection)\n\n의존성 주입: 필요한 객체를 외부에서 주입받는 방식입니다.\n\n### 주입 방식 비교\n| 방식 | 권장 여부 | 이유 |\n|------|-----------|------|\n| 생성자 주입 | ✅ 권장 | 불변성, 테스트 용이 |\n| 필드 주입 | ❌ 비권장 | 테스트 어려움 |\n| Setter 주입 | △ 선택적 | 선택적 의존성에만 |`,
            codeExample: `// 생성자 주입 (권장)\n@Service\n@RequiredArgsConstructor\npublic class UserService {\n    private final UserRepository userRepository;\n    private final PasswordEncoder passwordEncoder;\n\n    public UserResponse createUser(UserRequest request) {\n        String encoded = passwordEncoder.encode(request.getPassword());\n        User user = User.builder()\n            .email(request.getEmail())\n            .password(encoded)\n            .build();\n        return UserResponse.from(userRepository.save(user));\n    }\n}`,
            tip: "@RequiredArgsConstructor + final 필드 조합이 스프링 현업 표준입니다." },
          { id: 2, title: "JPA 연관관계 매핑", duration: "25분", type: "text",
            content: `## JPA 연관관계\n\n### @OneToMany / @ManyToOne\n- 가장 흔한 연관관계\n- **연관관계의 주인**: @ManyToOne이 있는 쪽 (FK를 가진 쪽)\n\n### 지연 로딩 vs 즉시 로딩\n- **LAZY** (권장): 실제 사용 시점에 쿼리\n- **EAGER**: 즉시 모두 로딩 → N+1 문제 발생 위험\n\n### N+1 문제 해결\n- Fetch Join: \`JOIN FETCH\`\n- @EntityGraph\n- Batch Size`,
            codeExample: `@Entity\npublic class Post {\n    @Id @GeneratedValue\n    private Long id;\n    private String title;\n\n    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩\n    @JoinColumn(name = "user_id")\n    private User author;\n\n    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)\n    private List<Comment> comments = new ArrayList<>();\n}\n\n// Fetch Join으로 N+1 해결\n@Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :id")\nOptional<Post> findByIdWithAuthor(@Param("id") Long id);` },
        ]
      }
    ]
  },
  "6": {
    title: "운영체제 핵심 개념", desc: "프로세스·스레드, 메모리 관리, 동기화, 데드락",
    color: "#8B5CF6", level: "기초", totalTime: "4시간",
    units: [
      { id: 1, title: "프로세스 & 스레드",
        chapters: [
          { id: 1, title: "프로세스와 스레드 차이", duration: "15분", type: "text",
            content: `## 프로세스 (Process)\n\n실행 중인 프로그램의 인스턴스입니다.\n- **독립적인 메모리 공간** (코드, 데이터, 힙, 스택)\n- IPC(Inter-Process Communication)로 통신\n\n## 스레드 (Thread)\n\n프로세스 내의 실행 흐름 단위입니다.\n- **메모리 공유** (코드, 데이터, 힙) + 개별 스택·레지스터\n- 통신이 빠르지만 동기화 필요\n\n### 면접 핵심\n> 멀티스레드 환경에서 **Race Condition**이 발생하는 이유?  \n> → 여러 스레드가 공유 자원에 동시 접근하기 때문. **뮤텍스/세마포어**로 해결`,
            tip: "프로세스: 식당 전체 / 스레드: 식당의 직원들 — 주방(힙, 데이터)을 함께 씁니다." },
          { id: 2, title: "데드락 (Deadlock)", duration: "18분", type: "text",
            content: `## 데드락이란?\n\n두 개 이상의 프로세스가 서로 상대방이 가진 자원을 기다리며 **무한정 대기**하는 상태입니다.\n\n### 발생 조건 (4가지 모두 충족 시)\n1. **상호 배제**: 자원은 한 번에 하나만 사용\n2. **점유 대기**: 자원 점유 중에 다른 자원 대기\n3. **비선점**: 강제로 자원 빼앗기 불가\n4. **순환 대기**: 프로세스들이 원형으로 대기\n\n### 해결 방법\n- **예방**: 조건 중 하나를 제거\n- **회피**: 은행원 알고리즘\n- **탐지 & 회복**: 주기적 탐지 후 복구` },
        ]
      }
    ]
  },
};

const DEFAULT_COURSE: CourseData = {
  title: "데이터베이스 핵심", desc: "정규화, 인덱스, 트랜잭션, SQL 최적화",
  color: "#10B981", level: "중급", totalTime: "5시간",
  units: [
    { id: 1, title: "SQL & 정규화",
      chapters: [
        { id: 1, title: "정규화 1NF~3NF", duration: "20분", type: "text",
          content: `## 정규화 (Normalization)\n\n데이터 중복을 최소화하고 데이터 무결성을 보장하기 위한 과정입니다.\n\n### 1NF: 원자값\n- 각 컬럼은 원자적(atomic) 값만 가져야 합니다.\n\n### 2NF: 부분 함수 종속 제거\n- 복합 키에서 일부 키에만 종속된 컬럼을 분리합니다.\n\n### 3NF: 이행 함수 종속 제거\n- 비키 속성이 다른 비키 속성에 종속되지 않아야 합니다.\n\n### BCNF\n- 모든 결정자가 후보 키여야 합니다.`,
          codeExample: `-- 정규화 위반 (반복 그룹)\nCREATE TABLE orders (\n    order_id INT,\n    product1 VARCHAR(50),\n    product2 VARCHAR(50)  -- 위반!\n);\n\n-- 정규화 적용\nCREATE TABLE orders (order_id INT PRIMARY KEY);\nCREATE TABLE order_items (\n    order_id INT REFERENCES orders(order_id),\n    product VARCHAR(50),\n    quantity INT\n);` },
        { id: 2, title: "인덱스 & 쿼리 최적화", duration: "22분", type: "text",
          content: `## 인덱스 (Index)\n\n데이터 검색 속도를 높이기 위한 자료구조 (B-Tree가 일반적).\n\n### 인덱스 적합 컬럼\n- WHERE 절에 자주 사용\n- JOIN 조건 컬럼\n- 카디널리티(고유값 수)가 높은 컬럼\n\n### 인덱스 피해야 할 경우\n- INSERT/UPDATE/DELETE가 매우 잦은 경우\n- 카디널리티가 낮은 컬럼 (성별 등)\n\n### 실행계획\n\`EXPLAIN SELECT ...\`으로 쿼리 분석 → Full Table Scan vs Index Scan`,
          tip: "복합 인덱스는 왼쪽 컬럼부터 사용해야 인덱스가 적용됩니다 (왼쪽 접두사 규칙)." },
      ]
    }
  ]
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = id ? (COURSE_DATA[id] ?? DEFAULT_COURSE) : DEFAULT_COURSE;

  // 완료된 챕터 추적
  const allChapters = course.units.flatMap(u => u.chapters);
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(allChapters.slice(0, Math.floor(allChapters.length * 0.4)).map(c => c.id))
  );
  const [currentChapterId, setCurrentChapterId] = useState(allChapters[0]?.id ?? 1);
  const [openUnits, setOpenUnits] = useState<Set<number>>(new Set(course.units.map(u => u.id)));
  const [showCode, setShowCode] = useState(false);

  const currentChapter = allChapters.find(c => c.id === currentChapterId);
  const currentIdx = allChapters.findIndex(c => c.id === currentChapterId);
  const progress = Math.round((completedIds.size / allChapters.length) * 100);

  function markDone() {
    setCompletedIds(prev => new Set([...prev, currentChapterId]));
    // 다음 챕터로 이동
    if (currentIdx < allChapters.length - 1) {
      setCurrentChapterId(allChapters[currentIdx + 1].id);
    }
  }

  function getStatus(chapterId: number): ChapterStatus {
    if (completedIds.has(chapterId)) return "done";
    if (chapterId === currentChapterId) return "current";
    return "locked";
  }

  const typeIcon = { video: Play, text: FileText, quiz: Trophy, code: Code2 };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/education")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />교육 센터
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-base truncate">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: course.color }} />
              </div>
              <span className="font-medium text-gray-700">{progress}%</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{course.level}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 items-start">
        {/* Sidebar: chapter list */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1">전체 진행률</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: course.color }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{completedIds.size}/{allChapters.length}</span>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {course.units.map(unit => (
                <div key={unit.id}>
                  <button
                    onClick={() => setOpenUnits(prev => { const n = new Set(prev); n.has(unit.id) ? n.delete(unit.id) : n.add(unit.id); return n; })}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-600">{unit.title}</span>
                    {openUnits.has(unit.id) ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                  </button>
                  {openUnits.has(unit.id) && unit.chapters.map(ch => {
                    const status = getStatus(ch.id);
                    const Icon = typeIcon[ch.type];
                    return (
                      <button key={ch.id} onClick={() => setCurrentChapterId(ch.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${currentChapterId === ch.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                        {status === "done"
                          ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                          : status === "current"
                          ? <div className="w-4 h-4 rounded-full shrink-0 border-2 border-indigo-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /></div>
                          : <Circle className="w-4 h-4 shrink-0 text-gray-300" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug truncate ${currentChapterId === ch.id ? "font-medium text-indigo-700" : "text-gray-700"}`}>{ch.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <Icon className="w-2.5 h-2.5" />{ch.duration}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {currentChapter && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Chapter header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                      <span className="text-xs text-gray-500">{currentChapter.duration}</span>
                      {completedIds.has(currentChapterId) && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />완료
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg">{currentChapter.title}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <div className="prose prose-sm max-w-none">
                    {currentChapter.content.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">{line.slice(3)}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-gray-800 mt-4 mb-2">{line.slice(4)}</h3>;
                      if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-indigo-300 pl-4 py-1 bg-indigo-50 text-sm text-indigo-800 rounded-r-lg my-3">{line.slice(2)}</blockquote>;
                      if (line.startsWith("- ")) return <li key={i} className="text-sm text-gray-700 ml-4 mb-1 list-disc">{line.slice(2)}</li>;
                      if (line.startsWith("| ")) {
                        const cells = line.split("|").filter(c => c.trim());
                        if (line.includes("---")) return <div key={i} />;
                        const isHeader = i < 5 && currentChapter.content.split("\n").slice(i+1, i+2)[0]?.includes("---");
                        return (
                          <div key={i} className={`flex border-b border-gray-100 ${isHeader ? "bg-gray-50 font-medium" : "hover:bg-gray-50"}`}>
                            {cells.map((cell, j) => <div key={j} className="flex-1 px-3 py-2 text-sm text-gray-700">{cell.trim()}</div>)}
                          </div>
                        );
                      }
                      if (line.startsWith("```") || line === "") return <div key={i} className={line === "" ? "h-2" : ""} />;
                      return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
                    })}
                  </div>

                  {/* Tip */}
                  {currentChapter.tip && (
                    <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">{currentChapter.tip}</p>
                    </div>
                  )}

                  {/* Code example */}
                  {currentChapter.codeExample && (
                    <div className="mt-5">
                      <button onClick={() => setShowCode(!showCode)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors mb-2">
                        <Code2 className="w-4 h-4" />
                        코드 예제 {showCode ? "접기" : "보기"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showCode ? "rotate-180" : ""}`} />
                      </button>
                      {showCode && (
                        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                          <code>{currentChapter.codeExample}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => currentIdx > 0 && setCurrentChapterId(allChapters[currentIdx - 1].id)}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />이전
                  </button>
                  <button onClick={markDone}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: completedIds.has(currentChapterId) ? "#10B981" : course.color }}>
                    <CheckCircle2 className="w-4 h-4" />
                    {completedIds.has(currentChapterId) ? "완료됨 · 다음으로" : "완료 · 다음으로"}
                  </button>
                  <button
                    onClick={() => currentIdx < allChapters.length - 1 && setCurrentChapterId(allChapters[currentIdx + 1].id)}
                    disabled={currentIdx === allChapters.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    다음<ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile: chapter list */}
              <div className="lg:hidden bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800">전체 목차</div>
                {course.units.flatMap(u => u.chapters).map(ch => {
                  const status = getStatus(ch.id);
                  return (
                    <button key={ch.id} onClick={() => setCurrentChapterId(ch.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0 transition-colors ${currentChapterId === ch.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                      {status === "done" ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
                      <span className={`text-sm ${currentChapterId === ch.id ? "font-medium text-indigo-700" : "text-gray-700"}`}>{ch.title}</span>
                      <span className="text-xs text-gray-400 ml-auto">{ch.duration}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
