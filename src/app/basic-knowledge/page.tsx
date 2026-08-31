"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import DoctorIcon from "@/components/DoctorIcon";
import { useLanguage } from "@/components/LanguageContext";

export default function BasicKnowledgePage() {
  const { language } = useLanguage();

  const [description, setDescription] = useState("");
  const [basicSciencesText, setBasicSciencesText] = useState("");
  const [basicKnowledgeTitle, setBasicKnowledgeTitle] = useState("");
  const [selectStructureText, setSelectStructureText] = useState("");
  const [generalPrinciplesTitle, setGeneralPrinciplesTitle] = useState("");
  const [generalPrinciplesDesc, setGeneralPrinciplesDesc] = useState("");
  const [systemsTitle, setSystemsTitle] = useState("");
  const [systemsDesc, setSystemsDesc] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    // Dynamically calculate real course counts
    let gpCount = 0;
    let sysCount = 0;
    try {
      const gp = localStorage.getItem("medicinety_general_principles_list");
      if (gp) gpCount = JSON.parse(gp).length;
      else gpCount = 8;
    } catch(e) {}
    try {
      const sys = localStorage.getItem("medicinety_systems_list");
      if (sys) sysCount = JSON.parse(sys).length;
      else sysCount = 9;
    } catch(e) {}

    const gpDescStr = gpCount > 0 
      ? (language === "ar" ? `${gpCount} مواد ومساقات تأسيسية` : `${gpCount} Foundational Disciplines`)
      : (language === "ar" ? "المساقات والمواد التأسيسية" : "Foundational Disciplines");

    const sysDescStr = sysCount > 0 
      ? (language === "ar" ? `${sysCount} أجهزة جسم متكاملة` : `${sysCount} Integrated Body Systems`)
      : (language === "ar" ? "أجهزة الجسم المتكاملة" : "Integrated Body Systems");

    const defaults = {
      basicSciencesText: language === "ar" ? "العلوم الأساسية" : "Basic Sciences",
      basicKnowledgeTitle: language === "ar" ? "العلوم الأساسية" : "Basic Knowledge",
      description: language === "ar" ? "استكشف المبادئ العامة وأجهزة الجسم للسنوات الأولى في الطب" : "Explore General Principles & Organ Systems for Foundational Medical Study",
      selectStructureText: language === "ar" ? "اختر تصنيف الدراسة" : "Select Curriculum Structure",
      generalPrinciplesTitle: language === "ar" ? "المبادئ العامة" : "General Principles",
      generalPrinciplesDesc: gpDescStr,
      systemsTitle: language === "ar" ? "أجهزة الجسم" : "Organ Systems",
      systemsDesc: sysDescStr
    };

    setBasicSciencesText(defaults.basicSciencesText);
    setBasicKnowledgeTitle(defaults.basicKnowledgeTitle);
    setDescription(defaults.description);
    setSelectStructureText(defaults.selectStructureText);
    setGeneralPrinciplesTitle(defaults.generalPrinciplesTitle);
    setGeneralPrinciplesDesc(defaults.generalPrinciplesDesc);
    setSystemsTitle(defaults.systemsTitle);
    setSystemsDesc(defaults.systemsDesc);

    const saved = localStorage.getItem("medicinety_basic_knowledge_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const lk = (k: string) => data[`${k}_${language}`] || (language === "en" ? data[k] : undefined);
        if (lk("basicSciencesText")) setBasicSciencesText(lk("basicSciencesText"));
        if (lk("basicKnowledgeTitle")) setBasicKnowledgeTitle(lk("basicKnowledgeTitle"));
        if (lk("selectStructureText")) setSelectStructureText(lk("selectStructureText"));
        if (lk("generalPrinciplesTitle")) setGeneralPrinciplesTitle(lk("generalPrinciplesTitle"));
        if (lk("generalPrinciplesDesc")) setGeneralPrinciplesDesc(lk("generalPrinciplesDesc"));
        if (lk("systemsTitle")) setSystemsTitle(lk("systemsTitle"));
        if (lk("systemsDesc")) setSystemsDesc(lk("systemsDesc"));
      } catch (e) {
        console.error(e);
      }
    }
  }, [language]);

  const handleContentInput = (key: string, value: string) => {
    try {
      const saved = localStorage.getItem("medicinety_basic_knowledge_state");
      const data = saved ? JSON.parse(saved) : {};
      data[`${key}_${language}`] = value;
      if (language === "en") data[key] = value;
      localStorage.setItem("medicinety_basic_knowledge_state", JSON.stringify(data));
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
                  value={basicKnowledgeTitle}
                  onChange={(e) => {
                    setBasicKnowledgeTitle(e.target.value);
                    handleContentInput("basicKnowledgeTitle", e.target.value);
                  }}
                  className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
                  {basicKnowledgeTitle}
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
                value={selectStructureText}
                onChange={(e) => {
                  setSelectStructureText(e.target.value);
                  handleContentInput("selectStructureText", e.target.value);
                }}
                className="font-bold text-lg md:text-xl text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
              />
            ) : (
              <h2 className="font-bold text-lg md:text-xl text-black dark:text-white tracking-tight">
                {selectStructureText}
              </h2>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/basic-knowledge/general-principles" className="block">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-teal-500/20 hover:border-[#0D9488]/40 rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-slate-950/20 relative overflow-hidden group select-none flex items-center justify-between"
              >
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={generalPrinciplesTitle}
                      onChange={(e) => {
                        setGeneralPrinciplesTitle(e.target.value);
                        handleContentInput("generalPrinciplesTitle", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-lg text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-black dark:text-white tracking-tight group-hover:text-[#0D9488] transition-colors">
                      {generalPrinciplesTitle}
                    </h3>
                  )}
                  {isAdmin ? (
                    <input
                      type="text"
                      value={generalPrinciplesDesc}
                      onChange={(e) => {
                        setGeneralPrinciplesDesc(e.target.value);
                        handleContentInput("generalPrinciplesDesc", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-400 font-semibold tracking-wide bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text mt-1"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                      {generalPrinciplesDesc}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D9488] group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>

            <Link href="/basic-knowledge/systems" className="block">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-teal-500/20 hover:border-[#0D9488]/40 rounded-lg cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-slate-950/20 relative overflow-hidden group select-none flex items-center justify-between"
              >
                <div className="flex-1">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={systemsTitle}
                      onChange={(e) => {
                        setSystemsTitle(e.target.value);
                        handleContentInput("systemsTitle", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-lg text-black dark:text-white tracking-tight bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-black dark:text-white tracking-tight group-hover:text-[#0D9488] transition-colors">
                      {systemsTitle}
                    </h3>
                  )}
                  {isAdmin ? (
                    <input
                      type="text"
                      value={systemsDesc}
                      onChange={(e) => {
                        setSystemsDesc(e.target.value);
                        handleContentInput("systemsDesc", e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-400 font-semibold tracking-wide bg-transparent border-none outline-none focus:ring-0 focus:outline-none w-full select-text cursor-text mt-1"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                      {systemsDesc}
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
