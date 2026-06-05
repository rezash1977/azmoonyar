import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_USERS, 
  INITIAL_EXAMS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_LOGS 
} from './mockData';
import { User, Exam, Submission, ActivityLog, UserRole } from './types';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { 
  GraduationCap, ShieldAlert, Settings, Award, 
  Users, UserCheck, BookOpen, AlertOctagon, HelpCircle 
} from 'lucide-react';

export default function App() {
  // Load initial states from LocalStorage or fallback to INITIALS
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('azmoon_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('azmoon_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('azmoon_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('azmoon_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Default to the Teacher user to showcase design on load
    return users.find(u => u.role === 'teacher') || users[0];
  });

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('azmoon_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('azmoon_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('azmoon_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('azmoon_logs', JSON.stringify(logs));
  }, [logs]);

  // Handler helpers
  const handleAddLog = (action: string, user: User) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddExam = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
    handleAddLog(`آزمون جدید با عنوان «${newExam.title}» تعریف نمود.`, currentUser);
  };

  const handleSubmitExam = (examId: string, answers: Record<string, string>) => {
    const relatedExam = exams.find(e => e.id === examId);
    if (!relatedExam) return;

    // Automatic scoring for MCQ and Boolean
    let autoPointsGained = 0;
    const scoresMap: Record<string, number> = {};
    let hasDescriptive = false;

    relatedExam.questions.forEach(q => {
      const studentAns = answers[q.id];
      if (q.type === 'multiple_choice' || q.type === 'boolean') {
        const isCorrect = studentAns === q.correctAnswer;
        const pts = isCorrect ? q.points : 0;
        autoPointsGained += pts;
        scoresMap[q.id] = pts;
      } else if (q.type === 'descriptive') {
        hasDescriptive = true;
        scoresMap[q.id] = 0; // descriptive needs manual grading
      }
    });

    const isGradedFully = !hasDescriptive;

    const newSubmission: Submission = {
      id: `sub_${Date.now()}`,
      examId,
      examTitle: relatedExam.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      answers,
      totalPoints: relatedExam.totalPoints,
      status: isGradedFully ? 'graded' : 'pending',
      submittedAt: new Date().toISOString(),
      pointsGained: isGradedFully ? autoPointsGained : undefined,
      scores: scoresMap
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    handleAddLog(`پاسخنامه آزمون «${relatedExam.title}» را تکمیل و ارسال کرد.`, currentUser);
  };

  const handleGradeSubmission = (
    submissionId: string, 
    scores: Record<string, number>, 
    feedback: Record<string, string>, 
    gradedBy: string
  ) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;

      const totalPointsGained = Object.values(scores).reduce((a, b) => a + b, 0);

      // Log it
      handleAddLog(`نمرات و بازخورد برگه مربوط به دانش‌آموز را اصلاح و تایید نمود.`, currentUser);

      return {
        ...sub,
        scores,
        feedback,
        pointsGained: totalPointsGained,
        status: 'graded',
        gradedAt: new Date().toISOString(),
        gradedBy
      };
    }));
  };

  // User Actions
  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    handleAddLog(`کاربر جدید با نام «${newUser.name}» را ثبت‌نام کرد.`, currentUser);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      handleAddLog(`دسترسیِ کاربر «${targetUser.name}» را به ${newRole} تغییر داد.`, currentUser);
    }
  };

  const handleUpdateUserGrade = (userId: string, grade: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, grade } : u));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      handleAddLog(`کاربر «${targetUser.name}» را از حافظه سیستم پاک نمود.`, currentUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* GLOBAL DEMO SWAPPER ACCENT (RTL) */}
      <div className="bg-slate-950 text-white py-2 px-4 shadow-sm relative z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
            <span className="font-bold text-slate-200">پیش‌نمایش آزمایشی چندنقشه آزمون‌یار (جهت شبیه‌سازی سی‌پنل و دیتابیس)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>شبیه‌سازی ورود به عنوان:</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {users.map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    id={`role_switch_btn_${u.id}`}
                    onClick={() => {
                      setCurrentUser(u);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {u.name} ({u.role === 'admin' ? 'ادمین' : u.role === 'teacher' ? 'دبیر' : 'دانش‌آموز'})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CORE WEB LAYOUT HERO BRANDING */}
      <header className="bg-white border-b border-slate-100 shadow-xs relative z-10 py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                سامانه هوشمند برگزاری آزمون‌های آنلاین
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">پلتفرم جامع سنجش مدارس، دانشگاه‌ها و دپارتمان‌های تافل کشور</p>
            </div>
          </div>

          {/* Active user status display */}
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">{currentUser.email}</span>
            </div>
          </div>

        </div>
      </header>

      {/* RENDER ACTIVE DASHBOARD CHASSIS */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          {currentUser.role === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudentDashboard 
                currentUser={currentUser} 
                exams={exams} 
                submissions={submissions}
                onSubmitExam={handleSubmitExam}
              />
            </motion.div>
          )}

          {currentUser.role === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TeacherDashboard 
                currentUser={currentUser}
                exams={exams}
                submissions={submissions}
                onAddExam={handleAddExam}
                onGradeSubmission={handleGradeSubmission}
              />
            </motion.div>
          )}

          {currentUser.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard 
                currentUser={currentUser}
                users={users}
                logs={logs}
                onAddUser={handleAddUser}
                onUpdateUserRole={handleUpdateUserRole}
                onUpdateUserGrade={handleUpdateUserGrade}
                onDeleteUser={handleDeleteUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER ACCENTS */}
      <footer className="bg-white border-t border-slate-150 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-medium">طراحی شده با پایبندی به اصول مدرنیته، زیبایی‌شناختی و واکنش‌گرایی در انواع تلفن همراه، تبلت و دسکتاپ</p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-semibold pt-1">
            <span>دیتابیس ارتباطی: MySQL شبیه‌سازی هوشمند</span>
            <span>•</span>
            <span>بومی‌سازی شده با فونت اختصاصی وزیرمتن (Vazirmatn)</span>
            <span>•</span>
            <span>توسعه یافته بر پایه React & Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
