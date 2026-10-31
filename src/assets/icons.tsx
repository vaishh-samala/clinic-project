import React from 'react';

export const ClinicBadgeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="24" height="24" rx="6" fill="#0D9488" fillOpacity="0.12" />
    <path 
      d="M12 5V19M5 12H19" 
      stroke="#0D9488" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="12" cy="12" r="3" fill="#0D9488" fillOpacity="0.2" />
  </svg>
);

export const NeuralPulseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M3 12H7L9 6L13 18L15 10L17 14L18.5 12H21" 
      stroke="#0284C7" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="9" cy="6" r="1.5" fill="#0284C7" />
    <circle cx="13" cy="18" r="1.5" fill="#0284C7" />
  </svg>
);
