"use client";

import ConfirmModal from '@/components/ConfirmModal';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  ArrowRight,
  ListPlus,
  Edit3,
  Table as TableIcon,
  Play, 
  CheckCircle, 
  FileText, 
  Download, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCw, 
  BookOpen, 
  AlertCircle,
  FileDown,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Award,
  Plus,
  PlayCircle,
  Layers,
  CheckSquare,
  X,
  GraduationCap,
  Trash2,
  Maximize,
  Minimize,
  Clock,
  Check
} from "lucide-react";
import { subjectData } from "@/data/subjectData";
import Breadcrumbs from "@/components/Breadcrumbs";
import * as CustomIcons from "@/components/CustomIcons";
import { useLanguage } from "@/components/LanguageContext";
import { getLivePlatformData, saveLivePlatformData } from "@/lib/supabase";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";

function getLetterGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "B-";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  if (score >= 60) return "C-";
  if (score >= 50) return "D";
  return "F";
}

const getEmbedUrl = (url: string | null, captions: "off" | "ar" | "en" | "auto" = "off") => {
  if (!url) return "";
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    const ccParam = captions !== "off" ? `&cc_load_policy=1&cc_lang_pref=${captions === "auto" ? "ar" : captions}` : "&cc_load_policy=0";
    return `https://www.youtube-nocookie.com/embed/${ytMatch[2]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&fs=0&controls=0${ccParam}`;
  }

  // Vimeo
  const vimeoRegExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegExp);
  if (vimeoMatch && vimeoMatch[1]) {
    const textTrack = captions !== "off" ? `&texttrack=${captions === "auto" ? "ar" : captions}` : "";
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&dnt=1&color=0d9488${textTrack}`;
  }

  return url;
};

const isEmbeddable = (url: string | null) => {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
};

interface Lecture {
  title: string;
  videoUrl: string;
  duration: string;
  status?: "ready" | "coming_soon";
  isFree?: boolean;
}

interface Flashcard {
  question: string;
  answer: string;
  reviewCount?: number;
  lastRating?: string;
  nextReviewDate?: string;
  intervalMinutes?: number;
  isCustom?: boolean;
}

interface Handout {
  name: string;
  type: string;
  size: string;
  fileUrl?: string;
  status?: "ready" | "coming_soon";
  isFree?: boolean;
  content?: string;
  imageUrl?: string;
  imageCaption?: string;
}

export default function SubjectDetailPage() {
  const { language, t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  // Resolve subject synchronously or dynamically
  const resolveSubject = () => {
    if (!subjectId) return null;
    if (subjectData[subjectId]) return subjectData[subjectId];

    if (typeof window !== "undefined") {
      try {
        const gpRaw = localStorage.getItem("medicinety_general_principles_list") || localStorage.getItem("medicinety_general_principles_modules");
        const sysRaw = localStorage.getItem("medicinety_systems_list") || localStorage.getItem("medicinety_systems_modules");
        const clinRaw = localStorage.getItem("medicinety_clinical_list") || localStorage.getItem("medicinety_clinical_modules");
        const allModules = [
          ...(gpRaw ? JSON.parse(gpRaw) : []),
          ...(sysRaw ? JSON.parse(sysRaw) : []),
          ...(clinRaw ? JSON.parse(clinRaw) : [])
        ];
        const match = allModules.find((m: any) => m.id === subjectId);
        if (match) {
          return {
            id: match.id,
            name: language === "ar" ? (match.name_ar || match.name || match.name_en) : (match.name_en || match.name || match.name_ar),
            name_en: match.name_en || match.name || "",
            name_ar: match.name_ar || match.name || "",
            description: language === "ar" ? (match.desc_ar || match.desc_en || match.description_ar || match.description) : (match.desc_en || match.desc_ar || match.description_en || match.description),
            category: match.category || (language === "ar" ? "مساق طبي مخصص" : "Medical Course"),
            iconName: "BookOpen",
            priceSemester: match.priceSemester || "$35",
            priceYearly: match.priceYearly || "$49",
            priceLifetime: match.priceLifetime || "$99",
            originalPriceSemester: match.originalPriceSemester || "",
            originalPriceYearly: match.originalPriceYearly || "",
            originalPriceLifetime: match.originalPriceLifetime || "",
            freeLecturesCount: match.freeLecturesCount !== undefined ? match.freeLecturesCount : 3,
            isPaid: match.isPaid !== undefined ? match.isPaid : true,
            status: match.status || "ready"
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Dynamic fallback for newly added custom courses (e.g. custom_*)
    return {
      id: subjectId,
      name: language === "ar" ? "مساق طبي جديد" : "New Medical Course",
      name_en: "New Medical Course",
      name_ar: "مساق طبي جديد",
      description: language === "ar" ? "منهاج شامل وشروحات طبية وسريرية متقدمة" : "Comprehensive syllabus, clinical correlates and question bank",
      category: language === "ar" ? "العلوم الطبية" : "Medical Sciences",
      iconName: "BookOpen",
      priceSemester: "$35",
      priceYearly: "$49",
      priceLifetime: "$99",
      freeLecturesCount: 3,
      isPaid: true,
      status: "ready"
    };
  };

  const [customSubject, setCustomSubject] = useState<any>(() => resolveSubject());

  useEffect(() => {
    setCustomSubject(resolveSubject());
  }, [subjectId, language]);

  const subject = customSubject || resolveSubject() || {
    id: subjectId || "custom",
    name: "Medical Course",
    description: "Medical Syllabus",
    category: "Medicine",
    iconName: "BookOpen",
    priceSemester: "$35",
    status: "ready"
  };

  const isCourseComingSoon = subject?.status === "coming_soon";

  if (isCourseComingSoon && !isAdmin) {
    return (
      <div className="flex-1 min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6 select-none">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-500/20">
              🔒 {language === "ar" ? "مساق غير فعال حالياً" : "Course Coming Soon"}
            </span>
            <h2 className="text-xl font-extrabold text-black dark:text-white tracking-tight">
              {subject?.name || (language === "ar" ? "هذا المساق قيد الإعداد" : "Course Under Development")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === "ar" 
                ? "هذا الكورس غير مفعل للطلاب حالياً وقيد الإعداد والتطوير بواسطة فريق التدريس. سيتوفر قريباً بنفس الجودة العالية!"
                : "This course is currently inactive for students and under preparation. It will be available soon with full clinical mastery!"
              }
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-500/10 cursor-pointer"
          >
            {language === "ar" ? "العودة للرئيسية" : "Return to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  interface ExamQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }

  interface Section {
    id: string;
    name: string;
    nameAr?: string;
    lectures: Lecture[];
    handouts: Handout[];
    flashcards: Flashcard[];
    questions: ExamQuestion[];
  }

  // Dynamic Content States (Initialized as empty placeholders for "Add Content" logic)
    // Course Pricing & Subscription Plans State
  const [coursePricing, setCoursePricing] = useState<{
    isPaid: boolean;
    price: string;
    originalPrice?: string;
    priceSemester?: string;
    originalPriceSemester?: string;
    priceYearly?: string;
    originalPriceYearly?: string;
    priceLifetime?: string;
    originalPriceLifetime?: string;
    freeLecturesCount: number;
  }>({
    isPaid: false,
    price: "$49",
    originalPrice: "",
    priceSemester: "$35",
    originalPriceSemester: "$60",
    priceYearly: "$49",
    originalPriceYearly: "$89",
    priceLifetime: "$99",
    originalPriceLifetime: "$149",
    freeLecturesCount: 3
  });
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallLectureTitle, setPaywallLectureTitle] = useState("");

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const hasLoadedRef = useRef(false);

  // Curriculum Sections States
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeTargetSectionId, setActiveTargetSectionId] = useState<string | null>(null);
  
  // Active Section Context Trackers for Syncing
  const [playSectionId, setPlaySectionId] = useState<string | null>(null);
  const [handoutSectionId, setHandoutSectionId] = useState<string | null>(null);
  const [studySectionId, setStudySectionId] = useState<string | null>(null);
  const isSyncingDisabled = useRef(false);

  // Video Player Fullscreen Tracker
  
  // Automatic Live Cloud Sync on any admin change to sections or pricing
  useEffect(() => {
    if (!hasLoadedRef.current || !sections || sections.length === 0) return;
    saveLivePlatformData(`medicinety_subject_${subjectId}_sections`, sections);
  }, [sections, subjectId]);

  useEffect(() => {
    if (!hasLoadedRef.current || !coursePricing) return;
    saveLivePlatformData(`medicinety_course_${subjectId}_pricing`, coursePricing);
  }, [coursePricing, subjectId]);

  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsPlayerFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Video Player Auto-Hiding Controls & Watermark (YouTube-Style Inactivity Timeout)
  const [isPlayerControlsVisible, setIsPlayerControlsVisible] = useState(true);
  const playerControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [playerSpeed, setPlayerSpeed] = useState(1);
  const [playerQuality, setPlayerQuality] = useState("Auto");
  const [playerVolume, setPlayerVolume] = useState(100);
  const [playerCaptions, setPlayerCaptions] = useState<"off" | "ar" | "en" | "auto">("off"); // Changed to number 0-100
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);



  const handlePlayerMouseMove = () => {
    setIsPlayerControlsVisible(true);
    if (playerControlsTimeoutRef.current) clearTimeout(playerControlsTimeoutRef.current);
    playerControlsTimeoutRef.current = setTimeout(() => {
      setIsPlayerControlsVisible(false);
    }, 3000);
  };

  const handlePlayerMouseLeave = () => {
    if (playerControlsTimeoutRef.current) clearTimeout(playerControlsTimeoutRef.current);
    playerControlsTimeoutRef.current = setTimeout(() => {
      setIsPlayerControlsVisible(false);
    }, 600);
  };

  // Section Modals
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionNameEn, setNewSectionNameEn] = useState("");
  const [newSectionNameAr, setNewSectionNameAr] = useState("");

  const [editSectionOpen, setEditSectionOpen] = useState(false);
    // Unified Confirm Modal States
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: "section" | "lecture" | "handout" | "flashcard" | "block" | "question";
    sectionId?: string;
    index?: number;
    targetId?: any;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "lecture",
    title: "",
    message: ""
  });
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionNameEn, setEditSectionNameEn] = useState("");
  const [editSectionNameAr, setEditSectionNameAr] = useState("");

  // Exam Question Addition inside Section Practice Exams
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionA, setNewOptionA] = useState("");
  const [newOptionB, setNewOptionB] = useState("");
  const [newOptionC, setNewOptionC] = useState("");
  const [newOptionD, setNewOptionD] = useState("");
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  // Subscription / Unlock States
  const [isCourseUnlocked, setIsCourseUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+962");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"semester" | "yearly" | "lifetime" | "other">("semester");
  const [contactRequestSent, setContactRequestSent] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockModalTab, setUnlockModalTab] = useState<"code" | "request">("code");
  const [codeAlert, setCodeAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });
  const [coursePrices, setCoursePrices] = useState({
    semester: "40",
    yearly: "60",
    lifetime: "129",
    other: "",
    otherValue: 0,
    otherUnit: "minutes",
    otherMinutes: 0
  });
  const [subjectName, setSubjectName] = useState(subject?.name || "");
  const [subjectDescription, setSubjectDescription] = useState(subject?.description || "");
  const [lecturesTitle, setLecturesTitle] = useState("Lectures");
  const [handoutsTitle, setHandoutsTitle] = useState("Study Handouts & Documents");
  const [flashcardsTitle, setFlashcardsTitle] = useState("Interactive Flashcards");
  const [examSectionTitle, setExamSectionTitle] = useState("Subject Board Examination");
  const [examSectionDesc, setExamSectionDesc] = useState("Test your board syllabus mastery by taking an electronic exam with customizable timer settings.");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("medicinety_logged_in_user"));
    };
    checkLogin();
    window.addEventListener("medicinety_auth_change", checkLogin);
    window.addEventListener("storage", checkLogin);
    return () => {
      window.removeEventListener("medicinety_auth_change", checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    // Load Course Pricing & Trial Settings
    const savedPricing = localStorage.getItem(`medicinety_course_${subjectId}_pricing`);
    if (savedPricing) {
      try {
        setCoursePricing(JSON.parse(savedPricing));
      } catch (e) {}
    }

    if (role === "admin") {
      setIsCourseUnlocked(true);
      return;
    }
    const user = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
    
    // Check dynamic subscription with expiration date
    getLivePlatformData(`medicinety_subscriptions_${user}`, []).then(liveSubs => {
      if (Array.isArray(liveSubs)) {
        const activeSub = liveSubs.find((s: any) => s.subjectId === subjectId);
        if (activeSub) {
          if (activeSub.expiresAt === null) {
            setIsCourseUnlocked(true);
          } else {
            const now = new Date();
            const expireDate = new Date(activeSub.expiresAt);
            if (now < expireDate) setIsCourseUnlocked(true);
          }
        }
      }
    });

    const subsRaw = localStorage.getItem(`medicinety_subscriptions_${user}`);
    const subsList = subsRaw ? JSON.parse(subsRaw) : [];
    const activeSub = subsList.find((s: any) => s.subjectId === subjectId);
    
    if (activeSub) {
      if (activeSub.expiresAt === null) {
        setIsCourseUnlocked(true);
      } else {
        const now = new Date();
        const expireDate = new Date(activeSub.expiresAt);
        if (now < expireDate) {
          setIsCourseUnlocked(true);
        } else {
          setIsCourseUnlocked(false);
        }
      }
    } else {
      // Backward compatibility check
      const unlocked = localStorage.getItem(`medicinety_unlocked_courses_${user}`);
      const unlockedList = unlocked ? JSON.parse(unlocked) : [];
      setIsCourseUnlocked(unlockedList.includes(subjectId));
    }

    // Active real-time timer to lock access automatically the exact moment subscription ends
    const autoExpireTimer = setInterval(() => {
      const u = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
      const sRaw = localStorage.getItem(`medicinety_subscriptions_${u}`);
      if (sRaw) {
        try {
          const sList = JSON.parse(sRaw);
          const sub = sList.find((s: any) => s.subjectId === subjectId);
          if (sub && sub.expiresAt) {
            const currentNow = new Date();
            const expDate = new Date(sub.expiresAt);
            if (currentNow >= expDate) {
              setIsCourseUnlocked(false);
            }
          }
        } catch (e) {}
      }
    }, 15000);

    return () => clearInterval(autoExpireTimer);
  }, [subjectId, unlockSuccess]);

  useEffect(() => {
    if (!subject) return;
    let savedModules = null;
    if (subject.category === "Organ Systems") {
      savedModules = localStorage.getItem("medicinety_systems_modules");
    } else {
      savedModules = localStorage.getItem("medicinety_general_principles_modules");
    }

    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        const match = parsed.find((m: any) => m.id === subjectId);
        if (match) {
          setCoursePrices({
            semester: match.priceSemester || "40",
            yearly: match.priceYearly || "60",
            lifetime: match.priceLifetime || "129",
            other: match.priceOther || "",
            otherValue: match.customDurationValue !== undefined ? match.customDurationValue : (match.customDurationMinutes || 0),
            otherUnit: match.customDurationUnit || "minutes",
            otherMinutes: match.customDurationMinutes || 0
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [subjectId, subject]);

  // Load from localStorage on mount/subject change
  useEffect(() => {
    try {
      const clickKey = `medicinety_clicks_${subjectId}`;
      const current = parseInt(localStorage.getItem(clickKey) || "0", 10);
      localStorage.setItem(clickKey, (current + 1).toString());
    } catch (e) {}

    const role = localStorage.getItem("medicinety_user_role");
    // Load Course Pricing & Trial Settings
    const savedPricing = localStorage.getItem(`medicinety_course_${subjectId}_pricing`);
    if (savedPricing) {
      try {
        setCoursePricing(JSON.parse(savedPricing));
      } catch (e) {}
    }

    setIsAdmin(role === "admin");

    hasLoadedRef.current = false;
    if (!subject) return;

    // Load subject name and description with Live Cloud Sync
    setSubjectName(subject.name || "");
    setSubjectDescription(subject.description || "");
    getLivePlatformData(`medicinety_subject_${subjectId}_meta`, null).then(meta => {
      if (meta) {
        if (meta.name) setSubjectName(meta.name);
        if (meta.description) setSubjectDescription(meta.description);
      }
    });

    // Load section headers
    setLecturesTitle("Lectures");
    setHandoutsTitle("Study Handouts & Documents");
    setFlashcardsTitle("Interactive Flashcards");
    setExamSectionTitle("Subject Board Examination");
    setExamSectionDesc("Test your board syllabus mastery by taking an electronic exam with customizable timer settings.");
    const savedHeaders = localStorage.getItem(`medicinety_subject_${subjectId}_headers`);
    if (savedHeaders) {
      try {
        const parsed = JSON.parse(savedHeaders);
        if (parsed.lecturesTitle) setLecturesTitle(parsed.lecturesTitle);
        if (parsed.handoutsTitle) setHandoutsTitle(parsed.handoutsTitle);
        if (parsed.flashcardsTitle) setFlashcardsTitle(parsed.flashcardsTitle);
        if (parsed.examSectionTitle) setExamSectionTitle(parsed.examSectionTitle);
        if (parsed.examSectionDesc) setExamSectionDesc(parsed.examSectionDesc);
      } catch (e) {}
    }

    // Load curriculum sections (with auto-migration from flat states)
    const savedSections = localStorage.getItem(`medicinety_subject_${subjectId}_sections`);
    if (savedSections) {
      try {
        let sectionsList = JSON.parse(savedSections);
        if (Array.isArray(sectionsList)) {
          let migrated = false;
          const seenIds = new Set<string>();
          sectionsList = sectionsList.map((sec: any, idx: number) => {
            let sId = sec.id;
            if (!sId || sId === "" || seenIds.has(sId)) {
              sId = `section_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`;
              migrated = true;
            }
            seenIds.add(sId);

            let secQuestions = sec.questions || [];
            if (secQuestions.length > 0) {
              const filteredQuestions = secQuestions.filter((q: any) => {
                const isPlaceholder = q.question.includes("A 54-year-old patient presents") || q.question.includes("Which secondary pharmacological");
                if (isPlaceholder) migrated = true;
                return !isPlaceholder;
              });
              if (filteredQuestions.length !== secQuestions.length) {
                secQuestions = filteredQuestions;
                migrated = true;
              }
            }

            return { ...sec, id: sId, questions: secQuestions };
          });

          if (migrated) {
            saveLivePlatformData(`medicinety_subject_${subjectId}_sections`, sectionsList);
          }
        }
        setSections(sectionsList);
      } catch (e) {
        console.error("Failed to load sections", e);
      }
    } else {
      let oldLectures = subject.lectures || [];
      let oldFlashcards = subject.flashcards || [];
      let oldHandouts = subject.handouts || [];

      const savedFlat = localStorage.getItem(`medicinety_subject_${subjectId}_state`);
      if (savedFlat) {
        try {
          const parsed = JSON.parse(savedFlat);
          if (parsed.lectures) oldLectures = parsed.lectures;
          if (parsed.flashcards) oldFlashcards = parsed.flashcards;
          if (parsed.handouts) oldHandouts = parsed.handouts;
        } catch (e) {}
      }

      let oldQuestions = [];
      const savedQuestions = localStorage.getItem(`medicinety_subject_${subjectId}_exam_questions`);
      if (savedQuestions) {
        try {
          oldQuestions = JSON.parse(savedQuestions);
        } catch (e) {}
      } else {
        oldQuestions = finalExamQuestions;
      }

      const initialSection: Section = {
        id: "default",
        name: "General Lectures & Resources",
        nameAr: "المحاضرات والمصادر العامة",
        lectures: oldLectures,
        handouts: oldHandouts,
        flashcards: oldFlashcards,
        questions: oldQuestions
      };

      setSections([initialSection]);
      saveLivePlatformData(`medicinety_subject_${subjectId}_sections`, [initialSection]);
    }

    const timer = setTimeout(() => {
      hasLoadedRef.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [subjectId, subject]);

  const handleSaveMeta = (nameVal: string, descVal: string) => {
    saveLivePlatformData(`medicinety_subject_${subjectId}_meta`, { name: nameVal, description: descVal });
  };

  const handleSaveHeaders = (key: string, value: string) => {
    try {
      const saved = localStorage.getItem(`medicinety_subject_${subjectId}_headers`);
      const data = saved ? JSON.parse(saved) : {};
      data[key] = value;
      saveLivePlatformData(`medicinety_subject_${subjectId}_headers`, data);
    } catch (e) {}
  };

  // Save sections to localStorage on changes
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (sections.length > 0) {
      saveLivePlatformData(`medicinety_subject_${subjectId}_sections`, sections);
    }
  }, [sections, subjectId]);

  // Accordion Expand & Load Handler
  const handleToggleSection = (sectionId: string | null) => {
    setActiveSectionId(sectionId);
    if (sectionId) {
      const sec = sections.find(s => s.id === sectionId);
      if (sec) {
        isSyncingDisabled.current = true;
        setLectures(sec.lectures || []);
        setHandouts(sec.handouts || []);
        setFlashcards(sec.flashcards || []);
        setPlaySectionId(sectionId);
        setHandoutSectionId(sectionId);
        setStudySectionId(sectionId);
        setTimeout(() => {
          isSyncingDisabled.current = false;
        }, 50);
      }
    } else {
      setPlaySectionId(null);
      setHandoutSectionId(null);
      setStudySectionId(null);
    }
  };

  // Sync back state changes to the active section object in sections list
  useEffect(() => {
    if (isSyncingDisabled.current) return;
    if (playSectionId) {
      setSections(prev => prev.map(sec => {
        if (sec.id === playSectionId) {
          return { ...sec, lectures };
        }
        return sec;
      }));
    }
  }, [lectures, playSectionId]);

  useEffect(() => {
    if (isSyncingDisabled.current) return;
    if (handoutSectionId) {
      setSections(prev => prev.map(sec => {
        if (sec.id === handoutSectionId) {
          return { ...sec, handouts };
        }
        return sec;
      }));
    }
  }, [handouts, handoutSectionId]);

  useEffect(() => {
    if (isSyncingDisabled.current) return;
    if (studySectionId) {
      setSections(prev => prev.map(sec => {
        if (sec.id === studySectionId) {
          return { ...sec, flashcards };
        }
        return sec;
      }));
    }
  }, [flashcards, studySectionId]);

  // Section Add / Edit / Delete Handlers
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    const nameEn = newSectionNameEn.trim();
    const nameAr = newSectionNameAr.trim();
    if (!nameEn) return;

    const newSec: Section = {
      id: `section_${Date.now()}`,
      name: nameEn,
      nameAr: nameAr || nameEn,
      lectures: [],
      handouts: [],
      flashcards: [],
      questions: []
    };

    setSections(prev => [...prev, newSec]);
    setNewSectionNameEn("");
    setNewSectionNameAr("");
    setAddSectionOpen(false);
  };

  const handleSaveEditSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSectionId) return;
    setSections(prev => prev.map(sec => {
      if (sec.id === editingSectionId) {
        return {
          ...sec,
          name: editSectionNameEn.trim() || sec.name,
          nameAr: editSectionNameAr.trim() || sec.nameAr || sec.name
        };
      }
      return sec;
    }));
    setEditSectionOpen(false);
    setEditingSectionId(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSectionToDelete(sectionId);
  };

  const confirmDeleteSectionAction = () => {
    if (!sectionToDelete) return;
    setSections(prev => prev.filter(sec => sec.id !== sectionToDelete));
    if (activeSectionId === sectionToDelete) {
      setActiveSectionId(null);
      setPlaySectionId(null);
      setHandoutSectionId(null);
      setStudySectionId(null);
    }
    setSectionToDelete(null);
  };

  const handleDeleteLecture = (sectionId: string, index: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.filter((_, idx) => idx !== index)
        };
      }
      return sec;
    }));
    if (playSectionId === sectionId) {
      setLectures(prev => prev.filter((_, idx) => idx !== index));
    }
    if (playSectionId === sectionId && activeLectureIdx === index) {
      setActiveLectureIdx(null);
    }
  };

  const handleDeleteHandout = (sectionId: string, index: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          handouts: sec.handouts.filter((_, idx) => idx !== index)
        };
      }
      return sec;
    }));
    if (handoutSectionId === sectionId) {
      setHandouts(prev => prev.filter((_, idx) => idx !== index));
    }
    if (handoutSectionId === sectionId && activeHandoutIdx === index) {
      setActiveHandoutIdx(null);
    }
  };

  const handleDeleteFlashcard = (sectionId: string, index: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          flashcards: sec.flashcards.filter((_, idx) => idx !== index)
        };
      }
      return sec;
    }));
    if (studySectionId === sectionId) {
      setFlashcards(prev => prev.filter((_, idx) => idx !== index));
    }
    if (studySectionId === sectionId && activeFlashcardIdx === index) {
      setActiveFlashcardIdx(null);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetSectionId) return;

    const newQ = {
      question: newQuestionText,
      options: [newOptionA, newOptionB, newOptionC, newOptionD].filter(Boolean),
      correctAnswer: newCorrectIndex,
      explanation: newExplanation
    };

    setSections(prev => prev.map(sec => {
      if (sec.id === activeTargetSectionId) {
        return {
          ...sec,
          questions: [...sec.questions, newQ]
        };
      }
      return sec;
    }));

    setNewQuestionText("");
    setNewOptionA("");
    setNewOptionB("");
    setNewOptionC("");
    setNewOptionD("");
    setNewCorrectIndex(0);
    setNewExplanation("");
    setAddQuestionOpen(false);
    setActiveTargetSectionId(null);
  };

  // Modal Open/Close States
  const [addLectureOpen, setAddLectureOpen] = useState(false);
  const [addFlashcardOpen, setAddFlashcardOpen] = useState(false);
  const [addHandoutOpen, setAddHandoutOpen] = useState(false);

  // Preview States
  const [activeLectureIdx, setActiveLectureIdx] = useState<number | null>(null);
  // Track course visit analytics
  useEffect(() => {
    if (!subjectId) return;
    try {
      const vKey1 = `medicinety_visits_${subjectId}`;
      const vKey2 = `medicinety_subject_${subjectId}_visits`;
      const current = parseInt(localStorage.getItem(vKey1) || localStorage.getItem(vKey2) || "0", 10);
      const next = current + 1;
      localStorage.setItem(vKey1, next.toString());
      localStorage.setItem(vKey2, next.toString());
    } catch (e) {}
  }, [subjectId]);

  // YT Player references
  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic API script loading
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT Player on active lecture changes
  useEffect(() => {
    if (activeLectureIdx === null) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      ytPlayerRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      const iframeEl = document.querySelector(`#player_wrap_${activeLectureIdx} iframe`) as HTMLIFrameElement;
      if (iframeEl) {
        if (!iframeEl.id) {
          iframeEl.id = `yt_iframe_${activeLectureIdx}`;
        }
        if ((window as any).YT && (window as any).YT.Player) {
          ytPlayerRef.current = new (window as any).YT.Player(iframeEl.id, {
            events: {
              onReady: (event: any) => {
                const duration = event.target.getDuration();
                setVideoDuration(duration);
                // Load progress from localStorage
                const savedKey = `medicinety_progress_${subjectId}_${activeLectureIdx}`;
                const savedTime = parseFloat(localStorage.getItem(savedKey) || "0");
                if (savedTime > 0) {
                  event.target.seekTo(savedTime, true);
                  setCurrentTime(savedTime);
                }
              },
              onStateChange: (event: any) => {
                setIsPlaying(event.data === 1);
                // If video ends (state === 0), seek back to 0 and pause immediately to hide related videos shelf!
                if (event.data === 0) {
                  try {
                    event.target.seekTo(0, true);
                    event.target.pauseVideo();
                    setCurrentTime(0);
                    setIsPlaying(false);
                  } catch (e) {}
                }
              }
            }
          });
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [activeLectureIdx, subjectId]);

  // Apply settings to video/iframe in real-time
  const applyVideoSettings = (speedVal: number, volumeVal: number, qualityVal: string) => {
    // 1. Native Video Element
    const videoEl = document.querySelector(`#player_wrap_${activeLectureIdx} video`) as HTMLVideoElement;
    if (videoEl) {
      videoEl.playbackRate = speedVal;
      videoEl.volume = volumeVal / 100;
      videoEl.muted = volumeVal === 0;
    }

    // 2. YouTube Player Instance
    if (ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.setPlaybackRate === "function") {
          ytPlayerRef.current.setPlaybackRate(speedVal);
        }
        if (typeof ytPlayerRef.current.setVolume === "function") {
          ytPlayerRef.current.setVolume(volumeVal);
        }
        let ytQuality = "default";
        if (qualityVal === "1080p") ytQuality = "hd1080";
        else if (qualityVal === "720p") ytQuality = "hd720";
        else if (qualityVal === "480p") ytQuality = "large";

        if (typeof ytPlayerRef.current.setPlaybackQuality === "function") {
          ytPlayerRef.current.setPlaybackQuality(ytQuality);
        }
      } catch (err) {}
    }
  };

  // Trigger settings application on change
  useEffect(() => {
    if (activeLectureIdx !== null) {
      const timer = setTimeout(() => {
        applyVideoSettings(playerSpeed, playerVolume, playerQuality);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [playerSpeed, playerVolume, playerQuality, activeLectureIdx]);

  // Video progress and play state tracking
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === undefined) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Continuous progress checking & local persistence
  useEffect(() => {
    if (isPlaying && activeLectureIdx !== null) {
      progressIntervalRef.current = setInterval(() => {
        // 1. YouTube Player
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          try {
            const time = ytPlayerRef.current.getCurrentTime();
            const duration = ytPlayerRef.current.getDuration();
            if (time !== undefined && !isNaN(time)) {
              setCurrentTime(time);
              const savedKey = `medicinety_progress_${subjectId}_${activeLectureIdx}`;
              localStorage.setItem(savedKey, time.toString());
            }
            if (duration !== undefined && !isNaN(duration) && duration > 0) {
              setVideoDuration(duration);
            }
          } catch (e) {}
        }
        // 2. Native Video
        const vidEl = document.querySelector(`#player_wrap_${activeLectureIdx} video`) as HTMLVideoElement;
        if (vidEl) {
          setCurrentTime(vidEl.currentTime);
          setVideoDuration(vidEl.duration);
          const savedKey = `medicinety_progress_${subjectId}_${activeLectureIdx}`;
          localStorage.setItem(savedKey, vidEl.currentTime.toString());
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, activeLectureIdx, subjectId]);
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState<number | null>(null);
  
  // Anki Active Recall Session States
  const [ankiQueue, setAnkiQueue] = useState<number[]>([]);
  const [ankiQueueIdx, setAnkiQueueIdx] = useState<number>(0);
  const [ankiStats, setAnkiStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [ankiCompleted, setAnkiCompleted] = useState(false);

  const startAnkiSession = (dailyNewLimit: number = 20) => {
    if (!flashcards || flashcards.length === 0) return;

    const now = new Date().getTime();
    const dueReviewIndices: number[] = [];
    const newUnstudiedIndices: number[] = [];

    flashcards.forEach((card, idx) => {
      if (card.nextReviewDate) {
        const reviewTime = new Date(card.nextReviewDate).getTime();
        if (reviewTime <= now) {
          dueReviewIndices.push(idx); // Due for cumulative review today!
        }
      } else {
        newUnstudiedIndices.push(idx); // Unstudied new cards!
      }
    });

    // Batch up to dailyNewLimit new cards
    const todaysNewBatch = newUnstudiedIndices.slice(0, dailyNewLimit);

    // Combine due reviews + new cards (Cumulative Daily Queue)
    const combinedQueue = [...dueReviewIndices, ...todaysNewBatch];

    // Fallback if all cards are reviewed and future-scheduled: load all
    const finalQueue = combinedQueue.length > 0 ? combinedQueue : Array.from({ length: flashcards.length }, (_, i) => i);

    setAnkiQueue(finalQueue);
    setAnkiQueueIdx(0);
    setAnkiStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setAnkiCompleted(false);
    setIsFlipped(false);
    setActiveFlashcardIdx(finalQueue[0]);
  };

  const getAnkiIntervalLabel = (rating: "again" | "hard" | "good" | "easy", revCount: number) => {
    if (revCount < 2) {
      // First and Second review: Exact Anki Desktop screenshot intervals
      switch (rating) {
        case "again": return "<1m";
        case "hard": return "<6m";
        case "good": return "<10m";
        case "easy": return "3d";
      }
    } else {
      // Third review and later: Updated requested intervals
      switch (rating) {
        case "again": return "<5m";
        case "hard": return "10m";
        case "good": return "30m";
        case "easy": return "5d";
      }
    }
  };

  const handleAnkiRate = (rating: "again" | "hard" | "good" | "easy") => {
    setAnkiStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    setIsFlipped(false);

    const currCardIdx = ankiQueue.length > 0 ? ankiQueue[ankiQueueIdx] : (activeFlashcardIdx || 0);
    const card = flashcards[currCardIdx];
    const revCount = (card as any)?.reviewCount || 0;

    let intervalMinutes = 1;
    if (revCount < 2) {
      if (rating === "again") intervalMinutes = 1;
      else if (rating === "hard") intervalMinutes = 6;
      else if (rating === "good") intervalMinutes = 10;
      else if (rating === "easy") intervalMinutes = 4320; // 3 days
    } else {
      if (rating === "again") intervalMinutes = 5;
      else if (rating === "hard") intervalMinutes = 10;
      else if (rating === "good") intervalMinutes = 30;
      else if (rating === "easy") intervalMinutes = 7200; // 5 days
    }

    const nextReviewDate = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();

    if (flashcards && flashcards[currCardIdx]) {
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currCardIdx] = {
        ...updatedFlashcards[currCardIdx],
        reviewCount: revCount + 1,
        lastRating: rating,
        nextReviewDate: nextReviewDate,
        intervalMinutes: intervalMinutes
      };
      setFlashcards(updatedFlashcards);

      try {
        const loggedUser = localStorage.getItem("medicinety_logged_in_user") || "guest";
        const schedKey = `medicinety_anki_schedule_${loggedUser}_${subjectId}`;
        localStorage.setItem(schedKey, JSON.stringify(updatedFlashcards));
      } catch (e) {}
    }

    let nextQueue = [...ankiQueue];
    
    // If rating is AGAIN or HARD:
    if (rating === "again" || rating === "hard") {
      const remainingTotal = nextQueue.length - (ankiQueueIdx + 1);
      if (remainingTotal <= 1 && flashcards.length > 1) {
        // If this is the last remaining card, insert a refresher mini-batch of 5-10 cards so the student reviews them and then sees this card again!
        const refresherBatch: number[] = [];
        for (let i = 0; i < Math.min(6, flashcards.length); i++) {
          const randIdx = (currCardIdx + i + 1) % flashcards.length;
          if (randIdx !== currCardIdx) refresherBatch.push(randIdx);
        }
        nextQueue.push(...refresherBatch, currCardIdx);
      } else {
        nextQueue.push(currCardIdx);
      }
    }
    // If rating is EASY: it does NOT get re-queued in this session (Mastered permanently)

    const nextIdx = ankiQueueIdx + 1;
    if (nextIdx >= nextQueue.length) {
      setAnkiCompleted(true);
    } else {
      setAnkiQueue(nextQueue);
      setAnkiQueueIdx(nextIdx);
    }
  };
  const [activeHandoutIdx, setActiveHandoutIdx] = useState<number | null>(null);

  useEffect(() => {
    if (activeLectureIdx === null) return;
    const interval = setInterval(() => {
      try {
        const key = `medicinety_watchtime_${subjectId}`;
        const current = parseInt(localStorage.getItem(key) || "0", 10);
        localStorage.setItem(key, (current + 1).toString());
        localStorage.setItem(`medicinety_subject_${subjectId}_watchtime`, (current + 1).toString());
        
        const globalKey = "medicinety_global_watchtime";
        const globalVal = parseInt(localStorage.getItem(globalKey) || "0", 10);
        localStorage.setItem(globalKey, (globalVal + 1).toString());
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLectureIdx, subjectId]);

  // Form Input States
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureUrl, setNewLectureUrl] = useState("");
  const [newLectureStatus, setNewLectureStatus] = useState<"ready" | "coming_soon">("ready");
  const [newLectureIsFree, setNewLectureIsFree] = useState(false);
  const [newHandoutIsFree, setNewHandoutIsFree] = useState(false);
  // Rich Note Editor & Reader States
  const [addRichNoteOpen, setAddRichNoteOpen] = useState(false);
  const [richNoteTitle, setRichNoteTitle] = useState("");
  const [richNoteContent, setRichNoteContent] = useState("");
  const [richNoteImageUrl, setRichNoteImageUrl] = useState("");
  const [richNoteImageCaption, setRichNoteImageCaption] = useState("");
  const [activeReadingNote, setActiveReadingNote] = useState<Handout | null>(null);

  const [newHandoutStatus, setNewHandoutStatus] = useState<"ready" | "coming_soon">("ready");
  // Active dropdown menu states
  const [activeLectureMenu, setActiveLectureMenu] = useState<{ sectionId: string; lidx: number } | null>(null);
  const [activeHandoutMenu, setActiveHandoutMenu] = useState<{ sectionId: string; hidx: number } | null>(null);
  // Edit Lecture/Handout states
  const [editLectureOpen, setEditLectureOpen] = useState(false);
  const [editingLectureSectionId, setEditingLectureSectionId] = useState<string | null>(null);
  const [editingLectureIdx, setEditingLectureIdx] = useState<number | null>(null);

  const [editHandoutOpen, setEditHandoutOpen] = useState(false);
  const [editingHandoutSectionId, setEditingHandoutSectionId] = useState<string | null>(null);
  const [editingHandoutIdx, setEditingHandoutIdx] = useState<number | null>(null);
  const [subjectComingSoonOpen, setSubjectComingSoonOpen] = useState(false);
  const [subjectComingSoonTitle, setSubjectComingSoonTitle] = useState("");
  const [newLectureDuration, setNewLectureDuration] = useState("00:00");
  const [detectingDuration, setDetectingDuration] = useState(false);

  useEffect(() => {
    if (!newLectureUrl.trim()) return;
    
    setDetectingDuration(true);
    let cancelled = false;

    // 1. Try server API detection (works for YouTube & Vimeo)
    fetch(`/api/video-duration?url=${encodeURIComponent(newLectureUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data && data.duration) {
          setNewLectureDuration(data.duration);
          if (!newLectureTitle.trim() && data.title) {
            setNewLectureTitle(data.title);
          }
          setDetectingDuration(false);
        } else if (!isEmbeddable(newLectureUrl)) {
          // 2. Fallback to HTML5 video element for direct MP4 links
          const tempVideo = document.createElement("video");
          tempVideo.src = newLectureUrl;
          tempVideo.onloadedmetadata = () => {
            if (cancelled) return;
            const durationSec = tempVideo.duration;
            if (durationSec && !isNaN(durationSec)) {
              const mins = Math.floor(durationSec / 60);
              const secs = Math.floor(durationSec % 60);
              const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              setNewLectureDuration(formatted);
            }
            setDetectingDuration(false);
          };
          tempVideo.onerror = () => {
            if (!cancelled) setDetectingDuration(false);
          };
        } else {
          setDetectingDuration(false);
        }
      })
      .catch(() => {
        if (!cancelled) setDetectingDuration(false);
      });

    return () => {
      cancelled = true;
    };
  }, [newLectureUrl]);

  const [newFlashcardQuestion, setNewFlashcardQuestion] = useState("");
  const [newFlashcardAnswer, setNewFlashcardAnswer] = useState("");

  const [newHandoutName, setNewHandoutName] = useState("");
  const [newHandoutSize, setNewHandoutSize] = useState("1.5 MB");
  const [newHandoutType, setNewHandoutType] = useState("PDF Study Sheet");
  const [newHandoutUrl, setNewHandoutUrl] = useState("");

  // Interactive State for Flashcard flip preview
  const [isFlipped, setIsFlipped] = useState(false);

  // "Test Your Knowledge" (Lecture-Specific Quiz States)
  const [activeLectureQuizIdx, setActiveLectureQuizIdx] = useState<number | null>(null);
  const [lectureQuizSelectedOption, setLectureQuizSelectedOption] = useState<number | null>(null);
  const [lectureQuizSubmitted, setLectureQuizSubmitted] = useState(false);
  const [lectureQuizScore, setLectureQuizScore] = useState(0);

  // Final Course Exam Blocks States & Question Management
  const [examBlocks, setExamBlocks] = useState<any[]>([]);
  const [allExamQuestions, setAllExamQuestions] = useState<any[]>([]);
  const [targetBlockIdForQ, setTargetBlockIdForQ] = useState<number | null>(null);
  const [showAddQModal, setShowAddQModal] = useState(false);
  const [showManageQModal, setShowManageQModal] = useState(false);

  // Question Form & Edit States
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [modalQText, setModalQText] = useState("");
  const [modalQImage, setModalQImage] = useState("");
  const [modalQOptions, setModalQOptions] = useState<string[]>([
    "A. ", "B. ", "C. ", "D. ", "E. "
  ]);
  const [modalQCorrectIdx, setModalQCorrectIdx] = useState(0);
  const [modalQExplanation, setModalQExplanation] = useState("");
  const [modalQClinicalPearl, setModalQClinicalPearl] = useState("");
  
  // Custom Table in Add Question Modal
  const [modalHasTable, setModalHasTable] = useState(false);
  const [modalTableHeaders, setModalTableHeaders] = useState<string[]>([
    "Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"
  ]);
  const [modalTableRows, setModalTableRows] = useState<string[][]>([
    ["A", "840", "330", "132", "23"],
    ["B", "670", "325", "147", "26"],
    ["C", "410", "268", "131", "27"],
    ["D", "145", "322", "152", "22"],
    ["E", "490", "310", "130", "14"]
  ]);

  const loadAllQuestions = () => {
    // If explicitly saved in localStorage, respect it even if empty []
    const savedBlocksQ = localStorage.getItem(`medicinety_subject_${subjectId}_exam_blocks_q`);
    if (savedBlocksQ !== null) {
      try {
        const parsed = JSON.parse(savedBlocksQ);
        if (Array.isArray(parsed)) {
          setAllExamQuestions(parsed);
          return;
        }
      } catch (e) {}
    }

    let loaded: any[] = [];

    // 2. Fallback to general exam questions if empty
    if (loaded.length === 0) {
      const savedExamQ = localStorage.getItem(`medicinety_subject_${subjectId}_exam_questions`);
      if (savedExamQ) {
        try {
          const parsed = JSON.parse(savedExamQ);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loaded = parsed.map((q: any, i: number) => ({
              ...q,
              id: q.id || `q_${i}`,
              blockNumber: Number(q.blockNumber) || 1
            }));
          }
        } catch (e) {}
      }
    }

    // 3. Fallback to section questions if empty
    if (loaded.length === 0) {
      const savedSections = localStorage.getItem(`medicinety_subject_${subjectId}_sections`);
      if (savedSections) {
        try {
          const parsed = JSON.parse(savedSections);
          if (Array.isArray(parsed)) {
            const allSecQ: any[] = [];
            parsed.forEach((s: any) => {
              if (Array.isArray(s.questions)) {
                allSecQ.push(...s.questions);
              }
            });
            if (allSecQ.length > 0) {
              loaded = allSecQ.map((q: any, i: number) => ({
                ...q,
                id: q.id || `q_${i}`,
                blockNumber: Number(q.blockNumber) || 1
              }));
            }
          }
        } catch (e) {}
      }
    }

    if (loaded.length > 0) {
      // Ensure all items have a numeric blockNumber
      const normalized = loaded.map(q => ({
        ...q,
        blockNumber: Number(q.blockNumber) || 1
      }));
      setAllExamQuestions(normalized);
      saveLivePlatformData(`medicinety_subject_${subjectId}_exam_blocks_q`, normalized);
      return;
    }
    // Default seed questions
    const defaults = [
      {
        id: "b1_q1",
        blockNumber: 1,
        question: "A 36-year-old woman comes to the physician for evaluation of unintentional weight gain of 5.5 kg (12.2 lb) and irregular menstrual cycles over the past 2 months. She does not take any medications. Her blood pressure is 155/85 mm Hg. Physical examination shows central obesity, hyperpigmentation of the palmar creases, and violaceous scarring of the abdomen. Early morning serum cortisol levels are elevated and serum adrenocorticotropic hormone (ACTH) is within the reference range after a low-dose dexamethasone suppression test. A high-dose dexamethasone suppression test shows suppression of ACTH. Further evaluation is most likely to show which of the following findings?",
        options: [
          "A. Atrophy of the pituitary gland",
          "B. Benign adenoma of the adrenal medulla",
          "C. Nodular hypertrophy of the zona reticularis",
          "D. Bilateral hyperplasia of the zona fasciculata",
          "E. Unilateral carcinoma of the adrenal cortex"
        ],
        correctAnswer: 3,
        explanation: "This patient presents with Cushing disease (ACTH-secreting pituitary adenoma). Suppression of cortisol/ACTH with a high-dose (8 mg) dexamethasone suppression test but not with a low-dose test is diagnostic of a pituitary ACTH-secreting adenoma.",
        clinicalPearl: "High-dose dexamethasone suppression test suppresses pituitary ACTH secretion (Cushing disease) but does NOT suppress ectopic ACTH production."
      },
      {
        id: "b1_q2",
        blockNumber: 1,
        question: "A 62-year-old man is brought to the emergency room by his wife because of worsening confusion and weakness for 3 days. He has type 2 diabetes mellitus, for which he takes insulin. Five days ago, he developed an upper respiratory tract infection. As a result, he has not been following his normal diet and insulin administration schedule. On arrival, he is lethargic and oriented only to self. His vital signs are within normal limits. Urinalysis shows 3+ glucose. Serum test for beta-hydroxybutyrate is negative. Fluid replacement therapy is initiated. Which of the following sets of laboratory values is most likely expected on further evaluation of this patient?",
        tableData: {
          headers: ["Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg H₂O)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"],
          rows: [
            ["A", "840", "330", "132", "23"],
            ["B", "670", "325", "147", "26"],
            ["C", "410", "268", "131", "27"],
            ["D", "145", "322", "152", "22"],
            ["E", "490", "310", "130", "14"]
          ]
        },
        options: ["A. A", "B. B", "C. C", "D. D", "E. E"],
        correctAnswer: 0,
        explanation: "This patient presents with Hyperosmolar Hyperglycemic State (HHS), characterized by marked hyperglycemia (>600 mg/dL), severe hyperosmolality (>320 mOsmol/kg), absence of significant ketoacidosis.",
        clinicalPearl: "HHS vs DKA: HHS is characterized by higher glucose (>600 mg/dL), higher osmolality (>320 mOsmol/kg), and normal/near-normal pH and bicarbonate with absent ketones."
      }
    ];
    setAllExamQuestions(defaults);
    saveLivePlatformData(`medicinety_subject_${subjectId}_exam_blocks_q`, defaults);
  };
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockDesc, setNewBlockDesc] = useState("");
  const [newBlockDuration, setNewBlockDuration] = useState(60);

  useEffect(() => {
    if (!subjectId) return;

    // 1. Always load all questions
    loadAllQuestions();

    // 2. Load Blocks without re-injecting deleted blocks
    const savedBlocks = localStorage.getItem(`medicinety_subject_${subjectId}_blocks_list`);
    if (savedBlocks !== null) {
      try {
        const parsed = JSON.parse(savedBlocks);
        if (Array.isArray(parsed)) {
          setExamBlocks(parsed); // Allow empty array [] if admin deleted all blocks!
        }
      } catch (e) {
        setExamBlocks([]);
      }
    } else {
      // Only set initial default block once if key never existed before
      const defaultBlocks = [{ id: 1, title: "Block 1: Clinical Case Vignettes", desc: "Comprehensive timed board simulation covering high-yield concepts.", duration: 60, questionCount: 20 }];
      setExamBlocks(defaultBlocks);
      saveLivePlatformData(`medicinety_subject_${subjectId}_blocks_list`, defaultBlocks);
    }

    // Listen for cross-component exam updates
    const handleQUpdate = () => loadAllQuestions();
    window.addEventListener("medicinety_exam_updated", handleQUpdate);
    return () => window.removeEventListener("medicinety_exam_updated", handleQUpdate);
  }, [subjectId]);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = examBlocks.length > 0 ? Math.max(...examBlocks.map(b => b.id || 1)) + 1 : 1;
    const created = {
      id: nextId,
      title: newBlockName.trim() || `Block ${nextId}: Clinical Simulation`,
      desc: newBlockDesc.trim() || "Timed clinical examination block.",
      duration: Number(newBlockDuration) || 60,
      questionCount: 20
    };
    const updated = [...examBlocks, created];
    setExamBlocks(updated);
    saveLivePlatformData(`medicinety_subject_${subjectId}_blocks_list`, updated);
    setShowAddBlockModal(false);
    setNewBlockName("");
    setNewBlockDesc("");
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setTargetBlockIdForQ(Number(q.blockNumber) || 1);
    setModalQText(q.question || "");
    setModalQImage(q.questionImageUrl || "");
    setModalQOptions(q.options && q.options.length > 0 ? q.options : ["A. ", "B. ", "C. ", "D. ", "E. "]);
    setModalQCorrectIdx(q.correctAnswer ?? 0);
    setModalQExplanation(q.explanation || "");
    setModalQClinicalPearl(q.clinicalPearl || "");
    
    if (q.tableData && q.tableData.headers) {
      setModalHasTable(true);
      setModalTableHeaders(q.tableData.headers);
      setModalTableRows(q.tableData.rows || []);
    } else {
      setModalHasTable(false);
    }

    setShowManageQModal(false);
    setShowAddQModal(true);
  };

  const handleOpenAddQForBlock = (blockId: number) => {
    setEditingQuestionId(null);
    setTargetBlockIdForQ(blockId);
    setModalQText("");
    setModalQImage("");
    setModalQOptions(["A. ", "B. ", "C. ", "D. ", "E. "]);
    setModalQCorrectIdx(0);
    setModalQExplanation("");
    setModalQClinicalPearl("");
    setModalHasTable(false);
    setShowAddQModal(true);
  };

  const handleSaveModalQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBlockIdForQ) return;

    const qData = {
      id: editingQuestionId || `q_${Date.now()}`,
      blockNumber: targetBlockIdForQ,
      question: modalQText.trim(),
      questionImageUrl: modalQImage.trim() || undefined,
      tableData: modalHasTable ? { headers: modalTableHeaders, rows: modalTableRows } : undefined,
      options: modalQOptions.filter(o => o.trim().length > 0),
      correctAnswer: modalQCorrectIdx,
      explanation: modalQExplanation.trim(),
      clinicalPearl: modalQClinicalPearl.trim() || undefined
    };

    let updated: any[] = [];
    if (editingQuestionId) {
      updated = allExamQuestions.map(q => q.id === editingQuestionId ? qData : q);
    } else {
      updated = [...allExamQuestions, qData];
    }

    setAllExamQuestions(updated);
    saveLivePlatformData(`medicinety_subject_${subjectId}_exam_blocks_q`, updated);
    setShowAddQModal(false);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestionFromBlock = (qId: string) => {
    const updated = allExamQuestions.filter(q => q.id !== qId);
    setAllExamQuestions(updated);
    saveLivePlatformData(`medicinety_subject_${subjectId}_exam_blocks_q`, updated);
  };

  const handleDeleteBlock = (blockId: number) => {
    if (true) {
      const updated = examBlocks.filter(b => b.id !== blockId);
      setExamBlocks(updated);
      saveLivePlatformData(`medicinety_subject_${subjectId}_blocks_list`, updated);
      
      // Also remove questions of this block
      const updatedQ = allExamQuestions.filter(q => Number(q.blockNumber || 1) !== Number(blockId));
      setAllExamQuestions(updatedQ);
      saveLivePlatformData(`medicinety_subject_${subjectId}_exam_blocks_q`, updatedQ);
    }
  };

    // Final Course Exam States
  const [activeFinalExamIndex, setActiveFinalExamIndex] = useState(0);
  const [finalExamSelectedOption, setFinalExamSelectedOption] = useState<number | null>(null);
  const [finalExamSubmitted, setFinalExamSubmitted] = useState(false);
  const [finalExamScore, setFinalExamScore] = useState(0);
  const [finalExamFinished, setFinalExamFinished] = useState(false);

  // Auth Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register" | "forgot">("login");
  const [authIsVerifiedSuccess, setAuthIsVerifiedSuccess] = useState(false);
  const [authShowConfirmModal, setAuthShowConfirmModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authUniversity, setAuthUniversity] = useState("");
  const [authSpecialization, setAuthSpecialization] = useState("");
  const [authHearAboutUs, setAuthHearAboutUs] = useState("");
  const [authOtp, setAuthOtp] = useState(["", "", "", "", "", ""]);
  const [authIsOtpState, setAuthIsOtpState] = useState(false);
  const [authIsVerifying, setAuthIsVerifying] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<any>(null);

  const requireAuth = (callback: () => void) => {
    const loggedIn = localStorage.getItem("medicinety_logged_in_user");
    if (!loggedIn) {
      setPendingCallback(() => callback);
      setAuthModalOpen(true);
      return;
    }
    callback();
  };

  const requireUnlock = (callback: () => void) => {
    requireAuth(() => {
      if (!isCourseUnlocked && !isAdmin) {
        setPendingCallback(() => callback);
        setUnlockModalOpen(true);
        return;
      }
      callback();
    });
  };

  if (!subject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-brand-bg text-brand-text p-6 text-center">
        <div className="p-4 bg-rose-500/10 text-rose-600 rounded-lg mb-4 shadow-sm">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">Subject Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          The module code you requested does not exist or has not been configured in our database.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-500/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </div>
    );
  }

  const Icon = (CustomIcons as any)[subject.iconName] || (Icons as any)[subject.iconName] || BookOpen;

  // Add Content Submits
  const handleToggleLectureFree = (sectionId: string, lidx: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const updated = [...sec.lectures];
        updated[lidx] = { ...updated[lidx], isFree: !updated[lidx].isFree };
        return { ...sec, lectures: updated };
      }
      return sec;
    }));
    if (playSectionId === sectionId) {
      setLectures(prev => {
        const updated = [...prev];
        updated[lidx] = { ...updated[lidx], isFree: !updated[lidx].isFree };
        return updated;
      });
    }
  };

  const handleToggleHandoutFree = (sectionId: string, hidx: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const updated = [...sec.handouts];
        updated[hidx] = { ...updated[hidx], isFree: !updated[hidx].isFree };
        return { ...sec, handouts: updated };
      }
      return sec;
    }));
    if (handoutSectionId === sectionId) {
      setHandouts(prev => {
        const updated = [...prev];
        updated[hidx] = { ...updated[hidx], isFree: !updated[hidx].isFree };
        return updated;
      });
    }
  };

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) return;
    const item: Lecture = {
      title: newLectureTitle,
      videoUrl: newLectureStatus === "coming_soon" ? "" : newLectureUrl,
      duration: newLectureStatus === "coming_soon" ? "Coming Soon" : newLectureDuration,
      status: newLectureStatus
    };

    const targetId = activeTargetSectionId || playSectionId || (sections[0] ? sections[0].id : "default");

    setSections(prev => prev.map(sec => {
      if (sec.id === targetId) {
        return {
          ...sec,
          lectures: [...sec.lectures, item]
        };
      }
      return sec;
    }));

    if (playSectionId === targetId) {
      setLectures(prev => [...prev, item]);
    }

    setNewLectureTitle("");
    setNewLectureUrl("");
    setNewLectureStatus("ready");
    setAddLectureOpen(false);
  };

  const handleOpenEditLecture = (sectionId: string, idx: number) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const lec = sec.lectures[idx];
    if (!lec) return;

    setEditingLectureSectionId(sectionId);
    setEditingLectureIdx(idx);
    setNewLectureTitle(lec.title);
    setNewLectureUrl(lec.videoUrl || "");
    setNewLectureDuration(lec.duration || "");
    setNewLectureStatus(lec.status || "ready");
    setEditLectureOpen(true);
  };

  const handleSaveEditLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) return;
    if (editingLectureSectionId === null || editingLectureIdx === null) return;

    const item: Lecture = {
      title: newLectureTitle,
      videoUrl: newLectureStatus === "coming_soon" ? "" : newLectureUrl,
      duration: newLectureStatus === "coming_soon" ? "Coming Soon" : newLectureDuration,
      status: newLectureStatus
    };

    setSections(prev => prev.map(sec => {
      if (sec.id === editingLectureSectionId) {
        const updatedLectures = [...sec.lectures];
        updatedLectures[editingLectureIdx] = item;
        return {
          ...sec,
          lectures: updatedLectures
        };
      }
      return sec;
    }));

    if (playSectionId === editingLectureSectionId) {
      setLectures(prev => {
        const updated = [...prev];
        updated[editingLectureIdx] = item;
        return updated;
      });
    }

    setNewLectureTitle("");
    setNewLectureUrl("");
    setNewLectureStatus("ready");
    setEditLectureOpen(false);
    setEditingLectureSectionId(null);
    setEditingLectureIdx(null);
  };

    const handleDirectDownloadHandout = (file: Handout) => {
    if (!file) return;
    const fileUrl = file.fileUrl || "/pdfs/sample-notes.pdf";
    const fileName = file.name.endsWith(".pdf") ? file.name : `${file.name}.pdf`;
    
    if (fileUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenEditHandout = (sectionId: string, idx: number) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const file = sec.handouts[idx];
    if (!file) return;

    setEditingHandoutSectionId(sectionId);
    setEditingHandoutIdx(idx);
    setNewHandoutName(file.name);
    setNewHandoutUrl(file.fileUrl || "");
    setNewHandoutSize(file.size || "");
    setNewHandoutType(file.type || "");
    setNewHandoutStatus(file.status || "ready");
    setEditHandoutOpen(true);
  };

  const handleSaveEditHandout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandoutName.trim()) return;
    if (editingHandoutSectionId === null || editingHandoutIdx === null) return;

    const item: Handout = {
      name: newHandoutName.endsWith(".pdf") ? newHandoutName : `${newHandoutName}.pdf`,
      size: newHandoutStatus === "coming_soon" ? "Coming Soon" : newHandoutSize,
      type: newHandoutStatus === "coming_soon" ? "PDF Document" : newHandoutType,
      fileUrl: newHandoutStatus === "coming_soon" ? "" : (newHandoutUrl.trim() || "/pdfs/sample-notes.pdf"),
      status: newHandoutStatus
    };

    setSections(prev => prev.map(sec => {
      if (sec.id === editingHandoutSectionId) {
        const updatedHandouts = [...sec.handouts];
        updatedHandouts[editingHandoutIdx] = item;
        return {
          ...sec,
          handouts: updatedHandouts
        };
      }
      return sec;
    }));

    if (handoutSectionId === editingHandoutSectionId) {
      setHandouts(prev => {
        const updated = [...prev];
        updated[editingHandoutIdx] = item;
        return updated;
      });
    }

    setNewHandoutName("");
    setNewHandoutUrl("");
    setNewHandoutStatus("ready");
    setEditHandoutOpen(false);
    setEditingHandoutSectionId(null);
    setEditingHandoutIdx(null);
  };


  // Export Section Flashcards to Genuine Dynamic Anki Package (.apkg)
  const [isExportingAnki, setIsExportingAnki] = useState(false);

  const handleDownloadAnkiDeck = async (section: Section) => {
    const cardsToExport = (section.flashcards && section.flashcards.length > 0) 
      ? section.flashcards 
      : flashcards;

    if (!cardsToExport || cardsToExport.length === 0) {
      alert(language === "ar" ? "لا توجد فلاش كاردز مضافة في هذا القسم بعد! يرجى إضافة بطاقات أولاً بالضغط على (+ Add Flashcard)." : "No flashcards in this section yet! Please add flashcards first using (+ Add Flashcard).");
      return;
    }

    try {
      setIsExportingAnki(true);
      const deckTitle = `Medicinety - ${subjectName || subject.name} - ${section.name || "Flashcards"}`;
      
      const response = await fetch("/api/export-anki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName: deckTitle,
          cards: cardsToExport
        })
      });

      if (!response.ok) {
        throw new Error("API failed to generate apkg");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanFileName = `Medicinety_${subjectId}_${section.id || "deck"}.apkg`;
      link.setAttribute("download", cleanFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Generating client-side Anki import file fallback...", err);
      // Fallback: Generate 100% Anki-compatible TSV import file
      let content = `#separator:tab\n#html:true\n#deck:Medicinety :: ${subjectName || subject.name} :: ${section.name}\n#tags:Medicinety ${subjectId}\n`;
      cardsToExport.forEach(c => {
        const q = c.question.replace(/\t/g, " ").replace(/\n/g, "<br>");
        const a = c.answer.replace(/\t/g, " ").replace(/\n/g, "<br>");
        content += `${q}\t${a}\n`;
      });

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Medicinety_${subjectId}_${section.id}_AnkiDeck.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingAnki(false);
    }
  };

  const handleSetAnkiUrl = (sectionId: string) => {
    const current = localStorage.getItem(`medicinety_${subjectId}_${sectionId}_anki_url`) || "";
    const url = prompt(language === "ar" ? "أدخل رابط تحميل ملف حزمة أنكي المباشر (.apkg URL):" : "Enter Direct Anki Deck (.apkg) Download URL:", current);
    if (url !== null) {
      saveLivePlatformData(`medicinety_${subjectId}_${sectionId}_anki_url`, url.trim());
      alert(language === "ar" ? "تم حفظ رابط حزمة Anki بنجاح!" : "Anki Deck URL saved successfully!");
    }
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlashcardQuestion.trim() || !newFlashcardAnswer.trim()) return;
    const item: Flashcard = {
      question: newFlashcardQuestion.trim(),
      answer: newFlashcardAnswer.trim()
    };

    const targetId = activeTargetSectionId || studySectionId || (sections[0] ? sections[0].id : "default");

    setSections(prev => {
      const nextSections = prev.map(sec => {
        if (sec.id === targetId) {
          const currentCards = Array.isArray(sec.flashcards) ? sec.flashcards : [];
          return {
            ...sec,
            flashcards: [...currentCards, item]
          };
        }
        return sec;
      });
      saveLivePlatformData(`medicinety_subject_${subjectId}_sections`, nextSections);
      return nextSections;
    });

    if (studySectionId === targetId) {
      setFlashcards(prev => [...prev, item]);
    }

    setNewFlashcardQuestion("");
    setNewFlashcardAnswer("");
    setAddFlashcardOpen(false);
  };

  const handleSaveRichNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!richNoteTitle.trim()) return;

    const item: Handout = {
      name: richNoteTitle.trim(),
      type: "Interactive Note",
      size: "Rich Article",
      status: "ready",
      content: richNoteContent.trim(),
      imageUrl: richNoteImageUrl.trim(),
      imageCaption: richNoteImageCaption.trim()
    };

    const targetId = activeTargetSectionId || handoutSectionId || (sections[0] ? sections[0].id : "default");

    setSections(prev => prev.map(sec => {
      if (sec.id === targetId) {
        return {
          ...sec,
          handouts: [...sec.handouts, item]
        };
      }
      return sec;
    }));

    if (handoutSectionId === targetId) {
      setHandouts(prev => [...prev, item]);
    }

    setRichNoteTitle("");
    setRichNoteContent("");
    setRichNoteImageUrl("");
    setRichNoteImageCaption("");
    setAddRichNoteOpen(false);
  };

  const handleAddHandout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandoutName.trim()) return;
    const item: Handout = {
      name: newHandoutName.endsWith(".pdf") ? newHandoutName : `${newHandoutName}.pdf`,
      size: newHandoutStatus === "coming_soon" ? "Coming Soon" : newHandoutSize,
      type: newHandoutStatus === "coming_soon" ? "PDF Document" : newHandoutType,
      fileUrl: newHandoutStatus === "coming_soon" ? "" : (newHandoutUrl.trim() || "/pdfs/sample-notes.pdf"),
      status: newHandoutStatus
    };

    const targetId = activeTargetSectionId || handoutSectionId || (sections[0] ? sections[0].id : "default");

    setSections(prev => prev.map(sec => {
      if (sec.id === targetId) {
        return {
          ...sec,
          handouts: [...sec.handouts, item]
        };
      }
      return sec;
    }));

    if (handoutSectionId === targetId) {
      setHandouts(prev => [...prev, item]);
    }

    setNewHandoutName("");
    setNewHandoutUrl("");
    setNewHandoutStatus("ready");
    setAddHandoutOpen(false);
  };

  // Mock Quiz Questions for Lecture-Specific "Test Your Knowledge"
  const mockLectureQuizQuestions = [
    {
      question: "Which of the following describes the key initial diagnostic step or physiological response related to this specific lesson?",
      options: [
        "Upregulation of secondary messenger receptors",
        "Reduction of cellular resting membrane potentials",
        "Activation of high-affinity vascular feedback loops",
        "Degranulation of chemical mediators in target cells"
      ],
      correctAnswer: 0,
      explanation: "In this specific diagnostic scenario, receptor-mediated secondary messenger pathways (such as cAMP or IP3) are upregulated to compensate for initial physiological stress before tissue cellular adaptations manifest."
    }
  ];

  // Final Exam Questions
  const finalExamQuestions: any[] = [];

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      <div className="w-full px-4 mt-8 space-y-10 xl:max-w-[1440px] mx-auto">
        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* Subject Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group select-none">
          <div className="flex items-center gap-5 relative z-10">
            
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D9488] bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-200/20 inline-block select-none">
                  {subject.category}
                </span>

                {/* Course Pricing Status Badge with Clean Dollar & Strikethrough */}
                {coursePricing.isPaid ? (
                  <div className="flex items-center gap-2 select-none">
                    {coursePricing.originalPriceSemester && (
                      <span className="line-through text-slate-400 dark:text-slate-500 text-xs font-bold">
                        {coursePricing.originalPriceSemester.startsWith("$") ? coursePricing.originalPriceSemester : `$${coursePricing.originalPriceSemester}`}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-[#0D9488] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-xl border border-teal-500/30 inline-flex items-center gap-1.5 shadow-sm">
                      <span>{language === "ar" ? `اشتراكات تبدأ من ${coursePricing.priceSemester?.startsWith("$") ? coursePricing.priceSemester : `$${coursePricing.priceSemester || "35"}`}` : `Plans from ${coursePricing.priceSemester?.startsWith("$") ? coursePricing.priceSemester : `$${coursePricing.priceSemester || "35"}`}`}</span>
                      <span className="text-slate-300 dark:text-zinc-600">•</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{coursePricing.freeLecturesCount > 0 
                        ? (language === "ar" ? `أول ${coursePricing.freeLecturesCount} محاضرات مجاناً` : `First ${coursePricing.freeLecturesCount} Lectures Free`) 
                        : (language === "ar" ? "اشتراك مطلوب" : "Subscription Required")}</span>
                    </span>
                    {(coursePricing.originalPriceSemester || coursePricing.originalPriceYearly) && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
                        {language === "ar" ? "عرض خاص" : "OFFER"}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-300/40 inline-flex items-center gap-1 select-none">
                    <span>{language === "ar" ? "كورس مجاني بالكامل" : "100% Free Course"}</span>
                  </span>
                )}

                {/* Admin Pricing Settings Button */}
                {isAdmin && (
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-300 dark:hover:text-white border border-amber-500/20 text-[10px] font-black rounded-md flex items-center gap-1 transition-all cursor-pointer select-none"
                    title="تعديل حالة الكورس (مدفوع/مجاني) والمحاضرات التجريبية"
                  >
                    <Icons.Settings className="w-3 h-3" />
                    <span>{language === "ar" ? "تسعير الكورس والتجربة المجانية" : "Course Pricing & Trial"}</span>
                  </button>
                )}
              </div>
              {isAdmin ? (
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    handleSaveMeta(e.target.value, subjectDescription);
                  }}
                  className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none bg-transparent border-none outline-none focus:ring-0 w-full pl-0 select-text cursor-text"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none transition-colors duration-200">
                  {subjectName}
                </h1>
              )}
              {isAdmin ? (
                <AutoResizeTextarea
                  value={subjectDescription}
                  onChange={(val) => {
                    setSubjectDescription(val);
                    handleSaveMeta(subjectName, val);
                  }}
                  className="text-sm md:text-base text-black dark:text-white font-normal mt-2 max-w-xl leading-relaxed transition-colors duration-200"
                  placeholder=""
                />
              ) : (
                <p className="text-sm md:text-base text-black dark:text-white font-normal mt-2 max-w-xl leading-relaxed transition-colors duration-200">
                  {subjectDescription}
                </p>
              )}
            </div>
          </div>

          {/* Add Course / Activation Status Button */}
          <div className="relative z-10 shrink-0 self-start md:self-center">
            {!isAdmin && (
              isCourseUnlocked ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm select-none animate-fade-in">
                  <CheckCircle className="w-4 h-4 fill-current" />
                  <span>{language === "ar" ? "تم تفعيل الكورس" : "Activated"}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    requireAuth(() => {
                      setUnlockModalOpen(true);
                    });
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-lg uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-95 select-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "ar" ? "إضافة الكورس" : "Add Course"}</span>
                </button>
              )
            )}
          </div>
        </section>

             {/* Curriculum Sections Accordion List */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-7 bg-[#0D9488] rounded-full" />
                  <h2 className="text-xl md:text-2xl font-extrabold text-black dark:text-white tracking-tight">
                    {language === "ar" ? "محتوى المنهاج والملفات" : "Course Curriculum & Sections"}
                  </h2>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setAddSectionOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-lg uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" /> {language === "ar" ? "إضافة قسم جديد" : "Add Section"}
                  </button>
                )}
              </div>

              {sections.length === 0 ? (
                <div className="border border-dashed border-slate-200 dark:border-teal-500/40 bg-white/50 dark:bg-[#1A1A1A] rounded-lg p-10 text-center flex flex-col items-center justify-center">
                  
                  <h4 className="text-sm font-extrabold text-black dark:text-white">
                    {language === "ar" ? "لا توجد أقسام مضافة بعد" : "No Sections Found"}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                    {language === "ar" 
                      ? "ابدأ بتنظيم منهاج المساق من خلال إنشاء أقسام جديدة."
                      : "Create your course sections to begin organizing study material and practice tests."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, secIdx) => {
                    const isExpanded = activeSectionId === section.id;
                    const displayName = language === "ar" ? (section.nameAr || section.name) : section.name;

                    return (
                      <div
                        key={section.id}
                        className="bg-white dark:bg-[#131313] border border-slate-200/60 dark:border-teal-500/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
                      >
                        {/* Section Header */}
                        <div
                          onClick={() => handleToggleSection(isExpanded ? null : section.id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/55 dark:hover:bg-teal-950/5 select-none transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-black text-black dark:text-white truncate">
                                {displayName}
                              </h3>
                              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>{section.lectures.length} {language === "ar" ? "محاضرة" : "Lectures"}</span>
                                <span>•</span>
                                <span>{section.handouts.length} {language === "ar" ? "ملف نوتس" : "Handouts"}</span>
                                <span>•</span>
                                <span>{section.flashcards.length} {language === "ar" ? "بطاقة Anki" : "Flashcards"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {isAdmin && (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setEditingSectionId(section.id);
                                    setEditSectionNameEn(section.name);
                                    setEditSectionNameAr(section.nameAr || section.name);
                                    setEditSectionOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-[#0D9488]/10 text-slate-450 hover:text-[#0D9488] rounded transition-all"
                                  title="Edit Section Name"
                                >
                                  <Icons.Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmState({
                                    isOpen: true,
                                    type: "section",
                                    sectionId: section.id,
                                    title: language === "ar" ? "تأكيد حذف القسم" : "Delete Section",
                                    message: language === "ar" ? `هل أنت متأكد من رغبتك في حذف قسم "${section.name}" وجميع محاضراته وملفاته نهائياً؟` : `Are you sure you want to delete section "${section.name}" and all its content?`
                                  })}
                                  className="p-1.5 hover:bg-red-500/10 text-slate-455 hover:text-red-500 rounded transition-all"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-slate-400"
                            >
                              <Icons.ChevronDown className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key={`section_content_${section.id}`}
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-slate-100 dark:border-teal-500/10 overflow-hidden"
                            >
                              <div className="p-6 bg-slate-50/30 dark:bg-black/20 space-y-6">

                                {/* Sub-tab 1: Lectures */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-[#0D9488] uppercase tracking-wider flex items-center gap-1.5">
                                      {language === "ar" ? "المحاضرات" : "Lectures"}
                                    </h4>
                                    {isAdmin && (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setActiveTargetSectionId(section.id);
                                            setNewLectureStatus("ready");
                                            setAddLectureOpen(true);
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-[#0D9488]/10 hover:bg-[#0D9488] text-[#0D9488] hover:text-white border border-[#0D9488]/15 text-[10px] font-bold rounded transition-all cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" /> {language === "ar" ? "إضافة محاضرة" : "Add Lecture"}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveTargetSectionId(section.id);
                                            setNewLectureStatus("coming_soon");
                                            setAddLectureOpen(true);
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/15 text-[10px] font-bold rounded transition-all cursor-pointer"
                                        >
                                          <Clock className="w-3 h-3" /> {language === "ar" ? "محاضرة قريباً" : "Coming Soon Lecture"}
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {section.lectures.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 dark:text-slate-505 italic bg-white dark:bg-[#181818] p-4 rounded-lg border border-slate-105 dark:border-teal-500/5">
                                      {language === "ar" ? "لا توجد محاضرات في هذا القسم بعد." : "No lectures added to this section yet."}
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {section.lectures.map((lecture, lidx) => {
                                        const isPlayingThis = playSectionId === section.id && activeLectureIdx === lidx;
                                        const isComingSoon = lecture.status === "coming_soon";
                                        return (
                                          <div key={lidx} className="flex flex-col gap-2">
                                            <div
                                              className={`${isComingSoon ? "bg-slate-50/20 dark:bg-[#151515] border-slate-200/20 dark:border-teal-950/10 opacity-70" : isPlayingThis ? "bg-white dark:bg-[#1A1A1A] border-[#0D9488] dark:border-teal-400 ring-2 ring-[#0D9488]/20" : "bg-white dark:bg-[#1A1A1A] border-slate-200/50 dark:border-teal-500/40 hover:border-[#0D9488]/30"} border p-3 rounded-lg flex items-center justify-between gap-4 shadow-sm transition-all duration-200 group`}
                                            >
                                              <div
                                                onClick={() => {
                                                  if (isComingSoon) {
                                                    setSubjectComingSoonTitle(lecture.title);
                                                    setSubjectComingSoonOpen(true);
                                                    return;
                                                  }

                                                  const isFree = !coursePricing.isPaid || isCourseUnlocked || isAdmin || Boolean(lecture.isFree) || lidx < coursePricing.freeLecturesCount;
                                                  if (!isFree) {
                                                    setPaywallLectureTitle(lecture.title);
                                                    setShowPaywallModal(true);
                                                    return;
                                                  }

                                                  if (isPlayingThis) {
                                                    setActiveLectureIdx(null);
                                                  } else {
                                                    setPlaySectionId(section.id);
                                                    setActiveLectureIdx(lidx);
                                                  }
                                                }}
                                                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                              >
                                                {(() => {
                                                  const isFree = !coursePricing.isPaid || isCourseUnlocked || isAdmin || Boolean(lecture.isFree) || lidx < coursePricing.freeLecturesCount;
                                                  return (
                                                    <div className="w-7 h-7 flex items-center justify-center shrink-0 text-[#0D9488] dark:text-teal-400">
                                                      {isComingSoon ? (
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                      ) : !isFree ? (
                                                        <Icons.Lock className="w-4 h-4 text-amber-500" />
                                                      ) : (
                                                        <Play className="w-4 h-4 fill-current ml-0.5 group-hover:scale-110 transition-transform" />
                                                      )}
                                                    </div>
                                                  );
                                                })()}
                                                <div className="min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <h5 className={`text-xs font-bold leading-snug truncate ${isComingSoon ? "text-slate-400 dark:text-zinc-500" : "text-black dark:text-white group-hover:text-[#0D9488] dark:group-hover:text-teal-400 transition-colors"}`}>
                                                      {lecture.title}
                                                    </h5>
                                                    {coursePricing.isPaid && !isCourseUnlocked && !isAdmin && !isComingSoon && (
                                                      lecture.isFree ? (
                                                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded border border-emerald-500/20 shrink-0">
                                                          🟢 {language === "ar" ? "مجاني محدد" : "Free Access"}
                                                        </span>
                                                      ) : lidx < coursePricing.freeLecturesCount ? (
                                                        <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-black rounded border border-teal-500/20 shrink-0">
                                                          {language === "ar" ? "تجربة مجانية" : "Free Trial"}
                                                        </span>
                                                      ) : (
                                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black rounded border border-amber-500/20 shrink-0 flex items-center gap-0.5">
                                                          <Icons.Lock className="w-2.5 h-2.5" />
                                                          <span>{language === "ar" ? "مدفوع" : "Locked"}</span>
                                                        </span>
                                                      )
                                                    )}
                                                    {isAdmin && lecture.isFree && (
                                                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded border border-emerald-500/20 shrink-0">
                                                        🟢 مجاني محدد
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5 font-bold uppercase tracking-wider">
                                                    {isComingSoon ? (
                                                      language === "ar" ? "قريباً" : "Coming Soon"
                                                    ) : (
                                                      lecture.duration
                                                    )}
                                                  </p>
                                                </div>
                                              </div>
                                              {isAdmin && (
                                                <div className="relative shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (activeLectureMenu?.sectionId === section.id && activeLectureMenu?.lidx === lidx) {
                                                        setActiveLectureMenu(null);
                                                      } else {
                                                        setActiveLectureMenu({ sectionId: section.id, lidx });
                                                      }
                                                    }}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-all text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
                                                  >
                                                    <Icons.MoreVertical className="w-3.5 h-3.5" />
                                                  </button>
                                                  
                                                  {activeLectureMenu?.sectionId === section.id && activeLectureMenu?.lidx === lidx && (
                                                    <div className="absolute right-0 top-6 bg-white dark:bg-[#1C1C1C] border border-slate-200 dark:border-teal-500/25 rounded-md shadow-xl p-1 z-50 w-24 text-[10px] animate-fade-in text-left">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveLectureMenu(null);
                                                          handleOpenEditLecture(section.id, lidx);
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#0D9488]/10 text-slate-700 dark:text-slate-300 hover:text-[#0D9488] rounded transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                                                      >
                                                        <Icons.Edit2 className="w-3 h-3" /> {language === "ar" ? "تعديل" : "Edit"}
                                                      </button>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveLectureMenu(null);
                                                          setDeleteConfirmState({
                                                              isOpen: true,
                                                              type: "lecture",
                                                              sectionId: section.id,
                                                              index: lidx,
                                                              title: language === "ar" ? "تأكيد حذف المحاضرة" : "Delete Lecture",
                                                              message: language === "ar" ? `هل أنت متأكد من رغبتك في حذف محاضرة "${lecture.title}"؟` : `Are you sure you want to delete lecture "${lecture.title}"?`
                                                            });
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 hover:bg-rose-500/10 text-rose-600 rounded transition-colors flex items-center gap-1.5 font-bold border-t border-slate-100 dark:border-teal-500/5 mt-0.5 cursor-pointer"
                                                      >
                                                        <Icons.Trash2 className="w-3 h-3" /> {language === "ar" ? "حذف" : "Delete"}
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>

                                            {/* Inline Video Player Container */}
                                            {isPlayingThis && (
                                              <div 
                                                id={`player_wrap_${lidx}`} 
                                                onMouseMove={handlePlayerMouseMove}
                                                onMouseLeave={handlePlayerMouseLeave}
                                                className="w-full bg-black border border-slate-200/20 dark:border-teal-500/30 rounded-xl overflow-hidden shadow-xl animate-fade-in my-1 relative group/container [:fullscreen]:border-0 [:fullscreen]:rounded-none [:fullscreen]:m-0 [:fullscreen]:w-screen [:fullscreen]:h-screen flex flex-col aspect-video"
                                              >
                                                {/* Header Bar - YouTube Auto-Hiding Style */}
                                                <div className={`p-3 bg-gradient-to-r from-teal-950/80 to-black border-b border-teal-500/20 flex justify-between items-center text-white absolute top-0 left-0 right-0 z-45 transition-opacity duration-300 ${isPlayerControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-ping" />
                                                    <span className="text-xs font-bold truncate pr-4">{lecture.title}</span>
                                                  </div>
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setActiveLectureIdx(null);
                                                      setShowPlayerSettings(false);
                                                    }}
                                                    className="p-1 hover:bg-white/10 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                  >
                                                    <X className="w-4 h-4" />
                                                  </button>
                                                </div>

                                                {/* Settings Dropdown Overlay */}
                                                <AnimatePresence>
                                                  {showPlayerSettings && (
                                                    <motion.div 
                                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                      className="absolute right-4 bottom-16 z-50 bg-[#121212]/95 border border-[#0D9488]/30 rounded-xl p-4 shadow-2xl w-48 text-[11px] font-bold text-white select-none backdrop-blur-md space-y-4"
                                                    >
                                                      {/* Speed Choice */}
                                                      <div className="space-y-1.5">
                                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
                                                          <Icons.Gauge className="w-3.5 h-3.5 text-[#0D9488]" />
                                                          <span>{language === "ar" ? "سرعة التشغيل" : "Playback Speed"}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                                                          {[0.5, 1, 1.5, 2].map((s) => (
                                                            <button
                                                              key={s}
                                                              onClick={() => {
                                                                setPlayerSpeed(s);
                                                                const vid = document.querySelector(`#player_wrap_${lidx} video`) as HTMLVideoElement;
                                                                if (vid) vid.playbackRate = s;
                                                              }}
                                                              className={`py-1 rounded border text-center font-black transition-all ${playerSpeed === s ? "bg-[#0D9488] border-[#0D9488] text-white" : "border-slate-700/40 bg-black/20 hover:bg-[#0d9488]/10 text-slate-300"}`}
                                                            >
                                                              {s === 1 ? (language === "ar" ? "عادي" : "Normal") : `${s}x`}
                                                            </button>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      {/* Quality Choice */}
                                                      <div className="space-y-1.5 border-t border-slate-800/60 pt-3">
                                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
                                                          <Icons.Sliders className="w-3.5 h-3.5 text-[#0D9488]" />
                                                          <span>{language === "ar" ? "جودة الفيديو" : "Video Quality"}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                                                          {["Auto", "1080p", "720p", "480p"].map((q) => (
                                                            <button
                                                              key={q}
                                                              onClick={() => setPlayerQuality(q)}
                                                              className={`py-1 rounded border text-center font-black transition-all ${playerQuality === q ? "bg-[#0D9488] border-[#0D9488] text-white" : "border-slate-700/40 bg-black/20 hover:bg-[#0d9488]/10 text-slate-300"}`}
                                                            >
                                                              {q}
                                                            </button>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      {/* Volume Choice Slider */}
                                                      <div className="space-y-1.5 border-t border-slate-800/60 pt-3">
                                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-between">
                                                          <div className="flex items-center gap-1">
                                                            <Icons.Volume2 className="w-3.5 h-3.5 text-[#0D9488]" />
                                                            <span>{language === "ar" ? "مستوى الصوت" : "Audio Level"}</span>
                                                          </div>
                                                          <span className="font-mono text-[10px] text-teal-400">{playerVolume}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                          <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="100" 
                                                            value={playerVolume}
                                                            onChange={(e) => setPlayerVolume(parseInt(e.target.value))}
                                                            className="w-full accent-[#0D9488] bg-slate-800 h-1 rounded-lg cursor-pointer"
                                                          />
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>

                                                <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">


                                                  {isEmbeddable(lecture.videoUrl) ? (
                                                    <>
                                                      <iframe
                                                        src={getEmbedUrl(lecture.videoUrl, playerCaptions)}
                                                        title={lecture.title}
                                                        className="w-full h-full object-cover bg-black border-0"
                                                        allow="autoplay; fullscreen; picture-in-picture"
                                                        allowFullScreen
                                                      />
                                                      {/* 100% Transparent Full-Canvas Click Blocker Overlay to prevent any native YouTube interaction */}
                                                      <div 
                                                        onClick={() => {
                                                          if (ytPlayerRef.current) {
                                                            if (isPlaying) {
                                                              ytPlayerRef.current.pauseVideo();
                                                            } else {
                                                              ytPlayerRef.current.playVideo();
                                                            }
                                                          }
                                                          setIsPlaying(!isPlaying);
                                                        }}
                                                        className="absolute inset-0 z-40 bg-transparent cursor-pointer pointer-events-auto select-none"
                                                      />
                                                    </>
                                                  ) : (
                                                    <div className="w-full h-full relative">
                                                      <video 
                                                        key={lecture.videoUrl}
                                                        src={lecture.videoUrl} 
                                                        autoPlay 
                                                        controlsList="nodownload"
                                                        onContextMenu={(e) => e.preventDefault()}
                                                        className="w-full h-full object-contain bg-black"
                                                        onLoadedMetadata={(e) => {
                                                          const vid = e.target as HTMLVideoElement;
                                                          const durationSec = vid.duration;
                                                          if (durationSec && !isNaN(durationSec)) {
                                                            setVideoDuration(durationSec);
                                                          }
                                                          // Restore saved progress
                                                          const savedKey = `medicinety_progress_${subjectId}_${activeLectureIdx}`;
                                                          const savedTime = parseFloat(localStorage.getItem(savedKey) || "0");
                                                          if (savedTime > 0) {
                                                            vid.currentTime = savedTime;
                                                            setCurrentTime(savedTime);
                                                          }
                                                        }}
                                                        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                                                        onDurationChange={(e) => setVideoDuration((e.target as HTMLVideoElement).duration)}
                                                        onPlay={() => setIsPlaying(true)}
                                                        onPause={() => setIsPlaying(false)}
                                                        onEnded={(e) => {
                                                          const vid = e.target as HTMLVideoElement;
                                                          vid.currentTime = 0;
                                                          vid.pause();
                                                          setCurrentTime(0);
                                                          setIsPlaying(false);
                                                        }}
                                                      />
                                                      {/* 100% Transparent Full-Canvas Click Blocker Overlay for Native Video */}
                                                      <div 
                                                        onClick={() => {
                                                          const vidEl = document.querySelector(`#player_wrap_${lidx} video`) as HTMLVideoElement;
                                                          if (vidEl) {
                                                            if (isPlaying) vidEl.pause();
                                                            else vidEl.play().catch(() => {});
                                                          }
                                                          setIsPlaying(!isPlaying);
                                                        }}
                                                        className="absolute inset-0 z-40 bg-transparent cursor-pointer pointer-events-auto select-none"
                                                      />
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Bottom Custom Controls Bar */}
                                                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/10 p-3 z-45 flex flex-col gap-2 transition-opacity duration-300 ${isPlayerControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                                  {/* Progress Slider Track */}
                                                  <div 
                                                    onClick={(e) => {
                                                      const rect = e.currentTarget.getBoundingClientRect();
                                                      const clickX = e.clientX - rect.left;
                                                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                                                      
                                                      // Seek YouTube Player
                                                      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
                                                        ytPlayerRef.current.seekTo(pct * videoDuration, true);
                                                      }

                                                      // Seek Native Video
                                                      const vidEl = document.querySelector(`#player_wrap_${lidx} video`) as HTMLVideoElement;
                                                      if (vidEl) {
                                                        vidEl.currentTime = pct * videoDuration;
                                                      }

                                                      setCurrentTime(pct * videoDuration);
                                                    }}
                                                    className="w-full bg-white/20 h-1.5 rounded-full relative cursor-pointer group/progress"
                                                  >
                                                    {/* Green Progress Fill */}
                                                    <div 
                                                      style={{ width: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%` }}
                                                      className="bg-[#0D9488] h-full rounded-full relative transition-all"
                                                    >
                                                      {/* Progress Handle dot */}
                                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-[#0D9488] scale-0 group-hover/progress:scale-100 transition-transform" />
                                                    </div>
                                                  </div>

                                                  {/* Playback Controls Row */}
                                                  <div className="flex justify-between items-center text-white text-xs select-none">
                                                    <div className="flex items-center gap-3">
                                                      {/* Play / Pause Toggle Button */}
                                                      <button 
                                                        onClick={() => {
                                                          if (ytPlayerRef.current) {
                                                            if (isPlaying) {
                                                              ytPlayerRef.current.pauseVideo();
                                                            } else {
                                                              ytPlayerRef.current.playVideo();
                                                            }
                                                          }

                                                          const vidEl = document.querySelector(`#player_wrap_${lidx} video`) as HTMLVideoElement;
                                                          if (vidEl) {
                                                            if (isPlaying) vidEl.pause();
                                                            else vidEl.play().catch(() => {});
                                                          }

                                                          setIsPlaying(!isPlaying);
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded text-[#0D9488] transition-colors cursor-pointer"
                                                      >
                                                        {isPlaying ? (
                                                          <Icons.Pause className="w-4 h-4 fill-current" />
                                                        ) : (
                                                          <Icons.Play className="w-4 h-4 fill-current ml-0.5" />
                                                        )}
                                                      </button>

                                                      {/* Time Display */}
                                                      <span className="font-mono text-[10px] text-slate-300">
                                                        {formatTime(currentTime)} / {formatTime(videoDuration)}
                                                      </span>
                                                    </div>

                                                    <div className="flex items-center gap-2.5">
                                                      {/* Subtitles / Captions CC Toggle */}
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const next = playerCaptions === "off" ? "ar" : playerCaptions === "ar" ? "en" : playerCaptions === "en" ? "auto" : "off";
                                                          setPlayerCaptions(next);

                                                          const vidEl = document.querySelector(`#player_wrap_${lidx} video`) as HTMLVideoElement;
                                                          if (vidEl && vidEl.textTracks) {
                                                            for (let i = 0; i < vidEl.textTracks.length; i++) {
                                                              vidEl.textTracks[i].mode = next !== "off" ? "showing" : "hidden";
                                                            }
                                                          }
                                                        }}
                                                        className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider border transition-all cursor-pointer ${
                                                          playerCaptions !== "off"
                                                            ? "bg-[#0D9488] border-[#0D9488] text-white shadow-sm shadow-teal-500/20"
                                                            : "border-slate-600 bg-black/40 text-slate-300 hover:text-white hover:border-slate-400"
                                                        }`}
                                                        title={language === "ar" ? "الترجمة والشرح التوضيحي (CC)" : "Captions / Subtitles (CC)"}
                                                      >
                                                        CC {playerCaptions !== "off" ? `(${playerCaptions.toUpperCase()})` : ""}
                                                      </button>

                                                      {/* Settings Trigger */}
                                                      <button 
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setShowPlayerSettings(!showPlayerSettings);
                                                        }}
                                                        className={`p-1 rounded transition-colors cursor-pointer ${showPlayerSettings ? "text-white bg-[#0D9488]" : "text-[#0D9488] hover:bg-white/10"}`}
                                                      >
                                                        <Icons.Settings className="w-4 h-4" />
                                                      </button>

                                                      {/* Maximize/Minimize Fullscreen */}
                                                      <button 
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const elem = document.getElementById(`player_wrap_${lidx}`);
                                                          if (elem) {
                                                            if (!document.fullscreenElement) {
                                                              elem.requestFullscreen().catch(err => console.error(err));
                                                            } else {
                                                              document.exitFullscreen().catch(err => console.error(err));
                                                            }
                                                          }
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                      >
                                                        {isPlayerFullscreen ? (
                                                          <Minimize className="w-4 h-4" />
                                                        ) : (
                                                          <Maximize className="w-4 h-4" />
                                                        )}
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                  {/* Sub-tab 2: Handouts */}
                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-teal-500/5">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-[#0D9488] uppercase tracking-wider flex items-center gap-1.5">
                                      {language === "ar" ? "الملخصات والنوتس" : "Study Handouts & Notes"}
                                    </h4>
                                    {isAdmin && (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setActiveTargetSectionId(section.id);
                                            setAddRichNoteOpen(true);
                                          }}
                                          className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] hover:bg-[#0A7268] text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" /> {language === "ar" ? "كتابة نوتس تفاعلية بالصور" : "+ Add Rich Note with Images"}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveTargetSectionId(section.id);
                                            setNewHandoutStatus("ready");
                                            setAddHandoutOpen(true);
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-[#0D9488]/10 hover:bg-[#0D9488] text-[#0D9488] hover:text-white border border-[#0D9488]/15 text-[10px] font-bold rounded transition-all cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" /> {language === "ar" ? "إضافة PDF" : "Add PDF"}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveTargetSectionId(section.id);
                                            setNewHandoutStatus("coming_soon");
                                            setAddHandoutOpen(true);
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/15 text-[10px] font-bold rounded transition-all cursor-pointer"
                                        >
                                          <Clock className="w-3 h-3" /> {language === "ar" ? "ملف قريباً" : "Coming Soon Document"}
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {section.handouts.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 dark:text-slate-505 italic bg-white dark:bg-[#181818] p-4 rounded-lg border border-slate-105 dark:border-teal-500/5">
                                      {language === "ar" ? "لا توجد ملخصات في هذا القسم بعد." : "No handouts shared in this section yet."}
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      {section.handouts.map((file, hidx) => (
                                          <div
                                            key={hidx}
                                            onClick={() => requireUnlock(() => {
                                              if (file.content || file.imageUrl) {
                                                setActiveReadingNote(file);
                                              } else {
                                                handleDirectDownloadHandout(file);
                                              }
                                            })}
                                            className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 hover:border-[#0D9488]/30 p-3 rounded-lg flex items-center justify-between cursor-pointer shadow-sm transition-all duration-200 group"
                                          >
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-7 h-7 text-[#0D9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <h5 className="text-xs font-bold text-black dark:text-white truncate group-hover:text-[#0D9488] dark:group-hover:text-teal-400 transition-colors">
                                                {file.name}
                                              </h5>
                                              <p className="text-[9px] text-slate-400 dark:text-slate-550 mt-0.5">
                                                {file.size} • {file.type}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            {isAdmin && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setDeleteConfirmState({
                                                    isOpen: true,
                                                    type: "handout",
                                                    sectionId: section.id,
                                                    index: hidx,
                                                    title: language === "ar" ? "تأكيد حذف الملف" : "Delete Handout",
                                                    message: language === "ar" ? `هل أنت متأكد من رغبتك في حذف ملف "${file.name}"؟` : `Are you sure you want to delete handout "${file.name}"?`
                                                  });
                                                }}
                                                className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition-all shrink-0"
                                              >
                                                <Icons.Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                            <Download className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-[#0D9488] dark:group-hover:text-teal-400 transition-colors" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Sub-tab 3: Flashcards */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/5">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-black text-[#0D9488] uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🎴</span>
                                        <span>{language === "ar" ? "بطاقات الاستذكار الفعالة (Flashcards)" : "Active Flashcards"}</span>
                                      </h4>
                                      <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] dark:text-teal-300 text-[10px] font-black rounded-full border border-teal-500/20">
                                        {(section.flashcards || []).length} {language === "ar" ? "بطاقة" : "Cards"}
                                      </span>
                                    </div>

                                    {isAdmin && (
                                      <button
                                        onClick={() => {
                                          setActiveTargetSectionId(section.id);
                                          setAddFlashcardOpen(true);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{language === "ar" ? "إضافة بطاقة جديدة" : "Add Flashcard"}</span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Official Anki Export Banner */}
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-zinc-950 text-white rounded-2xl border border-slate-800 shadow-md">
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl border border-teal-500/30 shrink-0">
                                        ⚡
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-black text-white flex items-center gap-2">
                                          <span>{language === "ar" ? "تصدير حزمة Anki الرسمية (.apkg)" : "Official Anki Flashcard Deck (.apkg)"}</span>
                                          <span className="px-2 py-0.2 bg-teal-500 text-black text-[9px] font-black rounded-full">
                                            {(section.flashcards || []).length} {language === "ar" ? "بطاقات فعلية" : "Cards"}
                                          </span>
                                        </h5>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                          {language === "ar" ? "تحميل فوري لكافة البطاقات والأسئلة المكتوبة في هذا القسم متوافقة 100% مع تطبيق Anki" : "Direct download of all custom flashcards created in this section compatible with Anki"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() => requireUnlock(() => handleDownloadAnkiDeck(section))}
                                        disabled={isExportingAnki || (section.flashcards || []).length === 0}
                                        className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
                                      >
                                        <Icons.Download className="w-4 h-4" />
                                        <span>
                                          {isExportingAnki 
                                            ? (language === "ar" ? "جاري بناء الحزمة..." : "Building Deck...") 
                                            : (language === "ar" ? `تحميل الحزمة (${(section.flashcards || []).length})` : `Download (.apkg)`)}
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* List of Flashcards inside this section */}
                                  {(section.flashcards || []).length === 0 ? (
                                    <div className="text-center p-6 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                                      <p className="text-xs text-slate-400 font-medium">
                                        {language === "ar" ? "لا توجد فلاش كاردز مضافة في هذا القسم بعد. اضغط على (+ إضافة بطاقة جديدة) للبدء." : "No flashcards in this section yet. Click (+ Add Flashcard) to start."}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {section.flashcards.map((fc, fcIdx) => (
                                        <div 
                                          key={fcIdx}
                                          className="p-4 bg-white dark:bg-[#1A1A1A] border-2 border-slate-200/80 dark:border-zinc-800 hover:border-[#0D9488]/50 rounded-2xl shadow-sm space-y-2.5 transition-all group"
                                        >
                                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-md">
                                              #{fcIdx + 1}
                                            </span>
                                            {isAdmin && (
                                              <button
                                                onClick={() => setDeleteConfirmState({
                                                  isOpen: true,
                                                  type: "flashcard",
                                                  sectionId: section.id,
                                                  index: fcIdx,
                                                  title: language === "ar" ? "تأكيد حذف البطاقة" : "Delete Flashcard",
                                                  message: language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذه البطاقة؟" : "Are you sure you want to delete this flashcard?"
                                                })}
                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                                title={language === "ar" ? "حذف هذه البطاقة" : "Delete Flashcard"}
                                              >
                                                <Icons.Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>

                                          <div className="space-y-1.5 text-xs">
                                            <div>
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                {language === "ar" ? "السؤال (Front):" : "Question (Front):"}
                                              </span>
                                              <p className="font-extrabold text-black dark:text-white leading-relaxed">
                                                {fc.question}
                                              </p>
                                            </div>

                                            <div className="pt-1.5 border-t border-dashed border-slate-100 dark:border-zinc-800">
                                              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider block">
                                                {language === "ar" ? "الإجابة (Back):" : "Answer (Back):"}
                                              </span>
                                              <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {fc.answer}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

{/* Section 4: Final Course Exam - Blocks Hub */}
            <section className="pt-6 border-t border-slate-200/50 dark:border-teal-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
                  <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight">
                    {language === "ar" ? "بلوكات الامتحان السريري النهائي" : "Final Course Exam Blocks"}
                  </h2>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddBlockModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0b7a70] text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "ar" ? "+ إضافة بلوك جديد" : "+ Add Exam Block"}</span>
                  </button>
                )}
              </div>

              {/* Dynamic Exam Blocks List with Empty State */}
              {examBlocks.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-zinc-900/40">
                  <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-black dark:text-white">
                      {language === "ar" ? "لا يوجد بلوكات امتحانات حالياً" : "No Exam Blocks Available"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {language === "ar" ? "اضغط على زر (إضافة بلوك جديد) لإنشاء وتجهيز امتحانات وسيموليشن هذا الكورس." : "Click the button below to create and set up examination blocks for this course."}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddBlockModal(true)}
                      className="px-4 py-2 bg-[#0D9488] hover:bg-[#0b7a70] text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === "ar" ? "إضافة أول بلوك امتحان" : "+ Add First Exam Block"}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examBlocks.map((block) => {
                  const blockQs = allExamQuestions.filter(q => Number(q.blockNumber || 1) === Number(block.id));
                  const user = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
                  const storageKey = `medicinety_exam_grades_${user}`;
                  let gradePercentage: number | null = null;
                  try {
                    const currentGrades = localStorage.getItem(storageKey);
                    if (currentGrades) {
                      const gradesObj = JSON.parse(currentGrades);
                      const g = gradesObj[`${subjectId}_block_${block.id}`] ?? gradesObj[subjectId];
                      if (g !== undefined) gradePercentage = g;
                    }
                  } catch (e) {}

                  return (
                    <div 
                      key={block.id}
                      className="glass-panel p-5 rounded-xl border-2 border-teal-500/30 dark:bg-[#1A1A1A] relative overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#0D9488] bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-md border border-[#0D9488]/20">
                            Block {block.id} • {block.duration || 60} Mins (1 Hour)
                          </span>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded">
                              {blockQs.length} / 20 {language === "ar" ? "سؤال" : "Questions"}
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => setDeleteConfirmState({
                                    isOpen: true,
                                    type: "block",
                                    targetId: block.id,
                                    title: language === "ar" ? "تأكيد حذف بنك الأسئلة" : "Delete Exam Block",
                                    message: language === "ar" ? `هل أنت متأكد من حذف البنك رقم #${block.blockNumber}؟` : `Are you sure you want to delete Exam Block #${block.blockNumber}?`
                                  })}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="حذف البلوك"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-black text-black dark:text-white">
                          {block.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {block.desc}
                        </p>

                        {/* Admin Action Buttons directly on the Block Card */}
                        {isAdmin && (
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => handleOpenAddQForBlock(block.id)}
                              className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-[#0D9488]/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{language === "ar" ? "إضافة سؤال للبلوك" : "+ Add Question to Block"}</span>
                            </button>

                            {blockQs.length > 0 && (
                              <button
                                onClick={() => {
                                  setTargetBlockIdForQ(block.id);
                                  setShowManageQModal(true);
                                }}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <ListPlus className="w-3.5 h-3.5 text-[#0D9488]" />
                                <span>{language === "ar" ? `الأسئلة (${blockQs.length})` : `Questions (${blockQs.length})`}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {gradePercentage !== null ? (
                            <span className="text-[#0D9488] font-black">
                              Grade: {gradePercentage}% ({getLetterGrade(gradePercentage)})
                            </span>
                          ) : (
                            <span className="text-slate-400">Max 20 Questions</span>
                          )}
                        </div>

                        <button 
                          onClick={() => requireUnlock(() => router.push(`/subject/${subjectId}/exam?block=${block.id}`))}
                          className="px-5 py-2 bg-[#0D9488] hover:bg-[#0b7a70] text-white font-extrabold text-xs rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{language === "ar" ? `بدء Block ${block.id}` : `Start Block ${block.id}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}

            </section>

      </div>

      {/* Add Content overlays & previews */}
      <AnimatePresence>
                        {/* Modal: Add Question to Specific Block */}
        {showAddQModal && (
          <div key="wrap_add_q_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_q_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddQModal(false)} />
            <motion.div key="modal_add_q_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-2xl relative z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-black dark:text-white">
              
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-[#0D9488] flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>{editingQuestionId ? (language === "ar" ? `تعديل السؤال في Block ${targetBlockIdForQ}` : `Edit Question in Block ${targetBlockIdForQ}`) : (language === "ar" ? `إضافة سؤال جديد إلى Block ${targetBlockIdForQ}` : `Add New Question to Block ${targetBlockIdForQ}`)}</span>
                </h3>
                <button onClick={() => setShowAddQModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveModalQuestion} className="space-y-4 text-xs">
                
                {/* Question Stem */}
                <div>
                  <label className="font-bold block mb-1">Clinical Vignette / Question Text</label>
                  <textarea
                    rows={4}
                    value={modalQText}
                    onChange={e => setModalQText(e.target.value)}
                    placeholder="Enter patient age, gender, symptoms, vitals, and question stem..."
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>

                {/* Optional Image */}
                <div>
                  <label className="font-bold block mb-1">Question Image URL (Optional)</label>
                  <input
                    type="url"
                    value={modalQImage}
                    onChange={e => setModalQImage(e.target.value)}
                    placeholder="https://example.com/radiology_or_case_image.png"
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>

                {/* Clinical Table Option */}
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-2 cursor-pointer text-[#0D9488]">
                      <input
                        type="checkbox"
                        checked={modalHasTable}
                        onChange={e => setModalHasTable(e.target.checked)}
                        className="w-4 h-4 text-[#0D9488] rounded cursor-pointer"
                      />
                      <TableIcon className="w-4 h-4" />
                      <span>تضمين جدول تحاليل / بيانات سريرية داخل السؤال (Clinical Table)</span>
                    </label>

                    {modalHasTable && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalTableHeaders(["Option", "Serum glucose (mg/dL)", "Serum osmolality (mOsmol/kg)", "Serum sodium (mEq/L)", "Serum bicarbonate (mEq/L)"]);
                          setModalTableRows([
                            ["A", "840", "330", "132", "23"],
                            ["B", "670", "325", "147", "26"],
                            ["C", "410", "268", "131", "27"],
                            ["D", "145", "322", "152", "22"],
                            ["E", "490", "310", "130", "14"]
                          ]);
                        }}
                        className="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] border border-[#0D9488]/30 rounded text-[10px] font-bold"
                      >
                        ⚡ ملء جدول جاهز
                      </button>
                    )}
                  </div>

                  {modalHasTable && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setModalTableHeaders([...modalTableHeaders, `Col ${modalTableHeaders.length + 1}`]);
                            setModalTableRows(modalTableRows.map(r => [...r, "-"]));
                          }}
                          className="px-2 py-1 bg-[#0D9488] text-white rounded font-bold"
                        >
                          + إضافة عمود
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextLetter = String.fromCharCode(65 + modalTableRows.length);
                            setModalTableRows([...modalTableRows, [nextLetter, ...Array(modalTableHeaders.length - 1).fill("0")]]);
                          }}
                          className="px-2 py-1 bg-[#0D9488] text-white rounded font-bold"
                        >
                          + إضافة صف
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-zinc-700">
                              {modalTableHeaders.map((h, i) => (
                                <th key={i} className="p-1.5 border-r border-slate-200 dark:border-zinc-600">
                                  <input
                                    type="text"
                                    value={h}
                                    onChange={e => {
                                      const u = [...modalTableHeaders];
                                      u[i] = e.target.value;
                                      setModalTableHeaders(u);
                                    }}
                                    className="w-full bg-transparent font-bold outline-none"
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {modalTableRows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-t border-slate-100 dark:border-zinc-700">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-1 border-r border-slate-100 dark:border-zinc-700">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={e => {
                                        const u = modalTableRows.map((r, ri) => 
                                          ri === rIdx ? r.map((c, ci) => ci === cIdx ? e.target.value : c) : r
                                        );
                                        setModalTableRows(u);
                                      }}
                                      className="w-full bg-transparent outline-none p-0.5"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold">Answer Choices & Correct Option</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextLetter = String.fromCharCode(65 + modalQOptions.length);
                        setModalQOptions([...modalQOptions, `${nextLetter}. `]);
                      }}
                      className="text-xs text-[#0D9488] font-bold hover:underline"
                    >
                      + Add Option ({String.fromCharCode(65 + modalQOptions.length)})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {modalQOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_opt_selector_modal"
                          checked={modalQCorrectIdx === oIdx}
                          onChange={() => setModalQCorrectIdx(oIdx)}
                          className="w-4 h-4 text-[#0D9488] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => {
                            const u = [...modalQOptions];
                            u[oIdx] = e.target.value;
                            setModalQOptions(u);
                          }}
                          className="flex-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                          required
                        />
                        {modalQOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setModalQOptions(modalQOptions.filter((_, i) => i !== oIdx))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="font-bold block mb-1">Explanation</label>
                  <textarea
                    rows={2}
                    value={modalQExplanation}
                    onChange={e => setModalQExplanation(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>

                {/* Pearl */}
                <div>
                  <label className="font-bold block mb-1">High-Yield Clinical Pearl (Optional)</label>
                  <input
                    type="text"
                    value={modalQClinicalPearl}
                    onChange={e => setModalQClinicalPearl(e.target.value)}
                    placeholder="High-yield key concept for board exams..."
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0b7a70] text-white font-bold rounded-lg shadow transition-all cursor-pointer text-xs"
                >
                  {editingQuestionId ? (language === "ar" ? "حفظ التعديلات" : "Save Changes") : (language === "ar" ? `حفظ السؤال في Block ${targetBlockIdForQ}` : `Save Question to Block ${targetBlockIdForQ}`)}
                </button>

              </form>

            </motion.div>
          </div>
        )}

        {/* Modal: Manage Questions for Specific Block */}
        {showManageQModal && targetBlockIdForQ && (
          <div key="wrap_manage_q_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_manage_q_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowManageQModal(false)} />
            <motion.div key="modal_manage_q_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-2xl relative z-10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-black dark:text-white">
              
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-[#0D9488] flex items-center gap-2">
                  <ListPlus className="w-4 h-4" />
                  <span>{language === "ar" ? `إدارة أسئلة Block ${targetBlockIdForQ}` : `Manage Questions for Block ${targetBlockIdForQ}`}</span>
                </h3>
                <button onClick={() => setShowManageQModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3">
                {allExamQuestions.filter(q => Number(q.blockNumber || 1) === Number(targetBlockIdForQ)).map((q, idx) => (
                  <div key={q.id || idx} className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-black dark:text-white flex-1">
                        <span className="text-[#0D9488] mr-1">Q{idx + 1}:</span>
                        {q.question.slice(0, 140)}...
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuestion(q)}
                          className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100 border border-[#0D9488]/30 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="تعديل السؤال"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{language === "ar" ? "تعديل" : "Edit"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmState({
                                                      isOpen: true,
                                                      type: "question",
                                                      targetId: q.id,
                                                      title: language === "ar" ? "تأكيد حذف السؤال" : "Delete Question",
                                                      message: language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا السؤال من بنك الأسئلة؟" : "Are you sure you want to delete this question?"
                                                    })}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Choices: {q.options.length} options | Correct: Option {String.fromCharCode(65 + q.correctAnswer)}</div>
                      {q.tableData && <div className="text-teal-600 font-bold">📊 Includes Clinical Lab Table</div>}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setShowManageQModal(false);
                    handleOpenAddQForBlock(targetBlockIdForQ);
                  }}
                  className="w-full py-2 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] font-bold border border-[#0D9488]/30 rounded-lg hover:bg-teal-100 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "ar" ? "إضافة سؤال جديد لهذا البلوك" : "+ Add Another Question to this Block"}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Modal: Add Exam Block */}
        {showAddBlockModal && (
          <div key="wrap_add_block" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_block_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBlockModal(false)} />
            <motion.div key="modal_add_block_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-md relative z-10 shadow-xl space-y-4 text-black dark:text-white">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-[#0D9488] flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>{language === "ar" ? "إضافة بلوك امتحان جديد" : "Add New Exam Block"}</span>
                </h3>
                <button onClick={() => setShowAddBlockModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Block Title / Name</label>
                  <input
                    type="text"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    placeholder="e.g. Block 2: Clinical Correlations & Diagnostics"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={2}
                    value={newBlockDesc}
                    onChange={(e) => setNewBlockDesc(e.target.value)}
                    placeholder="Brief description of topics covered in this block..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newBlockDuration}
                    onChange={(e) => setNewBlockDuration(parseInt(e.target.value) || 60)}
                    min={10}
                    max={180}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0D9488] font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0b7a70] text-white font-bold rounded-lg shadow transition-all cursor-pointer"
                >
                  {language === "ar" ? "إنشاء البلوك" : "Create Block"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Add Curriculum Section */}
        {addSectionOpen && (
          <div key="wrap_add_section" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_section_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddSectionOpen(false)} />
            <motion.div key="modal_add_section_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">{language === "ar" ? "إضافة قسم جديد" : "Add New Section"}</h3>
                <button onClick={() => setAddSectionOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddSection} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Section Name (English)</label>
                  <input type="text" placeholder="e.g. Molecular Biology" value={newSectionNameEn} onChange={e => setNewSectionNameEn(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Section Name (Arabic - Optional)</label>
                  <input type="text" placeholder="مثال: البيولوجيا الجزيئية" value={newSectionNameAr} onChange={e => setNewSectionNameAr(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  {language === "ar" ? "إنشاء القسم" : "Create Section"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Edit Section */}
        {editSectionOpen && (
          <div key="wrap_edit_section" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_edit_section_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditSectionOpen(false); setEditingSectionId(null); }} />
            <motion.div key="modal_edit_section_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">{language === "ar" ? "تعديل اسم القسم" : "Rename Section"}</h3>
                <button onClick={() => { setEditSectionOpen(false); setEditingSectionId(null); }} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveEditSection} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Section Name (English)</label>
                  <input type="text" value={editSectionNameEn} onChange={e => setEditSectionNameEn(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Section Name (Arabic)</label>
                  <input type="text" value={editSectionNameAr} onChange={e => setEditSectionNameAr(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  {language === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Add Exam Question */}
        {addQuestionOpen && (
          <div key="wrap_add_question" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_question_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddQuestionOpen(false)} />
            <motion.div key="modal_add_question_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-xl p-6 w-full max-w-lg relative z-10 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">{language === "ar" ? "إضافة سؤال للامتحان التدريبي" : "Add Exam Question to Section"}</h3>
                <button onClick={() => setAddQuestionOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Question Prompt</label>
                  <textarea rows={3} placeholder="e.g. A 45-year-old male presents with..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Option A</label>
                    <input type="text" value={newOptionA} onChange={e => setNewOptionA(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Option B</label>
                    <input type="text" value={newOptionB} onChange={e => setNewOptionB(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Option C</label>
                    <input type="text" value={newOptionC} onChange={e => setNewOptionC(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Option D</label>
                    <input type="text" value={newOptionD} onChange={e => setNewOptionD(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Correct Answer Option</label>
                  <select value={newCorrectIndex} onChange={e => setNewCorrectIndex(parseInt(e.target.value))} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold">
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Explanation / Rationale</label>
                  <textarea rows={2} placeholder="Explain why the correct answer is correct..." value={newExplanation} onChange={e => setNewExplanation(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  {language === "ar" ? "حفظ السؤال" : "Save Question"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Add Lecture */}
        {addLectureOpen && (
          <div key="wrap_add_lecture" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_lecture_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddLectureOpen(false)} />
            <motion.div key="modal_add_lecture_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">Add New Lecture</h3>
                <button onClick={() => setAddLectureOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddLecture} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lecture Title</label>
                  <input type="text" placeholder="" value={newLectureTitle} onChange={e => setNewLectureTitle(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Video Source URL (Vimeo, YouTube, or direct link)</label>
                  <input type="text" placeholder="" value={newLectureUrl} onChange={e => setNewLectureUrl(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                      <span>{language === "ar" ? "مدة المحاضرة (تلقائي / يدوي)" : "Duration (Auto / Manual)"}</span>
                      {detectingDuration && <span className="text-[9px] text-[#0D9488] lowercase animate-pulse font-extrabold">{language === "ar" ? "جاري الكشف..." : "detecting..."}</span>}
                    </label>
                    <input 
                      type="text" 
                      placeholder="00:00 (e.g. 45:30)"
                      value={newLectureDuration} 
                      onChange={e => setNewLectureDuration(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488] font-semibold" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  Save Lecture
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Add Flashcard */}
        {addFlashcardOpen && (
          <div key="wrap_add_flashcard" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_flashcard_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddFlashcardOpen(false)} />
            <motion.div key="modal_add_flashcard_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">Add New Flashcard</h3>
                <button onClick={() => setAddFlashcardOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddFlashcard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Question (Front Side)</label>
                  <textarea placeholder="" value={newFlashcardQuestion} onChange={e => setNewFlashcardQuestion(e.target.value)} rows={3} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 dark:focus:border-[#0D9488]/60 focus:bg-white dark:focus:bg-black transition-all font-semibold resize-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Answer (Back Side)</label>
                  <textarea placeholder="" value={newFlashcardAnswer} onChange={e => setNewFlashcardAnswer(e.target.value)} rows={3} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 dark:focus:border-[#0D9488]/60 focus:bg-white dark:focus:bg-black transition-all font-semibold resize-none" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  Save Flashcard
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Edit Lecture */}
        {editLectureOpen && (
          <div key="wrap_edit_lecture" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_edit_lecture_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditLectureOpen(false)} />
            <motion.div key="modal_edit_lecture_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">Edit Lecture</h3>
                <button onClick={() => setEditLectureOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveEditLecture} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lecture Title</label>
                  <input type="text" placeholder="" value={newLectureTitle} onChange={e => setNewLectureTitle(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status / الحالة</label>
                  <select 
                    value={newLectureStatus} 
                    onChange={e => setNewLectureStatus(e.target.value as any)} 
                    className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold"
                  >
                    <option value="ready">Ready / جاهز (مفعل بالرابط)</option>
                    <option value="coming_soon">Coming Soon / قريباً (بدون رابط)</option>
                  </select>
                </div>

                {newLectureStatus === "ready" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Video Source URL (Vimeo, YouTube, or direct link)</label>
                      <input type="text" placeholder="" value={newLectureUrl} onChange={e => setNewLectureUrl(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                          <span>{language === "ar" ? "مدة المحاضرة (تلقائي / يدوي)" : "Duration (Auto / Manual)"}</span>
                          {detectingDuration && <span className="text-[9px] text-[#0D9488] lowercase animate-pulse font-extrabold">{language === "ar" ? "جاري الكشف..." : "detecting..."}</span>}
                        </label>
                        <input 
                          type="text" 
                          placeholder="00:00 (e.g. 45:30)"
                          value={newLectureDuration} 
                          onChange={e => setNewLectureDuration(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488] font-semibold" 
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Edit Handout */}
        {editHandoutOpen && (
          <div key="wrap_edit_handout" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_edit_handout_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditHandoutOpen(false)} />
            <motion.div key="modal_edit_handout_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">Edit Handout</h3>
                <button onClick={() => setEditHandoutOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveEditHandout} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Document / Handout Name</label>
                  <input type="text" placeholder="" value={newHandoutName} onChange={e => setNewHandoutName(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status / الحالة</label>
                  <select 
                    value={newHandoutStatus} 
                    onChange={e => setNewHandoutStatus(e.target.value as any)} 
                    className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 font-semibold"
                  >
                    <option value="ready">Ready / جاهز (مفعل للملف)</option>
                    <option value="coming_soon">Coming Soon / قريباً (بدون ملف)</option>
                  </select>
                </div>

                {newHandoutStatus === "ready" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select PDF File</label>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewHandoutName(file.name);
                            const reader = new FileReader();
                            reader.onload = (loadEvt) => {
                              const b64 = loadEvt.target?.result as string;
                              setNewHandoutUrl(b64);
                            };
                            reader.readAsDataURL(file);
                            const formatBytes = (bytes: number) => {
                              if (bytes === 0) return '0 Bytes';
                              const k = 1024;
                              const dm = 2;
                              const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                              const i = Math.floor(Math.log(bytes) / Math.log(k));
                              return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
                            };
                            setNewHandoutSize(formatBytes(file.size));
                            setNewHandoutType("PDF Document");
                          }
                        }} 
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File Size</label>
                        <input type="text" value={newHandoutSize} onChange={e => setNewHandoutSize(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File Type</label>
                        <input type="text" value={newHandoutType} onChange={e => setNewHandoutType(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Add Handout */}
        {addHandoutOpen && (
          <div key="wrap_add_handout" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div key="modal_add_handout_bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddHandoutOpen(false)} />
            <motion.div key="modal_add_handout_card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-md relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <h3 className="text-sm font-black text-black dark:text-white">Add New Handout</h3>
                <button onClick={() => setAddHandoutOpen(false)} className="text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddHandout} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select PDF File</label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewHandoutName(file.name);
                        const reader = new FileReader();
                        reader.onload = (loadEvt) => {
                          const b64 = loadEvt.target?.result as string;
                          setNewHandoutUrl(b64);
                        };
                        reader.readAsDataURL(file);
                        // Format file size
                        const formatBytes = (bytes: number) => {
                          if (bytes === 0) return '0 Bytes';
                          const k = 1024;
                          const dm = 2;
                          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                          const i = Math.floor(Math.log(bytes) / Math.log(k));
                          return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
                        };
                        setNewHandoutSize(formatBytes(file.size));
                        setNewHandoutType("PDF Document");
                      }
                    }} 
                    className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Document Name (Auto-filled)</label>
                  <input type="text" placeholder="" value={newHandoutName} onChange={e => setNewHandoutName(e.target.value)} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-black dark:text-white px-3 py-2 text-xs rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-semibold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File Size (Auto-filled)</label>
                    <input type="text" value={newHandoutSize} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-500/30 text-slate-500 px-3 py-2 text-xs rounded-md outline-none font-semibold cursor-not-allowed" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File Type (Auto-filled)</label>
                    <input type="text" value={newHandoutType} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-500/30 text-slate-500 px-3 py-2 text-xs rounded-md outline-none font-semibold cursor-not-allowed" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10">
                  Save Handout
                </button>
              </form>
            </motion.div>
          </div>
        )}

        
                {/* Anki Active Recall Spaced Repetition Flashcard System */}
        {activeFlashcardIdx !== null && (
          <div key="wrap_flashcard_preview" className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div 
              key="modal_flashcard_bg" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setActiveFlashcardIdx(null)} 
            />
            <motion.div 
              key="modal_flashcard_card" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-lg relative z-10 flex flex-col space-y-4"
            >

              {ankiCompleted ? (
                /* Session Complete Celebration Card */
                <div className="bg-[#1A1A1A] border border-teal-500/40 rounded-2xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-[#0D9488]/20 text-[#0D9488] dark:text-teal-400 rounded-full flex items-center justify-center mx-auto border border-teal-500/30">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight">
                      {language === "ar" ? "🎉 اكتملت جلسة المراجعة بنجاح!" : "🎉 Session Review Complete!"}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                      {language === "ar"
                        ? "أحسنت! لقد قمت بمراجعة جميع بطاقات الاستذكار في هذا القسم وتطبيق تقنية Active Recall بنجاح."
                        : "Great job! You have reviewed all flashcards in this section with active recall feedback."}
                    </p>
                  </div>

                  {/* Rating Breakdown Pill Stats */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <span className="text-[10px] text-rose-400 font-bold block">{language === "ar" ? "إعادة" : "Again"}</span>
                      <span className="text-sm font-black text-rose-500">{ankiStats.again}</span>
                    </div>
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <span className="text-[10px] text-amber-400 font-bold block">{language === "ar" ? "صعب" : "Hard"}</span>
                      <span className="text-sm font-black text-amber-500">{ankiStats.hard}</span>
                    </div>
                    <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                      <span className="text-[10px] text-teal-400 font-bold block">{language === "ar" ? "جيد" : "Good"}</span>
                      <span className="text-sm font-black text-teal-400">{ankiStats.good}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] text-emerald-400 font-bold block">{language === "ar" ? "سهل" : "Easy"}</span>
                      <span className="text-sm font-black text-emerald-400">{ankiStats.easy}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => startAnkiSession(0)}
                      className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
                    >
                      {language === "ar" ? "مراجعة البطاقات مرة أخرى" : "Study Deck Again"}
                    </button>
                    <button
                      onClick={() => setActiveFlashcardIdx(null)}
                      className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-zinc-700 cursor-pointer"
                    >
                      {language === "ar" ? "إغلاق" : "Close"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Anki Card View */
                (() => {
                  const currCardIdx = ankiQueue.length > 0 ? ankiQueue[ankiQueueIdx] : (activeFlashcardIdx || 0);
                  const currCard = flashcards[currCardIdx] || { question: "N/A", answer: "N/A" };
                  const remainingCards = ankiQueue.length - ankiQueueIdx;

                  return (
                    <div className="space-y-4">
                      {/* Top Header Controls & Progress */}
                      <div className="flex items-center justify-between bg-[#1A1A1A] border border-teal-500/20 px-4 py-2.5 rounded-xl text-xs text-slate-300">
                        <div className="flex items-center gap-3 font-bold">
                          <span className="px-2.5 py-0.5 bg-[#0D9488]/20 text-[#0D9488] dark:text-teal-400 rounded-md border border-teal-500/30 text-[10px] uppercase tracking-wider font-extrabold">
                            Anki Active Recall
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {language === "ar" ? `المتبقي: ${remainingCards}` : `Remaining: ${remainingCards}`}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <span>{language === "ar" ? "سهل / متقن:" : "Easy Mastered:"}</span>
                            <span className="text-white font-black">{ankiStats.easy}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = flashcards.filter((_, idx) => idx !== currCardIdx);
                                setFlashcards(updated);
                                if (updated.length === 0) {
                                  setActiveFlashcardIdx(null);
                                } else {
                                  startAnkiSession(0);
                                }
                              }}
                              className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                              title="Delete card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setActiveFlashcardIdx(null)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* 3D Flip Card Container */}
                      <div className="w-full perspective-1000 h-72 relative">
                        <motion.div 
                          key="modal_flashcard_flipper" 
                          animate={{ rotateY: isFlipped ? 180 : 0 }} 
                          transition={{ duration: 0.45 }} 
                          style={{ transformStyle: "preserve-3d" }} 
                          className="w-full h-full relative"
                        >
                          {/* Front (Question Side) */}
                          <div 
                            style={{ backfaceVisibility: "hidden" }} 
                            className="absolute inset-0 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                ❓ {language === "ar" ? "السؤال / المفهوم" : "Question / Prompt"}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                Card {ankiQueueIdx + 1} of {ankiQueue.length}
                              </span>
                            </div>

                            {isAdmin ? (
                              <textarea
                                value={currCard.question}
                                onChange={(e) => {
                                  const updated = [...flashcards];
                                  updated[currCardIdx] = { ...updated[currCardIdx], question: e.target.value };
                                  setFlashcards(updated);
                                }}
                                className="w-full bg-transparent border-none outline-none font-black text-base text-black dark:text-white text-center leading-relaxed py-2 focus:ring-0 resize-none min-h-[120px]"
                              />
                            ) : (
                              <p className="w-full font-black text-base text-black dark:text-white text-center leading-relaxed py-2 min-h-[120px] flex items-center justify-center">
                                {currCard.question}
                              </p>
                            )}

                            <div className="text-center pt-2">
                              <button
                                type="button"
                                onClick={() => setIsFlipped(true)}
                                className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all cursor-pointer inline-flex items-center gap-2"
                              >
                                <RotateCw className="w-4 h-4" />
                                <span>{language === "ar" ? "إظهار الإجابة" : "Show Answer"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Back (Answer Side) */}
                          <div 
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} 
                            className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#1A1A1A] to-[#1A1A1A] border border-[#0D9488]/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0D9488] bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                                💡 {language === "ar" ? "الإجابة والتوضيح" : "Answer & Explanation"}
                              </span>
                              <span className="text-[10px] font-bold text-[#0D9488]">
                                Active Recall Feedback
                              </span>
                            </div>

                            {isAdmin ? (
                              <textarea
                                value={currCard.answer}
                                onChange={(e) => {
                                  const updated = [...flashcards];
                                  updated[currCardIdx] = { ...updated[currCardIdx], answer: e.target.value };
                                  setFlashcards(updated);
                                }}
                                className="w-full bg-transparent border-none outline-none font-bold text-sm text-black dark:text-white text-center leading-relaxed py-2 focus:ring-0 resize-none min-h-[120px]"
                              />
                            ) : (
                              <p className="w-full font-extrabold text-sm text-black dark:text-white text-center leading-relaxed py-2 min-h-[120px] flex items-center justify-center">
                                {currCard.answer}
                              </p>
                            )}

                            <div className="text-center pt-2">
                              <button
                                type="button"
                                onClick={() => setIsFlipped(false)}
                                className="text-[10px] text-slate-400 hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>{language === "ar" ? "قلب البطاقة للسؤال" : "Flip back to question"}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Anki Active Recall Rating Action Buttons Bar (Visible on Back/Answer) */}
                      {isFlipped && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-4 gap-2.5 pt-2"
                        >
                          {(() => {
                            const currCardIdx = ankiQueue.length > 0 ? ankiQueue[ankiQueueIdx] : (activeFlashcardIdx || 0);
                            const card = flashcards[currCardIdx];
                            const revCount = (card as any)?.reviewCount || 0;

                            return (
                              <>
                                <button
                                  onClick={() => handleAnkiRate("again")}
                                  className="flex flex-col items-center justify-center py-2.5 px-2 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer group shadow-md"
                                >
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-rose-100">{getAnkiIntervalLabel("again", revCount)}</span>
                                  <span className="text-xs font-black tracking-wide mt-0.5">{language === "ar" ? "مرة أخرى" : "Again"}</span>
                                </button>

                                <button
                                  onClick={() => handleAnkiRate("hard")}
                                  className="flex flex-col items-center justify-center py-2.5 px-2 bg-amber-600/20 hover:bg-amber-600 border border-amber-500/30 hover:border-amber-600 text-amber-400 hover:text-white rounded-xl transition-all cursor-pointer group shadow-md"
                                >
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-amber-100">{getAnkiIntervalLabel("hard", revCount)}</span>
                                  <span className="text-xs font-black tracking-wide mt-0.5">{language === "ar" ? "صعب" : "Hard"}</span>
                                </button>

                                <button
                                  onClick={() => handleAnkiRate("good")}
                                  className="flex flex-col items-center justify-center py-2.5 px-2 bg-[#0D9488]/20 hover:bg-[#0D9488] border border-[#0D9488]/40 hover:border-[#0D9488] text-teal-400 hover:text-white rounded-xl transition-all cursor-pointer group shadow-md"
                                >
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-teal-100">{getAnkiIntervalLabel("good", revCount)}</span>
                                  <span className="text-xs font-black tracking-wide mt-0.5">{language === "ar" ? "جيد" : "Good"}</span>
                                </button>

                                <button
                                  onClick={() => handleAnkiRate("easy")}
                                  className="flex flex-col items-center justify-center py-2.5 px-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer group shadow-md"
                                >
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-100">{getAnkiIntervalLabel("easy", revCount)}</span>
                                  <span className="text-xs font-black tracking-wide mt-0.5">{language === "ar" ? "سهل" : "Easy"}</span>
                                </button>
                              </>
                            );
                          })()}
                        </motion.div>
                      )}
                    </div>
                  );
                })()
              )}
            </motion.div>
          </div>
        )}


        {/* Modal: "Test Your Knowledge" (Lecture Quiz) */}
        {activeLectureQuizIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveLectureQuizIdx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-lg p-6 w-full max-w-lg relative z-10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-teal-500/20 pb-3">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0D9488] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded border border-teal-200/20">Test Your Knowledge</span>
                  <h3 className="text-sm font-black text-black dark:text-white mt-1 leading-tight">Quiz: {lectures[activeLectureQuizIdx].title}</h3>
                </div>
                <button onClick={() => setActiveLectureQuizIdx(null)} className="text-slate-400 hover:text-slate-650"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-black dark:text-white leading-relaxed">
                  {mockLectureQuizQuestions[0].question}
                </p>

                <div className="space-y-2">
                  {mockLectureQuizQuestions[0].options.map((option, idx) => {
                    const isSelected = lectureQuizSelectedOption === idx;
                    const isCorrect = idx === mockLectureQuizQuestions[0].correctAnswer;
                    
                    let optStyle = "border-slate-200 hover:border-[#0D9488]/40 hover:bg-teal-50/50 text-black dark:border-teal-500/25 dark:hover:border-[#0D9488]/40 dark:hover:bg-black dark:text-white";
                    if (isSelected && !lectureQuizSubmitted) {
                      optStyle = "bg-[#0D9488]/5 border-[#0D9488] text-[#0D9488] dark:text-teal-400";
                    } else if (lectureQuizSubmitted) {
                      if (isCorrect) {
                        optStyle = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 pointer-events-none";
                      } else if (isSelected) {
                        optStyle = "bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-700 dark:text-rose-400 pointer-events-none";
                      } else {
                        optStyle = "border-slate-100 dark:border-teal-500/10 text-slate-350 dark:text-slate-655 opacity-50 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={lectureQuizSubmitted}
                        onClick={() => setLectureQuizSelectedOption(idx)}
                        className={`w-full text-left p-3.5 rounded-md border text-xs font-bold flex items-center gap-3 transition-colors ${optStyle}`}
                      >
                        <span className={`w-5.5 h-5.5 rounded-md text-[9px] font-extrabold border flex items-center justify-center shrink-0
                          ${isSelected ? "bg-[#0D9488] border-[#0D9488] text-white" : "bg-white dark:bg-black border-slate-200 dark:border-teal-500/20 text-black dark:text-white"}
                          ${lectureQuizSubmitted && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                          ${lectureQuizSubmitted && isSelected && !isCorrect ? "bg-rose-500 border-rose-500 text-white" : ""}
                        `}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-teal-500/25">
                  {!lectureQuizSubmitted ? (
                    <button
                      disabled={lectureQuizSelectedOption === null}
                      onClick={() => {
                        setLectureQuizSubmitted(true);
                        if (lectureQuizSelectedOption === mockLectureQuizQuestions[0].correctAnswer) {
                          setLectureQuizScore(1);
                        }
                      }}
                      className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-650 text-xs font-bold rounded-md transition-all shadow-md shadow-teal-500/10"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveLectureQuizIdx(null)}
                      className="px-5 py-2.5 bg-white dark:bg-black hover:bg-teal-50/50 dark:hover:bg-[#1A1A1A] text-black dark:text-white text-xs font-bold rounded-md transition-all border border-slate-200 dark:border-teal-500/40"
                    >
                      Close Quiz
                    </button>
                  )}
                </div>

                {lectureQuizSubmitted && (
                  <div className="p-4 bg-white dark:bg-black border border-slate-200/50 dark:border-teal-500/20 rounded-lg text-xs text-black dark:text-white leading-relaxed font-medium">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Explanation</span>
                    {mockLectureQuizQuestions[0].explanation}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {/* Auth Modal Overlay */}
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => {
                setAuthModalOpen(false);
                setAuthIsOtpState(false);
              }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-md p-8 text-brand-text"
            >
              <button 
                onClick={() => {
                  setAuthModalOpen(false);
                  setAuthIsOtpState(false);
                }} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {!authIsOtpState ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-10 h-10 bg-[#0D9488] rounded-lg flex items-center justify-center text-white font-black text-lg mx-auto mb-3 shadow-lg shadow-teal-500/10">
                      M
                    </div>
                    <h3 className="text-xl font-extrabold text-black dark:text-white tracking-tight">Unlock Content</h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wider">Please sign in to access lectures and handouts</p>
                  </div>

                  <div className="flex border-b border-slate-100 dark:border-teal-500/25 mb-4 relative">
                    <button 
                      onClick={() => setAuthModalTab("login")}
                      className={`flex-1 pb-2 text-xs font-bold transition-colors ${authModalTab === "login" ? "text-[#0D9488]" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setAuthModalTab("register")}
                      className={`flex-1 pb-2 text-xs font-bold transition-colors ${authModalTab === "register" ? "text-[#0D9488]" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAuthShowConfirmModal(true);
                    }} 
                    className="space-y-3"
                  >
                    {authModalTab === "register" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                            <input type="text" placeholder="" value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                            <input type="text" placeholder="" value={authLastName} onChange={e => setAuthLastName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "الجامعة" : "University"}</label>
                            <input type="text" placeholder="" value={authUniversity} onChange={e => setAuthUniversity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "التخصص" : "Specialization"}</label>
                            <input type="text" placeholder="" value={authSpecialization} onChange={e => setAuthSpecialization(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200" required />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "كيف سمعت عنا؟" : "How did you hear about us?"}</label>
                          <select 
                            value={authHearAboutUs} 
                            onChange={e => setAuthHearAboutUs(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200 font-medium"
                            required
                          >
                            <option value="">{language === "ar" ? "اختر مصدراً..." : "Select an option..."}</option>
                            <option value="instagram">{language === "ar" ? "انستغرام" : "Instagram"}</option>
                            <option value="facebook">{language === "ar" ? "فيسبوك" : "Facebook"}</option>
                            <option value="friends">{language === "ar" ? "أصدقاء / زملاء" : "Friends / Peers"}</option>
                            <option value="tiktok">{language === "ar" ? "تيك توك" : "TikTok"}</option>
                            <option value="twitter">{language === "ar" ? "تويتر / X" : "Twitter / X"}</option>
                            <option value="linkedin">{language === "ar" ? "لينكد إن" : "LinkedIn"}</option>
                            <option value="google">{language === "ar" ? "جوجل / محركات البحث" : "Google / Search Engine"}</option>
                            <option value="other">{language === "ar" ? "أخرى" : "Other"}</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                      <input 
                        type="email" 
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder=""
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]/40 focus:bg-slate-100 dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-350"
                      />
                    </div>
                    {authModalTab !== "forgot" && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "كلمة المرور" : "Password"}</label>
                          {authModalTab === "login" && (
                            <button 
                              type="button"
                              onClick={() => setAuthModalTab("forgot")}
                              className="text-[9px] font-bold text-[#0D9488] hover:underline animate-pulse"
                            >
                              {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot?"}
                            </button>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder=""
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-slate-100 dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-350"
                        />
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full mt-4 py-3 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {authModalTab === "login" 
                        ? (language === "ar" ? "دخول" : "Sign In") 
                        : (authModalTab === "register" 
                          ? (language === "ar" ? "إنشاء حساب الآن" : "Register Now") 
                          : (language === "ar" ? "إرسال رمز الاستعادة" : "Send Reset Code")
                        )
                      }
                    </button>
                    {authModalTab === "forgot" && (
                      <div className="text-center mt-2">
                        <button 
                          type="button"
                          onClick={() => setAuthModalTab("login")}
                          className="text-[10px] font-bold text-slate-450 hover:text-[#0D9488]"
                        >
                          {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                        </button>
                      </div>
                    )}

                    <div className="relative flex py-2 items-center mt-3">
                      <div className="flex-grow border-t border-slate-200/50 dark:border-teal-500/10"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === "ar" ? "أو المتابعة باستخدام" : "Or continue with"}
                      </span>
                      <div className="flex-grow border-t border-slate-200/50 dark:border-teal-500/10"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem("medicinety_user_role", "student");
                          localStorage.setItem("medicinety_logged_in_user", "google-user@gmail.com");
                          window.dispatchEvent(new Event("medicinety_auth_change"));
                          setAuthModalOpen(false);
                          if (pendingCallback) pendingCallback();
                        }}
                        className="flex items-center justify-center p-2.5 bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-teal-950/20 border border-slate-200/60 dark:border-teal-500/25 rounded-lg transition-all transform active:scale-95 cursor-pointer"
                        title="Google"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </button>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem("medicinety_user_role", "student");
                          localStorage.setItem("medicinety_logged_in_user", "apple-user@apple.com");
                          window.dispatchEvent(new Event("medicinety_auth_change"));
                          setAuthModalOpen(false);
                          if (pendingCallback) pendingCallback();
                        }}
                        className="flex items-center justify-center p-2.5 bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-teal-950/20 border border-slate-200/60 dark:border-teal-500/25 rounded-lg transition-all transform active:scale-95 cursor-pointer"
                        title="Apple"
                      >
                        <svg className="w-4 h-4 text-black dark:text-white fill-current" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.57 2.94-1.39z"/>
                        </svg>
                      </button>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem("medicinety_user_role", "student");
                          localStorage.setItem("medicinety_logged_in_user", "microsoft-user@outlook.com");
                          window.dispatchEvent(new Event("medicinety_auth_change"));
                          setAuthModalOpen(false);
                          if (pendingCallback) pendingCallback();
                        }}
                        className="flex items-center justify-center p-2.5 bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-teal-950/20 border border-slate-200/60 dark:border-teal-500/25 rounded-lg transition-all transform active:scale-95 cursor-pointer"
                        title="Microsoft"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 23 23">
                          <path fill="#f35325" d="M0 0h11v11H0z"/>
                          <path fill="#81bc06" d="M12 0h11v11H12z"/>
                          <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                          <path fill="#ffba08" d="M12 12h11v11H12z"/>
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950/20 text-[#0D9488] rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-black dark:text-white tracking-tight">Verify Code</h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 leading-normal">
                      We sent a code to <span className="text-black dark:text-white font-bold">{authEmail}</span>
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAuthIsVerifying(true);
                      setTimeout(() => {
                        setAuthIsVerifying(false);
                        const clean = authEmail.toLowerCase().trim();
                        const savedAdmins = localStorage.getItem("medicinety_platform_admins");
                        const admins = savedAdmins ? JSON.parse(savedAdmins) : ["admin"];
                        const isAdm = admins.includes(clean);
                        localStorage.setItem("medicinety_user_role", isAdm ? "admin" : "student");
                        localStorage.setItem("medicinety_logged_in_user", clean);
                        if (authModalTab === "register") {
                          const profile = {
                            firstName: authFirstName,
                            lastName: authLastName,
                            university: authUniversity,
                            specialization: authSpecialization,
                            hearAboutUs: authHearAboutUs
                          };
                          localStorage.setItem("medicinety_student_profile", JSON.stringify(profile));
                        }
                        window.dispatchEvent(new Event("medicinety_auth_change"));
                        setIsAdmin(isAdm);
                        setAuthModalOpen(false);
                        setAuthIsOtpState(false);
                        if (pendingCallback) {
                          pendingCallback();
                        }
                      }, 1000);
                    }} 
                    className="space-y-4"
                  >
                    <div className="flex gap-1.5 justify-center">
                      {authOtp.map((digit, index) => (
                        <input
                          key={index}
                          id={`auth-otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isNaN(Number(val))) return;
                            const newOtp = [...authOtp];
                            newOtp[index] = val.substring(val.length - 1);
                            setAuthOtp(newOtp);
                            if (val && index < 5) {
                              document.getElementById(`auth-otp-${index + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !authOtp[index] && index > 0) {
                              document.getElementById(`auth-otp-${index - 1}`)?.focus();
                            }
                          }}
                          className="w-10 h-10 text-center text-md font-bold text-black dark:text-white bg-slate-50 dark:bg-black border border-slate-300 dark:border-teal-500/40 focus:border-[#0D9488] rounded outline-none transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    <button 
                      type="submit"
                      disabled={authIsVerifying || authOtp.join("").length < 6}
                      className={`w-full py-3 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md transition-all
                        ${authIsVerifying || authOtp.join("").length < 6 ? "bg-slate-300 cursor-not-allowed opacity-50" : "bg-[#0D9488] hover:bg-[#0D9488]/95"}
                      `}
                    >
                      {authIsVerifying ? "Verifying..." : "Verify & Unlock"}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setAuthIsOtpState(false)}
                      className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Back to Credentials
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
        {/* Auth Confirmation Modal */}
        <AnimatePresence>
          {authShowConfirmModal && (
            <div key="wrap_auth_confirm" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                key="modal_auth_confirm_bg"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
                onClick={() => setAuthShowConfirmModal(false)} 
              />
              <motion.div 
                key="modal_auth_confirm_card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }} 
                className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-sm p-6 text-center"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#0D9488]/10 dark:bg-teal-950/40 border border-teal-500/15 text-[#0D9488] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                      {language === "ar" ? "تأكيد تسجيل الدخول" : "Confirm Sign In"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                      {language === "ar" 
                        ? `هل أنت متأكد من رغبتك في تسجيل الدخول إلى الحساب المرتبط بالبريد الإلكتروني ${authEmail}؟` 
                        : `Are you sure you want to sign in to the account associated with ${authEmail}?`
                      }
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        setAuthShowConfirmModal(false);
                        setAuthIsOtpState(true);
                      }}
                      className="py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      {language === "ar" ? "نعم، استمرار" : "Yes, Proceed"}
                    </button>
                    <button
                      onClick={() => setAuthShowConfirmModal(false)}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg transition-all"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Unlock Course Modal */}
        {unlockModalOpen && (
          <div key="wrap_unlock_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in text-brand-text">
            <motion.div 
              key="modal_unlock_bg"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => {
                setUnlockModalOpen(false);
                setUnlockSuccess(false);
                setContactRequestSent(false);
              }} 
            />
            <motion.div 
              key="modal_unlock_card"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-lg p-6 md:p-8"
            >
              <button 
                onClick={() => {
                  setUnlockModalOpen(false);
                  setUnlockSuccess(false);
                  setContactRequestSent(false);
                }} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {unlockModalTab === "code" ? (
                /* CODE ACTIVATION TAB */
                <div className="space-y-4">
                  <div className="text-center mb-4">

                    <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                      {language === "ar" ? "تفعيل محتوى الكورس" : "Activate Course Content"}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 leading-normal uppercase">
                      {language === "ar" ? "أدخل كود تفعيل الكورس أو رقم البطاقة للوصول الفوري" : "Enter activation code or card number for instant access"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed text-center">
                    {language === "ar" 
                      ? "إذا قمت بشراء بطاقة شحن تفعيل مسبقاً من أحد وكلائنا أو مكاتبنا المعتمدة، الرجاء إدخال الكود بالأسفل لتفعيل المادة فوراً." 
                      : "If you have purchased a prepaid activation card from our authorized agents, please enter the code below to activate the course instantly."}
                  </p>

                  <div className="space-y-3">
                    {unlockSuccess ? (
                      <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-[#0D9488] dark:text-teal-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                        <Icons.CheckCircle className="w-5 h-5" />
                        <span>
                          {language === "ar" ? "تهانينا! تم تفعيل المادة بنجاح. جاري فتح المحتوى..." : "Congratulations! The course has been successfully activated. Loading content..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={unlockCode}
                          onChange={(e) => setUnlockCode(e.target.value)}
                          placeholder={language === "ar" ? "أدخل كود التفعيل (مثال: MC-8924)" : "Enter activation code (e.g. MC-8924)"}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-slate-100 dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 px-3 py-3 rounded-lg outline-none transition-all placeholder:text-slate-400 font-bold text-center"
                        />
                        <button
                          onClick={async () => {
                            const inputCode = unlockCode.trim();
                            if (!inputCode) return;
                            const user = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
                            
                            // Load global activation codes with live Supabase cloud sync
                            const liveCodes = await getLivePlatformData("medicinety_activation_codes", []);
                            const savedCodes = localStorage.getItem("medicinety_activation_codes");
                            const localCodes = savedCodes ? JSON.parse(savedCodes) : [];
                            const codesList = Array.isArray(liveCodes) && liveCodes.length > 0 ? liveCodes : localCodes;
                            
                            const foundCodeIndex = codesList.findIndex((c: any) => c.code.toLowerCase() === inputCode.toLowerCase());
                            
                            if (foundCodeIndex === -1) {
                              setCodeAlert({
                                isOpen: true,
                                title: language === "ar" ? "كود غير صحيح" : "Invalid Code",
                                message: language === "ar" ? "الكود المدخل غير صحيح. يرجى التحقق وإعادة المحاولة." : "Invalid activation code. Please double-check and try again."
                              });
                              return;
                            }
                            
                            const codeItem = codesList[foundCodeIndex];
                            
                            if (codeItem.status === "generated") {
                              setCodeAlert({
                                isOpen: true,
                                title: language === "ar" ? "كود غير مفعّل" : "Inactive Code",
                                message: language === "ar" ? "هذا الكود لم يتم بيعه وتفعيله بعد من قبل الإدارة. يرجى التواصل مع الدعم." : "This code has not been marked as sold/activated by admin yet. Please contact support."
                              });
                              return;
                            }
                            
                            if (codeItem.status === "used") {
                              setCodeAlert({
                                isOpen: true,
                                title: language === "ar" ? "كود مستخدم مسبقاً" : "Code Already Used",
                                message: language === "ar" ? "هذا الكود تم استخدامه مسبقاً." : "This activation code has already been used."
                              });
                              return;
                            }
                            
                            // Check subject restriction
                            if (codeItem.subjectId !== "all" && codeItem.subjectId !== subjectId) {
                              setCodeAlert({
                                isOpen: true,
                                title: language === "ar" ? "مساق غير مطابق" : "Course Mismatch",
                                message: language === "ar" ? "هذا الكود مخصص لمساق آخر ولا يمكن استخدامه لتفعيل هذا المساق." : "This code is restricted to a different course and cannot unlock this subject."
                              });
                              return;
                            }
                            
                            // Success! Calculate expiration date
                            let expiresAt: string | null = null;
                            const expiryDateObj = new Date();
                            if (codeItem.priceTier === "semester") {
                              expiryDateObj.setDate(expiryDateObj.getDate() + 120);
                              expiresAt = expiryDateObj.toISOString();
                            } else if (codeItem.priceTier === "yearly") {
                              expiryDateObj.setDate(expiryDateObj.getDate() + 365);
                              expiresAt = expiryDateObj.toISOString();
                            } else if (codeItem.priceTier === "other" && codeItem.customDuration) {
                              const { days = 0, hours = 0, minutes = 0, seconds = 0 } = codeItem.customDuration;
                              expiryDateObj.setDate(expiryDateObj.getDate() + days);
                              expiryDateObj.setHours(expiryDateObj.getHours() + hours);
                              expiryDateObj.setMinutes(expiryDateObj.getMinutes() + minutes);
                              expiryDateObj.setSeconds(expiryDateObj.getSeconds() + seconds);
                              expiresAt = expiryDateObj.toISOString();
                            }

                            // Mark code as used
                            codeItem.status = "used";
                            codeItem.usedBy = user;
                            codeItem.usedAt = new Date().toISOString();
                            codeItem.expiresAt = expiresAt;
                            await saveLivePlatformData("medicinety_activation_codes", codesList);
                            
                            // Track active subscriptions in global stats
                            try {
                              const activeSubs = parseInt(localStorage.getItem("medicinety_global_subscriptions") || "0", 10);
                              saveLivePlatformData("medicinety_global_subscriptions", (activeSubs + 1).toString());
                            } catch(e) {}

                            const subItem = {
                              subjectId,
                              activatedAt: new Date().toISOString(),
                              expiresAt
                            };
                            
                            const subsKey = `medicinety_subscriptions_${user}`;
                            const savedSubs = localStorage.getItem(subsKey);
                            const subsList = savedSubs ? JSON.parse(savedSubs) : [];
                            const filteredSubs = subsList.filter((s: any) => s.subjectId !== subjectId);
                            filteredSubs.push(subItem);
                            await saveLivePlatformData(subsKey, filteredSubs);
                            
                            // Backward compatibility simple unlocked list
                            const storageKey = `medicinety_unlocked_courses_${user}`;
                            const unlocked = localStorage.getItem(storageKey);
                            const unlockedList = unlocked ? JSON.parse(unlocked) : [];
                            if (!unlockedList.includes(subjectId)) {
                              unlockedList.push(subjectId);
                            }
                            localStorage.setItem(storageKey, JSON.stringify(unlockedList));
                            
                            setUnlockSuccess(true);
                            window.dispatchEvent(new Event("medicinety_auth_change"));
                            setTimeout(() => {
                              setIsCourseUnlocked(true);
                              setUnlockModalOpen(false);
                              setUnlockSuccess(false);
                              window.location.href = "/my-courses";
                            }, 1500);
                          }}
                          className="w-full py-3 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          {language === "ar" ? "تفعيل الكورس الآن" : "Activate Course Now"}
                        </button>
                      </>
                    )}
                  </div>

                  {!unlockSuccess && (
                    <div className="pt-2 border-t border-slate-100 dark:border-teal-500/10 text-center">
                      <button 
                        onClick={() => setUnlockModalTab("request")}
                        className="text-xs font-bold text-[#0D9488] hover:text-[#0D9488]/80 transition-colors uppercase tracking-wide"
                      >
                        {language === "ar" ? "ليس لديك كود تفعيل؟ اطلب التفعيل الآن" : "Don't have an activation code? Request activation now"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* REQUEST ACTIVATION TAB */
                <div className="space-y-5">
                  <div className="text-center mb-2">

                    <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                      {language === "ar" ? "طلب تفعيل الكورس" : "Request Course Activation"}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 leading-normal uppercase">
                      {language === "ar" ? "اختر باقة الاشتراك المناسبة وسنتواصل معك لتسليم الكود" : "Select the subscription plan and we will contact you to deliver the code"}
                    </p>
                  </div>

                  {/* Plans */}
                  <div className={`grid gap-2.5 ${coursePrices.other ? "grid-cols-4" : "grid-cols-3"}`}>
                    {[
                      { key: "semester", name: language === "ar" ? "أربعة أشهر" : "4 Months", price: coursePrices.semester },
                      { key: "yearly", name: language === "ar" ? "سنة كاملة" : "Yearly", price: coursePrices.yearly },
                      { key: "lifetime", name: language === "ar" ? "مدى الحياة" : "Lifetime", price: coursePrices.lifetime },
                      ...(coursePrices.other ? [{
                        key: "other",
                        name: language === "ar" 
                          ? `مخصص (${coursePrices.otherValue} ${
                              coursePrices.otherUnit === "seconds" ? "ث" : 
                              coursePrices.otherUnit === "minutes" ? "د" : 
                              coursePrices.otherUnit === "hours" ? "س" : "ي"
                            })` 
                          : `Custom (${coursePrices.otherValue}${
                              coursePrices.otherUnit === "seconds" ? "s" : 
                              coursePrices.otherUnit === "minutes" ? "m" : 
                              coursePrices.otherUnit === "hours" ? "h" : "d"
                            })`,
                        price: coursePrices.other
                      }] : [])
                    ].map((plan) => (
                      <div
                        key={plan.key}
                        onClick={() => setSelectedPlan(plan.key as any)}
                        className={`cursor-pointer border rounded-lg p-3 text-center transition-all relative overflow-hidden select-none
                          ${selectedPlan === plan.key 
                            ? "border-[#0D9488] dark:border-teal-400 bg-[#0D9488]/5 shadow-sm" 
                            : "border-slate-200/50 dark:border-teal-500/10 hover:border-slate-300"
                          }
                        `}
                      >
                        <h4 className="text-[10px] font-bold text-black dark:text-white truncate">{plan.name}</h4>
                        <div className="text-md font-black text-black dark:text-white mt-1">${plan.price}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {contactRequestSent ? (
                      <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-[#0D9488] dark:text-teal-400 rounded-lg text-xs font-bold flex flex-col items-center text-center gap-2">
                        <Icons.CheckCircle2 className="w-8 h-8 text-[#0D9488] dark:text-teal-400" />
                        <span>
                          {language === "ar" ? "تم إرسال طلبك بنجاح! سيتواصل معك فريق المنصة لتسليمك الكود الخاص بك." : "Your request was sent successfully! Our team will contact you to deliver your activation code."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-slate-400 text-center leading-normal">
                          {language === "ar" 
                            ? "أدخل رقم هاتفك المحمول أدناه، وسيتواصل معك فريقنا خلال ساعات قليلة لتسليمك كود التفعيل والدفع بسهولة." 
                            : "Enter your mobile phone number below, and our team will contact you within a few hours to deliver your activation and payment code."}
                        </p>
                        <div className="flex gap-2">
                          <select
                            value={phoneCountry}
                            onChange={(e) => setPhoneCountry(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 px-2 py-2.5 rounded-lg outline-none cursor-pointer focus:border-[#0D9488]/40 font-bold"
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
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder={language === "ar" ? "رقم الهاتف (مثل: 791234567)" : "Phone number (e.g. 791234567)"}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-slate-100 dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-400 font-bold text-center"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!phoneNumber.trim()) return;
                            setContactRequestSent(true);
                          }}
                          className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          {language === "ar" ? "إرسال طلب التفعيل للفريق" : "Send activation request to team"}
                        </button>
                      </>
                    )}
                  </div>

                  {!contactRequestSent && (
                    <div className="pt-2 border-t border-slate-100 dark:border-teal-500/10 text-center">
                      <button 
                        onClick={() => setUnlockModalTab("code")}
                        className="text-xs font-bold text-[#0D9488] hover:text-[#0D9488]/80 transition-colors uppercase tracking-wide"
                      >
                        {language === "ar" ? "لديك كود تفعيل بالفعل؟ أدخله هنا" : "Already have an activation code? Enter it here"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {codeAlert.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/25 rounded-2xl max-w-sm w-full p-6 text-center shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wide">
              {codeAlert.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {codeAlert.message}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCodeAlert({ ...codeAlert, isOpen: false })}
                className="px-6 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md"
              >
                {language === "ar" ? "موافق" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Admin Course Pricing & Free Trial Lectures Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <Icons.Settings className="w-5 h-5 text-[#0D9488]" />
                <span>{language === "ar" ? "إعدادات تسعير وحالة الكورس" : "Course Pricing & Trial Settings"}</span>
              </h3>
              <button
                onClick={() => setShowPricingModal(false)}
                className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

                        <form
              onSubmit={(e) => {
                e.preventDefault();
                // 1. Save individual course pricing
                saveLivePlatformData(`medicinety_course_${subjectId}_pricing`, coursePricing);

                // 2. Also sync to parent course lists so cards in other pages reflect the new price
                const updateList = (listKey: string) => {
                  const raw = localStorage.getItem(listKey);
                  if (raw) {
                    try {
                      const list = JSON.parse(raw);
                      if (Array.isArray(list)) {
                        const updated = list.map((c: any) => {
                          if (c.id === subjectId) {
                            return {
                              ...c,
                              isPaid: coursePricing.isPaid,
                              price: coursePricing.price,
                              originalPrice: coursePricing.originalPrice,
                              priceSemester: coursePricing.priceSemester,
                              originalPriceSemester: coursePricing.originalPriceSemester,
                              priceYearly: coursePricing.priceYearly,
                              originalPriceYearly: coursePricing.originalPriceYearly,
                              priceLifetime: coursePricing.priceLifetime,
                              originalPriceLifetime: coursePricing.originalPriceLifetime,
                              freeLecturesCount: coursePricing.freeLecturesCount
                            };
                          }
                          return c;
                        });
                        saveLivePlatformData(listKey, updated);
                      }
                    } catch (err) {}
                  }
                };

                updateList("medicinety_general_principles_list");
                updateList("medicinety_systems_list");
                updateList("medicinety_clinical_list");
                window.dispatchEvent(new Event("medicinety_pricing_change"));

                setShowPricingModal(false);
              }}
              className="space-y-4 text-xs font-bold"
            >
              {/* Paid or Free Toggle */}
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-200">{language === "ar" ? "حالة الكورس:" : "Course Status:"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoursePricing(prev => ({ ...prev, isPaid: false }))}
                    className={`py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      !coursePricing.isPaid 
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    🟢 {language === "ar" ? "مجاني بالكامل" : "100% Free"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoursePricing(prev => ({ ...prev, isPaid: true }))}
                    className={`py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      coursePricing.isPaid 
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20" 
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    💎 {language === "ar" ? "كورس مدفوع باشتراك" : "Paid / Premium"}
                  </button>
                </div>
              </div>

              {/* Course Plans Pricing Grid */}
              {coursePricing.isPaid && (
                <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-500/20 animate-fade-in">
                  <h4 className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    {language === "ar" ? "💰 خطط وباقات الاشتراك:" : "💰 Subscription Plans Pricing:"}
                  </h4>

                  {/* Semester Plan */}
                  <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-amber-500/20">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5 font-bold">
                        {language === "ar" ? "الفصلي (4 أشهر):" : "Semester (4 mo):"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.priceSemester || "$35"}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, priceSemester: e.target.value, price: e.target.value }))}
                        placeholder="$35"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-black text-black dark:text-white outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        {language === "ar" ? "قبل الخصم:" : "Original Price:"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.originalPriceSemester || ""}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, originalPriceSemester: e.target.value, originalPrice: e.target.value }))}
                        placeholder="$60"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-500 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                  </div>

                  {/* Yearly Plan */}
                  <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-amber-500/20">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5 font-bold">
                        {language === "ar" ? "السنوي (سنة كاملة):" : "Yearly Plan:"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.priceYearly || "$49"}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, priceYearly: e.target.value }))}
                        placeholder="$49"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-black text-black dark:text-white outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        {language === "ar" ? "قبل الخصم:" : "Original Price:"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.originalPriceYearly || ""}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, originalPriceYearly: e.target.value }))}
                        placeholder="$89"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-500 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                  </div>

                  {/* Lifetime Plan */}
                  <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-amber-500/20">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5 font-bold">
                        {language === "ar" ? "مدى الحياة (شامل):" : "Lifetime Plan:"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.priceLifetime || "$99"}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, priceLifetime: e.target.value }))}
                        placeholder="$99"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-black text-black dark:text-white outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">
                        {language === "ar" ? "قبل الخصم:" : "Original Price:"}
                      </label>
                      <input
                        type="text"
                        value={coursePricing.originalPriceLifetime || ""}
                        onChange={(e) => setCoursePricing(prev => ({ ...prev, originalPriceLifetime: e.target.value }))}
                        placeholder="$149"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-500 outline-none focus:border-[#0D9488]"
                      />
                    </div>
                  </div>

                  {/* Free Trial Lectures Count */}
                  <div>
                    <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1 font-bold">
                      {language === "ar" ? "عدد المحاضرات التجريبية المجانية:" : "Free Trial Lectures Count:"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={coursePricing.freeLecturesCount}
                      onChange={(e) => setCoursePricing(prev => ({ ...prev, freeLecturesCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-500/30 rounded-xl text-xs font-black text-black dark:text-white outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-normal">
                      {language === "ar" 
                        ? `(أول ${coursePricing.freeLecturesCount} محاضرات ستكون مجانية ومتاحة لأي طالب للتجربة، وباقي المحاضرات مقفلة 🔒 للمشتركين فقط)`
                        : `(First ${coursePricing.freeLecturesCount} lectures unlocked for preview, remaining lectures locked 🔒)`}
                    </p>
                  </div>
                </div>
              )}

              {/* Specific Free Items Checklist */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <label className="text-slate-700 dark:text-slate-200 block text-[11px] font-black">
                  {language === "ar" ? "🎯 تحديد محاضرات وملخصات معينة لتكون مجانية للطلاب:" : "🎯 Pick Specific Free Lectures & Handouts:"}
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-[11px]">
                  {sections.map(sec => (
                    <div key={sec.id} className="space-y-1">
                      <div className="font-extrabold text-[#0D9488] text-[10px] uppercase">{sec.name}</div>
                      {sec.lectures.map((lec, lidx) => (
                        <label key={lidx} className="flex items-center gap-2 p-1 rounded hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(lec.isFree)}
                            onChange={() => handleToggleLectureFree(sec.id, lidx)}
                            className="accent-[#0D9488]"
                          />
                          <span className="truncate">🎥 {lec.title}</span>
                          {lec.isFree && <span className="text-[9px] text-emerald-600 font-bold ml-auto shrink-0">مجاني 🟢</span>}
                        </label>
                      ))}
                      {sec.handouts.map((h, hidx) => (
                        <label key={hidx} className="flex items-center gap-2 p-1 rounded hover:bg-white dark:hover:bg-zinc-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(h.isFree)}
                            onChange={() => handleToggleHandoutFree(sec.id, hidx)}
                            className="accent-[#0D9488]"
                          />
                          <span className="truncate">📄 {h.name}</span>
                          {h.isFree && <span className="text-[9px] text-emerald-600 font-bold ml-auto shrink-0">مجاني 🟢</span>}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md"
                >
                  {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paywall / Locked Lecture Subscription Modal for Students */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-amber-500/30 text-center space-y-4">


            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-black dark:text-white">
                {language === "ar" ? "محتوى مدفوع - اشترك للوصول الكامل" : "Premium Course Content"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {language === "ar"
                  ? `هذه المحاضرة (${paywallLectureTitle}) ضمن النسخة الكاملة للمساق. اشترك الآن بسعر ${coursePricing.price} لفتح كامل المحاضرات والملخصات الطبية وبنك الأسئلة التفاعلي مدى الحياة!`
                  : `This lecture (${paywallLectureTitle}) is part of the full course curriculum. Subscribe now for ${coursePricing.price} to unlock all lectures, notes, and QBanks!`}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowPaywallModal(false);
                  setUnlockModalOpen(true);
                }}
                className="w-full py-3 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {language === "ar" ? `الاشتراك وتفعيل الكورس الآن (${coursePricing.price})` : `Enroll & Activate Now (${coursePricing.price})`}
              </button>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                {language === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Note & Interactive Article Creator Modal */}
      {addRichNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <span>📝</span>
                <span>{language === "ar" ? "كتابة نوتس وملخص تفاعلي مع صور" : "Create Rich Interactive Note & Article"}</span>
              </h3>
              <button onClick={() => setAddRichNoteOpen(false)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRichNote} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                  {language === "ar" ? "عنوان النوتس / الموضوع الطبي:" : "Note / Topic Title:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Upper Limb Brachial Plexus Comprehensive Guide"
                  value={richNoteTitle}
                  onChange={(e) => setRichNoteTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-sm font-bold text-black dark:text-white outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                  {language === "ar" ? "محتوى الشرح والنوتس الطبية (حرية كاملة في الكتابة):" : "Rich Medical Explanation & Notes Content:"}
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder={language === "ar" ? "اكتب شرحك الطبي المفصل هنا، النقاط الهامة، الجداول، وملاحظات الامتحان..." : "Write your detailed medical explanations, bullet points, clinical pearls, and high-yield concepts here..."}
                  value={richNoteContent}
                  onChange={(e) => setRichNoteContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border rounded-xl text-xs font-medium text-black dark:text-white outline-none focus:border-[#0D9488] leading-relaxed"
                />
              </div>

              {/* Image Inclusion */}
              <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-500/20 space-y-3">
                <h4 className="text-[11px] font-black text-[#0D9488] flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>{language === "ar" ? "إرفاق صورة طبية أو رسمة توضيحية داخل النوتس" : "Embed Medical Diagram / Illustration"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">رابط الصورة (URL أو مسار):</label>
                    <input
                      type="text"
                      placeholder="مثال: /images/bone_marrow_histology_precise.jpg أو https://..."
                      value={richNoteImageUrl}
                      onChange={(e) => setRichNoteImageUrl(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">عنوان الصورة التوضيحي:</label>
                    <input
                      type="text"
                      placeholder="مثال: High-Yield Anatomical Relations Diagram"
                      value={richNoteImageCaption}
                      onChange={(e) => setRichNoteImageCaption(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddRichNoteOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white rounded-xl font-black shadow-md transition-all cursor-pointer"
                >
                  {language === "ar" ? "حفظ ونشر النوتس التفاعلية" : "Publish Interactive Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive AMBOSS-Style Rich Note Article Reader Modal */}
      {activeReadingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md select-none animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-[#151515] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 max-h-[90vh] overflow-y-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0D9488] bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-md border border-teal-500/20">
                  Interactive Clinical Note
                </span>
                <h2 className="text-xl md:text-2xl font-black text-black dark:text-white pt-1">
                  {activeReadingNote.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveReadingNote(null)}
                className="p-2 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Medical Image if present */}
            {activeReadingNote.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-teal-500/30 bg-slate-50 dark:bg-zinc-900 shadow-md">
                <img
                  src={activeReadingNote.imageUrl}
                  alt={activeReadingNote.imageCaption || activeReadingNote.name}
                  className="w-full max-h-96 object-contain bg-slate-900 mx-auto"
                />
                {activeReadingNote.imageCaption && (
                  <p className="p-3 text-center text-xs font-bold text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-zinc-800">
                    🔬 {activeReadingNote.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Note Content */}
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {activeReadingNote.content}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setActiveReadingNote(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer"
              >
                {language === "ar" ? "إغلاق المقال" : "Close Article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Unified Delete ConfirmModal */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen || Boolean(sectionToDelete)}
        title={deleteConfirmState.title || (language === "ar" ? "تأكيد حذف القسم" : "Delete Section")}
        message={deleteConfirmState.message || (language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا القسم وجميع محاضراته وملفاته نهائياً؟" : "Are you sure you want to delete this section?")}
        confirmText={language === "ar" ? "نعم، حذف نهائي" : "Yes, Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        isDestructive={true}
        onConfirm={() => {
          if (deleteConfirmState.isOpen) {
            if (deleteConfirmState.type === "section" && deleteConfirmState.sectionId) {
              setSections(prev => prev.filter(sec => sec.id !== deleteConfirmState.sectionId));
            } else if (deleteConfirmState.type === "lecture" && deleteConfirmState.sectionId && deleteConfirmState.index !== undefined) {
              handleDeleteLecture(deleteConfirmState.sectionId, deleteConfirmState.index);
            } else if (deleteConfirmState.type === "handout" && deleteConfirmState.sectionId && deleteConfirmState.index !== undefined) {
              handleDeleteHandout(deleteConfirmState.sectionId, deleteConfirmState.index);
            } else if (deleteConfirmState.type === "flashcard" && deleteConfirmState.sectionId && deleteConfirmState.index !== undefined) {
              handleDeleteFlashcard(deleteConfirmState.sectionId, deleteConfirmState.index);
            } else if (deleteConfirmState.type === "block" && deleteConfirmState.targetId !== undefined) {
              handleDeleteBlock(deleteConfirmState.targetId);
            } else if (deleteConfirmState.type === "question" && deleteConfirmState.targetId) {
              handleDeleteQuestionFromBlock(deleteConfirmState.targetId);
            }
            setDeleteConfirmState({ isOpen: false, type: "lecture", title: "", message: "" });
          } else if (sectionToDelete) {
            confirmDeleteSectionAction();
          }
        }}
        onCancel={() => {
          setDeleteConfirmState({ isOpen: false, type: "lecture", title: "", message: "" });
          setSectionToDelete(null);
        }}
      />
    </div>
  );
}
