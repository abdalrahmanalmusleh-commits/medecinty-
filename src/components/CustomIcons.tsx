import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// Anatomy - Skeleton Icon
export function SkeletonIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Skull */}
      <path d="M9.5 6C9.5 4.5 10.5 3.5 12 3.5s2.5 1 2.5 2.5c0 1-.5 1.5-1 1.5h-3c-.5 0-1-.5-1-1.5z" />
      <path d="M11.5 7.5v0.8h1v-0.8" />
      
      {/* Spine */}
      <path d="M12 7.5v11.5" />
      
      {/* Ribs (Left & Right) */}
      <path d="M12 9.5c-2 0-3.5-1-4-2.5" />
      <path d="M12 9.5c2 0 3.5-1 4-2.5" />
      
      <path d="M12 12.5c-2.8 0-4.8-1.2-5.3-2.8" />
      <path d="M12 12.5c2.8 0 4.8-1.2 5.3-2.8" />
      
      <path d="M12 15.5c-2.5 0-4.3-1-4.8-2.2" />
      <path d="M12 15.5c2.5 0 4.3-1 4.8-2.2" />
      
      {/* Pelvis */}
      <path d="M9 19h6v1.2a1.2 1.2 0 0 1-2.4 0v-0.4h-1.2v0.4a1.2 1.2 0 0 1-2.4 0V19z" />
    </svg>
  );
}

// Biochemistry - Enzyme/Reaction Icon
export function EnzymeIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Two interconnected chemical rings */}
      <path d="M4.5 9L9 6L13.5 9v5.5L9 17.5L4.5 14.5Z" />
      <path d="M13.5 9L18 6l4.5 3v5.5l-4.5 3l-4.5-3" />
      
      {/* Double bond inside first ring */}
      <path d="M6 9.5l3-2" />
      {/* Double bond inside second ring */}
      <path d="M15 9.5l3-2" />
      
      {/* Functional groups */}
      <path d="M9 6V3" />
      <path d="M22.5 14.5l-2 1.2" />
      
      <circle cx="9" cy="3" r="1.2" fill="currentColor" />
      <circle cx="20.5" cy="15.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

// Pathology - Person coughing expelling droplets
export function PathologyIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Head profile facing left */}
      {/* Back of head down to neck */}
      <path d="M16 4.5a4.5 4.5 0 0 1 4 4v3.5a4.5 4.5 0 0 1-4 4h-1" />
      {/* Forehead and nose */}
      <path d="M12.5 5c-.8 0-1.5.8-1.5 1.5v2.5l-1.5.5" />
      {/* Open mouth */}
      <path d="M10.2 11h2" />
      <path d="M10.5 12.5h1.5" />
      {/* Chin and jaw */}
      <path d="M12 13.5v1c0 .8.7 1.5 1.5 1.5h1" />
      
      {/* Cough/Droplets spray (flying to the left) */}
      <path d="M7.5 11h-3" />
      <path d="M8 9.5l-2.5-1.5" />
      <path d="M8 13l-2.5 1.5" />
      
      {/* Droplet dots */}
      <circle cx="2.5" cy="11" r="0.8" fill="currentColor" />
      <circle cx="4" cy="7.5" r="0.8" fill="currentColor" />
      <circle cx="4" cy="14.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

// Microbiology - Bacteria Icon
export function BacteriaIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Main bacillus body (capsule) rotated at 45deg */}
      <rect x="7" y="9" width="10" height="6" rx="3" transform="rotate(-45 12 12)" />
      
      {/* Inner details (genetic material) */}
      <path d="M10 11.5c1 .5 1-.5 2 0s0 1 1 .5" />
      
      {/* Flagella (long tails on the bottom-left end) */}
      <path d="M6.5 15.5c-1.5 1-2.5.5-3.5 2s-1.5 3-3 2.5" />
      <path d="M8.5 17.5c-1.5 2-3 1.5-3.5 3.5" />
      
      {/* Pili (short spikes on the capsule outline) */}
      <path d="M11 6.5v-1.5" />
      <path d="M15 8.5l1.2-1.2" />
      <path d="M17.5 11h1.5" />
      <path d="M15.5 15l1.2 1.2" />
      <path d="M8.5 9l-1.2-1.2" />
    </svg>
  );
}

