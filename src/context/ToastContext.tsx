import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Sparkles, Coins, Crown, ArrowRight } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  icon?: 'check' | 'coins' | 'crown' | 'sparkles' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string, icon?: ToastItem['icon']) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string, icon?: ToastItem['icon']) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000, icon }: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration, icon };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string, icon: ToastItem['icon'] = 'check') => {
      showToast({ type: 'success', title, message, icon });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, icon: 'error' });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, icon: ToastItem['icon'] = 'info') => {
      showToast({ type: 'info', title, message, icon });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message, icon: 'warning' });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Floating Notification Container */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto transform transition-all duration-300 ease-out animate-in slide-in-from-top-4 fade-in rounded-2xl p-4 shadow-2xl backdrop-blur-xl border flex items-start gap-3.5 relative overflow-hidden group ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-white shadow-emerald-500/10'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 text-white shadow-rose-500/10'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/40 text-white shadow-amber-500/10'
                  : 'bg-slate-900/95 border-indigo-500/40 text-white shadow-indigo-500/10'
              }`}
            >
              {/* Left Accent Glow Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isSuccess
                    ? 'bg-emerald-500'
                    : isError
                    ? 'bg-rose-500'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              />

              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.icon === 'crown' ? (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                ) : toast.icon === 'coins' ? (
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/40">
                    <Coins className="w-4 h-4" />
                  </div>
                ) : toast.icon === 'sparkles' ? (
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : isSuccess ? (
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : isError ? (
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : isWarning ? (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-normal">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
