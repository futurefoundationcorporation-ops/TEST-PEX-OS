'use client';

// ============================================================================
// PEX-OS PROMPT MANAGER - HIERARCHY VIEW
// ATHENA Architecture | Mindmap/Tree View | Premium Dark Theme
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  Network,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  ChevronRight,
  Folder,
  FileText,
  Settings,
  Edit2,
  Trash2,
  Plus,
  FolderOpen,
  Tag,
} from 'lucide-react';
import { Tooltip } from '../TooltipWrapper';
import { AnimatedTreeItem } from '../MotionWrappers';
import { ContextMenu, useContextMenu } from '../ContextMenu';
import { usePromptManagerStore } from '@/stores/promptManager';
import type { TreeNode, Folder as FolderType, Prompt } from '@/types/prompt-manager';

// --- TREE NODE COMPONENT ---

interface TreeNodeProps {
  node: TreeNode;
  level?: number;
  onSelect: (prompt: Prompt) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  isLocked: boolean;
  selectedPromptId?: string;
  searchQuery: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  onSelect,
  onEdit,
  onDelete,
  onContextMenu,
  isLocked,
  selectedPromptId,
  searchQuery,
  expandedIds,
  onToggleExpand,
}) => {
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && (node as FolderType).children?.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isNodeSelected = node.type === 'prompt' && selectedPromptId === node.id;

  // Filter check for search
  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.type === 'prompt' &&
        ((node as Prompt).content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node as Prompt).tags?.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )))
    : true;

  // Check if any child matches
  const hasMatchingChildren = useCallback((): boolean => {
    if (!isFolder || !searchQuery) return false;
    
    const checkChildren = (children: TreeNode[]): boolean => {
      for (const child of children) {
        if (child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        if (child.type === 'folder' && (child as FolderType).children) {
          if (checkChildren((child as FolderType).children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return checkChildren((node as FolderType).children || []);
  }, [isFolder, node, searchQuery]);

  // Skip rendering if doesn't match and no children match
  if (searchQuery && !matchesSearch && !hasMatchingChildren()) {
    return null;
  }

  const renderIcon = () => {
    if (node.emoji) {
      return <span className="text-base leading-none w-5 text-center shrink-0">{node.emoji}</span>;
    }
    if (isFolder) {
      if ((node as FolderType).isSystem) {
        return <Settings size={16} className="text-gray-300 shrink-0" />;
      }
      return isExpanded ? (
        <FolderOpen size={16} className="text-[#2979ff] shrink-0" />
      ) : (
        <Folder size={16} className="text-gray-400 shrink-0" />
      );
    }
    return <FileText size={14} className="text-gray-400 shrink-0" />;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleExpand(node.id);
    } else {
      onSelect(node as Prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
    if (e.key === 'ArrowRight' && isFolder && !isExpanded) {
      onToggleExpand(node.id);
    }
    if (e.key === 'ArrowLeft' && isFolder && isExpanded) {
      onToggleExpand(node.id);
    }
  };

  const childrenCount = isFolder ? (node as FolderType).children?.length || 0 : 0;

  return (
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => onContextMenu(e, node)}
        tabIndex={0}
        role="button"
        aria-label={`${isFolder ? 'Pasta' : 'Prompt'}: ${node.name}`}
        aria-expanded={isFolder ? isExpanded : undefined}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        className={`
          group flex items-center justify-between transition-all duration-150 
          cursor-pointer text-gray-300 border-l-[3px] my-0.5 rounded-r-md py-2
          ${isNodeSelected
            ? 'bg-gradient-to-r from-[#2979ff]/10 to-transparent border-l-[#2979ff] text-white'
            : 'border-l-transparent hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent hover:border-l-white/20'
          }
          ${matchesSearch && searchQuery ? 'bg-[#2979ff]/5' : ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Expand/Collapse Arrow */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronRight
                size={14}
                className={`text-gray-400 transition-transform duration-200 ease-out ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Icon */}
          {renderIcon()}

          {/* Name and Meta */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`
                truncate
                ${isFolder ? 'font-medium text-sm' : 'text-[13px] font-normal text-gray-300 group-hover:text-gray-200'}
              `}
            >
              {node.name}
            </span>

            {/* Children Count */}
            {isFolder && childrenCount > 0 && (
              <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                {childrenCount}
              </span>
            )}

            {/* System Badge */}
            {isFolder && (node as FolderType).isSystem && (
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                SYS
              </span>
            )}

            {/* Tags for Prompts */}
            {!isFolder && (node as Prompt).tags && (node as Prompt).tags!.length > 0 && (
              <div className="flex items-center gap-1">
                {(node as Prompt).tags!.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-[0.5px] text-gray-400 border border-white/10 px-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {(node as Prompt).tags!.length > 2 && (
                  <span className="text-[9px] text-gray-500">
                    +{(node as Prompt).tags!.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Editar"
          >
            <Edit2 size={12} />
          </button>
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Excluir"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatedTreeItem isExpanded={isExpanded}>
          {(node as FolderType).children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onContextMenu={onContextMenu}
              isLocked={isLocked}
              selectedPromptId={selectedPromptId}
              searchQuery={searchQuery}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </AnimatedTreeItem>
      )}
    </div>
  );
};

// --- MAIN HIERARCHY VIEW ---

export const HierarchyView: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['f1', 'f1-1']));

  const data = usePromptManagerStore((s) => s.data);
  const selectedPrompt = usePromptManagerStore((s) => s.selectedPrompt);
  const isLocked = usePromptManagerStore((s) => s.isLocked);
  const {
    setSelectedPrompt,
    setPromptViewerOpen,
    openEditModal,
    showToast,
  } = usePromptManagerStore((s) => s.actions);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptViewerOpen(true);
  };

  const handleEdit = (node: TreeNode) => {
    openEditModal(node, node.type === 'prompt');
  };

  const handleDelete = (node: TreeNode) => {
    if (isLocked) {
      showToast('Desbloqueie para excluir', 'warning');
      return;
    }
    showToast(`Excluir "${node.name}"?`, 'warning');
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          allIds.add(node.id);
          if ((node as FolderType).children) {
            traverse((node as FolderType).children);
          }
        }
      }
    };
    traverse(data);
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Count total items
  const countItems = (nodes: TreeNode[]): { folders: number; prompts: number } => {
    let folders = 0;
    let prompts = 0;
    for (const node of nodes) {
      if (node.type === 'folder') {
        folders++;
        if ((node as FolderType).children) {
          const childCounts = countItems((node as FolderType).children);
          folders += childCounts.folders;
          prompts += childCounts.prompts;
        }
      } else {
        prompts++;
      }
    }
    return { folders, prompts };
  };

  const { folders: totalFolders, prompts: totalPrompts } = countItems(data);

  return (
    <>
      <div
        className={`
          flex flex-col overflow-hidden transition-all duration-300
          ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0f111a]' : 'h-full'}
        `}
      >
        {/* Header */}
        <div className="p-6 pb-4 shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Network size={24} className="text-[#2979ff]" />
                Estrutura Hierárquica
              </h2>
              <div className="flex items-center gap-2">
                <Tooltip content="Expandir Todos" position="bottom">
                  <button
                    onClick={handleExpandAll}
                    className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </Tooltip>
                <Tooltip content="Recolher Todos" position="bottom">
                  <button
                    onClick={handleCollapseAll}
                    className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Minimize2 size={16} />
                  </button>
                </Tooltip>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Tooltip content={isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'} position="bottom">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 bg-[#1e2330] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar na hierarquia..."
                className="w-full h-10 bg-[#0f111a] border border-white/10 rounded-lg pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#2979ff] transition-all placeholder-gray-600"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Folder size={12} />
                <span>{totalFolders} pastas</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <FileText size={12} />
                <span>{totalPrompts} prompts</span>
              </div>
              {searchQuery && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-[#2979ff]">Filtrando por "{searchQuery}"</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1e2330] rounded-xl border border-white/10 p-6 shadow-2xl min-h-[400px]">
              {data.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Folder size={32} className="opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-gray-300">Nenhum conteúdo</p>
                  <p className="text-xs mt-1 text-gray-500">Comece criando uma pasta</p>
                </div>
              ) : (
                data.map((node) => (
                  <TreeNodeItem
                    key={node.id}
                    node={node}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onContextMenu={openContextMenu}
                    isLocked={isLocked}
                    selectedPromptId={selectedPrompt?.id}
                    searchQuery={searchQuery}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                  />
                ))
              )}
            </div>
          </div>
        </div>
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

export default HierarchyView;
