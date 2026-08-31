"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function CookieBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"consent" | "details" | "about">("details");

  // Category Toggles
  const [preferences, setPreferences] = useState(true);
  const [statistics, setStatistics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Accordion Expand States
  const [expandPref, setExpandPref] = useState(true);
  const [expandStat, setExpandStat] = useState(true);
  const [expandMark, setExpandMark] = useState(true);
  const [expandUnclass, setExpandUnclass] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("medicinety_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAllowAll = () => {
    localStorage.setItem("medicinety_cookie_consent", "allow_all");
    setIsVisible(false);
  };

  const handleAllowSelection = () => {
    localStorage.setItem("medicinety_cookie_consent", "allow_selection");
    localStorage.setItem("medicinety_cookies_preferences", String(preferences));
    localStorage.setItem("medicinety_cookies_statistics", String(statistics));
    localStorage.setItem("medicinety_cookies_marketing", String(marketing));
    setIsVisible(false);
  };

  const handleDeny = () => {
    localStorage.setItem("medicinety_cookie_consent", "denied");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-slate-200 dark:border-teal-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 1. Kenhub Style 3 Navigation Tabs (Consent | Details | About) */}
        <div className="flex items-center justify-around border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-zinc-900 text-xs md:text-sm font-bold">
          <button
            onClick={() => setActiveTab("consent")}
            className={`py-3.5 px-6 border-b-2 transition-all cursor-pointer ${
              activeTab === "consent"
                ? "border-[#00A3FF] text-[#00A3FF] font-black"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {language === "ar" ? "الموافقة (Consent)" : "Consent"}
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`py-3.5 px-6 border-b-2 transition-all cursor-pointer ${
              activeTab === "details"
                ? "border-[#00A3FF] text-[#00A3FF] font-black"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {language === "ar" ? "التفاصيل (Details)" : "Details"}
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`py-3.5 px-6 border-b-2 transition-all cursor-pointer ${
              activeTab === "about"
                ? "border-[#00A3FF] text-[#00A3FF] font-black"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {language === "ar" ? "عن الملفات (About)" : "About"}
          </button>
        </div>

        {/* 2. Tab Contents Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
          
          {/* TAB 1: CONSENT */}
          {activeTab === "consent" && (
            <div className="space-y-4">
              <p>
                {language === "ar" 
                  ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة يُمكن استخدامها بواسطة المواقع الإلكترونية لجعل تجربة المستخدم أكثر كفاءة وسرعة."
                  : "Cookies are small text files that can be used by websites to make a user's experience more efficient."
                }
              </p>
              <p>
                {language === "ar"
                  ? "ينص القانون على أنه يمكننا تخزين ملفات تعريف الارتباط على جهازك إذا كانت ضرورية جداً لتشغيل هذا الموقع. بالنسبة لجميع أنواع ملفات تعريف الارتباط الأخرى نطلب إذنك."
                  : "The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission."
                }
              </p>
              <p>
                {language === "ar"
                  ? "يستخدم هذا الموقع أنواعاً مختلفة من ملفات تعريف الارتباط. يتم وضع بعض الكوكيز بواسطة خدمات أطراف خارجية تظهر على صفحاتنا."
                  : "This site uses different types of cookies. Some cookies are placed by third party services that appear on our pages."
                }
              </p>
            </div>
          )}

          {/* TAB 2: DETAILS (Kenhub Expandable Accordion with Counts & Switches) */}
          {activeTab === "details" && (
            <div className="space-y-5">
              
              {/* Category 1: Preferences */}
              <div className="border-b border-slate-100 dark:border-teal-500/10 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setExpandPref(!expandPref)}
                    className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#00A3FF]"
                  >
                    {expandPref ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span>{language === "ar" ? "التفضيلات (Preferences)" : "Preferences"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] rounded-full font-mono">6</span>
                  </button>

                  <button
                    onClick={() => setPreferences(!preferences)}
                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-all cursor-pointer ${
                      preferences ? "bg-slate-700 justify-end" : "bg-slate-300 dark:bg-zinc-700 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {expandPref && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    {language === "ar"
                      ? "تمكّن ملفات تعريف الارتباط للتفضيلات الموقع من تذكر المعلومات التي تغير طريقة سلوك الموقع أو مظهره، مثل لغتك المفضلة أو منطقتك."
                      : "Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in."
                    }
                  </p>
                )}
              </div>

              {/* Category 2: Statistics */}
              <div className="border-b border-slate-100 dark:border-teal-500/10 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setExpandStat(!expandStat)}
                    className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#00A3FF]"
                  >
                    {expandStat ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span>{language === "ar" ? "الإحصائيات (Statistics)" : "Statistics"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] rounded-full font-mono">14</span>
                  </button>

                  <button
                    onClick={() => setStatistics(!statistics)}
                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-all cursor-pointer ${
                      statistics ? "bg-slate-700 justify-end" : "bg-slate-300 dark:bg-zinc-700 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {expandStat && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    {language === "ar"
                      ? "تساعد ملفات الإحصائيات أصحاب المواقع على فهم كيفية تفاعل الزوار مع الموقع عن طريق جمع التقارير بشكل غير مجهول."
                      : "Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously."
                    }
                  </p>
                )}
              </div>

              {/* Category 3: Marketing */}
              <div className="border-b border-slate-100 dark:border-teal-500/10 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setExpandMark(!expandMark)}
                    className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#00A3FF]"
                  >
                    {expandMark ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span>{language === "ar" ? "التسويق (Marketing)" : "Marketing"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] rounded-full font-mono">20</span>
                  </button>

                  <button
                    onClick={() => setMarketing(!marketing)}
                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-all cursor-pointer ${
                      marketing ? "bg-slate-700 justify-end" : "bg-slate-300 dark:bg-zinc-700 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {expandMark && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    {language === "ar"
                      ? "تُستخدم ملفات التسويق لتتبع الزوار عبر المواقع الإلكترونية بهدف عرض إعلانات ذات صلة وتفاعلية للمستخدم الفردي."
                      : "Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user."
                    }
                  </p>
                )}
              </div>

              {/* Category 4: Unclassified */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setExpandUnclass(!expandUnclass)}
                    className="flex items-center gap-2 font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#00A3FF]"
                  >
                    {expandUnclass ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span>{language === "ar" ? "غير مصنفة (Unclassified)" : "Unclassified"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] rounded-full font-mono">11</span>
                  </button>
                </div>

                {expandUnclass && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    {language === "ar"
                      ? "ملفات تعريف الارتباط غير التصنيفية هي الكوكيز التي نجرى عملية تصنيفها بالتعاون مع المزودين."
                      : "Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies."
                    }
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <p>
                {language === "ar"
                  ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة يُمكن استخدامها بواسطة المواقع لجعل تجربة المستخدم أكثر كفاءة."
                  : "Cookies are small text files that can be used by websites to make a user's experience more efficient."
                }
              </p>
              <p>
                {language === "ar"
                  ? "ينص القانون على أنه يمكننا تخزين الكوكيز إذا كانت ضرورية جداً لعمل هذا الموقع. بالنسبة لبقية الأنواع نطلب موافقتك الصريحة."
                  : "The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission."
                }
              </p>
              <p>
                {language === "ar"
                  ? "يمكنك في أي وقت تغيير موافقتك أو سحبها من إعلان الكوكيز على موقعنا الإلكتروني."
                  : "You can at any time change or withdraw your consent from the Cookie Declaration on our website."
                }
              </p>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-teal-500/10">
                Cookie declaration last updated by <strong className="text-[#00A3FF]">Medicinety Consent Engine</strong>.
              </p>
            </div>
          )}

        </div>

        {/* 3. Kenhub Action Buttons Bar (Deny | Allow selection | Allow all) */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
          
          {/* Deny Button */}
          <button
            onClick={handleDeny}
            className="px-5 py-2.5 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            {language === "ar" ? "رفض (Deny)" : "Deny"}
          </button>

          <div className="flex items-center gap-3">
            {/* Allow selection Button */}
            <button
              onClick={handleAllowSelection}
              className="px-5 py-2.5 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {language === "ar" ? "سماح للمحدد (Allow selection)" : "Allow selection"}
            </button>

            {/* Allow all Button (Vibrant Kenhub Blue #00A3FF) */}
            <button
              onClick={handleAllowAll}
              className="px-8 py-3 bg-[#00A3FF] hover:bg-[#0092E6] text-white text-xs md:text-sm font-black rounded-lg shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-wider cursor-pointer"
            >
              {language === "ar" ? "قبول الكل (Allow all)" : "Allow all"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
