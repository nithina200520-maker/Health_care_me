import React from 'react';

/**
 * Reusable Loading Spinner with dual-ring cyan/blue gradient effect
 * 
 * Sizes: 'xs', 'sm', 'md', 'lg', 'xl'
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[2.5px]',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-t-[#00D4FF] border-r-[#3478F6] border-b-transparent border-l-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
