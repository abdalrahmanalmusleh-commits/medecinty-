"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical } from "lucide-react";
import CourseAnalyticsModal, { getRealCourseSubscribers } from "@/components/CourseAnalyticsModal";
import { 
  Settings, 
  Sun, 
  Moon, 
  User, 
  Lock, 
  CreditCard, 
  Check, 
  ArrowLeft, 
  Save, 
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  BarChart2,
  Search
} from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import { useLanguage } from "@/components/LanguageContext";
import { getLivePlatformData, saveLivePlatformData } from "@/lib/supabase";
import { subjectData } from "@/data/subjectData";

type SettingsTab = "theme" | "account" | "statistics" | "admin";

function getLetterGrade(score: number): string {
  if (score >= 95) return "A";
  if (score >= 90) return "A-";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "B-";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  if (score >= 60) return "C-";
  if (score >= 55) return "D+";
  if (score >= 50) return "D";
  return "F";
}

export const getAllPlatformCourses = (baseSubjects: any[] = []) => {
  if (typeof window === "undefined") return [];

  const activeModules: any[] = [];

  const loadCategory = (key: string, categoryName: string) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((mod: any) => {
            if (mod.status !== "hidden" && !activeModules.some((m: any) => m.id === mod.id)) {
              activeModules.push({
                id: mod.id,
                name: mod.name,
                category: mod.category || categoryName,
                handouts: []
              });
            }
          });
        }
      } catch (e) {}
    }
  };

  loadCategory("medicinety_general_principles_modules", "General Principles");
  loadCategory("medicinety_systems_modules", "Organ Systems");
  loadCategory("medicinety_clinical_modules", "Clinical Knowledge");

  // Include any course for which student has an exam grade saved
  const userEmail = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
  const gradesStr = localStorage.getItem(`medicinety_exam_grades_${userEmail}`);
  if (gradesStr) {
    try {
      const gradesObj = JSON.parse(gradesStr);
      Object.keys(gradesObj).forEach((subId) => {
        if (!activeModules.some((m: any) => m.id === subId)) {
          const matchedBase = baseSubjects.find((b: any) => b.id === subId);
          activeModules.push({
            id: subId,
            name: matchedBase ? matchedBase.name : subId,
            category: matchedBase ? matchedBase.category : "Custom Course",
            handouts: []
          });
        }
      });
    } catch (e) {}
  }

  return activeModules;
};

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        localStorage.setItem("medicinety_user_avatar", base64);
        setUserAvatarUrl(base64);
        window.dispatchEvent(new Event("medicinety_auth_change"));
      }
    };
    reader.readAsDataURL(file);
  };

  const [adminCardAnalyticsOpen, setAdminCardAnalyticsOpen] = useState(false);
  const [adminCardSelectedCourse, setAdminCardSelectedCourse] = useState<{ id: string; name: string } | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>("theme");
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  
  // Code Generator States
  const [activationCodes, setActivationCodes] = useState<any[]>([]);
  const [genSubjectId, setGenSubjectId] = useState("all");
  const [genPriceTier, setGenPriceTier] = useState<"semester" | "yearly" | "lifetime" | "other">("semester");
  const [genPrice, setGenPrice] = useState("40");
  const [genQty, setGenQty] = useState(5);
  const [codeFilter, setCodeFilter] = useState<"all" | "unused" | "used">("all");

  // Custom Duration States for "other" tier
  const [customDays, setCustomDays] = useState(0);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);

  // Custom Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  // Price modifier states
  const [priceModSubjectId, setPriceModSubjectId] = useState("");
  const [priceModCustomSubjectId, setPriceModCustomSubjectId] = useState("");
  
  // Renewal requests states
  const [renewalRequests, setRenewalRequests] = useState<any[]>([]);
  const [renewalDialog, setRenewalDialog] = useState<{
    isOpen: boolean;
    requestId: string;
    studentEmail: string;
    subjectId: string;
    subjectName: string;
    selectedTier: "semester" | "yearly" | "lifetime" | "other";
    customVal: number;
    customUnit: "seconds" | "minutes" | "hours" | "days";
  }>({
    isOpen: false,
    requestId: "",
    studentEmail: "",
    subjectId: "",
    subjectName: "",
    selectedTier: "semester",
    customVal: 10,
    customUnit: "minutes"
  });

  // Account inspector states
  const [inspectorEmail, setInspectorEmail] = useState("");
  const [inspectedUser, setInspectedUser] = useState<any | null>(null);
  const [inspectedSubs, setInspectedSubs] = useState<any[]>([]);
  const [inspectedGrades, setInspectedGrades] = useState<any[]>([]);
  const [inspectorError, setInspectorError] = useState("");

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: ""
  });

  const triggerAlert = (title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message
    });
  };

  const [priceModSemester, setPriceModSemester] = useState("40");
  const [priceModYearly, setPriceModYearly] = useState("65");
  const [priceModLifetime, setPriceModLifetime] = useState("129");
  const [priceModHasOther, setPriceModHasOther] = useState(false);
  const [priceModOther, setPriceModOther] = useState("10");
  const [priceModOtherValue, setPriceModOtherValue] = useState(0);
  const [priceModOtherUnit, setPriceModOtherUnit] = useState("minutes");
  const [priceModOtherDays, setPriceModOtherDays] = useState(0);
  const [priceModOtherHours, setPriceModOtherHours] = useState(0);
  const [priceModOtherMinutes, setPriceModOtherMinutes] = useState(0);
  const [priceModOtherSeconds, setPriceModOtherSeconds] = useState(0);
  
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");

  // Theme state
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const handleThemeChange = (mode: "light" | "dark") => {
    setThemeMode(mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  
  // Account Information states
  const [fullName, setFullName] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const [email, setEmail] = useState("alex@medicinety.com");
  const [studentId, setStudentId] = useState("");
  const [university, setUniversity] = useState("Hashemite University");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [showAccountSuccess, setShowAccountSuccess] = useState(false);

  // Admin Profile settings states
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminEmail, setAdminEmail] = useState("admin@medicinety.com");
  const [adminOldPassword, setAdminOldPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [showAdminSuccess, setShowAdminSuccess] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Shared Platform Settings
  const [platformTitleAr, setPlatformTitleAr] = useState("ميدسنتي");
  const [platformTitleEn, setPlatformTitleEn] = useState("Medicinety");
  const [platformDescAr, setPlatformDescAr] = useState("منصة ميدسنتي لعلوم الطب البشري والتعليم الطبي المستمر");
  const [platformDescEn, setPlatformDescEn] = useState("Medicinety Platform for Medical Sciences and Continuous Learning");
  const [supportEmail, setSupportEmail] = useState("support@medicinety.com");
  const [suggestionsEmail, setSuggestionsEmail] = useState("suggestions@medicinety.com");
  const [sloganAr, setSloganAr] = useState("وجهتك الأولى للتميز الطبي الأكاديمي");
  const [sloganEn, setSloganEn] = useState("Your Premier Destination for Medical Academic Excellence");

  // Dynamic Admins states
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [deletedSubscriptions, setDeletedSubscriptions] = useState<any[]>([]);

  // Billing states
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load settings states from localStorage on mount and when language changes
  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    let sId = localStorage.getItem("medicinety_student_id");
    if (!sId) {
      sId = `ST-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem("medicinety_student_id", sId);
    }
    setStudentId(sId);

    // Load logged in email
    const loggedUser = localStorage.getItem("medicinety_logged_in_user");
    if (loggedUser) {
      setEmail(loggedUser);
    }

    // Load student profile details & avatar
    const customDisplayName = localStorage.getItem("medicinety_user_display_name");
    const loggedUserEmail = localStorage.getItem("medicinety_logged_in_user");
    const customAvatar = localStorage.getItem("medicinety_user_avatar");
    const profileSaved = localStorage.getItem("medicinety_student_profile");

    let computedName = "";
    if (profileSaved) {
      try {
        const profile = JSON.parse(profileSaved);
        if (profile.firstName) {
          computedName = `${profile.firstName} ${profile.lastName || ""}`.trim();
        }
        if (profile.university) setUniversity(profile.university);
        if (profile.specialization) setSpecialization(profile.specialization);
      } catch (e) {}
    }

    if (!computedName && customDisplayName) {
      computedName = customDisplayName;
    }

    if (!computedName && loggedUserEmail) {
      const raw = loggedUserEmail.split("@")[0].replace(/[._-]/g, " ");
      computedName = raw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    const finalName = computedName || (role === "admin" ? "Admin User" : "Doctor Member");
    setFullName(finalName);

    if (customAvatar) {
      setUserAvatarUrl(customAvatar);
    } else {
      setUserAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=0D9488&color=ffffff&bold=true`);
    }

    // Load enrolled courses count per user
    const userEmailKey = localStorage.getItem("medicinety_logged_in_user") || "anonymous";
    const unlocked = localStorage.getItem(`medicinety_unlocked_courses_${userEmailKey}`);
    if (unlocked) {
      try {
        const list = JSON.parse(unlocked);
        setEnrolledCount(list.length);
      } catch (e) {}
    }

    const defaultTitle = language === "ar" ? "الإعدادات" : "Settings";
    const defaultDesc = language === "ar" 
      ? "إدارة تفضيلات مساحة العمل والملفات الأمنية ومعلومات الاشتراك." 
      : "Manage your workspace preference, security profiles and subscription info.";

    setSettingsTitle(defaultTitle);
    setSettingsDesc(defaultDesc);

    const saved = localStorage.getItem("medicinety_settings_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const titleKey = `settingsTitle_${language}`;
        const descKey = `settingsDesc_${language}`;
        if (data[titleKey] !== undefined) setSettingsTitle(data[titleKey]);
        else if (data.settingsTitle && language === "en") setSettingsTitle(data.settingsTitle);

        if (data[descKey] !== undefined) setSettingsDesc(data[descKey]);
        else if (data.settingsDesc && language === "en") setSettingsDesc(data.settingsDesc);

        if (data.fullName !== undefined) setFullName(data.fullName);
        if (data.email !== undefined) setEmail(data.email);
        if (data.adminUsername !== undefined) setAdminUsername(data.adminUsername);
        if (data.adminEmail !== undefined) setAdminEmail(data.adminEmail);
        if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
      } catch (e) {
        console.error("Failed to load settings state", e);
      }
    }

    // Load custom platform settings
    const savedPlatformSettings = localStorage.getItem("medicinety_platform_settings");
    if (savedPlatformSettings) {
      try {
        const ps = JSON.parse(savedPlatformSettings);
        if (ps.platformTitleAr) setPlatformTitleAr(ps.platformTitleAr);
        if (ps.platformTitleEn) setPlatformTitleEn(ps.platformTitleEn);
        if (ps.platformDescAr) setPlatformDescAr(ps.platformDescAr);
        if (ps.platformDescEn) setPlatformDescEn(ps.platformDescEn);
        if (ps.supportEmail) setSupportEmail(ps.supportEmail);
        if (ps.suggestionsEmail) setSuggestionsEmail(ps.suggestionsEmail);
        if (ps.sloganAr) setSloganAr(ps.sloganAr);
        if (ps.sloganEn) setSloganEn(ps.sloganEn);
      } catch (e) {}
    }

    // Load custom admins list
    const defaultAdmins = ["admin@medicinety.com", "medicintyplatform@gmail.com", "medicinetyplatform@gmail.com"];
    const savedAdmins = localStorage.getItem("medicinety_platform_admins");
    let currentAdmins = defaultAdmins;
    if (!savedAdmins) {
      localStorage.setItem("medicinety_platform_admins", JSON.stringify(defaultAdmins));
      setAdminsList(defaultAdmins);
    } else {
      try {
        currentAdmins = JSON.parse(savedAdmins);
        setAdminsList(currentAdmins);
      } catch (e) {
        setAdminsList(defaultAdmins);
      }
    }

    // Recheck dynamic isAdmin
    const currentEmail = localStorage.getItem("medicinety_logged_in_user") || "";
    setIsAdmin(currentAdmins.includes(currentEmail.trim().toLowerCase()));

    // Load registered users list
    const savedUsers = localStorage.getItem("medicinety_registered_users");
    if (savedUsers) {
      try {
        setRegisteredUsers(JSON.parse(savedUsers));
      } catch (e) {}
    } else {
      const mockUsers = [
        { email: "student1@medicinety.com", firstName: "Ahmad", lastName: "Al-Masri", university: "Jordan University of Science and Technology", specialization: "General Medicine", role: "student", registeredAt: "2026-06-28T10:00:00Z" },
        { email: "student2@medicinety.com", firstName: "Lina", lastName: "Haddad", university: "University of Jordan", specialization: "Dentistry", role: "student", registeredAt: "2026-06-29T14:30:00Z" },
        { email: "admin@medicinety.com", firstName: "Medicinety", lastName: "Admin", university: "Hashemite University", specialization: "General Medicine", role: "admin", registeredAt: "2026-06-25T08:00:00Z" }
      ];
      localStorage.setItem("medicinety_registered_users", JSON.stringify(mockUsers));
      setRegisteredUsers(mockUsers);
    }

    // Load activation codes list
    const savedCodes = localStorage.getItem("medicinety_activation_codes");
    if (savedCodes) {
      try {
        setActivationCodes(JSON.parse(savedCodes));
      } catch (e) {}
    } else {
      const mockCodes = [
        { code: "MED-FREE-100", subjectId: "all", priceTier: "lifetime", price: 129, status: "unused", usedBy: null, usedAt: null },
        { code: "ANAT-SEMESTER-40", subjectId: "anatomy", priceTier: "semester", price: 40, status: "unused", usedBy: null, usedAt: null },
        { code: "PHYS-YEARLY-60", subjectId: "physiology", priceTier: "yearly", price: 60, status: "used", usedBy: "student1@medicinety.com", usedAt: "2026-06-30T10:00:00Z" }
      ];
      localStorage.setItem("medicinety_activation_codes", JSON.stringify(mockCodes));
      setActivationCodes(mockCodes);
    }

    // Load renewal requests
    const savedRenewalRequests = localStorage.getItem("medicinety_renewal_requests");
    if (savedRenewalRequests) {
      try {
        setRenewalRequests(JSON.parse(savedRenewalRequests));
      } catch(e){}
    }

    // Load deleted subscriptions
    const savedDeletedSubs = localStorage.getItem("medicinety_deleted_subscriptions");
    if (savedDeletedSubs) {
      try {
        setDeletedSubscriptions(JSON.parse(savedDeletedSubs));
      } catch(e){}
    }
  }, [language]);

  const handleSettingsFieldChange = (key: string, value: any) => {
    try {
      const saved = localStorage.getItem("medicinety_settings_state");
      const data = saved ? JSON.parse(saved) : {};
      
      if (typeof value === "string") {
        const langKey = `${key}_${language}`;
        data[langKey] = value;
        if (language === "en") {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
      
      saveLivePlatformData("medicinety_settings_state", data);
    } catch (e) {
      console.error("Failed to save settings field", e);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    setTimeout(() => {
      setIsSavingAccount(false);
      setShowAccountSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowAccountSuccess(false), 2000);
    }, 1200);
  };

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdmin(true);
    handleSettingsFieldChange("adminUsername", adminUsername);
    handleSettingsFieldChange("adminEmail", adminEmail);
    handleSettingsFieldChange("maintenanceMode", maintenanceMode);
    
    // Save platform settings directly to Supabase Live Database
    const ps = {
      platformTitleAr,
      platformTitleEn,
      platformDescAr,
      platformDescEn,
      supportEmail,
      suggestionsEmail,
      sloganAr,
      sloganEn
    };
    saveLivePlatformData("medicinety_platform_settings", ps);
    
    // Dispatch event to update other components dynamically
    window.dispatchEvent(new Event("medicinety_platform_settings_change"));

    setTimeout(() => {
      setIsSavingAdmin(false);
      setShowAdminSuccess(true);
      setAdminOldPassword("");
      setAdminNewPassword("");
      setTimeout(() => setShowAdminSuccess(false), 2550);
    }, 1200);
  };

  const handleAddAdmin = () => {
    const emailClean = newAdminEmail.trim().toLowerCase();
    if (!emailClean) return;
    if (adminsList.includes(emailClean)) return;
    
    triggerConfirm(
      language === "ar" ? "إضافة مسؤول جديد" : "Add New Admin",
      language === "ar" 
        ? `هل أنت متأكد من رغبتك في منح صلاحيات المسؤول كاملة للحساب: ${emailClean}؟`
        : `Are you sure you want to grant full admin privileges to: ${emailClean}?`,
      () => {
        const updated = [...adminsList, emailClean];
        setAdminsList(updated);
        localStorage.setItem("medicinety_platform_admins", JSON.stringify(updated));
        setNewAdminEmail("");
        window.dispatchEvent(new Event("medicinety_auth_change"));
      }
    );
  };

  const handleDeleteAdmin = (emailToDelete: string) => {
    if (emailToDelete === "admin@medicinety.com") {
      triggerAlert(language === "ar" ? "تنبيه" : "Alert", language === "ar" ? "لا يمكن حذف البريد الرئيسي للنظام" : "Cannot delete main system admin");
      return;
    }
    if (emailToDelete === email) {
      triggerAlert(language === "ar" ? "تنبيه" : "Alert", language === "ar" ? "لا يمكنك حذف نفسك من قائمة المدراء" : "Cannot delete your own admin account");
      return;
    }
    
    triggerConfirm(
      language === "ar" ? "حذف مسؤول" : "Delete Admin",
      language === "ar" 
        ? `هل أنت متأكد من رغبتك في سحب صلاحيات المسؤول من الحساب: ${emailToDelete}؟`
        : `Are you sure you want to revoke admin privileges from: ${emailToDelete}?`,
      () => {
        const updated = adminsList.filter(e => e !== emailToDelete);
        setAdminsList(updated);
        localStorage.setItem("medicinety_platform_admins", JSON.stringify(updated));
        window.dispatchEvent(new Event("medicinety_auth_change"));
      }
    );
  };

  const getSubjectStats = (subId: string, defaultHandouts: any[]) => {
    const clicks = parseInt(localStorage.getItem(`medicinety_clicks_${subId}`) || "0", 10);
    const seconds = parseInt(localStorage.getItem(`medicinety_watchtime_${subId}`) || "0", 10);
    const watchMinutes = Math.round(seconds / 60);
    
    let handouts = defaultHandouts || [];
    const savedSectionsRaw = localStorage.getItem(`medicinety_subject_${subId}_sections`);
    if (savedSectionsRaw) {
      try {
        const sections = JSON.parse(savedSectionsRaw);
        handouts = sections.flatMap((s: any) => s.handouts || []);
      } catch (e) {}
    }
    
    const handoutDownloads = handouts.map((h: any) => {
      const downloads = parseInt(localStorage.getItem(`medicinety_downloads_${subId}_${h.name}`) || "0", 10);
      return { name: h.name, downloads };
    });
    
    const totalDownloads = handoutDownloads.reduce((sum: number, h: any) => sum + h.downloads, 0);
    return { clicks, watchMinutes, handoutDownloads, totalDownloads };
  };

  const updateGeneratorDefaults = (subjectId: string, tier: string) => {
    if (subjectId === "all") {
      if (tier === "semester") setGenPrice("40");
      else if (tier === "yearly") setGenPrice("60");
      else if (tier === "lifetime") setGenPrice("129");
      return;
    }
    const gpRaw = localStorage.getItem("medicinety_general_principles_modules");
    const sysRaw = localStorage.getItem("medicinety_systems_modules");
    let foundModule: any = null;
    if (gpRaw) {
      try { foundModule = JSON.parse(gpRaw).find((m: any) => m.id === subjectId); } catch(e){}
    }
    if (!foundModule && sysRaw) {
      try { foundModule = JSON.parse(sysRaw).find((m: any) => m.id === subjectId); } catch(e){}
    }
    if (foundModule) {
      if (tier === "semester") {
        setGenPrice(foundModule.priceSemester || "40");
      } else if (tier === "yearly") {
        setGenPrice(foundModule.priceYearly || "60");
      } else if (tier === "lifetime") {
        setGenPrice(foundModule.priceLifetime || "129");
      } else if (tier === "other") {
        setGenPrice(foundModule.priceOther || "10");
        const val = foundModule.customDurationValue !== undefined ? foundModule.customDurationValue : (foundModule.customDurationMinutes || 0);
        const unit = foundModule.customDurationUnit || "minutes";
        
        setCustomDays(unit === "days" ? val : 0);
        setCustomHours(unit === "hours" ? val : 0);
        setCustomMinutes(unit === "minutes" ? val : 0);
        setCustomSeconds(unit === "seconds" ? val : 0);
      }
    }
  };

  const handleGenerateCodes = () => {
    const qty = Math.max(1, Math.min(100, genQty));
    const newCodes: any[] = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    for (let i = 0; i < qty; i++) {
      let code = "";
      do {
        let randomPart = "";
        for (let j = 0; j < 12; j++) {
          randomPart += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        code = `MED${randomPart}`;
      } while (
        activationCodes.some((c: any) => c.code === code) || 
        newCodes.some((c: any) => c.code === code)
      );
      
      newCodes.push({
        code,
        subjectId: genSubjectId,
        priceTier: genPriceTier,
        price: parseFloat(genPrice) || 0,
        status: "generated", // 3 stages: generated -> sold -> used
        usedBy: null,
        usedAt: null,
        soldAt: null,
        customDuration: genPriceTier === "other" ? {
          days: customDays,
          hours: customHours,
          minutes: customMinutes,
          seconds: customSeconds
        } : null
      });
    }
    
    const updated = [...newCodes, ...activationCodes];
    setActivationCodes(updated);
    localStorage.setItem("medicinety_activation_codes", JSON.stringify(updated));
    triggerAlert(language === "ar" ? "توليد الأكواد" : "Code Generation", language === "ar" ? `تم توليد ${qty} كود تفعيل (15 حرف ورقم) بنجاح!` : `Generated ${qty} activation codes (exactly 15 chars) successfully!`);
  };

  const handleMarkAsSold = (codeText: string) => {
    const updated = activationCodes.map((c: any) => {
      if (c.code === codeText && c.status === "generated") {
        return { ...c, status: "sold", soldAt: new Date().toISOString() };
      }
      return c;
    });
    setActivationCodes(updated);
    localStorage.setItem("medicinety_activation_codes", JSON.stringify(updated));
  };

  const handleDeleteCode = (codeToDelete: string) => {
    const codeObj = activationCodes.find((c: any) => c.code === codeToDelete);
    if (!codeObj) return;

    const isUsed = codeObj.status === "used";
    const title = language === "ar" ? "حذف كود التفعيل" : "Delete Activation Code";
    
    let isExpired = false;
    if (isUsed && codeObj.usedBy) {
      const studentSubsKey = `medicinety_subscriptions_${codeObj.usedBy}`;
      const rawStudentSubs = localStorage.getItem(studentSubsKey);
      if (rawStudentSubs) {
        try {
          const studentSubs = JSON.parse(rawStudentSubs);
          const sub = studentSubs.find((s: any) => s.subjectId === codeObj.subjectId || codeObj.subjectId === "all");
          if (sub && sub.expiresAt && new Date() > new Date(sub.expiresAt)) {
            isExpired = true;
          }
        } catch(e){}
      } else {
        if (codeObj.expiresAt && new Date() > new Date(codeObj.expiresAt)) {
          isExpired = true;
        } else if (!codeObj.expiresAt && codeObj.usedAt) {
          const usedDate = new Date(codeObj.usedAt);
          if (codeObj.priceTier === "semester") {
            usedDate.setDate(usedDate.getDate() + 120);
          } else if (codeObj.priceTier === "yearly") {
            usedDate.setDate(usedDate.getDate() + 365);
          } else {
            usedDate.setDate(usedDate.getDate() + 120);
          }
          if (new Date() > usedDate && codeObj.priceTier !== "lifetime") {
            isExpired = true;
          }
        }
      }
    }

    const msg = isUsed 
      ? (language === "ar" 
          ? `تنبيه: هذا الكود مستخدم بالفعل ومفعّل لمشترك (${codeObj.usedBy}). هل أنت متأكد من رغبتك في حذفه وإلغاء صلاحية الطالب؟`
          : `Warning: This code is already redeemed and active for a user (${codeObj.usedBy}). Are you sure you want to delete it and revoke access?`)
      : (language === "ar" 
          ? "هل أنت متأكد من رغبتك في حذف هذا الكود؟" 
          : "Are you sure you want to delete this activation code?");

    triggerConfirm(
      title,
      msg,
      () => {
        if (isUsed && !isExpired) {
          const rawDel = localStorage.getItem("medicinety_deleted_subscriptions");
          const delList = rawDel ? JSON.parse(rawDel) : [];
          delList.push({
            code: codeObj.code,
            user: codeObj.usedBy,
            subjectId: codeObj.subjectId,
            price: codeObj.price || 40,
            priceTier: codeObj.priceTier || "semester",
            activatedAt: codeObj.usedAt || new Date().toISOString(),
            expiresAt: codeObj.expiresAt,
            deletedAt: new Date().toISOString()
          });
          localStorage.setItem("medicinety_deleted_subscriptions", JSON.stringify(delList));
          setDeletedSubscriptions(delList);
        }

        if (isUsed && codeObj.usedBy) {
          const studentEmail = codeObj.usedBy;
          const subjectId = codeObj.subjectId;
          
          const unlockKey = `medicinety_unlocked_courses_${studentEmail}`;
          const rawUnlocked = localStorage.getItem(unlockKey);
          if (rawUnlocked) {
            try {
              const list = JSON.parse(rawUnlocked);
              const updated = list.filter((id: string) => id !== subjectId);
              localStorage.setItem(unlockKey, JSON.stringify(updated));
            } catch(e){}
          }
          
          const subsKey = `medicinety_subscriptions_${studentEmail}`;
          const rawSubs = localStorage.getItem(subsKey);
          if (rawSubs) {
            try {
              const list = JSON.parse(rawSubs);
              const updated = list.filter((s: any) => s.subjectId !== subjectId);
              localStorage.setItem(subsKey, JSON.stringify(updated));
            } catch(e){}
          }
        }

        const updated = activationCodes.filter((c: any) => c.code !== codeToDelete);
        setActivationCodes(updated);
        localStorage.setItem("medicinety_activation_codes", JSON.stringify(updated));
      }
    );
  };

  const handleStandardPriceModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceModSubjectId) return;

    const gpRaw = localStorage.getItem("medicinety_general_principles_modules");
    if (gpRaw) {
      try {
        const gp = JSON.parse(gpRaw);
        const idx = gp.findIndex((m: any) => m.id === priceModSubjectId);
        if (idx !== -1) {
          gp[idx].priceSemester = priceModSemester;
          gp[idx].priceYearly = priceModYearly;
          gp[idx].priceLifetime = priceModLifetime;
          localStorage.setItem("medicinety_general_principles_modules", JSON.stringify(gp));
          triggerAlert(language === "ar" ? "تحديث الأسعار" : "Standard Prices", language === "ar" ? "تم تعديل الأسعار الأساسية للمساق بنجاح!" : "Subject standard prices modified successfully!");
          return;
        }
      } catch (e) {}
    }
    
    const sysRaw = localStorage.getItem("medicinety_systems_modules");
    if (sysRaw) {
      try {
        const sys = JSON.parse(sysRaw);
        const idx = sys.findIndex((m: any) => m.id === priceModSubjectId);
        if (idx !== -1) {
          sys[idx].priceSemester = priceModSemester;
          sys[idx].priceYearly = priceModYearly;
          sys[idx].priceLifetime = priceModLifetime;
          localStorage.setItem("medicinety_systems_modules", JSON.stringify(sys));
          triggerAlert(language === "ar" ? "تحديث الأسعار" : "Standard Prices", language === "ar" ? "تم تعديل الأسعار الأساسية للمساق بنجاح!" : "Subject standard prices modified successfully!");
          return;
        }
      } catch (e) {}
    }
    
    triggerAlert(language === "ar" ? "خطأ" : "Error", language === "ar" ? "تعذر العثور على المساق المحدد لتعديل أسعاره." : "Could not locate the selected subject to modify its prices.");
  };

  const handleCustomPriceModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceModCustomSubjectId) return;

    let computedMinutes = priceModOtherValue;
    if (priceModOtherUnit === "seconds") computedMinutes = Math.round(priceModOtherValue / 60);
    else if (priceModOtherUnit === "hours") computedMinutes = priceModOtherValue * 60;
    else if (priceModOtherUnit === "days") computedMinutes = priceModOtherValue * 24 * 60;

    const gpRaw = localStorage.getItem("medicinety_general_principles_modules");
    if (gpRaw) {
      try {
        const gp = JSON.parse(gpRaw);
        const idx = gp.findIndex((m: any) => m.id === priceModCustomSubjectId);
        if (idx !== -1) {
          gp[idx].priceOther = priceModOther;
          gp[idx].customDurationValue = priceModOtherValue;
          gp[idx].customDurationUnit = priceModOtherUnit;
          gp[idx].customDurationMinutes = computedMinutes;
          localStorage.setItem("medicinety_general_principles_modules", JSON.stringify(gp));
          triggerAlert(language === "ar" ? "تحديث الأسعار المخصصة" : "Custom Prices", language === "ar" ? "تم تعديل الأسعار المخصصة للمساق بنجاح!" : "Subject custom prices modified successfully!");
          return;
        }
      } catch (e) {}
    }
    
    const sysRaw = localStorage.getItem("medicinety_systems_modules");
    if (sysRaw) {
      try {
        const sys = JSON.parse(sysRaw);
        const idx = sys.findIndex((m: any) => m.id === priceModCustomSubjectId);
        if (idx !== -1) {
          sys[idx].priceOther = priceModOther;
          sys[idx].customDurationValue = priceModOtherValue;
          sys[idx].customDurationUnit = priceModOtherUnit;
          sys[idx].customDurationMinutes = computedMinutes;
          localStorage.setItem("medicinety_systems_modules", JSON.stringify(sys));
          triggerAlert(language === "ar" ? "تحديث الأسعار المخصصة" : "Custom Prices", language === "ar" ? "تم تعديل الأسعار المخصصة للمساق بنجاح!" : "Subject custom prices modified successfully!");
          return;
        }
      } catch (e) {}
    }
    
    triggerAlert(language === "ar" ? "خطأ" : "Error", language === "ar" ? "تعذر العثور على المساق المحدد لتعديل السعر المخصص." : "Could not locate the selected subject to modify its custom pricing.");
  };

  const handleAdminApproveRenewal = () => {
    const { requestId, studentEmail, subjectId, selectedTier, customVal, customUnit } = renewalDialog;
    if (!requestId) return;

    // 1. Calculate new expiration date
    let expiresAt: string | null = null;
    const expiryDateObj = new Date();
    if (selectedTier === "semester") {
      expiryDateObj.setDate(expiryDateObj.getDate() + 120);
      expiresAt = expiryDateObj.toISOString();
    } else if (selectedTier === "yearly") {
      expiryDateObj.setDate(expiryDateObj.getDate() + 365);
      expiresAt = expiryDateObj.toISOString();
    } else if (selectedTier === "lifetime") {
      expiresAt = null; // Lifetime/No expiry
    } else if (selectedTier === "other") {
      let computedSeconds = 0;
      if (customUnit === "seconds") computedSeconds = customVal;
      else if (customUnit === "minutes") computedSeconds = customVal * 60;
      else if (customUnit === "hours") computedSeconds = customVal * 3600;
      else if (customUnit === "days") computedSeconds = customVal * 24 * 3600;

      expiryDateObj.setSeconds(expiryDateObj.getSeconds() + computedSeconds);
      expiresAt = expiryDateObj.toISOString();
    }

    // 2. Update Student's Subscription
    const subsKey = `medicinety_subscriptions_${studentEmail}`;
    const rawSubs = localStorage.getItem(subsKey);
    const subsList = rawSubs ? JSON.parse(rawSubs) : [];
    
    const subIdx = subsList.findIndex((s: any) => s.subjectId === subjectId);
    const subItem = {
      subjectId,
      activatedAt: new Date().toISOString(),
      expiresAt
    };
    if (subIdx !== -1) {
      subsList[subIdx] = subItem;
    } else {
      subsList.push(subItem);
    }
    localStorage.setItem(subsKey, JSON.stringify(subsList));

    // Make sure it is in unlocked courses list
    const unlockKey = `medicinety_unlocked_courses_${studentEmail}`;
    const rawUnlocked = localStorage.getItem(unlockKey);
    const unlockedList = rawUnlocked ? JSON.parse(rawUnlocked) : [];
    if (!unlockedList.includes(subjectId)) {
      unlockedList.push(subjectId);
      localStorage.setItem(unlockKey, JSON.stringify(unlockedList));
    }

    // 3. Find activation code and update its expiresAt & priceTier
    const rawCodes = localStorage.getItem("medicinety_activation_codes");
    if (rawCodes) {
      try {
        const codesList = JSON.parse(rawCodes);
        const codeIdx = codesList.findIndex((c: any) => c.status === "used" && c.usedBy === studentEmail && (c.subjectId === subjectId || c.subjectId === "all"));
        if (codeIdx !== -1) {
          codesList[codeIdx].expiresAt = expiresAt;
          codesList[codeIdx].priceTier = selectedTier === "other" ? "custom" : selectedTier;
          localStorage.setItem("medicinety_activation_codes", JSON.stringify(codesList));
          setActivationCodes(codesList);
        }
      } catch(e){}
    }

    // 4. Remove the renewal request
    const rawReqs = localStorage.getItem("medicinety_renewal_requests");
    if (rawReqs) {
      try {
        const reqs = JSON.parse(rawReqs);
        const updatedReqs = reqs.filter((r: any) => r.id !== requestId);
        localStorage.setItem("medicinety_renewal_requests", JSON.stringify(updatedReqs));
        setRenewalRequests(updatedReqs);
      } catch(e){}
    }

    // Reset student expired notified key so they don't get prompt about old expiry
    const notifiedKey = `medicinety_expired_notified_${studentEmail}`;
    const rawNotified = localStorage.getItem(notifiedKey);
    if (rawNotified) {
      try {
        const notifiedList = JSON.parse(rawNotified);
        const updatedNotified = notifiedList.filter((id: string) => id !== subjectId);
        localStorage.setItem(notifiedKey, JSON.stringify(updatedNotified));
      } catch(e){}
    }

    setRenewalDialog({ ...renewalDialog, isOpen: false });
    triggerAlert(language === "ar" ? "تجديد الاشتراك" : "Subscription Renewed", language === "ar" ? "تم تجديد اشتراك الطالب بنجاح وتحديث صلاحية المساق!" : "Student subscription renewed and subject access extended successfully!");
  };

  const handleInspectUser = (e: React.FormEvent) => {
    e.preventDefault();
    setInspectorError("");
    setInspectedUser(null);
    setInspectedSubs([]);
    setInspectedGrades([]);

    const searchEmail = inspectorEmail.trim().toLowerCase();
    if (!searchEmail) return;

    const userFound = registeredUsers.find((u: any) => u.email.toLowerCase() === searchEmail);
    if (!userFound) {
      setInspectorError(language === "ar" ? "تعذر العثور على أي حساب مسجل بهذا البريد الإلكتروني." : "No registered user found with this email.");
      return;
    }

    setInspectedUser(userFound);

    const subsKey = `medicinety_subscriptions_${userFound.email}`;
    const rawSubs = localStorage.getItem(subsKey);
    const subsList = rawSubs ? JSON.parse(rawSubs) : [];
    setInspectedSubs(subsList);

    const gradesKey = `medicinety_exam_grades_${userFound.email}`;
    const rawGrades = localStorage.getItem(gradesKey);
    const gradesList = rawGrades ? JSON.parse(rawGrades) : [];
    setInspectedGrades(gradesList);
  };

  const isCodeExpired = (c: any) => {
    if (c.status !== "used") return false;
    if (!c.usedBy) return false;
    
    const studentSubsKey = `medicinety_subscriptions_${c.usedBy}`;
    const rawStudentSubs = typeof window !== "undefined" ? localStorage.getItem(studentSubsKey) : null;
    if (rawStudentSubs) {
      try {
        const studentSubs = JSON.parse(rawStudentSubs);
        const sub = studentSubs.find((s: any) => s.subjectId === c.subjectId || c.subjectId === "all");
        if (sub) {
          if (sub.expiresAt && new Date() > new Date(sub.expiresAt)) {
            return true;
          }
          return false;
        } else {
          return true; // Deleted from student's account
        }
      } catch(e){}
    }
    
    if (c.expiresAt && new Date() > new Date(c.expiresAt)) {
      return true;
    }
    if (!c.expiresAt && c.usedAt) {
      const usedDate = new Date(c.usedAt);
      if (c.priceTier === "semester") {
        usedDate.setDate(usedDate.getDate() + 120);
      } else if (c.priceTier === "yearly") {
        usedDate.setDate(usedDate.getDate() + 365);
      } else {
        usedDate.setDate(usedDate.getDate() + 120);
      }
      if (new Date() > usedDate && c.priceTier !== "lifetime") {
        return true;
      }
    }
    return false;
  };

  // Load dynamic student stats
  const loggedUser = typeof window !== "undefined" ? localStorage.getItem("medicinety_logged_in_user") || "anonymous" : "anonymous";
  const userGradesKey = `medicinety_exam_grades_${loggedUser}`;
  const gradesRaw = typeof window !== "undefined" ? localStorage.getItem(userGradesKey) : null;
  const userGrades = gradesRaw ? JSON.parse(gradesRaw) : {};
  const examsCompletedCount = Object.keys(userGrades).length;

  let averageExamScore = 0;
  if (examsCompletedCount > 0) {
    const sum = Object.values(userGrades).reduce((acc: any, val: any) => acc + val, 0) as number;
    averageExamScore = Math.round(sum / examsCompletedCount);
  }

  const streakDays = examsCompletedCount > 0 ? 1 : 0;

  const hasUnlockedAtLeastOneCourse = enrolledCount > 0;
  const hasCompletedAtLeastOneExam = examsCompletedCount > 0;
  const hasCompletedAtLeastThreeExams = examsCompletedCount >= 3;

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-16 transition-colors duration-300">
      <div className="w-full px-4 pt-8 xl:max-w-[1440px] mx-auto">
        
        {/* Back Link */}
        

        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* Dynamic Borderless Header Section */}
        <section className="space-y-3 mb-8 group select-none">
          {isAdmin ? (
            <AutoResizeTextarea
              value={settingsTitle}
              onChange={(val) => {
                setSettingsTitle(val);
                handleSettingsFieldChange("settingsTitle", val);
              }}
              className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none bg-transparent border-none outline-none focus:ring-0 w-full pl-0 select-text cursor-text"
              placeholder=""
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none">
              {settingsTitle}
            </h1>
          )}
          {isAdmin ? (
            <AutoResizeTextarea
              value={settingsDesc}
              onChange={(val) => {
                setSettingsDesc(val);
                handleSettingsFieldChange("settingsDesc", val);
              }}
              className="text-sm md:text-base text-black dark:text-white font-normal leading-relaxed bg-transparent border-none outline-none focus:ring-0 w-full pl-0"
              placeholder=""
            />
          ) : (
            <p className="text-sm md:text-base text-black dark:text-white font-normal leading-relaxed">
              {settingsDesc}
            </p>
          )}
        </section>

        {/* Tabbed Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Menu Controls */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab("theme")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all
                ${activeTab === "theme" 
                  ? "bg-[#0D9488]/10 text-[#0D9488] border-l-4 border-[#0D9488]" 
                  : "bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 text-black dark:text-white hover:text-[#0D9488] dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
                }
              `}
            >
              <Sun className="w-4 h-4" />
              <span>{t("themeToggle")}</span>
            </button>

            <button 
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all
                ${activeTab === "account" 
                  ? "bg-[#0D9488]/10 text-[#0D9488] border-l-4 border-[#0D9488]" 
                  : "bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 text-black dark:text-white hover:text-[#0D9488] dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
                }
              `}
            >
              <User className="w-4 h-4" />
              <span>{t("accountDetails")}</span>
            </button>

            {!isAdmin && (
              <button 
                onClick={() => setActiveTab("statistics")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all
                  ${activeTab === "statistics" 
                    ? "bg-[#0D9488]/10 text-[#0D9488] border-l-4 border-[#0D9488]" 
                    : "bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 text-black dark:text-white hover:text-[#0D9488] dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
                  }
                `}
              >
                <BarChart2 className="w-4 h-4" />
                <span>{language === "ar" ? "الدرجات والإحصائيات" : "Grades & Statistics"}</span>
              </button>
            )}

            {isAdmin && (
              <button 
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all
                  ${activeTab === "admin" 
                    ? "bg-[#0D9488]/10 text-[#0D9488] border-l-4 border-[#0D9488]" 
                    : "bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 text-black dark:text-white hover:text-[#0D9488] dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
                  }
                `}
              >
                <Lock className="w-4 h-4" />
                <span>{language === "ar" ? "لوحة التحكم للمدير" : "Admin Panel"}</span>
              </button>
            )}
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 rounded-lg p-8 shadow-sm min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* Theme toggle screen */}
                {activeTab === "theme" && (
                  <motion.div
                    key="theme-settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">Appearance / Theme</h3>
                      <p className="text-xs font-medium text-slate-450 dark:text-slate-400 mt-1">Configure your workspace look and feel</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* Light mode selector */}
                      <div 
                        onClick={() => handleThemeChange("light")}
                        className={`p-6 rounded-lg border-2 flex flex-col justify-between h-40 cursor-pointer transition-all
                          ${themeMode === "light"
                            ? "border-[#0D9488] bg-[#0D9488]/5 text-black dark:text-white"
                            : "border-slate-200/50 dark:border-teal-500/20 hover:border-slate-300 dark:hover:border-teal-500/40 text-slate-500 dark:text-slate-400"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <Sun className={`w-8 h-8 ${themeMode === "light" ? "text-[#0D9488]" : "text-slate-400"}`} />
                          {themeMode === "light" && <div className="w-5 h-5 bg-[#0D9488] text-white flex items-center justify-center rounded-full text-xs font-bold">✓</div>}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-black dark:text-white">Light Theme</h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-1">Standard bright, high-contrast display</p>
                        </div>
                      </div>

                      {/* Dark mode selector */}
                      <div 
                        onClick={() => handleThemeChange("dark")}
                        className={`p-6 rounded-lg border-2 flex flex-col justify-between h-40 cursor-pointer transition-all
                          ${themeMode === "dark"
                            ? "border-[#0D9488] bg-[#0D9488]/5 text-black dark:text-white"
                            : "border-slate-200/50 dark:border-teal-500/20 hover:border-slate-300 dark:hover:border-teal-500/40 text-slate-500 dark:text-slate-400"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <Moon className={`w-8 h-8 ${themeMode === "dark" ? "text-teal-400" : "text-slate-400"}`} />
                          {themeMode === "dark" && <div className="w-5 h-5 bg-[#0D9488] text-white flex items-center justify-center rounded-full text-xs font-bold">✓</div>}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-black dark:text-white">Dark Theme</h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-1">Easier on the eyes in darker environments</p>
                        </div>
                      </div>
                    </div>

                    {/* Language Switcher */}
                    <div className="border-t border-slate-100 dark:border-teal-500/20 pt-6 mt-6">
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">{t("language")}</h3>
                        <p className="text-xs font-medium text-slate-450 dark:text-slate-400 mt-1">{t("selectLanguage")}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* English Card */}
                        <div 
                          onClick={() => setLanguage("en")}
                          className={`p-6 rounded-lg border-2 flex flex-col justify-between h-32 cursor-pointer transition-all
                            ${language === "en"
                              ? "border-[#0D9488] bg-[#0D9488]/5 text-black dark:text-white"
                              : "border-slate-200/50 dark:border-teal-500/20 hover:border-slate-300 dark:hover:border-teal-500/40 text-slate-500 dark:text-slate-400"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-2xl">🇺🇸</span>
                            {language === "en" && <div className="w-5 h-5 bg-[#0D9488] text-white flex items-center justify-center rounded-full text-xs font-bold">✓</div>}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-black dark:text-white">English</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Switch interface to English</p>
                          </div>
                        </div>

                        {/* Arabic Card */}
                        <div 
                          onClick={() => setLanguage("ar")}
                          className={`p-6 rounded-lg border-2 flex flex-col justify-between h-32 cursor-pointer transition-all
                            ${language === "ar"
                              ? "border-[#0D9488] bg-[#0D9488]/5 text-black dark:text-white"
                              : "border-slate-200/50 dark:border-teal-500/20 hover:border-slate-300 dark:hover:border-teal-500/40 text-slate-500 dark:text-slate-400"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-2xl">🇯🇴</span>
                            {language === "ar" && <div className="w-5 h-5 bg-[#0D9488] text-white flex items-center justify-center rounded-full text-xs font-bold">✓</div>}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-black dark:text-white">العربية</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">تحويل واجهة الموقع إلى اللغة العربية</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Details screen */}
                {activeTab === "account" && (
                  <motion.div
                    key="account-settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">
                        {isAdmin 
                          ? (language === "ar" ? "معلومات الحساب الإداري" : "Administrator Account Settings")
                          : (language === "ar" ? "معلومات الحساب الدراسي" : "Academic Profile Home")
                        }
                      </h3>
                      <p className="text-xs font-medium text-slate-450 dark:text-slate-400 mt-1">
                        {isAdmin
                          ? (language === "ar" ? "تفاصيل حساب مدير المنصة والخيارات الأمنية" : "Administrator profile settings and configuration controls")
                          : (language === "ar" ? "تفاصيل حالة الطالب والتحصيل الدراسي الإحصائي" : "Overview of student status, university details, and platform statistics")
                        }
                      </p>
                    </div>

                    {/* Premium Profile Banner Card with Custom Avatar Uploader */}
                    <div className="p-6 bg-gradient-to-br from-[#0D9488]/10 via-[#0D9488]/5 to-transparent border border-slate-200/50 dark:border-teal-500/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                                            <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleAvatarFileUpload} 
                        className="hidden" 
                      />

                      <div className="flex items-center gap-4 relative z-10">
                        <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <img 
                            src={userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=0D9488&color=ffffff&bold=true`}
                            alt="Avatar"
                            className="w-16 h-16 rounded-xl object-cover border-2 border-[#0D9488] shadow transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[10px] font-extrabold">
                            📷 {language === "ar" ? "المعرض" : "Gallery"}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold text-black dark:text-white">{fullName}</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2.5 py-0.5 bg-[#0D9488] text-white text-[10px] font-black uppercase rounded-full">
                              {isAdmin ? (language === "ar" ? "مدير المنصة" : "Platform Director") : (language === "ar" ? "مرشح طبيب M.D. / M.B.B.S." : "M.D. / M.B.B.S. Candidate")}
                            </span>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[10px] font-bold text-[#0D9488] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>🖼️</span>
                              <span>{language === "ar" ? "اختيار صورة من المعرض" : "Choose Photo from Gallery"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {!isAdmin && (
                        <div className="text-left md:text-right shrink-0 relative z-10">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Identifier</span>
                          <span className="text-base font-black text-[#0D9488] dark:text-teal-400 font-mono tracking-tight">{studentId}</span>
                        </div>
                      )}
                    </div>

                    {!isAdmin ? (
                      <>
                                              {/* Read-Only Academic & Account Profile Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "الاسم الكامل" : "Full Name"}</span>
                            <span className="text-sm font-extrabold text-black dark:text-white mt-1 block font-mono">{fullName || "Abdalrahman Almusleh"}</span>
                          </div>
                          <span className="text-2xl">👤</span>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</span>
                            <span className="text-sm font-extrabold text-[#0D9488] dark:text-teal-400 mt-1 block font-mono">{email || "abdogamermoh2006@gmail.com"}</span>
                          </div>
                          <span className="text-2xl">✉️</span>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "الكلية / الجامعة" : "College / University"}</span>
                            <span className="text-sm font-extrabold text-black dark:text-white mt-1 block">
                              {university || (language === "ar" ? "الجامعة الهاشمية" : "Hashemite University")}
                            </span>
                          </div>
                          <span className="text-2xl">🎓</span>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "الدرجة العلمية / التخصص" : "Degree / Specialization"}</span>
                            <span className="text-sm font-extrabold text-black dark:text-white mt-1 block">
                              {specialization || (language === "ar" ? "طب (M.D. / M.B.B.S.)" : "Medicine (M.D. / M.B.B.S.)")}
                            </span>
                          </div>
                          <span className="text-2xl">🩺</span>
                        </div>
                      </div>

                        {/* Accomplishments / Achievement Badges */}
                        <div className="border-t border-slate-100 dark:border-teal-500/10 pt-6 mt-6">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            {language === "ar" ? "الأوسمة الأكاديمية النشطة" : "Active Academic Badges"}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {hasUnlockedAtLeastOneCourse ? (
                              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm">
                                ✨ {language === "ar" ? "البداية الأولى" : "First Step Activation"}
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200/20 text-slate-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm opacity-40" title={language === "ar" ? "قم بتفعيل كورس واحد لفتح هذا الوسام" : "Unlock at least 1 course to earn this badge"}>
                                🔒 {language === "ar" ? "البداية الأولى" : "First Step"}
                              </span>
                            )}

                            {hasCompletedAtLeastOneExam ? (
                              <span className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-250/20 text-sky-600 dark:text-sky-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm">
                                🔍 {language === "ar" ? "باحث عن المعرفة" : "Curious Learner"}
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200/20 text-slate-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm opacity-40" title={language === "ar" ? "قدم اختباراً واحداً على الأقل لفتح هذا الوسام" : "Complete at least 1 exam to earn this badge"}>
                                🔒 {language === "ar" ? "باحث عن المعرفة" : "Curious Learner"}
                              </span>
                            )}

                            {hasCompletedAtLeastThreeExams ? (
                              <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-250/20 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm">
                                🎯 {language === "ar" ? "جاهز للامتحان" : "Exam Ready"}
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200/20 text-slate-400 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-sm opacity-40" title={language === "ar" ? "قدم 3 اختبارات على الأقل لفتح هذا الوسام" : "Complete at least 3 exams to earn this badge"}>
                                🔒 {language === "ar" ? "جاهز للامتحان" : "Exam Ready"}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                )}

                {/* Academic statistics screen */}
                {activeTab === "statistics" && (() => {
                  const arabicSubjectNames: Record<string, string> = {
                    anatomy: "علم التشريح",
                    embryology: "علم الأجنة",
                    physiology: "علم وظائف الأعضاء",
                    biochemistry: "الكيمياء الحيوية",
                    "biochemistry-genetics": "الكيمياء الحيوية والوراثة",
                    histology: "علم الأنسجة",
                    pathology: "علم الأمراض",
                    pharmacology: "علم الأدوية",
                    microbiology: "علم الأحياء الدقيقة",
                    immunology: "علم المناعة",
                    "public-health": "الصحة العامة",
                    gastrointestinal: "الجهاز الهضمي",
                    musculoskeletal: "الجهاز العضلي الهيكلي",
                    "central-nervous-special-senses": "الجهاز العصبي والعلوم السلوكية",
                    respiratory: "الجهاز التنفسي",
                    endocrine: "جهاز الغدد الصماء",
                    "hematology-oncology": "أمراض الدم والأورام",
                    cardiovascular: "جهاز القلب والأوعية الدموية",
                    "renal-urinary": "الجهاز البولي والكلوي",
                    reproductive: "الجهاز التناسلي"
                  };

                  const user = typeof window !== "undefined" ? localStorage.getItem("medicinety_logged_in_user") || "anonymous" : "anonymous";
                  const storageKey = `medicinety_exam_grades_${user}`;
                  const gradesStr = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
                  const gradesObj = gradesStr ? JSON.parse(gradesStr) : {};

                  const subjects = Object.values(subjectData);
                  const takenSubjects = subjects.filter(sub => gradesObj[sub.id] !== undefined);
                  const totalTaken = takenSubjects.length;
                  
                  let overallAverage = 0;
                  if (totalTaken > 0) {
                    const sum = takenSubjects.reduce((acc, sub) => acc + gradesObj[sub.id], 0);
                    overallAverage = Math.round(sum / totalTaken);
                  }

                  const overallLetterGrade = totalTaken > 0 ? getLetterGrade(overallAverage) : "-";

                  return (
                    <motion.div
                      key="platform-statistics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">
                          {language === "ar" ? "درجاتي وإحصائياتي الأكاديمية" : "My Grades & Academic Statistics"}
                        </h3>
                        <p className="text-xs font-medium text-slate-450 dark:text-slate-400 mt-1">
                          {language === "ar" ? "تتبع علاماتك في الامتحانات ومعدلك النهائي التراكمي" : "Track your exam scores, overall average, and progress across all curriculum courses"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-[#0D9488]/10 to-[#0D9488]/5 dark:from-teal-950/20 dark:to-teal-950/5 border border-teal-500/20 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-sm md:col-span-2">
                          <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#0D9488]/10 dark:bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
                                {language === "ar" ? "المعدل النهائي التراكمي" : "Cumulative Final Average"}
                              </span>
                              <h2 className="text-3xl font-black text-black dark:text-white mt-1.5 flex items-baseline gap-2">
                                {totalTaken > 0 ? `${overallAverage}%` : "--"}
                                <span className="text-sm font-semibold text-slate-400">
                                  {language === "ar" ? "من 100" : "out of 100"}
                                </span>
                              </h2>
                            </div>
                            
                            <div className="flex flex-col items-center shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {language === "ar" ? "التقدير العام" : "Overall Grade"}
                              </span>
                              <span className={`px-4 py-2 rounded-lg text-2xl font-black tracking-wide shadow-sm
                                ${totalTaken === 0
                                  ? "bg-slate-100 text-slate-450 dark:bg-zinc-800"
                                  : overallAverage >= 50
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20"
                                }
                              `}>
                                {overallLetterGrade}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200/50 dark:border-teal-500/15 mt-4 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 font-semibold">
                            <span>
                              {language === "ar" ? `الامتحانات المكتملة: ${totalTaken} كورس` : `Completed exams: ${totalTaken} courses`}
                            </span>
                            <span>
                              {overallAverage >= 50 || totalTaken === 0 
                                ? (language === "ar" ? "الحالة الأكاديمية: ناجح" : "Academic Status: Passing") 
                                : (language === "ar" ? "الحالة الأكاديمية: راسب" : "Academic Status: Failing")
                              }
                            </span>
                          </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-teal-500/20 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {language === "ar" ? "سلم التقديرات الأكاديمية" : "Grading Scale Info"}
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400">
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>A</span> <span className="text-black dark:text-white">95+</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>A-</span> <span className="text-black dark:text-white">90-94</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>B+</span> <span className="text-black dark:text-white">85-89</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>B</span> <span className="text-black dark:text-white">80-84</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>B-</span> <span className="text-black dark:text-white">75-79</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>C+</span> <span className="text-black dark:text-white">70-74</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>C</span> <span className="text-black dark:text-white">65-69</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>C-</span> <span className="text-black dark:text-white">60-64</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>D+</span> <span className="text-black dark:text-white">55-59</span></div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-teal-500/5 pb-1"><span>D</span> <span className="text-black dark:text-white">50-54</span></div>
                          </div>
                          <div className="text-[9px] font-semibold text-rose-500 text-center leading-normal">
                            {language === "ar" ? "* علامة النجاح هي 50" : "* Minimum passing score is 50"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-black dark:text-white border-b border-slate-100 dark:border-teal-500/10 pb-2">
                          {language === "ar" ? "تفاصيل علامات المساقات" : "Individual Course Performance"}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getAllPlatformCourses(subjects).length === 0 ? (
                            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-black border border-slate-200/40 dark:border-teal-500/20 rounded-xl text-slate-400 font-bold text-xs">
                              {language === "ar" ? "لا توجد مساقات مفعلة على المنصة حالياً" : "No published courses available on the platform yet."}
                            </div>
                          ) : getAllPlatformCourses(subjects).map((sub: any) => {
                            const score = gradesObj[sub.id];
                            const isTaken = score !== undefined;
                            const letter = isTaken ? getLetterGrade(score) : null;
                            const subjectName = language === "ar" ? (arabicSubjectNames[sub.id] || sub.name) : sub.name;
                            
                            return (
                              <div 
                                key={sub.id}
                                className="p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/20 hover:border-slate-250 dark:hover:border-teal-500/40 rounded-xl flex items-center justify-between transition-colors shadow-sm"
                              >
                                <div>
                                  <h5 className="text-xs font-black text-black dark:text-white">
                                    {subjectName}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {language === "ar" ? (sub.category === "General Principles" ? "المبادئ العامة" : "أجهزة الأعضاء") : sub.category}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  {isTaken ? (
                                    <>
                                      <span className="text-sm font-black text-black dark:text-white">
                                        {score}%
                                      </span>
                                      <span className={`px-2.5 py-1 rounded text-xs font-black tracking-wide
                                        ${score >= 50
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15"
                                          : "bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/15"
                                        }
                                      `}>
                                        {letter}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold rounded">
                                      {language === "ar" ? "لم يتقدم بعد" : "Not Taken"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {activeTab === "admin" && isAdmin && (() => {
                  const totalClicks = typeof window !== "undefined" ? parseInt(localStorage.getItem("medicinety_global_clicks") || "0", 10) : 0;
                  const totalWatchTimeSeconds = typeof window !== "undefined" ? parseInt(localStorage.getItem("medicinety_global_watchtime") || "0", 10) : 0;
                  const totalWatchMinutes = Math.round(totalWatchTimeSeconds / 60);
                  const totalDownloads = typeof window !== "undefined" ? parseInt(localStorage.getItem("medicinety_global_downloads") || "0", 10) : 0;
                  
                  const gpRaw = typeof window !== "undefined" ? localStorage.getItem("medicinety_general_principles_modules") : null;
                  const sysRaw = typeof window !== "undefined" ? localStorage.getItem("medicinety_systems_modules") : null;
                  const clinicalRaw = typeof window !== "undefined" ? localStorage.getItem("medicinety_clinical_modules") : null;
                  
                  let activeSubjectsList: any[] = [];
                  
                  if (gpRaw) {
                    try { 
                      const parsed = JSON.parse(gpRaw);
                      parsed.forEach((m: any) => {
                        activeSubjectsList.push({
                          id: m.id,
                          name: m.name,
                          category: "General Principles",
                          handouts: []
                        });
                      });
                    } catch(e){}
                  }
                  if (sysRaw) {
                    try { 
                      const parsed = JSON.parse(sysRaw);
                      parsed.forEach((m: any) => {
                        activeSubjectsList.push({
                          id: m.id,
                          name: m.name,
                          category: "Organ Systems",
                          handouts: []
                        });
                      });
                    } catch(e){}
                  }
                  if (clinicalRaw) {
                    try { 
                      const parsed = JSON.parse(clinicalRaw);
                      parsed.forEach((m: any) => {
                        activeSubjectsList.push({
                          id: m.id,
                          name: m.name,
                          category: "Clinical Knowledge",
                          handouts: []
                        });
                      });
                    } catch(e){}
                  }

                  if (activeSubjectsList.length === 0) {
                    const defaultActiveIds = [
                      "course-anatomy", "course-physiology", "course-biochemistry", "course-pharmacology", "course-pathology", "course-microbiology",
                      "course-cardiovascular", "course-respiratory", "course-gastrointestinal", "course-renal", "course-endocrine", "course-neurology",
                      "course-internal-medicine", "course-general-surgery", "course-pediatrics", "course-obgyn"
                    ];
                    activeSubjectsList = Object.values(subjectData)
                      .filter((sub: any) => defaultActiveIds.includes(sub.id))
                      .map((sub: any) => ({
                        id: sub.id,
                        name: sub.name,
                        category: sub.category || "General Principles",
                        handouts: sub.handouts || []
                      }));
                  }
                  
                  const subjects = activeSubjectsList;

                  // Calculate stats dynamically from activationCodes and deletedSubscriptions:
                  const usedCodesList = activationCodes.filter((c: any) => c.status === "used");
                  
                  let calculatedActiveSubs = 0;
                  let calculatedExpiredSubs = 0;
                  
                  usedCodesList.forEach((c: any) => {
                    if (isCodeExpired(c)) {
                      calculatedExpiredSubs++;
                    } else {
                      calculatedActiveSubs++;
                    }
                  });

                  const calculatedDeletedSubs = deletedSubscriptions.length;
                  const calculatedTotalSubs = calculatedActiveSubs + calculatedExpiredSubs + calculatedDeletedSubs;

                  const filteredCodes = activationCodes.filter((c: any) => {
                    if (codeFilter === "unused") return c.status === "unused";
                    if (codeFilter === "used") return c.status === "used";
                    return true;
                  });

                  return (
                    <motion.div
                      key="admin-settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8 text-brand-text text-left"
                    >
                      <div>
                        <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                          {language === "ar" ? "لوحة الإشراف وإدارة المنصة الشاملة" : "Platform Administration & Control Center"}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                          {language === "ar" 
                            ? "مراقبة الإحصائيات الحية للمساقات، توليد أكواد تفعيل وتحديث أسعارها، إدارة المستخدمين والمدراء." 
                            : "Monitor live course metrics, generate card activation codes, override pricing packages, manage user roles."}
                        </p>
                      </div>

                      {/* Advanced Platform Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "إجمالي الكورسات" : "Total Courses"}</span>
                          <span className="text-xl font-black text-[#0D9488] block mt-1">{subjects.length}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "النقرات والتفاعل" : "Platform Clicks"}</span>
                          <span className="text-xl font-black text-[#0D9488] block mt-1">{totalClicks}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "المستخدمين المسجلين" : "Registered Users"}</span>
                          <span className="text-xl font-black text-black dark:text-white block mt-1">{registeredUsers.length}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "المدراء النشطين" : "Active Admins"}</span>
                          <span className="text-xl font-black text-black dark:text-white block mt-1">{adminsList.length}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "الاشتراكات الفعالة" : "Active Subscriptions"}</span>
                          <span className="text-xl font-black text-emerald-500 block mt-1">{calculatedActiveSubs}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "الاشتراكات المنتهية" : "Expired Subscriptions"}</span>
                          <span className="text-xl font-black text-slate-400 block mt-1">{calculatedExpiredSubs}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "المحذوفة قبل الانتهاء" : "Deleted Pre-Expiry"}</span>
                          <span className="text-xl font-black text-red-500 block mt-1">{calculatedDeletedSubs}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "إجمالي الاشتراكات" : "Total Subscriptions"}</span>
                          <span className="text-xl font-black text-black dark:text-white block mt-1">{calculatedTotalSubs}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "تحميلات الملفات" : "File Downloads"}</span>
                          <span className="text-xl font-black text-[#0D9488] block mt-1">{totalDownloads}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{language === "ar" ? "دقائق المشاهدة" : "Total Watch Time"}</span>
                          <span className="text-xl font-black text-[#0D9488] block mt-1">{totalWatchMinutes}</span>
                        </div>
                      </div>

                      {/* Course Specific Stats Directory */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {language === "ar" ? "تفاصيل إحصائيات كل مساق بشكل منفصل" : "Individual Subject Performance Analytics"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getAllPlatformCourses(subjects).length === 0 ? (
                            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-black border border-slate-200/40 dark:border-teal-500/20 rounded-xl text-slate-400 font-bold text-xs">
                              {language === "ar" ? "لا توجد مساقات مفعلة على المنصة حالياً" : "No published courses available on the platform yet."}
                            </div>
                          ) : getAllPlatformCourses(subjects).map((sub: any) => {
                            const subStats = getSubjectStats(sub.id, sub.handouts);
                            const arabicSubjectNames: Record<string, string> = {
                              anatomy: "علم التشريح",
                              embryology: "علم الأجنة",
                              physiology: "علم وظائف الأعضاء",
                              biochemistry: "الكيمياء الحيوية",
                              "biochemistry-genetics": "الكيمياء الحيوية والوراثة",
                              histology: "علم الأنسجة",
                              pathology: "علم الأمراض",
                              pharmacology: "علم الأدوية",
                              microbiology: "علم الأحياء الدقيقة",
                              immunology: "علم المناعة",
                              "public-health": "الصحة العامة",
                              gastrointestinal: "الجهاز الهضمي",
                              musculoskeletal: "الجهاز العضلي الهيكلي",
                              "central-nervous-special-senses": "الجهاز العصبي والعلوم السلوكية",
                              respiratory: "الجهاز التنفسي",
                              endocrine: "جهاز الغدد الصماء",
                              "hematology-oncology": "أمراض الدم والأورام",
                              cardiovascular: "جهاز القلب والأوعية الدموية",
                              "renal-urinary": "الجهاز البولي والكلوي",
                              reproductive: "الجهاز التناسلي"
                            };
                            const subName = language === "ar" ? (arabicSubjectNames[sub.id] || sub.name) : sub.name;
                            const realSubsCount = typeof window !== "undefined" ? getRealCourseSubscribers(sub.id).length : 4;

                            return (
                              <div key={sub.id} className="p-4 bg-slate-50/50 dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/15 rounded-xl space-y-3">
                                <div className="flex justify-between items-start border-b border-slate-200/30 pb-2">
                                  <div>
                                    <h5 className="text-xs font-black text-black dark:text-white flex items-center gap-2">
                                      <span>{subName}</span>
                                      <span className="text-[9px] font-extrabold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                                        👥 {realSubsCount} {language === "ar" ? "طالب مسجل" : "Enrolled"}
                                      </span>
                                    </h5>
                                    <span className="text-[9px] text-slate-450 font-semibold">{sub.category}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setAdminCardSelectedCourse({ id: sub.id, name: subName });
                                        setAdminCardAnalyticsOpen(true);
                                      }}
                                      className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                      title="View Subscribers & Detailed Analytics"
                                    >
                                      <MoreVertical className="w-4 h-4 text-[#0D9488]" />
                                    </button>
                                    <span className="px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] text-[8px] font-black uppercase rounded">ID: {sub.id}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                                  <div className="p-2 bg-white dark:bg-black/25 rounded border border-slate-100 dark:border-teal-500/5">
                                    <span className="text-[8px] text-slate-400 block">{language === "ar" ? "الزيارات" : "Visits"}</span>
                                    <span className="font-extrabold text-black dark:text-white mt-0.5 block">{subStats.clicks}</span>
                                  </div>
                                  <div className="p-2 bg-white dark:bg-black/25 rounded border border-slate-100 dark:border-teal-500/5">
                                    <span className="text-[8px] text-slate-400 block">{language === "ar" ? "المشاهدة" : "Watched"}</span>
                                    <span className="font-extrabold text-black dark:text-white mt-0.5 block">{subStats.watchMinutes} min</span>
                                  </div>
                                  <div className="p-2 bg-white dark:bg-black/25 rounded border border-slate-100 dark:border-teal-500/5">
                                    <span className="text-[8px] text-slate-400 block">{language === "ar" ? "تنزيل ملفات" : "Downloads"}</span>
                                    <span className="font-extrabold text-black dark:text-white mt-0.5 block">{subStats.totalDownloads}</span>
                                  </div>
                                </div>
                                
                                {subStats.handoutDownloads.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "ملفات المساق وتحميلاتها" : "Files & Downloads"}</span>
                                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                                      {subStats.handoutDownloads.map((f: any, fIdx: number) => (
                                        <div key={fIdx} className="flex justify-between text-[9px] py-1 px-2 bg-white dark:bg-black/25 border border-slate-100/50 dark:border-teal-500/5 rounded">
                                          <span className="truncate pr-4 text-slate-500 dark:text-slate-400 font-semibold">{f.name}</span>
                                          <span className="font-bold text-[#0D9488] shrink-0">{f.downloads} {language === "ar" ? "تحميل" : "dl"}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Course Activation Promo Codes Generator */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {language === "ar" ? "منشئ ومولد أكواد البطاقات والاشتراكات" : "Activation Codes & Cards Generator"}
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Generator Form */}
                          <div className="lg:col-span-1 p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl space-y-4 shadow-sm">
                            <h5 className="text-xs font-bold text-black dark:text-white pb-2 border-b border-slate-200/30">
                              {language === "ar" ? "إعدادات المولد المخصص" : "Generator Parameters"}
                            </h5>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "المساق المستهدف" : "Target Subject"}</label>
                                <select 
                                  value={genSubjectId} 
                                  onChange={e => {
                                    const subId = e.target.value;
                                    setGenSubjectId(subId);
                                    updateGeneratorDefaults(subId, genPriceTier);
                                  }} 
                                  className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                                >
                                  <option value="all">{language === "ar" ? "جميع الكورسات (كود عام)" : "All subjects (Universal Code)"}</option>
                                  {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "حزمة السعر" : "Price Tier"}</label>
                                  <select 
                                    value={genPriceTier} 
                                    onChange={e => {
                                      const tier = e.target.value as any;
                                      setGenPriceTier(tier);
                                      updateGeneratorDefaults(genSubjectId, tier);
                                    }} 
                                    className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                                  >
                                    <option value="semester">{language === "ar" ? "أربعة أشهر" : "4 Months"}</option>
                                    <option value="yearly">{language === "ar" ? "سنوي" : "Yearly"}</option>
                                    <option value="lifetime">{language === "ar" ? "مدى الحياة" : "Lifetime"}</option>
                                    <option value="other">{language === "ar" ? "مخصص (وقت آخر)" : "Other (Custom Duration)"}</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "السعر المقابل ($)" : "Value Price ($)"}</label>
                                  <input 
                                    type="number" 
                                    value={genPrice} 
                                    onChange={e => setGenPrice(e.target.value)} 
                                    className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2 rounded-lg outline-none font-semibold"
                                  />
                                </div>
                              </div>

                              {genPriceTier === "other" && (
                                <div className="p-3 bg-slate-100 dark:bg-black/40 border border-slate-200/50 dark:border-teal-500/10 rounded-lg space-y-2">
                                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                                    {language === "ar" ? "مدة الصلاحية المخصصة للاشتراك" : "Custom Duration Period"}
                                  </span>
                                  <div className="grid grid-cols-4 gap-1.5 text-center">
                                    <div className="space-y-1 text-left">
                                      <label className="text-[8px] font-bold text-slate-450 block">{language === "ar" ? "أيام" : "Days"}</label>
                                      <input 
                                        type="number" 
                                        min={0} 
                                        value={customDays} 
                                        onChange={e => setCustomDays(Math.max(0, parseInt(e.target.value, 10) || 0))} 
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/25 text-center text-xs p-1 rounded font-semibold"
                                      />
                                    </div>
                                    <div className="space-y-1 text-left">
                                      <label className="text-[8px] font-bold text-slate-450 block">{language === "ar" ? "ساعات" : "Hours"}</label>
                                      <input 
                                        type="number" 
                                        min={0} 
                                        max={23} 
                                        value={customHours} 
                                        onChange={e => setCustomHours(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)))} 
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/25 text-center text-xs p-1 rounded font-semibold"
                                      />
                                    </div>
                                    <div className="space-y-1 text-left">
                                      <label className="text-[8px] font-bold text-slate-450 block">{language === "ar" ? "دقائق" : "Mins"}</label>
                                      <input 
                                        type="number" 
                                        min={0} 
                                        max={59} 
                                        value={customMinutes} 
                                        onChange={e => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))} 
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/25 text-center text-xs p-1 rounded font-semibold"
                                      />
                                    </div>
                                    <div className="space-y-1 text-left">
                                      <label className="text-[8px] font-bold text-slate-450 block">{language === "ar" ? "ثواني" : "Secs"}</label>
                                      <input 
                                        type="number" 
                                        min={0} 
                                        max={59} 
                                        value={customSeconds} 
                                        onChange={e => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))} 
                                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/25 text-center text-xs p-1 rounded font-semibold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "كمية الأكواد للتوليد" : "Quantity to Generate"}</label>
                                <input 
                                  type="number" 
                                  min={1} 
                                  max={100} 
                                  value={genQty} 
                                  onChange={e => setGenQty(parseInt(e.target.value, 10) || 1)} 
                                  className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                                />
                              </div>
                              
                              <button
                                onClick={handleGenerateCodes}
                                className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg shadow uppercase transition-all"
                              >
                                {language === "ar" ? "توليد أكواد جديدة" : "Generate Coupon Codes"}
                              </button>
                            </div>
                          </div>

                          {/* Code Directory / Stacking lists vertically */}
                          <div className="lg:col-span-2 flex flex-col gap-6">
                            
                            {/* Column 1: Unsold Codes (Generated but not sold yet) */}
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/40">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <span>📦</span> {language === "ar" ? "أكواد غير مباعة (مخزن البطاقات)" : "Unsold Code Inventory"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-black rounded-full">
                                  {activationCodes.filter((c: any) => c.status === "generated").length}
                                </span>
                              </div>

                              <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">{language === "ar" ? "الكود" : "Code"}</th>
                                      <th className="px-3 py-2">{language === "ar" ? "المساق / السعر" : "Course / Value"}</th>
                                      <th className="px-3 py-2 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                    {activationCodes.filter((c: any) => c.status === "generated").length === 0 ? (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-450 italic">
                                          {language === "ar" ? "لا توجد أكواد غير مباعة" : "No unsold codes found"}
                                        </td>
                                      </tr>
                                    ) : (
                                      activationCodes.filter((c: any) => c.status === "generated").map((c: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                          <td className="px-3 py-2 font-bold text-black dark:text-white font-mono select-text">{c.code}</td>
                                          <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{c.subjectId === "all" ? "Universal" : c.subjectId}</div>
                                            <div className="text-[9px] text-slate-400 font-semibold">${c.price}</div>
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <button
                                              onClick={() => handleMarkAsSold(c.code)}
                                              className="px-2 py-1 text-[9px] font-black text-white bg-[#0D9488] hover:bg-[#0D9488]/90 rounded transition-all shadow-sm"
                                            >
                                              {language === "ar" ? "تم بيعه" : "Mark Sold"}
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Column 2: Sold Codes */}
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/40">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <span>💳</span> {language === "ar" ? "بطاقات مباعة (جاهزة للتفعيل)" : "Sold Cards (Ready to Activate)"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-black rounded-full">
                                  {activationCodes.filter((c: any) => c.status === "sold").length}
                                </span>
                              </div>

                              <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">{language === "ar" ? "الكود" : "Code"}</th>
                                      <th className="px-3 py-2">{language === "ar" ? "المساق / السعر" : "Course / Value"}</th>
                                      <th className="px-3 py-2 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                    {activationCodes.filter((c: any) => c.status === "sold").length === 0 ? (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-450 italic">
                                          {language === "ar" ? "لا توجد بطاقات مباعة حالياً" : "No sold cards found"}
                                        </td>
                                      </tr>
                                    ) : (
                                      activationCodes.filter((c: any) => c.status === "sold").map((c: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                          <td className="px-3 py-2 font-bold text-black dark:text-white font-mono select-text">{c.code}</td>
                                          <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{c.subjectId === "all" ? "Universal" : c.subjectId}</div>
                                            <div className="text-[9px] text-slate-450 font-semibold">${c.price} ({c.priceTier})</div>
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <button
                                              onClick={() => handleDeleteCode(c.code)}
                                              className="px-2 py-0.5 text-[9px] font-bold text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded transition-all"
                                            >
                                              {language === "ar" ? "حذف" : "Delete"}
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Column 3: Used/Redeemed Codes */}
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/40">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                                  <span>🔒</span> {language === "ar" ? "بطاقات مستعملة ونشطة (بيانات المشتركين)" : "Redeemed Active Subscriptions"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-black rounded-full">
                                  {activationCodes.filter((c: any) => c.status === "used" && !isCodeExpired(c)).length}
                                </span>
                              </div>

                              <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">{language === "ar" ? "الكود" : "Code"}</th>
                                      <th className="px-3 py-2">{language === "ar" ? "المستعمل والاشتراك" : "Redemption Details"}</th>
                                      <th className="px-3 py-2 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                    {activationCodes.filter((c: any) => c.status === "used" && !isCodeExpired(c)).length === 0 ? (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-455 italic">
                                          {language === "ar" ? "لا توجد اشتراكات نشطة حالياً" : "No active redeemed subscriptions found"}
                                        </td>
                                      </tr>
                                    ) : (
                                      activationCodes.filter((c: any) => c.status === "used" && !isCodeExpired(c)).map((c: any, idx: number) => {
                                        const isExp = isCodeExpired(c);
                                        return (
                                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                            <td className="px-3 py-2 font-bold text-black dark:text-white font-mono select-text">
                                              <span>{c.code}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="space-y-0.5 text-left">
                                                <div className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">Email: {c.usedBy}</div>
                                                <div className="text-[9px] text-slate-455 font-semibold">
                                                  Course: {c.subjectId === "all" ? "Universal" : c.subjectId} • ${c.price} ({c.priceTier})
                                                </div>
                                                {c.usedAt && (
                                                  <div className="text-[8px] text-slate-400">Date: {new Date(c.usedAt).toLocaleString()}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                              <div className="flex items-center justify-end gap-2">
                                                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase select-none">
                                                  {language === "ar" ? "نشط" : "Active"}
                                                </span>
                                                <button
                                                  onClick={() => handleDeleteCode(c.code)}
                                                  className="px-2 py-0.5 text-[9px] font-bold text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded transition-all"
                                                >
                                                  {language === "ar" ? "حذف" : "Delete"}
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Column 4: Expired Codes Log */}
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/40">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                                  <span>⏳</span> {language === "ar" ? "سجل البطاقات منتهية الصلاحية" : "Expired Codes Log"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-black rounded-full">
                                  {activationCodes.filter((c: any) => c.status === "used" && isCodeExpired(c)).length}
                                </span>
                              </div>

                              <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">{language === "ar" ? "الكود" : "Code"}</th>
                                      <th className="px-3 py-2">{language === "ar" ? "تفاصيل الانتهاء" : "Expiration Details"}</th>
                                      <th className="px-3 py-2 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                    {activationCodes.filter((c: any) => c.status === "used" && isCodeExpired(c)).length === 0 ? (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-455 italic">
                                          {language === "ar" ? "لا توجد بطاقات منتهية الصلاحية" : "No expired cards found"}
                                        </td>
                                      </tr>
                                    ) : (
                                      activationCodes.filter((c: any) => c.status === "used" && isCodeExpired(c)).map((c: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                          <td className="px-3 py-2 font-bold text-black dark:text-white font-mono select-text">
                                            <span>{c.code}</span>
                                            <span className="ml-2 px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase">
                                              {language === "ar" ? "منتهي" : "Expired"}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="space-y-0.5 text-left">
                                              <div className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">Email: {c.usedBy}</div>
                                              <div className="text-[9px] text-slate-455 font-semibold">
                                                Course: {c.subjectId === "all" ? "Universal" : c.subjectId} • ${c.price} ({c.priceTier})
                                              </div>
                                              {c.expiresAt && (
                                                <div className="text-[8px] text-red-500 font-semibold">Expired At: {new Date(c.expiresAt).toLocaleString()}</div>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <button
                                              onClick={() => handleDeleteCode(c.code)}
                                              className="px-2 py-0.5 text-[9px] font-bold text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded transition-all"
                                            >
                                              {language === "ar" ? "حذف" : "Delete"}
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Column 5: Deleted Subscriptions Log */}
                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/40">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                                  <span>🗑️</span> {language === "ar" ? "دورات تم حذفها قبل انتهاء التفعيل" : "Manually Deleted Subscriptions"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[9px] font-black rounded-full">
                                  {deletedSubscriptions.length}
                                </span>
                              </div>

                              <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2">{language === "ar" ? "الكود والمساق" : "Code & Subject"}</th>
                                      <th className="px-3 py-2">{language === "ar" ? "تفاصيل الطالب والتواريخ" : "User & Dates"}</th>
                                      <th className="px-3 py-2 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                    {deletedSubscriptions.length === 0 ? (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-455 italic">
                                          {language === "ar" ? "لا توجد اشتراكات محذوفة حالياً" : "No deleted subscriptions found"}
                                        </td>
                                      </tr>
                                    ) : (
                                      deletedSubscriptions.map((delSub: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                          <td className="px-3 py-2">
                                            <div className="font-bold text-black dark:text-white font-mono select-text">{delSub.code}</div>
                                            <div className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">
                                              Course: {delSub.subjectId === "all" ? "Universal" : delSub.subjectId}
                                            </div>
                                            <div className="text-[9px] text-slate-455 font-semibold">
                                              Val: ${delSub.price} ({delSub.priceTier})
                                            </div>
                                          </td>
                                          <td className="px-3 py-2">
                                            <div className="space-y-0.5 text-left text-[9px]">
                                              <div className="text-slate-800 dark:text-slate-200 font-bold">Email: {delSub.user}</div>
                                              <div className="text-slate-450 font-semibold">Activated: {new Date(delSub.activatedAt).toLocaleString()}</div>
                                              <div className="text-red-500 font-semibold">Deleted: {new Date(delSub.deletedAt).toLocaleString()}</div>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <button
                                              onClick={() => {
                                                triggerConfirm(
                                                  language === "ar" ? "تأكيد إزالة السجل" : "Confirm Record Removal",
                                                  language === "ar" 
                                                    ? "هل أنت متأكد من رغبتك في مسح هذا السجل نهائياً من قائمة الأرشيف؟" 
                                                    : "Are you sure you want to permanently delete this record from the archive log?",
                                                  () => {
                                                    const updated = deletedSubscriptions.filter((_, i) => i !== idx);
                                                    setDeletedSubscriptions(updated);
                                                    localStorage.setItem("medicinety_deleted_subscriptions", JSON.stringify(updated));
                                                  }
                                                );
                                              }}
                                              className="px-2 py-0.5 text-[9px] font-bold text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded transition-all"
                                            >
                                              {language === "ar" ? "مسح" : "Remove"}
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Course Packages Dynamic Price Modifiers */}
                      <form onSubmit={handleStandardPriceModify} className="space-y-6 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {language === "ar" ? "تعديل حزم أسعار الكورسات والمساقات الأساسية" : "Subject Standard Pricing Manager"}
                          </h4>
                          <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md">
                            <Save className="w-3.5 h-3.5" />
                            <span>{language === "ar" ? "تعديل الأسعار الأساسية" : "Modify Standard Prices"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "اختر الكورس" : "Select Subject"}</label>
                            <select 
                              value={priceModSubjectId} 
                              onChange={e => {
                                const subId = e.target.value;
                                setPriceModSubjectId(subId);
                                const gpRaw = localStorage.getItem("medicinety_general_principles_modules");
                                const sysRaw = localStorage.getItem("medicinety_systems_modules");
                                let foundModule: any = null;
                                if (gpRaw) {
                                  try { foundModule = JSON.parse(gpRaw).find((m: any) => m.id === subId); } catch(e){}
                                }
                                if (!foundModule && sysRaw) {
                                  try { foundModule = JSON.parse(sysRaw).find((m: any) => m.id === subId); } catch(e){}
                                }
                                if (foundModule) {
                                  setPriceModSemester(foundModule.priceSemester || "40");
                                  setPriceModYearly(foundModule.priceYearly || "60");
                                  setPriceModLifetime(foundModule.priceLifetime || "129");
                                }
                              }} 
                              className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                              required
                            >
                              <option value="">{language === "ar" ? "اختر المساق لتعديله..." : "Select subject..."}</option>
                              {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "سعر 4 أشهر ($)" : "4 Months Price ($)"}</label>
                            <input type="text" value={priceModSemester} onChange={e => setPriceModSemester(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "السعر السنوي ($)" : "Yearly Price ($)"}</label>
                            <input type="text" value={priceModYearly} onChange={e => setPriceModYearly(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "سعر مدى الحياة ($)" : "Lifetime Price ($)"}</label>
                            <input type="text" value={priceModLifetime} onChange={e => setPriceModLifetime(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold" />
                          </div>
                        </div>
                      </form>

                      {/* Course Custom Duration Price Modifiers */}
                      <form onSubmit={handleCustomPriceModify} className="space-y-6 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {language === "ar" ? "تعديل أسعار وصلاحيات الكورسات المخصصة" : "Subject Custom Duration Manager"}
                          </h4>
                          <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md">
                            <Save className="w-3.5 h-3.5" />
                            <span>{language === "ar" ? "تعديل السعر المخصص" : "Modify Custom Price"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "اختر الكورس" : "Select Subject"}</label>
                            <select 
                              value={priceModCustomSubjectId} 
                              onChange={e => {
                                const subId = e.target.value;
                                setPriceModCustomSubjectId(subId);
                                const gpRaw = localStorage.getItem("medicinety_general_principles_modules");
                                const sysRaw = localStorage.getItem("medicinety_systems_modules");
                                let foundModule: any = null;
                                if (gpRaw) {
                                  try { foundModule = JSON.parse(gpRaw).find((m: any) => m.id === subId); } catch(e){}
                                }
                                if (!foundModule && sysRaw) {
                                  try { foundModule = JSON.parse(sysRaw).find((m: any) => m.id === subId); } catch(e){}
                                }
                                if (foundModule) {
                                  setPriceModOther(foundModule.priceOther || "10");
                                  setPriceModOtherValue(foundModule.customDurationValue !== undefined ? foundModule.customDurationValue : (foundModule.customDurationMinutes || 0));
                                  setPriceModOtherUnit(foundModule.customDurationUnit || "minutes");
                                }
                              }} 
                              className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                              required
                            >
                              <option value="">{language === "ar" ? "اختر المساق لتعديله..." : "Select subject..."}</option>
                              {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">{language === "ar" ? "سعر الباقة المخصصة ($)" : "Custom Price ($)"}</label>
                            <input type="text" value={priceModOther} onChange={e => setPriceModOther(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide block">{language === "ar" ? "قيمة المدة" : "Duration Value"}</label>
                            <input type="text" value={priceModOtherValue === 0 ? "" : priceModOtherValue} onChange={e => setPriceModOtherValue(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)} className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold text-center" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide block">{language === "ar" ? "وحدة قياس الوقت" : "Time Unit"}</label>
                            <select 
                              value={priceModOtherUnit} 
                              onChange={e => setPriceModOtherUnit(e.target.value)} 
                              className="w-full bg-white dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                            >
                              <option value="seconds">{language === "ar" ? "ثواني" : "Seconds"}</option>
                              <option value="minutes">{language === "ar" ? "دقائق" : "Minutes"}</option>
                              <option value="hours">{language === "ar" ? "ساعات" : "Hours"}</option>
                              <option value="days">{language === "ar" ? "أيام" : "Days"}</option>
                            </select>
                          </div>
                        </div>
                      </form>

                      {/* Subscription Renewal Requests Section */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {language === "ar" ? "طلبات تجديد الاشتراك المعلقة" : "Pending Subscription Renewal Requests"}
                          </h4>
                          <span className="px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold rounded-full">
                            {renewalRequests.length}
                          </span>
                        </div>

                        <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto bg-white dark:bg-[#151515]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none sticky top-0">
                              <tr>
                                <th className="px-4 py-3">{language === "ar" ? "المشترك" : "Student"}</th>
                                <th className="px-4 py-3">{language === "ar" ? "الكورس" : "Subject"}</th>
                                <th className="px-4 py-3">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</th>
                                <th className="px-4 py-3 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                              {renewalRequests.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-slate-455 italic">
                                    {language === "ar" ? "لا توجد طلبات تجديد معلقة حالياً" : "No pending renewal requests found"}
                                  </td>
                                </tr>
                              ) : (
                                renewalRequests.map((req: any) => (
                                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="font-bold text-black dark:text-white">{req.user}</div>
                                      <div className="text-[9px] text-slate-400 font-medium">Requested: {new Date(req.createdAt).toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-bold">{req.subjectName}</td>
                                    <td className="px-4 py-3 text-[#0D9488] font-mono font-bold select-text">{req.phone}</td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => setRenewalDialog({
                                          isOpen: true,
                                          requestId: req.id,
                                          studentEmail: req.user,
                                          subjectId: req.subjectId,
                                          subjectName: req.subjectName,
                                          selectedTier: "semester",
                                          customVal: 10,
                                          customUnit: "minutes"
                                        })}
                                        className="px-3 py-1 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
                                      >
                                        {language === "ar" ? "تجديد الاشتراك" : "Renew Subscription"}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Registered Users List Section */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {language === "ar" ? "المستخدمين المسجلين" : "Registered Platform Users"}
                        </h4>
                        <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/20 select-none">
                                <tr>
                                  <th className="px-4 py-3">{language === "ar" ? "الاسم" : "Name"}</th>
                                  <th className="px-4 py-3">{language === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                                  <th className="px-4 py-3">{language === "ar" ? "الجامعة والتخصص" : "University & Degree"}</th>
                                  <th className="px-4 py-3">{language === "ar" ? "الدور" : "Role"}</th>
                                  <th className="px-4 py-3 text-right">{language === "ar" ? "إجراءات" : "Actions"}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 bg-white dark:bg-transparent font-medium">
                                {registeredUsers.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-450 italic">
                                      {language === "ar" ? "لا يوجد مستخدمين مسجلين حالياً" : "No registered platform users found"}
                                    </td>
                                  </tr>
                                ) : (
                                  registeredUsers.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5 transition-colors">
                                      <td className="px-4 py-3 text-black dark:text-white font-bold">{user.firstName} {user.lastName || ""}</td>
                                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.email}</td>
                                      <td className="px-4 py-3">
                                        <div className="text-black dark:text-white font-semibold">{user.university}</div>
                                        <div className="text-[10px] text-slate-450 mt-0.5">{user.specialization}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase
                                          ${user.role === "admin" 
                                            ? "bg-teal-550/10 text-[#0D9488] dark:text-teal-400" 
                                            : "bg-slate-100 dark:bg-zinc-800 text-slate-550"
                                          }
                                        `}>
                                          {user.role}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <button
                                          onClick={() => {
                                            triggerConfirm(
                                              language === "ar" ? "تأكيد حذف المستخدم" : "Confirm User Deletion",
                                              language === "ar" 
                                                ? `هل أنت متأكد من رغبتك في حذف حساب المستخدم: ${user.email}؟`
                                                : `Are you sure you want to delete user account: ${user.email}?`,
                                              () => {
                                                const updated = registeredUsers.filter((_, i) => i !== idx);
                                                setRegisteredUsers(updated);
                                                localStorage.setItem("medicinety_registered_users", JSON.stringify(updated));
                                              }
                                            );
                                          }}
                                          className="px-2.5 py-1 text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded transition-all"
                                        >
                                          {language === "ar" ? "حذف" : "Delete"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Student Account Inspector & Auditor Section */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {language === "ar" ? "مستكشف ومفتش تفاصيل حسابات الطلاب" : "Student Account Inspector & Auditor"}
                          </h4>
                        </div>

                        <form onSubmit={handleInspectUser} className="flex gap-2">
                          <input
                            type="email"
                            required
                            placeholder={language === "ar" ? "أدخل البريد الإلكتروني للطالب..." : "Enter student email to inspect..."}
                            value={inspectorEmail}
                            onChange={e => setInspectorEmail(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold text-black dark:text-white"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5"
                          >
                            <span>🔍</span>
                            <span>{language === "ar" ? "فحص الحساب" : "Inspect Account"}</span>
                          </button>
                        </form>

                        {inspectorError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg text-center animate-pulse">
                            {inspectorError}
                          </div>
                        )}

                        {inspectedUser && (
                          <div className="space-y-4 p-5 bg-slate-50/50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-200">
                            {/* User Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200/40 dark:border-teal-500/10 pb-4 text-xs font-bold">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "الرقم التعريفي للمشترك (ID)" : "Student ID"}
                                </label>
                                <span className="text-black dark:text-white font-mono select-all">
                                  {inspectedUser.studentId || ("ST-" + Math.abs(inspectedUser.email.split("").reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString().substring(0, 6))}
                                </span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "الاسم الكامل" : "Full Name"}
                                </label>
                                <span className="text-[#0D9488]">{inspectedUser.firstName} {inspectedUser.lastName || ""}</span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                                </label>
                                <span className="text-black dark:text-white font-mono select-all">{inspectedUser.email}</span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "نوع الحساب" : "Role"}
                                </label>
                                <span className="px-2 py-0.5 bg-teal-500/10 text-[#0D9488] text-[9px] rounded-full uppercase">
                                  {inspectedUser.role || "student"}
                                </span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "الجامعة" : "University"}
                                </label>
                                <span className="text-black dark:text-white">{inspectedUser.university || "N/A"}</span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "التخصص التعليمي" : "Specialization"}
                                </label>
                                <span className="text-black dark:text-white">{inspectedUser.specialization || "N/A"}</span>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {language === "ar" ? "تاريخ التسجيل" : "Registration Date"}
                                </label>
                                <span className="text-slate-500 dark:text-slate-400">
                                  {inspectedUser.registeredAt ? new Date(inspectedUser.registeredAt).toLocaleString() : "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Two Column Layout for Subscriptions and Exam History */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Subscriptions */}
                              <div className="space-y-2">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200/40 dark:border-teal-500/10">
                                  <span>💳</span> {language === "ar" ? "الكورسات المشترك بها" : "Enrolled Courses & Expirations"}
                                </h5>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                  {inspectedSubs.length === 0 ? (
                                    <p className="text-[10px] text-slate-450 italic py-4 text-center">{language === "ar" ? "لم يقم هذا المشترك بتفعيل أي كورس بعد." : "This student has no active course subscriptions."}</p>
                                  ) : (
                                    inspectedSubs.map((sub: any, sIdx: number) => {
                                      const isExp = sub.expiresAt && new Date() > new Date(sub.expiresAt);
                                      return (
                                        <div key={sIdx} className="p-2.5 bg-white dark:bg-black border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex justify-between items-center text-xs">
                                          <div>
                                            <div className="font-bold text-black dark:text-white">{sub.subjectId === "all" ? "Universal" : sub.subjectId}</div>
                                            <div className="text-[9px] text-slate-400 font-medium">Activated: {new Date(sub.activatedAt).toLocaleDateString()}</div>
                                          </div>
                                          <div className="text-right">
                                            {isExp ? (
                                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded uppercase">
                                                {language === "ar" ? "منتهي" : "Expired"}
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded uppercase">
                                                {language === "ar" ? "نشط" : "Active"}
                                              </span>
                                            )}
                                            <div className="text-[8px] text-slate-400 font-semibold mt-1">
                                              {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "Lifetime"}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Exam Grades */}
                              <div className="space-y-2">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200/40 dark:border-teal-500/10">
                                  <span>🎓</span> {language === "ar" ? "نتائج وسجل الامتحانات" : "Academic Exam Performance"}
                                </h5>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                  {Object.keys(inspectedGrades).length === 0 ? (
                                    <p className="text-[10px] text-slate-450 italic py-4 text-center">{language === "ar" ? "لم يقم هذا المشترك بتقديم أي امتحان بعد." : "This student has not completed any exams yet."}</p>
                                  ) : (
                                    Object.entries(inspectedGrades).map(([examKey, record]: [string, any], eIdx: number) => {
                                      const pass = record.score >= 50;
                                      return (
                                        <div key={eIdx} className="p-2.5 bg-white dark:bg-black border border-slate-200/40 dark:border-teal-500/10 rounded-xl flex justify-between items-center text-xs">
                                          <div>
                                            <div className="font-bold text-black dark:text-white">{examKey}</div>
                                            <div className="text-[9px] text-slate-400 font-medium">{record.completedAt ? new Date(record.completedAt).toLocaleDateString() : "N/A"}</div>
                                          </div>
                                          <div className="text-right">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                              pass ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            }`}>
                                              {record.score}%
                                            </span>
                                            <div className="text-[8px] text-slate-400 font-semibold mt-1">
                                              {record.correctAnswers}/{record.totalQuestions} {language === "ar" ? "إجابة صحيحة" : "Correct"}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Device Security & Audit Log */}
                              <div className="md:col-span-2 border-t border-slate-200/40 dark:border-teal-500/10 pt-4">
                                <label className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wider block mb-3">
                                  {language === "ar" ? "سجل أجهزة تسجيل الدخول وأمن الحساب" : "Device Access Log & Session Security"}
                                </label>
                                
                                <div className="border border-slate-200/40 dark:border-teal-500/25 rounded-xl overflow-hidden bg-white dark:bg-black/30">
                                  <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-50 dark:bg-[#131313] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/40 dark:border-teal-500/15">
                                      <tr>
                                        <th className="px-3 py-2">Device ID</th>
                                        <th className="px-3 py-2">Device details</th>
                                        <th className="px-3 py-2">First Login</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 font-semibold">
                                      {(() => {
                                        const devRaw = typeof window !== "undefined" ? localStorage.getItem("medicinety_user_devices_" + inspectedUser.email.toLowerCase().trim()) : null;
                                        const deviceLogs = devRaw ? JSON.parse(devRaw) : [];
                                        if (deviceLogs.length === 0) {
                                          return (
                                            <tr>
                                              <td colSpan={5} className="px-3 py-4 text-center text-slate-400 italic">
                                                {language === "ar" ? "لا توجد أجهزة مسجلة دخول حالياً لهذا المشترك" : "No registered login devices found for this student"}
                                              </td>
                                            </tr>
                                          );
                                        }
                                        return deviceLogs.map((dev: any, didx: number) => {
                                          let isCooldown = dev.status === "cooldown";
                                          let cooldownLeft = "";
                                          if (isCooldown && dev.cooldownUntil) {
                                            const diffMs = new Date(dev.cooldownUntil).getTime() - new Date().getTime();
                                            if (diffMs > 0) {
                                              const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                              cooldownLeft = language === "ar" ? `متبقي ${days} يوم` : `${days} days left`;
                                            } else {
                                              isCooldown = false;
                                            }
                                          }
                                          
                                          return (
                                            <tr key={didx} className="hover:bg-slate-50/50 dark:hover:bg-teal-950/5">
                                              <td className="px-3 py-2 font-mono text-[10px] text-slate-500">{dev.deviceId}</td>
                                              <td className="px-3 py-2 text-black dark:text-white">{dev.userAgent}</td>
                                              <td className="px-3 py-2 text-slate-400 text-[10px]">{new Date(dev.loginTime).toLocaleString()}</td>
                                              <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase
                                                  ${dev.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                                                    isCooldown ? "bg-rose-500/10 text-rose-500" : "bg-slate-100 dark:bg-zinc-800 text-slate-450"}
                                                `}>
                                                  {dev.status === "active" ? (language === "ar" ? "نشط حالياً" : "Active Now") :
                                                   isCooldown ? (language === "ar" ? `مقفل (${cooldownLeft})` : `Locked (${cooldownLeft})`) : 
                                                   (language === "ar" ? "مسجل خروج" : "Logged Out")}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-right">
                                                {(dev.status === "active" || isCooldown) && (
                                                  <button
                                                    onClick={() => {
                                                      const updatedDevs = [...deviceLogs];
                                                      updatedDevs[didx].status = "logged_out";
                                                      if (updatedDevs[didx].cooldownUntil) {
                                                        delete updatedDevs[didx].cooldownUntil;
                                                      }
                                                      localStorage.setItem("medicinety_user_devices_" + inspectedUser.email.toLowerCase().trim(), JSON.stringify(updatedDevs));
                                                      // Force component to re-render inspectedUser state
                                                      setInspectedUser({ ...inspectedUser });
                                                    }}
                                                    className="px-2 py-0.5 text-[9px] font-extrabold text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488] hover:text-white rounded transition-all cursor-pointer"
                                                  >
                                                    {language === "ar" ? "إلغاء القفل / الخروج" : "Reset / Force Logout"}
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>

                      {/* Platform Slogans & Custom Titles */}
                      <form onSubmit={handleSaveAdminProfile} className="space-y-6 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {language === "ar" ? "إعدادات هوية وعناوين المنصة" : "Platform Identity & Metadata"}
                          </h4>
                          <button type="submit" disabled={isSavingAdmin} className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md">
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingAdmin ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ التغييرات" : "Save Settings")}</span>
                          </button>
                        </div>

                        {showAdminSuccess && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg text-center animate-pulse">
                            {language === "ar" ? "تم حفظ جميع تعديلات المنصة بنجاح!" : "All platform modifications saved successfully!"}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "اسم المنصة (عربي)" : "Platform Name (Arabic)"}</label>
                            <input type="text" value={platformTitleAr} onChange={e => setPlatformTitleAr(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "اسم المنصة (إنجليزي)" : "Platform Name (English)"}</label>
                            <input type="text" value={platformTitleEn} onChange={e => setPlatformTitleEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "الشعار النصي (عربي)" : "Slogan (Arabic)"}</label>
                            <input type="text" value={sloganAr} onChange={e => setSloganAr(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "الشعار النصي (إنجليزي)" : "Slogan (English)"}</label>
                            <input type="text" value={sloganEn} onChange={e => setSloganEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "الوصف التعريفي (عربي)" : "Meta Description (Arabic)"}</label>
                            <textarea value={platformDescAr} onChange={e => setPlatformDescAr(e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{language === "ar" ? "الوصف التعريفي (إنجليزي)" : "Meta Description (English)"}</label>
                            <textarea value={platformDescEn} onChange={e => setPlatformDescEn(e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold focus:border-[#0D9488]" />
                          </div>
                        </div>
                      </form>

                      {/* Active System Directors Directory (Admins list) */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {language === "ar" ? "التحكم في قائمة المدراء والأدمن" : "Platform Administrator Accounts"}
                        </h4>
                        <p className="text-xs text-slate-455 leading-relaxed">
                          {language === "ar" 
                            ? "إضافة بريد إلكتروني لمدير جديد لتمكينه من تعديل المحتوى وإضافة الأقسام والتحكم بالملفات." 
                            : "Grant platform administrative access to other users to allow theme modification, subject creation, and metadata editing."}
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={newAdminEmail}
                            onChange={e => setNewAdminEmail(e.target.value)}
                            placeholder="e.g. administrator@medicinety.com"
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-xs text-black dark:text-white px-3 py-2.5 rounded-lg outline-none font-semibold"
                          />
                          <button
                            onClick={handleAddAdmin}
                            className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm transition-all"
                          >
                            {language === "ar" ? "إضافة مدير" : "Add Admin"}
                          </button>
                        </div>

                        <div className="space-y-1.5 border border-slate-200/40 dark:border-teal-500/20 p-3 rounded-lg bg-slate-50/10 dark:bg-black/10">
                          {adminsList.map((adminEmailStr, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-2 px-3 bg-white dark:bg-[#1E1E1E] rounded-md border border-slate-100 dark:border-teal-500/5">
                              <span className="font-bold text-slate-600 dark:text-slate-350">{adminEmailStr}</span>
                              <button
                                onClick={() => handleDeleteAdmin(adminEmailStr)}
                                className="text-red-500 hover:text-red-700 font-bold p-1 transition-all"
                              >
                                {language === "ar" ? "إلغاء الصلاحية" : "Revoke Access"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* System Maintenance Settings */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-teal-500/10">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          {language === "ar" ? "وضع الصيانة والنظام" : "System Mode & Status"}
                        </h4>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#131313] border border-slate-200/50 dark:border-teal-500/20 rounded-xl">
                          <div>
                            <h5 className="text-xs font-bold text-black dark:text-white">{language === "ar" ? "وضع الصيانة المجدولة" : "Scheduled Maintenance Mode"}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{language === "ar" ? "تفعيل هذا الخيار يعرض صفحة صيانة لجميع الطلاب لحين الانتهاء من التحديثات" : "Enabling this option triggers a maintenance block for all students during system updates"}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={maintenanceMode}
                            onChange={e => {
                              setMaintenanceMode(e.target.checked);
                              handleSettingsFieldChange("maintenanceMode", e.target.checked);
                            }}
                            className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]/40 border-slate-300 dark:border-teal-500/20"
                          />
                        </div>
                      </div>

                    </motion.div>
                  );
                })()}

              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/25 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center text-black dark:text-white relative animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-[#0D9488] mb-2 uppercase tracking-wide">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-bold">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-5 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-lg transition-all shadow-md"
              >
                {language === "ar" ? "تأكيد" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 border border-slate-200 dark:border-teal-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151515] text-xs font-bold rounded-lg transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/25 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center text-black dark:text-white relative animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-[#0D9488] mb-2 uppercase tracking-wide">
              {alertModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-bold">
              {alertModal.message}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                className="px-6 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-lg transition-all shadow-md"
              >
                {language === "ar" ? "موافق" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Dialog Modal (Admin renewal choice) */}
      {renewalDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-slate-200/50 dark:border-teal-500/25 rounded-2xl max-w-md w-full p-6 text-left shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-md font-black text-black dark:text-white">
                {language === "ar" ? "تجديد اشتراك الطالب" : "Renew Student Subscription"}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {language === "ar" 
                  ? `تجديد مساق (${renewalDialog.subjectName}) للحساب: ${renewalDialog.studentEmail}`
                  : `Renew subject (${renewalDialog.subjectName}) for: ${renewalDialog.studentEmail}`}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{language === "ar" ? "اختر باقة التجديد" : "Select Renewal Plan"}</label>
                <select
                  value={renewalDialog.selectedTier}
                  onChange={e => setRenewalDialog({ ...renewalDialog, selectedTier: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                >
                  <option value="semester">{language === "ar" ? "4 أشهر (Semester)" : "4 Months"}</option>
                  <option value="yearly">{language === "ar" ? "سنة كاملة (Yearly)" : "Yearly"}</option>
                  <option value="lifetime">{language === "ar" ? "مدى الحياة (Lifetime)" : "Lifetime"}</option>
                  <option value="other">{language === "ar" ? "مدة مخصصة (Custom)" : "Custom Duration"}</option>
                </select>
              </div>

              {renewalDialog.selectedTier === "other" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">{language === "ar" ? "القيمة" : "Value"}</label>
                    <input
                      type="text"
                      value={renewalDialog.customVal === 0 ? "" : renewalDialog.customVal}
                      onChange={e => setRenewalDialog({ ...renewalDialog, customVal: parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0 })}
                      className="w-full bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">{language === "ar" ? "الوحدة" : "Unit"}</label>
                    <select
                      value={renewalDialog.customUnit}
                      onChange={e => setRenewalDialog({ ...renewalDialog, customUnit: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-black border border-slate-200/60 dark:border-teal-500/25 text-xs px-3 py-2.5 rounded-lg outline-none font-semibold"
                    >
                      <option value="seconds">{language === "ar" ? "ثواني" : "Seconds"}</option>
                      <option value="minutes">{language === "ar" ? "دقائق" : "Minutes"}</option>
                      <option value="hours">{language === "ar" ? "ساعات" : "Hours"}</option>
                      <option value="days">{language === "ar" ? "أيام" : "Days"}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setRenewalDialog({ ...renewalDialog, isOpen: false })}
                className="px-4 py-2 border border-slate-200 dark:border-teal-500/20 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151515] rounded-lg transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleAdminApproveRenewal}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md"
              >
                {language === "ar" ? "تأكيد التجديد" : "Confirm Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Admin Subject Analytics & Subscribers Modal */}
      <CourseAnalyticsModal
        courseId={adminCardSelectedCourse?.id || ""}
        courseName={adminCardSelectedCourse?.name || ""}
        isOpen={adminCardAnalyticsOpen}
        onClose={() => setAdminCardAnalyticsOpen(false)}
      />
</div>
  );
}
