'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - SEQUENTIAL VIEW
// ATHENA Architecture | Stack Navigation | Premium Dark Theme
// ============================================================================

import React from 'react';
import {
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
  Home,
  FolderOpen,
  Edit2,
  Share2,
  Trash2,
  Plus,
} from 'lucide-react';
import { Tooltip } from './TooltipWrapper';
import { SlideView, PulseSuccess } from './MotionWrappers';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- ITEM CARD COMPONENT ---

interface ItemCardProps {
  item: TreeNode;
  index: number;
  onNavigate: (folder: FolderType) => void;
  onSelectPrompt: (prompt: Prompt) => void;
  onEdit: (item: TreeNode) => void;
  onShare: (item: TreeNode) => void;
  onDragStart: (e: React.DragEvent, item: TreeNode) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, item: TreeNode) => void;
  isLocked: boolean;
  isDragging: boolean;
  isJustDropped: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  index,
  onNavigate,
  onSelectPrompt,
  onEdit,
  onShare,
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
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, item)}
      onClick={() => isFolder ? onNavigate(item as FolderType) : onSelectPrompt(item as Prompt)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          isFolder ? onNavigate(item as FolderType) : onSelectPrompt(item as Prompt);
        }
      }}
      className={`
        group relative flex flex-col justify-between min-h-[160px] w-fit min-w-[260px] max-w-[280px] shrink-0
        rounded-xl border-l-[6px] border-y border-r px-3.5 py-3 cursor-pointer transition-all duration-200 
        shadow-xl shadow-black/20 hover:scale-[1.01]
        ${isFolder
          ? 'bg-gradient-to-br from-[#2979ff]/8 via-[#2979ff]/3 to-transparent border-l-[#2979ff] border-y-[#2979ff]/20 border-r-[#2979ff]/20 hover:shadow-[0_0_30px_rgba(41,121,255,0.15)]'
          : 'bg-gradient-to-br from-[#10b981]/8 via-[#10b981]/3 to-transparent border-l-[#10b981] border-y-[#10b981]/20 border-r-[#10b981]/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
        }
        ${!isLocked ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-40 scale-95 border-dashed' : ''}
        ${isJustDropped ? 'animate-success-pulse ring-2 ring-green-500' : ''}
        animate-slide-up-fade
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg 
          transition-transform group-hover:scale-110
          ${isFolder 
            ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10' 
            : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10'}
        `}>
          {item.emoji || (isFolder ? '📁' : '📄')}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-base mb-1 truncate pr-2">
        {item.name}
      </h3>

      {/* Meta Info */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <span>{(item as Prompt).date || 'Hoje'}</span>
        {isFolder && (item as FolderType).children && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{(item as FolderType).children.length} itens</span>
          </>
        )}
        {!isFolder && (item as Prompt).category && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
              {(item as Prompt).category}
            </span>
          </>
        )}
      </div>

      {/* Tags (Prompts only) */}
      {!isFolder && (item as Prompt).tags && (item as Prompt).tags!.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(item as Prompt).tags!.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
            >
              {tag}
            </span>
          ))}
          {(item as Prompt).tags!.length > 2 && (
            <span className="text-[10px] text-gray-400">
              +{(item as Prompt).tags!.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/5 mt-auto">
        <Tooltip content={`Editar ${item.type}`} position="top">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2979ff] hover:bg-[#2264d1] text-white rounded-lg transition-all text-xs font-bold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 active:scale-95"
          >
            <Edit2 size={12} /> EDITAR
          </button>
        </Tooltip>

        <Tooltip content="Compartilhar" position="top">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(item);
            }}
            className="p-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all border border-white/10 hover:border-white/20 active:scale-95 group"
          >
            <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

// --- MAIN SEQUENTIAL VIEW ---

export const SequentialView: React.FC = () => {
  const data = usePromptManagerStore((s) => s.data);
  const sequentialPath = usePromptManagerStore((s) => s.sequentialPath);
  const slideDirection = usePromptManagerStore((s) => s.slideDirection);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const dragState = usePromptManagerStore((s) => s.dragState);
  const justDroppedId = usePromptManagerStore((s) => s.justDroppedId);
  const {
    navigateToFolder,
    navigateToIndex,
    goBack,
    goToRoot,
    setDragState,
    openEditModal,
    setPromptViewerOpen,
    setSelectedPrompt,
    showToast,
    moveItem,
  } = usePromptManagerStore((s) => s.actions);

  // Get current nodes based on path
  const getCurrentNodes = () => {
    let currentNodes = data;
    let title = 'Pastas Principais';

    for (const id of sequentialPath) {
      const found = currentNodes.find((node) => node.id === id);
      if (found && found.type === 'folder' && (found as FolderType).children) {
        currentNodes = (found as FolderType).children;
        title = found.name;
      } else {
        return { nodes: [], title: 'Erro' };
      }
    }

    return { nodes: currentNodes, title };
  };

  const { nodes, title } = getCurrentNodes();

  // Build breadcrumb path
  const getBreadcrumbPath = () => {
    const path: { id: string; name: string; emoji?: string }[] = [];
    let currentNodes = data;

    for (const id of sequentialPath) {
      const found = currentNodes.find((node) => node.id === id);
      if (found && found.type === 'folder') {
        path.push({ id: found.id, name: found.name, emoji: found.emoji });
        currentNodes = (found as FolderType).children || [];
      }
    }

    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  // --- Drag & Drop Handlers ---

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

  const handleDragOver = (e: React.DragEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');
  };

  const handleDrop = (e: React.DragEvent, targetItem: TreeNode) => {
    if (isLocked) return;
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-[#2979ff]', 'scale-[1.02]');

    const draggedId = dragState.draggedItemId;
    if (!draggedId || draggedId === targetItem.id) {
      setDragState({ draggedItemId: null, draggedItemType: null });
      return;
    }

    if (targetItem.type === 'folder') {
      moveItem(draggedId, targetItem.id);
    } else {
      showToast('Solte sobre uma pasta', 'info');
    }

    setDragState({ draggedItemId: null, draggedItemType: null });
  };

  // --- Action Handlers ---

  const handleNavigate = (folder: FolderType) => {
    navigateToFolder(folder);
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  const handleEdit = (item: TreeNode) => {
    openEditModal(item, false);
  };

  const handleShare = (item: TreeNode) => {
    showToast(`Compartilhando "${item.name}"...`, 'success');
  };

  const handleNewFolder = () => {
    if (isLocked) {
      showToast('Desbloqueie para criar', 'warning');
      return;
    }
    showToast('Criar nova pasta...', 'info');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Breadcrumbs */}
      <div className="flex items-center gap-4 mb-8">
        {sequentialPath.length > 0 && (
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {sequentialPath.length === 0 ? (
              <Home size={28} className="text-[#2979ff]" />
            ) : (
              <FolderOpen size={28} className="text-[#2979ff]" />
            )}
            {title}
          </h2>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <button
              onClick={goToRoot}
              className={`hover:text-white transition-colors flex items-center gap-1 ${
                sequentialPath.length === 0 ? 'text-white font-bold' : ''
              }`}
            >
              <Home size={14} /> Início
            </button>
            {breadcrumbPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight size={12} className="text-gray-500" />
                <button
                  onClick={() => navigateToIndex(index)}
                  className={`hover:text-white transition-colors flex items-center gap-1 ${
                    index === breadcrumbPath.length - 1 ? 'text-white font-bold' : ''
                  }`}
                >
                  {folder.emoji} {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {nodes.length} itens disponíveis
          </p>
        </div>
      </div>

      {/* Items Grid */}
      <SlideView direction={slideDirection} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nodes.map((node, index) => (
          <ItemCard
            key={node.id}
            item={node}
            index={index}
            onNavigate={handleNavigate}
            onSelectPrompt={handleSelectPrompt}
            onEdit={handleEdit}
            onShare={handleShare}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isLocked={isLocked}
            isDragging={dragState.draggedItemId === node.id}
            isJustDropped={justDroppedId === node.id}
          />
        ))}

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02] animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FolderOpen size={32} className="opacity-40" />
            </div>
            <p className="text-sm font-bold text-gray-300">Esta pasta está vazia</p>
            <p className="text-xs mt-1 text-gray-500">Comece criando uma nova pasta ou prompt.</p>
          </div>
        )}

        {/* New Folder Button */}
        <button
          onClick={handleNewFolder}
          className="flex flex-col items-center justify-center gap-3 bg-[#1e2330]/30 border border-dashed border-white/10 hover:border-[#2979ff]/50 hover:bg-[#2979ff]/5 rounded-xl p-5 cursor-pointer transition-all group animate-slide-up-fade min-h-[160px]"
          style={{ animationDelay: `${nodes.length * 50}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#2979ff] group-hover:scale-110 transition-all">
            <Plus size={24} />
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-[#2979ff]">
            Nova Pasta
          </span>
        </button>
      </SlideView>
    </div>
  );
};

export default SequentialView;
