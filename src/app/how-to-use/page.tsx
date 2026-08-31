"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  PlayCircle, 
  Layers, 
  FileText, 
  CheckSquare, 
  Sparkles,
  Upload,
  Trash2,
  HelpCircle,
  X
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/LanguageContext";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";

const iconMap = {
  PlayCircle,
  FileText,
  Layers,
  CheckSquare
};

export default function HowToUsePage() {
  const router = useRouter();

  // Onboarding header states
  const [welcomeHeadline, setWelcomeHeadline] = useState("Welcome to your digital medical library");
  const [welcomeDesc, setWelcomeDesc] = useState(
    "Medicinety is engineered to simplify complex clinical curriculum. This tutorial guide outlines the core functional modules designed to support your progression toward clinical mastery."
  );

  // Local device video state
  const [videoUrl, setVideoUrl] = useState<string | null>("https://www.w3schools.com/html/mov_bbb.mp4");
  const [videoInput, setVideoInput] = useState("");

  // Platform features state in the correct ideal learning sequence
  const [features, setFeatures] = useState([
    {
      title: "Interactive Syllabus Playlist",
      description: "Dynamically populate your course structure by adding lectures. Click any lecture item to immediately load the media player and start studying clinical concepts.",
      iconName: "PlayCircle",
      color: "text-[#0D9488]",
      bg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20"
    },
    {
      title: "High-Yield Handouts",
      description: "Manage reference checklists, PDF summary guides, and physiological flowcharts. Click any handout card to preview content in the integrated reader or download for offline study.",
      iconName: "FileText",
      color: "text-[#0D9488]",
      bg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20"
    },
    {
      title: "Active Recall Flashcards",
      description: "Write flashcard questions and answers for each module. Click a card to trigger a smooth 3D rotation, flipping between the question and the clinical explanation.",
      iconName: "Layers",
      color: "text-[#0D9488]",
      bg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20"
    },
    {
      title: "Test Your Knowledge Quizzes",
      description: "Complete localized micro-quizzes linked directly to individual lectures. Take the comprehensive Final Course Exam at the bottom of the page to evaluate overall subject mastery.",
      iconName: "CheckSquare",
      color: "text-[#0D9488]",
      bg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20"
    }
  ]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    const saved = localStorage.getItem("medicinety_how_to_use_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.welcomeHeadline !== undefined) setWelcomeHeadline(data.welcomeHeadline);
        if (data.welcomeDesc !== undefined) setWelcomeDesc(data.welcomeDesc);
        if (data.features !== undefined) setFeatures(data.features);
        
        if (data.videoUrl !== undefined) {
          if (data.videoUrl && data.videoUrl.startsWith("blob:")) {
            // Clear expired temporary blob URLs
            setVideoUrl(null);
            setVideoInput("");
            data.videoUrl = null;
            localStorage.setItem("medicinety_how_to_use_state", JSON.stringify(data));
          } else {
            setVideoUrl(data.videoUrl);
            setVideoInput(data.videoUrl || "");
          }
        }
      } catch (e) {
        console.error("Failed to load how-to-use page state", e);
      }
    }
  }, []);

  const saveHowToUseState = (overrides: any = {}) => {
    try {
      const saved = localStorage.getItem("medicinety_how_to_use_state");
      const current = saved ? JSON.parse(saved) : { 
        welcomeHeadline, 
        welcomeDesc, 
        videoUrl, 
        features 
      };
      const merged = { ...current, ...overrides };
      localStorage.setItem("medicinety_how_to_use_state", JSON.stringify(merged));
    } catch (e) {
      console.error("Failed to save onboarding state", e);
    }
  };

  const getEmbedUrl = (url: string | null) => {
    if (!url) return "";
    
    // YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}?modestbranding=1`;
    }
    
    // Vimeo
    const vimeoRegExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegExp);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const isEmbeddable = (url: string | null) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setVideoUrl(localUrl);
      setVideoInput(`Local file: ${file.name}`);
      saveHowToUseState({ videoUrl: localUrl });
    }
  };

  const updateFeatureDesc = (index: number, newText: string) => {
    const updated = [...features];
    updated[index].description = newText;
    setFeatures(updated);
    saveHowToUseState({ features: updated });
  };

  const updateFeatureTitle = (index: number, newText: string) => {
    const updated = [...features];
    updated[index].title = newText;
    setFeatures(updated);
    saveHowToUseState({ features: updated });
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-24 transition-colors duration-300">
      
      <div className="w-full px-4 pt-10 space-y-10">
        
        {/* Minimalist Back Navigation (Clean, borderless link) */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0D9488] dark:hover:text-[#0D9488] transition-colors select-none group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors" /> Back to Home
          </button>
        </div>

        {/* Smart Responsive Content Wrapper (Zoom & Ultra-wide containment) */}
        <div className="w-full xl:max-w-[1440px] mx-auto space-y-10">
          
          {/* Dynamic Breadcrumbs */}
          <Breadcrumbs />

          {/* Onboarding Header */}
          <section className="space-y-3 text-center md:text-left group select-none">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D9488] bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-200/20 inline-block select-none">
                Platform Onboarding
              </span>
            </div>
            
            {isAdmin ? (
              <AutoResizeTextarea
                value={welcomeHeadline}
                onChange={(val) => {
                  setWelcomeHeadline(val);
                  saveHowToUseState({ welcomeHeadline: val });
                }}
                className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none animate-fade-in"
                placeholder=""
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none">
                {welcomeHeadline}
              </h1>
            )}
            {isAdmin ? (
              <AutoResizeTextarea
                value={welcomeDesc}
                onChange={(val) => {
                  setWelcomeDesc(val);
                  saveHowToUseState({ welcomeDesc: val });
                }}
                className="text-sm md:text-base text-black dark:text-white leading-relaxed font-normal"
                placeholder=""
              />
            ) : (
              <p className="text-sm md:text-base text-black dark:text-white leading-relaxed font-normal">
                {welcomeDesc}
              </p>
            )}
          </section>

        {/* Video Tutorial Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight select-none">
              Instructional & Tutorial Video
            </h2>
          </div>

          {/* Tutorial Video Player */}
          <div className="w-full bg-slate-950 border border-slate-200/10 dark:border-slate-800/40 rounded-lg overflow-hidden aspect-video relative flex flex-col justify-between shadow-lg">
            {videoUrl ? (
              <div className="absolute inset-0">
                {isEmbeddable(videoUrl) ? (
                  <>
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      title="Medicinety Tutorial Video"
                      className="w-full h-full object-cover bg-black border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    {/* Security Click Blocker Overlay for Top-Right (YouTube/Vimeo Share & Links) */}
                    <div className="absolute top-0 right-0 w-36 h-16 z-30 bg-transparent pointer-events-auto cursor-default" />
                    {/* Security Click Blocker Overlay for Top-Left (YouTube/Vimeo Logo/Title Links) */}
                    <div className="absolute top-0 left-0 w-48 h-16 z-30 bg-transparent pointer-events-auto cursor-default" />
                  </>
                ) : (
                  <video 
                    key={videoUrl}
                    src={videoUrl} 
                    controls 
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 dark:bg-slate-900/50 text-slate-450 gap-4 border-2 border-dashed border-slate-700/30 rounded-lg px-8 py-6 animate-fade-in">
                <div className="flex flex-col items-center text-center gap-2">
                  <PlayCircle className="w-12 h-12 text-[#0D9488]/30 animate-pulse" />
                  <p className="text-sm font-bold text-slate-400 select-none">No tutorial video loaded.</p>
                  <p className="text-xs text-slate-500 max-w-xs select-none">Paste a YouTube/Vimeo URL or upload a local file to populate the tutorial player.</p>
                </div>
                
                {/* Center Inputs on Empty State (Admin Only) */}
                {isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md items-center">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder=""
                        value={videoInput}
                        onChange={(e) => {
                          setVideoInput(e.target.value);
                          if (e.target.value.trim()) {
                            setVideoUrl(e.target.value.trim());
                            saveHowToUseState({ videoUrl: e.target.value.trim() });
                          } else {
                            setVideoUrl(null);
                            saveHowToUseState({ videoUrl: null });
                          }
                        }}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-teal-500/30 text-xs text-black dark:text-white px-3 py-2.5 rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black transition-all font-medium"
                      />
                    </div>
                    <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0D9488]/10 hover:bg-[#0D9488] text-[#0D9488] hover:text-white border border-[#0D9488]/20 dark:border-[#0D9488]/40 text-xs font-bold rounded-md cursor-pointer transition-all select-none shrink-0 w-full sm:w-auto">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                )}
              </div>
            )}
            
            {/* Top Video Overlay bar when not playing */}
            {videoUrl && (
              <div className="p-4 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center text-white pointer-events-none select-none">
                <span className="text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D9488]" /> Getting Started with Medicinety
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0D9488] px-2 py-0.5 rounded">
                  Tutorial
                </span>
              </div>
            )}
          </div>

          {/* Configuration and Settings below player when loaded (Admin Only) */}
          {videoUrl && isAdmin && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full mt-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder=""
                  value={videoInput}
                  onChange={(e) => {
                    setVideoInput(e.target.value);
                    if (e.target.value.trim()) {
                      setVideoUrl(e.target.value.trim());
                      saveHowToUseState({ videoUrl: e.target.value.trim() });
                    } else {
                      setVideoUrl(null);
                      saveHowToUseState({ videoUrl: null });
                    }
                  }}
                  className="w-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/20 text-xs text-black dark:text-white px-3 py-2 rounded-md outline-none focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all font-medium pr-8"
                />
                {videoInput && (
                  <button
                    onClick={() => {
                      setVideoInput("");
                      setVideoUrl(null);
                      saveHowToUseState({ videoUrl: null });
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Clear Link"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0D9488]/10 hover:bg-[#0D9488] text-[#0D9488] hover:text-white border border-[#0D9488]/20 dark:border-[#0D9488]/40 text-xs font-bold rounded-md cursor-pointer transition-all select-none shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Change File
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </label>
                <button
                  onClick={() => {
                    setVideoUrl(null);
                    setVideoInput("");
                    saveHowToUseState({ videoUrl: null });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-250/20 dark:border-rose-800/20 text-xs font-bold rounded-md transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Detailed Explanation Area */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0D9488] rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight select-none">
              Platform Features & Study Workflow
            </h2>
          </div>

          {/* Vertical Stack Layout with Numbers Placed OUTSIDE the Cards */}
          <div className="flex flex-col gap-8 w-full">
            {features.map((feat, i) => (
              <div key={i} className="flex gap-6 items-start w-full">
                
                {/* Standalone Typographic Step Number Indicator (Left Side, Outside) */}
                <div className="flex flex-col items-center select-none pt-4 shrink-0 w-12">
                  <span className="text-4xl md:text-5xl font-black tracking-tight leading-none text-[#0D9488]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  
                  {/* Timeline vertical connecting line */}
                  {i < features.length - 1 && (
                    <div className="w-0.5 h-32 bg-[#0D9488]/20 dark:bg-teal-500/20 mt-4 rounded-full" />
                  )}
                </div>

                {/* Card Container responding to Light/Dark Mode */}
                <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md dark:shadow-slate-950/20 transition-all duration-300 group select-none hover:border-[#0D9488]/40 dark:hover:border-teal-400/40">
                  
                  {/* Header bar with Icon and Editable Title */}
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-md ${feat.bg} ${feat.color} shrink-0`}>
                      {(() => {
                        const IconComponent = iconMap[feat.iconName as keyof typeof iconMap] || HelpCircle;
                        return <IconComponent className="w-5 h-5 transition-colors duration-200 group-hover:text-[#0D9488] dark:group-hover:text-teal-400" />;
                      })()}
                    </div>
                    
                    {/* Editable Title */}
                    {isAdmin ? (
                      <AutoResizeTextarea
                        value={feat.title}
                        onChange={(val) => updateFeatureTitle(i, val)}
                        className="text-lg font-semibold text-black dark:text-white tracking-tight flex-1"
                        placeholder=""
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight flex-1">
                        {feat.title}
                      </h3>
                    )}
                  </div>
                  
                  {/* Editable Description */}
                  {isAdmin ? (
                    <AutoResizeTextarea
                      value={feat.description}
                      onChange={(val) => updateFeatureDesc(i, val)}
                      className="text-base text-black dark:text-white leading-relaxed font-medium"
                      placeholder=""
                    />
                  ) : (
                    <p className="text-base text-black dark:text-white leading-relaxed font-medium">
                      {feat.description}
                    </p>
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>

        </div>

      </div>
    </div>
  );
}
