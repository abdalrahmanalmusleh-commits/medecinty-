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
  // Pure Exactly 2 Interlocking Intertwined Circles
  return (
    <svg 
      className={className} 
      width={size} 
      height={(size * 28) / 44} 
      viewBox="0 0 96 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle 1 - Left Circle */}
      <circle cx="34" cy="28" r="20" stroke={color} strokeWidth="3.5" fill="none" />

      {/* Circle 2 - Right Circle */}
      <circle cx="62" cy="28" r="20" stroke={color} strokeWidth="3.5" fill="none" />

      {/* Interlacing Overlap Arch (Left Over Right) */}
      <path 
        d="M 48 10.5 A 20 20 0 0 1 54 28" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
