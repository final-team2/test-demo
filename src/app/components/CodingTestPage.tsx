import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Code2, ChevronRight, Clock, Trophy, CheckCircle2, Circle,
  Play, RotateCcw, ChevronDown, ChevronUp, AlignLeft, AlertCircle,
  Zap, Filter, Search, Star, ArrowLeft, Terminal, X
} from "lucide-react";

const PROBLEMS = [
  {
    id: 1, title: "두 수의 합", category: "배열", level: "쉬움", acceptance: 72, solved: true,
    tags: ["해시맵", "두 포인터"],
    desc: `정수 배열 nums와 정수 target이 주어질 때, 두 수를 더해서 target이 되는 인덱스 쌍을 반환하세요.\n\n각 입력에 정확히 하나의 해가 존재하며, 같은 원소를 두 번 사용하지 않습니다.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explain: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explain: "nums[1] + nums[2] = 2 + 4 = 6" },
    ],
    constraints: ["2 ≤ nums.length ≤ 10^4", "-10^9 ≤ nums[i] ≤ 10^9", "하나의 유효한 답이 반드시 존재"],
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function twoSum(nums, target) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // 여기에 코드를 작성하세요\n        return new int[]{};\n    }\n}`,
    },
    solution: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, v in enumerate(nums):\n        diff = target - v\n        if diff in seen:\n            return [seen[diff], i]\n        seen[v] = i`,
    },
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" },
    ],
  },
  {
    id: 2, title: "유효한 괄호", category: "스택", level: "쉬움", acceptance: 65, solved: true,
    tags: ["스택", "문자열"],
    desc: `괄호 문자열 s가 주어집니다. '(', ')', '{', '}', '[', ']' 로만 이루어진 문자열이 유효한지 판별하세요.\n\n유효한 문자열은:\n- 열린 괄호는 같은 종류의 닫힌 괄호로 닫혀야 합니다.\n- 열린 괄호는 올바른 순서로 닫혀야 합니다.`,
    examples: [
      { input: `s = "()"`, output: "true", explain: "유효한 괄호 쌍" },
      { input: `s = "()[]{}"`, output: "true", explain: "각각 유효한 쌍" },
      { input: `s = "(]"`, output: "false", explain: "타입이 맞지 않음" },
    ],
    constraints: ["1 ≤ s.length ≤ 10^4", "s는 괄호 문자만 포함"],
    starterCode: {
      python: `def isValid(s: str) -> bool:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function isValid(s) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // 여기에 코드를 작성하세요\n        return false;\n    }\n}`,
    },
    solution: {
      python: `def isValid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in mapping:\n            if not stack or stack[-1] != mapping[c]:\n                return False\n            stack.pop()\n        else:\n            stack.append(c)\n    return not stack`,
    },
    testCases: [
      { input: `"()"`, expected: "true" },
      { input: `"()[]{}"`, expected: "true" },
      { input: `"(]"`, expected: "false" },
    ],
  },
  {
    id: 3, title: "이진 탐색", category: "이진탐색", level: "쉬움", acceptance: 58, solved: false,
    tags: ["이진 탐색"],
    desc: `오름차순으로 정렬된 정수 배열 nums와 정수 target이 주어질 때, target의 인덱스를 반환하세요.\n\ntarget이 없으면 -1을 반환합니다.\n\n반드시 O(log n) 시간복잡도로 구현해야 합니다.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explain: "9는 인덱스 4에 존재" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explain: "2는 배열에 없음" },
    ],
    constraints: ["1 ≤ nums.length ≤ 10^4", "-10^4 < nums[i], target < 10^4", "모든 원소는 유일", "nums는 오름차순 정렬"],
    starterCode: {
      python: `def search(nums: list[int], target: int) -> int:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function search(nums, target) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // 여기에 코드를 작성하세요\n        return -1;\n    }\n}`,
    },
    solution: { python: "" },
    testCases: [
      { input: "[-1,0,3,5,9,12], 9", expected: "4" },
      { input: "[-1,0,3,5,9,12], 2", expected: "-1" },
    ],
  },
  {
    id: 4, title: "최장 증가 부분수열(LIS)", category: "동적프로그래밍", level: "중간", acceptance: 43, solved: false,
    tags: ["DP", "이진탐색"],
    desc: `정수 배열 nums가 주어질 때, 가장 긴 증가하는 부분수열의 길이를 반환하세요.\n\n부분수열은 배열에서 일부 원소를 순서를 유지하면서 선택한 것입니다.`,
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explain: "[2,3,7,101]" },
      { input: "nums = [0,1,0,3,2,3]", output: "4", explain: "[0,1,2,3]" },
    ],
    constraints: ["1 ≤ nums.length ≤ 2500", "-10^4 ≤ nums[i] ≤ 10^4"],
    starterCode: {
      python: `def lengthOfLIS(nums: list[int]) -> int:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function lengthOfLIS(nums) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // 여기에 코드를 작성하세요\n        return 0;\n    }\n}`,
    },
    solution: { python: "" },
    testCases: [
      { input: "[10,9,2,5,3,7,101,18]", expected: "4" },
      { input: "[0,1,0,3,2,3]", expected: "4" },
    ],
  },
  {
    id: 5, title: "섬의 개수", category: "그래프", level: "중간", acceptance: 50, solved: false,
    tags: ["BFS", "DFS", "유니온파인드"],
    desc: `'1'(땅)과 '0'(물)로 이루어진 2D 그리드가 주어질 때, 섬의 개수를 반환하세요.\n\n섬은 수평·수직으로 인접한 땅으로 이루어지며, 사방이 물로 둘러싸여 있습니다.`,
    examples: [
      { input: `grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]`, output: "1", explain: "연결된 하나의 섬" },
      { input: `grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]`, output: "3", explain: "3개의 섬" },
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 ≤ m, n ≤ 300", "grid[i][j]는 '0' 또는 '1'"],
    starterCode: {
      python: `def numIslands(grid: list[list[str]]) -> int:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function numIslands(grid) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // 여기에 코드를 작성하세요\n        return 0;\n    }\n}`,
    },
    solution: { python: "" },
    testCases: [],
  },
  {
    id: 6, title: "N-Queen", category: "백트래킹", level: "어려움", acceptance: 32, solved: false,
    tags: ["백트래킹"],
    desc: `N×N 체스판에 N개의 퀸을 서로 공격하지 않도록 놓는 모든 경우의 수를 반환하세요.`,
    examples: [
      { input: "n = 4", output: "2", explain: "두 가지 배치가 가능" },
      { input: "n = 1", output: "1", explain: "1×1에 퀸 1개" },
    ],
    constraints: ["1 ≤ n ≤ 9"],
    starterCode: {
      python: `def totalNQueens(n: int) -> int:\n    # 여기에 코드를 작성하세요\n    pass`,
      javascript: `function totalNQueens(n) {\n  // 여기에 코드를 작성하세요\n}`,
      java: `class Solution {\n    public int totalNQueens(int n) {\n        // 여기에 코드를 작성하세요\n        return 0;\n    }\n}`,
    },
    solution: { python: "" },
    testCases: [
      { input: "4", expected: "2" },
      { input: "1", expected: "1" },
    ],
  },
];

