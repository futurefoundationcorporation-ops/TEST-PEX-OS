'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - MILLER COLUMNS VIEW
// ATHENA Architecture | Three Column Navigation | Premium Dark Theme
// ============================================================================

import React from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  Plus,
  Edit2,
  FolderOpen,
  CornerDownRight,
  Sparkles,
  Layout,
} from 'lucide-react';
import { Tooltip } from './TooltipWrapper';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- COLUMN ITEM COMPONENT ---

interface ColumnItemProps {
  item: TreeNode;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
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
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 size={12} />
        </button>
        {isFolder && (
          <ChevronRight 
            size={14} 
            className={`text-gray-400 transition-colors ${isSelected ? 'text-[#2979ff]' : ''}`} 
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
        min-w-[300px] max-w-[300px] flex flex-col 
        ${columnType === 'prompt' ? 'flex-1 min-w-[350px] max-w-none bg-[#13161c]' : 'bg-[#0f111a]'}
      `}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className={`
        p-3 border-b border-white/5 flex justify-between items-center
        ${columnType === 'prompt' ? 'bg-[#181b24]' : 'bg-[#13161c]'}
      `}>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </span>
        {onNewItem && (
          <button
            onClick={onNewItem}
            className={`
              ${columnType === 'prompt' 
                ? 'flex items-center gap-1 px-3 py-1.5 bg-[#2979ff] hover:bg-[#2264d1] text-white text-xs font-bold rounded-lg'
                : 'p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors'}
            `}
            title={newItemLabel}
          >
            <Plus size={14} />
            {columnType === 'prompt' && <span>{newItemLabel}</span>}
          </button>
        )}
      </div>

      {/* Column Content */}
      <div className={`
        flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar
        ${columnType === 'subfolder' ? 'bg-[#0f111a]/50' : ''}
        ${columnType === 'prompt' ? 'p-4' : ''}
      `}>
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500/50 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <FolderOpen size={20} className="opacity-50" />
            </div>
            <p className="text-xs font-medium text-gray-400">{emptyTitle}</p>
            <p className="text-[10px] mt-1 opacity-60 max-w-[150px]">{emptyDescription}</p>
          </div>
        ) : columnType === 'prompt' ? (
          // Prompt Grid Layout
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {items.map((item) => (
              <PromptCard
                key={item.id}
                prompt={item as Prompt}
                onSelect={() => onSelect(item)}
                onEdit={() => onEdit(item)}
                onDragStart={(e) => onDragStart(e, item)}
                isLocked={isLocked}
                isDragging={draggedItemId === item.id}
              />
            ))}
          </div>
        ) : (
          // Folder List Layout
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

// --- PROMPT CARD COMPONENT ---

interface PromptCardProps {
  prompt: Prompt;
  onSelect: () => void;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isLocked: boolean;
  isDragging: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onSelect,
  onEdit,
  onDragStart,
  isLocked,
  isDragging,
}) => {
  return (
    <div
      draggable={!isLocked}
      onDragStart={onDragStart}
      onClick={onSelect}
      className={`
        group bg-[#1e2330] hover:bg-[#252b3b] border border-white/5 
        hover:border-[#2979ff]/30 rounded-xl p-4 cursor-pointer 
        transition-all hover:shadow-lg flex flex-col gap-3 relative overflow-hidden
        ${isDragging ? 'opacity-40 scale-95' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979ff]/10 to-purple-500/10 flex items-center justify-center text-xl">
            {prompt.emoji || '📄'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-[#2979ff] transition-colors line-clamp-1">
              {prompt.name}
            </h4>
            <span className="text-[10px] text-gray-400">{prompt.category || 'Geral'}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 size={14} />
        </button>
      </div>

      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed bg-[#0f111a]/50 p-2 rounded border border-white/5 font-mono">
        {prompt.content}
      </p>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
        {prompt.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[9px] uppercase font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
        <span className="text-[9px] text-gray-400 ml-auto">{prompt.date}</span>
      </div>
    </div>
  );
};

// --- MAIN MILLER COLUMNS VIEW ---

export const MillerColumns: React.FC = () => {
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
  };

  const handleSubfolderSelect = (subfolder: FolderType) => {
    setSelectedSubfolder(subfolder);
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  const handleEdit = (item: TreeNode) => {
    openEditModal(item, false);
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
    <div className="flex h-full divide-x divide-white/5 overflow-x-auto">
      {/* Column 1: Root Folders */}
      <Column
        title="Pastas"
        icon={<Folder size={14} />}
        items={rootFolders}
        selectedId={selectedFolder?.id || null}
        onSelect={handleFolderSelect}
        onEdit={handleEdit}
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
        selectedId={null}
        onSelect={handlePromptSelect}
        onEdit={handleEdit}
        onNewItem={handleNewPrompt}
        newItemLabel="Novo Prompt"
        emptyTitle={selectedFolder ? 'Nenhum prompt aqui' : 'Nenhuma pasta selecionada'}
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
    </div>
  );
};

export default MillerColumns;
