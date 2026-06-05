import { User, Exam, Submission, ActivityLog } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'علیرضا کریمی', email: 'admin@azmoon.com', role: 'admin', password: 'admin123' },
  { id: '2', name: 'استاد مریم حسینی', email: 'hoseini@azmoon.com', role: 'teacher', password: 'teacher123' },
  { id: '3', name: 'امیررضا علوی', email: 'alavi@azmoon.com', role: 'student', grade: 'یازدهم تجربی', password: 'student123' },
  { id: '4', name: 'سارا رضایی', email: 'sara@azmoon.com', role: 'student', grade: 'دهم ریاضی', password: 'student123' },
  { id: '5', name: 'محمد امین محمدی', email: 'amin@azmoon.com', role: 'student', grade: 'یازدهم تجربی', password: 'student123' },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam_1',
    title: 'آزمون فیزیک (۲) - حرکت بر خط راست',
    description: 'این آزمون شامل مباحث حرکت یکنواخت، شتاب‌دار و نمودارهای مکان-زمان فیزیک یازدهم تجربی است. لطفا ماشین‌حساب به همراه داشته باشید.',
    creatorId: '2',
    creatorName: 'استاد مریم حسینی',
    duration: 60,
    passingScore: 12,
    totalPoints: 20,
    category: 'فیزیک',
    startDate: '2026-06-01T08:00:00Z',
    endDate: '2026-06-12T18:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        text: 'متحرکی در مسیری مساوی با نصف محیط دایره‌ای به شعاع ۱۰ متر حرکت می‌کند. مسافت پیموده شده و جابه‌جایی آن به ترتیب چند متر است؟ (π = ۳)',
        options: [
          'مسافت ۳۰ متر - جابه‌جایی ۲۰ متر',
          'مسافت ۲۰ متر - جابه‌جایی ۳۰ متر',
          'مسافت ۱۵ متر - جابه‌جایی ۱۰ متر',
          'مسافت ۳۰ متر - جابه‌جایی صفر'
        ],
        correctAnswer: '0', // Option 1
        points: 4,
      },
      {
        id: 'q2',
        type: 'boolean',
        text: 'در حرکت با شتاب ثابت بر روی خط راست، جهت بردار شتاب همواره با جهت بردار سرعت یکسان است.',
        correctAnswer: 'false',
        points: 3,
      },
      {
        id: 'q3',
        type: 'descriptive',
        text: 'معادله مکان-زمان متحرکی بر حسب روابط SI به صورت x = t² - 4t + 5 است. سرعت متحرک را در لحظه t = 3s به دست آورید و نوع حرکت را در این لحظه (تندشونده یا کندشونده) با دلیل مشخص کنید.',
        correctAnswer: 'فرمول سرعت مشتق مکان است: v = 2t - 4. در ثانیه سوم سرعت v = 2(3) - 4 = +2 m/s است. شتاب a = +2 m/s² است. چون حاصلضرب a.v مثبت است، حرکت تندشونده است.',
        points: 7,
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        text: 'مفهوم فیزیکی سطح زیر نمودار سرعت-زمان چیست؟',
        options: [
          'شتاب متوسط متحرک',
          'سرعت متوسط متحرک',
          'جابه‌جایی متحرک',
          'تغییرات تکانه'
        ],
        correctAnswer: '2', // Option 3
        points: 6,
      }
    ]
  },
  {
    id: 'exam_2',
    title: 'ریاضی (۱) - مبحث نسبت‌ها و معادلات مثلثاتی',
    description: 'ویژه دانش‌آموزان پایه دهم ریاضی. شامل محاسبه روابط مثلثاتی در دایره مثلثاتی، قوانین تانژانت و کتانژانت و حل مسائل کاربردی.',
    creatorId: '2',
    creatorName: 'استاد مریم حسینی',
    duration: 45,
    passingScore: 10,
    totalPoints: 20,
    category: 'ریاضی',
    startDate: '2026-06-03T09:00:00Z',
    endDate: '2026-06-15T20:00:00Z',
    questions: [
      {
        id: 'q2_1',
        type: 'multiple_choice',
        text: 'اگر sin(α) = ۳/۵ و انتهای کمان α در ربع دوم باشد، مقادیر cos(α) و tan(α) چقدر است؟',
        options: [
          'cos = -۴/۵ و tan = -۳/۴',
          'cos = ۴/۵ و tan = ۳/۴',
          'cos = -۴/۵ و tan = ۳/۴',
          'cos = -۳/۵ و tan = -۴/۳'
        ],
        correctAnswer: '0',
        points: 5,
      },
      {
        id: 'q2_2',
        type: 'boolean',
        text: 'رابطه sin²(x) + cos²(x) = 1 برای تمام مقادیر حقیقی x برقرار است.',
        correctAnswer: 'true',
        points: 4,
      },
      {
        id: 'q2_3',
        type: 'descriptive',
        text: 'ثابت کنید که همواره رابطه (1 + tan²(x)) * cos²(x) = 1 برقرار است. مراحل اثبات را گام به گام توصیف و یادداشت کنید.',
        correctAnswer: 'می‌دانیم که 1 + tan²(x) = 1/cos²(x). بنابراین اگر آن را در cos²(x) ضرب کنیم، صورت و مخرج ساده شده و حاصل برابر با ۱ می‌شود.',
        points: 11,
      }
    ]
  },
  {
    id: 'exam_3',
    title: 'آزمون ادبیات فارسی - آرایه‌های ادبی و لغات شعر',
    description: 'جامع‌ترین آزمون آرایه‌های ادبی پایه دهم و یازدهم. تشبیه، استعاره، مجاز، کنایه و تناسب را با دقت پاسخ دهید.',
    creatorId: '1',
    creatorName: 'علیرضا کریمی',
    duration: 30,
    passingScore: 12,
    totalPoints: 20,
    category: 'ادبیات',
    startDate: '2026-05-15T12:00:00Z',
    endDate: '2026-06-25T23:59:59Z',
    questions: [
      {
        id: 'q3_1',
        type: 'multiple_choice',
        text: 'در مصرع «دهان گشاده و دریا نهاده بر سر راه»، دریا مجاز از چیست؟',
        options: [
          'آسمان بزرگ',
          'اشک بسیار زیاد',
          'امواج خروشان',
          'وسعت عشق'
        ],
        correctAnswer: '1',
        points: 5,
      },
      {
        id: 'q3_2',
        type: 'boolean',
        text: 'آرایه کنایه به معنای استفاده از سخنی است که دو معنی دور و نزدیک دارد و ذهن مستقیماً از معنی نزدیک به معنی دور هدایت می‌شود.',
        correctAnswer: 'true',
        points: 5,
      },
      {
        id: 'q3_3',
        type: 'multiple_choice',
        text: 'کدام آرایه در بیت «نرگس مست نوازش‌کن مردم‌دارش / خون عاشق به قدح جرمی قلمداد نکرد» برجسته‌تر است؟',
        options: [
          'تجاهل العارف',
          'تشخیص و استعاره مکنیه',
          'لف و نشر مرتب',
          'تضاد و تناقض نما'
        ],
        correctAnswer: '1',
        points: 5,
      },
      {
        id: 'q3_4',
        type: 'descriptive',
        text: 'در مصراع «چو سرو ایستاده باش ار تن سپاری به خاک»، آرایه تشبیه را واکاوی کرده و ارکان چهارگانه آن (مشبه، مشبه‌به، ادات تشبیه، وجه شبه) را بنویسید.',
        correctAnswer: 'مشبه: تو (مخاطب) / مشبه‌به: سرو / ادات تشبیه: چو / وجه شبه: ایستادگی و پایداری',
        points: 5,
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    examId: 'exam_1',
    examTitle: 'آزمون فیزیک (۲) - حرکت بر خط راست',
    studentId: '3',
    studentName: 'امیررضا علوی',
    submittedAt: '2026-06-04T10:15:00Z',
    answers: {
      'q1': '0', // correct (4 pts)
      'q2': 'false', // correct (3 pts)
      'q3': 'با مشتق‌گیری خواهیم داشت v = 2t - 4. در لحظه t=3 سرعت برابر v = 2m/s است. شتاب هم a = 2m/s² است. حاصل ضرب سرعت و شتاب مثبت است پس حرکت تندشونده است.', // descriptive, needs grading!
      'q4': '2', // correct (6 pts)
    },
    // Not yet graded completely because of descriptive! Or let's make it pre-graded
    status: 'pending',
    totalPoints: 20,
  },
  {
    id: 'sub_2',
    examId: 'exam_2',
    examTitle: 'ریاضی (۱) - مبحث نسبت‌ها و معادلات مثلثاتی',
    studentId: '4',
    studentName: 'سارا رضایی',
    submittedAt: '2026-06-03T11:00:00Z',
    answers: {
      'q2_1': '0', // correct
      'q2_2': 'true', // correct
      'q2_3': 'جون میدونیم که یک به اضافه تانژانت دو میشه سکانت دو که همون یک روی کسینوس دو هست. وقتی در کسینوس دو ضرب بشه همدیگه را خنثی میکنند و حاصل یک میشه.'
    },
    status: 'graded',
    pointsGained: 19,
    totalPoints: 20,
    gradedBy: 'استاد مریم حسینی',
    gradedAt: '2026-06-04T08:30:00Z',
    scores: {
      'q2_1': 5,
      'q2_2': 4,
      'q2_3': 10 // teachers deducted 1 point for a minor issue
    },
    feedback: {
      'q2_3': 'اثبات عالی و بدون اشکال بود، تنها تذکر برای رعایت دقت بالا در نوشتن روابط است.'
    }
  },
  {
    id: 'sub_3',
    examId: 'exam_3',
    examTitle: 'آزمون ادبیات فارسی - آرایه‌های ادبی و لغات شعر',
    studentId: '3',
    studentName: 'امیررضا علوی',
    submittedAt: '2026-05-20T14:45:00Z',
    answers: {
      'q3_1': '1', // correct: اشک بسیار (5 pts)
      'q3_2': 'true', // correct: (5 pts)
      'q3_3': '0', // incorrect, correct is 1 (0 pts)
      'q3_4': 'مشبه: تو، مشبه‌به: سرو، ادات: چو، وجه شبه: سرافرازی و ایستادگی' // descriptive correct (5 pts)
    },
    status: 'graded',
    pointsGained: 15,
    totalPoints: 20,
    gradedBy: 'علیرضا کریمی',
    gradedAt: '2026-05-21T09:00:00Z',
    scores: {
      'q3_1': 5,
      'q3_2': 5,
      'q3_3': 0,
      'q3_4': 5
    },
    feedback: {
      'q3_3': 'دقت کنید که گل نرگس در ادبیات نماد چشم است و صفاتی مثل مردم‌داری و مستی به آن نسبت داده شده که آرایه تشخیص است.'
    }
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    userId: '2',
    userName: 'استاد مریم حسینی',
    userRole: 'teacher',
    action: 'آزمون جدید «نسبت‌ها و معادلات مثلثاتی» را ایجاد کرد.',
    timestamp: '2026-06-03T09:12:00Z'
  },
  {
    id: 'log_2',
    userId: '4',
    userName: 'سارا رضایی',
    userRole: 'student',
    action: 'آزمون «ریاضی (۱)» را به پایان رساند و ارسال کرد.',
    timestamp: '2026-06-03T11:00:00Z'
  },
  {
    id: 'log_3',
    userId: '2',
    userName: 'استاد مریم حسینی',
    userRole: 'teacher',
    action: 'پاسخ‌های آزمون ریاضی سارا رضایی را تصحیح و نمره ثبت نمود.',
    timestamp: '2026-06-04T08:30:00Z'
  },
  {
    id: 'log_4',
    userId: '3',
    userName: 'امیررضا علوی',
    userRole: 'student',
    action: 'آزمون «فیزیک (۲) - حرکت بر خط راست» را ثبت و نهایی کرد.',
    timestamp: '2026-06-04T10:15:00Z'
  }
];
