import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText, ArrowLeft, CheckCircle, Filter, Search,
  Bell, Phone, Mail, X, User, BrainCircuit, Download
} from "lucide-react";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  appliedDate: string;
  status: "대기" | "검토중" | "2차 선택" | "거절";
  consentGiven: boolean;
  skills: string[];
  education: string;
  aiScore: number;
  jobTitle: string;
}

const MOCK_APPLICANTS: Applicant[] = [
  { id: 1, name: "김철수", email: "chulsoo@example.com", phone: "010-1234-5678", position: "프론트엔드", experience: "3년", appliedDate: "2026-06-05", status: "대기", consentGiven: true, skills: ["React", "TypeScript", "Next.js"], education: "서울대학교 컴퓨터공학과", aiScore: 88, jobTitle: "프론트엔드 개발자" },
  { id: 2, name: "이영희", email: "younghee@example.com", phone: "010-2345-6789", position: "프론트엔드", experience: "2년", appliedDate: "2026-06-06", status: "검토중", consentGiven: true, skills: ["Vue.js", "JavaScript", "CSS"], education: "연세대학교 소프트웨어학과", aiScore: 92, jobTitle: "프론트엔드 개발자" },
  { id: 3, name: "박민수", email: "minsu@example.com", phone: "010-3456-7890", position: "백엔드", experience: "4년", appliedDate: "2026-06-04", status: "대기", consentGiven: false, skills: ["Node.js", "Python", "MySQL"], education: "고려대학교 컴퓨터학과", aiScore: 76, jobTitle: "백엔드 개발자" },
  { id: 4, name: "최지수", email: "jisu@example.com", phone: "010-4567-8901", position: "백엔드", experience: "5년", appliedDate: "2026-06-03", status: "검토중", consentGiven: true, skills: ["Java", "Spring Boot", "Redis", "AWS"], education: "KAIST 전산학과", aiScore: 95, jobTitle: "백엔드 개발자" },
  { id: 5, name: "강동원", email: "dongwon@example.com", phone: "010-5678-9012", position: "풀스택", experience: "3년", appliedDate: "2026-06-07", status: "대기", consentGiven: true, skills: ["React", "Node.js", "PostgreSQL"], education: "한양대학교 정보시스템학과", aiScore: 82, jobTitle: "풀스택 개발자" },
];

