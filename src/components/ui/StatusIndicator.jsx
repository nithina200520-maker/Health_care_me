import React from 'react';

const statusStyles = {
  success: 'bg-health-success',
  warning: 'bg-health-warning',
  critical: 'bg-health-error',
  info: 'bg-accent-cyan',
  neutral: 'bg-text-muted',
};

export default function StatusIndicator({ status = 'neutral', label, className = '' }) {
  const color = statusStyles[status] || statusStyles.neutral;
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-text-secondary ${className}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label || status}</span>
    </span>
  );
}
