"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  FileDown, 
  Clock, 
  Eye, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Download,
  BookOpen,
  Copy,
  Check,
  Search,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface CourseAnalyticsModalProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const getRealCourseSubscribers = (courseId: string) => {
  if (typeof window === "undefined" || !courseId) return [];

  const rawUsers = localStorage.getItem("medicinety_registered_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [];

  const rawCodes = localStorage.getItem("medicinety_activation_codes");
  const codes = rawCodes ? JSON.parse(rawCodes) : [];

  const savedAdmins = localStorage.getItem("medicinety_platform_admins");
  const adminList = savedAdmins ? JSON.parse(savedAdmins) : ["admin@medicinety.com"];

  const subscribers: any[] = [];

  users.forEach((user: any) => {
    const userEmail = user.email ? user.email.toLowerCase() : "";
    if (!userEmail) return;

    // RULE 1: STRICTLY EXCLUDE ADMIN ACCOUNTS FROM SUBSCRIBERS COUNT
    const isAdminUser = user.role === "admin" || userEmail === "admin@medicinety.com" || adminList.includes(userEmail);
    if (isAdminUser) return;

    // RULE 2: ONLY INCLUDE ACCOUNTS THAT TRULY ACTIVATED A CODE OR PURCHASED A SUBSCRIPTION FOR THIS COURSE
    const unlockKey = `medicinety_unlocked_courses_${userEmail}`;
    const rawUnlocked = localStorage.getItem(unlockKey);
    const unlockedList: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];

    const subsKey = `medicinety_subscriptions_${userEmail}`;
    const rawSubs = localStorage.getItem(subsKey);
    const subsList: any[] = rawSubs ? JSON.parse(rawSubs) : [];

    const userCode = codes.find((c: any) => c.status === "used" && c.usedBy?.toLowerCase() === userEmail && (c.subjectId === courseId || c.subjectId === "all"));
    const subInfo = subsList.find((s: any) => s.subjectId === courseId || s.subjectId === "all");

    const isReallySubscribed = unlockedList.includes(courseId) || unlockedList.includes("all") || !!subInfo || !!userCode;

    if (isReallySubscribed) {
      const planName = userCode?.priceTier 
        ? (userCode.priceTier === "yearly" ? "كود سنوي ($60)" : userCode.priceTier === "semester" ? "كود فصلي ($40)" : "كود مدى الحياة ($129)")
        : (subInfo?.expiresAt ? "اشتراك نشط" : "اشتراك مفعّل ($60)");

      const subDate = userCode?.usedAt 
        ? new Date(userCode.usedAt).toISOString().split("T")[0] 
        : (subInfo?.activatedAt ? new Date(subInfo.activatedAt).toISOString().split("T")[0] : (user.registeredAt ? user.registeredAt.split("T")[0] : "2026-07-28"));

      const devRaw = localStorage.getItem(`medicinety_user_devices_${userEmail}`);
      const devLogs = devRaw ? JSON.parse(devRaw) : [];
      const devStatus = devLogs.length > 0 ? `نشط (${devLogs.length} جهاز)` : "نشط (جهاز 1)";

      subscribers.push({
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail.split('@')[0],
        email: userEmail,
        uni: user.university ? `${user.university} ${user.specialization ? '• ' + user.specialization : ''}` : "كليات الطب البشري",
        plan: planName,
        date: subDate,
        deviceStatus: devStatus
      });
    }
  });

  return subscribers;
};

