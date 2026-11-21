import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Reusable Badge Component with status colors and optional pulsing indicator dot
 * 
 * Variants: 'cyan', 'blue', 'success', 'warning', 'error', 'neutral'
 * Sizes: 'sm', 'md'
 */
export default function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const { t } = useLanguage();
  const variantStyles = {
    cyan: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30',
    blue: 'bg-[#3478F6]/10 text-[#3478F6] border-[#3478F6]/30',
    success: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
    error: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
    neutral: 'bg-white/5 text-[#A9BCD0] border-white/10',
  };

  const dotColors = {
    cyan: 'bg-[#00D4FF]',
    blue: 'bg-[#3478F6]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    neutral: 'bg-[#A9BCD0]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center border select-none transition-colors ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.cyan} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant] || 'bg-[#00D4FF]'}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant] || 'bg-[#00D4FF]'}`}
          />
        </span>
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{typeof children === 'string' ? t(children) : children}</span>
    </span>
  );
}
