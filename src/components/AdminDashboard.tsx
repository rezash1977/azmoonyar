import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, ShieldCheck, Mail, ToggleLeft, ToggleRight, 
  Settings, Server, Activity, UserPlus, Trash, ChevronLeft, 
  Lock, Unlock, BookOpen, AlertCircle, Database, Copy, Check
} from 'lucide-react';
import { User, ActivityLog, UserRole } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  logs: ActivityLog[];
  onAddUser: (user: User) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserGrade: (userId: string, grade: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function AdminDashboard({
  currentUser,
  users,
  logs,
  onAddUser,
  onUpdateUserRole,
  onUpdateUserGrade,
  onDeleteUser
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'database' | 'settings'>('users');
  const [copied, setCopied] = useState(false);

  // Add User Temporary State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserGrade, setNewUserGrade] = useState('دهم تجربی');

  // Global settings state simulation
  const [autoRegister, setAutoRegister] = useState(true);
  const [immediateResults, setImmediateResults] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleAddNewUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('لطفاً نام کامل و ایمیل کاربر را بنویسید.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      alert('این ایمیل قبلاً در سامانه استفاده شده است.');
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      grade: newUserRole === 'student' ? newUserGrade : undefined
    };

    onAddUser(newUser);

    // reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    alert(`کاربر جدید «${newUser.name}» با دسترسی ${newUserRole === 'student' ? 'دانش‌آموز' : newUserRole === 'teacher' ? 'دبیر / معلم' : 'مدیر ادمین'} با موفقیت به سامانه اضافه شد.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6" id="admin_dashboard_root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>مدیریت کل سیستم و نظارت بر پلتفرم</span>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">سطح ادمین ارشد</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">پیکربندی هویت‌ها، مشاهده بلادرنگ سناریوهای پلتفرم و گزارش خطاها</p>
        </div>

        {/* Dash switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 flex-wrap gap-1 md:gap-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'users' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> مدیریت حساب‌ها
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'logs' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> گزارش وقایع (Logs)
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'database' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> ساختار دیتابیس MySQL
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'settings' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> تنظیمات سراسری
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <motion.div
            key="users_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            
            {/* User creation pane */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-850 text-sm border-b pb-2 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" /> ثبت‌نام کاربر جدید با دسترسی دلخواه
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">نام و نام خانوادگی:</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="مثال: امیرحسین کریمی" 
                    className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">ایمیل کاربر:</label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="مثال: amin@example.com" 
                    className="w-full text-xs p-2.5 border rounded-lg focus:outline-hidden text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">نقش دسترسی در پلتفرم:</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 bg-white border rounded-lg focus:outline-hidden"
                  >
                    <option value="student">دانش‌آموز (آزمون‌دهنده)</option>
                    <option value="teacher">دبیر / معلم طراح آزمون</option>
                    <option value="admin">ادمین ارشد سیستم</option>
                  </select>
                </div>

                {newUserRole === 'student' && (
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">پایه / کلاس تحصیلی:</label>
                    <select 
                      value={newUserGrade}
                      onChange={(e) => setNewUserGrade(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border rounded-lg focus:outline-hidden"
                    >
                      <option value="دهم تجربی">دهم تجربی</option>
                      <option value="دهم ریاضی">دهم ریاضی</option>
                      <option value="یازدهم تجربی">یازدهم تجربی</option>
                      <option value="یازدهم ریاضی">یازدهم ریاضی</option>
                      <option value="دوازدهم تجربی">دوازدهم تجربی</option>
                      <option value="دوازدهم ریاضی">دوازدهم ریاضی</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={handleAddNewUser}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors py-2.5 rounded-xl text-xs font-bold cursor-pointer font-semibold"
                >
                  ثبت رسمی کاربر در بانک داده
                </button>
              </div>
            </div>

            {/* Users dynamic table list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
                <span className="font-bold text-slate-850">پروفایل‌های هویت سنجی فعال ({users.length} کاربر)</span>
                <span className="text-[10px] text-slate-400">امکان تغییر نقش یا حذف مستقیم وجود دارد</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-500 font-bold border-b">
                      <th className="p-4">کاربر</th>
                      <th className="p-4">کلاس / سطح</th>
                      <th className="p-4 text-center">نقش کاربری</th>
                      <th className="p-4 text-center">اقدامات مدیریتی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/30">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{usr.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{usr.email}</div>
                        </td>
                        <td className="p-4">
                          {usr.role === 'student' ? (
                            <select
                              value={usr.grade || 'دهم تجربی'}
                              onChange={(e) => onUpdateUserGrade(usr.id, e.target.value)}
                              className="p-1 border rounded bg-white text-slate-700 font-semibold"
                            >
                              <option value="دهم ریاضی">دهم ریاضی</option>
                              <option value="دهم تجربی">دهم تجربی</option>
                              <option value="یازدهم ریاضی">یازدهم ریاضی</option>
                              <option value="یازدهم تجربی">یازدهم تجربی</option>
                              <option value="دوازدهم ریاضی">دوازدهم ریاضی</option>
                              <option value="دوازدهم تجربی">دوازدهم تجربی</option>
                            </select>
                          ) : (
                            <span className="text-slate-400 font-mono italic">غیردانش‌آموز</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={usr.role}
                            onChange={(e) => onUpdateUserRole(usr.id, e.target.value as UserRole)}
                            className={`p-1.5 rounded-lg border font-bold text-[11px] ${
                              usr.role === 'admin' 
                                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                : usr.role === 'teacher' 
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300' 
                                  : 'bg-slate-50 text-slate-750'
                            }`}
                          >
                            <option value="student">دانش‌آموز</option>
                            <option value="teacher">دبیر آزمون</option>
                            <option value="admin">ادمین اصلی</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              if (usr.id === currentUser.id) {
                                alert('نمی‌توانید اکانت خودتان را حذف کنید!');
                                return;
                              }
                              if (confirm(`آیا از حذف کامل «${usr.name}» مطمئن هستید؟`)) {
                                onDeleteUser(usr.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-block"
                            title="حذف حساب"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SYSTEM ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <motion.div
            key="logs_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs"
          >
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
              <strong className="text-slate-800">گزارشات کامل عزل، نصب و فرآیندهای امتحانی سامانه</strong>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Node Database Logging</span>
            </div>

            <div className="divide-y max-h-[460px] overflow-y-auto">
              {logs.map((log) => {
                return (
                  <div key={log.id} className="p-3.5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-slate-700 leading-normal">
                        <strong className="text-slate-900">{log.userName}</strong> 
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm mx-1 font-semibold">
                          {log.userRole === 'admin' ? 'ادمین' : log.userRole === 'teacher' ? 'دبیر' : 'دانش‌آموز'}
                        </span>
                        <span>{log.action}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(log.timestamp).toLocaleDateString('fa-IR')} ساعت {new Date(log.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: SYSTEM GLOBAL CONFIGURATION */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">پیکربندی ساختار پلتفرم</h3>
                <p className="text-xs text-slate-400 mt-1">با روشن یا خاموش کردن گزینه‌های زیر، فرآیند امتحانی را کنترل کنید.</p>
              </div>

              {/* Setting row 1 */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">عضویت خودکار و آزاد</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">دانش‌آموز بدون تایید ادمین بتواند ثبت نام کند</p>
                </div>
                <button
                  onClick={() => setAutoRegister(!autoRegister)}
                  className="text-indigo-600 cursor-pointer"
                >
                  {autoRegister ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                </button>
              </div>

              {/* Setting row 2 */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">نمایش فوری کارنامه‌ها بعد از ثبت</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">سوالات تستی فوراً تصحیح و کارنامه موقت صادر شود</p>
                </div>
                <button
                  onClick={() => setImmediateResults(!immediateResults)}
                  className="text-indigo-600 cursor-pointer"
                >
                  {immediateResults ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                </button>
              </div>

              {/* Setting row 3 */}
              <div className="flex justify-between items-center bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <div>
                  <span className="font-bold text-rose-800 text-xs block">حالت تعمیر و نگهداری (Lockdown)</span>
                  <p className="text-[10px] text-rose-400 mt-0.5">مسدود کردن موقت ورود یا آزمون‌دهی برای ارتقای سیستم</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className="text-rose-600 cursor-pointer"
                >
                  {maintenanceMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-450" />}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">وضعیت ماژول‌های زیرساختی پلتفرم</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="bg-slate-50 p-3.5 rounded-xl border flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">دیتابیس سیستم:</span>
                    <span>MySQL Local-Sync</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">امتحان‌گیرنده مرکزی:</span>
                    <span>فعال و امن (V2)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 text-orange-850 rounded-xl text-xs flex gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  <strong>نکته ادمین:</strong> بهینه سازی همگام‌سازی MySQL با متد تعاملی لوکال برای این نسخه فعال است تا اطلاعات هر دیتابیس به خوبی حفظ شود. تغییرات اعمال شده روی کاربران به محض کلیک ذخیره شده و به طور پویا در تمام داشبوردها منعکس می‌شود.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DATABASE SCHEMA & EXPORTER */}
        {activeTab === 'database' && (
          <motion.div
            key="database_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6 text-right"
          >
            {/* Visual ERD Diagram */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>ساختار ارتباطی پایگاه داده MySQL پیاده‌سازی شده</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  سامانه بر پایه معماری ۵ جدول کلیدی طراحی شده است. روابط زیر چگونگی پیوند هویت‌ها، آزمون‌ها و پاسخنامه‌ها را با کلیدهای خارجی نمایش می‌دهد.
                </p>
              </div>

              {/* Graphic cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* User Table card */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-400 transition-colors">
                  <span className="absolute top-0 left-0 text-[9px] bg-indigo-600 text-white font-mono px-2 py-0.5 rounded-br-lg font-bold">1. users</span>
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold text-slate-800">id</span>
                      <span className="text-[10px] text-indigo-600 font-mono">VARCHAR(50) [PK]</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>name</span>
                      <span className="font-mono text-[9px]">VARCHAR(100)</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>email</span>
                      <span className="font-mono text-[9px] text-amber-600 font-bold">UNIQUE</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>role</span>
                      <span className="font-mono text-[9px]">ENUM(...)</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>password</span>
                      <span className="font-mono text-[9px]">VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between text-slate-350 text-[10px]">
                      <span>grade</span>
                      <span className="font-mono text-[9px]">VARCHAR(50) NULL</span>
                    </div>
                  </div>
                </div>

                {/* Exams Table card */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-400 transition-colors">
                  <span className="absolute top-0 left-0 text-[9px] bg-indigo-600 text-white font-mono px-2 py-0.5 rounded-br-lg font-bold">2. exams</span>
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold text-slate-800">id</span>
                      <span className="text-[10px] text-indigo-600 font-mono">VARCHAR(50) [PK]</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>title</span>
                      <span className="font-mono text-[9px]">VARCHAR(200)</span>
                    </div>
                    <div className="flex justify-between text-slate-550 text-[11px]">
                      <span className="font-bold text-teal-600">creator_id</span>
                      <span className="font-mono text-[9px] text-teal-600">{"[FK -> users.id]"}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>duration</span>
                      <span className="font-mono text-[9px]">INT</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>total_points</span>
                      <span className="font-mono text-[9px]">FLOAT</span>
                    </div>
                    <div className="flex justify-between text-slate-350 text-[10px]">
                      <span>category</span>
                      <span className="font-mono text-[9px]">VARCHAR(50)</span>
                    </div>
                  </div>
                </div>

                {/* Questions Table card */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-400 transition-colors">
                  <span className="absolute top-0 left-0 text-[9px] bg-indigo-600 text-white font-mono px-2 py-0.5 rounded-br-lg font-bold">3. questions</span>
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold text-slate-800">id</span>
                      <span className="text-[10px] text-indigo-600 font-mono">VARCHAR(50) [PK]</span>
                    </div>
                    <div className="flex justify-between text-slate-550 text-[11px]">
                      <span className="font-bold text-teal-600">exam_id</span>
                      <span className="font-mono text-[9px] text-teal-600">{"[FK -> exams.id]"}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>type</span>
                      <span className="font-mono text-[9px]">ENUM(...)</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>text</span>
                      <span className="font-mono text-[9px]">TEXT</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>options</span>
                      <span className="font-mono text-[9px] text-indigo-500">JSON</span>
                    </div>
                    <div className="flex justify-between text-slate-350 text-[10px]">
                      <span>correct_answer</span>
                      <span className="font-mono text-[9px]">VARCHAR(255)</span>
                    </div>
                  </div>
                </div>

                {/* Submissions Table card */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-400 transition-colors">
                  <span className="absolute top-0 left-0 text-[9px] bg-indigo-600 text-white font-mono px-2 py-0.5 rounded-br-lg font-bold">4. submissions</span>
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold text-slate-800">id</span>
                      <span className="text-[10px] text-indigo-600 font-mono">VARCHAR(50) [PK]</span>
                    </div>
                    <div className="flex justify-between text-slate-550 text-[11px]">
                      <span className="font-bold text-teal-600">exam_id</span>
                      <span className="font-mono text-[9px] text-teal-600">[FK]</span>
                    </div>
                    <div className="flex justify-between text-slate-550 text-[11px]">
                      <span className="font-bold text-teal-600">student_id</span>
                      <span className="font-mono text-[9px] text-teal-600">{"[FK -> users.id]"}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>answers</span>
                      <span className="font-mono text-[9px] text-indigo-500">JSON</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>points_gained</span>
                      <span className="font-mono text-[9px]">FLOAT</span>
                    </div>
                    <div className="flex justify-between text-slate-350 text-[10px]">
                      <span>status</span>
                      <span className="font-mono text-[9px]">ENUM('pending','graded')</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Informational connection description */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-150 text-indigo-950 rounded-2xl text-xs space-y-2 leading-relaxed">
                <span className="font-bold text-indigo-900 block flex items-center gap-1">
                  <Server className="w-4 h-4" />
                  <span>دیتابیس در محیط لوکال و سرور اصلی سی‌پنل چگونه کار می‌کند؟</span>
                </span>
                <p>
                  در حال حاضر جهت تست روان و سرعت بالا، اطلاعات کل سامانه درون حافظه بومی مرورگر شما (<code className="font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-100 font-mono">localStorage</code>) پیاده‌سازی و همگام‌سازی می‌شود. اما برای دپلوی در <strong>سی‌پنل (cPanel)</strong> و راه‌اندازی با زبان‌های بک‌اندی مثل PHP یا Node.js، شما دقیقاً به جداول ساختاریافته MySQL بالا نیاز دارید. سیستم احراز هویت با انطباق مستقیم هش کلمه عبور وارد شده با این دیتابیس کار خواهد کرد.
                </p>
              </div>
            </div>

            {/* SQL Script Copier Card */}
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    <span>کدهای راه‌اندازی پایگاه داده در MySQL (مخصوص ایمپورت به PhpMyAdmin)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">کد زیر را کپی کرده و در تب SQL دیتابیس خود در سی‌پنل اجرا کنید.</p>
                </div>

                <button
                  onClick={() => {
                    const sqlCode = `-- اسکریپت ساخت دیتابیس آزمون‌یار برای سی‌پنل (MySQL)

-- 1. جدول کاربران
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`role\` ENUM('admin', 'teacher', 'student') NOT NULL,
  \`grade\` VARCHAR(50) DEFAULT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 2. جدول آزمون‌ها
CREATE TABLE IF NOT EXISTS \`exams\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(200) NOT NULL,
  \`description\` TEXT,
  \`creator_id\` VARCHAR(50) NOT NULL,
  \`creator_name\` VARCHAR(100) NOT NULL,
  \`duration\` INT NOT NULL,
  \`passing_score\` FLOAT NOT NULL,
  \`total_points\` FLOAT NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`start_date\` DATETIME NOT NULL,
  \`end_date\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`creator_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 3. جدول سوالات
CREATE TABLE IF NOT EXISTS \`questions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`exam_id\` VARCHAR(50) NOT NULL,
  \`type\` ENUM('multiple_choice', 'boolean', 'descriptive') NOT NULL,
  \`text\` TEXT NOT NULL,
  \`options\` JSON DEFAULT NULL,
  \`correct_answer\` VARCHAR(255) DEFAULT NULL,
  \`points\` FLOAT NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 4. جدول پاسخنامه‌ها
CREATE TABLE IF NOT EXISTS \`submissions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`exam_id\` VARCHAR(50) NOT NULL,
  \`exam_title\` VARCHAR(200) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`student_name\` VARCHAR(100) NOT NULL,
  \`answers\` JSON NOT NULL,
  \`points_gained\` FLOAT DEFAULT NULL,
  \`total_points\` FLOAT NOT NULL,
  \`status\` ENUM('pending', 'graded') DEFAULT 'pending',
  \`submitted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`graded_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\` (\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`student_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- نمونه رکوردهای اولیه جهت ورود نمونه:
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`role\`, \`password\`) VALUES
('1', 'علیرضا کریمی', 'admin@azmoon.com', 'admin', 'admin123'),
('2', 'استاد مریم حسینی', 'hoseini@azmoon.com', 'teacher', 'teacher123');`;
                    navigator.clipboard.writeText(sqlCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'کد کپی شد!' : 'کپی اسکریپت SQL'}</span>
                </button>
              </div>

              {/* Code display block */}
              <div className="relative font-mono text-[11px] p-4 bg-slate-950 rounded-2xl overflow-x-auto max-h-[350px] border border-slate-800 text-left" dir="ltr text-indigo-200">
                <pre className="text-emerald-400">
                  {`-- اسکریپت ساخت دیتابیس آزمون‌یار برای سی‌پنل (MySQL)

-- 1. جدول کاربران (users)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`role\` ENUM('admin', 'teacher', 'student') NOT NULL,
  \`grade\` VARCHAR(50) DEFAULT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 2. جدول آزمون‌ها (exams)
CREATE TABLE IF NOT EXISTS \`exams\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(200) NOT NULL,
  \`description\` TEXT,
  \`creator_id\` VARCHAR(50) NOT NULL,
  \`creator_name\` VARCHAR(100) NOT NULL,
  \`duration\` INT NOT NULL,
  \`passing_score\` FLOAT NOT NULL,
  \`total_points\` FLOAT NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`start_date\` DATETIME NOT NULL,
  \`end_date\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`creator_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 3. جدول سوالات (questions)
CREATE TABLE IF NOT EXISTS \`questions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`exam_id\` VARCHAR(50) NOT NULL,
  \`type\` ENUM('multiple_choice', 'boolean', 'descriptive') NOT NULL,
  \`text\` TEXT NOT NULL,
  \`options\` JSON DEFAULT NULL,
  \`correct_answer\` VARCHAR(255) DEFAULT NULL,
  \`points\` FLOAT NOT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
