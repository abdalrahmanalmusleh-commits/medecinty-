"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  Layers,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Breadcrumbs from "@/components/Breadcrumbs";

interface QBankSubject {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  category: "basic" | "clinical";
  totalQuestions: number;
  blocksCount: number;
  avgTimeMins: number;
  difficulty: "High-Yield" | "Moderate" | "Comprehensive";
  isUnlocked?: boolean;
}

const QBANK_CATALOG: QBankSubject[] = [
  {
    id: "immunology",
    name_en: "Immunology QBank",
    name_ar: "بنك أسئلة علم المناعة (Immunology)",
    desc_en: "High-Yield USMLE Step 1 & Board questions covering Hypersensitivity, Autoimmunity, Immunodeficiencies, and Vaccinology.",
    desc_ar: "أسئلة سريرية عالية الأهمية لامتحانات البورد والـ USMLE تغطي فرط الحساسية، المناعة الذاتية، نقص المناعة والمطاعيم.",
    category: "basic",
    totalQuestions: 120,
    blocksCount: 6,
    avgTimeMins: 60,
    difficulty: "High-Yield"
  }
];

export default function QBankPage() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<"all" | "basic" | "clinical">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [qbankList, setQbankList] = useState<QBankSubject[]>(QBANK_CATALOG);

  useEffect(() => {
    // Dynamic load if additional custom courses created by admin
    const gpSaved = localStorage.getItem("medicinety_general_principles_list");
    if (gpSaved) {
      try {
        const parsed = JSON.parse(gpSaved);
        if (parsed.length > 0) {
          const list: QBankSubject[] = parsed.map((c: any) => ({
            id: c.id,
            name_en: `${c.name_en} QBank`,
            name_ar: `بنك أسئلة ${c.name_ar || c.name_en}`,
            desc_en: c.desc_en || "Board-style clinical vignettes with detailed rationales.",
            desc_ar: c.desc_ar || "حالات سريرية تحاكي امتحانات البورد مع شروحات تفصيلية للإجابات.",
            category: "basic",
            totalQuestions: 120,
            blocksCount: 6,
            avgTimeMins: 60,
            difficulty: "High-Yield"
          }));
          setQbankList(list);
        }
      } catch (e) {}
    }
  }, []);

  const filteredQBanks = qbankList.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const name = language === "ar" ? item.name_ar : item.name_en;
    const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121212] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: language === "ar" ? "الرئيسية" : "Home", href: "/" },
          { label: language === "ar" ? "بنوك الأسئلة" : "Question Banks", href: "/qbank" }
        ]} />

        {/* Page Hero Header */}
        <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#00828A] via-[#0D9488] to-[#0A7268] text-white shadow-xl overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-teal-100 text-xs font-black uppercase tracking-wider border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === "ar" ? "محاكي بنوك الأسئلة الطبية" : "Clinical QBank Simulation"}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {language === "ar" 
                ? "بنوك الأسئلة الطبية التفاعلية" 
                : "Interactive Medical Question Banks"}
            </h1>
            
            <p className="text-teal-100 text-sm md:text-base leading-relaxed font-medium">
              {language === "ar"
                ? "تدرب على حالات وسيناريوهات سريرية حقيقية تحاكي امتحانات البورد الأمريكي والجامعي مع شروحات علمية تفصيلية لكل خيار."
                : "Practice high-yield clinical vignettes and USMLE board-style blocks with timed exam simulations and in-depth explanations."}
            </p>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          
          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#00828A] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
              }`}
            >
              {language === "ar" ? "جميع البنوك" : "All QBanks"}
            </button>
            <button
              onClick={() => setActiveCategory("basic")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === "basic"
                  ? "bg-[#00828A] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
              }`}
            >
              {language === "ar" ? "العلوم الأساسية" : "Basic Sciences"}
            </button>
            <button
              onClick={() => setActiveCategory("clinical")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === "clinical"
                  ? "bg-[#00828A] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
              }`}
            >
              {language === "ar" ? "السريري" : "Clinical"}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === "ar" ? "ابحث عن بنك أسئلة أو مادة..." : "Search question banks..."}
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-[#00828A] text-black dark:text-white font-medium"
            />
          </div>

        </div>

        {/* Question Banks Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQBanks.map((qbank) => {
            const name = language === "ar" ? qbank.name_ar : qbank.name_en;
            const desc = language === "ar" ? qbank.desc_ar : qbank.desc_en;

            return (
              <motion.div
                key={qbank.id}
                whileHover={{ y: -4 }}
                className="p-6 bg-white dark:bg-[#1A1A1A] border-2 border-slate-200/80 dark:border-zinc-800 hover:border-[#00828A] dark:hover:border-teal-500 rounded-3xl transition-all shadow-sm hover:shadow-xl flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-[#00828A] dark:text-teal-300 flex items-center justify-center font-black">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 text-[11px] font-black rounded-xl border border-amber-300/40">
                      {qbank.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">{language === "ar" ? "الأسئلة" : "Questions"}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{qbank.totalQuestions} Qs</p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">{language === "ar" ? "البلوكات" : "Blocks"}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{qbank.blocksCount} Blocks</p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">{language === "ar" ? "الوقت / بلوك" : "Time / Block"}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{qbank.avgTimeMins} mins</p>
                    </div>
                  </div>
                </div>

                {/* Enter Exam Simulation Action Button */}
                <Link
                  href={`/subject/${qbank.id}/exam`}
                  className="w-full py-3.5 bg-[#00828A] hover:bg-[#006e75] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>{language === "ar" ? "بدء محاكي بنك الأسئلة والامتحان ←" : "Start QBank Exam Simulation →"}</span>
                </Link>

              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
