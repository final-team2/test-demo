import { useState } from "react";
import { X, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface CoverLetterQuestion {
  id: string;
  question: string;
}

interface ApplicationFormProps {
  jobTitle: string;
  company: string;
  questions: CoverLetterQuestion[];
  onClose: () => void;
  onSubmit: (answers: Record<string, string>) => void;
}

export function ApplicationForm({ jobTitle, company, questions, onClose, onSubmit }: ApplicationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: "" }), {})
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    questions.forEach(q => {
      if (!answers[q.id]?.trim()) {
        newErrors[q.id] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(answers);
  };

  const getCharCount = (id: string) => answers[id]?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{company} 입사 지원</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">자기소개서 작성 안내</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  모든 질문에 성실히 답변해주세요. 작성된 내용을 바탕으로 AI 모의 면접을 진행할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const charCount = getCharCount(q.id);
              const hasError = errors[q.id];

              return (
                <div key={q.id} className="space-y-2">
                  <label className="block">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{q.question}</p>
                        {hasError && (
                          <p className="text-xs text-red-500 mt-1">이 항목은 필수입니다</p>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => {
                        setAnswers({ ...answers, [q.id]: e.target.value });
                        if (errors[q.id]) {
                          setErrors({ ...errors, [q.id]: false });
                        }
                      }}
                      rows={6}
                      placeholder="여기에 답변을 작성해주세요 (200자 이상 권장)"
                      className={`w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 transition-all resize-none ${
                        hasError
                          ? "border-red-300 focus:ring-red-200"
                          : "border-border focus:ring-primary/20"
                      }`}
                    />
                  </label>
                  <div className="flex items-center justify-between text-xs">
                    <span className={charCount >= 200 ? "text-green-600" : "text-muted-foreground"}>
                      {charCount >= 200 ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          적절한 분량입니다
                        </span>
                      ) : (
                        `200자 이상 권장 (현재 ${charCount}자)`
                      )}
                    </span>
                    <span className="text-muted-foreground">{charCount}자</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground hover:bg-secondary transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:bg-indigo-600 transition-colors font-medium"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
}
