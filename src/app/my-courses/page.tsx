"use client";

import CourseAnalyticsModal from "@/components/CourseAnalyticsModal";


import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/LanguageContext";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";

const generalPrinciples = [
  { id: "anatomy", name: "Anatomy", name_ar: "التشريح", name_en: "Anatomy", iconName: "SkeletonIcon", description: "Contains comprehensive lessons on human body structures, skeletal system details, and clinical correlations." },
  { id: "embryology", name: "Embryology", name_ar: "علم الأجنة", name_en: "Embryology", iconName: "Baby", description: "Contains developmental outlines from fertilization through fetal organ maturation and congenital defects." },
  { id: "physiology", name: "Physiology", name_ar: "علم وظائف الأعضاء", name_en: "Physiology", iconName: "HeartPulse", description: "Contains functional pathways detailing cellular feedback systems and systemic blood pressure regulation." },
  { id: "biochemistry-genetics", name: "Biochemistry", name_ar: "الكيمياء الحيوية", name_en: "Biochemistry", iconName: "EnzymeIcon", description: "Contains metabolic cycle structures, enzyme regulatory mechanisms, and biochemical reaction pathways." },
  { id: "histology", name: "Histology", name_ar: "علم الأنسجة", name_en: "Histology", iconName: "Layers", description: "Contains cell structural biology, epithelial classifications, and tissue identification metrics." },
  { id: "pathology", name: "Pathology", name_ar: "علم الأمراض", name_en: "Pathology", iconName: "PathologyIcon", description: "Contains mechanisms of cellular injury, adaptive responses, inflammatory reactions, and disease pathology." },
  { id: "pharmacology", name: "Pharmacology", name_ar: "علم الأدوية", name_en: "Pharmacology", iconName: "Pill", description: "Contains pharmacokinetic mathematics, drug clearance calculations, receptor dynamics, and drug toxicities." },
  { id: "microbiology", name: "Microbiology", name_ar: "علم الأحياء الدقيقة", name_en: "Microbiology", iconName: "BacteriaIcon", description: "Contains taxonomy of infectious agents, bacterial genetics, viral replication, and antimicrobial mechanisms." },
  { id: "immunology", name: "Immunology", name_ar: "علم المناعة", name_en: "Immunology", iconName: "Shield", description: "Contains innate and adaptive host immunity, hypersensitivity reactions, immunodeficiencies, and autoimmune diseases." },
  { id: "public-health", name: "Public Health", name_ar: "الصحة العامة", name_en: "Public Health", iconName: "Users", description: "Contains epidemiological concepts, patient safety, study designs, biostatistics, and healthcare systems." }
];

const organSystems = [
  { id: "gastrointestinal", name: "Gastrointestinal System", name_ar: "الجهاز الهضمي", name_en: "Gastrointestinal System", iconName: "StomachIcon", description: "Contains comprehensive lessons on gastrointestinal physiology, digestive processes, and clinical pathology." },
  { id: "musculoskeletal", name: "Musculoskeletal System", name_ar: "الجهاز العضلي الهيكلي", name_en: "Musculoskeletal System", iconName: "Bone", description: "Contains bone biology, skeletal muscle physiology, rheumatologic diseases, and soft tissue pathology." },
  { id: "central-nervous-special-senses", name: "Central Nervous System & Behavioral Science", name_ar: "الجهاز العصبي والعلوم السلوكية", name_en: "Central Nervous System & Behavioral Science", iconName: "Brain", description: "Contains neuroanatomy, spinal tracts, visual/auditory systems, medical ethics, and behavioral neuroscience." },
  { id: "respiratory", name: "Respiratory System", name_ar: "الجهاز التنفسي", name_en: "Respiratory System", iconName: "LungsIcon", description: "Contains pulmonary ventilatory mechanics, gas diffusion, ventilation-perfusion, and respiratory disease states." },
  { id: "endocrine", name: "Endocrine System", name_ar: "جهاز الغدد الصماء", name_en: "Endocrine System", iconName: "EndocrineIcon", description: "Contains pituitary-hypothalamic pathways, peripheral hormone feedback, thyroid physiology, and diabetic pathology." },
  { id: "hematology-oncology", name: "Hematology plus Oncology", name_ar: "أمراض الدم والأورام", name_en: "Hematology plus Oncology", iconName: "BloodCellIcon", description: "Contains erythrocytic pathways, coagulation cascades, leukemic classifications, and therapeutic oncology." },
  { id: "cardiovascular", name: "Cardiovascular System", name_ar: "جهاز القلب والأوعية الدموية", name_en: "Cardiovascular System", iconName: "Heart", description: "Contains cardiac electrophysiology, ventricular pressure-volume cycles, vascular hemodynamics, and heart failure." },
  { id: "renal-urinary", name: "Renal with Urinary System", name_ar: "الجهاز البولي والكلوي", name_en: "Renal with Urinary System", iconName: "KidneysIcon", description: "Contains glomerular filtration physiology, nephron transport systems, acid-base dynamics, and glomerular pathology." },
  { id: "reproductive", name: "Reproductive System", name_ar: "الجهاز التناسلي", name_en: "Reproductive System", iconName: "ReproductiveIcon", description: "Contains reproductive endocrinology, ovarian-uterine hormonal cycles, pregnancy, and sexual dysfunctions." }
];

