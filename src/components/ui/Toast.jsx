import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <aside
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-bottom-5"
          >
            <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const { title, message, type } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-[#22C55E]/40',
      iconColor: 'text-[#22C55E]',
      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-[#F59E0B]/40',
      iconColor: 'text-[#F59E0B]',
      shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    error: {
      icon: AlertCircle,
      border: 'border-[#EF4444]/40',
      iconColor: 'text-[#EF4444]',
      shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    info: {
      icon: Info,
      border: 'border-[#00D4FF]/40',
      iconColor: 'text-[#00D4FF]',
      shadow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-[#101F33] border ${config.border} ${config.shadow} text-[#F8FAFC] backdrop-blur-md`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold text-[#F8FAFC]">{title}</h4>}
        {message && <p className="text-xs text-[#A9BCD0] mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#71849A] hover:text-[#F8FAFC] p-1 rounded-md transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default ToastProvider;
