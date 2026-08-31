"use client";

function formatPrice(val?: string, fallback: string = ""): string {
  if (!val) return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("$")) return trimmed;
  return `$${trimmed}`;
}

import ConfirmModal from '@/components/ConfirmModal';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Edit2, Plus, Trash2, X, Settings, RotateCcw } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/LanguageContext";

interface SubjectItem {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  isPaid?: boolean;
  price?: string;
  originalPrice?: string;
  priceSemester?: string;
  originalPriceSemester?: string;
  priceYearly?: string;
  originalPriceYearly?: string;
  priceLifetime?: string;
  originalPriceLifetime?: string;
  freeLecturesCount?: number;
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: "anatomy", name_en: "Anatomy", name_ar: "التشريح", desc_en: "Gross, developmental & neuroanatomy", desc_ar: "التشريح العام وعلم الأعصاب التشريحي" },
  { id: "embryology", name_en: "Embryology", name_ar: "علم الأجنة", desc_en: "Human embryological development", desc_ar: "مراحل تطور ونمو الجنين البشري" },
  { id: "physiology", name_en: "Physiology", name_ar: "علم وظائف الأعضاء", desc_en: "Cellular & systemic physiological concepts", desc_ar: "العمليات الحيوية ووظائف خلايا وأجهزة الجسم" },
  { id: "biochemistry-genetics", name_en: "Biochemistry & Medical Genetics", name_ar: "الكيمياء الحيوية والوراثة الطبية", desc_en: "Metabolism, molecular & clinical genetics", desc_ar: "العمليات الأيضية والوراثة الجزيئية والسريرية" },
  { id: "histology", name_en: "Histology", name_ar: "علم الأنسجة", desc_en: "Microscopic anatomy & tissue histology", desc_ar: "التشريح المجهري وبنية أنسجة الجسم" },
  { id: "pathology", name_en: "Pathology", name_ar: "علم الأمراض", desc_en: "General pathological mechanisms & cellular injury", desc_ar: "آليات الأمراض العامة وإصابات الخلايا" },
  { id: "pharmacology", name_en: "Pharmacology", name_ar: "علم الأدوية", desc_en: "Pharmacokinetics & general drug principles", desc_ar: "حركية الأدوية والمبادئ العامة للعلاجات" },
  { id: "microbiology", name_en: "Microbiology", name_ar: "علم الأحياء الدقيقة", desc_en: "Bacteriology, virology, mycology & parasitology", desc_ar: "البكتيريا والفيروسات والفطريات والطفيليات" },
  { id: "immunology", name_en: "Immunology", name_ar: "علم المناعة", desc_en: "Innate & adaptive immune defense systems", desc_ar: "أنظمة الدفاع المناعي الفطري والمكتسب" },
  { id: "public-health", name_en: "Public Health & Epidemiology", name_ar: "الصحة العامة وعلم الأوبئة", desc_en: "Biostatistics, preventive medicine & ethics", desc_ar: "الإحصاء الحيوي والطب الوقائي والأخلاقيات" }
];

