import { useNavigate, useParams } from "react-router";
import { ArrowLeft, RotateCcw, Download } from "lucide-react";
import { InterviewReport } from "./InterviewReport";

export function SessionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            면접 기록으로
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/interview/setup")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-accent transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              다시 도전
            </button>
          </div>
        </div>
      </div>
      <InterviewReport />
    </div>
  );
}
