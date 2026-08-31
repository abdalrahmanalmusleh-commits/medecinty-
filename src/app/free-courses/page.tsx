"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  PlayCircle, 
  FileText, 
  Layers, 
  ArrowRight,
  Search,
  Plus,
  Settings2,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmModal from "@/components/ConfirmModal";
import { subjectData } from "@/data/subjectData";

interface FreeCourseItem {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en?: string;
  desc_ar?: string;
  category: string;
  category_ar: string;
  isPaid?: boolean;
  isFree?: boolean;
  freeLecturesCount?: number;
  lecturesCount?: number;
  handoutsCount?: number;
  flashcardsCount?: number;
}

export default function FreeCoursesPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [freeCourses, setFreeCourses] = useState<FreeCourseItem[]>([]);
  const [courseToRemove, setCourseToRemove] = useState<string | null>(null);

  // Admin Course Manager Modal
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [allAvailableCourses, setAllAvailableCourses] = useState<FreeCourseItem[]>([]);

  const loadCourses = () => {
    // 1. Gather all actual active courses from GP, Systems, and Clinical
    let gpList: any[] = [];
    let sysList: any[] = [];
    let clinList: any[] = [];

    const savedGp = localStorage.getItem("medicinety_general_principles_list");
    if (savedGp !== null) {
      try { gpList = JSON.parse(savedGp); } catch (e) {}
    } else {
      // If brand new and never modified:
      gpList = [];
    }

    const savedSys = localStorage.getItem("medicinety_systems_list");
    if (savedSys !== null) {
      try { sysList = JSON.parse(savedSys); } catch (e) {}
    } else {
      sysList = [];
    }

    const savedClin = localStorage.getItem("medicinety_clinical_list");
    if (savedClin !== null) {
      try { clinList = JSON.parse(savedClin); } catch (e) {}
    } else {
      clinList = [];
    }

    const allCombined: FreeCourseItem[] = [
      ...gpList.map(c => ({ ...c, category: "General Principles", category_ar: "المبادئ العامة" })),
      ...sysList.map(c => ({ ...c, category: "Organ Systems", category_ar: "أجهزة الجسم" })),
      ...clinList.map(c => ({ ...c, category: "Clinical Sciences", category_ar: "العلوم السريرية" }))
    ].map(c => {
      const liveSub = (subjectData as any)[c.id];
      return {
        ...c,
        lecturesCount: liveSub?.lectures?.length || 8,
        handoutsCount: liveSub?.handouts?.length || 4,
        flashcardsCount: liveSub?.flashcards?.length || 5,
        freeLecturesCount: c.freeLecturesCount !== undefined ? c.freeLecturesCount : (c.isPaid === false ? 2 : 0)
      };
    });

    setAllAvailableCourses(allCombined);

    // Filter ONLY the courses that are explicitly free / trial available (isPaid === false or isFree === true or freeLecturesCount > 0)
    let explicitFreeKeys: string[] | null = null;
    try {
      const customFreeKeys = localStorage.getItem("medicinety_explicit_free_course_ids");
      if (customFreeKeys) explicitFreeKeys = JSON.parse(customFreeKeys);
    } catch (e) {}

    let selectedFree: FreeCourseItem[];
    if (explicitFreeKeys) {
      selectedFree = allCombined.filter(c => explicitFreeKeys!.includes(c.id));
    } else {
      // Default: only courses where isPaid === false or freeLecturesCount > 0
      selectedFree = allCombined.filter(c => c.isPaid === false || c.isFree === true || (c.freeLecturesCount && c.freeLecturesCount > 0));
    }

    setFreeCourses(selectedFree);
  };

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");
    loadCourses();

    window.addEventListener("storage", loadCourses);
    return () => window.removeEventListener("storage", loadCourses);
  }, []);

  const saveExplicitFreeCourses = (ids: string[]) => {
    localStorage.setItem("medicinety_explicit_free_course_ids", JSON.stringify(ids));
    loadCourses();
  };

  const handleToggleCourseFree = (courseId: string) => {
    const currentFreeIds = freeCourses.map(c => c.id);
    let updatedIds: string[];
    if (currentFreeIds.includes(courseId)) {
      updatedIds = currentFreeIds.filter(id => id !== courseId);
    } else {
      updatedIds = [...currentFreeIds, courseId];
    }
    saveExplicitFreeCourses(updatedIds);
  };

  const handleRemoveFromFreePage = (courseId: string) => {
    setCourseToRemove(courseId);
  };

  const confirmRemoveAction = () => {
    if (!courseToRemove) return;
    const updatedIds = freeCourses.map(c => c.id).filter(id => id !== courseToRemove);
    saveExplicitFreeCourses(updatedIds);
    setCourseToRemove(null);
  };

  const filtered = freeCourses.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name_en.toLowerCase().includes(q) || s.name_ar.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      
      {/* Hero Banner for Free Courses */}
      <section className="w-full bg-gradient-to-r from-[#0D9488] via-[#0A4D4E] to-[#0D9488] text-white py-12 px-6 lg:px-12 border-b-2 border-teal-500/40 shadow-xl relative overflow-hidden select-none">
        <div className="max-w-[1440px] mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === "ar" ? "وصول مجاني 100% لجميع الطلاب" : "100% Free Trial Access"}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {language === "ar" ? "الكورسات والمحاضرات المجانية المتاحة" : "Free & Available Medical Courses"}
          </h1>

          <p className="text-sm md:text-base text-teal-100 max-w-2xl font-medium leading-relaxed">
            {language === "ar" 
              ? "استكشف المحاضرات النموذجية المجانية، النوتس التفاعلية، وحزم بطاقات Anki المتاحة للتجربة الفورية في المواد المحددة مجاناً." 
              : "Explore free sample lectures, interactive study notes, and official Anki flashcard decks available for instant preview across selected courses."}
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-8 space-y-8 text-left">
        <Breadcrumbs />

        {/* Search Bar & Admin Manager */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-teal-500/10 pb-6">
          <div>
            <h2 className="text-xl font-extrabold text-black dark:text-white">
              {language === "ar" ? "تصفح الكورسات المتاحة للتجربة" : "Browse Available Trial Courses"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "ar" ? `يوجد ${filtered.length} كورس مجاني متاح حالياً للتجربة` : `${filtered.length} courses currently available for free trial`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setManageModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Settings2 className="w-4 h-4" />
                <span>{language === "ar" ? "تحديد الكورسات المجانية" : "Manage Free Courses"}</span>
              </button>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={language === "ar" ? "ابحث عن مادة مجانية..." : "Search free course..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-[#0D9488] shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Free Courses Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3">
            <span className="text-4xl">📚</span>
            <h3 className="text-base font-black text-black dark:text-white">
              {language === "ar" ? "لا توجد كورسات مجانية مطابقة للبحث" : "No free courses matching your criteria"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === "ar" ? "يمكنك كأدمن تحديد أي كورس ليكون مجانياً للتجربة من زر (تحديد الكورسات المجانية) بالأعلى." : "You can designate any course as free trial using the Manage button above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sub) => (
              <div 
                key={sub.id}
                className="bg-white dark:bg-[#151515] rounded-3xl p-6 md:p-7 border border-slate-200/80 dark:border-zinc-800 hover:border-teal-500/40 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative select-none"
              >
                {/* Admin Delete from Free Page Button */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => handleRemoveFromFreePage(sub.id)}
                      className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      title={language === "ar" ? "إلغاء المجانية عن هذا الكورس" : "Remove from free courses"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{language === "ar" ? "إلغاء المجانية" : "Unset Free"}</span>
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  
                  {/* Clean Typography Header (NO BOX BORDERS) */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0D9488] dark:text-teal-400">
                      {language === "ar" ? sub.category_ar : sub.category}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>🔓</span>
                      <span>{language === "ar" ? "تجربة مجانية" : "Free Preview"}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-black dark:text-white group-hover:text-[#0D9488] dark:group-hover:text-teal-400 transition-colors">
                      {language === "ar" ? sub.name_ar : sub.name_en}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                      {language === "ar" 
                        ? (sub.desc_ar || "شرح مكثف عالي الأهمية مع بنك أسئلة وحزم Anki الأصلية.") 
                        : (sub.desc_en || "High-yield video lectures, clinical cases, and verified Anki packages.")}
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 p-2 rounded-xl">
                      <PlayCircle className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{sub.lecturesCount} {language === "ar" ? "فيديو" : "Vids"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 p-2 rounded-xl">
                      <FileText className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{sub.handoutsCount} {language === "ar" ? "ملف" : "PDFs"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 p-2 rounded-xl">
                      <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Anki 🃏</span>
                    </div>
                  </div>

                </div>

                {/* Action Button */}
                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-zinc-800">
                  <Link
                    href={`/subject/${sub.id}`}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:bg-[#0D9488] cursor-pointer uppercase tracking-wider text-center"
                  >
                    <span>{language === "ar" ? "ابدأ الدراسة المجانية الآن" : "Start Free Study Now"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Admin Manage Free Courses Modal */}
      {manageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161616] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                  <span>⚙️</span>
                  <span>{language === "ar" ? "تحديد الكورسات المتاحة للتجربة المجانية" : "Manage Free Preview Courses"}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {language === "ar" ? "حدد الكورسات التي ترغب بظهورها في صفحة الكورسات المجانية للطلاب:" : "Select the courses you want to offer as free preview:"}
                </p>
              </div>
              <button onClick={() => setManageModalOpen(false)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            {/* Courses Checklist */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {allAvailableCourses.map((c) => {
                const isSelected = freeCourses.some(fc => fc.id === c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleCourseFree(c.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/30"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-500/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-black ${
                        isSelected ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      }`}>
                        {isSelected && "✓"}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-black dark:text-white">
                          {language === "ar" ? c.name_ar : c.name_en}
                        </h4>
                        <span className="text-[10px] text-[#0D9488] font-bold">
                          {language === "ar" ? c.category_ar : c.category}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isSelected 
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" 
                        : "text-slate-400"
                    }`}>
                      {isSelected ? (language === "ar" ? "مفعل مجاناً 🔓" : "Free Active 🔓") : (language === "ar" ? "غير مجاني" : "Paid Only")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setManageModalOpen(false)}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl cursor-pointer"
              >
                {language === "ar" ? "حفظ وإغلاق" : "Save & Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Remove from Free Courses Modal */}
      <ConfirmModal
        isOpen={Boolean(courseToRemove)}
        title={language === "ar" ? "إلغاء مجانية الكورس" : "Remove from Free Courses"}
        message={language === "ar" ? "هل أنت متأكد من رغبتك في إزالة هذا الكورس من صفحة الكورسات المجانية؟" : "Are you sure you want to remove this course from the free preview hub?"}
        confirmText={language === "ar" ? "نعم، إزالة" : "Yes, Remove"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        onConfirm={confirmRemoveAction}
        onCancel={() => setCourseToRemove(null)}
      />

    </div>
  );
}
