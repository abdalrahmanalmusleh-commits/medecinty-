"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function SecurityGuard() {
  const { language } = useLanguage();
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isTabBlurred, setIsTabBlurred] = useState(false);

  useEffect(() => {
    // Apply user-select none dynamically if not admin
    const role = localStorage.getItem("medicinety_user_role");
    if (role !== "admin") {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    }

    // 1. Prevent Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click for admins so they can inspect if they need to
      const role = localStorage.getItem("medicinety_user_role");
      if (role === "admin") return;

      e.preventDefault();
      triggerWarning(
        language === "ar" 
          ? "النقر بزر الفأرة الأيمن معطل لحماية المحتوى والملكيات الفكرية." 
          : "Right-click is disabled to protect platform intellectual property."
      );
    };

    // 2. Prevent Common DevTools and Capture Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const role = localStorage.getItem("medicinety_user_role");
      if (role === "admin") return;

      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        triggerWarning(language === "ar" ? "أدوات المطورين معطلة أمنياً." : "Developer tools are blocked for security.");
        return;
      }

      // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        triggerWarning(language === "ar" ? "محاولة فحص عناصر الصفحة معطلة." : "Inspect element shortcut is disabled.");
        return;
      }

      // Cmd+Opt+I (macOS DevTools)
      if (e.metaKey && e.altKey && e.keyCode === 73) {
        e.preventDefault();
        triggerWarning(language === "ar" ? "أدوات فحص الصفحة على الماك معطلة." : "macOS DevTools shortcut is disabled.");
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        triggerWarning(language === "ar" ? "عرض الكود المصدري للصفحة معطل." : "Viewing page source code is disabled.");
        return;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        triggerWarning(language === "ar" ? "حفظ ملفات الصفحة محظور أمنياً." : "Saving pages offline is restricted.");
        return;
      }
    };

    // 3. Block Text Copying Event
    const handleCopy = (e: ClipboardEvent) => {
      const role = localStorage.getItem("medicinety_user_role");
      if (role === "admin") return;

      e.preventDefault();
      triggerWarning(
        language === "ar"
          ? "نسخ النصوص والملفات محمي بموجب حقوق الطبع والنشر الرسمية للمنصة."
          : "Copying text is prohibited under Medicinety's global copyright terms."
      );
    };

    // 4. Tab Blur Detection (Anti-Background screen capture and recording)
    const handleBlur = () => {
      const role = localStorage.getItem("medicinety_user_role");
      if (role === "admin") return;
      setIsTabBlurred(true);
    };

    const handleFocus = () => {
      setIsTabBlurred(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [language]);

  const triggerWarning = (msg: string) => {
    setWarningMessage(msg);
    setShowWarning(true);
    // Auto-hide warning after 4 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 4000);
  };

  return (
    <>
      {/* Visual Centered Security Alert Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowWarning(false)} 
          />
          <div 
            className="bg-white dark:bg-[#1A1A1A] border border-amber-500/40 dark:border-teal-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 select-none"
          >
            <div className="w-12 h-12 bg-[#0D9488]/10 dark:bg-teal-950/40 border border-teal-500/20 text-[#0D9488] dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-black dark:text-white tracking-tight">
                {language === "ar" ? "تنبيه أمني محمي" : "Security Enforcement"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed px-2">
                {warningMessage}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-teal-500/10 cursor-pointer"
              >
                {language === "ar" ? "حسناً، فهمت" : "Got It"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen blur backdrop when window loses focus (Anti-Capture measure) */}
      {isTabBlurred && (
        <div className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none">
          <div className="w-16 h-16 bg-teal-500/10 text-[#0D9488] rounded-full flex items-center justify-center border border-teal-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1.5">
            {language === "ar" ? "شاشة مؤمنة ومحمية" : "Secured Screen Mode"}
          </h3>
          <p className="text-[11px] text-slate-400 font-bold max-w-xs leading-relaxed">
            {language === "ar" 
              ? "تم تعتيم المحتوى التعليمي تلقائياً بسبب مغادرتك لصفحة الدراسة الحالية. انقر لاستعادة الشاشة." 
              : "Study content blurred because you switched tabs or focus. Click back into the window to resume."}
          </p>
        </div>
      )}
    </>
  );
}
