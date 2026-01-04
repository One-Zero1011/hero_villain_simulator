
import React from 'react';
import { X, AlertTriangle, Check, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  type?: 'danger' | 'info';
  onlyOk?: boolean; // New prop for Alert mode
}

const ConfirmModal: React.FC<Props> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "확인", 
  cancelText = "취소", 
  onConfirm, 
  onClose,
  type = 'info',
  onlyOk = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#232323] w-full max-w-sm rounded-2xl border border-[#404040] shadow-2xl flex flex-col overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1c1c1c]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {type === 'danger' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Info className="w-5 h-5 text-blue-500" />}
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#333333] bg-[#1c1c1c] flex gap-3">
          {!onlyOk && (
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#333333] text-gray-300 hover:bg-[#404040] transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose(); // If onlyOk and no onConfirm, just close
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-1 shadow-lg
              ${type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