function NotifyModal({ applicant, onConfirm, onClose }: {
  applicant: Applicant;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">2차 면접 선택 확인</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{applicant.name}</div>
              <div className="text-xs text-gray-500">{applicant.position} · {applicant.experience}</div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-400" />{applicant.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-3.5 h-3.5 text-gray-400" />{applicant.phone}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          위 지원자를 2차 면접 대상자로 선택하면 다음 작업이 자동으로 진행됩니다:
        </p>
        <ul className="space-y-2 text-sm text-gray-700 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            지원자에게 2차 면접 안내 알림 자동 발송
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            지원자 연락처 (이메일·전화번호) 공개 처리
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            지원 상태 "2차 선택" 으로 변경
          </li>
        </ul>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors">취소</button>
          <button onClick={onConfirm} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: "#6C63FF" }}>
            <Bell className="w-3.5 h-3.5" />알림 발송 및 선택
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResumeReview({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [filterJob, setFilterJob] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyTarget, setNotifyTarget] = useState<Applicant | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSecondInterview = () => {
    if (!notifyTarget) return;
    setApplicants(applicants.map(a => a.id === notifyTarget.id ? { ...a, status: "2차 선택" as const } : a));
    if (selectedApplicant?.id === notifyTarget.id) setSelectedApplicant({ ...notifyTarget, status: "2차 선택" });
    showToast(`${notifyTarget.name}님에게 2차 면접 안내 알림이 발송되었습니다.`);
    setNotifyTarget(null);
  };

  const jobs = ["전체", ...Array.from(new Set(applicants.map(a => a.jobTitle)))];

  const filteredApplicants = applicants.filter((a) => {
    const matchesStatus = filterStatus === "전체" || a.status === filterStatus;
    const matchesJob = filterJob === "전체" || a.jobTitle === filterJob;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesJob && matchesSearch;
  });

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    "대기": { bg: "#F3F4F6", color: "#6B7280" },
    "검토중": { bg: "#EEF2FF", color: "#6C63FF" },
    "2차 선택": { bg: "#ECFDF5", color: "#10B981" },
    "거절": { bg: "#FEF2F2", color: "#EF4444" },
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50 py-8"}>
      {notifyTarget && (
        <NotifyModal
          applicant={notifyTarget}
          onConfirm={handleSecondInterview}
          onClose={() => setNotifyTarget(null)}
        />
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-green-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <Bell className="w-4 h-4" />{toast}
        </div>
      )}

      <div className={embedded ? "" : "max-w-7xl mx-auto px-4"}>
        {!embedded && (
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />뒤로가기
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">지원자 이력서 관리</h1>
                <p className="text-sm text-gray-500">정보 공개 동의한 지원자의 이력서를 확인할 수 있습니다</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 직군 검색"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm">
                {jobs.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm">
              {["전체", "대기", "검토중", "2차 선택", "거절"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">지원자 목록 ({filteredApplicants.length}명)</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredApplicants.map((applicant) => (
                  <div key={applicant.id}
                    onClick={() => applicant.consentGiven && setSelectedApplicant(applicant)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedApplicant?.id === applicant.id ? "border-indigo-400 bg-indigo-50"
                      : applicant.consentGiven ? "border-gray-100 bg-white hover:border-indigo-200"
                      : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-bold shrink-0" style={{ color: "#6C63FF" }}>
                          {applicant.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{applicant.name}</div>
                          <div className="text-xs text-gray-500">{applicant.position} · {applicant.experience}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold" style={{ color: applicant.aiScore >= 90 ? "#10B981" : applicant.aiScore >= 80 ? "#6C63FF" : "#F59E0B" }}>
                          AI {applicant.aiScore}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: STATUS_STYLE[applicant.status].bg, color: STATUS_STYLE[applicant.status].color }}>
                          {applicant.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{applicant.jobTitle} · 지원일 {applicant.appliedDate}</div>
                    {!applicant.consentGiven && <p className="text-xs text-red-400">* 정보 공개 동의하지 않음</p>}
                    {applicant.consentGiven && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {applicant.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
              {selectedApplicant ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-lg font-bold" style={{ color: "#6C63FF" }}>
                        {selectedApplicant.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedApplicant.name}</h3>
                        <p className="text-sm text-gray-500">{selectedApplicant.position} · {selectedApplicant.experience}</p>
                      </div>
                    </div>
                    {selectedApplicant.status !== "2차 선택" ? (
                      <button onClick={() => setNotifyTarget(selectedApplicant)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: "#6C63FF" }}>
                        <Bell className="w-3.5 h-3.5" />2차 면접 선택
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm">
                        <CheckCircle className="w-3.5 h-3.5" />선택 완료
                      </div>
                    )}
                  </div>

                  {/* AI score */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <BrainCircuit className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="text-xs text-gray-500">AI 면접 점수</div>
                      <div className="font-bold" style={{ color: selectedApplicant.aiScore >= 90 ? "#10B981" : "#6C63FF" }}>{selectedApplicant.aiScore}점</div>
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full ml-2">
                      <div className="h-full rounded-full" style={{ width: `${selectedApplicant.aiScore}%`, backgroundColor: selectedApplicant.aiScore >= 90 ? "#10B981" : "#6C63FF" }} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">이메일</label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedApplicant.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">연락처</label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedApplicant.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">학력</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedApplicant.education}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">기술 스택</label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApplicant.skills.map((skill) => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">지원 공고</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedApplicant.jobTitle}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">지원일</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedApplicant.appliedDate}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                      <Download className="w-3.5 h-3.5" />전체 이력서 PDF 다운로드
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <FileText className="w-14 h-14 text-gray-200 mb-4" />
                  <p className="text-sm text-gray-400">지원자를 선택하면 상세 정보를 확인할 수 있습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
