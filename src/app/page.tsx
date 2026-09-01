"use client";

import ConfirmModal from '@/components/ConfirmModal';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  HelpCircle, 
  Stethoscope
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import { useLanguage } from "@/components/LanguageContext";

interface PricingBundle {
  id: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  savingsBadge_en: string;
  savingsBadge_ar: string;
  price: string;
  paymentNote_en: string;
  paymentNote_ar: string;
  btnText_en: string;
  btnText_ar: string;
  btnLink: string;
  features_en: string[];
  features_ar: string[];
  bottomNote_en: string;
  bottomNote_ar: string;
  isPopular?: boolean;
}

const DEFAULT_BUNDLES: PricingBundle[] = [
  {
    id: "bundle-2plus1",
    title_en: "Buy 2 + Get 1 FREE",
    title_ar: "اشتري كورسين + احصل على الثالث مجاناً",
    subtitle_en: "Choose Any 3 Courses, Pay for 2",
    subtitle_ar: "اختر 3 كورسات وادفع ثمن كورسين فقط",
    savingsBadge_en: "FREE 3RD COURSE",
    savingsBadge_ar: "كورس ثالث مجاناً",
    price: "$98",
    paymentNote_en: "(One-time payment • Flexible Activation)",
    paymentNote_ar: "(دفع لمرة واحدة • تفعيل مرن بالتاريخ الذي تختاره)",
    btnText_en: "Select 3 Courses",
    btnText_ar: "اختر 3 كورسات وحدد مواعيدها",
    btnLink: "schedule_bundle_3",
    features_en: [
      "Flexible Activation: Choose start date for each course individually!",
      "Full Video Lectures & Clinical Explanations",
      "Interactive Study Handouts & Notes (PDF)",
      "Official Downloadable Anki Decks (.apkg)"
    ],
    features_ar: [
      "ميزة التفعيل المرن: حدد موعد بدء كل كورس بالتاريخ الذي يناسبك!",
      "وصول كامل لفيديوهات الشرح وبنك الأسئلة",
      "الملخصات والنوتس الطبية التفاعلية (PDF)",
      "حزم بطاقات Anki الأصلية بالخط الأسود"
    ],
    bottomNote_en: "No rush: Start one course now, and schedule the other two for next semester!",
    bottomNote_ar: "بدون أي ضغط: يمكنك تفعيل كورس الآن، وتأجيل تفعيل الكورسين الآخرين للفصل القادم!"
  },
  {
    id: "bundle-3plus2",
    title_en: "Buy 3 + Get 2 FREE",
    title_ar: "اشتري 3 كورسات + احصل على 4 و 5 مجاناً",
    subtitle_en: "Choose Any 5 Courses, Pay for 3",
    subtitle_ar: "اختر 5 كورسات وادفع ثمن 3 فقط",
    savingsBadge_en: "SAVE 40% + 2 FREE",
    savingsBadge_ar: "وفر 40% + كورسين هدية",
    price: "$147",
    paymentNote_en: "(One-time payment • Flexible Activation)",
    paymentNote_ar: "(دفع لمرة واحدة • تفعيل مرن لكافة الكورسات)",
    btnText_en: "Select 5 Courses",
    btnText_ar: "اختر 5 كورسات وحدد مواعيدها",
    btnLink: "schedule_bundle_5",
    features_en: [
      "Flexible Activation: Schedule each course whenever you take that semester!",
      "Full Access to 5 Selected Medical Subjects",
      "Comprehensive QBank & Case Discussions",
      "Official Verified Anki Decks & Regular Updates"
    ],
    features_ar: [
      "ميزة التفعيل المرن: جدول مواعيد تفعيل الكورسات الخمسة حسب فصولك الدراسية!",
      "وصول كامل وشامل لـ 5 مواد طبية من اختيارك",
      "بنك أسئلة سريري تفاعلي وشروحات الحالات",
      "حزم بطاقات Anki الرسمية الأصلية مع التحديثات"
    ],
    bottomNote_en: "Most popular: Perfect for organizing your medical year with customized course start dates",
    bottomNote_ar: "الباقة الأكثر طلباً: مثالية لتنظيم سنتك الدراسية مع تفعيل كل كورس في وقته المناسب",
    isPopular: true
  },
  {
    id: "bundle-all-access",
    title_en: "All-In-One Medical Mastery",
    title_ar: "باقة الطب والبورد الشاملة",
    subtitle_en: "Full Access to All Basic & Clinical Subjects",
    subtitle_ar: "وصول غير محدود لكافة مواد الطب البشري",
    savingsBadge_en: "BEST VALUE SAVE 65%",
    savingsBadge_ar: "أفضل قيمة وفر 65%",
    price: "$249",
    paymentNote_en: "(One-time payment • Lifetime Access)",
    paymentNote_ar: "(دفع لمرة واحدة • وصول مستمر طوال سنوات الدراسة)",
    btnText_en: "Get Full Access",
    btnText_ar: "احصل على الباقة الشاملة",
    btnLink: "/my-courses",
    features_en: [
      "Open & Active Whenever You Want for all Subjects",
      "Complete USMLE Step 1 & 2 QBank and Review",
      "All Interactive Notes, Handouts & Histology Diagrams",
      "Full Official Anki Deck Library for All Specialties"
    ],
    features_ar: [
      "وصول مفتوح ومتاح في أي وقت لكافة المواد",
      "تحضير شامل لـ USMLE Step 1 & 2 مع بنك الأسئلة",
      "كافة الملخصات التفاعلية والنوتس ومخططات الأنسجة",
      "المكتبة الكاملة لحزم Anki الأصلية لكافة التخصصات"
    ],
    bottomNote_en: "Unlimited peace of mind from basic sciences to clinical rotations",
    bottomNote_ar: "راحة بال مطلقة ووصول دائم من العلوم الأساسية حتى التدريب السريري والامتياز"
  }
];

