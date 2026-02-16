import { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastToggle } from 'flowbite-react';
import { HiCheck, HiExclamation, HiX, HiInformationCircle } from 'react-icons/hi';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: HiCheck,
    iconClass: 'bg-green-800 text-green-200',
  },
  error: {
    icon: HiX,
    iconClass: 'bg-red-800 text-red-200',
  },
  warning: {
    icon: HiExclamation,
    iconClass: 'bg-orange-700 text-orange-200',
  },
  info: {
    icon: HiInformationCircle,
    iconClass: 'bg-blue-800 text-blue-200',
  },
};

const toastTheme = {
  root: {
    base: 'flex w-full max-w-xs items-center rounded-lg bg-gray-800 p-4 text-gray-400 shadow-lg',
  },
  toggle: {
    base: '-m-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-gray-800 p-1.5 text-gray-500 hover:bg-gray-700 hover:text-white',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-4">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type];
          const Icon = config.icon;
          return (
            <div key={toast.id} className="animate-slide-in">
              <Toast theme={toastTheme}>
                <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal text-gray-200">{toast.message}</div>
                <ToastToggle theme={toastTheme.toggle} onDismiss={() => removeToast(toast.id)} />
              </Toast>
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
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
