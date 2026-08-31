"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");

  const defaultContentAr = `تلتزم منصة ميدسنتي (Medicinety) بحماية خصوصيتك وبياناتك الشخصية بأقصى درجات الأمان. توضح سياسة الخصوصية هذه كيفية جمع البيانات واستخدامها:

1. البيانات التي نجمعها:
نقوم بجمع البيانات اللازمة لإنشاء حسابك وتأمين اشتراكاتك فقط، وهي تشمل: الاسم الكامل، البريد الإلكتروني، اسم الجامعة والتخصص الأكاديمي، ورقم الهاتف. كما يتم تسجيل تقدمك الدراسي (سجل المشاهدة ودرجات الاختبارات التجريبية) لمساعدتك في تتبع أدائك الأكاديمي.

2. حماية البيانات والجلسات الأمنية:
نحن نطبق معايير أمان فنية مشددة لحماية معلوماتك من الوصول غير المصرح به. لمنع سرقة المحتوى أو مشاركة الحسابات، تقوم المنصة بمراقبة وتحليل عناوين الـ IP ونوع المتصفح والجهاز المستخدم وقت تسجيل الدخول. يتم تشفير جميع كلمات المرور بالكامل ولا يمكن لأي طرف ثالث أو حتى طاقم الإشراف لدينا الإطلاع عليها.

3. العلامات المائية الأمنية:
لضمان عدم نشر الفيديوهات التعليمية خارج المنصة، يقوم خادم الفيديو بدمج علامة مائية مرئية ومائلة باسم المستخدم وجهازه في وسط مشغل الفيديو. استخدامك للمشغل يعني موافقتك على معالجة هذه البيانات وعرضها لحماية المصنفات الرقمية.

4. ملفات تعريف الارتباط (Cookies):
تستخدم المنصة ملفات تعريف الارتباط الأساسية فقط للاحتفاظ بتسجيل دخولك نشطاً وحفظ تفضيلات اللغة والمظهر (الفاتح/الداكن). يمكنك تعطيل ملفات تعريف الارتباط من متصفحك، ولكن قد يؤثر ذلك على عمل بعض مزايا المنصة التفاعلية.`;

  const defaultContentEn = `Medicinety is committed to protecting your personal data and privacy. This Privacy Policy details how we collect, store, and process your information:

1. Information We Collect:
We collect necessary details to create your learning profile and secure subscriptions: your full name, email address, university, academic major, and phone number. We also save study progress (video watch duration and practice exam grades) to help you monitor academic progress.

2. Session Tracking and Security Auditing:
To prevent piracy and account sharing, our backend monitors active sessions, IP locations, and device footprints. All passwords are fully hashed and encrypted. Under no circumstances is this data shared with third-party advertising companies.

3. Video Player Security Watermarking:
Our video delivery system dynamically displays a translucent, tilted watermark of the logged-in user's email address on the screen. By using the video player, you acknowledge and consent to this technical measure deployed to protect our copyright.

4. Cookies Policy:
We use basic essential cookies to keep you signed in, remember your user settings, and save language/theme preferences. You can configure your browser to block cookies, though some interactive elements may lose functionality.`;

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    const savedEn = localStorage.getItem("medicinety_privacy_content_en");
    const savedAr = localStorage.getItem("medicinety_privacy_content_ar");

    setContentEn(savedEn || defaultContentEn);
    setContentAr(savedAr || defaultContentAr);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("medicinety_privacy_content_en", contentEn);
    localStorage.setItem("medicinety_privacy_content_ar", contentAr);
    setIsEditing(false);
  };

  const paragraphs = language === "ar" ? contentAr.split("\n\n") : contentEn.split("\n\n");

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      <div className="w-full px-6 lg:px-12 mt-8 space-y-8 max-w-4xl mx-auto text-left">
        <Breadcrumbs />

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/40 dark:border-teal-500/10 pb-6 select-none">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none">
            {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>

          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488]/10 hover:bg-[#0D9488] border border-[#0D9488]/20 text-[#0D9488] hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {isEditing ? (
                <>
                  <ArrowLeft className="w-4 h-4" /> {language === "ar" ? "إلغاء التعديل" : "Cancel"}
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" /> {language === "ar" ? "تعديل السياسة" : "Edit Policy"}
                </>
              )}
            </button>
          )}
        </section>

        <div>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form 
                key="edit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSave}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نص سياسة الخصوصية (بالعربية):
                    </label>
                    <textarea 
                      rows={12}
                      value={contentAr}
                      onChange={(e) => setContentAr(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-[#151515] border border-slate-200 dark:border-teal-500/30 rounded-2xl text-xs font-medium text-black dark:text-white outline-none focus:border-[#0D9488] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Privacy Policy Content (English):
                    </label>
                    <textarea 
                      rows={12}
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-[#151515] border border-slate-200 dark:border-teal-500/30 rounded-2xl text-xs font-medium text-black dark:text-white outline-none focus:border-[#0D9488] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="content-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/25 p-8 md:p-12 rounded-3xl shadow-sm space-y-6 leading-relaxed text-slate-700 dark:text-slate-200 text-sm font-medium select-text"
              >
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="whitespace-pre-line leading-relaxed">
                    {p}
                  </p>
                ))}
                
                <div className="pt-6 border-t border-slate-100 dark:border-teal-500/10 text-center text-xs text-slate-400 select-none">
                  {language === "ar" 
                    ? "جميع الحقوق محفوظة لمنصة Medicinety © 2026." 
                    : "© 2026 Medicinety Platform. All Rights Reserved."}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
