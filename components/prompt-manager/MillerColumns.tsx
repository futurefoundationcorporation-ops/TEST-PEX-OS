'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MILLER COLUMNS VIEW
// ATHENA Architecture | Four Column Navigation | Premium Dark Theme
// ============================================================================

import React, { useState } from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  Plus,
  Edit2,
  FolderOpen,
  CornerDownRight,
  Sparkles,
  Eye,
  Trash2,
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Tooltip } from './TooltipWrapper';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- COLUMN ITEM COMPONENT ---

interface ColumnItemProps {
  item: TreeNode;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isLocked: boolean;
  isDragging: boolean;
  isJustDropped: boolean;
}

const ColumnItem: React.FC<ColumnItemProps> = ({
  item,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isLocked,
  isDragging,
  isJustDropped,
}) => {
  const isFolder = item.type === 'folder';

  return (
    <div
      draggable={!isLocked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-item-id={item.id}
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-pointer 
        transition-all border
        ${isSelected 
          ? 'bg-[#2979ff]/10 border-[#2979ff]/30' 
          : 'bg-[#1e2330] border-white/5 hover:border-white/20'}
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isJustDropped ? 'ring-2 ring-green-500 animate-success-pulse' : ''}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg">{item.emoji || (isFolder ? '📁' : '📄')}</span>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
            {item.name}
          </p>
          <p className="text-[10px] text-gray-400">
            {isFolder 
              ? `${(item as FolderType).children?.length || 0} itens`
              : (item as Prompt).category || 'Prompt'
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Actions - Always Visible */}
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Edit2 size={12} />
        </button>
        {!isLocked && onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
        {isFolder && (
          <ChevronRight 
            size={14} 
            className={`text-gray-400 transition-colors ml-1 ${isSelected ? 'text-[#2979ff]' : ''}`} 
          />
        )}
      </div>
    </div>
  );
};

// --- COLUMN COMPONENT ---

interface ColumnProps {
  title: string;
  icon: React.ReactNode;
  items: TreeNode[];
  selectedId: string | null;
  onSelect: (item: TreeNode) => void;
  onEdit: (item: TreeNode) => void;
  onDelete: (item: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, item: TreeNode) => void;
  onNewItem?: () => void;
  newItemLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  columnType: 'root' | 'subfolder' | 'prompt';
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isLocked: boolean;
  draggedItemId: string | null;
  justDroppedId: string | null;
  onDragStart: (e: React.DragEvent, item: TreeNode) => void;
  onItemDragOver: (e: React.DragEvent) => void;
  onItemDragLeave: (e: React.DragEvent) => void;
  onItemDrop: (e: React.DragEvent, item: TreeNode) => void;
}

const Column: React.FC<ColumnProps> = ({
  title,
  icon,
  items,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onContextMenu,
  onNewItem,
  newItemLabel,
  emptyTitle,
  emptyDescription,
  columnType,
  onDragOver,
  onDrop,
  isLocked,
  draggedItemId,
  justDroppedId,
  onDragStart,
  onItemDragOver,
  onItemDragLeave,
  onItemDrop,
}) => {
  return (
    <div
      className={`
        min-w-[280px] max-w-[280px] flex flex-col shrink-0
        ${columnType === 'prompt' ? 'min-w-[320px] max-w-[320px]' : ''} bg-[#0f111a]
      `}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#13161c]">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </span>
        {onNewItem && (
          <Tooltip content={newItemLabel || 'Novo'} position="bottom">
            <button
              onClick={onNewItem}
              disabled={isLocked}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <FolderOpen size={20} className="opacity-50" />
            </div>
            <p className="text-xs font-medium text-gray-400">{emptyTitle}</p>
            <p className="text-[10px] mt-1 opacity-60 max-w-[150px]">{emptyDescription}</p>
          </div>
        ) : (
          items.map((item) => (
            <ColumnItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => onSelect(item)}
              onEdit={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              onContextMenu={(e) => onContextMenu(e, item)}
              onDragStart={(e) => onDragStart(e, item)}
              onDragOver={onItemDragOver}
              onDragLeave={onItemDragLeave}
              onDrop={(e) => onItemDrop(e, item)}
              isLocked={isLocked}
              isDragging={draggedItemId === item.id}
              isJustDropped={justDroppedId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- PREVIEW PANEL COMPONENT ---

interface PreviewPanelProps {
  prompt: Prompt | null;
  onEdit: () => void;
  onOpenFull: () => void;
  isLocked: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  prompt,
  onEdit,
  onOpenFull,
  isLocked,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = usePromptManagerStore((s) => s.actions);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.content || '');
      setIsCopied(true);
      showToast('Copiado!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!prompt) {
    return (
      <div className="flex-1 min-w-[350px] flex flex-col items-center justify-center bg-[#13161c] border-l border-white/5 text-gray-500/50 p-6">
        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
          <Eye size={28} className="opacity-40" />
        </div>
        <p className="text-sm font-medium text-gray-400">Preview</p>
        <p className="text-xs mt-1 text-gray-500 text-center max-w-[200px]">
          Selecione um prompt para visualizar
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[350px] flex flex-col bg-[#13161c] border-l border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-[#181b24]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2979ff]/20 to-purple-500/20 flex items-center justify-center text-2xl shadow-lg">
            {prompt.emoji || '📄'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">{prompt.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                {prompt.category || 'Geral'}
              </span>
              <span>•</span>
              <span>{prompt.date}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFull}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2979ff] hover:bg-[#2264d1] text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            <ExternalLink size={14} />
            Abrir Completo
          </button>
          <Tooltip content="Editar" position="bottom">
            <button
              onClick={onEdit}
              disabled={isLocked}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Edit2 size={16} />
            </button>
          </Tooltip>
          <Tooltip content={isCopied ? 'Copiado!' : 'Copiar'} position="bottom">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                isCopied
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </Tooltip>
          <Tooltip content="Compartilhar" position="bottom">
            <button
              onClick={() => showToast('Compartilhando...', 'info')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Share2 size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Content Preview */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="bg-[#0f111a] border border-white/5 rounded-lg p-4 shadow-inner min-h-[200px]">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {prompt.content || 'Sem conteúdo'}
          </pre>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/5 bg-[#0f111a]/50">
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{prompt.content?.length || 0} caracteres</span>
          <span>Atualizado: {prompt.date}</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN MILLER COLUMNS VIEW ---

export const MillerColumns: React.FC = () => {
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);

  const data = usePromptManagerStore((s) => s.data);
  const selectedFolder = usePromptManagerStore((s) => s.selectedFolder);
  const selectedSubfolder = usePromptManagerStore((s) => s.selectedSubfolder);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const dragState = usePromptManagerStore((s) => s.dragState);
  const justDroppedId = usePromptManagerStore((s) => s.justDroppedId);
  const {
    setSelectedFolder,
    setSelectedSubfolder,
    setSelectedPrompt,
    setPromptViewerOpen,
    setDragState,
    openEditModal,
    showToast,
    moveItem,
    getValidMoveTargets,
    setMoveSelector,
    findItem,
    isDescendant,
  } = usePromptManagerStore((s) => s.actions);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  // --- Derived State ---

  const rootFolders = data.filter((item) => item.type === 'folder') as FolderType[];
  
  const subFolders = selectedFolder 
    ? (selectedFolder.children || []).filter((i) => i.type === 'folder') as FolderType[]
    : [];
  
  const prompts = selectedSubfolder 
    ? (selectedSubfolder.children || []).filter((i) => i.type === 'prompt') as Prompt[]
    : selectedFolder 
      ? (selectedFolder.children || []).filter((i) => i.type === 'prompt') as Prompt[]
      : [];

  // --- Handlers ---

  const handleFolderSelect = (folder: FolderType) => {
    setSelectedFolder(folder);
    setPreviewPrompt(null);
  };

  const handleSubfolderSelect = (subfolder: FolderType) => {
    setSelectedSubfolder(subfolder);
    setPreviewPrompt(null);
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setPreviewPrompt(prompt);
  };

  const handlePromptOpen = () => {
    if (previewPrompt) {
      setSelectedPrompt(previewPrompt);
      setPromptViewerOpen(true);
    }
  };

  const handleEdit = (item: TreeNode) => {
    openEditModal(item, item.type === 'prompt');
  };

  const handleDelete = (item: TreeNode) => {
    if (isLocked) {
      showToast('Desbloqueie para excluir', 'warning');
      return;
    }
    showToast(`Excluir "${item.name}"?`, 'warning');
  };

  const handleNewFolder = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar', 'warning');
      return;
    }
    showToast('Criar nova pasta...', 'info');
  };

  const handleNewSubfolder = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar', 'warning');
      return;
    }
    if (!selectedFolder) {
      showToast('Selecione uma pasta primeiro', 'warning');
      return;
    }
    showToast('Criar subpasta...', 'info');
  };

  const handleNewPrompt = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar', 'warning');
      return;
    }
    if (!selectedFolder && !selectedSubfolder) {
      showToast('Selecione uma pasta primeiro', 'warning');
      return;
    }
    showToast('Criar prompt...', 'info');
  };

  // --- Drag & Drop ---

  const handleDragStart = (e: React.DragEvent, item: TreeNode) => {
    if (isLocked) {
      e.preventDefault();
      showToast('Desbloqueie para arrastar', 'warning');
      return;
    }
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDragState({ draggedItemId: item.id, draggedItemType: item.type });
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
  };

  const handleItemDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
  };

  const handleItemDrop = (e: React.DragEvent, targetItem: TreeNode) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');

    const draggedId = dragState.draggedItemId;
    if (!draggedId || draggedId === targetItem.id) {
      setDragState({ draggedItemId: null, draggedItemType: null });
      return;
    }

    // Validate move
    const draggedItem = findItem(draggedId);
    if (draggedItem?.type === 'folder' && targetItem.type === 'folder') {
      if (isDescendant(draggedId, targetItem.id)) {
        showToast('Não é possível mover para dentro de si mesmo', 'error');
        setDragState({ draggedItemId: null, draggedItemType: null });
        return;
      }
    }

    if (targetItem.type === 'folder') {
      moveItem(draggedId, targetItem.id);
    } else {
      showToast('Solte sobre uma pasta', 'info');
    }

    setDragState({ draggedItemId: null, draggedItemType: null });
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColumnDrop = (e: React.DragEvent, columnType: string) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();

    const draggedId = dragState.draggedItemId;
    if (!draggedId) return;

    const draggedItem = findItem(draggedId);
    if (!draggedItem) return;

    // Check if dropped on empty space (not on an item)
    const isDropOnContainer = !(e.target as HTMLElement).closest('[data-item-id]');

    if (isDropOnContainer) {
      const validTargets = getValidMoveTargets(draggedId);
      setMoveSelector({
        open: true,
        draggedId,
        draggedType: draggedItem.type,
        availableTargets: validTargets,
      });
    }

    setDragState({ draggedItemId: null, draggedItemType: null });
  };

  return (
    <>
      <div className="flex h-full divide-x divide-white/5 overflow-x-auto">
        {/* Column 1: Root Folders */}
        <Column
          title="Pastas"
          icon={<Folder size={14} />}
          items={rootFolders}
          selectedId={selectedFolder?.id || null}
          onSelect={handleFolderSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContextMenu={openContextMenu}
          onNewItem={handleNewFolder}
          newItemLabel="Nova Pasta"
          emptyTitle="Sem pastas"
          emptyDescription="Crie sua primeira pasta"
          columnType="root"
          onDragOver={handleColumnDragOver}
          onDrop={(e) => handleColumnDrop(e, 'root')}
          isLocked={isLocked}
          draggedItemId={dragState.draggedItemId}
          justDroppedId={justDroppedId}
          onDragStart={handleDragStart}
          onItemDragOver={handleItemDragOver}
          onItemDragLeave={handleItemDragLeave}
          onItemDrop={handleItemDrop}
        />

        {/* Column 2: Subfolders */}
        <Column
          title="Subpastas"
          icon={<CornerDownRight size={14} />}
          items={subFolders}
          selectedId={selectedSubfolder?.id || null}
          onSelect={handleSubfolderSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContextMenu={openContextMenu}
          onNewItem={handleNewSubfolder}
          newItemLabel="Nova Subpasta"
          emptyTitle={selectedFolder ? 'Vazio' : 'Nenhuma pasta selecionada'}
          emptyDescription={selectedFolder ? 'Sem subpastas aqui' : 'Selecione uma pasta raiz'}
          columnType="subfolder"
          onDragOver={handleColumnDragOver}
          onDrop={(e) => handleColumnDrop(e, 'subfolder')}
          isLocked={isLocked}
          draggedItemId={dragState.draggedItemId}
          justDroppedId={justDroppedId}
          onDragStart={handleDragStart}
          onItemDragOver={handleItemDragOver}
          onItemDragLeave={handleItemDragLeave}
          onItemDrop={handleItemDrop}
        />

        {/* Column 3: Prompts */}
        <Column
          title="Prompts"
          icon={<Sparkles size={14} />}
          items={prompts}
          selectedId={previewPrompt?.id || null}
          onSelect={(item) => handlePromptSelect(item as Prompt)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContextMenu={openContextMenu}
          onNewItem={handleNewPrompt}
          newItemLabel="Novo Prompt"
          emptyTitle={selectedFolder ? 'Nenhum prompt' : 'Nenhuma pasta selecionada'}
          emptyDescription={selectedFolder ? 'Esta pasta está vazia' : 'Navegue pelas pastas'}
          columnType="prompt"
          onDragOver={handleColumnDragOver}
          onDrop={(e) => handleColumnDrop(e, 'prompt')}
          isLocked={isLocked}
          draggedItemId={dragState.draggedItemId}
          justDroppedId={justDroppedId}
          onDragStart={handleDragStart}
          onItemDragOver={handleItemDragOver}
          onItemDragLeave={handleItemDragLeave}
          onItemDrop={handleItemDrop}
        />

        {/* Column 4: Preview Panel */}
        <PreviewPanel
          prompt={previewPrompt}
          onEdit={() => previewPrompt && handleEdit(previewPrompt)}
          onOpenFull={handlePromptOpen}
          isLocked={isLocked}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={closeContextMenu}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default MillerColumns;
