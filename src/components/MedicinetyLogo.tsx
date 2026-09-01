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
  color = "#00828A"
}: MedicinetyLogoProps) {
  // Pure 2 Interlocking Intertwined Circles - Clean, Equal Line Thickness, No gaps or artifacts
  return (
    <svg 
      className={className} 
      width={size} 
      height={(size * 28) / 44} 
      viewBox="0 0 96 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle 1 - Left Double Ring */}
      <circle cx="34" cy="28" r="22" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="34" cy="28" r="16.5" stroke={color} strokeWidth="3" fill="none" />

      {/* Circle 2 - Right Double Ring */}
      <circle cx="62" cy="28" r="22" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="62" cy="28" r="16.5" stroke={color} strokeWidth="3" fill="none" />

      {/* Clean Interlacing Overlap: Top Arch of Left Over Right */}
      <path 
        d="M 49.5 9.5 A 22 22 0 0 1 56 28" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      <path 
        d="M 46 14.5 A 16.5 16.5 0 0 1 50.5 28" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
