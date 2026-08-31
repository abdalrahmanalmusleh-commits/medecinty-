"use client";

import { useLanguage } from "@/components/LanguageContext";
import { AlertTriangle, Trash2, CheckCircle2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#161616] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 text-center transform transition-all animate-scale-in">
        
        {/* Icon Header */}
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
          isDestructive 
            ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-red-500/10" 
            : "bg-teal-500/10 text-[#0D9488] border border-teal-500/20 shadow-teal-500/10"
        }`}>
          {isDestructive ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-black text-black dark:text-white tracking-tight">
            {title || (language === "ar" ? "تأكيد العملية" : "Confirm Action")}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {cancelText || (language === "ar" ? "إلغاء" : "Cancel")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white text-xs font-black rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/25"
                : "bg-[#0D9488] hover:bg-[#0A7268] shadow-teal-600/25"
            }`}
          >
            {confirmText || (isDestructive ? (language === "ar" ? "نعم، حذف" : "Yes, Delete") : (language === "ar" ? "تأكيد" : "Confirm"))}
          </button>
        </div>

      </div>
    </div>
  );
}
