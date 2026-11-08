# Scheduled Quiz Competitions, Results Announcement, Leaderboard, Assignments, and Study Notes Implementation Plan

> **Goal:** Build an academic and competitive learning suite for SchoolConnect, empowering teachers and faculty to conduct scheduled untimed quiz competitions with defined start and end dates, announce official results and complete participant leaderboards after the competition concludes, post and grade assignments, and share study notes.

**Architecture:**
1. **Competition Lifecycle (`startDate`, `endDate`, `isResultsReleased`):**
   - **Upcoming (`now < startDate`):** Competition announced with start time countdown; test is locked.
   - **Live Competition (`startDate <= now <= endDate`):** Students take untimed quiz. Leaderboard and answer explanations are kept confidential during the contest.
   - **Results Announced (`now > endDate`):** Full official leaderboard is revealed, podium honors awarded, and students can review their scores and explanations.
2. **Data Layer (Prisma + PostgreSQL):** Models for `Quiz`, `QuizQuestion`, `QuizSubmission`, `QuizAnswer`, `Assignment`, `AssignmentSubmission`, `StudyNote`, and `NoteHelpfulVote`.
3. **Backend API (Express + TypeScript):** RESTful endpoints with role-based authorization (teachers/admins can create/grade; students can attempt/submit), automated score calculation, lifecycle state validation, and complete participant ranking.
4. **Frontend (React 18 + Tailwind CSS + Lucide Icons):** Untimed interactive quiz taking player, date/time pickers in quiz creator, all-participant leaderboard with top 3 podium honors, assignments submission and grading drawers, and categorized digital notes library. Fully responsive across desktop, tablet, and mobile.

---

## Phased Implementation Roadmap

### Phase 1: Database Schema & Relations
- [ ] Add Prisma enums: `QuizStatus` (`DRAFT`, `PUBLISHED`, `CLOSED`), `SubmissionStatus` (`PENDING`, `GRADED`, `LATE`).
- [ ] Add models:
  - `Quiz`: Title, description, subject, grade, total points, `startDate`, `endDate`, `isResultsReleased`, creator reference (no timer).
  - `QuizQuestion`: Question text, options array (MCQ), correct option index, point weight, order.
  - `QuizSubmission`: Student reference, score, max score, completed timestamp.
  - `QuizAnswer`: Submission reference, question reference, selected option, correctness, points awarded.
  - `Assignment`: Title, description, subject, grade, due date, max points, attachment URL, creator reference.
  - `AssignmentSubmission`: Assignment reference, student reference, submission text, attachment URL, status, grade, teacher feedback, timestamp.
  - `StudyNote`: Title, description, subject, grade, chapter, file URL, file type, author reference, helpful count.
  - `NoteHelpfulVote`: Unique student vote per note.
- [ ] Update `User` model relations.
- [ ] Run `npx prisma db push` to synchronize Supabase PostgreSQL database.
- [ ] Update `prisma/seed.ts` with initial sample quizzes, assignments, and study notes.

---

### Phase 2: Backend API Development
- [ ] **Quiz Routes (`server/src/routes/quizRoutes.ts`)**:
  - `GET /api/v1/quizzes`: List quizzes with computed lifecycle status (`UPCOMING`, `ACTIVE`, `ENDED`).
  - `GET /api/v1/quizzes/:id`: Get quiz details (questions without correct answers before student completes).
  - `POST /api/v1/quizzes`: Create quiz with `startDate` and `endDate` (Teacher/Admin only).
  - `PUT /api/v1/quizzes/:id`: Update quiz or publish/close status (Teacher/Admin only).
  - `DELETE /api/v1/quizzes/:id`: Delete quiz (Teacher/Admin only).
  - `POST /api/v1/quizzes/:id/submit`: Submit answers, validate that contest is active (`startDate <= now <= endDate`), calculate score, record `QuizSubmission`.
  - `GET /api/v1/quizzes/:id/leaderboard`: If active, returns status *"Results will be announced on [endDate]"*; once ended, returns full ranking of ALL participants sorted by score (DESC) and completion timestamp (ASC).
  - `GET /api/v1/quizzes/leaderboard/global`: Global student competition leaderboard.

- [ ] **Assignment Routes (`server/src/routes/assignmentRoutes.ts`)**:
  - `GET /api/v1/assignments`: List assignments (with filters for grade, subject).
  - `GET /api/v1/assignments/:id`: Get assignment with submission stats (for teachers) or personal submission (for student).
  - `POST /api/v1/assignments`: Post new assignment (Teacher/Admin only).
  - `POST /api/v1/assignments/:id/submit`: Submit student work (file link / text).
  - `POST /api/v1/assignments/:id/grade/:submissionId`: Grade student submission and provide feedback (Teacher/Admin only).

- [ ] **Study Note Routes (`server/src/routes/noteRoutes.ts`)**:
  - `GET /api/v1/notes`: List notes with search, subject filter, and sort by most helpful / newest.
  - `POST /api/v1/notes`: Upload/share note reference (Teacher/Admin or student).
  - `POST /api/v1/notes/:id/vote`: Toggle helpful vote on a study note.
  - `DELETE /api/v1/notes/:id`: Remove note (Author or Admin).

- [ ] Register new routes in `server/src/app.ts`.

---

### Phase 3: Frontend API Services & Types
- [ ] Create `client/src/types/academic.ts`.
- [ ] Create `client/src/services/quizService.ts`.
- [ ] Create `client/src/services/assignmentService.ts`.
- [ ] Create `client/src/services/noteService.ts`.

---

### Phase 4: Quizzes Page & Untimed Quiz Player
- [ ] **`QuizzesPage.tsx`**:
  - Competition Status Tabs: "Live Competitions", "Upcoming", "Results Announced".
  - Date and time badges showing start and end schedules.
  - "+ Conduct Quiz" modal for teachers: includes Start Date & End Date pickers, subject, grade, and question creator.
- [ ] **`QuizTakeModal.tsx`**:
  - Untimed test solver with question navigation and submit confirmation.

---

### Phase 5: Complete Participant Leaderboard Page
- [ ] **`LeaderboardPage.tsx`**:
  - For active quizzes: shows announcement card with date of release.
  - For concluded quizzes: Top 3 Winners Podium (Gold 🥇, Silver 🥈, Bronze 🥉) + complete participant rankings table (all students ranked by score).

---

### Phase 6: Assignments Page & Grading Portal
- [ ] **`AssignmentsPage.tsx`**: Student submissions and Teacher grading drawer.

---

### Phase 7: Study Notes & Learning Library
- [ ] **`StudyNotesPage.tsx`**: Digital repository with subject/grade filters and helpful votes.

---

### Phase 8: Layout, Navigation & Mobile Integration
- [ ] Update `Sidebar.tsx`, `MobileDrawer.tsx`, and `App.tsx` routes.

---

### Phase 9: Verification, Testing & Deployment
- [ ] Run Prisma validation and sync: `npx prisma db push`.
- [ ] Full build verification: `npm --prefix client run build` & `npm --prefix server run build`.
- [ ] Git commit and push to `origin/main` for automated Render deployment.
- [ ] Verify live on `https://schoolconnect-3gwn.onrender.com`.
