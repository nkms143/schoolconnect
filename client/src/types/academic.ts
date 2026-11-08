export type SubjectType =
  | 'ALL'
  | 'Science'
  | 'Mathematics'
  | 'Coding'
  | 'English'
  | 'Social Studies'
  | 'General Knowledge';

export type QuizStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex?: number;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  totalPoints: number;
  status: QuizStatus;
  startDate: string;
  endDate: string;
  isResultsReleased: boolean;
  questionsCount: number;
  submissionsCount: number;
  creator?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    };
  };
  hasSubmitted?: boolean;
  userScore?: number | null;
  userMaxScore?: number | null;
  createdAt: string;
}

export interface QuizDetail extends Omit<Quiz, 'questionsCount' | 'submissionsCount'> {
  questions: QuizQuestion[];
  submission?: {
    id: string;
    score: number;
    maxScore: number;
    completedAt: string;
    answers?: Array<{
      questionId: string;
      selectedIndex: number;
      isCorrect: boolean;
      pointsAwarded: number;
    }>;
  } | null;
}

export interface LeaderboardParticipant {
  rank: number;
  submissionId: string;
  studentId: string;
  fullName: string;
  avatarUrl?: string | null;
  grade?: string;
  section?: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

export interface QuizLeaderboardResponse {
  isCompetitionActive: boolean;
  quizTitle: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  totalParticipants: number;
  participants: LeaderboardParticipant[];
}

export interface GlobalLeaderboardEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatarUrl?: string | null;
  grade?: string | null;
  section?: string | null;
  totalPoints: number;
  quizzesTaken: number;
  topScore: number;
  lastActive: string;
}

// Assignments
export type SubmissionStatus = 'PENDING' | 'GRADED' | 'LATE';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  dueDate: string;
  maxPoints: number;
  attachmentUrl?: string | null;
  createdAt: string;
  creator?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    };
  };
  totalSubmissions: number;
  hasSubmitted: boolean;
  submissionStatus: SubmissionStatus;
  userGrade?: number | null;
  isOverdue: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachmentUrl?: string | null;
  status: SubmissionStatus;
  grade?: number | null;
  feedback?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  student?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      grade?: string | null;
      section?: string | null;
    };
  };
}

export interface AssignmentDetail extends Assignment {
  submissions?: AssignmentSubmission[];
  mySubmission?: AssignmentSubmission | null;
}

// Study Notes
export interface StudyNote {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  chapter?: string | null;
  fileUrl: string;
  fileType: string;
  helpfulCount: number;
  hasVoted: boolean;
  createdAt: string;
  author: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      grade?: string | null;
      section?: string | null;
    };
  };
}

