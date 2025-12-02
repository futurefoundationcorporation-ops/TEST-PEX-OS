'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MOTION WRAPPERS
// ATHENA Architecture | Animation Components
// ============================================================================

import React, { ReactNode, CSSProperties } from 'react';

// --- ANIMATED TREE ITEM (Expandable Content) ---

interface AnimatedTreeItemProps {
  children: ReactNode;
  isExpanded: boolean;
  id?: string;
}

export const AnimatedTreeItem: React.FC<AnimatedTreeItemProps> = ({
  children,
  isExpanded,
}) => {
  const style: CSSProperties = {
    transition: 'grid-template-rows 200ms ease-out, opacity 200ms ease-out',
    gridTemplateRows: isExpanded ? '1fr' : '0fr',
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
  };

  return (
    <div style={style} className="grid">
      <div className="min-h-0">{children}</div>
    </div>
  );
};

// --- FADE IN/OUT ---

interface FadeProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  show,
  duration = 200,
  className = '',
}) => {
  if (!show) return null;

  return (
    <div
      className={`animate-in fade-in ${className}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// --- SLIDE UP FADE ---

interface SlideUpFadeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const SlideUpFade: React.FC<SlideUpFadeProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <div
      className={`animate-slide-up-fade ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- SCALE IN ---

interface ScaleInProps {
  children: ReactNode;
  show: boolean;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  show,
  className = '',
}) => {
  if (!show) return null;

  return (
    <div className={`animate-in zoom-in-95 fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
};

// --- STAGGER CONTAINER ---

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 50,
  className = '',
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <div
            className="animate-slide-up-fade"
            style={{ animationDelay: `${index * staggerDelay}ms` }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

// --- PULSE ON SUCCESS ---

interface PulseSuccessProps {
  children: ReactNode;
  active: boolean;
  className?: string;
}

export const PulseSuccess: React.FC<PulseSuccessProps> = ({
  children,
  active,
  className = '',
}) => {
  return (
    <div className={`${active ? 'animate-success-pulse' : ''} ${className}`}>
      {children}
    </div>
  );
};

// --- SHIMMER LOADING ---

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
}) => {
  return (
    <div
      className={`animate-shimmer rounded bg-white/5 ${className}`}
      style={{ width, height }}
    />
  );
};

// --- SLIDE DIRECTIONS (For Sequential Navigation) ---

interface SlideViewProps {
  children: ReactNode;
  direction: 'left' | 'right' | 'none';
  className?: string;
}

export const SlideView: React.FC<SlideViewProps> = ({
  children,
  direction,
  className = '',
}) => {
  const directionClasses = {
    left: 'animate-slide-left',
    right: 'animate-slide-right',
    none: 'animate-in fade-in zoom-in-95 duration-300',
  };

  return (
    <div className={`${directionClasses[direction]} ${className}`}>
      {children}
    </div>
  );
};

// --- MODAL BOUNCE ---

interface ModalAnimationProps {
  children: ReactNode;
  className?: string;
}

export const ModalAnimation: React.FC<ModalAnimationProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`animate-modal-bounce ${className}`}>
      {children}
    </div>
  );
};

// --- OVERLAY FADE ---

interface OverlayProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const Overlay: React.FC<OverlayProps> = ({
  children,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`
        fixed inset-0 z-[200] flex items-center justify-center 
        bg-black/70 backdrop-blur-sm 
        animate-in fade-in duration-200
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// --- DRAG GHOST ---

export const createDragGhost = (name: string): HTMLElement => {
  const ghost = document.createElement('div');
  ghost.style.padding = '12px 24px';
  ghost.style.background = '#2979ff';
  ghost.style.color = 'white';
  ghost.style.borderRadius = '8px';
  ghost.style.fontWeight = 'bold';
  ghost.style.boxShadow = '0 10px 25px rgba(41, 121, 255, 0.4)';
  ghost.style.zIndex = '9999';
  ghost.style.position = 'absolute';
  ghost.style.top = '-1000px';
  ghost.innerText = name;
  document.body.appendChild(ghost);
  
  // Clean up after drag
  setTimeout(() => {
    if (ghost.parentNode) {
      document.body.removeChild(ghost);
    }
  }, 0);
  
  return ghost;
};

// --- CSS KEYFRAMES (To be included in global styles) ---

export const motionStyles = `
  /* Slide Up Fade */
  @keyframes slideUpFade {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95); 
      filter: blur(4px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
      filter: blur(0);
    }
  }
  .animate-slide-up-fade {
    animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  /* Modal Bounce In */
  @keyframes modalBounceIn {
    0% { 
      opacity: 0; 
      transform: scale(0.9) translateY(30px); 
    }
    60% { 
      opacity: 1; 
      transform: scale(1.02) translateY(-5px); 
    }
    100% { 
      transform: scale(1) translateY(0); 
    }
  }
  .animate-modal-bounce {
    animation: modalBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  /* Success Pulse */
  @keyframes successPulse {
    0%, 100% { 
      transform: scale(1); 
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); 
    }
    50% { 
      transform: scale(1.03); 
      box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); 
    }
  }
  .animate-success-pulse {
    animation: successPulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
  }
  
  /* Shimmer */
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.05) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  /* Error Shake */
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-error-shake {
    animation: errorShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }
  
  /* Slide Left (Navigation Forward) */
  @keyframes slideLeft {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slide-left {
    animation: slideLeft 0.3s ease-out forwards;
  }
  
  /* Slide Right (Navigation Back) */
  @keyframes slideRight {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slide-right {
    animation: slideRight 0.3s ease-out forwards;
  }
  
  /* Pop In Menu */
  @keyframes popInMenu {
    0% { 
      opacity: 0; 
      transform: scale(0.9) translateY(-10px); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  .animate-pop-in-menu {
    animation: popInMenu 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export default AnimatedTreeItem;
