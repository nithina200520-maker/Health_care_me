import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../../i18n/LanguageContext';

function localizeChildren(children, t) {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') return t(child);
    if (React.isValidElement(child) && child.props.children) {
      return React.cloneElement(child, undefined, localizeChildren(child.props.children, t));
    }
    return child;
  });
}

/**
 * Reusable Button Component for CareBridge AI Design System
 * 
 * Variants:
 * - primary: Cyan-Blue gradient with soft glow on hover
 * - secondary: Elevated navy with subtle cyan border
 * - outline: Transparent background with cyan/blue border
 * - ghost: Subtle hover effect, no border
 * - danger: Health error red accent for destructive actions
 * 
 * Sizes: 'sm', 'md', 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  ...props
}) {
  const { t } = useLanguage();
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#07111F] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#00D4FF] to-[#3478F6] text-[#07111F] font-semibold hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:brightness-105 focus:ring-[#00D4FF]",
    secondary: "bg-[#142842] text-[#F8FAFC] border border-[rgba(0,212,255,0.2)] hover:border-[#00D4FF]/60 hover:bg-[#1a3252] hover:shadow-[0_0_15px_rgba(0,212,255,0.15)] focus:ring-[#3478F6]",
    outline: "bg-transparent text-[#00D4FF] border border-[#00D4FF]/40 hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 focus:ring-[#00D4FF]",
    ghost: "bg-transparent text-[#A9BCD0] hover:text-[#F8FAFC] hover:bg-[#101F33] focus:ring-[#3478F6]",
    danger: "bg-[#EF4444] text-white hover:bg-[#dc2626] hover:shadow-[0_0_18px_rgba(239,68,68,0.35)] focus:ring-[#EF4444]",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2 text-current" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
      ) : null}

      <span>{localizeChildren(children, t)}</span>

      {!isLoading && RightIcon && (
        <RightIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
