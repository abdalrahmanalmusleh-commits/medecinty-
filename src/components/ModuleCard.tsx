"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";
import { 
  PlayCircle,
  Layers,
  FileText,
  CheckSquare,
  MoreVertical
} from "lucide-react";

interface ModuleCardProps {
  id: string;
  name: string;
  category?: "General Principles" | "Organ Systems" | string;
  lecturesCount?: number;
  flashcardsCount?: number;
  handoutsCount?: number;
  questionsCount?: number;
  subscribersCount?: number;
  videoUrl?: string;
  imageUrl?: string;
  status?: "ready" | "coming_soon" | "active" | string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAnalytics?: () => void;
}

export const getSubjectImageUrl = (subjectId: string, subjectName: string) => {
  const id = subjectId.toLowerCase();
  if (id.includes("anatomy")) return "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?w=500&auto=format&fit=crop&q=80";
  if (id.includes("embryo")) return "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=80";
  if (id.includes("physio")) return "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80";
  if (id.includes("biochem") || id.includes("enzyme")) return "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80";
  if (id.includes("histology")) return "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=80";
  if (id.includes("pathology")) return "https://images.unsplash.com/photo-1579154261294-a101a257c675?w=500&auto=format&fit=crop&q=80";
  if (id.includes("pharmac")) return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80";
  if (id.includes("microbiol")) return "https://images.unsplash.com/photo-1614853038014-c24a7fefd6a9?w=500&auto=format&fit=crop&q=80";
  if (id.includes("immuno")) return "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=500&auto=format&fit=crop&q=80";
  if (id.includes("public") || id.includes("health")) return "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80";
  
  if (id.includes("gastro") || id.includes("stomach")) return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80";
  if (id.includes("musculo") || id.includes("bone")) return "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=500&auto=format&fit=crop&q=80";
  if (id.includes("central") || id.includes("brain") || id.includes("neuro")) return "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80";
  if (id.includes("respir") || id.includes("lung")) return "https://images.unsplash.com/photo-1584515901367-f1c2a09e0340?w=500&auto=format&fit=crop&q=80";
  if (id.includes("endocrine")) return "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&auto=format&fit=crop&q=80";
  if (id.includes("hematol") || id.includes("blood")) return "https://images.unsplash.com/photo-1606770347238-780c85c2c77d?w=500&auto=format&fit=crop&q=80";
  if (id.includes("cardio") || id.includes("heart")) return "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=80";
  if (id.includes("renal") || id.includes("kidney")) return "https://images.unsplash.com/photo-1606770347039-44d412bfcc1a?w=500&auto=format&fit=crop&q=80";
  if (id.includes("repro")) return "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80";

  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80";
};

export default function ModuleCard({ 
  id,
  name, 
  lecturesCount = 0,
  flashcardsCount = 0,
  handoutsCount = 0,
  questionsCount = 0,
  subscribersCount = 14,
  videoUrl,
  imageUrl,
  status = "ready",
  onEdit,
  onDelete,
  onViewAnalytics
}: ModuleCardProps) {
  const { language } = useLanguage();
  const coverUrl = imageUrl || getSubjectImageUrl(id, name);
  const totalCount = lecturesCount + flashcardsCount + handoutsCount + questionsCount;
  const [menuOpen, setMenuOpen] = useState(false);

  const isComingSoon = status === "coming_soon";
  const hoverTextClass = isComingSoon ? "" : "group-hover:text-[#0D9488] dark:group-hover:text-teal-400";
  const hoverIconClass = isComingSoon ? "" : "group-hover:text-[#0D9488] dark:group-hover:text-teal-400";

  return (
    <motion.div
      className={`glass-panel glass-panel-hover bg-white dark:bg-[#1A1A1A] border ${isComingSoon ? "border-amber-500/40 opacity-65 grayscale-[35%]" : "border-slate-200/50 dark:border-teal-500/40"} rounded-lg ${(isComingSoon && !onEdit) ? "cursor-default" : "cursor-pointer"} flex flex-col justify-between h-[255px] relative overflow-hidden group select-none shadow-sm`}
      whileHover={isComingSoon ? undefined : { y: -4 }}
      whileTap={isComingSoon ? undefined : { scale: 0.98 }}
    >
      {/* Top Half: Cover Image */}
      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-200/40 dark:border-teal-500/10">
        <img 
          src={coverUrl} 
          alt={name} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isComingSoon ? "" : "group-hover:scale-105"}`}
          loading="lazy"
        />
        {/* Soft dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-20">
          {isComingSoon ? (
            <span className="text-[10px] font-black text-white bg-amber-500 px-2.5 py-0.5 rounded-full shadow tracking-wider border border-amber-300/40 uppercase">
              🔒 {language === "ar" ? "قريباً" : "Coming Soon"}
            </span>
          ) : (
            <span className="text-[10px] font-black text-white bg-teal-600 dark:bg-[#0D9488] px-2 py-0.5 rounded-full shadow tracking-wider uppercase">
              {language === "ar" ? "المحتويات" : "Contents"}: {totalCount}
            </span>
          )}
          <span className="text-[9px] font-extrabold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-teal-500/30 shadow flex items-center gap-1">
            👥 {subscribersCount} {language === "ar" ? "طالب مسجل" : "Students Enrolled"}
          </span>
        </div>

        {/* Three-Dots Menu */}
        {(onEdit || onDelete || onViewAnalytics) && (
          <div className="absolute top-2.5 right-2.5 z-40 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 bg-black/40 hover:bg-black/60 dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/30 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-teal-950/20 text-xs font-bold text-black dark:text-white transition-all border-t border-slate-100 dark:border-teal-500/10"
                  >
                    ✏️ {language === "ar" ? "تعديل تفاصيل الكورس" : "Edit Course Details"}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-xs font-bold text-red-500 transition-all border-t border-slate-100 dark:border-teal-500/10"
                  >
                    🗑️ {language === "ar" ? "حذف الكورس" : "Delete Course"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Half: Padded Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`text-sm font-extrabold text-black dark:text-white tracking-tight leading-snug ${hoverTextClass} transition-colors duration-200 truncate`}>
            {name}
          </h3>
        </div>

        {/* Content Resource Grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-black rounded border border-slate-200/40 dark:border-teal-500/10">
            <PlayCircle className={`w-3 h-3 text-slate-400 ${hoverIconClass} transition-colors`} />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {language === "ar" ? "المحاضرات" : "Lectures"}: {lecturesCount}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-black rounded border border-slate-200/40 dark:border-teal-500/10">
            <FileText className={`w-3 h-3 text-slate-400 ${hoverIconClass} transition-colors`} />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {language === "ar" ? "الملخصات" : "Notes"}: {handoutsCount}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-black rounded border border-slate-200/40 dark:border-teal-500/10">
            <Layers className={`w-3 h-3 text-slate-400 ${hoverIconClass} transition-colors`} />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {language === "ar" ? "البطاقات" : "Cards"}: {flashcardsCount}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-black rounded border border-slate-200/40 dark:border-teal-500/10">
            <CheckSquare className={`w-3 h-3 text-slate-400 ${hoverIconClass} transition-colors`} />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {language === "ar" ? "أسئلة اختبار" : "Exam Questions"}: {questionsCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
