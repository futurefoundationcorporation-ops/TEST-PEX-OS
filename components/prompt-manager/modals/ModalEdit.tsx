'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - EDIT MODAL
// ATHENA Architecture | Premium Dark Theme
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Edit2,
  ArrowDownToLine,
  Package,
} from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { EmojiPicker, EmojiButton } from '../EmojiPicker';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder, Prompt } from '@/types/prompt-manager';

// --- SMART CLICK HOOK (Prevents accidental closes on drag) ---

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

// --- MAIN EDIT MODAL ---

export const ModalEdit: React.FC = () => {
  const { isOpen, item, isFullEdit, isImport } = usePromptManagerStore((s) => s.editModal);
  const data = usePromptManagerStore((s) => s.data);
  const { closeEditModal, updateItem, importPackage, showToast, moveItem } = 
    usePromptManagerStore((s) => s.actions);

  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📄');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown, handleMouseUp } = useIntentionalClick(closeEditModal);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setName(item.name);
      setEmoji(item.emoji || '📄');
      setTargetFolderId('');
      setShowEmojiPicker(false);

      if (item.type === 'prompt') {
        const prompt = item as Prompt;
        setContent(prompt.content || '');
        setCategory(prompt.category || '');
        setTags(prompt.tags?.join(', ') || '');
      }
    }
  }, [isOpen, item]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditModal();
      }
      // Tab trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEditModal]);

  if (!isOpen || !item) return null;

  const isPrompt = item.type === 'prompt';
  const itemType = item.type === 'folder' ? 'Pasta' : 'Prompt';

  // Get all folders for move selector
  const getAllFolders = (items: TreeNode[]): Folder[] => {
    const folders: Folder[] = [];
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder' && node.id !== item.id) {
          folders.push(node as Folder);
          if ((node as Folder).children) {
            traverse((node as Folder).children);
          }
        }
      }
    };
    traverse(items);
    return folders;
  };

  const availableFolders = getAllFolders(data);

  // Handle Save
  const handleSave = () => {
    if (!name.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    if (isImport) {
      // Import mode
      const targetId = targetFolderId || null;
      importPackage({ ...item, name: name.trim(), emoji } as Folder, targetId);
      closeEditModal();
      return;
    }

    // Regular edit
    const updates: Partial<TreeNode> = {
      name: name.trim(),
      emoji,
    };

    if (isPrompt) {
      Object.assign(updates, {
        content,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    }

    updateItem(item.id, updates);

    // Move if target folder selected
    if (targetFolderId && targetFolderId !== '') {
      const target = targetFolderId === 'root' ? null : targetFolderId;
      moveItem(item.id, target);
    }

    showToast('Atualizado com sucesso!', 'success');
    closeEditModal();
  };

  // Render import preview tree
  const renderImportPreview = (children: TreeNode[], depth = 0) => {
    if (!children || children.length === 0) return null;
    const maxItems = depth === 0 ? 5 : 3;
    
    return (
      <ul className={`mt-1 space-y-1 ${depth > 0 ? 'ml-3 border-l border-white/10 pl-2' : ''}`}>
        {children.slice(0, maxItems).map((child) => (
          <li key={child.id} className="flex items-center gap-2 text-[11px] text-gray-300">
            <span>{child.type === 'folder' ? '📁' : '📄'}</span>
            <span className="truncate">{child.name}</span>
            {child.type === 'folder' && (child as Folder).children?.length > 0 && (
              <>
                <span className="text-[9px] bg-white/5 px-1 rounded">
                  {(child as Folder).children.length} itens
                </span>
                {renderImportPreview((child as Folder).children, depth + 1)}
              </>
            )}
          </li>
        ))}
        {children.length > maxItems && (
          <li className="text-[10px] text-gray-400 italic pl-4">
            ... e mais {children.length - maxItems} itens
          </li>
        )}
      </ul>
    );
  };

  return (
    <Overlay onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <ModalAnimation>
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full p-0 
            flex flex-col max-h-[90vh]
            ${(isFullEdit || isImport) && isPrompt ? 'max-w-2xl' : 'max-w-md'}
            ${isImport ? 'ring-2 ring-emerald-500/50' : ''}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#1e2330] rounded-t-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {isImport && <ArrowDownToLine size={16} className="text-emerald-400" />}
              {isImport ? 'Receber Transferência' : `Editar ${itemType}`}
            </h3>
            <button
              onClick={closeEditModal}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {/* Metadata Grid */}
            <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
              {/* Emoji Column */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Ícone</label>
                <EmojiButton
                  emoji={emoji}
                  onOpenPicker={() => setShowEmojiPicker(!showEmojiPicker)}
                />
              </div>

              {/* Name & Location Column */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isFullEdit && !isImport) handleSave();
                    }}
                    placeholder={`Nome da ${itemType}`}
                    className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-200 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                    autoFocus
                  />
                </div>

                {/* Location Selector */}
                <details className="group" open={isImport}>
                  <summary className="cursor-pointer p-3 bg-[#0f111a]/30 hover:bg-[#0f111a]/50 rounded-lg border border-white/10 transition-all list-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={14}
                          className="text-gray-500 group-open:rotate-90 transition-transform"
                        />
                        <FolderOpen size={14} className="text-gray-500" />
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                          {isImport ? 'Destino da Importação' : 'Mover para Pasta (Opcional)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-600 group-open:hidden">
                        {targetFolderId ? '1 pasta selecionada' : 'Clique para expandir'}
                      </span>
                    </div>
                  </summary>

                  <div className="mt-2 p-3 bg-[#0f111a]/20 rounded-lg border border-white/5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                      Localização
                    </label>
                    <div className="relative">
                      <select
                        value={targetFolderId}
                        onChange={(e) => setTargetFolderId(e.target.value)}
                        className={`
                          w-full h-9 bg-[#0f111a] border rounded-lg px-3 text-xs text-gray-200 
                          focus:outline-none focus:border-[#2979ff] appearance-none cursor-pointer transition-all
                          ${isImport ? 'border-emerald-500/30' : 'border-white/10'}
                        `}
                      >
                        <option value="">
                          {isImport ? '📂 Raiz (Padrão)' : '📍 Manter atual'}
                        </option>
                        {!isImport && <option value="root">📂 Mover para Raiz</option>}
                        {availableFolders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.emoji} {f.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="animate-in slide-in-from-top-2 duration-200 mb-4 p-2 bg-[#0f111a] rounded-lg border border-white/5">
                <EmojiPicker
                  onSelect={(e) => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                  }}
                  selectedEmoji={emoji}
                />
              </div>
            )}

            {/* Import Preview */}
            {isImport && item.type === 'folder' && (item as Folder).children && (
              <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Package size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Conteúdo</span>
                </div>
                <div className="bg-[#0f111a]/50 rounded-lg p-2 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                  {renderImportPreview((item as Folder).children)}
                </div>
              </div>
            )}

            {/* Prompt Extra Fields */}
            {((isFullEdit && isPrompt) || (isImport && isPrompt && !(item as any).children)) && (
              <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Ex: System..."
                      className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Ex: dev, react"
                      className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">
                    Conteúdo do Prompt
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Digite o prompt aqui..."
                    className="w-full h-48 bg-[#0f111a] border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all font-mono leading-relaxed resize-none custom-scrollbar"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/5 bg-[#1e2330] rounded-b-xl shrink-0">
            <button
              onClick={closeEditModal}
              className="px-4 py-2 text-xs font-medium rounded-lg text-gray-300 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className={`
                px-5 py-2 text-xs font-bold rounded-lg text-white transition-all shadow-lg 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                ${isImport 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
                  : 'bg-[#2979ff] hover:bg-[#2264d1] shadow-blue-900/20'}
              `}
            >
              {isImport ? (
                <><ArrowDownToLine size={14} /> Importar</>
              ) : (
                <><Check size={14} /> Salvar</>
              )}
            </button>
          </div>
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

export default ModalEdit;
