export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade?: string; // e.g. "دهم ریاضی", "یازدهم تجربی"
}

export type QuestionType = 'multiple_choice' | 'boolean' | 'descriptive';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // for multiple_choice
  correctAnswer?: string; // string index for choice, "true"/"false" for boolean, or guide text for descriptive
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  duration: number; // in minutes
  questions: Question[];
  passingScore: number; // e.g. 10 out of 20
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalPoints: number;
  category: string; // e.g. "ریاضی", "فیزیک", "ادبیات"
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>; // questionId -> answer chosen/written
  pointsGained?: number; // final calculated score
  totalPoints: number;
  status: 'pending' | 'graded'; // descriptive answers require grading
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  scores?: Record<string, number>; // questionId -> gained point
  feedback?: Record<string, string>; // questionId -> teacher feedback
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
}
