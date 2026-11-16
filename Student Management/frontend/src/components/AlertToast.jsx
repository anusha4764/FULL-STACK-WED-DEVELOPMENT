import React, { useEffect } from 'react';

export const AlertToast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeStyles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-500 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-rose-50 border-rose-500 text-rose-800',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50 border-amber-500 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50 border-blue-500 text-blue-800',
      iconBg: 'bg-blue-100 text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const style = typeStyles[toast.type] || typeStyles.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-in shadow-xl">
      <div className={`flex items-start gap-3 p-4 border-l-4 rounded-lg bg-white ${style.bg} border shadow-lg`}>
        <div className={`p-1.5 rounded-full ${style.iconBg} flex-shrink-0`}>
          {style.icon}
        </div>
        <div className="flex-1 pr-2">
          {toast.title && <h4 className="font-semibold text-sm">{toast.title}</h4>}
          <p className="text-sm font-medium mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlertToast;
