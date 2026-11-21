import React from 'react';
import Badge from './Badge';

/**
 * Reusable Section Header Component
 * 
 * Props:
 * - badgeText: optional badge label
 * - title: main section heading
 * - subtitle: explanatory text
 * - align: 'left' | 'center'
 * - className: custom class
 */
export default function SectionHeader({
  badgeText,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`max-w-3xl mb-12 sm:mb-16 ${
        isCenter ? 'mx-auto text-center' : 'text-left'
      } ${className}`}
    >
      {badgeText && (
        <div className={`mb-4 flex ${isCenter ? 'justify-center' : 'justify-start'}`}>
          <Badge variant="cyan" size="md" dot pulse>
            {badgeText}
          </Badge>
        </div>
      )}

      {title && (
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-[#A9BCD0] leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
