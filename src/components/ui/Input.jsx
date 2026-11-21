import React, { forwardRef } from 'react';

/**
 * Reusable Input Component with label, prefix/suffix icons, helper and error text
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    type = 'text',
    className = '',
    inputClassName = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#A9BCD0] mb-1.5 tracking-wide uppercase"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#71849A]">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full rounded-xl bg-[#0B1728] text-[#F8FAFC] placeholder-[#71849A] text-sm px-4 py-2.5 transition-all duration-200 border ${
            error
              ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:border-[#EF4444]'
              : 'border-[rgba(0,212,255,0.18)] focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20'
          } ${LeftIcon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''} disabled:opacity-50 disabled:cursor-not-allowed outline-none ${inputClassName}`}
          {...props}
        />

        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            disabled={disabled || !onRightIconClick}
            className={`absolute right-3.5 flex items-center text-[#71849A] hover:text-[#00D4FF] transition-colors ${
              !onRightIconClick ? 'pointer-events-none' : 'cursor-pointer'
            }`}
          >
            <RightIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1 font-medium">
          <span>•</span> {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#71849A]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
