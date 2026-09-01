"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Globe,
  ChevronDown,
  Check,
  Edit2,
  Share2,
  Plus,
  Trash2,
  RotateCcw,
  X
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { getLivePlatformData, saveLivePlatformData } from "@/lib/supabase";
import MedicinetyLogo from "@/components/MedicinetyLogo";

interface FooterPhoto {
  id: string;
  url: string;
  alt: string;
}

const DEFAULT_FOOTER_PHOTOS: FooterPhoto[] = [
  { id: "p1", url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=85", alt: "Medical Doctor" },
  { id: "p2", url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=85", alt: "Doctor with Stethoscope" },
  { id: "p3", url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=85", alt: "Clinician Studying" },
  { id: "p4", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85", alt: "Physician Consultation" },
  { id: "p5", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=85", alt: "Medical Lab Scientist" },
  { id: "p6", url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=85", alt: "Doctor Reviewing Charts" },
  { id: "p7", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=85", alt: "Clinical Ward Rounds" },
  { id: "p8", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=85", alt: "Surgeon in Operation Theatre" },
  { id: "p9", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=85", alt: "Medical Research Specialist" },
  { id: "p10", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=85", alt: "Hospital Care Specialist" },
  { id: "p11", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=85", alt: "Medical Center Diagnostics" },
  { id: "p12", url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=85", alt: "Senior Medical Consultant" }
];

interface SocialAppItem {

  id: string;
  platform: string;
  name: string;
  url: string;
  customIconUrl?: string;
  enabled: boolean;
}

interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "col-1",
    title: "MEDICINETY",
    links: [
      { id: "1-1", label: "Basic Sciences", url: "/basic-knowledge" },
      { id: "1-2", label: "Clinical Knowledge", url: "/clinical-knowledge" },
      { id: "1-3", label: "USMLE & Board Prep", url: "/basic-knowledge" },
      { id: "1-4", label: "Medicine Program", url: "/medicine" },
      { id: "1-5", label: "Pricing & Plans", url: "/my-courses" }
    ]
  },
  {
    id: "col-2",
    title: "STUDY TOOLS",
    links: [
      { id: "2-1", label: "High-Yield Lectures", url: "/basic-knowledge" },
      { id: "2-2", label: "Question Bank (QBank)", url: "/basic-knowledge" },
      { id: "2-3", label: "Interactive Flashcards", url: "/basic-knowledge" },
      { id: "2-4", label: "High-Yield Handouts (PDF)", url: "/basic-knowledge" },
      { id: "2-5", label: "Free Sample Courses", url: "/my-courses" }
    ]
  },
  {
    id: "col-3",
    title: "LEGAL",
    links: [
      { id: "3-1", label: "Terms of Service", url: "/terms-and-conditions" },
      { id: "3-2", label: "Privacy Policy", url: "/privacy-policy" },
      { id: "3-3", label: "Refund Policy", url: "/terms-and-conditions" },
      { id: "3-4", label: "Cookie Settings", url: "/settings" },
      { id: "3-5", label: "Honor Code", url: "/terms-and-conditions" }
    ]
  },
  {
    id: "col-4",
    title: "SUPPORT",
    links: [
      { id: "4-1", label: "Help Center & FAQ", url: "/contact" },
      { id: "4-2", label: "Contact Support", url: "/contact" },
      { id: "4-3", label: "How to Use Platform", url: "/how-to-use" },
      { id: "4-4", label: "WhatsApp Support", url: "/contact" }
    ]
  }
];

const FOOTER_TRANSLATIONS_AR: Record<string, string> = {
  "MEDICINETY": "ميديسينيتي",
  "STUDY TOOLS": "أدوات الدراسة",
  "LEGAL": "الشؤون القانونية",
  "SUPPORT": "الدعم والمساعدة",
  "COMPANY": "عن المنصة",
  "RESOURCES": "المصادر التعليمية",
  "Basic Sciences": "العلوم الأساسية",
  "Clinical Knowledge": "العلوم السريرية",
  "USMLE & Board Prep": "تحضير USMLE والبورد",
  "Medicine Program": "برنامج الطب المتكامل",
  "Pricing & Plans": "الخطط والأسعار",
  "High-Yield Lectures": "محاضرات الشرح المكثف",
  "Question Bank (QBank)": "بنك الأسئلة (QBank)",
  "Interactive Flashcards": "بطاقات التكرار المتباعد",
  "High-Yield Handouts (PDF)": "الملخصات الطبية الشاملة",
  "Free Sample Courses": "الكورسات التجريبية المجانية",
  "Terms of Service": "شروط الخدمة",
  "Privacy Policy": "سياسة الخصوصية",
  "Refund Policy": "سياسة الاسترجاع",
  "Cookie Settings": "إعدادات الكوكيز",
  "Honor Code": "ميثاق الأمانة العلمية",
  "Help Center & FAQ": "مركز المساعدة والأسئلة الشائعة",
  "Contact Support": "تواصل مع الدعم الفني",
  "How to Use Platform": "دليل استخدام المنصة",
  "WhatsApp Support": "دعم الواتساب السريع",
  "About Us": "من نحن",
  "For Medical Students": "لطلاب الطب",
  "For Clinicians": "للأطباء والسريريين",
  "For Institutions": "للجامعات والمؤسسات",
  "Platform Tour": "جولة في المنصة",
  "Pricing": "الأسعار",
  "Careers": "الوظائف",
  "Blog": "المدونة الطبية",
  "Terms of Use": "شروط الاستخدام",
  "Terms and Conditions for Clinics": "الشروط والأحكام للعيادات",
  "Privacy Settings": "إعدادات الخصوصية",
  "Legal Notice": "إشعار قانوني",
  "Report illegal content": "الإبلاغ عن محتوى",
  "Accessibility Information": "إمكانية الوصول",
  "Withdraw Subscription": "إلغاء الاشتراك",
  "Help Center": "مركز المساعدة",
  "Advisory Board": "المجلس الاستشاري",
  "Newsroom": "الأخبار الصحفية",
  "Humanitarian Initiative": "المبادرة الإنسانية",
  "Global Health Initiative": "مبادرة الصحة العالمية"
};

const getColumnTitle = (col: any, lang: string) => {
  if (lang === "ar") {
    return col.title_ar || FOOTER_TRANSLATIONS_AR[col.title] || col.title;
  }
  return col.title_en || col.title;
};

const getLinkLabel = (link: any, lang: string) => {
  if (lang === "ar") {
    return link.label_ar || FOOTER_TRANSLATIONS_AR[link.label] || link.label;
  }
  return link.label_en || link.label;
};

export default function Footer() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  // STRICTLY show Footer and Photo Strip on the Home Page ("/") ONLY
  if (pathname !== "/") {
    return null;
  }
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  // Footer Photos Strip Management
  const [footerPhotos, setFooterPhotos] = useState<FooterPhoto[]>(DEFAULT_FOOTER_PHOTOS);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Auto-advance photo carousel by 1 image every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex(prev => (prev + 1) % footerPhotos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [footerPhotos.length]);

  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoAlt, setNewPhotoAlt] = useState("");

  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [showAppManagerModal, setShowAppManagerModal] = useState(false);

  // Dynamic Footer Columns State (Fully Editable & Expandable by Admin)
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(DEFAULT_FOOTER_COLUMNS);

  // Dynamic App & Social Icons List (Add / Remove / Edit by Admin)
  const [socialAppItems, setSocialAppItems] = useState<SocialAppItem[]>([
    { id: "1", platform: "youtube", name: "YouTube", url: "https://youtube.com", enabled: true },
    { id: "2", platform: "facebook", name: "Facebook", url: "https://facebook.com", enabled: true },
    { id: "3", platform: "instagram", name: "Instagram", url: "https://instagram.com", enabled: true },
    { id: "4", platform: "twitter", name: "X (Twitter)", url: "https://x.com", enabled: true },
    { id: "5", platform: "linkedin", name: "LinkedIn", url: "https://linkedin.com", enabled: true },
    { id: "6", platform: "tiktok", name: "TikTok", url: "https://tiktok.com", enabled: true }
  ]);

  // App Store & Google Play settings
  const [appStoreSettings, setAppStoreSettings] = useState({
    showAppStore: true,
    appStoreUrl: "https://apps.apple.com",
    showGooglePlay: true,
    googlePlayUrl: "https://play.google.com"
  });

  // Add new item modal inputs
  const [newItemPlatform, setNewItemPlatform] = useState("youtube");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemCustomIcon, setNewItemCustomIcon] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    const email = localStorage.getItem("medicinety_logged_in_user");
    const isSpecialAdmin = Boolean(email && (email.includes("medicintyplatform") || email.includes("medicinetyplatform"))) || role === "admin";
    setIsAdmin(isSpecialAdmin);

    const savedCols = localStorage.getItem("medicinety_custom_footer_columns");
    if (savedCols) {
      try {
        setFooterColumns(JSON.parse(savedCols));
      } catch (e) {}
    }

    const savedSocialItems = localStorage.getItem("medicinety_social_items_list");
    if (savedSocialItems) {
      try { setSocialAppItems(JSON.parse(savedSocialItems)); } catch (e) {}
    }

        const savedPhotos = localStorage.getItem("medicinety_footer_photos");
    if (savedPhotos) {
      try { setFooterPhotos(JSON.parse(savedPhotos)); } catch (e) {}
    }
    const savedAppSettings = localStorage.getItem("medicinety_app_badges_settings");
    if (savedAppSettings) {
      try { setAppStoreSettings(JSON.parse(savedAppSettings)); } catch (e) {}
    }
  }, []);

  const saveFooterColumns = (newCols: FooterColumn[]) => {
    setFooterColumns(newCols);
    localStorage.setItem("medicinety_custom_footer_columns", JSON.stringify(newCols));
  };

  const saveSocialItems = (newList: SocialAppItem[]) => {
    setSocialAppItems(newList);
    localStorage.setItem("medicinety_social_items_list", JSON.stringify(newList));
  };

  const handleAddNewSocialItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemUrl.trim()) return;

    const platformNames: Record<string, string> = {
      youtube: "YouTube",
      facebook: "Facebook",
      instagram: "Instagram",
      twitter: "X (Twitter)",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      custom: newItemName.trim() || "App"
    };

    const newItem: SocialAppItem = {
      id: Date.now().toString(),
      platform: newItemPlatform,
      name: newItemName.trim() || platformNames[newItemPlatform] || "App",
      url: newItemUrl.trim().startsWith("http") ? newItemUrl.trim() : `https://${newItemUrl.trim()}`,
      customIconUrl: newItemCustomIcon.trim(),
      enabled: true
    };

    const updated = [...socialAppItems, newItem];
    saveSocialItems(updated);

    setNewItemUrl("");
    setNewItemName("");
    setNewItemCustomIcon("");
  };

  const handleDeleteSocialItem = (id: string) => {
    const updated = socialAppItems.filter(item => item.id !== id);
    saveSocialItems(updated);
  };

  const handleToggleSocialItem = (id: string) => {
    const updated = socialAppItems.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    saveSocialItems(updated);
  };

  const handleUpdateItemUrl = (id: string, newUrl: string) => {
    const updated = socialAppItems.map(item => 
      item.id === id ? { ...item, url: newUrl } : item
    );
    saveSocialItems(updated);
  };

  const handleSaveAppSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("medicinety_app_badges_settings", JSON.stringify(appStoreSettings));
    setShowAppManagerModal(false);
  };

  // Helper renderer for SVG Icons with Original Brand Colors
  const renderSocialIcon = (platform: string, customUrl?: string) => {
    if (platform === "custom" && customUrl) {
      return <img src={customUrl} alt="App" className="w-4 h-4 object-contain rounded" />;
    }

    switch (platform) {
      case "youtube":
        return <svg className="w-4 h-4 text-[#FF0000] fill-[#FF0000] drop-shadow-sm" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
      case "facebook":
        return <svg className="w-4 h-4 text-[#1877F2] fill-[#1877F2] drop-shadow-sm" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case "instagram":
        return <svg className="w-4 h-4 text-[#E4405F] fill-[#E4405F] drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
      case "twitter":
        return <svg className="w-3.5 h-3.5 text-black dark:text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
      case "linkedin":
        return <svg className="w-4 h-4 text-[#0A66C2] fill-[#0A66C2] drop-shadow-sm" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
      case "tiktok":
        return <svg className="w-4 h-4 text-black dark:text-white fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.54-1.28 2.53.02.94.52 1.83 1.33 2.3 1.05.62 2.42.53 3.37-.2.71-.56 1.13-1.44 1.12-2.35.03-4.32.01-8.64.02-12.96z"/></svg>;
      case "telegram":
        return <svg className="w-4 h-4 text-[#229ED9] fill-[#229ED9] drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.536-.196 1.006.128.83.921z"/></svg>;
      case "whatsapp":
        return <svg className="w-4 h-4 text-[#25D366] fill-[#25D366] drop-shadow-sm" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
      default:
        return <Globe className="w-4 h-4 text-[#0D9488]" />;
    }
  };

    const saveFooterPhotos = (newPhotos: FooterPhoto[]) => {
    setFooterPhotos(newPhotos);
    localStorage.setItem("medicinety_footer_photos", JSON.stringify(newPhotos));
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const newP: FooterPhoto = {
      id: Date.now().toString(),
      url: newPhotoUrl.trim(),
      alt: newPhotoAlt.trim() || "Medical Photo"
    };

    const updated = [...footerPhotos, newP];
    saveFooterPhotos(updated);
    setNewPhotoUrl("");
    setNewPhotoAlt("");
  };

  const handleDeletePhoto = (id: string) => {
    const updated = footerPhotos.filter(p => p.id !== id);
    saveFooterPhotos(updated);
  };

  const activeIcons = socialAppItems.filter(item => item.enabled);

  return (
    <footer dir="ltr" className="w-full bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-teal-500/20 text-slate-700 dark:text-slate-300 transition-colors duration-300 select-none">
      
      {/* 1. Dynamic Medical Students & Doctors Photo Strip Banner */}
      <div className="w-full relative overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-teal-500/20 group/strip">
        
        {/* Admin Edit Button Floating Badge */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-30 opacity-90 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <span>📷</span>
              <span>{language === "ar" ? "إدارة وتعديل صور الشريط" : "Manage Photo Strip"}</span>
            </button>
          </div>
        )}

        {/* Pure Clean Cyclic Auto-Slider: Exactly 4 on Desktop, 1 on Mobile, Advances every 3s, No Badges */}
        <div className="w-full h-72 sm:h-80 md:h-96 overflow-hidden relative bg-slate-950 select-none">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{
              transform: `translateX(-${photoIndex * (typeof window !== "undefined" && window.innerWidth < 640 ? 100 : 25)}%)`
            }}
          >
            {footerPhotos.concat(footerPhotos.slice(0, 4)).map((photo, pidx) => (
              <div 
                key={`${photo.id}-${pidx}`} 
                className="w-[100vw] sm:w-[50vw] md:w-[25vw] h-full shrink-0 relative overflow-hidden border-r border-slate-900/60 bg-slate-950"
              >
                <img 
                  src={photo.url} 
                  alt="" 
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Grid (Exact 5-Column Layout) */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14 relative">
        
        {/* Admin Action Controls */}
        {isAdmin && (
          <div className="flex flex-wrap justify-end gap-3 pb-6 border-b border-slate-100 dark:border-teal-500/10 mb-8">
            <button
              onClick={() => setShowAppManagerModal(true)}
              className="px-3.5 py-1.5 bg-[#00A3FF] hover:bg-[#0092E6] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "إدارة أيقونات التواصل والتطبيقات" : "Manage App & Social Icons"}</span>
            </button>
            <button
              onClick={() => setShowLinkEditor(true)}
              className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "تعديل أعمدة وروابط القوائم كأدمن" : "Edit Footer Columns & Links"}</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          
          {/* Dynamic Render of Columns 1 to 4 */}
          {footerColumns.map((col) => (
            <div key={col.id} className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {getColumnTitle(col, language)}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                {col.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.url} className="hover:text-[#0D9488] transition-colors">
                      {getLinkLabel(link, language)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Col 5: SOCIAL MEDIA PAGES & APP DOWNLOADS (Exact AMBOSS Match) */}
          <div className="space-y-6">
            
            {/* Social Icons Row */}
            {activeIcons.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3.5 text-slate-800 dark:text-slate-100">
                  {activeIcons.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform p-1 cursor-pointer"
                      title={item.name}
                    >
                      {renderSocialIcon(item.platform, item.customIconUrl)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Official App Store & Google Play Badges (Side-by-Side Horizontal Row) */}
            {(appStoreSettings.showAppStore || appStoreSettings.showGooglePlay) && (
              <div className="space-y-2.5">
                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {language === "ar" ? "حمل التطبيق" : "DOWNLOAD OUR APP"}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Official App Store Button */}
                  {appStoreSettings.showAppStore && (
                    <a
                      href={appStoreSettings.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-neutral-900 transition-all border border-neutral-800 shadow-sm group cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-92.1zM238.9 101c27.4-33.3 24.3-64.6 23.3-75-23.7 1.4-53 16.4-68.9 34.9-15.6 18.2-25.2 45.4-22.3 74.3 26.5 2.1 52.8-14.7 67.9-34.2z"/></svg>
                      <div>
                        <div className="text-[7.5px] uppercase tracking-wider text-slate-300 font-semibold leading-none">Download on the</div>
                        <div className="text-[11px] font-black leading-tight text-white tracking-tight">App Store</div>
                      </div>
                    </a>
                  )}

                  {/* Official Google Play Button */}
                  {appStoreSettings.showGooglePlay && (
                    <a
                      href={appStoreSettings.googlePlayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-neutral-900 transition-all border border-neutral-800 shadow-sm group cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512">
                        <path fill="#00D2FF" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/>
                        <path fill="#00F076" d="M104.6 499l220.7-221.3 60.1 60.1L104.6 499z"/>
                        <path fill="#FF3A44" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                        <path fill="#FFC000" d="M425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/>
                      </svg>
                      <div>
                        <div className="text-[7px] uppercase tracking-wider text-slate-300 font-semibold leading-none">GET IT ON</div>
                        <div className="text-[11px] font-black leading-tight text-white tracking-tight">Google Play</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-teal-500/20 py-6 px-6 lg:px-12 bg-white dark:bg-[#121212]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: AMBOSS Style Logo + Brand Name + Copyright Line */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
              <MedicinetyLogo 
                size={38} 
                color="#0D9488"
                className="w-9 h-6 transition-transform group-hover:scale-105"
              />
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#00828A] transition-colors">
                MEDICINETY
              </span>
            </Link>
            
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal pl-2">
              © 2026 MEDICINETY. All rights reserved.
            </span>
          </div>

          {/* Right: AMBOSS Style Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 border border-slate-200 dark:border-teal-500/20 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1A] text-xs font-extrabold text-slate-900 dark:text-white shadow-sm hover:border-[#0D9488] transition-all cursor-pointer select-none"
            >
              <Globe className="w-4 h-4 text-[#0D9488]" />
              <span>{language === "ar" ? "AR / العربية" : "INT / English"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu Popup */}
            {showLangMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/30 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 select-none">
                <button
                  onClick={() => {
                    if (setLanguage) setLanguage("en");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                    language === "en" ? "bg-[#0D9488]/10 text-[#0D9488]" : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>INT / English</span>
                  {language === "en" && <Check className="w-3.5 h-3.5 text-[#0D9488]" />}
                </button>

                <button
                  onClick={() => {
                    if (setLanguage) setLanguage("ar");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                    language === "ar" ? "bg-[#0D9488]/10 text-[#0D9488]" : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>AR / العربية</span>
                  {language === "ar" && <Check className="w-3.5 h-3.5 text-[#0D9488]" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Admin App & Social Icons Manager Modal Window */}
      {showAppManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/10 pb-4">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#00A3FF]" />
                <span>{language === "ar" ? "إدارة وحذف وإضافة أيقونات التطبيقات والصفحات" : "Manage App & Social Icons"}</span>
              </h3>
              <button 
                onClick={() => setShowAppManagerModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current App / Social Icons List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-[#0D9488] tracking-wider">
                {language === "ar" ? "الأيقونات الحالية (يمكنك حذف أي أيقونة أو تعديل رابطها):" : "Current Icons (Delete or Edit Links):"}
              </h4>

              <div className="space-y-2.5">
                {socialAppItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0">
                        {renderSocialIcon(item.platform, item.customIconUrl)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-black dark:text-white">{item.name}</span>
                          {!item.enabled && (
                            <span className="text-[9px] bg-slate-200 dark:bg-zinc-800 text-slate-500 px-1.5 py-0.5 rounded font-bold">Hidden</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleUpdateItemUrl(item.id, e.target.value)}
                          placeholder="https://..."
                          className="text-[11px] text-slate-600 dark:text-slate-300 bg-transparent border-b border-dashed border-slate-300 dark:border-zinc-700 outline-none w-full mt-0.5 focus:border-[#00A3FF]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSocialItem(item.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          item.enabled 
                            ? "bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100" 
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-400 hover:text-slate-600"
                        }`}
                        title={item.enabled ? "Hide Icon" : "Show Icon"}
                      >
                        {item.enabled ? "إخفاء" : "إظهار"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSocialItem(item.id)}
                        className="p-2 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all"
                        title="Delete Icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New App / Social Icon Form */}
            <form onSubmit={handleAddNewSocialItem} className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-500/20 space-y-3">
              <h4 className="text-xs font-black uppercase text-[#0D9488] tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{language === "ar" ? "إضافة أيقونة تطبيق أو صفحة جديدة:" : "Add New App / Platform Icon:"}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "ar" ? "نوع التطبيق / المنصة:" : "Platform Type:"}
                  </label>
                  <select
                    value={newItemPlatform}
                    onChange={(e) => setNewItemPlatform(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-teal-500/20 rounded-xl text-black dark:text-white outline-none focus:border-[#00A3FF]"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="custom">{language === "ar" ? "تطبيق مخصص / آخر" : "Custom App / Other"}</option>
                  </select>
                </div>

                {newItemPlatform === "custom" && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === "ar" ? "اسم التطبيق:" : "App Name:"}
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Threads / Discord"
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-teal-500/20 rounded-xl text-black dark:text-white outline-none focus:border-[#00A3FF]"
                    />
                  </div>
                )}

                <div className={newItemPlatform === "custom" ? "sm:col-span-2" : ""}>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "ar" ? "رابط الصفحة / الحساب (URL):" : "Destination Link URL:"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-teal-500/20 rounded-xl text-black dark:text-white outline-none focus:border-[#00A3FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A3FF] hover:bg-[#0092E6] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "ar" ? "إضافة الأيقونة" : "Add Icon"}</span>
                </button>
              </div>
            </form>

            {/* App Store & Google Play Settings */}
            <form onSubmit={handleSaveAppSettings} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-teal-500/20 space-y-3 text-xs">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-1.5">
                <span>📱</span>
                <span>{language === "ar" ? "أزرار تحميل التطبيقات (App Store & Google Play):" : "Store Badges (App Store & Google Play):"}</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={appStoreSettings.showAppStore}
                      onChange={(e) => setAppStoreSettings({...appStoreSettings, showAppStore: e.target.checked})}
                      className="accent-[#00A3FF] w-4 h-4 rounded"
                    />
                    <span>{language === "ar" ? "إظهار زر App Store" : "Show App Store Button"}</span>
                  </label>
                  {appStoreSettings.showAppStore && (
                    <input
                      type="text"
                      value={appStoreSettings.appStoreUrl}
                      onChange={(e) => setAppStoreSettings({...appStoreSettings, appStoreUrl: e.target.value})}
                      placeholder="https://apps.apple.com/..."
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-black dark:text-white"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={appStoreSettings.showGooglePlay}
                      onChange={(e) => setAppStoreSettings({...appStoreSettings, showGooglePlay: e.target.checked})}
                      className="accent-[#00A3FF] w-4 h-4 rounded"
                    />
                    <span>{language === "ar" ? "إظهار زر Google Play" : "Show Google Play Button"}</span>
                  </label>
                  {appStoreSettings.showGooglePlay && (
                    <input
                      type="text"
                      value={appStoreSettings.googlePlayUrl}
                      onChange={(e) => setAppStoreSettings({...appStoreSettings, googlePlayUrl: e.target.value})}
                      placeholder="https://play.google.com/..."
                      className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-black dark:text-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-teal-500/10">
                <button
                  type="button"
                  onClick={() => setShowAppManagerModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white"
                >
                  {language === "ar" ? "إغلاق" : "Close"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Admin Footer Columns & Links Editor Modal Window */}
      {showLinkEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-5xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-6 max-h-[88vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-base font-black text-black dark:text-white">
                  {language === "ar" ? "تعديل أعمدة وروابط الفوتر الأربعة" : "Edit Footer Columns & Links"}
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveFooterColumns(DEFAULT_FOOTER_COLUMNS)}
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 rounded-xl hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === "ar" ? "الافتراضي" : "Reset Defaults"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkEditor(false)}
                  className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Columns Grid Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {footerColumns.map((col, cIdx) => (
                <div key={col.id} className="p-5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-4">
                  
                  {/* Column Title Input */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                      {language === "ar" ? `عنوان العمود ${cIdx + 1}:` : `Column ${cIdx + 1} Title:`}
                    </label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const updated = [...footerColumns];
                        updated[cIdx].title = e.target.value;
                        saveFooterColumns(updated);
                      }}
                      className="w-full p-2.5 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-black text-black dark:text-white outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  {/* Links in this Column */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-[#0D9488]">
                      {language === "ar" ? "الروابط (الاسم والرابط):" : "Links in this Column:"}
                    </label>
                    
                    {col.links.map((link, lIdx) => (
                      <div key={link.id || lIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <input
                          type="text"
                          value={link.label}
                          placeholder="Link Name"
                          onChange={(e) => {
                            const updated = [...footerColumns];
                            updated[cIdx].links[lIdx].label = e.target.value;
                            saveFooterColumns(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-xs font-bold text-black dark:text-white outline-none focus:border-[#0D9488]"
                        />
                        <input
                          type="text"
                          value={link.url}
                          placeholder="/path or https://..."
                          onChange={(e) => {
                            const updated = [...footerColumns];
                            updated[cIdx].links[lIdx].url = e.target.value;
                            saveFooterColumns(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-[#0D9488]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...footerColumns];
                            updated[cIdx].links = updated[cIdx].links.filter((_, i) => i !== lIdx);
                            saveFooterColumns(updated);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all shrink-0 cursor-pointer"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add New Link to this column */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...footerColumns];
                        updated[cIdx].links.push({
                          id: Date.now().toString(),
                          label: "New Link",
                          url: "/"
                        });
                        saveFooterColumns(updated);
                      }}
                      className="w-full py-2 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100 text-xs font-bold rounded-xl border border-teal-500/20 flex items-center justify-center gap-1 transition-all cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === "ar" ? "إضافة رابط جديد لهذا العمود" : "Add Link to Column"}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowLinkEditor(false)}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                {language === "ar" ? "حفظ التعديلات وإغلاق" : "Save & Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Photo Strip Manager Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in text-left">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📷</span>
                <h3 className="text-base font-black text-black dark:text-white">
                  {language === "ar" ? "إدارة صور الشريط السفلي (Photo Strip Manager)" : "Manage Footer Photo Strip"}
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Photo Form */}
            <form onSubmit={handleAddPhoto} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-black text-[#0D9488] uppercase tracking-wider">
                {language === "ar" ? "+ إضافة صورة جديدة للشريط" : "+ Add New Photo to Strip"}
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder={language === "ar" ? "ضع رابط الصورة هنا (مثال: https://... أو /images/photo.jpg)" : "Paste Image URL or Path here (https://...)"}
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-medium text-black dark:text-white outline-none focus:border-[#0D9488]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer shrink-0"
                >
                  {language === "ar" ? "إضافة الصورة" : "Add Photo"}
                </button>
              </div>
            </form>

            {/* Current Photos Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {language === "ar" ? `الصور الحالية (${footerPhotos.length}):` : `Current Photos (${footerPhotos.length}):`}
                </h4>
                <button
                  type="button"
                  onClick={() => saveFooterPhotos(DEFAULT_FOOTER_PHOTOS)}
                  className="text-[10px] font-bold text-slate-400 hover:text-[#0D9488] underline cursor-pointer"
                >
                  {language === "ar" ? "استعادة الصور الافتراضية" : "Reset to Defaults"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {footerPhotos.map((photo, idx) => (
                  <div key={photo.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 aspect-[4/3]">
                    <img 
                      src={photo.url} 
                      alt={photo.alt} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-all cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl cursor-pointer"
              >
                {language === "ar" ? "تم وإغلاق" : "Done"}
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}
