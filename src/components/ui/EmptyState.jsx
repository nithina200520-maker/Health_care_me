import React from 'react';
import Button from './Button';

/**
 * Reusable Empty State Component
 * 
 * Props:
 * - icon: Lucide Icon
 * - title: string
 * - description: string
 * - actionLabel: string (optional)
 * - onAction: function (optional)
 * - actionButton: ReactNode (optional alternative to actionLabel)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionButton,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#0B1728]/50 border border-white/5 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#142842] border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-[#00D4FF] shadow-[0_0_25px_rgba(0,212,255,0.15)] mb-5">
          <Icon className="w-8 h-8" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-[#A9BCD0] max-w-sm mt-2 leading-relaxed">
          {description}
        </p>
      )}

      {actionButton ? (
        <div className="mt-6">{actionButton}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