export default function CourseAnalyticsModal({
  courseId,
  courseName,
  isOpen,
  onClose
}: CourseAnalyticsModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"subscribers" | "downloads" | "metrics">("subscribers");
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [fileDownloads, setFileDownloads] = useState<any[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    watchTimeMins: 0,
    examPassRate: 0,
    flashcardMastery: 0
  });

  useEffect(() => {
    if (!isOpen || !courseId) return;

    // Load REAL subscribers strictly matching active activation codes/subscriptions
    const subs = getRealCourseSubscribers(courseId);
    setSubscribers(subs);

    // Load real course sections for handout download statistics
    const savedSections = localStorage.getItem(`medicinety_subject_${courseId}_sections`);
    const allHandouts: any[] = [];

    if (savedSections) {
      try {
        const sections = JSON.parse(savedSections);
        sections.forEach((sec: any) => {
          if (sec.handouts) {
            sec.handouts.forEach((h: any) => {
              const savedDls = localStorage.getItem(`medicinety_handout_downloads_${h.id || h.name}`);
              const dlCount = savedDls ? parseInt(savedDls) : 0;
              allHandouts.push({
                name: h.name || "ملخص محاضرة وبنك أسئلة الـ PDF",
                type: h.type || "PDF Document",
                size: h.size || "4.2 MB",
                downloads: dlCount
              });
            });
          }
        });
      } catch (e) {}
    }


    setFileDownloads(allHandouts);

    // Calculate REAL metrics from localStorage logs
    const savedVisits = localStorage.getItem(`medicinety_subject_${courseId}_visits`);
    const visits = savedVisits ? parseInt(savedVisits) : 0;

    const savedWatchSeconds = localStorage.getItem(`medicinety_subject_${courseId}_watchtime`);
    const watchMins = savedWatchSeconds ? Math.floor(parseInt(savedWatchSeconds) / 60) : 0;

    // Compute real exam pass rate from grades
    let passRate = 0;
    let totalExams = 0;
    try {
      const rawUsers = localStorage.getItem("medicinety_registered_users");
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      let sumScores = 0;
      users.forEach((u: any) => {
        const rawGrades = localStorage.getItem(`medicinety_exam_grades_${u.email}`);
        if (rawGrades) {
          const gList = JSON.parse(rawGrades);
          const subjGrade = gList.find((g: any) => g.subjectId === courseId);
          if (subjGrade && subjGrade.score !== undefined) {
            sumScores += subjGrade.score;
            totalExams++;
          }
        }
      });
      if (totalExams > 0) {
        passRate = Math.round(sumScores / totalExams);
      }
    } catch(e){}

    // Compute real flashcard mastery rate
    let flashcardMastery = 0;
    try {
      const rawAnki = localStorage.getItem(`medicinety_anki_schedule_admin_${courseId}`);
      if (rawAnki) {
        const cards = JSON.parse(rawAnki);
        const easyCount = cards.filter((c: any) => c.lastRating === "easy").length;
        if (cards.length > 0) {
          flashcardMastery = Math.round((easyCount / cards.length) * 100);
        }
      }
    } catch(e){}

    setMetrics({
      totalVisits: visits,
      watchTimeMins: watchMins,
      examPassRate: passRate,
      flashcardMastery: flashcardMastery
    });

  }, [isOpen, courseId]);

  const handleCopyEmail = (emailText: string) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(emailText);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleInspectUserAccount = (emailText: string) => {
    onClose();
    if (window.location.pathname.includes("/settings")) {
      const inputEl = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = emailText;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.focus();
      }
    } else {
      window.location.href = `/settings?inspect=${encodeURIComponent(emailText)}`;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onClose} 
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-2xl p-6 w-full max-w-2xl relative z-10 shadow-2xl space-y-6 max-h-[85vh] flex flex-col select-text"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-base font-black text-black dark:text-white leading-snug">
                  {courseName}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "ar" ? `معرف المساق: ${courseId}` : `Course ID: ${courseId}`}
                </span>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-teal-500/10 gap-2">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`pb-2.5 px-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "subscribers"
                  ? "border-[#0D9488] text-[#0D9488] dark:text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === "ar" ? `المشتركون المفعّلون (${subscribers.length})` : `Subscribers (${subscribers.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab("downloads")}
              className={`pb-2.5 px-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "downloads"
                  ? "border-[#0D9488] text-[#0D9488] dark:text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileDown className="w-4 h-4" />
              <span>{language === "ar" ? "تنزيلات الملفات الـ PDF" : "PDF File Downloads"}</span>
            </button>

            <button
              onClick={() => setActiveTab("metrics")}
              className={`pb-2.5 px-3 text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "metrics"
                  ? "border-[#0D9488] text-[#0D9488] dark:text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{language === "ar" ? "ساعات المشاهدة والإحصائيات" : "Watch Time & Stats"}</span>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto pr-1">
            {activeTab === "subscribers" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                    {language === "ar" ? "قائمة جميع الحسابات المفعّلة لهذا المساق" : "Subscribed Accounts List"}
                  </h4>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {language === "ar" ? `إجمالي المفعّلين: ${subscribers.length} طالب` : `Total: ${subscribers.length} Enrolled`}
                  </span>
                </div>

                {subscribers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-teal-500/15 rounded-xl space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-500/80 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">
                      {language === "ar" ? "لا يوجد أي مشتركين مفعّلين بكود لهذا المساق حتى الآن." : "No active code subscribers for this course yet."}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {language === "ar" ? "عند تفعيل كود اشتراك من قبل أي طالب سيظهر حسابه وتفاصيله هنا مباشرة." : "When a student redeems a course activation code, their account will appear here live."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {subscribers.map((sub, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-black dark:text-white">{sub.name}</span>
                            <span className="text-[9px] font-bold bg-[#0D9488]/15 text-[#0D9488] dark:text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">
                              {sub.plan}
                            </span>
                          </div>

                          {/* Student Email with Copy & Inspect Buttons */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 select-all">
                              {sub.email}
                            </span>

                            {/* Copy Email Button */}
                            <button
                              onClick={() => handleCopyEmail(sub.email)}
                              className="p-1 rounded bg-slate-200 dark:bg-zinc-800 hover:bg-[#0D9488] hover:text-white text-slate-400 transition-all flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                              title={language === "ar" ? "نسخ البريد الإلكتروني" : "Copy Email"}
                            >
                              {copiedEmail === sub.email ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">{language === "ar" ? "تم النسخ" : "Copied"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{language === "ar" ? "نسخ" : "Copy"}</span>
                                </>
                              )}
                            </button>

                            {/* Inspect User Account Button */}
                            <button
                              onClick={() => handleInspectUserAccount(sub.email)}
                              className="p-1 px-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                              title={language === "ar" ? "فحص وتدقيق الحساب والأجهزة" : "Inspect Account"}
                            >
                              <Search className="w-3 h-3" />
                              <span>{language === "ar" ? "فحص الحساب" : "Inspect"}</span>
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-400 font-semibold">{sub.uni}</p>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold self-end md:self-auto">
                          <span>تاريخ التفعيل: {sub.date}</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {sub.deviceStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                  {language === "ar" ? "إحصائيات تنزيل ملفات الـ PDF والمكثفات الحقيقية" : "PDF Downloads & Handout Analytics"}
                </h4>

                <div className="space-y-2.5">
                  {fileDownloads.map((file, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-black dark:text-white">{file.name}</p>
                          <span className="text-[10px] text-slate-400">{file.type} • {file.size}</span>
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">{language === "ar" ? "عدد التنزيلات" : "Downloads"}</span>
                        <span className="text-sm font-black text-[#0D9488] dark:text-teal-400">{file.downloads}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="space-y-6">
                <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                  {language === "ar" ? "إحصائيات الاستخدام، المشاهدات والأداء الأكاديمي المباشر" : "Watch Time & Academic Performance Metrics"}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl text-center space-y-1">
                    <Clock className="w-5 h-5 text-[#0D9488] dark:text-teal-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold block">{language === "ar" ? "ساعات المشاهدة" : "Watch Time"}</span>
                    <span className="text-base font-black text-black dark:text-white">{Math.floor(metrics.watchTimeMins / 60)}h {metrics.watchTimeMins % 60}m</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl text-center space-y-1">
                    <Eye className="w-5 h-5 text-amber-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold block">{language === "ar" ? "إجمالي الزيارات" : "Total Visits"}</span>
                    <span className="text-base font-black text-black dark:text-white">{metrics.totalVisits}</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl text-center space-y-1">
                    <Award className="w-5 h-5 text-emerald-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold block">{language === "ar" ? "نسبة النجاح" : "Exam Pass Rate"}</span>
                    <span className="text-base font-black text-emerald-400">{metrics.examPassRate}%</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-teal-500/15 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold block">{language === "ar" ? "إتقان الفلاش كاردز" : "Flashcard Mastery"}</span>
                    <span className="text-base font-black text-purple-400">{metrics.flashcardMastery}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-teal-500/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              {language === "ar" ? "تم / إغلاق" : "Done / Close"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
