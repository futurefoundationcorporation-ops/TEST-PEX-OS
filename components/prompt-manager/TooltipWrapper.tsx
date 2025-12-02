'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - TOOLTIP WRAPPER
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React, { useState, useRef, useEffect, ReactNode } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l',
  left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r',
  right: 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l',
};

const slideInClasses: Record<TooltipPosition, string> = {
  top: 'animate-in fade-in slide-in-from-bottom-1',
  bottom: 'animate-in fade-in slide-in-from-top-1',
  left: 'animate-in fade-in slide-in-from-right-1',
  right: 'animate-in fade-in slide-in-from-left-1',
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 150,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          className={`
            absolute z-[100] px-3 py-2 text-xs font-medium text-white 
            bg-[#1e2330] border border-white/10 rounded-lg shadow-2xl shadow-black/50
            whitespace-nowrap pointer-events-none duration-150
            ${positionClasses[position]}
            ${slideInClasses[position]}
          `}
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-[#1e2330] border-white/10 rotate-45
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

// --- KEYBOARD SHORTCUT TOOLTIP ---

interface ShortcutTooltipProps {
  children: ReactNode;
  label: string;
  shortcut?: string;
  position?: TooltipPosition;
}

export const ShortcutTooltip: React.FC<ShortcutTooltipProps> = ({
  children,
  label,
  shortcut,
  position = 'top',
}) => {
  return (
    <Tooltip
      position={position}
      content={
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
              {shortcut}
            </kbd>
          )}
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

export default Tooltip;
