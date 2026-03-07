import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider (Toaster is the provider)");
  return context;
};

// Internal global event emitter for simplicity since we can't wrap App easily without another file
const toastListeners: Set<(toast: Toast) => void> = new Set();

const dispatchToast = (message: string, type: 'success' | 'error' | 'info') => {
  const id = Math.random().toString(36).substring(2, 9);
  const toast: Toast = { id, message, type };
  toastListeners.forEach(listener => listener(toast));
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleNewToast = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.add(handleNewToast);
    return () => {
      toastListeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`
            flex items-center justify-between p-4 rounded shadow-lg min-w-[300px] animate-slide-in
            ${toast.type === 'error' ? 'bg-red-600 text-white' : 
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-neutral-800 text-white border border-neutral-700'}
          `}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-4 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export const toast = {
  success: (msg: string) => dispatchToast(msg, 'success'),
  error: (msg: string) => dispatchToast(msg, 'error'),
  info: (msg: string) => dispatchToast(msg, 'info'),
};