const LEVELS = ["전체", "쉬움", "중간", "어려움"];
const CATEGORIES_FILTER = ["전체", "배열", "스택", "이진탐색", "동적프로그래밍", "그래프", "백트래킹"];
const LANGS = ["python", "javascript", "java"] as const;
type Lang = typeof LANGS[number];

const LEVEL_COLOR: Record<string, string> = {
  쉬움: "text-green-600 bg-green-50 border-green-200",
  중간: "text-yellow-600 bg-yellow-50 border-yellow-200",
  어려움: "text-red-600 bg-red-50 border-red-200",
};

function ProblemList({
  onSelect,
}: {
  onSelect: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("전체");
  const [catFilter, setCatFilter] = useState("전체");

  const filtered = PROBLEMS.filter((p) => {
    if (levelFilter !== "전체" && p.level !== levelFilter) return false;
    if (catFilter !== "전체" && p.category !== catFilter) return false;
    if (search && !p.title.includes(search) && !p.tags.some((t) => t.includes(search))) return false;
    return true;
  });

  const solved = PROBLEMS.filter((p) => p.solved).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">코딩 테스트</h1>
          <p className="text-sm text-gray-500 mt-1">실전 감각을 키우는 알고리즘 문제풀이</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
            {solved} / {PROBLEMS.length} 해결
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "쉬움", count: PROBLEMS.filter((p) => p.level === "쉬움").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "중간", count: PROBLEMS.filter((p) => p.level === "중간").length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "어려움", count: PROBLEMS.filter((p) => p.level === "어려움").length, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="문제 제목, 태그 검색"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                levelFilter === l
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES_FILTER.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              catFilter === c
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Problem table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 w-8">#</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">분류</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">난이도</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">정답률</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-sm text-gray-400">
                  {p.solved ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-900">{p.title}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">{p.category}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLOR[p.level]}`}>
                    {p.level}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">{p.acceptance}%</td>
                <td className="pr-4">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CodeEditor({
  problem,
  onBack,
}: {
  problem: (typeof PROBLEMS)[0];
  onBack: () => void;
}) {
  const [lang, setLang] = useState<Lang>("python");
  const [code, setCode] = useState(problem.starterCode[lang]);
  const [tab, setTab] = useState<"desc" | "examples" | "solution">("desc");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ input: string; expected: string; actual: string; pass: boolean }[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [descExpanded, setDescExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(problem.starterCode[lang] || "// 이 언어의 스타터 코드가 없습니다.");
  }, [lang, problem]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
  };

  const handleRun = () => {
    setRunning(true);
    setShowResult(false);
    setTimeout(() => {
      const mockResults = problem.testCases.map((tc, i) => ({
        input: tc.input,
        expected: tc.expected,
        actual: i < 2 ? tc.expected : "오답",
        pass: i < 2,
      }));
      setResults(mockResults.length > 0 ? mockResults : [
        { input: "예시 입력", expected: "예시 출력", actual: "예시 출력", pass: true }
      ]);
      setRunning(false);
      setShowResult(true);
    }, 1200);
  };

  const allPass = results?.every((r) => r.pass) ?? false;

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-sm text-white font-medium">{problem.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLOR[problem.level]}`}>
            {problem.level}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>{l === "javascript" ? "JavaScript" : l === "python" ? "Python" : "Java"}</option>
            ))}
          </select>
          <button
            onClick={() => setCode(problem.starterCode[lang])}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />초기화
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-white"
            style={{ backgroundColor: "#6C63FF" }}
          >
            {running ? (
              <span className="animate-pulse">실행 중...</span>
            ) : (
              <>
                <Play className="w-3 h-3" />실행
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body: split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: problem */}
        <div className="w-[42%] min-w-[320px] border-r border-gray-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-gray-900">
            {(["desc", "examples", "solution"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                  tab === t
                    ? "text-indigo-400 border-indigo-400"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                {t === "desc" ? "문제 설명" : t === "examples" ? "예제" : "해설"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 text-sm text-gray-300">
            {tab === "desc" && (
              <div>
                <p className="leading-relaxed whitespace-pre-wrap mb-6">{problem.desc}</p>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">제약 조건</div>
                  <ul className="space-y-1.5">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-indigo-400 mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">태그</div>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === "examples" && (
              <div className="space-y-4">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-gray-800 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-800 text-xs font-medium text-gray-400">예제 {i + 1}</div>
                    <div className="p-3 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">입력</span>
                        <div className="mt-1 px-3 py-2 rounded-lg bg-gray-900 font-mono text-xs text-green-400">{ex.input}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">출력</span>
                        <div className="mt-1 px-3 py-2 rounded-lg bg-gray-900 font-mono text-xs text-blue-400">{ex.output}</div>
                      </div>
                      {ex.explain && (
                        <div className="text-xs text-gray-500 italic">💡 {ex.explain}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "solution" && (
              <div>
                {problem.solution.python ? (
                  <div>
                    <div className="text-xs text-gray-500 mb-3">Python 풀이 예시</div>
                    <pre className="bg-gray-900 rounded-xl p-4 text-xs text-green-300 overflow-x-auto leading-relaxed">
                      {problem.solution.python}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                    <AlertCircle className="w-8 h-8 mb-3" />
                    <p className="text-sm">먼저 직접 풀어보세요!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: editor + console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute top-3 right-3 z-10 text-xs text-gray-600 font-mono">
              {lang === "python" ? "Python 3" : lang === "javascript" ? "Node.js" : "Java 17"}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full h-full resize-none bg-gray-950 text-gray-100 font-mono text-sm p-5 pt-4 focus:outline-none leading-relaxed"
              style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace", tabSize: 4 }}
            />
          </div>

          {/* Console */}
          <div className={`border-t border-gray-800 transition-all ${showResult ? "h-52" : "h-10"}`}>
            <div
              className="flex items-center justify-between px-4 h-10 bg-gray-900 cursor-pointer"
              onClick={() => setShowResult(!showResult)}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 font-medium">실행 결과</span>
                {results && (
                  <span className={`text-xs font-medium ${allPass ? "text-green-400" : "text-red-400"}`}>
                    {allPass ? "✓ 통과" : "✗ 실패"}
                  </span>
                )}
              </div>
              <button className="text-gray-600 hover:text-gray-400">
                {showResult ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showResult && results && (
              <div className="overflow-y-auto h-40 p-4 space-y-3">
                {results.map((r, i) => (
                  <div key={i} className={`rounded-lg p-3 border ${r.pass ? "border-green-800 bg-green-950/40" : "border-red-800 bg-red-950/40"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-400">테스트 {i + 1}</span>
                      <span className={`text-xs font-semibold ${r.pass ? "text-green-400" : "text-red-400"}`}>
                        {r.pass ? "✓ 통과" : "✗ 실패"}
                      </span>
                    </div>
                    <div className="text-xs font-mono space-y-0.5">
                      <div className="text-gray-500">입력: <span className="text-gray-300">{r.input}</span></div>
                      <div className="text-gray-500">예상: <span className="text-blue-300">{r.expected}</span></div>
                      <div className="text-gray-500">출력: <span className={r.pass ? "text-green-300" : "text-red-300"}>{r.actual}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodingTestPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const problem = PROBLEMS.find((p) => p.id === selectedId);

  if (problem) {
    return <CodeEditor problem={problem} onBack={() => setSelectedId(null)} />;
  }

  return <ProblemList onSelect={setSelectedId} />;
}
