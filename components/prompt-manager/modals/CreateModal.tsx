'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - CREATE MODAL
// ATHENA Architecture | Create Folder/Prompt Modal | Premium Dark Theme
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  ChevronDown,
  Folder,
  FileText,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { Overlay, ModalAnimation } from '../MotionWrappers';
import { EmojiPicker, EmojiButton } from '../EmojiPicker';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { Folder as FolderType, Prompt, TreeNode } from '@/types/prompt-manager';

// --- CREATE MODAL PROPS ---

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'folder' | 'prompt';
  parentId?: string | null;
}

// --- MAIN CREATE MODAL ---

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  type,
  parentId = null,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(type === 'folder' ? '📁' : '📄');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string | null>(parentId);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const data = usePromptManagerStore((s) => s.data);
  const { addItem, showToast } = usePromptManagerStore((s) => s.actions);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmoji(type === 'folder' ? '📁' : '📄');
      setContent('');
      setCategory('');
      setTags('');
      setTargetFolderId(parentId);
      setShowEmojiPicker(false);
    }
  }, [isOpen, type, parentId]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFolder = type === 'folder';
  const typeLabel = isFolder ? 'Pasta' : 'Prompt';

  // Get all folders for parent selection
  const getAllFolders = (items: TreeNode[]): FolderType[] => {
    const folders: FolderType[] = [];
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          folders.push(node as FolderType);
          if ((node as FolderType).children) {
            traverse((node as FolderType).children);
          }
        }
      }
    };
    traverse(items);
    return folders;
  };

  const availableFolders = getAllFolders(data);

  // Handle Create
  const handleCreate = () => {
    if (!name.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toLocaleDateString('pt-BR');

    if (isFolder) {
      const newFolder: FolderType = {
        id,
        name: name.trim(),
        type: 'folder',
        emoji,
        children: [],
      };
      addItem(newFolder, targetFolderId);
      showToast(`Pasta "${name}" criada!`, 'success');
    } else {
      const newPrompt: Prompt = {
        id,
        name: name.trim(),
        type: 'prompt',
        emoji,
        content: content.trim(),
        category: category.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        date,
      };
      addItem(newPrompt, targetFolderId);
      showToast(`Prompt "${name}" criado!`, 'success');
    }

    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalAnimation>
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-[#1e2330] rounded-xl border border-white/10 shadow-2xl w-full p-0 
            flex flex-col max-h-[90vh]
            ${!isFolder ? 'max-w-2xl' : 'max-w-md'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#1e2330] rounded-t-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {isFolder ? (
                <FolderPlus size={18} className="text-[#2979ff]" />
              ) : (
                <FilePlus size={18} className="text-[#2979ff]" />
              )}
              Criar {typeLabel}
            </h3>
            <button
              onClick={onClose}
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

              {/* Name Column */}
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
                      if (e.key === 'Enter' && isFolder) handleCreate();
                    }}
                    placeholder={`Nome da ${typeLabel}`}
                    className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-sm text-gray-200 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
                    autoFocus
                  />
                </div>

                {/* Parent Folder Selection */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                    Localização
                  </label>
                  <div className="relative">
                    <select
                      value={targetFolderId || ''}
                      onChange={(e) => setTargetFolderId(e.target.value || null)}
                      className="w-full h-9 bg-[#0f111a] border border-white/10 rounded-lg px-3 text-xs text-gray-200 focus:outline-none focus:border-[#2979ff] appearance-none cursor-pointer transition-all"
                    >
                      <option value="">📂 Raiz (Primeiro Nível)</option>
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

            {/* Prompt-specific Fields */}
            {!isFolder && (
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
                      placeholder="Ex: System, Marketing..."
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
                      placeholder="Ex: dev, react, code"
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
                    placeholder="Digite o conteúdo do prompt aqui..."
                    className="w-full h-48 bg-[#0f111a] border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all font-mono leading-relaxed resize-none custom-scrollbar"
                  />
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
              onClick={handleCreate}
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-[#2979ff] hover:bg-[#2264d1] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={14} />
              Criar {typeLabel}
            </button>
          </div>
        </div>
      </ModalAnimation>
    </Overlay>
  );
};

// --- CREATE MODAL HOOK ---

export const useCreateModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'folder' | 'prompt'>('folder');
  const [parentId, setParentId] = useState<string | null>(null);

  const openCreateModal = (
    createType: 'folder' | 'prompt',
    targetParentId: string | null = null
  ) => {
    setType(createType);
    setParentId(targetParentId);
    setIsOpen(true);
  };

  const closeCreateModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    type,
    parentId,
    openCreateModal,
    closeCreateModal,
  };
};

export default CreateModal;
