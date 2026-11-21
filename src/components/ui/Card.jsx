import React from 'react';

/**
 * Reusable Card Component with composable Header, Title, Description, Content, Footer
 * 
 * Variants:
 * - default: standard background (#101F33)
 * - elevated: elevated background (#142842) with deeper shadow
 * - glass: translucent with backdrop-blur
 */
export function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) {
  const variantStyles = {
    default: 'bg-[#101F33] border border-white/5 shadow-card',
    elevated: 'bg-[#142842] border border-[rgba(0,212,255,0.15)] shadow-card-elevated',
    glass: 'bg-[#101F33]/80 backdrop-blur-md border border-[rgba(0,212,255,0.12)] shadow-card',
  };

  const hoverStyles = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4FF]/40 hover:shadow-[0_12px_30px_-5px_rgba(0,212,255,0.15)]'
    : '';

  return (
    <div
      className={`rounded-2xl overflow-hidden ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`text-lg font-semibold text-[#F8FAFC] tracking-tight ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-[#A9BCD0] mt-1.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-3 text-[#A9BCD0] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
