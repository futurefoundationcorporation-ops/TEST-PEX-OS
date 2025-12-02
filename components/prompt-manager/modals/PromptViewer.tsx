'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - PROMPT VIEWER MODAL
// ATHENA Architecture | Premium Dark Theme | Focus Reading Mode
// ============================================================================

import React, { useState } from 'react';
import {
  X,
  Edit2,
  Copy,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Overlay } from '../MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';

// --- SMART CLICK HOOK ---

const useIntentionalClick = (onIntentionalClick: () => void) => {
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownPos) return;

    const deltaX = Math.abs(e.clientX - mouseDownPos.x);
    const deltaY = Math.abs(e.clientY - mouseDownPos.y);
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance < 5) {
      onIntentionalClick();
    }

    setMouseDownPos(null);
  };

  return { handleMouseDown, handleMouseUp };
};

// --- MAIN PROMPT VIEWER ---

export const PromptViewer: React.FC = () => {
  const isOpen = usePromptManagerStore((s) => s.isPromptViewerOpen);
  const prompt = usePromptManagerStore((s) => s.selectedPrompt);
  const { setPromptViewerOpen, openEditModal } = usePromptManagerStore((s) => s.actions);

  const [isCopied, setIsCopied] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const { handleMouseDown, handleMouseUp } = useIntentionalClick(() => setPromptViewerOpen(false));

  if (!isOpen || !prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEdit = () => {
    setPromptViewerOpen(false);
    openEditModal(prompt, true);
  };

  return (
    <Overlay
      className="backdrop-blur-sm bg-black/80"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full 
          flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 transition-all
          ${isFocusMode 
            ? 'max-w-5xl h-[85vh] border-[#2979ff]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
            : 'max-w-3xl'}
        `}
      >
        {/* Header */}
        <div
          className={`
            flex items-center justify-between p-5 border-b border-white/5 shrink-0 
            transition-opacity duration-300
            ${isFocusMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979ff]/20 to-purple-500/20 flex items-center justify-center text-2xl">
              {prompt.emoji || '📄'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{prompt.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  {prompt.category || 'Geral'}
                </span>
                <span>•</span>
                <span>{prompt.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`
                p-2 rounded-lg transition-colors
                ${isFocusMode 
                  ? 'bg-[#2979ff] text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'}
              `}
              title={isFocusMode ? 'Sair do Modo Foco' : 'Modo Foco'}
            >
              {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            
            {!isFocusMode && (
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
            )}
            
            <button
              onClick={() => setPromptViewerOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`
            flex-1 overflow-y-auto custom-scrollbar bg-[#0f111a]/30 
            transition-all duration-500
            ${isFocusMode ? 'p-10' : 'p-6'}
          `}
        >
          <div
            className={`
              prose prose-invert max-w-none mx-auto transition-all duration-500
              ${isFocusMode ? 'max-w-4xl' : ''}
            `}
          >
            <div
              className={`
                bg-[#0f111a] border border-white/5 rounded-lg font-mono leading-relaxed 
                text-gray-300 whitespace-pre-wrap shadow-inner transition-all duration-500
                ${isFocusMode 
                  ? 'p-10 text-lg border-none bg-transparent shadow-none' 
                  : 'p-6 text-sm'}
              `}
            >
              {prompt.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
            p-5 border-t border-white/5 bg-[#13161c] flex justify-between items-center shrink-0 
            transition-opacity duration-300
            ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}
          `}
        >
          <div className="flex gap-2">
            {prompt.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <button
            onClick={handleCopy}
            className={`
              px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
              ${isCopied 
                ? 'bg-green-500 text-white' 
                : 'bg-[#2979ff] hover:bg-[#2264d1] text-white'}
            `}
          >
            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copiado!' : 'Copiar Prompt'}
          </button>
        </div>
      </div>
    </Overlay>
  );
};

export default PromptViewer;
