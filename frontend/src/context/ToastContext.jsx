import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
{toast && (
        <div className={`fixed top-14 right-4 z-50 rounded-xl shadow-2xl p-6 min-w-[320px] transform transition-all animate-in slide-in-from-right fade-in duration-300 ${toast.type === 'error' ? 'bg-red-500 border border-red-400' : 'bg-emerald-500 border border-emerald-400'}`}>
          <p className="font-semibold text-white">{toast.message}</p>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

