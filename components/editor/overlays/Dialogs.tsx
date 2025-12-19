"use client";

import { X, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  type?: 'danger' | 'success' | 'info';
  loading?: boolean;
}

export function Dialog({ isOpen, onClose, title, description, children, confirmText, onConfirm, type = 'info', loading }: DialogProps) {
  if (!isOpen) return null;

  const bgColors = {
    danger: 'bg-red-50 text-red-600',
    success: 'bg-green-50 text-green-600',
    info: 'bg-purple-50 text-purple-600'
  };

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    info: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${bgColors[type]}`}>
            {type === 'danger' && <AlertCircle size={24} />}
            {type === 'success' && <CheckCircle2 size={24} />}
            {type === 'info' && <HelpCircle size={24} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>}
            {children}
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">Cancel</button>
              <button 
                onClick={onConfirm} 
                disabled={loading}
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-lg transition-all ${btnColors[type]} ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? 'Processing...' : confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}