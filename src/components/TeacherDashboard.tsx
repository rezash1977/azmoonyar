import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, List, Edit2, Check, CheckSquare, PlusCircle, Trash, Award, 
  UserCheck, Users, HelpCircle, FileText, CheckCircle2, XCircle, 
  MessageSquare, ChevronRight, BarChart2, CalendarClock
} from 'lucide-react';
import { Exam, Question, Submission, User, QuestionType } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  exams: Exam[];
  submissions: Submission[];
  onAddExam: (exam: Exam) => void;
  onGradeSubmission: (
    submissionId: string, 
    scores: Record<string, number>, 
    feedback: Record<string, string>, 
    gradedBy: string
  ) => void;
}

export default function TeacherDashboard({ 
  currentUser, 
  exams, 
  submissions, 
  onAddExam, 
  onGradeSubmission 
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'exams_list' | 'create_exam' | 'grading' | 'statistics'>('exams_list');

  // Exam Builder States
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examCategory, setExamCategory] = useState('ریاضی');
  const [examDuration, setExamDuration] = useState(45);
  const [examPassingScore, setExamPassingScore] = useState(10);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);

  // Individual Question Temporary State (inside builder)
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qText, setQText] = useState('');
  const [qPoints, setQPoints] = useState(5);
  // Options for multiple choice (Temporary state)
  const [mcOptions, setMcOptions] = useState<string[]>(['', '']);
  const [mcCorrectOption, setMcCorrectOption] = useState('0');
  const [booleanCorrect, setBooleanCorrect] = useState('true');
  const [descriptiveCorrectAnswer, setDescriptiveCorrectAnswer] = useState('');

  // Sorter / Grading Portal State
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<Submission | null>(null);
  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [manualFeedback, setManualFeedback] = useState<Record<string, string>>({});

  // Reset core questions builder
  const resetQuestionForm = () => {
    setQText('');
    setQPoints(5);
    setMcOptions(['', '']);
    setMcCorrectOption('0');
    setBooleanCorrect('true');
    setDescriptiveCorrectAnswer('');
  };

  const handleAddQuestionToDraft = () => {
    if (!qText.trim()) {
      alert('لطفاً متن سوال را وارد کنید.');
      return;
    }

    const newQuestion: Question = {
      id: `q_draft_${Date.now()}`,
      type: qType,
      text: qText.trim(),
      points: Number(qPoints) || 1,
    };

    if (qType === 'multiple_choice') {
      const filteredOptions = mcOptions.map(opt => opt.trim()).filter(Boolean);
      if (filteredOptions.length < 2) {
        alert('لطفا حداقل دو گزینه تکمیل شده برای سوال تستی ثبت کنید.');
        return;
      }
      newQuestion.options = filteredOptions;
      newQuestion.correctAnswer = mcCorrectOption;
    } else if (qType === 'boolean') {
      newQuestion.correctAnswer = booleanCorrect;
    } else if (qType === 'descriptive') {
      newQuestion.correctAnswer = descriptiveCorrectAnswer.trim() || 'راهنمای تصحیح توسط معلم ثبت نشده است.';
    }

    setExamQuestions(prev => [...prev, newQuestion]);
    resetQuestionForm();
  };

  const handleRemoveQuestionFromDraft = (qId: string) => {
    setExamQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handlePublishExam = () => {
    if (!examTitle.trim() || !examDesc.trim()) {
      alert('سلامت کامل اطلاعات! لطفا عنوان و جزئیات آزمون را به دقت وارد کنید.');
      return;
    }
    if (examQuestions.length === 0) {
      alert('آزمون حداقل باید دارای یک سوال مجزا باشد.');
      return;
    }

    const totalPoints = examQuestions.reduce((sum, q) => sum + q.points, 0);

    const now = new Date();
    const endDays = new Date();
    endDays.setDate(now.getDate() + 14); // 2 weeks active duration

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title: examTitle.trim(),
      description: examDesc.trim(),
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      duration: Number(examDuration) || 30,
      passingScore: Number(examPassingScore) || 10,
      totalPoints,
      category: examCategory,
      startDate: now.toISOString(),
      endDate: endDays.toISOString(),
      questions: examQuestions
    };

    onAddExam(newExam);
    
    // reset builder state
    setExamTitle('');
    setExamDesc('');
    setExamCategory('ریاضی');
    setExamDuration(45);
    setExamPassingScore(10);
    setExamQuestions([]);
    setActiveTab('exams_list');
    
    alert(`آزمون «${newExam.title}» با مجموع نمراتی ${totalPoints} تشکیل و منتشر شد.`);
  };

  // Submission review loading
  const startGradingSubmission = (sub: Submission) => {
    setSelectedSubmissionForGrading(sub);
    
    // Prefill scores
    const prepopulatedScores: Record<string, number> = {};
    const prepopulatedFeedback: Record<string, string> = {};
    
    const relatedExam = exams.find(e => e.id === sub.examId);
    
    if (relatedExam) {
      relatedExam.questions.forEach(q => {
        if (q.type === 'multiple_choice' || q.type === 'boolean') {
          // Automatic calculated
          const isCorrect = sub.answers[q.id] === q.correctAnswer;
          prepopulatedScores[q.id] = isCorrect ? q.points : 0;
        } else {
          // Descriptive - prefill with current or 0
          prepopulatedScores[q.id] = sub.scores?.[q.id] || 0;
        }
        prepopulatedFeedback[q.id] = sub.feedback?.[q.id] || '';
      });
    }

    setManualScores(prepopulatedScores);
    setManualFeedback(prepopulatedFeedback);
  };

  const handleManualScoringSubmit = () => {
    if (!selectedSubmissionForGrading) return;

    onGradeSubmission(
      selectedSubmissionForGrading.id,
      manualScores,
      manualFeedback,
      currentUser.name
    );

    setSelectedSubmissionForGrading(null);
    alert('تصحیح برگه با موفقیت ذخیره شد و نمره متقاضی پدیده آمد.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6" id="teacher_dashboard_root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>پنل اختصاصی اساتید و طراحان سوال</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">پنل دبیری: {currentUser.name}</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">محیط طراحی آزمون، تصحیح برگه دانش‌آموزان و مانیتورینگ نمرات کلاس</p>
        </div>

        {/* Dashboard Switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('exams_list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'exams_list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            آزمون‌های تعریف شده
          </button>
          <button
            onClick={() => setActiveTab('create_exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'create_exam' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            طراحی آزمون جدید
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'grading' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            تصحیح برگه‌ها
            {submissions.filter(s => s.status === 'pending').length > 0 && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'statistics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            آنالیز نمرات کلاسی
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: LIST EXAMS */}
        {activeTab === 'exams_list' && (
          <motion.div
            key="exams_list_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
              <h2 className="text-sm font-bold text-slate-800">بانک اطلاعاتی آزمون‌های فعال در دسترسی دانش‌آموزان</h2>
              <button 
                onClick={() => setActiveTab('create_exam')}
                className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> طراحی آزمون نوین
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exams.map((exam) => {
                const examScores = submissions.filter(s => s.examId === exam.id && s.status === 'graded');
                const avgScore = examScores.length > 0 
                  ? (examScores.reduce((sum, s) => sum + (s.pointsGained || 0), 0) / examScores.length).toFixed(1)
                  : 'داده کافی نیست';

                return (
                  <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {exam.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">سازنده: {exam.creatorName}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{exam.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{exam.description}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block pb-0.5">مدت زمان:</span>
                        <strong className="text-slate-700">{exam.duration} دقیقه</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block pb-0.5">تعداد کل سوالات:</span>
                        <strong className="text-slate-700">{exam.questions.length} سوال</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block pb-0.5">حداقل نمره‌ قبولی:</span>
                        <strong className="text-emerald-600">{exam.passingScore} از {exam.totalPoints}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block pb-0.5">میانگین کلاسی:</span>
                        <strong className="text-indigo-600">{avgScore}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: CREATE EXAM PORTAL */}
        {activeTab === 'create_exam' && (
          <motion.div
            key="create_exam_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left/Middle Pane: Core Exam Details & Question Adder Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Form 1: General Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">پوشه اول: اطلاعات کلی و پارامترهای اصلی آزمون</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7">
                    <label className="text-xs text-slate-500 font-bold block mb-1">عنوان کامل آزمون:</label>
                    <input 
                      type="text" 
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="مانند: ریاضی نهم - مبحث مساحت و حجم" 
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="md:col-span-5">
                    <label className="text-xs text-slate-500 font-bold block mb-1">موضوع/دسته بندی:</label>
                    <select 
                      value={examCategory}
                      onChange={(e) => setExamCategory(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="ریاضی">ریاضی</option>
                      <option value="فیزیک">فیزیک</option>
                      <option value="شیمی">شیمی</option>
                      <option value="ادبیات">ادبیات</option>
                      <option value="زبان خارجه">زبان خارجه</option>
                      <option value="زیست‌شناسی">زیست‌شناسی</option>
                    </select>
                  </div>

                  <div className="md:col-span-12">
                    <label className="text-xs text-slate-500 font-bold block mb-1">توضیحات راهنما برای دانش‌آموز:</label>
                    <textarea 
                      value={examDesc}
                      onChange={(e) => setExamDesc(e.target.value)}
                      placeholder="اینجا بنویسید که دانش‌آموز قبل از آزمون باید چه مباحثی را مطالعه کرده باشد یا چه قوانینی حاکم است..." 
                      rows={3}
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="text-xs text-slate-500 font-bold block mb-1">مدت زمان پاسخگویی (به دقیقه):</label>
                    <input 
                      type="number" 
                      value={examDuration}
                      onChange={(e) => setExamDuration(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="text-xs text-slate-500 font-bold block mb-1">حداقل نمره‌ قبولی (حدنصاب):</label>
                    <input 
                      type="number" 
                      value={examPassingScore}
                      onChange={(e) => setExamPassingScore(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form 2: Direct Interactive Question Builder */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5 text-indigo-700">
                  <PlusCircle className="w-4 h-4" /> طراحی سوال تعاملی و افزودن به لیست پیش‌نویس
                </h3>

                <div className="space-y-4">
                  
                  {/* Select Q Type & Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">پیکربندی نوع سوال:</label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {[
                          { label: 'تستی چهار گزینه‌ای', type: 'multiple_choice' },
                          { label: 'صحیح / غلط', type: 'boolean' },
                          { label: 'تشریحی آزاد', type: 'descriptive' }
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setQType(item.type as QuestionType);
                              resetQuestionForm();
                            }}
                            className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                              qType === item.type ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">بارم سوال (سهم پاسخ صحیح):</label>
                      <input 
                        type="number" 
                        value={qPoints}
                        onChange={(e) => setQPoints(Number(e.target.value))}
                        className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        min={1}
                        max={20}
                      />
                    </div>
                  </div>

                  {/* Main Input Text */}
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">صورت سوال:</label>
                    <textarea 
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="متن سوال را خیلی واضح و منسجم یادداشت کنید..." 
                      rows={3.5}
                      className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Rendering customization depending on chosen type */}
                  {qType === 'multiple_choice' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">گزینه‌ها را وارد کنید و کلید درست را مشخص کنید:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setMcOptions(prev => [...prev, ''])}
                            className="text-[10px] bg-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-semibold px-2 py-1 rounded-md"
                          >
                            + گزینه‌ جدید
                          </button>
                          {mcOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setMcOptions(prev => prev.slice(0, -1))}
                              className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-2 py-1 rounded-md"
                            >
                              حذف آخرین
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mcOptions.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                            <input
                              type="radio"
                              name="mc_correct_key"
                              checked={mcCorrectOption === oIdx.toString()}
                              onChange={() => setMcCorrectOption(oIdx.toString())}
                              className="w-3.5 h-3.5 text-indigo-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMcOptions(prev => {
                                  const updated = [...prev];
                                  updated[oIdx] = val;
                                  return updated;
                                });
                              }}
                              placeholder={`گزینه ${oIdx + 1}...`}
                              className="w-full text-xs p-2 bg-white border rounded-lg focus:outline-hidden"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold block italic">علامت دایره سمت راست گزینه به معنای تعریف آن به عنوان کلید نهایی پاسخنامه است.</span>
                    </div>
                  )}

                  {qType === 'boolean' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">گزینه صحیح علمی کدام است؟</span>
                      <div className="flex bg-white p-1 rounded-lg border gap-2">
                        <button
                          type="button"
                          onClick={() => setBooleanCorrect('true')}
                          className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
                            booleanCorrect === 'true' ? 'bg-emerald-500 text-white' : 'text-slate-500'
                          }`}
                        >
                          صحیح (درست)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBooleanCorrect('false')}
                          className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
                            booleanCorrect === 'false' ? 'bg-rose-500 text-white' : 'text-slate-500'
                          }`}
                        >
                          غلط (نادرست)
                        </button>
                      </div>
                    </div>
                  )}

                  {qType === 'descriptive' && (
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-bold block">دستورالعمل تصحیح یا جواب مرجع (اختیاری):</label>
                      <textarea 
                        value={descriptiveCorrectAnswer}
                        onChange={(e) => setDescriptiveCorrectAnswer(e.target.value)}
                        placeholder="معیارهای تصحیح و عبارت کلیدی نهایی را جهت تسهیل نمره‌گذاری بعدی برای خود ثبت کنید..." 
                        rows={2.5}
                        className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Add Action */}
                  <button
                    type="button"
                    onClick={handleAddQuestionToDraft}
                    className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all py-2.5 rounded-xl text-xs font-bold font-semibold cursor-pointer"
                  >
                    افزودن این سوال به لیست کل آزمون
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Live preview draft & actions */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 sticky top-4">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-xs">سوالات افزوده شده ({examQuestions.length})</h4>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                    جمع نمره: {examQuestions.reduce((sum, q) => sum + q.points, 0)}
                  </span>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {examQuestions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <HelpCircle className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                      <p className="text-xs">هیچ سوالی به لیست اضافه نشده است.</p>
                    </div>
                  ) : (
                    examQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-start text-xs border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 block">سوال {idx + 1}. ({q.type === 'multiple_choice' ? 'تستی' : q.type === 'boolean' ? 'صحیح غلط' : 'تشریحی'})</span>
                          <p className="text-slate-500 font-medium text-[11px] line-clamp-1">{q.text}</p>
                          <span className="text-[10px] text-slate-400">سهم نمره: {q.points}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromDraft(q.id)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-all cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePublishExam}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> انتشار نهایی کل آزمون
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: GRADING EXAM PORTAL */}
        {activeTab === 'grading' && (
          <motion.div
            key="grading_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {!selectedSubmissionForGrading ? (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs">لیست برگه‌های پاسخ ارسال شده توسط محصلین جهت بررسی و ثبت کارنامه</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                    کل کتب تحویل شده: {submissions.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold border-b">
                        <th className="p-4">نام دانش‌آموز</th>
                        <th className="p-4">نام آزمون</th>
                        <th className="p-4">زمان تحویل</th>
                        <th className="p-4 text-center">وضعیت نمره‌گذاری</th>
                        <th className="p-4 text-center">نمره کل ثبت شده</th>
                        <th className="p-4 text-center">اقدام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/20">
                          <td className="p-4 font-bold text-slate-800">{sub.studentName}</td>
                          <td className="p-4 text-slate-700 font-medium">{sub.examTitle}</td>
                          <td className="p-4 text-slate-500 font-mono">
                            {new Date(sub.submittedAt).toLocaleDateString('fa-IR')} - {new Date(sub.submittedAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="p-4 text-center">
                            {sub.status === 'pending' ? (
                              <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-bold">
                                منتظر بررسی (طاهر تشریحی)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                                تصحیح شده کتبی
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold font-mono">
                            {sub.status === 'pending' ? (
                              <span className="text-slate-400">محاسبه نشده</span>
                            ) : (
                              `${sub.pointsGained} از ${sub.totalPoints}`
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => startGradingSubmission(sub)}
                              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all px-4 py-2 rounded-xl text-xs font-bold cursor-pointer font-semibold"
                            >
                              {sub.status === 'pending' ? 'بررسی برگه و تصحیح' : 'مشاهده مجدد و ویرایش'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* INDIVIDUAL INTERACTIVE SCORING PORTAL WINDOW */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Left side static diagnostic metadata */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <button
                    onClick={() => setSelectedSubmissionForGrading(null)}
                    className="w-full text-center py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    بازگشت به لیست کلی برگه‌ها
                  </button>

                  <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-3">
                    <h4 className="font-bold text-slate-800">مشخصات برگه کنونی:</h4>
                    <div>
                      <span className="text-slate-400">مصحح:</span>
                      <strong className="text-slate-700 block mt-0.5">{currentUser.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">دانش‌آموز مربوطه:</span>
                      <strong className="text-slate-700 block mt-0.5">{selectedSubmissionForGrading.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">عنوان آزمون آزمایشی:</span>
                      <strong className="text-indigo-700 block mt-0.5">{selectedSubmissionForGrading.examTitle}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleManualScoringSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-5 h-5" /> ثبت نهایی تصحیح برگه
                  </button>
                </div>

                {/* Question index breakdown, editable scores */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">تصحیح دستی و تبیین نمرات تشریحی</h3>
                    <p className="text-xs text-slate-400 mt-1">سوالات تستی بصورت اتوماتیک تصحیح شده‌اند؛ لطفاً پاسخ‌های تشریحی را طبق نمره‌گذاری زیر ارزیابی کنید.</p>
                  </div>

                  <div className="space-y-6">
                    {exams.find(e => e.id === selectedSubmissionForGrading.examId)?.questions.map((q, idx) => {
                      const studentAns = selectedSubmissionForGrading.answers[q.id];
                      const isAutoCorrect = q.type !== 'descriptive' && studentAns === q.correctAnswer;
                      const isDescriptive = q.type === 'descriptive';

                      return (
                        <div key={q.id} className="p-5 border border-slate-150 rounded-2xl space-y-3 text-xs bg-slate-50/20">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="font-bold text-slate-800">سوال {idx + 1}. {q.text}</span>
                              <span className="text-[10px] block font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 w-max rounded-md mt-1">
                                نوع سوال: {q.type === 'multiple_choice' ? 'تستی' : q.type === 'boolean' ? 'صحیح غلط' : 'تشریحی آزاد'}
                              </span>
                            </div>

                            {/* Scoring Block */}
                            <div className="flex gap-2 items-center min-w-[150px] justify-end">
                              <span className="text-[10px] font-bold text-slate-400">نمره این سوال:</span>
                              <input 
                                type="number" 
                                value={manualScores[q.id] !== undefined ? manualScores[q.id] : 0}
                                disabled={!isDescriptive}
                                onChange={(e) => {
                                  const val = Math.min(q.points, Math.max(0, Number(e.target.value)));
                                  setManualScores(prev => ({ ...prev, [q.id]: val }));
                                }}
                                className={`w-14 text-center p-1.5 rounded-md text-xs font-bold border ${
                                  !isDescriptive ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white text-indigo-700 border-indigo-300'
                                }`}
                                min={0}
                                max={q.points}
                              />
                              <span className="text-slate-400">از {q.points}</span>
                            </div>
                          </div>

                          {/* Student Answer view */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex items-center gap-1">
                              <span className="text-indigo-600 font-bold">پاسخ ارائه شده‌ی محصل:</span>
                              {!isDescriptive && (
                                isAutoCorrect 
                                  ? <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 text-[10px]"><Check className="w-3 h-3" /> پاسخ کاملا صحیح</span>
                                  : <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 text-[10px]"><XCircle className="w-3 h-3" /> انتخاب نادرست</span>
                              )}
                            </div>
                            <p className="font-mono text-slate-700 text-[11px] leading-relaxed break-words bg-slate-50/50 p-3 rounded-lg">
                              {q.type === 'boolean' 
                                ? studentAns === 'true' ? 'صحیح' : studentAns === 'false' ? 'غلط' : 'پاسخ داده نشده'
                                : studentAns || <span className="text-rose-500 italic font-semibold">بدون پاسخ رها شده است!</span>
                              }
                            </p>
                          </div>

                          {/* Teacher answer guide */}
                          {q.correctAnswer && (
                            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-150 text-[11px] text-slate-600">
                              <strong className="text-indigo-800">راهنما و پاسخ مرجع کلید:</strong> {q.correctAnswer}
                            </div>
                          )}

                          {/* Input feedback comment */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">بازخورد و نکات اصلاحی شما روی این سوال:</label>
                            <input 
                              type="text" 
                              value={manualFeedback[q.id] || ''}
                              onChange={(e) => setManualFeedback(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="مثال: روش مشتق‌گیری عالی است ولی در محاسبه انتهایی خطا داشتید..." 
                              className="w-full text-xs p-2 border rounded-lg focus:outline-hidden bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: STATISTICS & GRADES CLASS OVERVIEW */}
        {activeTab === 'statistics' && (
          <motion.div
            key="statistics_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Class overview metrics summary */}
            <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">شاخص‌های بهینه‌سازی تحصیلی کلاسی</h3>

              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/50 rounded-xl">
                  <div className="text-indigo-600 text-xs font-bold">نرخ قبولی نهایی:</div>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                    {submissions.length > 0 
                      ? Math.round((submissions.filter(s => s.status === 'graded' && (s.pointsGained || 0) >= (s.totalPoints / 2)).length / submissions.length) * 100)
                      : 0}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">درصد محصلینی که نمره بالای ۵۰٪ دریافت کردند</span>
                </div>

                <div className="p-4 bg-emerald-50/40 rounded-xl">
                  <div className="text-emerald-700 text-xs font-bold">پاسخ‌های تصحیح شده:</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {submissions.filter(s => s.status === 'graded').length} از {submissions.length} برگه
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">مشاهده حجم باقی‌مانده نیازمند نمره‌گذاری</span>
                </div>
              </div>
            </div>

            {/* Middle/Right: Charts and tables explaining grade lists per student */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">عملکرد دانش‌آموزان به تفکیک</h3>
                <p className="text-xs text-slate-400 mt-1">لیست تراز دانش‌آموزان روی آخرین برگه‌های تصحیح شده در قالب بارم</p>
              </div>

              {submissions.filter(s => s.status === 'graded').length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-1 bg-slate-50 rounded-2xl">
                  <BarChart2 className="w-10 h-10 mx-auto text-slate-300 opacity-70 animate-pulse" />
                  <p className="text-xs">هیچ برگه تصحیح شده‌ای ثبت نشده است.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.filter(s => s.status === 'graded').map((sub) => {
                    const pct = Math.round(((sub.pointsGained || 0) / sub.totalPoints) * 100);
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{sub.studentName} - {sub.examTitle}</span>
                          <span className="font-bold text-indigo-700 font-mono">{sub.pointsGained} از {sub.totalPoints} ({pct}٪)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct >= 60 ? 'bg-indigo-600' : 'bg-orange-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
