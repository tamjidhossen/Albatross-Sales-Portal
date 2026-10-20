import React from 'react';

export const BackgroundDoodles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      
      {/* Paper Plane Doodle */}
      <svg 
        className="absolute top-28 left-[5%] w-24 h-24 text-white/20 animate-float-slow" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M15 45 L85 20 L55 85 L42 55 Z" />
        <path d="M85 20 L42 55" />
        <path d="M10 75 Q 25 85, 35 68" strokeDasharray="4 6" />
      </svg>

      {/* Steaming Momo Doodle */}
      <svg 
        className="absolute top-[42%] left-[3%] w-28 h-28 text-yellow-200/20 animate-float-reverse" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      >
        <path d="M20 70 C15 45, 40 30, 50 28 C60 30, 85 45, 80 70 C75 82, 25 82, 20 70 Z" />
        <path d="M35 45 Q45 58 50 32" />
        <path d="M50 32 Q55 58 65 45" />
        <path d="M40 18 Q45 10 40 4" />
        <path d="M58 16 Q63 8 58 2" />
      </svg>

      {/* Burger Doodle */}
      <svg 
        className="absolute top-[22%] right-[5%] w-32 h-32 text-yellow-300/20 animate-float-delayed" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      >
        <path d="M20 45 C20 22, 80 22, 80 45 Z" />
        <path d="M16 52 Q28 46, 40 52 T64 52 T84 52" strokeWidth="3" />
        <rect x="18" y="57" width="64" height="10" rx="5" />
        <path d="M22 72 L78 72 C78 84, 22 84, 22 72 Z" />
        <circle cx="40" cy="34" r="1.5" fill="currentColor" />
        <circle cx="55" cy="30" r="1.5" fill="currentColor" />
        <circle cx="65" cy="37" r="1.5" fill="currentColor" />
      </svg>

      {/* Pizza Slice Doodle */}
      <svg 
        className="absolute bottom-[20%] left-[6%] w-28 h-28 text-white/20 animate-float-slow" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      >
        <path d="M50 15 L85 80 C65 90, 35 90, 15 80 Z" />
        <path d="M20 72 C38 80, 62 80, 80 72" />
        <circle cx="48" cy="45" r="5" />
        <circle cx="38" cy="62" r="6" />
        <circle cx="60" cy="60" r="5" />
      </svg>

      {/* Hot Chili Pepper Doodle */}
      <svg 
        className="absolute bottom-[14%] right-[5%] w-24 h-24 text-yellow-300/20 animate-float-reverse" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      >
        <path d="M30 30 C45 25, 75 45, 85 80 C60 80, 30 60, 30 30 Z" />
        <path d="M30 30 Q20 20 25 12" />
      </svg>

    </div>
  );
};

