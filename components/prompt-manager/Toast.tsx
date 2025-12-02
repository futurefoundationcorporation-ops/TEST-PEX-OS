'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - TOAST COMPONENT
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
  info: {
    icon: Info,
    bg: 'bg-[#2979ff]/10',
    border: 'border-[#2979ff]/30',
    text: 'text-[#2979ff]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl shadow-black/50
          ${config.bg} ${config.border}
        `}
      >
        <Icon size={18} className={config.text} />
        <span className="text-sm font-medium text-white">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
