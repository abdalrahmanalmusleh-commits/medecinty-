"use client";

import React from "react";

interface MedicinetyLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function MedicinetyLogo({ 
  className = "w-10 h-7", 
  size = 44,
  color = "#0D9488"
}: MedicinetyLogoProps) {
  // Proportional 16:10 aspect ratio for the two interlocking circles
  return (
    <svg 
      className={className} 
      width={size} 
      height={(size * 28) / 44} 
      viewBox="0 0 92 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 100% Transparent Background */}
      
      {/* Left Double Ring */}
      {/* Outer Ring */}
      <circle 
        cx="33" 
        cy="28" 
        r="23" 
        stroke={color} 
        strokeWidth="2.8" 
        fill="none" 
      />
      {/* Inner Concentric Ring */}
      <circle 
        cx="33" 
        cy="28" 
        r="18" 
        stroke={color} 
        strokeWidth="2.8" 
        fill="none" 
      />

      {/* Right Double Ring */}
      {/* Outer Ring */}
      <circle 
        cx="59" 
        cy="28" 
        r="23" 
        stroke={color} 
        strokeWidth="2.8" 
        fill="none" 
      />
      {/* Inner Concentric Ring */}
      <circle 
        cx="59" 
        cy="28" 
        r="18" 
        stroke={color} 
        strokeWidth="2.8" 
        fill="none" 
      />

      {/* Intertwined Overlap: Left Over Right Upper Arc */}
      <path 
        d="M51 10.5 A23 23 0 0 1 57 28" 
        stroke={color} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
      />
      <path 
        d="M47.2 14.8 A18 18 0 0 1 52.2 28" 
        stroke={color} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
