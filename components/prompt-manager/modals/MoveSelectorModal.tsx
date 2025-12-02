'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MOVE SELECTOR MODAL
// ATHENA Architecture | Smart Drop Target Selection
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Folder } from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';

export const MoveSelectorModal: React.FC = () => {
  const moveSelector = usePromptManagerStore((s) => s.moveSelector);
  const { closeMoveSelector, moveItem, showToast } = usePromptManagerStore((s) => s.actions);

  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset selection when modal opens
  useEffect(() => {
    if (moveSelector.open) {
      setSelectedTargetId('');
    }
  }, [moveSelector.open]);

  // Keyboard handling
  useEffect(() => {
    if (!moveSelector.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMoveSelector();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [moveSelector.open, closeMoveSelector]);

  if (!moveSelector.open || !moveSelector.draggedId) return null;

  const handleConfirm = () => {
    if (selectedTargetId && moveSelector.draggedId) {
      const targetId = selectedTargetId === 'root' ? null : selectedTargetId;
      moveItem(moveSelector.draggedId, targetId);
      showToast('Item movido com sucesso!', 'success');
    }
    closeMoveSelector();
  };

  return (
    <Overlay onClick={closeMoveSelector}>
      <ModalAnimation>
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-lg p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {moveSelector.draggedType === 'folder' ? 'Mover Pasta e Conteúdo' : 'Mover Prompt'}
            </h3>
            <button
              onClick={closeMoveSelector}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Target Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 block mb-3">
              Selecione o destino:
            </label>
            <div className="max-h-80 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg bg-[#0f111a] p-2">
              {/* Root Option */}
              <div
                onClick={() => setSelectedTargetId('root')}
                className={`
                  p-3 hover:bg-white/5 rounded cursor-pointer transition-colors
                  ${selectedTargetId === 'root' ? 'bg-[#2979ff]/10' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center
                      ${selectedTargetId === 'root' ? 'ring-2 ring-[#2979ff]' : ''}
                    `}
                  >
                    📁
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium ${selectedTargetId === 'root' ? 'text-white' : 'text-gray-300'}`}>
                      📂 Raiz (Primeiro Nível)
                    </div>
                    <div className="text-xs text-gray-400">Mover para o nível superior</div>
                  </div>
                  {selectedTargetId === 'root' && (
                    <Check size={16} className="text-[#2979ff] shrink-0" />
                  )}
                </div>
              </div>

              <div className="h-px bg-white/10 my-2" />

              {/* Folder Options */}
              {moveSelector.availableTargets.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedTargetId(folder.id)}
                  className={`
                    p-3 hover:bg-white/5 rounded cursor-pointer transition-colors
                    ${selectedTargetId === folder.id ? 'bg-[#2979ff]/10' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg
                        ${selectedTargetId === folder.id ? 'ring-2 ring-[#2979ff]' : ''}
                      `}
                    >
                      {folder.emoji || '📁'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium truncate ${selectedTargetId === folder.id ? 'text-white' : 'text-gray-300'}`}>
                        {folder.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {folder.children?.length || 0} itens
                      </div>
                    </div>
                    {selectedTargetId === folder.id && (
                      <Check size={16} className="text-[#2979ff] shrink-0" />
                    )}
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {moveSelector.availableTargets.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma pasta disponível como destino
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              onClick={closeMoveSelector}
              className="px-4 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTargetId}
              className="px-6 py-2 text-sm font-bold bg-[#2979ff] hover:bg-[#2264d1] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Movimento
            </button>
          </div>
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

export default MoveSelectorModal;
