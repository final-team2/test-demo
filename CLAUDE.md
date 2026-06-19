# DevReady — AI 면접 앱 (UI 프로토타입)

> 이 파일은 Claude Code가 프로젝트를 빠르게 이해하기 위한 컨텍스트입니다.
> 작업 시작 전에 이 규칙들을 반드시 따르세요. **응답은 한국어(존댓말)로 합니다.**

## 🎯 이 프로젝트의 목적 (가장 중요)
- 이 레포의 목표는 **UI 보고서(설계 문서)용 화면 프로토타입**입니다. 실제 서비스 구현이 아닙니다.
- 화면이 **가볍게 이동(navigation)만** 되면 됩니다. 실제 로그인·결제·면접 평가 등은 동작하지 않아도 됩니다.
- 따라서 다음을 **하지 마세요**:
  - ❌ 백엔드·서버·DB·실제 API 호출(fetch/axios 등) 추가 금지
  - ❌ 인증/세션/상태관리 라이브러리 새로 도입 금지
  - ❌ 기존 mock 데이터를 실제 연동으로 바꾸지 말 것 (컴포넌트 내 mock 유지)
- 작업 범위는 **화면(UI) 수정·정리·디자인 개선 + 화면 간 이동(링크) 보정**에 한정합니다.
- 최종적으로 이 화면들을 캡처해 UI 보고서를 만들 거라, **화면이 깨지지 않고 자연스럽게 보이는 것**이 핵심입니다.

## 🧱 스택
- React 18 + **react-router v7** (`createBrowserRouter`, import는 `"react-router"`에서 — `react-router-dom` 아님)
- Vite 6 + TypeScript
- UI: **shadcn/ui** (`src/app/components/ui/`, 48개 프리미티브) + 일부 **MUI v7**(`@mui/material`) + **Tailwind CSS**
- 차트: `recharts` / 아이콘: `lucide-react` / 애니메이션: `motion`
- 데이터: 전부 각 컴포넌트 안의 **인라인 mock** (백엔드 없음)
- 빌드 검증됨: 에러 0, 2507 모듈, `npm run build` 약 20초

## ▶️ 실행
```bash
npm install
npm run dev      # vite dev 서버 (화면 보면서 작업)
npm run build    # 프로덕션 빌드 검증
```

## 📁 구조
- 진입: `src/main.tsx` → `src/app/App.tsx` → `src/app/routes.ts`
- 페이지 컴포넌트: `src/app/components/<PageName>.tsx`
- 공통 UI 프리미티브: `src/app/components/ui/`
- 레이아웃(헤더/네비): `src/app/components/Root.tsx`(사용자), `CompanyRoot.tsx`(기업)
- 부가: `AnnouncementBanner.tsx`, `ChatbotWidget.tsx`, `ApplicationForm.tsx`
- 스타일: `src/styles/` (`theme.css`, `globals.css`, `tailwind.css`, `fonts.css`, `index.css`)
- Figma 이미지 에셋: `src/imports/`

## 🗺️ 화면 ↔ 파일 (라우트 → 컴포넌트)
"○○ 화면 고쳐줘" 할 때 아래 파일을 찾으면 됩니다. 모두 `src/app/components/` 아래.

**사용자 (`/` · Root 레이아웃)**
| 라우트 | 컴포넌트 파일 | 화면 |
|---|---|---|
| `/` | `LandingPage.tsx` | 메인 랜딩 |
| `/auth` | `AuthPage.tsx` | 로그인 (Face ID·SNS 포함) |
| `/signup` | `SignupPage.tsx` | 회원가입 |
| `/education` | `EducationPage.tsx` | 교육 센터 |
| `/education/course/:id` | `CourseDetailPage.tsx` | 강의 상세 |
| `/education/coding-test` | `CodingTestPage.tsx` | 코딩테스트 |
| `/jobs` | `JobsPage.tsx` | 공고 목록 |
| `/jobs/:id` | `JobDetailPage.tsx` | 공고 상세 |
| `/calendar` | `CalendarPage.tsx` | 캘린더 |
| `/resume` | `ResumePage.tsx` | 이력서 |
| `/interview` | `InterviewLanding.tsx` | 면접 소개(랜딩) |
| `/interview/payment` | `InterviewPayment.tsx` | 결제 |
| `/interview/setup` | `InterviewSetup.tsx` | 면접 설정 |
| `/interview/session` | `InterviewSession.tsx` | 면접 진행 |
| `/interview/report/:id` | `InterviewReport.tsx` | 결과 리포트 |
| `/community` | `CommunityPage.tsx` | 커뮤니티 |
| `/dashboard` | `DashboardPage.tsx` | 성장 대시보드 |
| `/history` | `HistoryPage.tsx` | 면접 기록 |
| `/history/:id` | `SessionDetail.tsx` | 세션 상세 |
| `/mypage` | `MyPage.tsx` | 마이페이지 |
| `/admin` | `AdminPage.tsx` | 관리자 |

**기업 (`/company` · CompanyRoot 레이아웃)**
| 라우트 | 컴포넌트 파일 | 화면 |
|---|---|---|
| `/company/dashboard` | `CompanyDashboard.tsx` | 기업 대시보드 |
| `/company/register` | `CompanyRegister.tsx` | 기업 등록 |
| `/company/mypage` | `CompanyMyPage.tsx` | 기업 마이페이지 |
| `/company/jobs/new` · `/jobs/:id/edit` | `JobCreate.tsx` | 공고 작성/수정 |
| `/company/resumes` | `ResumeReview.tsx` | 지원자 이력서 |

라우트 정의 원본: `src/app/routes.ts`

## ✅ 작업 규칙
1. **UI/디자인만** 수정. 백엔드·네트워크·상태관리 추가 금지.
2. mock 데이터는 그대로 두고, 보이는 부분만 다듬기.
3. 디자인 톤 유지: **보라/블루 계열 + DevReady 브랜딩**, shadcn 컴포넌트·Tailwind 클래스 우선.
4. 화면 간 이동은 react-router의 `<Link>` / `useNavigate()` 사용 (전체 새로고침 금지).
5. 수정 후 `npm run dev`로 해당 화면을 실제로 확인.
6. 큰 컴포넌트(예: `AdminPage.tsx` 1600줄+)는 한 번에 갈아엎지 말고 섹션 단위로.
7. **응답은 한국어(존댓말).**

8.지시어 외의 수정은 절대 금지.
