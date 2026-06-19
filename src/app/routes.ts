import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { SignupPage } from "./components/SignupPage";
import { EducationPage } from "./components/EducationPage";
import { JobsPage } from "./components/JobsPage";
import { JobDetailPage } from "./components/JobDetailPage";
import { CalendarPage } from "./components/CalendarPage";
import { ResumePage } from "./components/ResumePage";
import { InterviewLanding } from "./components/InterviewLanding";
import { InterviewPayment } from "./components/InterviewPayment";
import { InterviewSetup } from "./components/InterviewSetup";
import { InterviewSession } from "./components/InterviewSession";
import { InterviewReport } from "./components/InterviewReport";
import { CommunityPage } from "./components/CommunityPage";
import { HistoryPage } from "./components/HistoryPage";
import { SessionDetail } from "./components/SessionDetail";
import { MyPage } from "./components/MyPage";
import { AdminPage } from "./components/AdminPage";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { CodingTestPage } from "./components/CodingTestPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "auth", Component: AuthPage },
      { path: "signup", Component: SignupPage },
      { path: "education", Component: EducationPage },
      { path: "education/course/:id", Component: CourseDetailPage },
      { path: "education/coding-test", Component: CodingTestPage },
      { path: "jobs", Component: JobsPage },
      { path: "jobs/:id", Component: JobDetailPage },
      { path: "calendar", Component: CalendarPage },
      { path: "resume", Component: ResumePage },
      { path: "interview", Component: InterviewLanding },
      { path: "interview/payment", Component: InterviewPayment },
      { path: "interview/setup", Component: InterviewSetup },
      { path: "interview/session", Component: InterviewSession },
      { path: "interview/report/:id", Component: InterviewReport },
      { path: "community", Component: CommunityPage },
      { path: "history", Component: HistoryPage },
      { path: "history/:id", Component: SessionDetail },
      { path: "mypage", Component: MyPage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
