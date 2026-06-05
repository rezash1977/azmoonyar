import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, Mail, User, GraduationCap, Eye, EyeOff, 
  ArrowLeft, UserCheck, AlertCircle, Database, HelpCircle, 
  Sparkles, CheckCircle2, BookOpen
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface LoginPortalProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
  onRegister: (newUser: UserType) => void;
}

export default function LoginPortal({ users, onLogin, onRegister }: LoginPortalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [grade, setGrade] = useState('دهم تجربی');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-configured accounts for testing ease
  const demoAccounts = [
    { name: 'مدیر کل (ادمین)', email: 'admin@azmoon.com', pw: 'admin123', role: 'admin' },
    { name: 'استاد حسینی (دبیر)', email: 'hoseini@azmoon.com', pw: 'teacher123', role: 'teacher' },
    { name: 'امیررضا علوی (دانش‌آموز)', email: 'alavi@azmoon.com', pw: 'student123', role: 'student' }
  ];

  const handleDemoFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pw);
    setIsSignUp(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('لطفاً تمامی فیلدهای الزامی را پر کنید.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('لطفاً نام کامل خود را وارد کنید.');
        return;
      }
      if (password.length < 6) {
        setError('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
        return;
      }

      // Check if email already exists
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (exists) {
        setError('کاربری با این ایمیل هم‌اکنون در سیستم موجود است.');
        return;
      }

      const newUser: UserType = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        grade: role === 'student' ? grade : undefined,
        password: password
      };

      onRegister(newUser);
      setSuccess('حساب کاربری شما با موفقیت ایجاد شد! در حال ورود به پنل...');
      setTimeout(() => {
        onLogin(newUser);
      }, 1200);

    } else {
      // Login flow
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      
      if (!foundUser) {
        setError('کاربری با این نشانی ایمیل یافت نشد.');
        return;
      }

      // If user has a password set, verify it. Otherwise let them in for backward mock-compat
      if (foundUser.password && foundUser.password !== password) {
        setError('کلمه عبور وارد شده نادرست است.');
        return;
      }

      setSuccess(`خوش آمدید، ${foundUser.name}! در حال بارگذاری پنل کاربری...`);
      setTimeout(() => {
        onLogin(foundUser);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="auth_portal_container">
      
      {/* LEFT SIDE: EDUCATIONAL DECORATIVE PANEL */}
      <div className="lg:col-span-5 space-y-6 text-right order-last lg:order-first">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-indigo-500/20 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle glowing elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 py-1 px-3 rounded-full text-xs font-semibold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پلتفرم آزمون‌یار هوشمند مدارس</span>
            </div>

            <h2 className="text-2xl font-bold leading-snug">
              سامانه سنجش و برگزاری آزمون‌های هماهنگ کشوری
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              پلتفرم مدرن و پویا جهت برپایی بدون دغدغه آزمون‌های کلاسی، ترمیک و سراسری با کنترل کامل روی نمره‌دهی تشریحی، لاگ وقایع و ساختارسازی پایگاه‌داده.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="space-y-3.5 pt-4 text-xs font-medium border-t border-slate-800 relative z-10">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-slate-200">
                <span className="font-bold text-white block">احراز هویت چندنقشی یکپارچه</span>
                <span className="text-[10px] text-slate-400">ورود تفکیک‌شده مجزا برای دانش‌آموزان، معلمان و ادمین‌های فناوری مجمع</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-slate-200">
                <span className="font-bold text-white block">آماده برای دیتابیس MySQL و سرور cPanel</span>
                <span className="text-[10px] text-slate-400">امکان درون‌ریزی مستقیم جداول SQL بومی‌سازی شده به هاست‌های لینوکسی اشتراکی</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-slate-200">
                <span className="font-bold text-white block">بک‌آپ گیری خودکار در مرورگر (LocalStorage)</span>
                <span className="text-[10px] text-slate-400">حفظ اطلاعات کاربری و آزمون‌ها حتی در صورت بروز اتصال ضعیف اینترنت</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Section info */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/10 space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Database className="w-4 h-4" />
              <span>پیش‌نمایش سریع حساب‌های آزمایشی:</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoFill(acc)}
                  className="w-full text-[11px] p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-right flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:bg-emerald-400 transition-colors" />
                    <span className="font-semibold">{acc.name}</span>
                  </div>
                  <span className="text-[10px] text-indigo-300/80 font-mono" dir="ltr">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: INTERACTIVE FORM CONTAINER */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-lg bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 relative">
          
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSignUp ? 'ایجاد حساب کاربری جدید' : 'ورود به سامانه آزمون‌یار'}
            </h1>
            <p className="text-xs text-slate-400">
              {isSignUp 
                ? 'مشخصات خود را برای دسترسی فوری وارد نمایید' 
                : 'برای دسترسی به آزمون‌ها و پنل مدیریت، مشخصات خود را بنویسید'}
            </p>
          </div>

          {/* ERRORS & SUCCESSES */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 font-bold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 font-bold"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            
            {/* SIGN UP FIELD: FULL NAME */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="text-xs text-slate-500 font-bold block">نام و نام خانوادگی:</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 r-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علی محمدی"
                    className="w-full text-xs pr-11 pl-4 py-3 border border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-hidden bg-slate-50/30 font-medium"
                  />
                </div>
              </motion.div>
            )}

            {/* EMAIL ADDR */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">نشانی ایمیل:</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 r-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pr-11 pl-4 py-3 border border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-hidden bg-slate-50/30 text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">کلمه عبور (پسورد):</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 r-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs pr-11 pl-11 py-3 border border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-hidden bg-slate-50/30 text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* SIGN UP ROLE & GRADE SPECIFIC */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">نوع کاربری (نقش):</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full text-xs p-2.5 border border-slate-200 focus:border-indigo-600 rounded-xl bg-white focus:outline-hidden font-semibold text-slate-700"
                    >
                      <option value="student">دانش‌آموز</option>
                      <option value="teacher">دبیر / معلم</option>
                      <option value="admin">مدیر (ادمین)</option>
                    </select>
                  </div>

                  {role === 'student' ? (
                    <div>
                      <label className="text-xs text-slate-500 font-bold block mb-1">مقطع / پایه تحصیلی:</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 focus:border-indigo-600 rounded-xl bg-white focus:outline-hidden font-semibold text-slate-700"
                      >
                        <option value="دهم ریاضی">دهم ریاضی</option>
                        <option value="دهم تجربی">دهم تجربی</option>
                        <option value="دهم انسانی">دهم انسانی</option>
                        <option value="یازدهم ریاضی">یازدهم ریاضی</option>
                        <option value="یازدهم تجربی">یازدهم تجربی</option>
                        <option value="یازدهم انسانی">یازدهم انسانی</option>
                        <option value="دوازدهم ریاضی">دوازدهم ریاضی</option>
                        <option value="دوازدهم تجربی">دوازدهم تجربی</option>
                        <option value="دوازدهم انسانی">دوازدهم انسانی</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-end text-[10px] text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-xl font-bold leading-normal">
                      دسترسی دبیر/ادمین نیازمند تائید مدیریت است. برای شبیه‌سازی هم‌اکنون باز است.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* BUTTON ACTION */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isSignUp ? 'ثبت نام و ایجاد حساب کاربری' : 'ورود امن به سامانه'}</span>
            </button>
          </form>

          {/* TOGGLE LINK */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5 text-xs">
            <span className="text-slate-400">
              {isSignUp ? 'قبلا عضو شده‌اید؟ ' : 'هنوز حساب کاربری ندارید؟ '}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? 'ورود به حساب کاربری' : 'ثبت نام رایگان جدید'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
