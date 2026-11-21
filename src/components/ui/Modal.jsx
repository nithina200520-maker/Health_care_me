import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Accessible Modal Component
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string or ReactNode
 * - description: string or ReactNode (optional)
 * - maxWidth: 'sm' | 'md' | 'lg' | 'xl'
 * - children: ReactNode
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = 'md',
  children,
  className = '',
}) {
  // Listen for escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#07111F]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth] || maxWidthStyles.md} bg-[#101F33] border border-[rgba(0,212,255,0.2)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,212,255,0.15)] text-[#F8FAFC] z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00D4FF] via-[#3478F6] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-[#A9BCD0] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71849A] hover:text-[#F8FAFC] hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
