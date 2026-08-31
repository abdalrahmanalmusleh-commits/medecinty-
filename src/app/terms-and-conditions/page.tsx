"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TermsAndConditionsPage() {
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Content states
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");

  const defaultContentAr = `مرحباً بك في منصة ميدسنتي (Medicinety). باستخدامك لهذه المنصة، فإنك توافق على الالتزام الكامل بالشروط والأحكام التالية:

1. الملكية الفكرية وحماية المحتوى:
جميع محتويات هذا الموقع الإلكتروني بالكامل — بما في ذلك على سبيل المثال لا الحصر: النصوص الأكاديمية، الصور التوضيحية، الأكواد البرمجية البرمجة (Source Code)، التصاميم التفاعلية، الشعارات، الفيديوهات والشروحات المرفوعة — هي ملكية فكرية حصرية ومحمية لشركة Medicinety Medical Platform 
يُمنع منعاً باتاً وبموجب القانون نسخ، تصوير الشاشة، تسجيل الفيديوهات، توزيع، أو إعادة استخدام أي جزء من محتوى المنصة دون الحصول على إذن خطي مسبق وموقع رسمياً من إدارة شركة Medicinety.

2. حظر الحسابات ومشاركة الدخول:
كل حساب مشترك بالمنصة مخصص لاستخدام طالب واحد فقط. يُمنع منعاً باتاً مشاركة بيانات الدخول مع أي شخص آخر. المنصة مزودة بأنظمة ذكاء اصطناعي تراقب عناوين الـ IP والموقع الجغرافي والجلسات النشطة؛ وفي حال الكشف عن مشاركة الحساب أو تسجيل الدخول المتزامن من أجهزة مختلفة، سيتم تجميد الحساب تلقائياً وحظره بشكل نهائي دون الحق في المطالبة بالتعويض المالي.

3. المسؤولية القانونية والملاحقة القضائية (DMCA):
أي محاولة لاختراق المنصة، أو سرقة المحاضرات المدفوعة، أو الالتفاف على الحماية التقنية للمشغل، ستواجه مباشرة بملاحقة قضائية وقانونية رسمية. نحن مسجلون رسمياً في مكتبة الملكية الوطنية ولدى هيئة حماية المحتوى الرقمي DMCA.com، وسنقوم باتخاذ كافة التدابير القانونية وإرسال شكاوى رسمية لإغلاق أي خادم أو استضافة تسرب محتوى المنصة، بالإضافة لتقديم بلاغات رسمية للجامعة المسجل بها الطالب المخالف.`;

  const defaultContentEn = `Welcome to Medicinety. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions:

1. Intellectual Property Protection:
All contents of this website — including, but not limited to, course descriptions, lecture videos, PDFs, interactive handouts, source code, designs, and logos — are the exclusive and trademarked intellectual property of Medicinety Medical Platform 
Any copying, distribution, downloading, screen recording, or unauthorized reproduction of this platform's contents without prior written consent from Medicinety Medical Platform is strictly prohibited.

2. User Account & Security Policy:
Each account is strictly personal and intended for a single user. Sharing login credentials with others is strictly forbidden. The platform employs active security tracking algorithms to monitor active sessions, IP locations, and device profiles. If credential sharing is detected, the account will be immediately suspended without refund.

3. Legal Consequences and DMCA Notice:
Any attempt to bypass the platform's video blocker overlay, steal premium course links, or capture recordings of private courses will result in immediate termination of service and civil/criminal prosecution. We actively monitor and enforce our copyrights globally through DMCA.com and local national registries.`;

  useEffect(() => {
    // Check admin role
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    // Load saved content from localStorage
    const savedEn = localStorage.getItem("medicinety_terms_content_en");
    const savedAr = localStorage.getItem("medicinety_terms_content_ar");

    setContentEn(savedEn || defaultContentEn);
    setContentAr(savedAr || defaultContentAr);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("medicinety_terms_content_en", contentEn);
    localStorage.setItem("medicinety_terms_content_ar", contentAr);
    setIsEditing(false);
  };

  const paragraphs = language === "ar" ? contentAr.split("\n\n") : contentEn.split("\n\n");

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      <div className="w-full px-4 mt-8 space-y-8 xl:max-w-[1200px] mx-auto text-left">
        <Breadcrumbs />

        {/* Header Block */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/40 dark:border-teal-500/10 pb-6 select-none">
          <div className="flex items-center gap-4">
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block mb-1.5">
                {language === "ar" ? "قانوني" : "Legal Contract"}
              </span>
              <h1 className="text-3xl font-black text-black dark:text-white tracking-tight leading-none">
                {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
              </h1>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488]/10 hover:bg-[#0D9488] border border-[#0D9488]/20 text-[#0D9488] hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer self-start sm:self-auto shadow-sm"
            >
              {isEditing ? (
                <>
                  <ArrowLeft className="w-4 h-4" /> {language === "ar" ? "إلغاء التعديل" : "Cancel Edit"}
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" /> {language === "ar" ? "تعديل الشروط والأحكام" : "Edit Terms"}
                </>
              )}
            </button>
          )}
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form 
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSave} 
                  className="bg-white dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/25 p-6 rounded-2xl shadow-xl space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1 flex-row">
                        <span>🇸🇦</span> {language === "ar" ? "المحتوى باللغة العربية" : "Arabic Content"}
                      </label>
                      <textarea
                        value={contentAr}
                        onChange={(e) => setContentAr(e.target.value)}
                        rows={12}
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-teal-500/20 text-black dark:text-white px-4 py-3 text-xs rounded-xl outline-none focus:border-[#0D9488]/40 font-semibold leading-relaxed"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-500 uppercase tracking-wide flex items-center gap-1 flex-row">
                        <span>🇺🇸</span> {language === "ar" ? "المحتوى باللغة الإنجليزية" : "English Content"}
                      </label>
                      <textarea
                        value={contentEn}
                        onChange={(e) => setContentEn(e.target.value)}
                        rows={12}
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-teal-500/20 text-black dark:text-white px-4 py-3 text-xs rounded-xl outline-none focus:border-[#0D9488]/40 font-semibold leading-relaxed"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{language === "ar" ? "حفظ التعديلات" : "Save Changes"}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="content-display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/25 p-8 rounded-2xl shadow-sm space-y-6 leading-relaxed text-slate-700 dark:text-slate-200 text-xs font-semibold select-text"
                >
                  {paragraphs.map((p, idx) => (
                    <p key={idx} className="whitespace-pre-line leading-relaxed">
                      {p}
                    </p>
                  ))}
                  
                  {/* Copyright Notice */}
                  <div className="pt-6 border-t border-slate-100 dark:border-teal-500/5 text-center text-[10px] text-slate-400 dark:text-slate-505 select-none">
                    {language === "ar" 
                      ? "جميع الحقوق محفوظة لمنصة Medicinety © 2026. محمية بموجب قوانين الملكية الفكرية وحقوق المؤلف الدولية." 
                      : "© 2026 Medicinety Platform. All Rights Reserved. Protected under International Copyright & IP Laws."}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar Info Card */}
          <div className="space-y-6">
            <div className="p-5 bg-slate-50/50 dark:bg-[#131313] border border-slate-200/60 dark:border-teal-500/20 rounded-2xl space-y-4 shadow-sm select-none">
              <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-teal-500/10 pb-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h4 className="text-xs font-extrabold text-black dark:text-white uppercase tracking-wider">
                  {language === "ar" ? "حماية الملكية الفكرية" : "Intellectual Security"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {language === "ar" 
                  ? "محتويات المنصة محمية بموجب حقوق الطبع والنشر الدولية. أي اعتداء أو محاولة سرقة ستؤدي للملاحقة القانونية وإغلاق الحساب فوراً."
                  : "Medicinety's proprietary curriculum is protected under global copyright treaties. Unauthorized distribution triggers immediate civil liabilities."}
              </p>
              
              <div className="flex items-center gap-2.5 p-3 bg-rose-500/5 dark:bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-505 flex-row">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold leading-normal">
                  {language === "ar" ? "مشاركة الحسابات تعرض صاحبها للحظر الدائم." : "Account sharing is subject to immediate lifetime bans."}
                </span>
              </div>
            </div>

            <div className="p-5 bg-[#0D9488]/5 dark:bg-teal-950/10 border border-teal-500/15 rounded-2xl space-y-3 shadow-sm select-none text-center">
              <div className="w-10 h-10 bg-[#0D9488]/10 text-[#0D9488] dark:text-teal-400 rounded-full flex items-center justify-center mx-auto border border-[#0D9488]/10 mb-2">
                <Check className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-extrabold text-[#0D9488] dark:text-teal-400 tracking-wide uppercase">
                {language === "ar" ? "منصة محمية وموثقة" : "Secured & Certified"}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {language === "ar" 
                  ? "مسجلة كعلامة تجارية رسمية ومحمية بنظام DMCA الدولي لحماية المصنفات الرقمية."
                  : "Officially registered as a trademark and secured globally by DMCA copyright monitoring systems."}
              </p>
              <div className="pt-2">
                <img 
                  src="https://images.dmca.com/Badges/dmca-badge-w100-5x1-01.png?ID=medicinety-dmca-badge" 
                  alt="DMCA.com Protection Status" 
                  className="mx-auto h-5 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