export default function MyCoursesPage() {
  const { language } = useLanguage();
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [selectedAnalyticsCourse, setSelectedAnalyticsCourse] = useState<{ id: string; name: string } | null>(null);
  const [coursesTitle, setCoursesTitle] = useState("");
  const [coursesDesc, setCoursesDesc] = useState("");
  const [emptyTitle, setEmptyTitle] = useState("");
  const [emptyDesc, setEmptyDesc] = useState("");
  const [exploreBtnText, setExploreBtnText] = useState("");

  const [unlockedCourses, setUnlockedCourses] = useState<any[]>([]);
  const [renewalModal, setRenewalModal] = useState<{
    isOpen: boolean;
    subjectId: string;
    subjectName: string;
  }>({
    isOpen: false,
    subjectId: "",
    subjectName: ""
  });
  const [renewalStep, setRenewalStep] = useState<"confirm" | "phone" | "success">("confirm");
  const [renewalPhone, setRenewalPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+962");
  const hasLoadedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem("medicinety_logged_in_user");
    if (!user) {
      setUnlockedCourses([]);
    } else {
      // 1. Get unlocked courses list from localStorage per user
      const unlocked = localStorage.getItem(`medicinety_unlocked_courses_${user}`);
      const unlockedList: string[] = unlocked ? JSON.parse(unlocked) : [];

      // 2. Load general principles custom names or use defaults
      const gpSaved = localStorage.getItem("medicinety_general_principles_list") || localStorage.getItem("medicinety_general_principles_modules");
      const gpModules = gpSaved ? JSON.parse(gpSaved) : generalPrinciples;

      // 3. Load organ systems custom names or use defaults
      const osSaved = localStorage.getItem("medicinety_systems_list") || localStorage.getItem("medicinety_systems_modules");
      const osModules = osSaved ? JSON.parse(osSaved) : organSystems;

      // 4. Merge all and filter for unlocked only, attaching expiration status
      const allModules = [...gpModules, ...osModules];
      
      const subsKey = `medicinety_subscriptions_${user}`;
      const savedSubs = localStorage.getItem(subsKey);
      const subsList: any[] = savedSubs ? JSON.parse(savedSubs) : [];

      const filtered = allModules
        .filter(m => unlockedList.includes(m.id))
        .map(m => {
          const sub = subsList.find((s: any) => s.subjectId === m.id);
          const isExpired = sub && sub.expiresAt && new Date() > new Date(sub.expiresAt);
          return { ...m, isExpired };
        });

      // Load renewal requests to see if student has already requested renewal
      const rawReqs = localStorage.getItem("medicinety_renewal_requests");
      const renewalReqsList = rawReqs ? JSON.parse(rawReqs) : [];

      // Check for expired courses counter and popup reminder (up to 3 times)
      let refreshedFiltered = [...filtered];
      let hasPromptedThisSession = false;

      for (const course of filtered) {
        if (course.isExpired) {
          const hasPendingRequest = renewalReqsList.some(
            (r: any) => r.user === user && r.subjectId === course.id && r.status === "pending"
          );

          if (hasPendingRequest) {
            continue;
          }

          const counterKey = `medicinety_expired_show_count_${user}_${course.id}`;
          const currentCount = parseInt(localStorage.getItem(counterKey) || "0", 10);

          if (currentCount < 3) {
            if (!hasPromptedThisSession) {
              const dispName = language === "ar" ? (course.name_ar || course.name) : (course.name_en || course.name);
              setRenewalModal({
                isOpen: true,
                subjectId: course.id,
                subjectName: dispName
              });
              hasPromptedThisSession = true;
            }
            
            const newCount = currentCount + 1;
            localStorage.setItem(counterKey, newCount.toString());

            if (newCount >= 3) {
              const unlockKey = `medicinety_unlocked_courses_${user}`;
              const rawUnlocked = localStorage.getItem(unlockKey);
              const unlockedList = rawUnlocked ? JSON.parse(rawUnlocked) : [];
              const updatedUnlocked = unlockedList.filter((id: string) => id !== course.id);
              localStorage.setItem(unlockKey, JSON.stringify(updatedUnlocked));

              const subsKey = `medicinety_subscriptions_${user}`;
              const rawSubs = localStorage.getItem(subsKey);
              const subsList = rawSubs ? JSON.parse(rawSubs) : [];
              const updatedSubs = subsList.filter((s: any) => s.subjectId !== course.id);
              localStorage.setItem(subsKey, JSON.stringify(updatedSubs));

              refreshedFiltered = refreshedFiltered.filter(c => c.id !== course.id);
            }
          }
        }
      }
      setUnlockedCourses(refreshedFiltered);
    }

    // Default translations
    const defaults = {
      coursesTitle: language === "ar" ? "كورساتي" : "My Courses",
      coursesDesc: language === "ar" ? "لوحة التحكم الشخصية بالمساقات التعليمية المفعلة" : "Your personalized learning home",
      emptyTitle: language === "ar" ? "لا توجد كورسات مفعلة" : "No Purchased Courses",
      emptyDesc: language === "ar" ? "لم تقم بتفعيل أي كورس بعد. تفضل بزيارة قائمة المناهج لتفعيل الكورس الخاص بك." : "No purchased courses yet. Explore the Medicine catalog to enroll.",
      exploreBtnText: language === "ar" ? "استكشاف المناهج" : "Explore Catalog"
    };

    const saved = localStorage.getItem("medicinety_my_courses_state");
    const data = saved ? JSON.parse(saved) : {};
    
    setCoursesTitle(data[`coursesTitle_${language}`] || defaults.coursesTitle);
    setCoursesDesc(data[`coursesDesc_${language}`] || defaults.coursesDesc);
    setEmptyTitle(data[`emptyTitle_${language}`] || defaults.emptyTitle);
    setEmptyDesc(data[`emptyDesc_${language}`] || defaults.emptyDesc);
    setExploreBtnText(data[`exploreBtnText_${language}`] || defaults.exploreBtnText);
    
    hasLoadedRef.current = true;
  }, [language]);

  const handleCoursesStateChange = (key: string, value: string) => {
    try {
      const saved = localStorage.getItem("medicinety_my_courses_state");
      const data = saved ? JSON.parse(saved) : {};
      data[`${key}_${language}`] = value;
      localStorage.setItem("medicinety_my_courses_state", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save my courses state", e);
    }
  };

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
    const rawReqs = localStorage.getItem("medicinety_renewal_requests");
    const reqs = rawReqs ? JSON.parse(rawReqs) : [];

    const request = {
      id: "renew_" + Date.now(),
      user: user,
      subjectId: renewalModal.subjectId,
      subjectName: renewalModal.subjectName,
      phone: `${countryCode} ${renewalPhone}`,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    reqs.push(request);
    localStorage.setItem("medicinety_renewal_requests", JSON.stringify(reqs));
    setRenewalStep("success");
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-16 transition-colors duration-300">
      {/* Top Header Section */}
      <div className="w-full px-4 pt-8 xl:max-w-[1440px] mx-auto">
        

        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* Dynamic Borderless Header Section */}
        <section className="space-y-3 mb-8 group select-none">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none">
            {coursesTitle}
          </h1>
          <p className="text-sm md:text-base text-black dark:text-white font-normal leading-relaxed">
            {coursesDesc}
          </p>
        </section>

        {/* Display unlocked courses grid if any exist, otherwise show empty state */}
        {unlockedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedCourses.map((course) => {
              // Dynamically map subject images based on course ID or standard fallbacks
              const coverUrl = course.imageUrl || `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80`;
              const displayName = language === "ar" ? (course.name_ar || course.name) : (course.name_en || course.name);
              const displayDesc = language === "ar" ? (course.description_ar || course.description) : (course.description_en || course.description);

              return (
                <Link key={course.id} href={`/subject/${course.id}`}>
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-[#0D9488]/40 dark:hover:border-teal-400/60 transition-all duration-300 flex flex-col group cursor-pointer h-full text-left"
                  >
                    <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                      <img 
                        src={coverUrl} 
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-sm font-bold truncate tracking-tight">
                          {displayName}
                        </h4>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {displayDesc}
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-teal-500/10 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                        {course.isExpired ? (
                          <>
                            <span className="text-red-500">{language === "ar" ? "منتهي الصلاحية" : "Expired"}</span>
                            <span 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const dispName = language === "ar" ? (course.name_ar || course.name) : (course.name_en || course.name);
                                setRenewalModal({
                                  isOpen: true,
                                  subjectId: course.id,
                                  subjectName: dispName
                                });
                                setRenewalStep("phone");
                              }}
                              className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded hover:bg-red-500 hover:text-white transition-colors"
                            >
                              {language === "ar" ? "تجديد" : "Renew"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[#0D9488]">{language === "ar" ? "ابدأ الدراسة الآن" : "Start Studying"}</span>
                            <ChevronRight className="w-4 h-4 text-[#0D9488] transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State Card Container */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-lg p-12 text-center w-full shadow-sm"
          >

            <div className="mb-2 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {emptyTitle}
              </h3>
            </div>
            <div className="mb-8 max-w-md mx-auto">
              <p className="text-sm text-black dark:text-white leading-relaxed font-medium">
                {emptyDesc}
              </p>
            </div>

            <Link href="/medicine">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all relative"
              >
                <span>{exploreBtnText}</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>

      {renewalModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/25 rounded-2xl max-w-md w-full p-6 text-center shadow-xl space-y-4">
            {renewalStep === "confirm" && (
              <>

                <h3 className="text-md font-black text-black dark:text-white">
                  {language === "ar" ? "انتهى اشتراك المساق" : "Subscription Expired"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {language === "ar" 
                    ? `لقد انتهى اشتراكك في مساق (${renewalModal.subjectName}). هل تريد تجديد الاشتراك الآن؟`
                    : `Your subscription to (${renewalModal.subjectName}) has expired. Would you like to renew it now?`}
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => setRenewalModal({ ...renewalModal, isOpen: false })}
                    className="px-4 py-2 border border-slate-200 dark:border-teal-500/20 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151515] rounded-lg transition-all"
                  >
                    {language === "ar" ? "لا، لاحقاً" : "No, later"}
                  </button>
                  <button
                    onClick={() => setRenewalStep("phone")}
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                  >
                    {language === "ar" ? "نعم، تجديد الاشتراك" : "Yes, renew now"}
                  </button>
                </div>
              </>
            )}

            {renewalStep === "phone" && (
              <form onSubmit={handleRenewalSubmit} className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-[#0D9488]/10 text-[#0D9488] rounded-full flex items-center justify-center mx-auto text-xl">
                    📞
                  </div>
                  <h3 className="text-md font-black text-black dark:text-white pt-2">
                    {language === "ar" ? "معلومات التواصل" : "Contact Information"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    {language === "ar"
                      ? "يرجى كتابة رقم الهاتف للتواصل معك من أجل تجديد الاشتراك وتفعيل الكورس."
                      : "Please write your phone number to contact you to renew the subscription and activate the course."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{language === "ar" ? "رقم الهاتف للتواصل" : "Contact Phone Number"}</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-2 py-2.5 rounded-lg outline-none font-semibold"
                    >
                      <option value="+962">🇯🇴 +962 (JO)</option>
                      <option value="+966">🇸🇦 +966 (SA)</option>
                      <option value="+970">🇵🇸 +970 (PS)</option>
                      <option value="+20">🇪🇬 +20 (EG)</option>
                      <option value="+971">🇦🇪 +971 (AE)</option>
                      <option value="+963">🇸🇾 +963 (SY)</option>
                      <option value="+964">🇮🇶 +964 (IQ)</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="7XXXXXXXX"
                      value={renewalPhone}
                      onChange={e => setRenewalPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRenewalStep("confirm");
                      setRenewalModal({ ...renewalModal, isOpen: false });
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-teal-500/20 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151515] rounded-lg transition-all"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                  >
                    {language === "ar" ? "إرسال الطلب" : "Submit Request"}
                  </button>
                </div>
              </form>
            )}

            {renewalStep === "success" && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-md font-black text-black dark:text-white">
                  {language === "ar" ? "تم إرسال طلبك بنجاح!" : "Request Sent Successfully!"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  {language === "ar" 
                    ? "لقد استلمنا طلب التجديد الخاص بك. سيقوم فريقنا بالتواصل معك عبر الهاتف قريباً جداً لإكمال تفعيل الكورس."
                    : "We have received your renewal request. Our team will contact you via phone very soon to complete the course activation."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setRenewalStep("confirm");
                      setRenewalModal({ ...renewalModal, isOpen: false });
                    }}
                    className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                  >
                    {language === "ar" ? "موافق" : "OK"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    
      {/* Course Analytics & Subscribers Modal */}
      <CourseAnalyticsModal
        courseId={selectedAnalyticsCourse?.id || ""}
        courseName={selectedAnalyticsCourse?.name || ""}
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
      />
</div>
  );
}
