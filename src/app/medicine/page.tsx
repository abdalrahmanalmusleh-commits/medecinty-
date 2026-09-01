"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import DoctorIcon from "@/components/DoctorIcon";
import { useLanguage } from "@/components/LanguageContext";
import { getLivePlatformData, saveLivePlatformData } from "@/lib/supabase";

export default function MedicineProgramPage() {
  const { language } = useLanguage();

  const [description, setDescription] = useState("");
  const [curriculumSelectionText, setCurriculumSelectionText] = useState("");
  const [medicineProgramTitle, setMedicineProgramTitle] = useState("");
  const [selectLearningPhaseText, setSelectLearningPhaseText] = useState("");
  const [basicKnowledgeTitle, setBasicKnowledgeTitle] = useState("");
  const [basicKnowledgeDesc, setBasicKnowledgeDesc] = useState("");
  const [clinicalKnowledgeTitle, setClinicalKnowledgeTitle] = useState("");
  const [clinicalKnowledgeDesc, setClinicalKnowledgeDesc] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    // Dynamically calculate real course counts
    let gpCount = 0;
    let sysCount = 0;
    let clinCount = 0;
    try {
      const gp = localStorage.getItem("medicinety_general_principles_list");
      if (gp) gpCount = JSON.parse(gp).length;
      else gpCount = 1;
    } catch(e) {}
    try {
      const sys = localStorage.getItem("medicinety_systems_list");
      if (sys) sysCount = JSON.parse(sys).length;
      else sysCount = 0;
    } catch(e) {}
    try {
      const clin = localStorage.getItem("medicinety_clinical_list");
      if (clin) clinCount = JSON.parse(clin).length;
      else clinCount = 0;
    } catch(e) {}

    const totalBasic = gpCount + sysCount;
    const basicDescStr = totalBasic > 0 
      ? (language === "ar" ? `${totalBasic} مساق وموديول أساسي` : `${totalBasic} Foundational Modules`)
      : (language === "ar" ? "المساقات والمواد الأساسية" : "Foundational Disciplines");

    const clinDescStr = clinCount > 0 
      ? (language === "ar" ? `${clinCount} مساقات سريرية وتدريبية` : `${clinCount} Clinical Disciplines`)
      : (language === "ar" ? "التدريب السريري والامتياز" : "Rotations & Clerkships");

    const defaults = {
      curriculumSelectionText: language === "ar" ? "اختيار المنهج الدراسي" : "Curriculum selection",
      medicineProgramTitle: language === "ar" ? "برنامج الطب البشري" : "Medicine Program",
      description: language === "ar" ? "استكشف مناهج العلوم الأساسية والسريرية التفاعلية" : "Explore Basic & Clinical Syllabus Modules",
      selectLearningPhaseText: language === "ar" ? "اختر المرحلة التعليمية" : "Select Learning Phase",
      basicKnowledgeTitle: language === "ar" ? "العلوم الأساسية" : "Basic Knowledge",
      basicKnowledgeDesc: basicDescStr,
      clinicalKnowledgeTitle: language === "ar" ? "العلوم السريرية" : "Clinical Knowledge",
      clinicalKnowledgeDesc: clinDescStr
    };

    setCurriculumSelectionText(defaults.curriculumSelectionText);
    setMedicineProgramTitle(defaults.medicineProgramTitle);
    setDescription(defaults.description);
    setSelectLearningPhaseText(defaults.selectLearningPhaseText);
    setBasicKnowledgeTitle(defaults.basicKnowledgeTitle);
    setBasicKnowledgeDesc(defaults.basicKnowledgeDesc);
    setClinicalKnowledgeTitle(defaults.clinicalKnowledgeTitle);
    setClinicalKnowledgeDesc(defaults.clinicalKnowledgeDesc);

    getLivePlatformData("medicinety_medicine_state", {}).then(data => {
      if (data && typeof data === "object") {
        const lk = (k: string) => data[`${k}_${language}`] || (language === "en" ? data[k] : undefined);
        if (lk("curriculumSelectionText")) setCurriculumSelectionText(lk("curriculumSelectionText"));
        if (lk("medicineProgramTitle")) setMedicineProgramTitle(lk("medicineProgramTitle"));
        if (lk("selectLearningPhaseText")) setSelectLearningPhaseText(lk("selectLearningPhaseText"));
        if (lk("basicKnowledgeTitle")) setBasicKnowledgeTitle(lk("basicKnowledgeTitle"));
        if (lk("basicKnowledgeDesc")) setBasicKnowledgeDesc(lk("basicKnowledgeDesc"));
        if (lk("clinicalKnowledgeTitle")) setClinicalKnowledgeTitle(lk("clinicalKnowledgeTitle"));
        if (lk("clinicalKnowledgeDesc")) setClinicalKnowledgeDesc(lk("clinicalKnowledgeDesc"));
      }
    });
  }, [language]);

  const handleContentInput = async (key: string, value: string) => {
    try {
      const saved = localStorage.getItem("medicinety_medicine_state");
      const data = saved ? JSON.parse(saved) : {};
      data[`${key}_${language}`] = value;
      if (language === "en") data[key] = value;
      saveLivePlatformData("medicinety_medicine_state", data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      <div className="w-full px-6 lg:px-12 mt-8 space-y-10 animate-fade-in xl:max-w-[1440px] mx-auto">
        <Breadcrumbs />

        <section className="flex items-center gap-5 relative overflow-hidden group select-none">
          <div className="flex-1">
            
            <div className="mb-2">
              {isAdmin ? (
                <input
                  type="text"
                  value={medicineProgramTitle}
                  onChange={(e) => {
                    setMedicineProgramTitle(e.target.value);
                    handleContentInput("medicineProgramTitle", e.target.value);
                  }}
                  className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
                  {medicineProgramTitle}
                </h1>
              )}
            </div>
            {isAdmin ? (
              <AutoResizeTextarea
                value={description}
                onChange={(val: string) => {
                  setDescription(val);
                  handleContentInput("description", val);
                }}
                className="text-sm text-slate-700 dark:text-slate-300 font-bold max-w-xl"
                placeholder="Description"
              />
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 font-bold max-w-xl">
                {description}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-teal-500/10 pb-3">
            <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
            {isAdmin ? (
              <input
                type="text"
                value={selectLearningPhaseText}
                onChange={(e) => {
                  setSelectLearningPhaseText(e.target.value);
                  handleContentInput("selectLearningPhaseText", e.target.value);
                }}
                className="font-bold text-lg md:text-xl text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
              />
            ) : (
              <h2 className="font-bold text-lg md:text-xl text-black dark:text-white tracking-tight">
                {selectLearningPhaseText}
              </h2>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/basic-knowledge" className="block">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-teal-500/20 hover:border-[#0D9488]/40 rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-slate-950/20 relative overflow-hidden group select-none flex items-center justify-between"
              >
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={basicKnowledgeTitle}
                      onChange={(e) => {
                        setBasicKnowledgeTitle(e.target.value);
                        handleContentInput("basicKnowledgeTitle", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-lg text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-black dark:text-white tracking-tight group-hover:text-[#0D9488] transition-colors">
                      {basicKnowledgeTitle}
                    </h3>
                  )}
                  {isAdmin ? (
                    <input
                      type="text"
                      value={basicKnowledgeDesc}
                      onChange={(e) => {
                        setBasicKnowledgeDesc(e.target.value);
                        handleContentInput("basicKnowledgeDesc", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-400 font-semibold tracking-wide bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text mt-1"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                      {basicKnowledgeDesc}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>

            <Link href="/clinical-knowledge" className="block">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-teal-500/20 hover:border-[#0D9488]/40 rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-slate-950/20 relative overflow-hidden group select-none flex items-center justify-between"
              >
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={clinicalKnowledgeTitle}
                      onChange={(e) => {
                        setClinicalKnowledgeTitle(e.target.value);
                        handleContentInput("clinicalKnowledgeTitle", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-lg text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-black dark:text-white tracking-tight group-hover:text-[#0D9488] transition-colors">
                      {clinicalKnowledgeTitle}
                    </h3>
                  )}
                  {isAdmin ? (
                    <input
                      type="text"
                      value={clinicalKnowledgeDesc}
                      onChange={(e) => {
                        setClinicalKnowledgeDesc(e.target.value);
                        handleContentInput("clinicalKnowledgeDesc", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-400 font-semibold tracking-wide bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text mt-1"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                      {clinicalKnowledgeDesc}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