export default function GeneralPrinciplesPage() {
  const { language } = useLanguage();

  const [subjects, setSubjects] = useState<SubjectItem[]>(DEFAULT_SUBJECTS);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit / Add Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    const saved = localStorage.getItem("medicinety_general_principles_list");
    if (saved) {
      try {
        setSubjects(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveSubjects = (newList: SubjectItem[]) => {
    setSubjects(newList);
    localStorage.setItem("medicinety_general_principles_list", JSON.stringify(newList));
  };

  const handleOpenEdit = (sub: SubjectItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject({ ...sub });
    setIsAddingNew(false);
    setEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    const newSub: SubjectItem = {
      id: `custom_${Date.now()}`,
      name_en: "New Medical Course",
      name_ar: "مساق طبي جديد",
      desc_en: "Comprehensive syllabus and clinical notes",
      desc_ar: "منهاج شامل وشروحات طبية سريرية",
      isPaid: true,
      price: "$49",
      originalPrice: "$89",
      priceSemester: "$35",
      originalPriceSemester: "$60",
      priceYearly: "$49",
      originalPriceYearly: "$89",
      priceLifetime: "$99",
      originalPriceLifetime: "$149",
      freeLecturesCount: 3
    };
    setEditingSubject(newSub);
    setIsAddingNew(true);
    setEditModalOpen(true);
  };

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubjectToDelete(id);
  };

  const confirmDeleteSubjectAction = () => {
    if (!subjectToDelete) return;
    const updated = subjects.filter(s => s.id !== subjectToDelete);
    saveSubjects(updated);
    setSubjectToDelete(null);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    let updated: SubjectItem[];
    if (isAddingNew) {
      updated = [...subjects, editingSubject];
    } else {
      updated = subjects.map(s => s.id === editingSubject.id ? editingSubject : s);
    }

    saveSubjects(updated);

    // Save individual course pricing & meta
    localStorage.setItem(`medicinety_subject_${editingSubject.id}_meta`, JSON.stringify({
      name: editingSubject.name_en,
      name_ar: editingSubject.name_ar,
      description: editingSubject.desc_en,
      description_ar: editingSubject.desc_ar
    }));

    if (editingSubject.isPaid !== undefined) {
      localStorage.setItem(`medicinety_course_${editingSubject.id}_pricing`, JSON.stringify({
        isPaid: editingSubject.isPaid,
        price: editingSubject.price || "$49",
        freeLecturesCount: editingSubject.freeLecturesCount !== undefined ? editingSubject.freeLecturesCount : 2
      }));
    }

    setEditModalOpen(false);
    setEditingSubject(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      <div className="w-full px-6 lg:px-12 mt-8 space-y-10 animate-fade-in xl:max-w-[1440px] mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <section className="flex items-center gap-5 relative overflow-hidden group select-none">
          <div className="flex-1">
            
            <div className="mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
                {language === "ar" ? "المبادئ العامة" : "General Principles"}
              </h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-bold max-w-xl">
              {language === "ar" ? "العلوم الأساسية والمفاهيم الطبية التأسيسية" : "Foundational Basic Sciences & Medical Concepts"}
            </p>
          </div>
        </section>

        {/* Courses Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
              <h2 className="font-bold text-lg md:text-xl text-black dark:text-white tracking-tight">
                {language === "ar" ? "المساقات والمواد التأسيسية" : "Foundational Disciplines"}
              </h2>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveSubjects(DEFAULT_SUBJECTS)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="استعادة القائمة الافتراضية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === "ar" ? "الافتراضي" : "Reset"}</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "ar" ? "إضافة كورس جديد" : "Add New Course"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => {
              const name = language === "ar" ? (sub.name_ar || sub.name_en) : sub.name_en;
              const desc = language === "ar" ? (sub.desc_ar || sub.desc_en) : sub.desc_en;
              return (
                <div key={sub.id} className="relative group">
                  <Link href={`/subject/${sub.id}`} className="block">
                    <motion.div
                      whileHover={{ y: -4, scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                      className="p-6 md:p-7 bg-white dark:bg-[#1A1A1A] border-2 border-slate-200/80 dark:border-zinc-800 hover:border-[#0D9488] dark:hover:border-teal-500 rounded-3xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(13,148,136,0.12)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-extrabold text-lg md:text-xl text-black dark:text-white tracking-tight group-hover:text-[#0D9488] transition-colors">
                            {name}
                          </h3>

                          {/* Clean Professional Dollar Pricing Badge (No Emojis) */}
                          {sub.isPaid ? (
                            <div className="inline-flex items-center gap-2 shrink-0">
                              {sub.originalPriceSemester && (
                                <span className="line-through text-slate-400 dark:text-slate-500 text-xs md:text-sm font-bold">
                                  {formatPrice(sub.originalPriceSemester)}
                                </span>
                              )}
                              <div className="px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] dark:text-teal-300 font-extrabold text-xs md:text-sm rounded-xl border border-teal-500/30 flex items-center gap-1 shadow-sm">
                                <span>{formatPrice(sub.priceSemester, "$35")}</span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {language === "ar" ? "/ فصلي" : "/ 4 mo"}
                                </span>
                              </div>
                              {(sub.originalPriceSemester || sub.originalPriceYearly) && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
                                  {language === "ar" ? "عرض خاص" : "OFFER"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 text-xs font-black rounded-xl border border-emerald-300/40 uppercase">
                              {language === "ar" ? "مجاني" : "FREE"}
                            </span>
                          )}
                        </div>

                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                          {desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
                        {isAdmin && (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(sub, e)}
                              className="p-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-[#0D9488] rounded-xl transition-all border border-teal-500/20 shadow-sm cursor-pointer"
                              title={language === "ar" ? "تعديل الكورس" : "Edit Course"}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteSubject(sub.id, e)}
                              className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-xl transition-all border border-red-500/20 shadow-sm cursor-pointer"
                              title={language === "ar" ? "حذف الكورس" : "Delete Course"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-[#0D9488] group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              );
            })}          </div>
        </section>
      </div>

      {/* Admin Course Details & Pricing Editor Modal */}
      {editModalOpen && editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0D9488]" />
                <span>{isAddingNew ? (language === "ar" ? "إضافة كورس جديد" : "Add New Course") : (language === "ar" ? "تعديل تفاصيل وحالة الكورس" : "Edit Course Details & Pricing")}</span>
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs font-bold">
              {/* Course Name EN & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">الاسم بالعربية:</label>
                  <input
                    type="text"
                    required
                    value={editingSubject.name_ar}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name_ar: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold text-black dark:text-white outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Course Name (English):</label>
                  <input
                    type="text"
                    required
                    value={editingSubject.name_en}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name_en: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold text-black dark:text-white outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              {/* Course Description EN & AR */}
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">الوصف بالعربية:</label>
                <textarea
                  rows={2}
                  value={editingSubject.desc_ar}
                  onChange={(e) => setEditingSubject({ ...editingSubject, desc_ar: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-medium text-black dark:text-white outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Description (English):</label>
                <textarea
                  rows={2}
                  value={editingSubject.desc_en}
                  onChange={(e) => setEditingSubject({ ...editingSubject, desc_en: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-medium text-black dark:text-white outline-none focus:border-[#0D9488]"
                />
              </div>

              {/* Pricing & Free Trial Configuration */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                <label className="text-slate-700 dark:text-slate-200">حالة الكورس والتسعير:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubject({ ...editingSubject, isPaid: false })}
                    className={`py-2 rounded-xl border text-xs font-black transition-all ${
                      !editingSubject.isPaid 
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500"
                    }`}
                  >
                    🟢 مجاني بالكامل
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSubject({ ...editingSubject, isPaid: true })}
                    className={`py-2 rounded-xl border text-xs font-black transition-all ${
                      editingSubject.isPaid 
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20" 
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500"
                    }`}
                  >
                    💎 كورس مدفوع
                  </button>
                </div>

                {editingSubject.isPaid && (
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/25 rounded-2xl border border-amber-500/25 space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">
                        {language === "ar" ? "تحديد خطط الاشتراكات للمساق مع العروض:" : "Course Subscription Plans & Strikethrough Offers:"}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-500">{language === "ar" ? "محاضرات تجريبية مجانية:" : "Free preview lectures:"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editingSubject.freeLecturesCount !== undefined ? editingSubject.freeLecturesCount : 3}
                          onChange={(e) => setEditingSubject({ ...editingSubject, freeLecturesCount: parseInt(e.target.value) || 0 })}
                          className="w-14 p-1 bg-white dark:bg-zinc-800 border rounded-lg text-xs font-black text-center"
                        />
                      </div>
                    </div>

                    {/* Pure Subscription Plans Grid (Semester, Yearly, Lifetime) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Semester / 4 Months */}
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-black dark:text-white">
                            {language === "ar" ? "فصلي (4 أشهر)" : "4 Months"}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">سعر الاشتراك الحالي:</label>
                          <input
                            type="text"
                            placeholder="مثال: $35"
                            value={editingSubject.priceSemester || "$35"}
                            onChange={(e) => setEditingSubject({ ...editingSubject, priceSemester: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black text-xs text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-0.5">قبل الخصم (المشطوب):</label>
                          <input
                            type="text"
                            placeholder="مثال: $60"
                            value={editingSubject.originalPriceSemester || ""}
                            onChange={(e) => setEditingSubject({ ...editingSubject, originalPriceSemester: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold text-xs line-through text-slate-500"
                          />
                        </div>
                      </div>

                      {/* 2. 1 Year */}
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-[#0D9488]/40 dark:border-teal-500/40 space-y-2 shadow-sm relative">
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#0D9488] text-white text-[9px] font-black rounded-full uppercase">
                          {language === "ar" ? "الأكثر طلباً" : "POPULAR"}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-black dark:text-white">
                            {language === "ar" ? "سنوي (12 شهر)" : "1 Year"}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">سعر الاشتراك الحالي:</label>
                          <input
                            type="text"
                            placeholder="مثال: $49"
                            value={editingSubject.priceYearly || "$49"}
                            onChange={(e) => setEditingSubject({ ...editingSubject, priceYearly: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black text-xs text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-0.5">قبل الخصم (المشطوب):</label>
                          <input
                            type="text"
                            placeholder="مثال: $89"
                            value={editingSubject.originalPriceYearly || ""}
                            onChange={(e) => setEditingSubject({ ...editingSubject, originalPriceYearly: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold text-xs line-through text-slate-500"
                          />
                        </div>
                      </div>

                      {/* 3. Lifetime */}
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-black dark:text-white">
                            {language === "ar" ? "مدى الحياة" : "Lifetime"}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">سعر الاشتراك الحالي:</label>
                          <input
                            type="text"
                            placeholder="مثال: $99"
                            value={editingSubject.priceLifetime || "$99"}
                            onChange={(e) => setEditingSubject({ ...editingSubject, priceLifetime: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black text-xs text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-medium mb-0.5">قبل الخصم (المشطوب):</label>
                          <input
                            type="text"
                            placeholder="مثال: $149"
                            value={editingSubject.originalPriceLifetime || ""}
                            onChange={(e) => setEditingSubject({ ...editingSubject, originalPriceLifetime: e.target.value })}
                            className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold text-xs line-through text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer"
                >
                  {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Branded Medicinety Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(subjectToDelete)}
        title={language === "ar" ? "حذف الكورس" : "Delete Course"}
        message={language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا الكورس نهائياً من المنصة؟ لا يمكن التراجع عن هذه العملية." : "Are you sure you want to permanently delete this course from the platform? This action cannot be undone."}
        confirmText={language === "ar" ? "نعم، حذف الكورس" : "Yes, Delete Course"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        onConfirm={confirmDeleteSubjectAction}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
}
