"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ChevronDown, 
  Search, 
  Settings, 
  Sparkles, 
  LogOut, 
  Edit2, 
  Plus, 
  Trash2, 
  RotateCcw,
  Inbox,
  Eye,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { getLivePlatformData, saveLivePlatformData } from "@/lib/supabase";
import MedicinetyLogo from "@/components/MedicinetyLogo";
import AdminOrdersModal from "@/components/AdminOrdersModal";

interface HeaderNavLink {
  id: string;
  name_en: string;
  name_ar: string;
  href: string;
  hasDropdown?: boolean;
  isSpecial?: boolean;
}

const DEFAULT_HEADER_LINKS: HeaderNavLink[] = [
  { id: "basic-sciences", name_en: "Basic Sciences", name_ar: "العلوم الأساسية", href: "/basic-knowledge", hasDropdown: false },
  { id: "free-courses", name_en: "Free Courses", name_ar: "كورسات مجانية", href: "/free-courses", hasDropdown: false, isSpecial: true },
  { id: "qbank", name_en: "Question Banks", name_ar: "بنوك الأسئلة", href: "/qbank", hasDropdown: false },
  { id: "my-courses", name_en: "My Courses", name_ar: "كورساتي", href: "/my-courses", hasDropdown: false }
];

export default function Sidebar() {
  const pathname = usePathname();

  // Hide global navigation header completely inside exam mode
  if (pathname?.includes("/exam")) {
    return null;
  }
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchCatalog, setSearchCatalog] = useState<any[]>([]);
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("Doctor");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Dynamic Header Nav Links state & Quick Editor state
  const [headerNavLinks, setHeaderNavLinks] = useState<HeaderNavLink[]>(DEFAULT_HEADER_LINKS);
  const [showHeaderNavEditor, setShowHeaderNavEditor] = useState(false);
  const [editingNavLinks, setEditingNavLinks] = useState<HeaderNavLink[]>(DEFAULT_HEADER_LINKS);

  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const updateOrdersBadge = () => {
    try {
      const saved = localStorage.getItem("medicinety_order_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        const pending = parsed.filter((o: any) => o.status !== "completed").length;
        setPendingOrdersCount(pending);
      } else {
        setPendingOrdersCount(0);
      }
    } catch (e) {
      setPendingOrdersCount(0);
    }
  };

  const loadSavedNavLinks = () => {
    getLivePlatformData("medicinety_header_nav_links", DEFAULT_HEADER_LINKS).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setHeaderNavLinks(data);
        setEditingNavLinks(data);
      }
    });
  };

  useEffect(() => {
    loadSavedNavLinks();
    updateOrdersBadge();

    window.addEventListener("medicinety_orders_updated", updateOrdersBadge);
    window.addEventListener("storage", updateOrdersBadge);
    window.addEventListener("medicinety_header_nav_updated", loadSavedNavLinks);

    return () => {
      window.removeEventListener("medicinety_orders_updated", updateOrdersBadge);
      window.removeEventListener("storage", updateOrdersBadge);
      window.removeEventListener("medicinety_header_nav_updated", loadSavedNavLinks);
    };
  }, []);

  const saveNavLinks = (newLinks: HeaderNavLink[]) => {
    setHeaderNavLinks(newLinks);
    saveLivePlatformData("medicinety_header_nav_links", newLinks);
    window.dispatchEvent(new Event("medicinety_header_nav_updated"));
  };

  const handleAddLinkInEditor = () => {
    const newId = `nav_${Date.now()}`;
    const newLink: HeaderNavLink = {
      id: newId,
      name_en: "New Page",
      name_ar: "صفحة جديدة",
      href: "/",
      hasDropdown: false,
      isSpecial: false
    };
    setEditingNavLinks([...editingNavLinks, newLink]);
  };

  const handleUpdateLinkInEditor = (id: string, field: keyof HeaderNavLink, value: any) => {
    setEditingNavLinks(editingNavLinks.map(link => {
      if (link.id === id) {
        return { ...link, [field]: value };
      }
      return link;
    }));
  };

  const handleDeleteLinkInEditor = (id: string) => {
    setEditingNavLinks(editingNavLinks.filter(link => link.id !== id));
  };

  const handleResetDefaultNavLinks = () => {
    setEditingNavLinks(DEFAULT_HEADER_LINKS);
    saveNavLinks(DEFAULT_HEADER_LINKS);
    setShowHeaderNavEditor(false);
  };

  const handleSaveEditorChanges = () => {
    saveNavLinks(editingNavLinks);
    setShowHeaderNavEditor(false);
  };

  const getHeaderLinkLabel = (link: HeaderNavLink, lang: string) => {
    if (lang === "ar") {
      return link.name_ar || link.name_en;
    }
    return link.name_en || link.name_ar;
  };

  const updateAuthState = () => {
    const logged = localStorage.getItem("medicinety_logged_in_user");
    const role = localStorage.getItem("medicinety_user_role");
    const customName = localStorage.getItem("medicinety_user_display_name");
    
    setUserEmail(logged);
    setUserRole(role);

    if (customName) {
      setProfileName(customName.trim().split(" ")[0]);
    } else if (logged) {
      // Extract only clean first name (e.g. Abdalrahman)
      let rawName = logged.split("@")[0].replace(/[._-]/g, " ");
      if (rawName.toLowerCase().startsWith("abdalrahman")) {
        rawName = "Abdalrahman";
      } else {
        rawName = rawName.split(" ")[0];
      }
      const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      setProfileName(capitalized || (role === "admin" ? "Admin" : "Doctor"));
    } else {
      setProfileName("Doctor");
    }
  };

  useEffect(() => {
    updateAuthState();
    window.addEventListener("medicinety_auth_change", updateAuthState);
    return () => window.removeEventListener("medicinety_auth_change", updateAuthState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build unified search catalog
  useEffect(() => {
    let gp: any[] = [];
    let sys: any[] = [];
    let clin: any[] = [];
    try {
      const s1 = localStorage.getItem("medicinety_general_principles_list");
      if (s1) gp = JSON.parse(s1);
      const s2 = localStorage.getItem("medicinety_systems_list");
      if (s2) sys = JSON.parse(s2);
      const s3 = localStorage.getItem("medicinety_clinical_list");
      if (s3) clin = JSON.parse(s3);
    } catch(e) {}

    const combined = [...gp, ...sys, ...clin].map(item => ({
      id: item.id,
      name_en: item.name_en || item.name || "",
      name_ar: item.name_ar || item.name || ""
    }));

    setSearchCatalog(combined);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();
    const filtered = searchCatalog.filter(item => 
      item.name_en.toLowerCase().includes(q) || item.name_ar.includes(q)
    );
    setSearchResults(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("medicinety_logged_in_user");
    localStorage.removeItem("medicinety_user_role");
    localStorage.removeItem("medicinety_user_avatar");
    localStorage.removeItem("medicinety_user_display_name");
    window.dispatchEvent(new Event("medicinety_auth_change"));
    router.push("/auth");
  };

  const [isPreviewAsStudent, setIsPreviewAsStudent] = useState(false);

  useEffect(() => {
    const isPrev = localStorage.getItem("medicinety_preview_as_student") === "true";
    setIsPreviewAsStudent(isPrev);

    const handleRoleChange = () => {
      const updatedPrev = localStorage.getItem("medicinety_preview_as_student") === "true";
      setIsPreviewAsStudent(updatedPrev);
      const role = localStorage.getItem("medicinety_user_role");
      setUserRole(role);
    };

    window.addEventListener("medicinety_role_change", handleRoleChange);
    return () => window.removeEventListener("medicinety_role_change", handleRoleChange);
  }, []);

  const toggleStudentPreview = (enableStudentView: boolean) => {
    if (enableStudentView) {
      localStorage.setItem("medicinety_preview_as_student", "true");
      setIsPreviewAsStudent(true);
    } else {
      localStorage.removeItem("medicinety_preview_as_student");
      setIsPreviewAsStudent(false);
    }
    window.dispatchEvent(new Event("medicinety_role_change"));
    window.dispatchEvent(new Event("storage"));
    setShowProfileMenu(false);
    // Refresh page to guarantee immediate clean state
    window.location.reload();
  };

  const isRealAdmin = userRole === "admin";
  const isAdmin = isRealAdmin && !isPreviewAsStudent;

  return (
    <>
      {/* Top Header Navigation Bar */}
      <header dir="ltr" className="sticky top-0 left-0 right-0 z-[9999] w-full bg-white dark:bg-[#121212] text-slate-900 dark:text-white border-b border-slate-200 dark:border-teal-500/20 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-300 select-none">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 overflow-visible relative">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <MedicinetyLogo 
                size={46} 
                color="#0D9488"
                className="w-11 h-7.5 transition-transform group-hover:scale-105" 
              />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                MEDICINETY
              </span>
            </Link>
          </div>

          {/* Center: Dynamic Navigation Links with Unified Height & Smooth Horizontal Scroll */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-xl mx-2 overflow-x-auto no-scrollbar scroll-smooth">
            <nav className="flex items-center gap-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
              {headerNavLinks.map((link) => {
                const label = getHeaderLinkLabel(link, language);
                if (link.isSpecial) {
                  return (
                    <Link 
                      key={link.id}
                      href={link.href} 
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 font-bold transition-all shrink-0 select-none text-xs"
                    >
                      <span>{label}</span>
                    </Link>
                  );
                }

                return (
                  <Link 
                    key={link.id}
                    href={link.href} 
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#0D9488] dark:hover:text-teal-300 hover: dark:hover:bg-zinc-800/40 font-bold transition-all shrink-0 select-none text-xs"
                  >
                    <span>{label}</span>
                    {link.hasDropdown && <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, My Courses, Profile & Admin Orders on Far Right Edge */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Compact Search Input */}
            <div className="relative flex items-center">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={language === "ar" ? "بحث عن موضوع..." : "Search course, topic..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="pl-7 pr-2.5 py-1.5 w-28 sm:w-36 md:w-44 focus:w-52 bg-slate-100 dark:bg-zinc-800/70 text-slate-900 dark:text-white placeholder-slate-400 rounded-full text-[11px] font-semibold outline-none focus:bg-slate-200/60 dark:focus:bg-zinc-700 transition-all border-none"
                />
              </div>

              {/* Search Dropdown Results */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/30 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onMouseDown={() => {
                        router.push(`/subject/${item.id}`);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:0/10 text-xs font-bold text-black dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-teal-500/10 transition-colors cursor-pointer"
                    >
                      <span>{language === "ar" ? item.name_ar : item.name_en}</span>
                      <span className="text-[9px] text-[#00828A] font-mono">🔍</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth / Profile Area */}
            {userEmail ? (
              <div className="relative flex items-center gap-2" ref={popoverRef}>


                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-full bg-[#00828A] text-white font-black text-[11px] flex items-center justify-center shadow-xs uppercase select-none shrink-0 ring-1 ring-teal-500/30">
                    {profileName ? profileName.trim().charAt(0) : "A"}
                  </div>

                  <div className="flex flex-col text-left rtl:text-right leading-tight min-w-0">
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
                      {profileName ? (profileName.toLowerCase().startsWith("abdalrahman") ? "Abdalrahman" : profileName.trim().split(" ")[0]) : "Doctor"}
                    </span>
                    <span className="text-[9px] text-[#0D9488] dark:text-teal-400 font-black tracking-tight">
                      {userRole === "admin" 
                        ? (language === "ar" ? "مدير المنصة" : "Admin User") 
                        : (language === "ar" ? "طالب طب" : "Medical Student")}
                    </span>
                  </div>

                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Popover Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-slate-200 dark:border-teal-500/30 p-2 z-[99999] text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                      <div className="font-bold text-black dark:text-white truncate">{profileName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                      {userRole === "admin" && (
                        <div className="text-[9px] font-black text-[#00828A] uppercase tracking-wider mt-0.5">Admin User</div>
                      )}
                    </div>
                    {isRealAdmin && (
                      <>
                        <button
                          onClick={() => toggleStudentPreview(!isPreviewAsStudent)}
                          className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between cursor-pointer border transition-all ${
                            isPreviewAsStudent 
                              ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                              : " dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100 border-teal-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isPreviewAsStudent ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-[#0D9488]" />}
                            <span className="text-xs">
                              {isPreviewAsStudent 
                                ? (language === "ar" ? "العودة لوضع الإدارة 🛠️" : "Exit to Admin Mode 🛠️") 
                                : (language === "ar" ? "معاينة كطالب (واجهة المستخدم) 👁️" : "Switch to Student View 👁️")}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                            isPreviewAsStudent ? "bg-black/30 text-white" : "bg-[#0D9488] text-white"
                          }`}>
                            {isPreviewAsStudent ? (language === "ar" ? "مفعل" : "ACTIVE") : (language === "ar" ? "تفعيل" : "SWITCH")}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowHeaderNavEditor(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-[#0D9488] hover: dark:hover:bg-teal-950/30 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{language === "ar" ? "تعديل روابط الهيدر" : "Edit Header Links"}</span>
                        </button>
                      </>
                    )}
                    <Link
                      href="/my-courses"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl /70 dark:bg-teal-950/30 text-[#0D9488] dark:text-teal-300 hover:bg-teal-100/80 font-black text-xs transition-all cursor-pointer border border-teal-500/20"
                    >
                      <Sparkles className="w-4 h-4 text-[#0D9488]" />
                      <span>{language === "ar" ? "كورساتي وموادي الدراسية" : "My Courses"}</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover: dark:hover:bg-zinc-800 font-medium cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === "ar" ? "الإعدادات" : "Settings"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === "ar" ? "تسجيل الخروج" : "Log Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth"
                  className="px-4 py-1.5 text-xs font-bold border border-slate-300 dark:border-zinc-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  {language === "ar" ? "تسجيل الدخول" : "Log in"}
                </Link>

                <Link
                  href="/auth"
                  className="px-4 py-1.5 text-xs font-bold bg-[#00828A] hover:bg-[#006e75] text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {language === "ar" ? "تجربة مجانية" : "Free trial"}
                </Link>
              </div>
            )}

            {/* Admin Controls Placed on the Far Right Edge */}
            {isAdmin && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setShowOrdersModal(true)}
                  className="h-9 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl border border-amber-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm relative shrink-0 select-none"
                  title={language === "ar" ? "عرض طلبات الاشتراكات والتفعيل" : "View Order Requests"}
                >
                  <Inbox className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px]">{language === "ar" ? "الطلبات" : "Orders"}</span>
                  {pendingOrdersCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full shadow-sm animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowHeaderNavEditor(true)}
                  className="h-9 px-2.5  dark:bg-teal-950/40 text-[#0D9488] hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-xl border border-teal-500/20 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 select-none"
                  title={language === "ar" ? "تعديل قائمة الصفحات العلوية" : "Edit Top Navigation Links"}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{language === "ar" ? "تعديل القائمة" : "Edit Nav"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Student Preview Mode Bar */}
      {isRealAdmin && isPreviewAsStudent && (
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg sticky top-16 z-40 animate-fade-in border-b border-teal-500/30">
          <div className="flex items-center gap-2 max-w-[1440px] mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-300 animate-pulse" />
              <span>
                {language === "ar" 
                  ? "👁️ أنت تشاهد الموقع الآن كـ (واجهة مستخدم / طالب) - تم إخفاء أدوات التعديل." 
                  : "👁️ Student View Mode Active - Admin editing tools hidden."}
              </span>
            </div>
            <button
              onClick={() => toggleStudentPreview(false)}
              className="px-3 py-1 bg-white text-[#0D9488] hover: rounded-lg text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "العودة للوحة الإدارة 🛠️" : "Exit to Admin Mode 🛠️"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header Link Quick Editor Modal */}
      {showHeaderNavEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-fade-in text-left rtl:text-right">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0D9488]" />
                <span>{language === "ar" ? "تعديل قائمة الصفحات العلوية (Header Nav)" : "Edit Top Header Navigation Links"}</span>
              </h3>
              
              <button 
                onClick={handleResetDefaultNavLinks}
                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === "ar" ? "استعادة الافتراضي" : "Reset Default"}</span>
              </button>
            </div>

            <div className="space-y-3">
              {editingNavLinks.map((link, idx) => (
                <div key={link.id || idx} className="p-4  dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">الاسم بالعربية:</label>
                      <input 
                        type="text" 
                        value={link.name_ar || ""} 
                        onChange={(e) => handleUpdateLinkInEditor(link.id, "name_ar", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold text-black dark:text-white outline-none focus:border-[#0D9488]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">English Label:</label>
                      <input 
                        type="text" 
                        value={link.name_en || ""} 
                        onChange={(e) => handleUpdateLinkInEditor(link.id, "name_en", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold text-black dark:text-white outline-none focus:border-[#0D9488]" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-400 mb-1">الرابط / Path:</label>
                        <input 
                          type="text" 
                          value={link.href || ""} 
                          onChange={(e) => handleUpdateLinkInEditor(link.id, "href", e.target.value)}
                          className="w-full p-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-[#0D9488]" 
                        />
                      </div>
                      <button 
                        onClick={() => handleDeleteLinkInEditor(link.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg mt-4 cursor-pointer"
                        title="حذف هذا الرابط"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!link.isSpecial} 
                        onChange={(e) => handleUpdateLinkInEditor(link.id, "isSpecial", e.target.checked)}
                        className="w-3.5 h-3.5 text-purple-600 rounded" 
                      />
                      <span>{language === "ar" ? "تمييز بلون بنفسجي (AI Feature Style)" : "Purple Highlight Style"}</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!link.hasDropdown} 
                        onChange={(e) => handleUpdateLinkInEditor(link.id, "hasDropdown", e.target.checked)}
                        className="w-3.5 h-3.5 text-[#0D9488] rounded" 
                      />
                      <span>{language === "ar" ? "إظهار سهم منسدل (v)" : "Show Chevron (v)"}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddLinkInEditor}
              className="w-full py-2.5  dark:bg-teal-950/30 hover:bg-teal-100 text-[#0D9488] dark:text-teal-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border border-dashed border-teal-500/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "ar" ? "إضافة رابط جديد إلى القائمة" : "Add New Header Link"}</span>
            </button>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button 
                onClick={() => setShowHeaderNavEditor(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleSaveEditorChanges}
                className="px-6 py-2 bg-[#0D9488] hover:bg-[#0A7268] text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                {language === "ar" ? "حفظ التعديلات وإغلاق" : "Save & Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Orders & Activation Requests Modal */}
      <AdminOrdersModal isOpen={showOrdersModal} onClose={() => setShowOrdersModal(false)} />
    </>
  );
}
