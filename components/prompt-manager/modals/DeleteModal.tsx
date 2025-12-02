'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - DELETE MODAL
// ATHENA Architecture | Confirmation Modal | Premium Dark Theme
// ============================================================================

import React, { useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  AlertTriangle,
  Folder,
  FileText,
} from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- DELETE MODAL PROPS ---

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TreeNode | null;
  onConfirm?: (item: TreeNode) => void;
}

// --- MAIN DELETE MODAL ---

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { deleteItem, showToast, clearSelection } = usePromptManagerStore((s) => s.actions);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter') {
        handleDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const isFolder = item.type === 'folder';
  const typeLabel = isFolder ? 'pasta' : 'prompt';
  const childrenCount = isFolder ? (item as FolderType).children?.length || 0 : 0;
  const hasChildren = childrenCount > 0;

  // Count total items (recursive)
  const countTotalItems = (folder: FolderType): number => {
    let count = folder.children?.length || 0;
    folder.children?.forEach((child) => {
      if (child.type === 'folder') {
        count += countTotalItems(child as FolderType);
      }
    });
    return count;
  };

  const totalItems = isFolder ? countTotalItems(item as FolderType) : 0;

  const handleDelete = () => {
    if (!item) return;

    if (onConfirm) {
      onConfirm(item);
    } else {
      deleteItem(item.id);
      clearSelection();
      showToast(`${isFolder ? 'Pasta' : 'Prompt'} "${item.name}" excluído!`, 'success');
    }

    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalAnimation>
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full max-w-md p-0 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#1e2330] rounded-t-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Confirmar Exclusão
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Item Preview */}
            <div className="flex items-center gap-4 p-4 bg-[#0f111a] rounded-xl border border-white/5 mb-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                ${isFolder ? 'bg-[#2979ff]/10' : 'bg-emerald-500/10'}
              `}>
                {item.emoji || (isFolder ? '📁' : '📄')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                  {isFolder ? (
                    <>
                      <Folder size={12} />
                      <span>Pasta</span>
                      {hasChildren && (
                        <>
                          <span>•</span>
                          <span>{childrenCount} itens diretos</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <FileText size={12} />
                      <span>Prompt</span>
                      {(item as Prompt).category && (
                        <>
                          <span>•</span>
                          <span>{(item as Prompt).category}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl mb-4">
              <p className="text-sm text-gray-300">
                Você está prestes a excluir {isFolder ? 'a pasta' : 'o prompt'}{' '}
                <span className="font-bold text-white">"{item.name}"</span>.
              </p>

              {hasChildren && (
                <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Atenção
                    </span>
                  </div>
                  <p className="text-xs text-red-300">
                    Esta pasta contém{' '}
                    <span className="font-bold">{totalItems} item(s)</span> que
                    também serão excluídos permanentemente.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            {/* Prompt Content Preview (for prompts) */}
            {!isFolder && (item as Prompt).content && (
              <div className="mb-4">
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">
                  Preview do Conteúdo
                </label>
                <div className="p-3 bg-[#0f111a] rounded-lg border border-white/5 max-h-24 overflow-y-auto custom-scrollbar">
                  <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap">
                    {(item as Prompt).content.substring(0, 200)}
                    {(item as Prompt).content.length > 200 && '...'}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/5 bg-[#1e2330] rounded-b-xl shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-gray-300 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Excluir {isFolder ? 'Pasta' : 'Prompt'}
            </button>
          </div>
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

// --- DELETE MODAL HOOK ---

export const useDeleteModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [item, setItem] = React.useState<TreeNode | null>(null);

  const openDeleteModal = (targetItem: TreeNode) => {
    setItem(targetItem);
    setIsOpen(true);
  };

  const closeDeleteModal = () => {
    setIsOpen(false);
    setItem(null);
  };

  return {
    isOpen,
    item,
    openDeleteModal,
    closeDeleteModal,
  };
};

export default DeleteModal;
