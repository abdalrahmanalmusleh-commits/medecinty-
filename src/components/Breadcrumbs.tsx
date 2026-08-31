"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { subjectData } from "@/data/subjectData";
import { useLanguage } from "@/components/LanguageContext";

interface BreadcrumbItem {
  label_en: string;
  label_ar: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  
  if (!pathname || pathname === "/") return null;

  const items: BreadcrumbItem[] = [
    { label_en: "Home", label_ar: "الرئيسية", href: "/" }
  ];

  if (pathname.startsWith("/medicine")) {
    items.push({ label_en: "Medicine Program", label_ar: "برنامج الطب", href: "/medicine" });
  } else if (pathname.startsWith("/basic-knowledge")) {
    items.push({ label_en: "Medicine Program", label_ar: "برنامج الطب", href: "/medicine" });
    items.push({ label_en: "Basic Knowledge", label_ar: "العلوم الأساسية", href: "/basic-knowledge" });
    
    if (pathname.includes("/general-principles")) {
      items.push({ label_en: "General Principles", label_ar: "المبادئ العامة", href: "/basic-knowledge/general-principles" });
    } else if (pathname.includes("/systems")) {
      items.push({ label_en: "Systems", label_ar: "أجهزة الجسم", href: "/basic-knowledge/systems" });
    }
  } else if (pathname.startsWith("/clinical-knowledge")) {
    items.push({ label_en: "Medicine Program", label_ar: "برنامج الطب", href: "/medicine" });
    items.push({ label_en: "Clinical Knowledge", label_ar: "العلوم السريرية", href: "/clinical-knowledge" });
  } else if (pathname.startsWith("/subject/")) {
    const subjectId = pathname.split("/subject/")[1]?.split("/")[0];
    const subject = subjectData[subjectId];
    
    items.push({ label_en: "Medicine Program", label_ar: "برنامج الطب", href: "/medicine" });
    items.push({ label_en: "Basic Knowledge", label_ar: "العلوم الأساسية", href: "/basic-knowledge" });
    
    if (subject) {
      if (subject.category === "General Principles") {
        items.push({ label_en: "General Principles", label_ar: "المبادئ العامة", href: "/basic-knowledge/general-principles" });
      } else {
        items.push({ label_en: "Systems", label_ar: "أجهزة الجسم", href: "/basic-knowledge/systems" });
      }
      items.push({ 
        label_en: subject.name, 
        label_ar: (subject as any).name_ar || subject.name, 
        href: `/subject/${subjectId}` 
      });
    } else {
      const fallback = subjectId ? (subjectId.charAt(0).toUpperCase() + subjectId.slice(1)) : "Subject";
      items.push({ label_en: fallback, label_ar: fallback, href: `/subject/${subjectId}` });
    }

    if (pathname.includes("/exam")) {
      items.push({ label_en: "Exam", label_ar: "الامتحان", href: `/subject/${subjectId}/exam` });
    }
  } else if (pathname.startsWith("/free-courses")) {
    items.push({ label_en: "Free & Available Courses", label_ar: "الكورسات المجانية والمتاحة", href: "/free-courses" });
  } else if (pathname.startsWith("/privacy-policy")) {
    items.push({ label_en: "Privacy Policy", label_ar: "سياسة الخصوصية", href: "/privacy-policy" });
  } else if (pathname.startsWith("/terms-and-conditions")) {
    items.push({ label_en: "Terms & Conditions", label_ar: "الشروط والأحكام", href: "/terms-and-conditions" });
  } else if (pathname.startsWith("/how-to-use")) {
    items.push({ label_en: "How to Use Medicinety", label_ar: "دليل استخدام المنصة", href: "/how-to-use" });
  } else if (pathname.startsWith("/my-courses")) {
    items.push({ label_en: "My Courses", label_ar: "كورساتي", href: "/my-courses" });
  } else if (pathname.startsWith("/contact")) {
    items.push({ label_en: "Contact Us", label_ar: "اتصل بنا", href: "/contact" });
  } else if (pathname.startsWith("/settings")) {
    items.push({ label_en: "Settings", label_ar: "الإعدادات", href: "/settings" });
  }

  return (
    <nav aria-label="Breadcrumb" className="py-3 select-none flex items-center">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const label = language === "ar" ? item.label_ar : item.label_en;
          
          if (idx === 0) {
            return (
              <li key="home-item" className="flex items-center gap-1.5">
                <Link
                  href="/"
                  className="text-slate-500 dark:text-slate-400 hover:text-[#0D9488] dark:hover:text-teal-400 transition-colors font-bold cursor-pointer"
                >
                  {label}
                </Link>
                {items.length > 1 && <ChevronRight className="w-3 h-3 text-slate-350 dark:text-slate-700" />}
              </li>
            );
          }

          return (
            <li key={item.href + idx} className="flex items-center gap-1.5">
              {isLast ? (
                <span className="text-black dark:text-white font-extrabold">
                  {label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="text-slate-400 dark:text-slate-500 hover:text-[#0D9488] dark:hover:text-teal-400 transition-colors"
                  >
                    {label}
                  </Link>
                  <ChevronRight className="w-3 h-3 text-slate-350 dark:text-slate-700" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
