import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Clock, Calendar, CheckCircle, AlertCircle, Play, 
  HelpCircle, ChevronRight, ChevronLeft, Flag, Send, HeartPulse,
  Award, RefreshCw, Eye, BookOpenCheck, ShieldAlert
} from 'lucide-react';
import { Exam, Question, Submission, User } from '../types';

interface StudentDashboardProps {
  currentUser: User;
  exams: Exam[];
  submissions: Submission[];
  onSubmitExam: (examId: string, answers: Record<string, string>) => void;
}

export default function StudentDashboard({ 
  currentUser, 
  exams, 
  submissions, 
  onSubmitExam 
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'results' | 'analytics'>('available');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  
  // States for active exam session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [viewingDetailSubmission, setViewingDetailSubmission] = useState<Submission | null>(null);

  // Time tracking effect
  useEffect(() => {
    if (!activeExam) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time finishes
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam]);

  const startExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentQuestionIndex(0);
    setExamAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(exam.duration * 60);
    setShowSubmitConfirm(false);
  };

  const handleAnswerSelect = (questionId: string, value: string) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleFinalSubmit = (forcedByTime = false) => {
    if (!activeExam) return;
    onSubmitExam(activeExam.id, examAnswers);
    setActiveExam(null);
    setShowSubmitConfirm(false);
    setActiveTab('results');
    if (forcedByTime) {
      alert('زمان آزمون شما به پایان رسید و پاسخ‌های شما به صورت خودکار ثبت شد.');
    }
  };

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '۰')}:${secs.toString().padStart(2, '۰')}`;
  };

  // Filter available exams (exams the student hasn't submitted yet)
  const availableExams = exams.filter(exam => {
    const hasSubmitted = submissions.some(sub => sub.examId === exam.id && sub.studentId === currentUser.id);
    const now = new Date();
    const isAfterStart = new Date(exam.startDate) <= now;
    const isBeforeEnd = new Date(exam.endDate) >= now;
    return !hasSubmitted && isAfterStart && isBeforeEnd;
  });

  // Filter student submissions
  const studentSubmissions = submissions.filter(sub => sub.studentId === currentUser.id);

  // Calculate stats for student
  const gradedSubmissions = studentSubmissions.filter(sub => sub.status === 'graded');
  const examPointsPercent = gradedSubmissions.map(sub => {
    const score = sub.pointsGained || 0;
    return (score / sub.totalPoints) * 100;
  });
  const avgPercent = examPointsPercent.length > 0 
    ? Math.round(examPointsPercent.reduce((a, b) => a + b, 0) / examPointsPercent.length) 
    : 0;

  const passedCount = gradedSubmissions.filter(sub => {
    const score = sub.pointsGained || 0;
    const exam = exams.find(e => e.id === sub.examId);
    const passing = exam ? exam.passingScore : (sub.totalPoints / 2);
    return score >= passing;
  }).length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6" id="student_dashboard_root">
      <AnimatePresence mode="wait">
        {!activeExam ? (
          <motion.div
            key="dashboard_home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span>خوش آمدید، {currentUser.name}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">پایه {currentUser.grade}</span>
                </h1>
                <p className="text-slate-500 mt-1 text-sm">پنل امتحانات آنلاین و کارنامه دیجیتال شما</p>
              </div>

              {/* Minimalist Dashboard Switchers */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  id="tab_available"
                  onClick={() => setActiveTab('available')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === 'available'
                      ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  آزمون‌های فعال
                </button>
                <button
                  id="tab_results"
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === 'results'
                      ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  نتایج و کارنامه‌ها
                </button>
                <button
                  id="tab_analytics"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  نمودار پیشرفت
                </button>
              </div>
            </div>

            {/* Quick Summary Cards (Bento-Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{availableExams.length}</div>
                  <div className="text-xs text-slate-500 font-medium">آزمون فعال در انتظار پاسخ</div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{avgPercent}%</div>
                  <div className="text-xs text-slate-500 font-medium">معدل درصدی کل شما</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{passedCount} از {gradedSubmissions.length}</div>
                  <div className="text-xs text-slate-500 font-medium">آزمون‌های قبول شده</div>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: AVAILABLE EXAMS */}
            {activeTab === 'available' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">لیست آزمون‌های فعال جهت شرکت</h2>
                  <span className="text-xs text-slate-400 font-mono">آخرین به روز رسانی شده</span>
                </div>

                {availableExams.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <BookOpenCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-700">هیچ آزمون فعالی در حال حاضر وجود ندارد!</h3>
                    <p className="text-sm text-slate-400 mt-1">منتظر بمانید تا دبیران شما آزمون‌های جدید تعریف کنند.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableExams.map((exam) => (
                      <div 
                        key={exam.id}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Soft Category badge */}
                        <div className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-br-2xl font-semibold">
                          {exam.category}
                        </div>

                        <div className="mt-4">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {exam.title}
                          </h3>
                          <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                            {exam.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-y border-slate-50">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-semibold">مدت زمان: {exam.duration} دقیقه</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <HelpCircle className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-semibold">{exam.questions.length} سوال تستی و تشریحی</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-medium">با ارزش نمره‌ای:</span>
                            <span className="text-xs text-indigo-700 font-bold">{exam.totalPoints} نمره کامل</span>
                          </div>

                          <button
                            id={`start_exam_btn_${exam.id}`}
                            onClick={() => startExam(exam)}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            ورود و شروع آزمون
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: RESULTS & GRADES */}
            {activeTab === 'results' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">سوابق علمی و کارنامه آزمون‌های کتبی</h2>
                
                {studentSubmissions.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <ShieldAlert className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-700">تاکنون در آزمونی شرکت نکرده‌اید!</h3>
                    <p className="text-sm text-slate-400 mt-1">با شرکت در اولین آزمون خود، سابقه تحصیلی شما در این جدول فوراْ نمایان می‌شود.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
                            <th className="p-4">عنوان آزمون</th>
                            <th className="p-4">تاریخ ارسال</th>
                            <th className="p-4 text-center">نوع تصحیح</th>
                            <th className="p-4 text-center">نمره نهایی / سقف نمره</th>
                            <th className="p-4 text-center">وضعیت قبولی</th>
                            <th className="p-4 text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {studentSubmissions.map((sub) => {
                            const relatedExam = exams.find(e => e.id === sub.examId);
                            const passing = relatedExam ? relatedExam.passingScore : sub.totalPoints / 2;
                            const isPassed = sub.pointsGained !== undefined && sub.pointsGained >= passing;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-slate-800">{sub.examTitle}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">شناسه: {sub.examId}</div>
                                </td>
                                <td className="p-4 text-slate-500 text-xs font-mono">
                                  {new Date(sub.submittedAt).toLocaleDateString('fa-IR')} - {new Date(sub.submittedAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="p-4 text-center">
                                  {sub.status === 'pending' ? (
                                    <span className="text-[11px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium inline-block">
                                      نیازمند نظر دبیر (تشریحی)
                                    </span>
                                  ) : (
                                    <span className="text-[11px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium inline-block">
                                      تصحیح شده و قطعی
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center font-bold">
                                  {sub.status === 'pending' ? (
                                    <span className="text-slate-400">در حال محاسبه</span>
                                  ) : (
                                    <span className={isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                                      {sub.pointsGained} از {sub.totalPoints}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  {sub.status === 'pending' ? (
                                    <span className="text-slate-400 text-xs">-</span>
                                  ) : isPassed ? (
                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                                      <CheckCircle className="w-4 h-4" /> قبولی در آزمون
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-rose-500 flex items-center justify-center gap-1">
                                      <AlertCircle className="w-4 h-4" /> عدم قبولی
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    id={`view_result_btn_${sub.id}`}
                                    onClick={() => setViewingDetailSubmission(sub)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 mx-auto cursor-pointer transition-all"
                                  >
                                    <Eye className="w-4 h-4" />
                                    جزئیات و پاسخ‌ها
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">تحلیل نموداری پیشرفت و کارایی علمی</h2>
                  <p className="text-xs text-slate-400 mt-1">بررسی روند رشد تحصیلی شما در آزمون‌های مختلف برگزار شده به درصد نمره حاصله</p>
                </div>

                {gradedSubmissions.length < 1 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center col-span-full">
                    <HeartPulse className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold text-slate-600">دیتای رفتاری جهت سنجش کافی نیست</h3>
                    <p className="text-xs text-slate-400 mt-1">حداقل نمره‌دهی یک آزمون تصحیح شده برای تشکیل نمودار پویا نیاز است.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Beautiful responsive custom layout bar representation */}
                    <div className="p-4 bg-slate-50/50 rounded-xl space-y-4">
                      <div className="text-xs text-slate-500 font-bold mb-2">رتبه‌بندی عملکرد آزمونی به درصد:</div>
                      <div className="space-y-4">
                        {gradedSubmissions.map((sub, index) => {
                          const percentage = Math.round(((sub.pointsGained || 0) / sub.totalPoints) * 100);
                          const isPassed = percentage >= 60;
                          return (
                            <div key={sub.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-700">{sub.examTitle}</span>
                                <span className="font-bold text-slate-900 font-mono">{percentage}% ({sub.pointsGained} از {sub.totalPoints})</span>
                              </div>
                              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: index * 0.1, duration: 0.8 }}
                                  className={`h-full rounded-full ${
                                    isPassed ? 'bg-indigo-600' : 'bg-rose-500'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Educational feedback center */}
                    <div className="border border-slate-100 rounded-xl p-5 bg-white">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-500" /> بازخوردهای دریافتی اساتید
                      </h3>
                      <div className="space-y-3">
                        {gradedSubmissions.filter(s => s.feedback && Object.keys(s.feedback).length > 0).map((sub) => (
                          <div key={sub.id} className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed space-y-1">
                            <span className="font-bold text-slate-700 block">{sub.examTitle}</span>
                            {sub.feedback && Object.entries(sub.feedback).map(([qId, feed]) => (
                              <p key={qId} className="text-slate-500 flex items-start gap-1">
                                <span className="font-semibold text-indigo-600 shrink-0">سوال:</span>
                                <span>{feed}</span>
                              </p>
                            ))}
                          </div>
                        ))}
                        {gradedSubmissions.filter(s => s.feedback && Object.keys(s.feedback).length > 0).length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center">دبیر بازخورد متنی ثبت نکرده است.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* ACTIVE EXAM INTERACTIVE SESSION */
          <motion.div
            key="exam_session"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"
          >
            {/* Right sidebar: Questions Index Nav for Persian RTL */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              {/* Timer Widget */}
              <div className="bg-slate-900 text-white rounded-xl p-4 text-center flex flex-col gap-1 items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>زمان باقی‌مانده</span>
                </div>
                <div className="text-2xl font-bold font-mono tracking-wider">{formatTime(timeLeft)}</div>
                
                {/* Visual indicator bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (timeLeft / (activeExam.duration * 60)) < 0.2 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${(timeLeft / (activeExam.duration * 60)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Status and Numbers Navigator */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3">نقشه سوالات آزمون</h4>
                <div className="grid grid-cols-4 gap-2">
                  {activeExam.questions.map((q, idx) => {
                    const isAnswered = examAnswers[q.id] !== undefined && examAnswers[q.id] !== '';
                    const isFlagged = flaggedQuestions[q.id] === true;
                    const isCurrent = currentQuestionIndex === idx;

                    return (
                      <button
                        key={q.id}
                        id={`q_nav_btn_${idx}`}
                        className={`h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                          isCurrent 
                            ? 'ring-2 ring-indigo-600 ring-offset-2' 
                            : ''
                        } ${
                          isFlagged
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : isAnswered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                        }}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border border-white rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend stats */}
              <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl text-xs font-medium">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span>پاسخ داده شده ({Object.keys(examAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <span className="w-3 h-3 bg-amber-400 rounded-sm" />
                  <span>نشانه‌گذاری شده جهت بازبینی ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 bg-slate-300 rounded-sm" />
                  <span>بدون پاسخ ({activeExam.questions.length - Object.keys(examAnswers).length})</span>
                </div>
              </div>

              {/* Action buttons */}
              <button
                id="submit_exam_review_btn"
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
                ثبت و پایان آزمون
              </button>
            </div>

            {/* Left Main Content Pane: Current Question */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 min-h-[400px] flex flex-col justify-between">
              <div>
                {/* Top Question Header */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-bold">
                      سوال {currentQuestionIndex + 1} از {activeExam.questions.length}
                    </span>
                    <h3 className="text-slate-800 font-semibold text-sm mt-2">
                      آزمون در حال برگزاری: {activeExam.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="flag_current_q"
                      onClick={() => toggleFlag(activeExam.questions[currentQuestionIndex].id)}
                      className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        flaggedQuestions[activeExam.questions[currentQuestionIndex].id]
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Flag className={`w-4 h-4 ${flaggedQuestions[activeExam.questions[currentQuestionIndex].id] ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline font-semibold">نشانه گذاری سوال</span>
                    </button>
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold font-mono">
                      بارم: {activeExam.questions[currentQuestionIndex].points} نمره
                    </span>
                  </div>
                </div>

                {/* Animated Question Text Box */}
                <div className="py-6">
                  <h2 className="text-slate-800 font-bold text-base md:text-lg mb-6 leading-relaxed">
                    {activeExam.questions[currentQuestionIndex].text}
                  </h2>

                  {/* Options render based on type */}
                  {activeExam.questions[currentQuestionIndex].type === 'multiple_choice' && (
                    <div className="space-y-3">
                      {activeExam.questions[currentQuestionIndex].options?.map((option, choiceIdx) => {
                        const qId = activeExam.questions[currentQuestionIndex].id;
                        const isSelected = examAnswers[qId] === choiceIdx.toString();

                        return (
                          <button
                            key={choiceIdx}
                            id={`option_${choiceIdx}`}
                            onClick={() => handleAnswerSelect(qId, choiceIdx.toString())}
                            className={`w-full text-right p-4 rounded-xl border text-sm transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 text-slate-500'
                            }`}>
                              {choiceIdx + 1}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeExam.questions[currentQuestionIndex].type === 'boolean' && (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'صحیح (درست)', value: 'true' },
                        { label: 'غلط (نادرست)', value: 'false' }
                      ].map((opt) => {
                        const qId = activeExam.questions[currentQuestionIndex].id;
                        const isSelected = examAnswers[qId] === opt.value;

                        return (
                          <button
                            key={opt.value}
                            id={`boolean_opt_${opt.value}`}
                            onClick={() => handleAnswerSelect(qId, opt.value)}
                            className={`p-4 rounded-xl border text-center text-sm transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? opt.value === 'true'
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                  : 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-sm">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeExam.questions[currentQuestionIndex].type === 'descriptive' && (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold block">پاسخ تشریحی خود را کامل یادداشت کنید:</label>
                      <textarea
                        id="descriptive_text_input"
                        value={examAnswers[activeExam.questions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleAnswerSelect(activeExam.questions[currentQuestionIndex].id, e.target.value)}
                        placeholder="فرمول‌ها، توضیحات و نتیجه نهایی خود را در این بخش بنویسید..."
                        rows={6}
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-sm leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bot Navigation Controls */}
              <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-6">
                <button
                  id="prev_q_btn"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  سوال قبلی
                </button>
                <div className="text-xs text-slate-400 font-mono">
                  {currentQuestionIndex + 1} از {activeExam.questions.length}
                </div>
                <button
                  id="next_q_btn"
                  disabled={currentQuestionIndex === activeExam.questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  سوال بعدی
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION SUBMIT DIALOG */}
      <AnimatePresence>
        {showSubmitConfirm && activeExam && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setShowSubmitConfirm(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-lg">آیا مایل به پایان آزمون و ثبت نهایی هستید؟</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  پس از ثبت، دیگر قادر به بازگشت به این آزمون یا اصلاح اطلاعات نخواهید بود. پاسخ‌های شما جهت تصحیح ارسال می‌شود.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-emerald-600 text-sm">
                    {Object.keys(examAnswers).length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">پاسخ‌های داده‌شده</div>
                </div>
                <div>
                  <div className="font-bold text-amber-500 text-sm">
                    {Object.values(flaggedQuestions).filter(Boolean).length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">نشاندارهای باقی‌مانده</div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 text-sm">
                    {activeExam.questions.length - Object.keys(examAnswers).length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">رهاشده بدون پاسخ</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="confirm_submit_btn"
                  onClick={() => handleFinalSubmit(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  بله، ارسال پاسخ‌ها
                </button>
                <button
                  id="cancel_submit_btn"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  خیر، ادامه آزمون
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL SUBMISSION MODAL VIEW */}
      <AnimatePresence>
        {viewingDetailSubmission && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setViewingDetailSubmission(null)}
            />
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl relative z-10 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="font-bold text-slate-800 text-base">{viewingDetailSubmission.examTitle}</span>
                <button 
                  onClick={() => setViewingDetailSubmission(null)}
                  className="text-xs bg-slate-100 p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 font-semibold"
                >
                  بستن
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">نمره نهایی شما:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingDetailSubmission.status === 'pending' ? 'در انتظار بررسی دبیر' : `${viewingDetailSubmission.pointsGained} از ${viewingDetailSubmission.totalPoints}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">وضعیت کل:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingDetailSubmission.status === 'pending' ? 'منتظر تصحیح' : 'تصحیح شده'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">زمان تحویل:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {new Date(viewingDetailSubmission.submittedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">مصحح مربوطه:</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {viewingDetailSubmission.gradedBy || 'سیستم اتوماتیک'}
                  </span>
                </div>
              </div>

              {/* Questions review detailing list */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700">بررسی پاسخ‌ها به تفکیک سوالات:</h4>
                {exams.find(e => e.id === viewingDetailSubmission.examId)?.questions.map((q, idx) => {
                  const studentAns = viewingDetailSubmission.answers[q.id];
                  const qScore = viewingDetailSubmission.scores?.[q.id];
                  const feedbackText = viewingDetailSubmission.feedback?.[q.id];

                  // Calculate simple correctness
                  const isCorrect = q.type !== 'descriptive' && studentAns === q.correctAnswer;
                  const scoreGainedStr = qScore !== undefined ? `${qScore} از ${q.points}` : `سهم بارم: ${q.points}`;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">سوال {idx + 1}: {q.text}</span>
                        <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {scoreGainedStr}
                        </span>
                      </div>

                      {/* Display options for choice questions */}
                      {q.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 bg-slate-50/50 p-2.5 rounded-lg">
                          {q.options?.map((opt, oIdx) => {
                            const isSelected = studentAns === oIdx.toString();
                            const isCorrectAns = q.correctAnswer === oIdx.toString();
                            return (
                              <div 
                                key={oIdx}
                                className={`p-2 rounded-md border text-[11px] ${
                                  isCorrectAns
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium'
                                    : isSelected
                                      ? 'border-rose-300 bg-rose-50 text-rose-950'
                                      : 'border-transparent text-slate-500'
                                }`}
                              >
                                {oIdx + 1}. {opt} 
                                {isCorrectAns && ' (پاسخ کلید)'}
                                {isSelected && !isCorrectAns && ' (انتخاب اشتباه شما)'}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Descriptive/True-False Student selection and teacher key */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/50">
                        <p className="text-slate-600">
                          <strong className="text-slate-800 block mb-1">پاسخ ارائه شده توسط شما:</strong>
                          <span className="font-mono bg-white inline-block w-full p-2.5 border rounded-lg text-slate-800 leading-relaxed">
                            {q.type === 'boolean' 
                              ? studentAns === 'true' ? 'صحیح' : studentAns === 'false' ? 'غلط' : 'پاسخ داده نشده'
                              : studentAns || <span className="text-rose-500 italic font-semibold">بدون پاسخ رها شده است!</span>
                            }
                          </span>
                        </p>

                        {viewingDetailSubmission.status === 'graded' && q.correctAnswer && (
                          <div className="bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50">
                            <strong className="text-indigo-800 block mb-1">راهنمای تصحیح دپارتمان / کلید اصلی:</strong>
                            <span className="text-slate-600 leading-relaxed font-mono">
                              {q.type === 'boolean' 
                                ? q.correctAnswer === 'true' ? 'صحیح (درست)' : 'غلط (نادرست)'
                                : q.correctAnswer
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Display question specific feedback if graded */}
                      {feedbackText && (
                        <div className="p-2.5 bg-yellow-50 text-yellow-800 rounded-lg text-xs border border-yellow-200">
                          <strong>بازخورد و تذکر تبیینی استاد:</strong> {feedbackText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
