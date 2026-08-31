"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  en: {
    home: "Home",
    myCourses: "My Courses",
    contactUs: "Contact Us",
    settings: "Settings",
    searchPlaceholder: "Search",
    signIn: "Sign In",
    signOut: "Sign Out",
    accessLibrary: "Access your library",
    adminPanel: "Admin Panel",
    platformOnboarding: "Platform Onboarding",
    instructionalVideo: "Instructional & Tutorial Video",
    lectures: "Lectures",
    handouts: "Study Handouts & Documents",
    flashcards: "Interactive Flashcards",
    exam: "Subject Board Examination",
    takeExam: "Take Exam",
    testKnowledge: "Test Your Knowledge",
    addCourse: "Add Course",
    activated: "Activated",
    aboutTitle: "About Medicinety",
    missionTitle: "Our Mission",
    valuesTitle: "Core Values",
    howToUse: "How to Use Medicinety",
    medicineProgram: "Medicine Program",
    generalPrinciples: "General Principles",
    systems: "Organ Systems",
    basicKnowledge: "Basic Science",
    clinicalKnowledge: "Clinical Science",
    language: "Language",
    selectLanguage: "Select Language",
    themeToggle: "Theme Toggle",
    accountDetails: "Account Details",
    billingPayments: "Billing & Payments",
    adminEdit: "Admin Edit",
    statistics: "Platform Statistics"
  },
  ar: {
    home: "الرئيسية",
    myCourses: "كورساتي",
    contactUs: "اتصل بنا",
    settings: "الإعدادات",
    searchPlaceholder: "بحث",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    accessLibrary: "الوصول إلى مكتبتك",
    adminPanel: "لوحة التحكم",
    platformOnboarding: "تعليمات المنصة",
    instructionalVideo: "الفيديو التعليمي والإرشادى",
    lectures: "المحاضرات",
    handouts: "الملخصات والمستندات الدراسية",
    flashcards: "البطاقات التعليمية التفاعلية",
    exam: "اختبار البورد للمادة",
    takeExam: "ابدأ الاختبار",
    testKnowledge: "اختبر معلوماتك",
    addCourse: "إضافة الكورس",
    activated: "تم تفعيل الكورس",
    aboutTitle: "حول ميديسينيتي",
    missionTitle: "رسالتنا",
    valuesTitle: "القيم الأساسية",
    howToUse: "كيف تستخدم ميديسينيتي",
    medicineProgram: "برنامج الطب",
    generalPrinciples: "المبادئ العامة",
    systems: "أجهزة الجسم",
    basicKnowledge: "العلوم الأساسية",
    clinicalKnowledge: "العلوم السريرية",
    language: "اللغة",
    selectLanguage: "اختر اللغة",
    themeToggle: "تغيير المظهر",
    accountDetails: "تفاصيل الحساب",
    billingPayments: "الفواتير والمدفوعات",
    adminEdit: "تعديل الأدمن",
    statistics: "إحصائيات المنصة"
  }
};

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("medicinety_language") as Language;
    if (saved === "en" || saved === "ar") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("medicinety_language", lang);
    window.dispatchEvent(new Event("medicinety_lang_change"));
  };

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: keyof typeof translations.en) => translations.en[key] || String(key)
    };
  }
  return context;
}
