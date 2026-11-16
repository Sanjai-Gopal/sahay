import React from 'react';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Phone,
  Play,
  X,
  Plus,
  Volume2,
} from 'lucide-react';
import { ToastType } from '../../types';

interface ToastProps {
  message: string | null;
  iconType?: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  iconType,
  type = 'success',
  actionLabel,
  onAction,
  onDismiss,
}) => {
  if (!message) return null;

  // Determine effective toast variant type
  const getEffectiveType = (): ToastType => {
    if (type === 'error' || type === 'warning' || type === 'emergency' || type === 'info' || type === 'success') {
      return type;
    }
    if (iconType === 'alert') return 'error';
    if (iconType === 'phone') return 'emergency';
    if (iconType === 'info') return 'info';
    return 'success';
  };
  const effectiveType = getEffectiveType();

  const renderIcon = () => {
    switch (iconType) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-[#F0AF97]" aria-hidden="true" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-[#F0AF97] animate-pulse" aria-hidden="true" />;
      case 'play':
        return <Play className="w-4 h-4 text-[#E2A33D]" aria-hidden="true" />;
      case 'volume':
        return <Volume2 className="w-4 h-4 text-[#E2A33D]" aria-hidden="true" />;
      case 'plus':
        return <Plus className="w-4 h-4 text-[#E2A33D]" aria-hidden="true" />;
      case 'info':
        return <Info className="w-4 h-4 text-[#A5C4D4]" aria-hidden="true" />;
      case 'check':
      default:
        if (effectiveType === 'error') {
          return <AlertCircle className="w-4 h-4 text-[#F0AF97]" aria-hidden="true" />;
        }
        if (effectiveType === 'warning') {
          return <AlertTriangle className="w-4 h-4 text-[#E2A33D]" aria-hidden="true" />;
        }
        if (effectiveType === 'emergency') {
          return <Phone className="w-4 h-4 text-[#F0AF97] animate-bounce" aria-hidden="true" />;
        }
        return <CheckCircle2 className="w-4 h-4 text-[#6FCF97]" aria-hidden="true" />;
    }
  };

  // Color scheme based on semantic type
  const getTypeClasses = () => {
    switch (effectiveType) {
      case 'error':
        return 'bg-[#2A1410] text-[#FBF7EE] border-[#BD5B3B]/60 shadow-[0_8px_24px_rgba(189,91,59,0.35)]';
      case 'warning':
        return 'bg-[#2B2313] text-[#FBF7EE] border-[#E2A33D]/60 shadow-[0_8px_24px_rgba(226,163,61,0.25)]';
      case 'emergency':
        return 'bg-[#BD5B3B] text-white border-white/30 shadow-[0_10px_30px_rgba(189,91,59,0.45)]';
      case 'info':
        return 'bg-[#182638] text-[#FBF7EE] border-[#3E4F74]/60 shadow-[0_8px_24px_rgba(62,79,116,0.3)]';
      case 'success':
      default:
        return 'bg-[#152B26] text-[#FBF7EE] border-[#6FCF97]/40 shadow-[0_8px_24px_rgba(21,43,38,0.3)]';
    }
  };

  const isAlert = effectiveType === 'error' || effectiveType === 'emergency';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-4 sm:px-5 py-3 rounded-full font-baloo font-semibold text-xs md:text-sm flex items-center gap-2.5 z-50 animate-rise border max-w-[90vw] sm:max-w-md ${getTypeClasses()}`}
    >
      <div className="shrink-0">{renderIcon()}</div>
      <span className="truncate flex-1">{message}</span>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="ml-2 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-baloo font-bold text-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss toast notification"
          className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
