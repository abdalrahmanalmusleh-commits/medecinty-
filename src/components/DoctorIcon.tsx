import React from "react";

interface DoctorIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function DoctorIcon({ className = "w-6 h-6", ...props }: DoctorIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="7" r="4" />
      
      {/* Shoulders */}
      <path d="M6 21v-1.5a6 6 0 0 1 12 0v1.5" />
      
      {/* Stethoscope drape around neck */}
      <path d="M9 11.5c0 2.5 6 2.5 6 0" />
      
      {/* Stethoscope left tube hanging down */}
      <path d="M9 12v3.5" />
      
      {/* Stethoscope right tube hanging down */}
      <path d="M15 12v2.5" />
      
      {/* Stethoscope chestpiece */}
      <circle cx="15" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}