// Gastrointestinal - Stomach Icon
export function StomachIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Esophagus */}
      <path d="M12 3v3" />
      {/* Stomach contour */}
      <path d="M12 6c-3 1-6 4-6 8.5c0 3.5 3 6.5 7 6c3-.5 5-2.5 5.5-5.5c.3-2-1-4.5-2.5-5c-2.5-1-2.5-3-4-4z" />
      {/* Duodenum connection */}
      <path d="M17.5 13.5c1.5.5 2.5 2 2.5 3.5v2" />
    </svg>
  );
}

// Respiratory - Lungs Icon
export function LungsIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Trachea */}
      <path d="M12 3v4" />
      {/* Left Bronchus and Lung Lobe */}
      <path d="M12 7c-1 .5-2 1-2.5 1.5C8 9.5 5 11 5 15c0 3.5 3 4.5 4.5 4c1-.3 1.5-1.5 2-2.5c.3-1 .5-3.5.5-6.5z" />
      {/* Right Bronchus and Lung Lobe */}
      <path d="M12 7c1 .5 2 1 2.5 1.5c1.5 1 4.5 2.5 4.5 6.5c0 3.5-3 4.5-4.5 4c-1-.3-1.5-1.5-2-2.5c-.3-1-.5-3.5-.5-6.5z" />
    </svg>
  );
}

// Endocrine - Thyroid Gland Icon
export function EndocrineIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Trachea Cartilage Rings */}
      <path d="M10 5h4" />
      <path d="M10 8h4" />
      <path d="M10 11h4" />
      <path d="M10 14h4" />
      <path d="M10 17h4" />
      
      {/* Thyroid Gland Lobes */}
      {/* Left Lobe */}
      <path d="M9.5 8C7 8.5 6 10 6 13c0 3.5 2.5 4.5 3.5 3c1-1.5.5-5.5 0-8z" />
      {/* Right Lobe */}
      <path d="M14.5 8c2.5.5 3.5 2 3.5 5c0 3.5-2.5 4.5-3.5 3c-1-1.5-.5-5.5 0-8z" />
      {/* Isthmus */}
      <path d="M9.5 13.5c1 .5 1.5.5 2.5 0" />
    </svg>
  );
}

// Hematology/Oncology - Red Blood Cells Icon
export function BloodCellIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Red Blood Cell 1 (Large) */}
      <circle cx="9" cy="11" r="5" />
      <path d="M7 10c.5-1 2-1.5 3-1" />
      <path d="M7 12c.5 1 2 1.5 3 1" />
      
      {/* Red Blood Cell 2 (Medium) */}
      <circle cx="17" cy="7.5" r="3.5" />
      <path d="M15.5 7c.3-.7 1.2-1 1.8-.7" />
      
      {/* Red Blood Cell 3 (Small) */}
      <circle cx="15" cy="16.5" r="3.5" />
      <path d="M13.5 16c.3-.7 1.2-1 1.8-.7" />
    </svg>
  );
}

// Renal/Urinary - Kidneys Icon
export function KidneysIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Left Kidney */}
      <path d="M9 7.5C7 8 5.5 10 5.5 12.5c0 2.5 1.5 4.5 3.5 5c-.7-2-.7-6 0-10z" />
      {/* Right Kidney */}
      <path d="M15 7.5c.7 2 .7 6 0 10c2-.5 3.5-2.5 3.5-5c0-2.5-1.5-4.5-3.5-5z" />
      
      {/* Ureters */}
      <path d="M9 13.5c1 1.5 1.5 3.5 1.5 5.5v1.5" />
      <path d="M15 13.5c-1 1.5-1.5 3.5-1.5 5.5v1.5" />
      
      {/* Bladder */}
      <path d="M10 20.5a2 2 0 0 0 4 0z" />
    </svg>
  );
}

// Reproductive - Interlocking Venus & Mars Symbols Icon
export function ReproductiveIcon({ className = "w-6 h-6", ...props }: IconProps) {
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
      {/* Male Symbol (Mars) */}
      <circle cx="15" cy="9" r="4" />
      <path d="M18 6h3v3" />
      <path d="M17.8 8.2l3.7-3.7" />
      
      {/* Female Symbol (Venus) */}
      <circle cx="9" cy="15" r="4" />
      <path d="M9 19v3.5" />
      <path d="M7 21h4" />
    </svg>
  );
}

