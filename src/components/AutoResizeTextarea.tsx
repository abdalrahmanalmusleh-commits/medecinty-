"use client";

import { useEffect, useRef } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function AutoResizeTextarea({
  value,
  onChange,
  className = "",
  placeholder = ""
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 resize-none p-0 overflow-hidden ${className}`}
      rows={1}
      style={{ overflow: "hidden", resize: "none" }}
    />
  );
}