export default function Home() {
  const { language, t } = useLanguage();
  
    // Admin Editable Hero States
  const [heroHeadline, setHeroHeadline] = useState("");
  const [bullet1, setBullet1] = useState("");
  const [bullet2, setBullet2] = useState("");
  const [bullet3, setBullet3] = useState("");
  const [bullet4, setBullet4] = useState("");
  const [headline, setHeadline] = useState("");
  const [logoUrl, setLogoUrl] = useState<any>(null);
  const [subHeadline, setSubHeadline] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  // Kenhub-style About Us states
  const [aboutHeader, setAboutHeader] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [aboutMission, setAboutMission] = useState("");
  const [featuresTitle, setFeaturesTitle] = useState("");
  const [aboutFeatures, setAboutFeatures] = useState("");
  const [valuesTitle, setValuesTitle] = useState("");
  const [aboutValues, setAboutValues] = useState("");

  // Footer Tags
  const [tag1, setTag1] = useState("");
  const [tag2, setTag2] = useState("");

  // Editable Card & Section Titles
  const [howToUseTitle, setHowToUseTitle] = useState("");
  const [medicineSectionTitle, setMedicineSectionTitle] = useState("");
  const [medicineProgramTitle, setMedicineProgramTitle] = useState("");

  const hasLoadedRef = useRef(false);
  // Visibility & Section Toggles (Admin can hide/show any section)
  const [showFreeCoursesBox, setShowFreeCoursesBox] = useState(true);
  const [showBundlesSection, setShowBundlesSection] = useState(true);

  // Admin Editable Hero Free Courses Card States
  const [freeCardBadgeAr, setFreeCardBadgeAr] = useState("✨ تجربة مجانية متاحة لجميع الطلاب");
  const [freeCardBadgeEn, setFreeCardBadgeEn] = useState("✨ Free Preview Available for All Students");
  const [freeCardTitleAr, setFreeCardTitleAr] = useState("استكشف الكورسات والمحاضرات المجانية");
  const [freeCardTitleEn, setFreeCardTitleEn] = useState("Explore Free & Available Courses");
  const [freeCardDescAr, setFreeCardDescAr] = useState("شاهد المحاضرات النموذجية المجانية، النوتس التفاعلية، وحزم بطاقات Anki المتاحة فوراً بدون تسجيل.");
  const [freeCardDescEn, setFreeCardDescEn] = useState("Access free sample lectures, interactive study notes, and official Anki decks instantly.");
  const [freeCardBtnAr, setFreeCardBtnAr] = useState("تصفح الكورسات المجانية الآن ←");
  const [freeCardBtnEn, setFreeCardBtnEn] = useState("Explore Free Courses Now →");
  const [freeCardLink, setFreeCardLink] = useState("/free-courses");
  const [editFreeCardOpen, setEditFreeCardOpen] = useState(false);

  // Admin Editable Pricing Bundles State (AMBOSS Match)
  const [pricingBundles, setPricingBundles] = useState<PricingBundle[]>(DEFAULT_BUNDLES);
  const [editingBundle, setEditingBundle] = useState<PricingBundle | null>(null);
  const [isEditingNewBundle, setIsEditingNewBundle] = useState(false);
  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedBundles = localStorage.getItem("medicinety_pricing_bundles");
      if (savedBundles) {
        setPricingBundles(JSON.parse(savedBundles));
      }
    } catch (e) {
      console.error("Failed to load pricing bundles", e);
    }
  }, []);

  const saveBundles = (updated: PricingBundle[]) => {
    setPricingBundles(updated);
    localStorage.setItem("medicinety_pricing_bundles", JSON.stringify(updated));
  };

  const handleOpenEditBundle = (bundle: PricingBundle) => {
    setEditingBundle(JSON.parse(JSON.stringify(bundle)));
    setIsEditingNewBundle(false);
    setBundleModalOpen(true);
  };

  const handleOpenAddBundle = () => {
    const newB: PricingBundle = {
      id: "bundle-" + Date.now(),
      title_en: "New Bundle",
      title_ar: "باقة جديدة",
      subtitle_en: "USMLE Preparation",
      subtitle_ar: "شرح مكثف وتحضير شامل",
      savingsBadge_en: "SAVE $50",
      savingsBadge_ar: "وفر 50$",
      price: "$199",
      paymentNote_en: "(One-time payment*)",
      paymentNote_ar: "(دفع لمرة واحدة*)",
      btnText_en: "Get Bundle 🛒",
      btnText_ar: "احصل على الباقة 🛒",
      btnLink: "/my-courses",
      features_en: ["Full QBank Access", "High-Yield Video Lectures", "Official Anki Decks"],
      features_ar: ["وصول كامل لبنك الأسئلة", "فيديوهات شرح مكثفة", "حزم بطاقات Anki الرسمية"],
      bottomNote_en: "Targeted clinical prep for medical students",
      bottomNote_ar: "تحضير سريري مخصص لطلاب الطب"
    };
    setEditingBundle(newB);
    setIsEditingNewBundle(true);
    setBundleModalOpen(true);
  };

  const handleDeleteBundle = (id: string) => {
    setBundleToDelete(id);
  };

  const confirmDeleteBundleAction = () => {
    if (!bundleToDelete) return;
    const updated = pricingBundles.filter(b => b.id !== bundleToDelete);
    saveBundles(updated);
    setBundleToDelete(null);
  };

  const handleSaveBundleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBundle) return;

    let updated: PricingBundle[];
    if (isEditingNewBundle) {
      updated = [...pricingBundles, editingBundle];
    } else {
      updated = pricingBundles.map(b => b.id === editingBundle.id ? editingBundle : b);
    }
    saveBundles(updated);
    setBundleModalOpen(false);
    setEditingBundle(null);
  };

  // Flexible Course Selection & Activation Scheduler Modal States
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [selectedBundleCount, setSelectedBundleCount] = useState<number>(3);
  const [selectedDuration, setSelectedDuration] = useState<'4months' | '1year' | 'lifetime'>('1year');
  const [selectedCoursesWithDates, setSelectedCoursesWithDates] = useState<Array<{ id: string; name_ar: string; name_en: string; activationType: 'now' | 'custom'; customDate: string }>>([
    { id: "immunology", name_ar: "علم المناعة (Immunology)", name_en: "Immunology", activationType: "now", customDate: "" }
  ]);
  const [schedulerSavedSuccess, setSchedulerSavedSuccess] = useState(false);
  // Home Order / Activation Request Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderItemTitle, setOrderItemTitle] = useState("");
  const [orderItemPrice, setOrderItemPrice] = useState("");
  const [orderPhoneCountry, setOrderPhoneCountry] = useState("+962");
  const [orderPhoneNumber, setOrderPhoneNumber] = useState("");
  const [orderStudentName, setOrderStudentName] = useState("");
  const [orderRequestSent, setOrderRequestSent] = useState(false);

  // Maximum allowed activation scheduling limit (1 Year for 3 courses, 2 Years for 5 courses)

  // Dynamic Available Courses Catalog for Modal Selectors
  const getAvailableCatalog = () => {
    let gpList: any[] = [];
    let sysList: any[] = [];
    let clinList: any[] = [];

    try {
      const sGp = localStorage.getItem("medicinety_general_principles_list");
      if (sGp) gpList = JSON.parse(sGp);
    } catch (e) {}

    try {
      const sSys = localStorage.getItem("medicinety_systems_list");
      if (sSys) sysList = JSON.parse(sSys);
    } catch (e) {}

    try {
      const sClin = localStorage.getItem("medicinety_clinical_list");
      if (sClin) clinList = JSON.parse(sClin);
    } catch (e) {}

    const combined = [...gpList, ...sysList, ...clinList];
    if (combined.length > 0) {
      return combined.map((c: any) => ({
        id: c.id,
        name_en: c.name_en || c.name,
        name_ar: c.name_ar || c.name
      }));
    }

    // Strictly return real active courses
    return [
      { id: "immunology", name_en: "Immunology", name_ar: "علم المناعة" }
    ];
  };

  const getMaxAllowedSchedulingDate = (count: number) => {
    const d = new Date();
    if (count === 3) {
      d.setFullYear(d.getFullYear() + 1); // 1 Year window
    } else {
      d.setFullYear(d.getFullYear() + 2); // 2 Years window
    }
    return d.toISOString().split("T")[0];
  };

  // Calculate dynamic price based on course count and selected duration
  const getBundleDynamicPrice = (count: number, duration: '4months' | '1year' | 'lifetime') => {
    if (count === 3) {
      if (duration === '4months') return "$59";
      if (duration === '1year') return "$98";
      return "$149"; // lifetime
    } else {
      // 5 courses
      if (duration === '4months') return "$89";
      if (duration === '1year') return "$147";
      return "$199"; // lifetime
    }
  };

  // Admin Special Offer Card States (High Conversion)
  const [showOfferCard, setShowOfferCard] = useState(true);
  const [offerBadgeAr, setOfferBadgeAr] = useState("🔥 عرض خاص محدود: خصم 45% لفترة محدودة");
  const [offerBadgeEn, setOfferBadgeEn] = useState("🔥 LIMITED TIME OFFER: 45% OFF BUNDLE");
  const [offerTitleAr, setOfferTitleAr] = useState("باقة التفوق الطبي الشاملة (USMLE & Clinical Board All-In-One)");
  const [offerTitleEn, setOfferTitleEn] = useState("Comprehensive Medical Mastery Bundle (USMLE & Clinical Boards)");
  const [offerDescAr, setOfferDescAr] = useState("احصل على وصول فوري وغير محدود لجميع كورسات العلوم الأساسية والسريرية، بنوك الأسئلة، الملخصات التفاعلية، وحزم بطاقات Anki الرسمية بنقرة واحدة.");
  const [offerDescEn, setOfferDescEn] = useState("Get instant unlimited access to all basic & clinical science courses, high-yield QBanks, interactive notes, and official Anki decks in one complete package.");
  const [offerPriceAr, setOfferPriceAr] = useState("فقط 79$ بدلاً من 149$");
  const [offerPriceEn, setOfferPriceEn] = useState("Only $79 instead of $149");
  const [offerBtnAr, setOfferBtnAr] = useState("⚡ اشترك في العرض الشامل الآن ←");
  const [offerBtnEn, setOfferBtnEn] = useState("⚡ Claim All-In-One Bundle Now →");
  const [offerLink, setOfferLink] = useState("/my-courses");
  const [offerGuaranteeAr, setOfferGuaranteeAr] = useState("🔒 وصول فوري 100% • تحديثات دورية مستمرة • دعم أكاديمي مخصص");
  const [offerGuaranteeEn, setOfferGuaranteeEn] = useState("🔒 100% Instant Access • Continuous Curriculum Updates • 24/7 Academic Support");

  const [editOfferOpen, setEditOfferOpen] = useState(false);

  useEffect(() => {
    try {
      const savedOffer = localStorage.getItem("medicinety_home_offer_card");
      if (savedOffer) {
        const data = JSON.parse(savedOffer);
        if (data.showOfferCard !== undefined) setShowOfferCard(data.showOfferCard);
        if (data.showFreeCoursesBox !== undefined) setShowFreeCoursesBox(data.showFreeCoursesBox);
        if (data.showBundlesSection !== undefined) setShowBundlesSection(data.showBundlesSection);
        if (data.offerBadgeAr) setOfferBadgeAr(data.offerBadgeAr);
        if (data.offerBadgeEn) setOfferBadgeEn(data.offerBadgeEn);
        if (data.offerTitleAr) setOfferTitleAr(data.offerTitleAr);
        if (data.offerTitleEn) setOfferTitleEn(data.offerTitleEn);
        if (data.offerDescAr) setOfferDescAr(data.offerDescAr);
        if (data.offerDescEn) setOfferDescEn(data.offerDescEn);
        if (data.offerPriceAr) setOfferPriceAr(data.offerPriceAr);
        if (data.offerPriceEn) setOfferPriceEn(data.offerPriceEn);
        if (data.offerBtnAr) setOfferBtnAr(data.offerBtnAr);
        if (data.offerBtnEn) setOfferBtnEn(data.offerBtnEn);
        if (data.offerLink) setOfferLink(data.offerLink);
        if (data.offerGuaranteeAr) setOfferGuaranteeAr(data.offerGuaranteeAr);
        if (data.offerGuaranteeEn) setOfferGuaranteeEn(data.offerGuaranteeEn);
      }
    } catch (e) {
      console.error("Failed to load offer card state", e);
    }
  }, []);

  const saveOfferCardData = (data: any) => {
    try {
      const current = localStorage.getItem("medicinety_home_offer_card");
      const existing = current ? JSON.parse(current) : {};
      const updated = { ...existing, ...data };
      localStorage.setItem("medicinety_home_offer_card", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save offer card", e);
    }
  };


  // Load from localStorage on mount and language changes
  useEffect(() => {
    const checkAdminRole = () => {
      const role = localStorage.getItem("medicinety_user_role");
      const isPreview = localStorage.getItem("medicinety_preview_as_student") === "true";
      setIsAdmin(role === "admin" && !isPreview);
    };

    checkAdminRole();

    window.addEventListener("medicinety_role_change", checkAdminRole);
    window.addEventListener("medicinety_auth_change", checkAdminRole);
    window.addEventListener("storage", checkAdminRole);

    // Default Fallbacks
    const defaults = {
      heroHeadline: language === "ar" 
        ? "التحضير الطبي المكثف لاجتياز امتحانات USMLE والبورد والتميز السريري" 
        : "High-yield USMLE & medical board prep engineered for clinical mastery",
      bullet1: language === "ar" ? "فيديوهات شرح مكثفة لامتحانات USMLE" : "High-yield USMLE video lectures",
      bullet2: language === "ar" ? "ملخصات ومستندات دراسية شاملة" : "Comprehensive notes and study handouts",
      bullet3: language === "ar" ? "بطاقات تكرار متباعد تفاعلية ذكية" : "Interactive spaced flashcards",
      bullet4: language === "ar" ? "امتحانات وبنوك أسئلة وتدريبات سريرية" : "Clinical practice exams and QBanks",
      howToUseTitle: language === "ar" ? "دليل استخدام منصة ميديسينيتي" : "How to Use Medicinety",
      medicineSectionTitle: language === "ar" ? "الطب البشري" : "Medicine",
      medicineProgramTitle: language === "ar" ? "برنامج الطب البشري المتكامل" : "Medicine Program"
    };

    // Set initial values
    setHeroHeadline(defaults.heroHeadline);
    setBullet1(defaults.bullet1);
    setBullet2(defaults.bullet2);
    setBullet3(defaults.bullet3);
    setBullet4(defaults.bullet4);
    setHowToUseTitle(defaults.howToUseTitle);
    setMedicineSectionTitle(defaults.medicineSectionTitle);
    setMedicineProgramTitle(defaults.medicineProgramTitle);

    const saved = localStorage.getItem("medicinety_home_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        
        // Load language-specific fields
        const keys = [
          "heroHeadline", "bullet1", "bullet2", "bullet3", "bullet4",
          "howToUseTitle", "medicineSectionTitle", "medicineProgramTitle"
        ];
        
        keys.forEach(k => {
          const langKey = `${k}_${language}`;
          if (data[langKey] !== undefined && data[langKey] !== "") {
            if (k === "heroHeadline") setHeroHeadline(data[langKey]);
            if (k === "bullet1") setBullet1(data[langKey]);
            if (k === "bullet2") setBullet2(data[langKey]);
            if (k === "bullet3") setBullet3(data[langKey]);
            if (k === "bullet4") setBullet4(data[langKey]);
            if (k === "howToUseTitle") setHowToUseTitle(data[langKey]);
            if (k === "medicineSectionTitle") setMedicineSectionTitle(data[langKey]);
            if (k === "medicineProgramTitle") setMedicineProgramTitle(data[langKey]);
          } else {
            // Use clean fallback based on current language
            if (k === "heroHeadline") setHeroHeadline(defaults.heroHeadline);
            if (k === "bullet1") setBullet1(defaults.bullet1);
            if (k === "bullet2") setBullet2(defaults.bullet2);
            if (k === "bullet3") setBullet3(defaults.bullet3);
            if (k === "bullet4") setBullet4(defaults.bullet4);
            if (k === "howToUseTitle") setHowToUseTitle(defaults.howToUseTitle);
            if (k === "medicineSectionTitle") setMedicineSectionTitle(defaults.medicineSectionTitle);
            if (k === "medicineProgramTitle") setMedicineProgramTitle(defaults.medicineProgramTitle);
          }
        });
      } catch (e) {
        console.error("Failed to load home page state", e);
      }
    }
    hasLoadedRef.current = true;
  }, [language]);

  const handleContentInput = (key: string, value: any) => {
    try {
      const saved = localStorage.getItem("medicinety_home_state");
      const data = saved ? JSON.parse(saved) : {};
      const langKey = `${key}_${language}`;
      data[langKey] = value;
      if (language === "en") {
        data[key] = value;
      }
      localStorage.setItem("medicinety_home_state", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save content", e);
    }
  };

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result);
        handleContentInput("logoUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 min-h-screen text-brand-text pb-16 transition-colors duration-300 bg-white dark:bg-[#121212] relative overflow-x-hidden">
                              {/* 100% Full-Width Edge-to-Edge Hero Banner */}
      <section className="w-full bg-gradient-to-r from-[#0D9488] via-[#0A4D4E] to-[#0D9488] text-white py-12 md:py-16 px-6 lg:px-12 border-b-2 border-teal-500/40 shadow-2xl relative overflow-hidden select-none">
        
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1536px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side (Col 1 to 7): Headline & CTA Button */}
            <div className="lg:col-span-7 space-y-6">
              {isAdmin ? (
                <AutoResizeTextarea
                  value={heroHeadline}
                  onChange={(val: string) => {
                    setHeroHeadline(val);
                    handleContentInput("heroHeadline", val);
                  }}
                  className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white bg-white/10 border border-white/20 p-3 rounded-2xl outline-none focus:border-white w-full"
                  placeholder="Enter Hero Headline"
                />
              ) : (
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  {heroHeadline}
                </h1>
              )}

              {/* Sleek High-Converting Hero Free Courses Showcase (Admin Editable & Hideable) */}
              {showFreeCoursesBox ? (
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/25 rounded-3xl p-6 md:p-7 shadow-2xl space-y-4 relative overflow-hidden group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
                      <span>✨</span>
                      <span>{language === "ar" ? freeCardBadgeAr : freeCardBadgeEn}</span>
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditFreeCardOpen(true)}
                          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="تعديل الصندوق"
                        >
                          <span>✏️</span>
                          <span>{language === "ar" ? "تعديل" : "Edit"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowFreeCoursesBox(false);
                            saveOfferCardData({ showFreeCoursesBox: false });
                          }}
                          className="px-2.5 py-1 bg-black/30 hover:bg-red-500/80 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="إخفاء هذا الصندوق"
                        >
                          <span>👁️‍🗨️</span>
                          <span>{language === "ar" ? "إخفاء" : "Hide"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                      {language === "ar" ? freeCardTitleAr : freeCardTitleEn}
                    </h3>
                    <p className="text-xs md:text-sm text-teal-100 font-medium leading-relaxed max-w-xl">
                      {language === "ar" ? freeCardDescAr : freeCardDescEn}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={freeCardLink}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#00A3FF] to-[#00828A] hover:from-[#0092E6] hover:to-[#006E75] text-white text-xs md:text-sm font-black rounded-xl shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105 uppercase tracking-wider cursor-pointer"
                    >
                      <span>{language === "ar" ? freeCardBtnAr : freeCardBtnEn}</span>
                    </Link>
                  </div>
                </div>
              ) : (
                isAdmin ? (
                  <div className="p-4 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-between text-xs font-bold text-white">
                    <span>{language === "ar" ? "صندوق استكشاف الكورسات المجانية مخفي حالياً" : "Hero Free Courses Box is currently hidden"}</span>
                    <button
                      onClick={() => {
                        setShowFreeCoursesBox(true);
                        saveOfferCardData({ showFreeCoursesBox: true });
                      }}
                      className="px-3 py-1.5 bg-cyan-400 text-slate-950 rounded-xl font-black cursor-pointer hover:bg-cyan-300 transition-all"
                    >
                      {language === "ar" ? "إظهار الصندوق 👁️" : "Show Box 👁️"}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Link
                      href="/my-courses"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#00A3FF] hover:bg-[#0092E6] text-white text-sm font-black rounded-xl shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
                    >
                      {language === "ar" ? "شوف الكورسات المتاحة والمجانية ←" : "Explore Free & Available Courses →"}
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Right Side (Col 8 to 12): 4 Points with Checkmarks */}
            <div className="lg:col-span-5 space-y-5 select-none">
              
              {/* Item 1 */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-cyan-400 text-[#0A4D4E] font-black text-xs flex items-center justify-center shrink-0 shadow-md border border-white/40">
                  ✓
                </div>
                {isAdmin ? (
                  <input
                    type="text"
                    value={bullet1}
                    onChange={(e) => {
                      setBullet1(e.target.value);
                      handleContentInput("bullet1", e.target.value);
                    }}
                    className="text-base md:text-lg font-black text-white bg-white/10 border border-white/20 px-2 py-1 rounded-lg outline-none w-full"
                  />
                ) : (
                  <h4 className="text-base md:text-lg font-black text-white leading-snug">
                    {bullet1}
                  </h4>
                )}
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-cyan-400 text-[#0A4D4E] font-black text-xs flex items-center justify-center shrink-0 shadow-md border border-white/40">
                  ✓
                </div>
                {isAdmin ? (
                  <input
                    type="text"
                    value={bullet2}
                    onChange={(e) => {
                      setBullet2(e.target.value);
                      handleContentInput("bullet2", e.target.value);
                    }}
                    className="text-base md:text-lg font-black text-white bg-[#ffffff1a] border border-white/20 px-2 py-1 rounded-lg outline-none w-full"
                  />
                ) : (
                  <h4 className="text-base md:text-lg font-black text-white leading-snug">
                    {bullet2}
                  </h4>
                )}
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-cyan-400 text-[#0A4D4E] font-black text-xs flex items-center justify-center shrink-0 shadow-md border border-white/40">
                  ✓
                </div>
                {isAdmin ? (
                  <input
                    type="text"
                    value={bullet3}
                    onChange={(e) => {
                      setBullet3(e.target.value);
                      handleContentInput("bullet3", e.target.value);
                    }}
                    className="text-base md:text-lg font-black text-white bg-[#ffffff1a] border border-white/20 px-2 py-1 rounded-lg outline-none w-full"
                  />
                ) : (
                  <h4 className="text-base md:text-lg font-black text-white leading-snug">
                    {bullet3}
                  </h4>
                )}
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-cyan-400 text-[#0A4D4E] font-black text-xs flex items-center justify-center shrink-0 shadow-md border border-white/40">
                  ✓
                </div>
                {isAdmin ? (
                  <input
                    type="text"
                    value={bullet4}
                    onChange={(e) => {
                      setBullet4(e.target.value);
                      handleContentInput("bullet4", e.target.value);
                    }}
                    className="text-base md:text-lg font-black text-white bg-[#ffffff1a] border border-white/20 px-2 py-1 rounded-lg outline-none w-full"
                  />
                ) : (
                  <h4 className="text-base md:text-lg font-black text-white leading-snug">
                    {bullet4}
                  </h4>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>
      

      {/* Main content sections with standard margins */}
      <div className="w-full px-6 md:px-12 mt-10 space-y-12 xl:max-w-[1440px] mx-auto relative z-10">
        
        {/* Global Standard High-Conversion Special Offer Card */}
        {showOfferCard ? (
          <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-br from-slate-900 via-[#0A2628] to-slate-950 text-white shadow-2xl p-6 md:p-10 select-none">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              
              {/* Top Row: Badge & Admin Edit Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/20 uppercase tracking-wider animate-pulse">
                  <span>{language === "ar" ? offerBadgeAr : offerBadgeEn}</span>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditOfferOpen(true)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-teal-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>✏️</span>
                      <span>{language === "ar" ? "تعديل العرض" : "Edit Offer"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOfferCard(false);
                        saveOfferCardData({ showOfferCard: false });
                      }}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl text-xs font-bold text-red-300 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="إخفاء هذا العرض"
                    >
                      <span>👁️‍🗨️</span>
                      <span>{language === "ar" ? "إخفاء العرض" : "Hide"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Middle Section: Title, Description & Pricing Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Offer Copy */}
                <div className="lg:col-span-8 space-y-3">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {language === "ar" ? offerTitleAr : offerTitleEn}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
                    {language === "ar" ? offerDescAr : offerDescEn}
                  </p>

                  {/* 3 High-Yield Value Bullets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-bold text-teal-200">
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-amber-400">✓</span>
                      <span>{language === "ar" ? "وصول كامل لكافة الكورسات" : "All Medical Courses Included"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-amber-400">✓</span>
                      <span>{language === "ar" ? "حزم Anki الرسمية الأصلية" : "Official Anki Decks Included"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-amber-400">✓</span>
                      <span>{language === "ar" ? "بنك أسئلة وتدريبات تفاعلية" : "Clinical High-Yield QBank"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Box: Price & High-Conversion CTA */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-center space-y-4 shadow-xl">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {language === "ar" ? "السعر الخاص بالعرض:" : "SPECIAL OFFER PRICE:"}
                    </span>
                    <div className="text-xl md:text-2xl font-black text-amber-400 tracking-tight">
                      {language === "ar" ? offerPriceAr : offerPriceEn}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderItemTitle(language === "ar" ? offerTitleAr : offerTitleEn);
                      setOrderItemPrice(language === "ar" ? offerPriceAr : offerPriceEn);
                      setOrderRequestSent(false);
                      setOrderModalOpen(true);
                    }}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#00A3FF] to-[#00828A] hover:from-[#0092E6] hover:to-[#006E75] text-white text-xs md:text-sm font-black rounded-xl shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <span>{language === "ar" ? offerBtnAr : offerBtnEn}</span>
                  </button>

                  <p className="text-[10px] text-slate-400 font-medium leading-tight">
                    {language === "ar" ? offerGuaranteeAr : offerGuaranteeEn}
                  </p>
                </div>

              </div>

            </div>
          </div>
        ) : (
          isAdmin && (
            <div className="p-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-3">
              <span>{language === "ar" ? "مربع العرض الترويجي مخفي حالياً" : "Special Offer Card is currently hidden"}</span>
              <button
                onClick={() => {
                  setShowOfferCard(true);
                  saveOfferCardData({ showOfferCard: true });
                }}
                className="px-3 py-1 bg-[#0D9488] text-white rounded-lg cursor-pointer"
              >
                {language === "ar" ? "إظهار وتفعيل العرض" : "Show Offer Card"}
              </button>
            </div>
          )
        )}

        {/* AMBOSS-Style Subscription & Pricing Bundles Section (Hideable by Admin) */}
        {showBundlesSection ? (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-teal-500/10 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tight">
                {language === "ar" ? "باقات وعروض الاشتراك الشاملة (USMLE Bundles)" : "USMLE & Medical Mastery Bundles"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === "ar" ? "اختر الباقة المناسبة لمرحلتك الدراسية وتمتع بخصومات كبرى وتجربة متكاملة" : "Choose the perfect plan for your exam prep timeline and save with all-in-one access"}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddBundle}
                  className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+</span>
                  <span>{language === "ar" ? "إضافة باقة جديدة" : "Add Bundle"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBundlesSection(false);
                    saveOfferCardData({ showBundlesSection: false });
                  }}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                  title="إخفاء قسم الباقات"
                >
                  <span>👁️‍🗨️</span>
                  <span>{language === "ar" ? "إخفاء القسم" : "Hide"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => saveBundles(DEFAULT_BUNDLES)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200"
                  title="استعادة الباقات الافتراضية"
                >
                  {language === "ar" ? "الافتراضي" : "Reset"}
                </button>
              </div>
            )}
          </div>

          {/* 3 Bundles Grid (Exact AMBOSS Match with Berry/Crimson CTA buttons) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
            {pricingBundles.map((bundle) => {
              const title = language === "ar" ? bundle.title_ar : bundle.title_en;
              const subtitle = language === "ar" ? bundle.subtitle_ar : bundle.subtitle_en;
              const savings = language === "ar" ? bundle.savingsBadge_ar : bundle.savingsBadge_en;
              const paymentNote = language === "ar" ? bundle.paymentNote_ar : bundle.paymentNote_en;
              const btnText = language === "ar" ? bundle.btnText_ar : bundle.btnText_en;
              const features = language === "ar" ? (bundle.features_ar || bundle.features_en) : bundle.features_en;
              const bottomNote = language === "ar" ? bundle.bottomNote_ar : bundle.bottomNote_en;

              return (
                <div key={bundle.id} className="flex flex-col justify-between">
                  {/* Admin Controls Placed Cleanly Above the Card */}
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pb-2 px-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBundle(bundle)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-[#0D9488] hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        title="تعديل الباقة"
                      >
                        <span>✏️</span>
                        <span>{language === "ar" ? "تعديل" : "Edit"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBundle(bundle.id)}
                        className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        title="حذف الباقة"
                      >
                        <span>🗑️</span>
                        <span>{language === "ar" ? "حذف" : "Delete"}</span>
                      </button>
                    </div>
                  )}

                  <div className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative group select-none flex-1 ${
                    bundle.isPopular
                      ? "bg-white dark:bg-[#161616] border-2 border-[#0D9488] shadow-2xl md:-translate-y-3 ring-4 ring-[#0D9488]/15 z-10"
                      : "bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 hover:border-teal-500/40 hover:shadow-2xl shadow-xl"
                  }`}>
                    
                    {/* Standout "MOST POPULAR" Pill Badge for the highlighted card */}
                    {bundle.isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#0D9488] to-[#0A4D4E] text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <span>⭐</span>
                        <span>{language === "ar" ? "الأكثر طلباً وشيوعاً" : "MOST POPULAR"}</span>
                      </div>
                    )}

                  <div className="space-y-6">
                    
                    {/* Header: Title, Subtitle & Savings Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {subtitle}
                        </p>
                      </div>

                      {savings && (
                        <span className="text-xs font-black text-[#00828A] dark:text-teal-400 tracking-wider shrink-0 uppercase">
                          {savings}
                        </span>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="space-y-1">
                      <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {bundle.price}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {paymentNote}
                      </p>
                    </div>

                    {/* Big Conversion Button (Interactive Scheduler or Direct Link) */}
                    {bundle.btnLink?.startsWith("schedule_bundle") ? (
                      <button
                        onClick={() => {
                          const available = getAvailableCatalog();
                          const targetCount = bundle.btnLink === "schedule_bundle_5" ? 5 : 3;
                          const count = Math.min(targetCount, available.length > 0 ? available.length : targetCount);
                          setSelectedBundleCount(count);
                          setSchedulerSavedSuccess(false);
                          
                          const chosenList = available.slice(0, count);
                          const defaults = chosenList.map((c, idx) => {
                            const futureDate = new Date();
                            futureDate.setMonth(futureDate.getMonth() + (idx * 2));
                            const dateStr = futureDate.toISOString().split("T")[0];
                            
                            return {
                              id: c.id,
                              name_ar: c.name_ar,
                              name_en: c.name_en,
                              activationType: (idx === 0 ? "now" : "custom") as "now" | "custom",
                              customDate: idx === 0 ? "" : dateStr
                            };
                          });
                          
                          setSelectedCoursesWithDates(defaults);
                          setSchedulerModalOpen(true);
                        }}
                        className={`w-full py-3.5 px-6 text-white text-xs md:text-sm font-black rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center ${
                          bundle.isPopular
                            ? "bg-gradient-to-r from-[#A82D5C] to-[#801B41] hover:from-[#8F234C] hover:to-[#6E1435] shadow-pink-900/25 ring-2 ring-pink-500/20"
                            : "bg-[#A82D5C] hover:bg-[#8F234C] shadow-pink-900/10"
                        }`}
                      >
                        <span>{btnText}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderItemTitle(title);
                          setOrderItemPrice(bundle.price);
                          setOrderRequestSent(false);
                          setOrderModalOpen(true);
                        }}
                        className={`w-full py-3.5 px-6 text-white text-xs md:text-sm font-black rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center ${
                          bundle.isPopular
                            ? "bg-gradient-to-r from-[#A82D5C] to-[#801B41] hover:from-[#8F234C] hover:to-[#6E1435] shadow-pink-900/25 ring-2 ring-pink-500/20"
                            : "bg-[#A82D5C] hover:bg-[#8F234C] shadow-pink-900/10"
                        }`}
                      >
                        <span>{btnText}</span>
                      </button>
                    )}

                    {/* Features Checklist with Cyan Checkmarks */}
                    <div className="space-y-3 pt-2">
                      {features.map((feat, fidx) => (
                        <div key={fidx} className="flex items-start gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <span className="text-cyan-500 font-black text-sm shrink-0 mt-0.5">✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Bottom Audience Note */}
                  {bottomNote && (
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800/80">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                        {bottomNote}
                      </p>
                    </div>
                  )}

                  </div>
                </div>
              );
            })}
          </div>
        </section>
        ) : (
          isAdmin && (
            <div className="p-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-3">
              <span>{language === "ar" ? "قسم باقات الاشتراك (USMLE Bundles) مخفي حالياً" : "Pricing Bundles section is currently hidden"}</span>
              <button
                onClick={() => {
                  setShowBundlesSection(true);
                  saveOfferCardData({ showBundlesSection: true });
                }}
                className="px-3 py-1.5 bg-[#0D9488] text-white rounded-xl font-black cursor-pointer hover:bg-[#0A7268] transition-all"
              >
                {language === "ar" ? "إظهار قسم الباقات 👁️" : "Show Bundles 👁️"}
              </button>
            </div>
          )
        )}

        {/* Medicine Section (Category Selection) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-teal-500/10 pb-3">
            <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
            {isAdmin ? (
              <input
                type="text"
                value={medicineSectionTitle}
                onChange={(e) => {
                  setMedicineSectionTitle(e.target.value);
                  handleContentInput("medicineSectionTitle", e.target.value);
                }}
                className="bg-transparent border-none outline-none font-semibold text-xl md:text-2xl text-black dark:text-white tracking-tight focus:ring-0 focus:outline-none w-full pl-0 cursor-text select-text"
              />
            ) : (
              <h2 className="font-semibold text-xl md:text-2xl text-black dark:text-white tracking-tight">
                {medicineSectionTitle}
              </h2>
            )}
          </div>

          {/* Single Medicine Program Entry Card */}
          <Link href="/medicine" className="block">
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-teal-500/20 hover:border-[#0D9488]/40 rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-slate-950/20 relative overflow-hidden flex items-center group select-none"
            >
              <div className="flex items-center justify-between relative z-10 w-full">
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={medicineProgramTitle}
                      onChange={(e) => {
                        setMedicineProgramTitle(e.target.value);
                        handleContentInput("medicineProgramTitle", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none font-semibold text-lg text-black dark:text-white tracking-tight focus:ring-0 focus:outline-none w-full pl-0 cursor-text select-text"
                    />
                  ) : (
                    <h3 className="font-semibold text-lg text-black dark:text-white tracking-tight group-hover:text-[#0D9488] dark:group-hover:text-teal-400 transition-colors duration-200">
                      {medicineProgramTitle}
                    </h3>
                  )}
                </div>
                <span className="text-slate-400 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all text-base font-bold">→</span>
              </div>
            </motion.div>
          </Link>
        </section>
      </div>

      {/* Interactive Flexible Course Selection & Activation Scheduler Modal */}
      {schedulerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161616] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                  {selectedBundleCount === 5 ? (language === "ar" ? "عرض 3 + 2 مجاناً" : "Buy 3 + Get 2 FREE") : (language === "ar" ? "عرض 2 + 1 مجاناً" : "Buy 2 + Get 1 FREE")}
                </span>
                <h3 className="text-lg md:text-xl font-black text-black dark:text-white">
                  {language === "ar" ? `اختر ${selectedBundleCount} كورسات وحدد موعد تفعيل كل كورس` : `Select ${selectedBundleCount} Courses & Schedule Activation Dates`}
                </h3>
              </div>
              <button onClick={() => setSchedulerModalOpen(false)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white rounded-xl">
                ✕
              </button>
            </div>

            {schedulerSavedSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white text-xl flex items-center justify-center mx-auto shadow-md">
                  ✓
                </div>
                <h4 className="text-base font-black text-emerald-800 dark:text-emerald-300">
                  {language === "ar" ? "تم تثبيت وجدولة مواعيد تفعيل الكورسات بنجاح!" : "Course Selection & Activation Schedule Confirmed!"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {language === "ar" ? "تم تفعيل الكورسات المحددة (فوري)، وتمت جدولة الكورسات الأخرى للتفعيل التلقائي في المواعيد التي اخترتها دون أي مجهود." : "Active courses are available immediately, and scheduled courses will unlock on your chosen dates."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/my-courses"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl inline-block shadow-md"
                  >
                    {language === "ar" ? "الانتقال إلى لوحة كورساتي ←" : "Go to My Courses Dashboard →"}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const bundleTitle = selectedBundleCount === 5 
                  ? (language === "ar" ? "باقة 5 كورسات (اشتري 3 واحصل على 2 مجاناً)" : "5 Courses Bundle (Buy 3 Get 2 FREE)")
                  : (language === "ar" ? "باقة 3 كورسات (اشتري 2 واحصل على 1 مجاناً)" : "3 Courses Bundle (Buy 2 Get 1 FREE)");
                
                const durationLabel = selectedDuration === '4months' 
                  ? (language === "ar" ? " - 4 أشهر" : " - 4 Months") 
                  : selectedDuration === '1year' 
                    ? (language === "ar" ? " - سنة كاملة" : " - 1 Year") 
                    : (language === "ar" ? " - مدى الحياة" : " - Lifetime");
                
                const finalPrice = getBundleDynamicPrice(selectedBundleCount, selectedDuration);
                
                setOrderItemTitle(bundleTitle + durationLabel);
                setOrderItemPrice(finalPrice);
                setOrderRequestSent(false);
                setSchedulerModalOpen(false);
                setOrderModalOpen(true);
              }} className="space-y-5 text-xs font-bold">
                
                {/* 1. Subscription Duration Selector (4 Months, 1 Year, Lifetime) */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase text-[#0D9488]">
                    {language === "ar" ? "1. حدد مدة صلاحية الاشتراك للباقة:" : "1. Select Subscription Duration:"}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    {/* Option 1: 4 Months */}
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('4months')}
                      className={`p-3 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer relative ${
                        selectedDuration === '4months'
                          ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                          : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black dark:text-white">
                          {language === "ar" ? "4 أشهر (فصل دراسي)" : "4 Months (Semester)"}
                        </span>
                        <span className="text-xs font-black text-[#0D9488]">
                          {getBundleDynamicPrice(selectedBundleCount, '4months')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {language === "ar" ? "مثالي للمراجعة السريعة والامتحان الفصلي" : "Great for single semester exam prep"}
                      </p>
                    </button>

                    {/* Option 2: 1 Year (Popular) */}
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('1year')}
                      className={`p-3 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer relative ${
                        selectedDuration === '1year'
                          ? "bg-teal-50 dark:bg-teal-950/40 border-[#0D9488] ring-2 ring-[#0D9488]/30 shadow-md"
                          : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-500/30"
                      }`}
                    >
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full uppercase">
                        {language === "ar" ? "الأكثر طلباً" : "MOST POPULAR"}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black dark:text-white">
                          {language === "ar" ? "سنة كاملة (12 شهر)" : "1 Full Year (12 Mo)"}
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {getBundleDynamicPrice(selectedBundleCount, '1year')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {language === "ar" ? "تغطية شاملة للسنة الدراسية مع التفعيل المرن" : "Full year coverage with flexible start dates"}
                      </p>
                    </button>

                    {/* Option 3: Lifetime / Unlimited */}
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('lifetime')}
                      className={`p-3 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer relative ${
                        selectedDuration === 'lifetime'
                          ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                          : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black dark:text-white">
                          {language === "ar" ? "وصول دائم مدى الحياة" : "Lifetime Access"}
                        </span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                          {getBundleDynamicPrice(selectedBundleCount, 'lifetime')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {language === "ar" ? "طوال سنوات دراستك وتدريبك حتى التخرج" : "Permanent access until graduation and residency"}
                      </p>
                    </button>

                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black uppercase text-[#0D9488]">
                    {language === "ar" ? `2. اختر المواد الـ (${selectedBundleCount}) وحدد موعد بدء كل مادة:` : `2. Select Your ${selectedBundleCount} Courses & Set Activation Dates:`}
                  </label>
                </div>

                {/* Course Slots Selection List */}
                <div className="space-y-3">
                  {selectedCoursesWithDates.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-[#0D9488] uppercase">
                          {language === "ar" ? `الكورس رقم ${idx + 1}:` : `Course #${idx + 1}:`}
                        </span>

                        <select
                          value={item.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            const available = getAvailableCatalog();
                            const found = available.find(x => x.id === val) || { id: val, name_ar: val, name_en: val };
                            const updated = [...selectedCoursesWithDates];
                            updated[idx].id = found.id;
                            updated[idx].name_ar = found.name_ar;
                            updated[idx].name_en = found.name_en;
                            setSelectedCoursesWithDates(updated);
                          }}
                          className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs text-black dark:text-white outline-none focus:border-[#0D9488] shadow-sm cursor-pointer"
                        >
                          {getAvailableCatalog().map((c) => (
                            <option key={c.id} value={c.id}>
                              {language === "ar" ? c.name_ar : c.name_en}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Activation Timing: Lifetime vs Scheduled */}
                      {selectedDuration === 'lifetime' ? (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                            
                            <span>{language === "ar" ? "وصول دائم ومفتوح على طول (بدون أي تاريخ انتهاء)" : "Lifetime Permanent Access (No Expiry Date)"}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 text-[10px] font-black rounded-md">
                            {language === "ar" ? "نشط دائماً" : "Always Active"}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                              {language === "ar" ? "تاريخ بداية دراسة هذا الكورس:" : "Course Start Date (Activation):"}
                            </span>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                              {item.activationType === "now" 
                                ? (language === "ar" ? "يبدأ اليوم (فوري)" : "Starts Today") 
                                : (language === "ar" ? `يبدأ في: ${item.customDate || "2026-10-01"}` : `Starts on: ${item.customDate || "2026-10-01"}`)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...selectedCoursesWithDates];
                                updated[idx].activationType = "now";
                                setSelectedCoursesWithDates(updated);
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                item.activationType === "now"
                                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:border-teal-500/40"
                              }`}
                            >
                              
                              <span>{language === "ar" ? "البداية فوراً من اليوم" : "Start Today (Immediate)"}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...selectedCoursesWithDates];
                                  updated[idx].activationType = "custom";
                                  if (!updated[idx].customDate) updated[idx].customDate = "2026-10-01";
                                  setSelectedCoursesWithDates(updated);
                                }}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all flex-1 cursor-pointer ${
                                  item.activationType === "custom"
                                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black"
                                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:border-amber-500/40"
                                }`}
                              >
                                
                                <span>{language === "ar" ? "تحديد تاريخ البداية" : "Set Start Date"}</span>
                              </button>

                              {item.activationType === "custom" && (
                                <div className="flex flex-col">
                                  <input
                                    type="date"
                                    value={item.customDate || "2026-10-01"}
                                    min={new Date().toISOString().split("T")[0]}
                                    max={getMaxAllowedSchedulingDate(selectedBundleCount)}
                                    onChange={(e) => {
                                      const updated = [...selectedCoursesWithDates];
                                      updated[idx].customDate = e.target.value;
                                      setSelectedCoursesWithDates(updated);
                                    }}
                                    className="p-2 bg-white dark:bg-zinc-800 border-2 border-amber-500 rounded-xl text-xs font-bold text-black dark:text-white outline-none shadow-sm cursor-pointer"
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {item.activationType === "custom" && (
                            <div className="flex flex-col gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              <p>
                                {language === "ar" 
                                  ? `ℹ️ تبدأ صلاحية (${selectedDuration === '4months' ? 'الـ 4 أشهر' : 'السنة الكاملة'}) من تاريخ البداية المختار أعلاه.`
                                  : `ℹ️ Subscription duration starts counting on the chosen start date above.`}
                              </p>
                              <p className="text-slate-400 font-semibold">
                                {language === "ar"
                                  ? `⚠️ أقصى موعد مسموح لبدء الكورس هو خلال (${selectedBundleCount === 3 ? "سنة واحدة" : "سنتين"}) من اليوم.`
                                  : `⚠️ Maximum allowed start date is within ${selectedBundleCount === 3 ? "1 year" : "2 years"} from today.`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="space-y-0.5 text-left rtl:text-right">
                    <div className="text-xs text-slate-500 font-bold">
                      <span>{language === "ar" ? "إجمالي الباقة (" : "Total ("}</span>
                      <span className="text-black dark:text-white font-extrabold">
                        {selectedDuration === '4months' ? (language === "ar" ? "4 أشهر" : "4 Months") : selectedDuration === '1year' ? (language === "ar" ? "سنة كاملة" : "1 Year") : (language === "ar" ? "وصول دائم" : "Lifetime")}
                      </span>
                      <span>):</span>
                    </div>
                    <div className="text-lg md:text-xl font-black text-amber-500 tracking-tight">
                      {getBundleDynamicPrice(selectedBundleCount, selectedDuration)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSchedulerModalOpen(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer"
                    >
                      {language === "ar" ? "تأكيد الاشتراك ومتابعة الطلب" : "Confirm Schedule & Proceed"}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Branded Medicinety Confirm Delete Bundle Modal */}
      <ConfirmModal
        isOpen={Boolean(bundleToDelete)}
        title={language === "ar" ? "حذف باقة الاشتراك" : "Delete Pricing Bundle"}
        message={language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذه الباقة من واجهة المنصة؟" : "Are you sure you want to delete this pricing bundle from the platform?"}
        confirmText={language === "ar" ? "نعم، حذف الباقة" : "Yes, Delete Bundle"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        onConfirm={confirmDeleteBundleAction}
        onCancel={() => setBundleToDelete(null)}
      />

      {/* Admin Bundle Editor Modal */}
      {bundleModalOpen && editingBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <span>🛒</span>
                <span>{isEditingNewBundle ? (language === "ar" ? "إضافة باقة اشتراك جديدة" : "Add New Bundle") : (language === "ar" ? "تعديل باقة الاشتراك" : "Edit Subscription Bundle")}</span>
              </h3>
              <button onClick={() => setBundleModalOpen(false)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBundleModal} className="space-y-4 text-xs font-bold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">عنوان الباقة (عربي):</label>
                  <input type="text" value={editingBundle.title_ar} onChange={e => setEditingBundle({ ...editingBundle, title_ar: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Bundle Title (English):</label>
                  <input type="text" value={editingBundle.title_en} onChange={e => setEditingBundle({ ...editingBundle, title_en: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">العنوان الفرعي (عربي):</label>
                  <input type="text" value={editingBundle.subtitle_ar} onChange={e => setEditingBundle({ ...editingBundle, subtitle_ar: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Subtitle (English):</label>
                  <input type="text" value={editingBundle.subtitle_en} onChange={e => setEditingBundle({ ...editingBundle, subtitle_en: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">السعر (مثال: $448):</label>
                  <input type="text" value={editingBundle.price} onChange={e => setEditingBundle({ ...editingBundle, price: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black text-sm" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">شارة التوفير (عربي):</label>
                  <input type="text" value={editingBundle.savingsBadge_ar} onChange={e => setEditingBundle({ ...editingBundle, savingsBadge_ar: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Savings Badge (EN):</label>
                  <input type="text" value={editingBundle.savingsBadge_en} onChange={e => setEditingBundle({ ...editingBundle, savingsBadge_en: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">نص زر الشراء (عربي):</label>
                  <input type="text" value={editingBundle.btnText_ar} onChange={e => setEditingBundle({ ...editingBundle, btnText_ar: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Button Text (English):</label>
                  <input type="text" value={editingBundle.btnText_en} onChange={e => setEditingBundle({ ...editingBundle, btnText_en: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">رابط الشراء (URL أو مسار):</label>
                <input type="text" value={editingBundle.btnLink} onChange={e => setEditingBundle({ ...editingBundle, btnLink: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-mono" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">الميزات (عربي - ميزة في كل سطر):</label>
                  <textarea rows={4} value={(editingBundle.features_ar || []).join("\n")} onChange={e => setEditingBundle({ ...editingBundle, features_ar: e.target.value.split("\n").filter(Boolean) })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Features (English - one per line):</label>
                  <textarea rows={4} value={(editingBundle.features_en || []).join("\n")} onChange={e => setEditingBundle({ ...editingBundle, features_en: e.target.value.split("\n").filter(Boolean) })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">ملاحظة الفئة المستهدفة (عربي):</label>
                  <input type="text" value={editingBundle.bottomNote_ar} onChange={e => setEditingBundle({ ...editingBundle, bottomNote_ar: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Audience Note (English):</label>
                  <input type="text" value={editingBundle.bottomNote_en} onChange={e => setEditingBundle({ ...editingBundle, bottomNote_en: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                <input type="checkbox" id="isPopularCheck" checked={!!editingBundle.isPopular} onChange={e => setEditingBundle({ ...editingBundle, isPopular: e.target.checked })} className="w-4 h-4 text-[#0D9488] rounded" />
                <label htmlFor="isPopularCheck" className="text-xs font-black text-black dark:text-white cursor-pointer">
                  {language === "ar" ? "تمييز هذه الباقة كـ (الأكثر طلباً / Most Popular)" : "Highlight this bundle as Most Popular"}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setBundleModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer">
                  {language === "ar" ? "حفظ الباقة" : "Save Bundle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Hero Free Courses Box Editor Modal */}
      {editFreeCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <span>🎁</span>
                <span>{language === "ar" ? "تعديل صندوق استكشاف الكورسات المجانية" : "Edit Hero Free Courses Card"}</span>
              </h3>
              <button onClick={() => setEditFreeCardOpen(false)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setEditFreeCardOpen(false);
            }} className="space-y-3.5 text-xs font-bold">
              
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">الشارة الترويجية (عربي):</label>
                <input type="text" value={freeCardBadgeAr} onChange={e => setFreeCardBadgeAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Badge (English):</label>
                <input type="text" value={freeCardBadgeEn} onChange={e => setFreeCardBadgeEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">عنوان الصندوق الرئيسي (عربي):</label>
                <input type="text" value={freeCardTitleAr} onChange={e => setFreeCardTitleAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Title (English):</label>
                <input type="text" value={freeCardTitleEn} onChange={e => setFreeCardTitleEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">نص الشرح (عربي):</label>
                <textarea rows={2} value={freeCardDescAr} onChange={e => setFreeCardDescAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">نص زر التوجيه (عربي):</label>
                <input type="text" value={freeCardBtnAr} onChange={e => setFreeCardBtnAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">رابط الصفحة المقصودة:</label>
                <input type="text" value={freeCardLink} onChange={e => setFreeCardLink(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-mono" required />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setEditFreeCardOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer">
                  {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Offer Card Editor Modal */}
      {editOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <span>🎁</span>
                <span>{language === "ar" ? "تعديل مربع العرض الترويجي والخصومات" : "Edit Special Offer Box"}</span>
              </h3>
              <button onClick={() => setEditOfferOpen(false)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">
                <span className="text-lg">✕</span>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveOfferCardData({
                showOfferCard,
                offerBadgeAr, offerBadgeEn,
                offerTitleAr, offerTitleEn,
                offerDescAr, offerDescEn,
                offerPriceAr, offerPriceEn,
                offerBtnAr, offerBtnEn,
                offerLink,
                offerGuaranteeAr, offerGuaranteeEn
              });
              setEditOfferOpen(false);
            }} className="space-y-4 text-xs font-bold">

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                <div>
                  <h5 className="font-black text-black dark:text-white">{language === "ar" ? "ظهور مربع العرض في الصفحة:" : "Offer Box Visibility:"}</h5>
                  <p className="text-[10px] text-slate-400">{language === "ar" ? "إظهار أو إخفاء الصندوق الترويجي فوق قسم الطب" : "Toggle offer box above Medicine section"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfferCard(!showOfferCard)}
                  className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all ${
                    showOfferCard ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {showOfferCard ? (language === "ar" ? "مفعل (ظاهر) ✓" : "Visible ✓") : (language === "ar" ? "مخفي" : "Hidden")}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">شارة العرض (عربي):</label>
                  <input type="text" value={offerBadgeAr} onChange={e => setOfferBadgeAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Offer Badge (English):</label>
                  <input type="text" value={offerBadgeEn} onChange={e => setOfferBadgeEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">عنوان العرض الرئيسي (عربي):</label>
                  <input type="text" value={offerTitleAr} onChange={e => setOfferTitleAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Offer Title (English):</label>
                  <input type="text" value={offerTitleEn} onChange={e => setOfferTitleEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-black" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">شرح وتفاصيل العرض (عربي):</label>
                <textarea rows={2} value={offerDescAr} onChange={e => setOfferDescAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Offer Description (English):</label>
                <textarea rows={2} value={offerDescEn} onChange={e => setOfferDescEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">السعر المعروض (عربي):</label>
                  <input type="text" value={offerPriceAr} onChange={e => setOfferPriceAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Price Text (English):</label>
                  <input type="text" value={offerPriceEn} onChange={e => setOfferPriceEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">نص زر الاشتراك (عربي):</label>
                  <input type="text" value={offerBtnAr} onChange={e => setOfferBtnAr(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold" required />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Button Text (English):</label>
                  <input type="text" value={offerBtnEn} onChange={e => setOfferBtnEn(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-bold" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">رابط الزر (URL أو صفحة):</label>
                <input type="text" value={offerLink} onChange={e => setOfferLink(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-xl font-mono" placeholder="/my-courses أو رابط صفحة الشراء" required />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setEditOfferOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer">
                  {language === "ar" ? "حفظ ونشر العرض" : "Save & Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Home Order / Activation Request Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in text-left">
          <div className="w-full max-w-lg bg-white dark:bg-[#161616] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                  {language === "ar" ? "طلب تفعيل الاشتراك في العرض" : "Request Offer Activation"}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {language === "ar" ? "أدخل رقم هاتفك وسيتواصل معك فريق المنصة لتسليمك كود التفعيل:" : "Enter your contact details and our team will deliver your activation code:"}
                </p>
              </div>
              <button 
                onClick={() => setOrderModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selected Offer Details Pill */}
            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0D9488] tracking-wider block">
                  {language === "ar" ? "العرض / الباقة المختارة:" : "SELECTED PACKAGE:"}
                </span>
                <h4 className="text-sm font-black text-black dark:text-white mt-0.5">
                  {orderItemTitle}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-[#0D9488] dark:text-teal-400">
                  {orderItemPrice}
                </span>
              </div>
            </div>

            {orderRequestSent ? (
              <div className="p-5 bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-[#0D9488] dark:text-teal-300 rounded-2xl text-xs font-bold text-center space-y-2 animate-fade-in">
                <div className="text-2xl">✓</div>
                <h4 className="text-sm font-black">
                  {language === "ar" ? "تم استلام طلبك بنجاح!" : "Request Received Successfully!"}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === "ar" 
                    ? "سيتواصل معك فريق منصة Medicinety عبر الهاتف أو الواتساب خلال وقت قصير لتسليمك كود التفعيل وتأكيد اشتراكك." 
                    : "Our team will contact you shortly via phone/WhatsApp to deliver your activation code and confirm your subscription."}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-6 py-2 bg-[#0D9488] text-white text-xs font-black rounded-xl cursor-pointer"
                  >
                    {language === "ar" ? "حسناً، إغلاق" : "Close"}
                  </button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!orderPhoneNumber.trim()) return;
                  
                  // Save order request to localStorage
                  const orderObj = {
                    id: "ord_" + Date.now(),
                    packageTitle: orderItemTitle,
                    price: orderItemPrice,
                    phone: `${orderPhoneCountry} ${orderPhoneNumber.trim()}`,
                    studentName: orderStudentName.trim() || "Student",
                    createdAt: new Date().toISOString()
                  };
                  try {
                    const savedOrders = JSON.parse(localStorage.getItem("medicinety_order_requests") || "[]");
                    savedOrders.unshift(orderObj);
                    localStorage.setItem("medicinety_order_requests", JSON.stringify(savedOrders));
                  } catch (err) {}

                  setOrderRequestSent(true);
                }}
                className="space-y-4 text-xs font-bold"
              >
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                    {language === "ar" ? "اسم الطالب (اختياري):" : "Student Name (Optional):"}
                  </label>
                  <input
                    type="text"
                    value={orderStudentName}
                    onChange={(e) => setOrderStudentName(e.target.value)}
                    placeholder={language === "ar" ? "مثال: د. أحمد" : "e.g. Dr. Alex"}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-black dark:text-white outline-none focus:border-[#0D9488]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                    {language === "ar" ? "رقم الهاتف / الواتساب للتواصل وتأكيد التفعيل:" : "Mobile / WhatsApp Number for Activation:"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={orderPhoneCountry}
                      onChange={(e) => setOrderPhoneCountry(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-slate-200 px-2 py-2.5 rounded-xl outline-none font-bold cursor-pointer"
                    >
                      <option value="+962">🇯🇴 +962</option>
                      <option value="+970">🇵🇸 +970</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+964">🇮🇶 +964</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+963">🇸🇾 +963</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+961">🇱🇧 +961</option>
                    </select>
                    <input
                      type="tel"
                      required
                      value={orderPhoneNumber}
                      onChange={(e) => setOrderPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder={language === "ar" ? "رقم الهاتف (مثل: 791234567)" : "Phone number (e.g. 791234567)"}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-xl outline-none focus:border-[#0D9488] font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-4 py-2 text-slate-500 hover:text-black dark:hover:text-white text-xs font-bold"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {language === "ar" ? "إرسال طلب التفعيل" : "Send Activation Request"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
